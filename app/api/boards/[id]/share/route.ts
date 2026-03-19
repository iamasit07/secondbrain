import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

// POST /api/boards/[id]/share — Toggle public + generate share token
export async function POST(
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

    // Get current state
    const board = await prisma.boards.findFirst({
      where: { id, user_id: user.id },
      select: { is_public: true, share_token: true }
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Toggle public and generate token if needed
    const isPublic = !board.is_public;
    const shareToken = isPublic
      ? board.share_token || randomBytes(8).toString("hex")
      : board.share_token;

    const data = await prisma.boards.update({
      where: { id },
      data: {
        is_public: isPublic,
        share_token: shareToken,
        updated_at: new Date().toISOString(),
      }
    });

    return NextResponse.json({ board: data });
  } catch (error) {
    console.error("POST /api/boards/[id]/share error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
