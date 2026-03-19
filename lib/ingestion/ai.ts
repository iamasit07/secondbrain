import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProcessingResult } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function generateSummaryAndTags(
  content: string,
  title: string
): Promise<AIProcessingResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a knowledge assistant. Given the following content, do two things:

1. Write a single paragraph summary that explains what this is, what it covers, and why it's useful. Be concise and informative.
2. Generate 4-8 tags as single lowercase words or short hyphenated phrases (e.g. "machine-learning", "productivity", "web-development"). Tags should capture the core topics and themes.
3. Determine the content type from this list: article, video, research, tool, tutorial, news, reference, repository, pdf, image, other.

Return your response as valid JSON only, no markdown formatting:
{
  "summary": "...",
  "tags": ["...", "..."],
  "content_type": "..."
}

Title: ${title}

Content:
${content.substring(0, 10000)}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response (handle potential markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const summary = parsed.summary || `${title} — saved content.`;
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags
          .slice(0, 6)
          .map((t: string) => t.toLowerCase().trim().replace(/\s+/g, "-"))
      : [];
    const content_type = parsed.content_type || "article";

    let embedding: number[] | undefined;
    try {
      const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-2-preview" });
      const embeddingResult = await embeddingModel.embedContent(
        `${title}\n\n${summary}\n\nTags: ${tags.join(", ")}`
      );
      embedding = embeddingResult.embedding.values;
    } catch (e) {
      console.error("Embedding generation failed:", e);
    }

    return {
      summary,
      tags,
      content_type,
      embedding,
    };
  } catch (error) {
    console.error("AI processing error:", error);
    return {
      summary: `${title}. ${content.substring(0, 150).trim()}...`,
      tags: [],
      content_type: "article",
    };
  }
}
