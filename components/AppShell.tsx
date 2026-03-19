"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Brain,
  Library,
  LayoutGrid,
  Tag,
  LogOut,
  Plus,
  Search,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { SaveModal } from "@/components/SaveModal";

interface TagCount {
  tag: string;
  count: number;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email?: string; id?: string; name?: string } | null>(
    null
  );
  const [tags, setTags] = useState<TagCount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser({
        email: user.email,
        id: user.id,
        name: user.user_metadata?.name || user.user_metadata?.full_name,
      });
    };
    getUser();
  }, [router, supabase.auth]);

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch("/api/tags");
      if (res.ok) {
        const data = await res.json();
        setTags(data.tags || []);
      }
    } catch {
      // Silent fail for tags
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/library?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTagClick = (tag: string) => {
    router.push(`/library?tags=${encodeURIComponent(tag)}`);
    setSidebarOpen(false);
  };

  const handleSaveSuccess = () => {
    setSaveModalOpen(false);
    fetchTags();
    router.refresh();
  };

  const navItems = [
    { href: "/library", label: "Library", icon: Library },
    { href: "/boards", label: "Boards", icon: LayoutGrid },
  ];

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-sidebar-background transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight">Second Brain</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto cursor-pointer lg:hidden"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Separator className="mx-4" />

        {/* Tags */}
        <div className="flex items-center gap-2 px-6 py-3">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tags
          </span>
        </div>

        <ScrollArea className="flex-1 px-4">
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pb-4">
              {tags.slice(0, 30).map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="cursor-pointer"
                >
                  <Badge
                    variant="secondary"
                    className="cursor-pointer text-xs transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    {tag}
                    <span className="ml-1 opacity-50">{count}</span>
                  </Badge>
                </button>
              ))}
            </div>
          ) : (
            <p className="px-2 text-xs text-muted-foreground">
              Tags will appear here as you save content.
            </p>
          )}
        </ScrollArea>

        <Separator />

        {/* User */}
        <div className="flex items-center gap-3 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {(user.name || user.email)?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 flex flex-col justify-center min-w-0">
            {user.name && (
              <span className="truncate text-sm font-medium text-foreground">
                {user.name}
              </span>
            )}
            <span className={`truncate text-muted-foreground ${user.name ? "text-xs" : "text-sm"}`}>
              {user.email}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/profile"
                  onClick={() => setSidebarOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Settings className="h-4 w-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Profile & Settings</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                onClick={handleSignOut}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>Sign out</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center gap-4 border-b border-border px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="cursor-pointer lg:hidden"
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="global-search"
                placeholder="Search by tags, title, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* Save button */}
          <Button
            onClick={() => setSaveModalOpen(true)}
            size="sm"
            className="cursor-pointer gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Card</span>
          </Button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Save Modal */}
      <SaveModal
        open={saveModalOpen}
        onOpenChange={setSaveModalOpen}
        onSuccess={handleSaveSuccess}
      />
    </div>
  );
}
