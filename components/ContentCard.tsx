"use client";

import { ExternalLink, MoreHorizontal, Trash2, FolderPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card as CardType } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface ContentCardProps {
  card: CardType;
  onTagClick?: (tag: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (card: CardType) => void;
  onAddToBoard?: (card: CardType) => void;
  readOnly?: boolean;
}

export function ContentCard({
  card,
  onTagClick,
  onDelete,
  onClick,
  onAddToBoard,
  readOnly = false,
}: ContentCardProps) {
  const contentTypeColors: Record<string, string> = {
    article: "bg-blue-500/10 text-blue-400",
    video: "bg-red-500/10 text-red-400",
    research: "bg-purple-500/10 text-purple-400",
    tool: "bg-orange-500/10 text-orange-400",
    tutorial: "bg-emerald-500/10 text-emerald-400",
    news: "bg-yellow-500/10 text-yellow-400",
    reference: "bg-cyan-500/10 text-cyan-400",
    repository: "bg-gray-500/10 text-gray-400",
    pdf: "bg-rose-500/10 text-rose-400",
    image: "bg-pink-500/10 text-pink-400",
    other: "bg-slate-500/10 text-slate-400",
  };

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
      onClick={() => onClick?.(card)}
    >
      {/* Thumbnail */}
      {card.thumbnail && (
        <div className="relative h-40 overflow-hidden bg-muted">
          <img
            src={card.thumbnail}
            alt={card.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-card/80 to-transparent" />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Content type + actions */}
        <div className="flex items-start justify-between gap-2">
          <Badge
            variant="secondary"
            className={`text-[10px] uppercase tracking-wider ${
              contentTypeColors[card.content_type] || contentTypeColors.other
            }`}
          >
            {card.content_type}
          </Badge>

          {!readOnly && (
            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-background/50 hover:bg-muted cursor-pointer opacity-0 transition-all group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToBoard?.(card);
                  }}
                  className="cursor-pointer"
                >
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Add to Board
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(card.id);
                  }}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-card-foreground">
          {card.title}
        </h3>

        {/* Summary */}
        {card.summary && (
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
            {card.summary}
          </p>
        )}

        {/* Tags */}
        {card.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.tags.slice(0, 4).map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className="cursor-pointer"
              >
                <Badge
                  variant="outline"
                  className="cursor-pointer text-[10px] transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                >
                  {tag}
                </Badge>
              </button>
            ))}
            {card.tags.length > 4 && (
              <Badge variant="outline" className="text-[10px] opacity-50">
                +{card.tags.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-2 text-[10px] text-muted-foreground">
          <span>
            {formatDistanceToNow(new Date(card.created_at), { addSuffix: true })}
          </span>
          {card.source_url && (
            <a
              href={card.source_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 transition-colors hover:text-primary cursor-pointer"
            >
              <ExternalLink className="h-3 w-3" />
              {new URL(card.source_url).hostname.replace("www.", "")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
