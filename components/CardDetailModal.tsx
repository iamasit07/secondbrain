"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  Trash2,
  Plus,
  X,
  Calendar,
  Tag,
} from "lucide-react";
import { Card } from "@/lib/types";
import { useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface CardDetailModalProps {
  card: Card | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (card: Card) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

export function CardDetailModal({
  card,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  readOnly = false,
}: CardDetailModalProps) {
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);

  if (!card) return null;

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    const tag = newTag.trim().toLowerCase().replace(/\s+/g, "-");
    if (card.user_tags?.includes(tag) || card.ai_tags?.includes(tag)) {
      toast.error("Tag already exists");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_tags: [...(card.user_tags || []), tag] }),
      });

      if (res.ok) {
        const data = await res.json();
        onUpdate?.(data.card);
        setNewTag("");
        toast.success("Tag added");
      }
    } catch {
      toast.error("Failed to add tag");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    const updatedUserTags = (card.user_tags || []).filter((t) => t !== tag);

    setSaving(true);
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_tags: updatedUserTags }),
      });

      if (res.ok) {
        const data = await res.json();
        onUpdate?.(data.card);
        toast.success("Tag removed");
      }
    } catch {
      toast.error("Failed to remove tag");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this card permanently?")) return;

    try {
      const res = await fetch(`/api/cards/${card.id}`, { method: "DELETE" });
      if (res.ok) {
        onDelete?.(card.id);
        onOpenChange(false);
        toast.success("Card deleted");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-8 leading-tight">
            {card.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm leading-relaxed text-foreground">
              {card.summary || "No summary available."}
            </p>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(card.created_at), {
                addSuffix: true,
              })}
            </div>
            <Badge variant="secondary" className="text-[10px] uppercase">
              {card.content_type}
            </Badge>
            {card.source_url && (
              <a
                href={card.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 transition-colors hover:text-primary cursor-pointer"
              >
                <ExternalLink className="h-3 w-3" />
                {new URL(card.source_url).hostname.replace("www.", "")}
              </a>
            )}
          </div>

          <Separator />

          {/* Tags Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Tags</span>
            </div>

            {/* AI Tags */}
            {card.ai_tags?.length > 0 && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  AI-generated
                </span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {card.ai_tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* User Tags */}
            {card.user_tags?.length > 0 && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Your tags
                </span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {card.user_tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs group/tag"
                    >
                      {tag}
                      {!readOnly && (
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 cursor-pointer opacity-50 hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Add tag */}
            {!readOnly && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  className="text-sm"
                  disabled={saving}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleAddTag}
                  disabled={saving || !newTag.trim()}
                  className="cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Delete */}
          {!readOnly && (
            <>
              <Separator />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Card
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
