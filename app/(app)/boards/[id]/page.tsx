"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ContentCard } from "@/components/ContentCard";
import { CardDetailModal } from "@/components/CardDetailModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Globe,
  Lock,
  Share2,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { Card, Board } from "@/lib/types";
import { toast } from "sonner";

export default function BoardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [board, setBoard] = useState<Board | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBoard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/boards/${id}`);
        if (res.ok) {
          const data = await res.json();
          setBoard(data.board);
          setCards(data.cards || []);
        } else {
          toast.error("Board not found");
          router.push("/boards");
        }
      } catch {
        toast.error("Failed to load board");
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [id, router]);

  const handleRemoveCard = async (cardId: string) => {
    if (!confirm("Remove this card from the board?")) return;
    try {
      const res = await fetch(
        `/api/boards/${id}/cards?card_id=${cardId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setCards((prev) => prev.filter((c) => c.id !== cardId));
        toast.success("Removed from board");
      }
    } catch {
      toast.error("Failed to remove card");
    }
  };

  const handleShare = async () => {
    try {
      const res = await fetch(`/api/boards/${id}/share`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setBoard(data.board);

        if (data.board.is_public) {
          setShareDialogOpen(true);
        } else {
          toast.success("Board is now private");
        }
      }
    } catch {
      toast.error("Failed to update sharing");
    }
  };

  const handleCopyLink = async () => {
    if (!board?.share_token) return;
    const url = `${window.location.origin}/b/${board.share_token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!board) return null;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/boards")}
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Boards
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{board.title}</h1>
            {board.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {board.description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{cards.length} cards</span>
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  board.is_public ? "text-primary border-primary/30" : ""
                }`}
              >
                {board.is_public ? (
                  <><Globe className="mr-1 h-3 w-3" /> Public</>
                ) : (
                  <><Lock className="mr-1 h-3 w-3" /> Private</>
                )}
              </Badge>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={board.is_public ? () => setShareDialogOpen(true) : handleShare}
            className="cursor-pointer gap-2"
          >
            <Share2 className="h-4 w-4" />
            {board.is_public ? "Share Link" : "Make Public"}
          </Button>
        </div>
      </div>

      {/* Cards */}
      {cards.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card, i) => (
            <div key={card.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <ContentCard
                card={card}
                onClick={setSelectedCard}
                onDelete={handleRemoveCard}
                onTagClick={(tag) => router.push(`/library?tags=${tag}`)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            No cards in this board
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Add cards from your Library using the &ldquo;Add to Board&rdquo; option on any card.
          </p>
          <Button
            onClick={() => router.push("/library")}
            variant="outline"
            className="mt-6 cursor-pointer"
          >
            Go to Library
          </Button>
        </div>
      )}

      {/* Card Detail */}
      <CardDetailModal
        card={selectedCard}
        open={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
        onUpdate={(updated) => {
          setCards((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
          );
          setSelectedCard(updated);
        }}
        onDelete={(deletedId) => {
          setCards((prev) => prev.filter((c) => c.id !== deletedId));
          setSelectedCard(null);
        }}
      />

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Board</DialogTitle>
            <DialogDescription>
              Anyone with this link can view the board and its cards.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {board.is_public && board.share_token && (
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm overflow-hidden text-ellipsis">
                  {`${typeof window !== "undefined" ? window.location.origin : ""}/b/${board.share_token}`}
                </code>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCopyLink}
                  className="cursor-pointer shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleShare}
              className="w-full cursor-pointer"
            >
              {board.is_public ? "Make Private" : "Make Public"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
