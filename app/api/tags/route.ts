import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// GET /api/tags — Get user's tag library with counts
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cards = await prisma.cards.findMany({
      where: { user_id: user.id },
      select: { tags: true },
    });

    // Count tag occurrences
    const tagCounts: Record<string, number> = {};
    cards.forEach((card: any) => {
      card.tags?.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Sort by count descending
    const sorted = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([tag, count]) => ({ tag, count }));

    return NextResponse.json({ tags: sorted });
  } catch (error) {
    console.error("GET /api/tags error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
