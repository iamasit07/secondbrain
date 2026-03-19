import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// POST /api/boards/[id]/cards — Add a card to board
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: boardId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify board ownership
    const board = await prisma.boards.findFirst({
      where: { id: boardId, user_id: user.id },
      select: { id: true, cover_image: true }
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const body = await request.json();
    const { card_id } = body;

    if (!card_id) {
      return NextResponse.json(
        { error: "card_id is required" },
        { status: 400 }
      );
    }

    try {
      const data = await prisma.board_cards.create({
        data: { board_id: boardId, card_id }
      });

      // Update board's cover image if it doesn't have one
      if (!board.cover_image) {
        const cardData = await prisma.cards.findFirst({
          where: { id: card_id },
          select: { thumbnail: true }
        });

        if (cardData?.thumbnail) {
          await prisma.boards.update({
            where: { id: boardId },
            data: { cover_image: cardData.thumbnail, updated_at: new Date().toISOString() }
          });
        }
      }

      return NextResponse.json({ board_card: data }, { status: 201 });
    } catch (error: any) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Card already in this board" },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("POST /api/boards/[id]/cards error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/boards/[id]/cards — Remove a card from board
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: boardId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("card_id");

    if (!cardId) {
      return NextResponse.json(
        { error: "card_id is required" },
        { status: 400 }
      );
    }

    // Explicitly check ownership since Prisma bypasses RLS
    const board = await prisma.boards.findFirst({
      where: { id: boardId, user_id: user.id }
    });

    if (!board) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { count } = await prisma.board_cards.deleteMany({
      where: { board_id: boardId, card_id: cardId }
    });

    if (count === 0) {
      return NextResponse.json({ error: "Card not found in board" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/boards/[id]/cards error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
