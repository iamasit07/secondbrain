"use client";

import { MoreHorizontal, Lock, Globe, Trash2, Share2, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Board } from "@/lib/types";

interface BoardCardProps {
  board: Board;
  onClick?: (board: Board) => void;
  onDelete?: (id: string) => void;
  onShare?: (board: Board) => void;
}

export function BoardCard({ board, onClick, onDelete, onShare }: BoardCardProps) {
  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
      onClick={() => onClick?.(board)}
    >
      {/* Cover Image */}
      <div className="relative h-36 overflow-hidden bg-linear-to-br from-primary/5 to-primary/20">
        {board.cover_image ? (
          <img
            src={board.cover_image}
            alt={board.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-4xl font-bold text-primary/20">
              {board.title.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-card/80 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Title + actions */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-1 text-card-foreground">
            {board.title}
          </h3>

          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onShare?.(board);
                }}
                className="cursor-pointer"
              >
                <Share2 className="mr-2 h-4 w-4" />
                {board.is_public ? "Manage Sharing" : "Share Board"}
              </DropdownMenuItem>
              {board.is_public && board.share_token && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`/b/${board.share_token}`, "_blank");
                  }}
                  className="cursor-pointer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Public Link
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(board.id);
                }}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {board.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {board.description}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-2 text-[10px] text-muted-foreground">
          <span>
            {board.card_count || 0} card{board.card_count !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            {board.is_public ? (
              <>
                <Globe className="h-3 w-3 text-primary" />
                <span className="text-primary">Public</span>
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                <span>Private</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
