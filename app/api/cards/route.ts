import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ingestUrl } from "@/lib/ingestion/pipeline";
import { prisma } from "@/lib/prisma";

// Simple in-memory rate limiter for POST /api/cards
// Note: In serverless, this applies per-container instance.
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

// GET /api/cards — List user's cards with optional tag/search filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tags = searchParams.get("tags");
    const q = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = { user_id: user.id };

    // Tag filtering
    if (tags) {
      const tagArray = tags.split(",").map((t) => t.trim().toLowerCase());
      where.tags = { hasSome: tagArray };
    }

    // Text search on title and summary
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
      ];
    }

    const data = await prisma.cards.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: offset,
      take: limit,
    });

    return NextResponse.json({ cards: data });
  } catch (error) {
    console.error("GET /api/cards error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/cards — Ingest a URL and create a card
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Rate Limiting check
    const now = Date.now();
    const rateLimitData = rateLimitMap.get(user.id);
    if (rateLimitData && now < rateLimitData.resetTime) {
      if (rateLimitData.count >= MAX_REQUESTS_PER_WINDOW) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
      rateLimitData.count++;
    } else {
      rateLimitMap.set(user.id, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    }

    // Validate URL format and scheme safely
    try {
      const parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid scheme");
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Check for duplicate URL
    const existing = await prisma.cards.findFirst({
      where: {
        user_id: user.id,
        source_url: url,
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "duplicate",
          message: "You've already saved this URL",
          card: existing,
        },
        { status: 409 }
      );
    }

    // Run the ingestion pipeline
    const card = await ingestUrl(url, user.id);

    return NextResponse.json({ card }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cards error:", error);
    return NextResponse.json(
      { error: "Failed to process URL" },
      { status: 500 }
    );
  }
}
