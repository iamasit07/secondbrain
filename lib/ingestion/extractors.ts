import { ExtractionResult } from "@/lib/types";
import { detectUrlType, getContentTypeLabel } from "./detector";

function isSafeUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    // 1. Only allow http and https
    if (!["http:", "https:"].includes(url.protocol)) return false;

    // 2. Prevent SSRF to localhost or private IP blocks (basic coverage)
    const hostname = url.hostname.toLowerCase();
    if (["localhost", "127.0.0.1", "[::1]"].includes(hostname)) return false;
    if (hostname.endsWith(".local")) return false; // Common local domain
    if (/^10\.\d+\.\d+\.\d+$/.test(hostname)) return false;
    if (/^192\.168\.\d+\.\d+$/.test(hostname)) return false;
    if (/^169\.254\.\d+\.\d+$/.test(hostname)) return false; // AWS metadata
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+$/.test(hostname)) return false;
    if (/^127\.\d+\.\d+\.\d+$/.test(hostname)) return false;

    return true;
  } catch {
    return false; // Malformed URL
  }
}

async function extractWithJina(url: string): Promise<ExtractionResult | null> {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const response = await fetch(jinaUrl, {
      headers: {
        Accept: "application/json",
        "X-Return-Format": "markdown",
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) return null;

    const text = await response.text();
    let title = "";
    let body = text;

    try {
      const json = JSON.parse(text);
      title = json.data?.title || json.title || "";
      body = json.data?.content || json.content || text;
    } catch {
      // Plain text response — extract title from first line
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines[0]?.startsWith("# ")) {
        title = lines[0].replace(/^#\s+/, "").trim();
        body = lines.slice(1).join("\n").trim();
      } else {
        title = lines[0]?.substring(0, 100) || "Untitled";
      }
    }

    if (!body || body.length < 50) return null;

    const urlType = detectUrlType(url);
    return {
      title,
      body: body.substring(0, 15000), // Cap at 15k chars for AI processing
      source_url: url,
      content_type: getContentTypeLabel(urlType),
      thumbnail: null,
      metadata: { extractor: "jina" },
    };
  } catch {
    return null;
  }
}

async function extractOpenGraph(url: string): Promise<ExtractionResult | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SecondBrain/1.0; +https://secondbrain.app)",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Extract only the <head> section for efficiency
    const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const head = headMatch ? headMatch[1] : html.substring(0, 5000);

    const getMeta = (property: string): string => {
      // Try og: first, then twitter:, then regular name
      const patterns = [
        new RegExp(
          `<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']*)["']`,
          "i"
        ),
        new RegExp(
          `<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:${property}["']`,
          "i"
        ),
        new RegExp(
          `<meta[^>]*name=["']twitter:${property}["'][^>]*content=["']([^"']*)["']`,
          "i"
        ),
        new RegExp(
          `<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`,
          "i"
        ),
      ];

      for (const pattern of patterns) {
        const match = head.match(pattern);
        if (match?.[1]) return match[1].trim();
      }
      return "";
    };

    // Extract <title> tag as fallback
    const titleTagMatch = head.match(/<title[^>]*>([^<]*)<\/title>/i);
    const titleTag = titleTagMatch ? titleTagMatch[1].trim() : "";

    const title = getMeta("title") || titleTag || "Untitled";
    const description = getMeta("description");
    const image = getMeta("image");

    if (!title && !description) return null;

    const urlType = detectUrlType(url);
    return {
      title,
      body: description || `Content from ${new URL(url).hostname}`,
      source_url: url,
      content_type: getContentTypeLabel(urlType),
      thumbnail: image || null,
      metadata: { extractor: "opengraph" },
    };
  } catch {
    return null;
  }
}

/**
 * Main extraction function.
 * Tries Jina Reader first, falls back to Open Graph.
 */
export async function extractContent(url: string): Promise<ExtractionResult> {
  // Validate SSRF / Safety
  if (!isSafeUrl(url)) {
    throw new Error("Invalid or unsafe URL provided");
  }

  // Tier 1: Jina Reader
  const jinaResult = await extractWithJina(url);
  if (jinaResult) return jinaResult;

  // Tier 3: Open Graph fallback
  const ogResult = await extractOpenGraph(url);
  if (ogResult) return ogResult;

  // Ultimate fallback
  const urlType = detectUrlType(url);
  return {
    title: new URL(url).hostname,
    body: `Saved from ${url}`,
    source_url: url,
    content_type: getContentTypeLabel(urlType),
    thumbnail: null,
    metadata: { extractor: "fallback" },
  };
}
