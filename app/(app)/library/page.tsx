"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ContentCard } from "@/components/ContentCard";
import { CardDetailModal } from "@/components/CardDetailModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Library, X, Loader2 } from "lucide-react";
import { Card, Board } from "@/lib/types";
import { toast } from "sonner";

function LibraryContent() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [addToBoardCard, setAddToBoardCard] = useState<Card | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
  const searchQuery = searchParams.get("q") || "";

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTags.length > 0) params.set("tags", activeTags.join(","));
      if (searchQuery) params.set("q", searchQuery);

      const endpoint = searchQuery ? `/api/search?${params}` : `/api/cards?${params}`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setCards(searchQuery ? data.results : data.cards || []);
      }
    } catch {
      toast.error("Failed to load cards");
    } finally {
      setLoading(false);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleTagClick = (tag: string) => {
    if (activeTags.includes(tag)) {
      const remaining = activeTags.filter((t) => t !== tag);
      const params = new URLSearchParams();
      if (remaining.length) params.set("tags", remaining.join(","));
      if (searchQuery) params.set("q", searchQuery);
      router.push(`/library?${params}`);
    } else {
      const params = new URLSearchParams();
      params.set("tags", [...activeTags, tag].join(","));
      if (searchQuery) params.set("q", searchQuery);
      router.push(`/library?${params}`);
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm("Delete this card permanently?")) return;
    try {
      const res = await fetch(`/api/cards/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCards((prev) => prev.filter((c) => c.id !== id));
        toast.success("Card deleted");
      }
    } catch {
      toast.error("Failed to delete card");
    }
  };

  const handleCardUpdate = (updated: Card) => {
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCard(updated);
  };

  const handleAddToBoard = async (card: Card) => {
    setAddToBoardCard(card);
    try {
      const res = await fetch("/api/boards");
      if (res.ok) {
        const data = await res.json();
        setBoards(data.boards || []);
      }
    } catch {
      toast.error("Failed to load boards");
    }
  };

  const handleAssignToBoard = async (boardId: string) => {
    if (!addToBoardCard) return;
    try {
      const res = await fetch(`/api/boards/${boardId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_id: addToBoardCard.id }),
      });

      if (res.ok) {
        toast.success("Added to board!");
        setAddToBoardCard(null);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add");
      }
    } catch {
      toast.error("Failed to add to board");
    }
  };

  const clearFilters = () => {
    router.push("/library");
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Library className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Library</h1>
        </div>
      </div>

      {/* Active filters */}
      {(activeTags.length > 0 || searchQuery) && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Filtering by:</span>
          {activeTags.map((tag) => (
            <Badge
              key={tag}
              variant="default"
              className="cursor-pointer gap-1"
              onClick={() => handleTagClick(tag)}
            >
              {tag}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              &ldquo;{searchQuery}&rdquo;
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="cursor-pointer text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-border bg-card p-4">
              <div className="skeleton h-32 w-full rounded-lg" />
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-5/6" />
              <div className="flex gap-2">
                <div className="skeleton h-5 w-14 rounded-full" />
                <div className="skeleton h-5 w-18 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : cards.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card, i) => (
            <div key={card.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <ContentCard
                card={card}
                onTagClick={handleTagClick}
                onDelete={handleDeleteCard}
                onClick={setSelectedCard}
                onAddToBoard={handleAddToBoard}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5 mb-6">
            <Library className="h-10 w-10 text-primary/40" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            {activeTags.length > 0 || searchQuery
              ? "No cards match your filters"
              : "Your library is empty"}
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {activeTags.length > 0 || searchQuery
              ? "Try different tags or clear your filters."
              : "Save your first link using the \"New Card\" button above. AI will read it, summarize it, and tag it automatically."}
          </p>
        </div>
      )}

      {/* Card Detail Modal */}
      <CardDetailModal
        card={selectedCard}
        open={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
        onUpdate={handleCardUpdate}
        onDelete={(id) => {
          setCards((prev) => prev.filter((c) => c.id !== id));
          setSelectedCard(null);
        }}
      />

      {/* Add to Board Modal */}
      <Dialog
        open={!!addToBoardCard}
        onOpenChange={(open) => !open && setAddToBoardCard(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Board</DialogTitle>
            <DialogDescription>
              Choose a board for &ldquo;{addToBoardCard?.title}&rdquo;
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-64">
            {boards.length > 0 ? (
              <div className="space-y-2">
                {boards.map((board) => (
                  <button
                    key={board.id}
                    onClick={() => handleAssignToBoard(board.id)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{board.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {board.card_count || 0} cards
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No boards yet. Create one from the Boards page first.
              </p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    }>
      <LibraryContent />
    </Suspense>
  );
}
