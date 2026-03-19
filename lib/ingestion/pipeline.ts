import { extractContent } from "./extractors";
import { generateSummaryAndTags } from "./ai";
import { Card } from "@/lib/types";
import { prisma } from "@/lib/prisma";

export async function ingestUrl(
  url: string,
  userId: string
): Promise<Card> {
  // Step 1: Extract content
  const extraction = await extractContent(url);

  // Step 2: AI processing
  const aiResult = await generateSummaryAndTags(
    extraction.body,
    extraction.title
  );

  // Step 3: Save to database
  const cardData = {
    user_id: userId,
    title: extraction.title,
    summary: aiResult.summary,
    source_url: extraction.source_url,
    content_type: aiResult.content_type || extraction.content_type,
    thumbnail: extraction.thumbnail,
    tags: aiResult.tags,
    ai_tags: aiResult.tags,
    user_tags: [],
    raw_content: extraction.body.substring(0, 50000), // Store up to 50k chars
  };

  try {
    const data = await prisma.cards.create({
      data: cardData
    });

    // Step 4: Add high-dimensional vector embeddings safely
    if (aiResult.embedding && aiResult.embedding.length > 0) {
      await prisma.$executeRaw`
        UPDATE cards
        SET embedding = ${JSON.stringify(aiResult.embedding)}::vector
        WHERE id = ${data.id}::uuid
      `;
    }

    return data as unknown as Card;
  } catch (error: any) {
    console.error("Database insert error:", error);
    throw new Error(`Failed to save card: ${error.message}`);
  }
}
