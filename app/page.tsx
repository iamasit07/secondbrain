import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { 
  Brain, 
  Sparkles, 
  Search, 
  Tag, 
  ArrowRight, 
  Zap,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background selection:bg-primary/30 selection:text-primary">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-purple-500/10 via-background to-transparent" />
      
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 -z-20 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Navbar */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold tracking-tight text-foreground">Second Brain</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/library">
                <Button size="sm" className="hidden sm:flex rounded-full px-8 gap-2 cursor-pointer transition-transform hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
                  Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground md:block transition-colors">
                  Log in
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="rounded-full px-5 gap-2 cursor-pointer transition-transform hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-32 lg:px-8 lg:pt-40">
        
        {/* HERO SECTION */}
        <section className="relative mx-auto max-w-4xl text-center flex flex-col items-center justify-center animate-slide-up">
          <Badge variant="outline" className="mb-8 rounded-full gap-2 border-primary/20 bg-primary/5 py-2 px-5 text-primary backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Knowledge Management</span>
          </Badge>
          
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Your mind, <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-purple-400 to-primary bg-size-[200%_auto] animate-shimmer">
              Amplified.
            </span>
          </h1>
          
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Stop losing track of great articles, videos, and tools. Save anything from the web and find it instantly using semantic AI search and automatic contextual tagging.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={user ? "/library" : "/signup"}>
              <Button size="lg" className="h-14 rounded-full px-8 text-base gap-2 cursor-pointer transition-transform hover:scale-105 shadow-xl shadow-primary/25">
                {user ? "Open Your Library" : "Start Building For Free"} 
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            {!user && (
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-14 rounded-full px-8 text-base cursor-pointer hover:bg-muted">
                  I already have an account
                </Button>
              </Link>
            )}
          </div>
        </section>

        {/* BENTO GRID UI SECTION */}
        <section className="mt-32 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            
            {/* Semantic Search - Large Card */}
            <div className="glass md:col-span-2 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between overflow-hidden relative group">
              <div className="relative z-20 w-full md:w-2/3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 mb-6">
                  <Search className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2">Semantic AI Search</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Powered by PostgreSQL `pgvector`. Search by exact keywords or deeply conversational intent. The AI calculates cosine distances to understand what you actually mean.
                </p>
              </div>
              
              {/* Decorative Mockup */}
              <div className="absolute right-[-30%] bottom-[-40%] w-[70%] h-[90%] rounded-tl-[3rem] border border-border bg-card shadow-[0_0_80px_-12px_rgba(0,0,0,0.5)] p-6 transition-transform duration-500 group-hover:-translate-y-4 group-hover:-translate-x-4 opacity-10 blur-sm md:blur-none md:opacity-100 hidden sm:block z-0">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <span className="text-base font-medium">"Machine learning tutorials"</span>
                </div>
                <div className="mt-5 space-y-4">
                  <div className="skeleton h-20 w-full rounded-2xl" />
                  <div className="skeleton h-20 w-5/6 rounded-2xl" />
                </div>
              </div>
            </div>

            {/* Auto Tagging - Tall Card */}
            <div className="glass rounded-[2.5rem] p-8 md:p-10 flex flex-col relative group overflow-hidden">
              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 mb-6">
                  <Tag className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2">Auto-Tagging</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Our ingestion pipeline reads your links using Google Gemini models, generating beautiful summaries and precise tags instantly.
                </p>
              </div>

              {/* Tag Clouds */}
              <div className="mt-auto flex flex-wrap gap-2 transition-transform duration-500 group-hover:scale-105">
                {['machine-learning', 'react-hooks', 'system-design', 'postgresql', 'investing', 'fitness'].map(tag => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1.5 rounded-full bg-background/50 border border-border/50 shadow-sm backdrop-blur-md">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Speed & Reliability - Square Card */}
            <div className="glass rounded-[2.5rem] p-8 md:p-10 flex flex-col relative group overflow-hidden">
              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 mb-6 transition-transform group-hover:scale-110 group-hover:-rotate-3">
                  <Zap className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Built on modern Next.js 16 with Turbopack and raw Prisma SQL optimizations. Zero latency, instant hydration.
                </p>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-emerald-500/5 to-transparent pointer-events-none" />
            </div>

            {/* Public Boards - Wide Rectangle */}
            <div className="glass md:col-span-2 rounded-[2.5rem] p-8 md:p-10 flex flex-col relative group overflow-hidden">
              <div className="relative z-10 w-full md:w-1/2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 mb-6">
                  <LayoutGrid className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2">Curate & Share</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Organize your saved content into custom Boards. Keep them private, or generate a secure public link to share your curated knowledge with the world.
                </p>
              </div>
              
              <div className="absolute right-[-5%] top-[10%] w-[45%] h-[120%] rotate-12 rounded-4xl border border-border bg-card shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] p-6 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105 hidden md:block">
                 <div className="flex flex-col gap-3 opacity-60">
                    <div className="h-28 rounded-2xl bg-orange-500/20" />
                    <div className="h-5 w-3/4 rounded-full bg-muted" />
                    <div className="h-4 w-1/2 rounded-full bg-muted" />
                 </div>
              </div>
            </div>
            
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-semibold">Second Brain</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built by <a target="_blank" href="https://github.com/iamasit07">Asit Upadhyay</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
