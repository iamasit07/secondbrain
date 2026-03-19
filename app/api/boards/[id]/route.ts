import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// GET /api/boards/[id] — Get board with its cards
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const board = await prisma.boards.findFirst({
      where: { id, user_id: user.id },
      include: {
        board_cards: {
          include: {
            card: true,
          },
          orderBy: { added_at: "desc" },
        },
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const { board_cards, ...boardData } = board;
    const cards = board_cards.map((bc: any) => bc.card).filter(Boolean);

    return NextResponse.json({ board: boardData, cards });
  } catch (error) {
    console.error("GET /api/boards/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/boards/[id] — Update board
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.boards.findFirst({
      where: { id, user_id: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const body = await request.json();
    const updates: any = { updated_at: new Date().toISOString() };

    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.description !== undefined)
      updates.description = body.description?.trim() || null;
    if (body.cover_image !== undefined) updates.cover_image = body.cover_image;

    const board = await prisma.boards.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ board });
  } catch (error) {
    console.error("PATCH /api/boards/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/boards/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { count } = await prisma.boards.deleteMany({
      where: { id, user_id: user.id },
    });

    if (count === 0) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/boards/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
