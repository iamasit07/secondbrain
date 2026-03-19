import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// GET /api/boards — List user's boards with card count
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const boards = await prisma.boards.findMany({
      where: { user_id: user.id },
      include: {
        _count: {
          select: { board_cards: true },
        },
      },
      orderBy: { updated_at: "desc" },
    });

    // Transform to include card_count
    const boardsWithCount = boards.map((b: any) => {
      const { _count, ...rest } = b;
      return {
        ...rest,
        card_count: _count?.board_cards || 0,
      };
    });

    return NextResponse.json({ boards: boardsWithCount });
  } catch (error) {
    console.error("GET /api/boards error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/boards — Create a new board
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
    const { title, description } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const board = await prisma.boards.create({
      data: {
        user_id: user.id,
        title: title.trim(),
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({ board }, { status: 201 });
  } catch (error) {
    console.error("POST /api/boards error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
