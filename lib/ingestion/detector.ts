export type UrlType = "youtube" | "github" | "wikipedia" | "pdf" | "generic";

export function detectUrlType(url: string): UrlType {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();

    // YouTube
    if (
      hostname.includes("youtube.com") ||
      hostname.includes("youtu.be") ||
      hostname.includes("m.youtube.com")
    ) {
      return "youtube";
    }

    // GitHub
    if (hostname.includes("github.com") || hostname.includes("github.io")) {
      return "github";
    }

    // Wikipedia
    if (hostname.includes("wikipedia.org") || hostname.includes("wikimedia.org")) {
      return "wikipedia";
    }

    // PDF
    if (pathname.endsWith(".pdf")) {
      return "pdf";
    }

    return "generic";
  } catch {
    return "generic";
  }
}

export function getContentTypeLabel(urlType: UrlType): string {
  const labels: Record<UrlType, string> = {
    youtube: "Video",
    github: "Repository",
    wikipedia: "Reference",
    pdf: "PDF",
    generic: "Article",
  };
  return labels[urlType];
}
