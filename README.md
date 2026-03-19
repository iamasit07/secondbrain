# Second Brain 🧠✨

**Your mind, amplified.**

Second Brain is an AI-powered knowledge management application that helps you save, organize, and discover articles, videos, and tools from the web. Stop losing track of great content—save anything and find it instantly using semantic AI search and automatic contextual tagging.

## ✨ Key Features

- **🔎 Semantic AI Search**: Powered by PostgreSQL `pgvector` and Google Gemini embeddings (`text-embedding-004`). Search by exact keywords or conversational intent.
- **🏷️ Auto-Tagging**: An intelligent ingestion pipeline reads your links using Google Gemini models, generating concise summaries and precise tags instantly.
- **⚡️ Lightning Fast**: Built on modern Next.js 16 with Turbopack and raw Prisma SQL optimizations for zero latency and instant hydration.
- **📋 Public Boards**: Curate and organize your saved content into custom boards. Keep them private, or generate a secure public link to share your knowledge with the world.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with `pgvector` for similarity search
- **ORM / DB Access**: [Prisma](https://www.prisma.io/) & Prisma Postgres Adapter
- **Backend/Auth**: [Supabase](https://supabase.com/)
- **AI Models**: Google Generative AI (Gemini)
- **Styling**: Tailwind CSS v4, Radix UI Primitives, Lucide Icons

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js installed, along with a package manager like `npm`, `yarn`, `pnpm`, or `bun`.

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd secondBrain
```

### 2. Install dependencies

```bash
npm install
# or yarn, pnpm, bun
```

### 3. Environment Variables

Create a `.env` file in the root directory and configure the necessary environment variables for Supabase, Prisma, and Google Generative AI:

```env
# Example .env structure
DATABASE_URL="postgresql://user:password@host/db?schema=public"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
GEMINI_API_KEY="your-gemini-api-key"
```

### 4. Database Setup

Ensure your PostgreSQL instance has the `vector` extension installed. Run Prisma migrations to set up the database schema.

```bash
npx prisma db push
# or npx prisma migrate dev
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📦 Database Schema Overview

- **Cards**: Stores individual saved items (articles, videos), their auto-generated thumbnails, AI summaries, standard tags, user-defined tags, and vector embeddings (3072 dimensions).
- **Boards**: Collections created by users to organize cards. Can be public or private, featuring secure share tokens.
- **Board Cards**: Junction table linking `Cards` and `Boards`.

---

Built by [Asit Upadhyay](https://github.com/iamasit07)
