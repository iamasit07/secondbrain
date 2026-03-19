import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

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
    const query = searchParams.get("q");
    const activeTags = searchParams.get("tags")?.split(",").filter(Boolean) || [];

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    let queryVector: number[] = [];
    try {
      const embeddingModel = genAI.getGenerativeModel({
        model: "gemini-embedding-2-preview",
      });
      const embeddingResult = await embeddingModel.embedContent(query);
      queryVector = embeddingResult.embedding.values;
    } catch (e) {
      console.error("Embedding generate error:", e);
      return NextResponse.json(
        { error: "Failed to generate search vector" },
        { status: 500 }
      );
    }

    const tagFilter = activeTags.length > 0
      ? Prisma.sql`AND tags @> string_to_array(${activeTags.join(",")}, ',')::text[]`
      : Prisma.empty;

    // Hybrid search: Vector similarity (Cosine distance) combined with keyword matching
    const results = await prisma.$queryRaw`
      SELECT id, title, summary, source_url, content_type, thumbnail, tags, created_at,
             COALESCE(1 - (embedding <=> ${JSON.stringify(queryVector)}::vector), 0) as similarity
      FROM cards
      WHERE user_id = ${user.id}::uuid
        ${tagFilter}
        AND (
          (embedding IS NOT NULL AND (1 - (embedding <=> ${JSON.stringify(queryVector)}::vector)) > 0.45)
          OR title ILIKE ${"%" + query + "%"}
          OR summary ILIKE ${"%" + query + "%"}
          OR array_to_string(tags, ' ') ILIKE ${"%" + query + "%"}
        )
      ORDER BY 
        CASE WHEN title ILIKE ${"%" + query + "%"} THEN 1 ELSE 0 END DESC,
        embedding <=> ${JSON.stringify(queryVector)}::vector ASC NULLS LAST
      LIMIT 20
    `;

    return NextResponse.json({ results });
  } catch (error) {
    console.error("GET /api/search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
