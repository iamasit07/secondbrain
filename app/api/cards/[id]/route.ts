import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/cards/[id] — Update card tags/title
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

    const existingCard = await prisma.cards.findFirst({
      where: { id, user_id: user.id },
      select: { ai_tags: true }
    });

    if (!existingCard) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const body = await request.json();
    const updates: any = { updated_at: new Date().toISOString() };

    if (body.title !== undefined) updates.title = body.title;

    if (body.user_tags !== undefined) {
      updates.user_tags = body.user_tags;
      // Merge AI tags + user tags into combined tags field
      const allTags = [...new Set([...existingCard.ai_tags, ...body.user_tags])];
      updates.tags = allTags;
    }

    const data = await prisma.cards.update({
      where: { id },
      data: updates
    });

    return NextResponse.json({ card: data });
  } catch (error) {
    console.error("PATCH /api/cards/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/cards/[id]
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

    const { count } = await prisma.cards.deleteMany({
      where: { id, user_id: user.id }
    });

    if (count === 0) {
      return NextResponse.json({ error: "Card not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/cards/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
