"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Link as LinkIcon, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/lib/types";

interface SaveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SaveModal({ open, onOpenChange, onSuccess }: SaveModalProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedCard, setSavedCard] = useState<Card | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setSavedCard(null);

    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "duplicate") {
          toast.error("You've already saved this URL");
        } else {
          toast.error(data.error || "Failed to save");
        }
        setLoading(false);
        return;
      }

      setSavedCard(data.card);
      toast.success("Saved to your library!");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUrl("");
    setSavedCard(null);
    onOpenChange(false);
    if (savedCard) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Save to Second Brain</DialogTitle>
          <DialogDescription>
            Paste a URL and AI will extract the content, generate a summary, and auto-tag it.
          </DialogDescription>
        </DialogHeader>

        {!savedCard ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="save-url-input"
                placeholder="https://example.com/interesting-article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10"
                autoFocus
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loading || !url.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting & Processing...
                </>
              ) : (
                "Save"
              )}
            </Button>

            {loading && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  AI is reading and analyzing the content...
                </div>
                <div className="space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-5/6" />
                  <div className="flex gap-2 pt-1">
                    <div className="skeleton h-5 w-16 rounded-full" />
                    <div className="skeleton h-5 w-20 rounded-full" />
                    <div className="skeleton h-5 w-14 rounded-full" />
                  </div>
                </div>
              </div>
            )}
          </form>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* Success state — show the created card */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                    {savedCard.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-3">
                    {savedCard.summary}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {savedCard.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {savedCard.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Source */}
              {savedCard.source_url && (
                <a
                  href={savedCard.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <ExternalLink className="h-3 w-3" />
                  {new URL(savedCard.source_url).hostname}
                </a>
              )}
            </div>

            <Button
              onClick={handleClose}
              className="w-full cursor-pointer"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
