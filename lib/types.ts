export interface Card {
  id: string;
  user_id: string;
  title: string;
  summary: string | null;
  source_url: string | null;
  content_type: string;
  thumbnail: string | null;
  tags: string[];
  ai_tags: string[];
  user_tags: string[];
  raw_content: string | null;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  is_public: boolean;
  share_token: string | null;
  created_at: string;
  updated_at: string;
  card_count?: number;
}

export interface BoardCard {
  id: string;
  board_id: string;
  card_id: string;
  added_at: string;
  card?: Card;
}

export interface ExtractionResult {
  title: string;
  body: string;
  source_url: string;
  content_type: string;
  thumbnail: string | null;
  metadata: Record<string, unknown>;
}

export interface AIProcessingResult {
  summary: string;
  tags: string[];
  content_type: string;
  embedding?: number[];
}
