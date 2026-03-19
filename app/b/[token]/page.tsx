import { Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card as CardType, Board } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { prisma } from "@/lib/prisma";

async function getPublicBoard(token: string) {
  const board = await prisma.boards.findFirst({
    where: {
      share_token: token,
      is_public: true,
    },
    select: {
      id: true,
      title: true,
      description: true,
      cover_image: true,
      is_public: true,
      created_at: true,
      board_cards: {
        select: {
          card: {
            select: {
              id: true,
              title: true,
              summary: true,
              source_url: true,
              content_type: true,
              thumbnail: true,
              tags: true,
              created_at: true,
            },
          },
        },
        orderBy: { added_at: "desc" },
      },
    },
  });

  if (!board) return null;

  const { board_cards, ...boardData } = board;
  const cards = board_cards.map((bc: any) => bc.card).filter(Boolean);

  return { board: boardData as unknown as Board, cards: cards as CardType[] };
}

export default async function PublicBoardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getPublicBoard(token);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Board not found
          </h1>
          <p className="mt-2 text-muted-foreground">
            This board doesn&apos;t exist or is no longer public.
          </p>
        </div>
      </div>
    );
  }

  const { board, cards }: { board: Board; cards: CardType[] } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Second Brain
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground">
            {board.title}
          </h1>
          {board.description && (
            <p className="mt-2 text-muted-foreground">{board.description}</p>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {cards.length} saved items
          </p>
        </div>
      </header>

      {/* Cards Grid */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {cards.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card: CardType) => (
              <div
                key={card.id}
                className="flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-lg"
              >
                {card.thumbnail && (
                  <div className="relative h-40 overflow-hidden bg-muted">
                    <img
                      src={card.thumbnail}
                      alt={card.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <Badge
                    variant="secondary"
                    className="w-fit text-[10px] uppercase tracking-wider"
                  >
                    {card.content_type}
                  </Badge>

                  <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                    {card.title}
                  </h3>

                  {card.summary && (
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {card.summary}
                    </p>
                  )}

                  {card.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {card.tags.slice(0, 4).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-2 text-[10px] text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(card.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                    {card.source_url && (
                      <a
                        href={card.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-primary cursor-pointer"
                      >
                        {new URL(card.source_url).hostname.replace("www.", "")}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground">
              This board doesn&apos;t have any cards yet.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Brain className="h-4 w-4 text-primary" />
            <span>Powered by Second Brain</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
