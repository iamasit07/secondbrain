import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/public/boards/[token] — Public board view (no auth)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const board = await prisma.boards.findFirst({
      where: {
        share_token: token,
        is_public: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        cover_image: true,
        is_public: true,
        created_at: true,
        board_cards: {
          select: {
            card: {
              select: {
                id: true,
                title: true,
                summary: true,
                source_url: true,
                content_type: true,
                thumbnail: true,
                tags: true,
                created_at: true,
              },
            },
          },
          orderBy: { added_at: "desc" },
        },
      },
    });

    if (!board) {
      return NextResponse.json(
        { error: "Board not found or not public" },
        { status: 404 }
      );
    }

    const { board_cards, ...boardData } = board;
    const cards = board_cards.map((bc: any) => bc.card).filter(Boolean);

    return NextResponse.json({ board: boardData, cards });
  } catch (error) {
    console.error("GET /api/public/boards/[token] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
