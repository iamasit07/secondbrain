"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BoardCard } from "@/components/BoardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { LayoutGrid, Plus, Loader2 } from "lucide-react";
import { Board } from "@/lib/types";
import { toast } from "sonner";

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const fetchBoards = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/boards");
      if (res.ok) {
        const data = await res.json();
        setBoards(data.boards || []);
      }
    } catch {
      toast.error("Failed to load boards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || null,
        }),
      });

      if (res.ok) {
        toast.success("Board created!");
        setCreateOpen(false);
        setNewTitle("");
        setNewDescription("");
        fetchBoards();
      }
    } catch {
      toast.error("Failed to create board");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this board? Cards in it won't be deleted.")) return;
    try {
      const res = await fetch(`/api/boards/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBoards((prev) => prev.filter((b) => b.id !== id));
        toast.success("Board deleted");
      }
    } catch {
      toast.error("Failed to delete board");
    }
  };

  const handleShare = async (board: Board) => {
    try {
      const res = await fetch(`/api/boards/${board.id}/share`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        const updatedBoard = data.board;
        setBoards((prev) =>
          prev.map((b) => (b.id === updatedBoard.id ? { ...b, ...updatedBoard } : b))
        );

        if (updatedBoard.is_public && updatedBoard.share_token) {
          const url = `${window.location.origin}/b/${updatedBoard.share_token}`;
          await navigator.clipboard.writeText(url);
          toast.success("Public link copied to clipboard!");
        } else {
          toast.success("Board is now private");
        }
      }
    } catch {
      toast.error("Failed to update sharing");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Boards</h1>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          size="sm"
          className="cursor-pointer gap-2"
        >
          <Plus className="h-4 w-4" />
          New Board
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-border bg-card p-4">
              <div className="skeleton h-36 w-full rounded-lg" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : boards.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boards.map((board, i) => (
            <div key={board.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <BoardCard
                board={board}
                onClick={(b) => router.push(`/boards/${b.id}`)}
                onDelete={handleDelete}
                onShare={handleShare}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5 mb-6">
            <LayoutGrid className="h-10 w-10 text-primary/40" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            No boards yet
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Create your first board to organize saved content into collections.
          </p>
          <Button
            onClick={() => setCreateOpen(true)}
            className="mt-6 cursor-pointer gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Board
          </Button>
        </div>
      )}

      {/* Create Board Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Board</DialogTitle>
            <DialogDescription>
              Organize your saved content into a named collection.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="board-title">Title</Label>
              <Input
                id="board-title"
                placeholder="e.g. AI Research, Design Inspiration"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="board-description">Description (optional)</Label>
              <Textarea
                id="board-description"
                placeholder="What's this board about?"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
              />
            </div>
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={creating || !newTitle.trim()}
            >
              {creating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create Board
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
