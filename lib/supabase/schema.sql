-- Second Brain Database Schema
-- Run this in your Supabase SQL Editor

-- Cards table
create table if not exists cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  summary text,
  source_url text,
  content_type text default 'article',
  thumbnail text,
  tags text[] default '{}',
  ai_tags text[] default '{}',
  user_tags text[] default '{}',
  raw_content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Boards table
create table if not exists boards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  cover_image text,
  is_public boolean default false,
  share_token text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Board-Card join table (many-to-many)
create table if not exists board_cards (
  id uuid default gen_random_uuid() primary key,
  board_id uuid references boards(id) on delete cascade not null,
  card_id uuid references cards(id) on delete cascade not null,
  added_at timestamptz default now(),
  unique(board_id, card_id)
);

-- Enable Row Level Security
alter table cards enable row level security;
alter table boards enable row level security;
alter table board_cards enable row level security;

-- Cards: users can only CRUD their own
create policy "Users can view own cards" on cards
  for select using (auth.uid() = user_id);
create policy "Users can insert own cards" on cards
  for insert with check (auth.uid() = user_id);
create policy "Users can update own cards" on cards
  for update using (auth.uid() = user_id);
create policy "Users can delete own cards" on cards
  for delete using (auth.uid() = user_id);

-- Boards: users can CRUD their own; public boards viewable by anyone
create policy "Users can view own boards" on boards
  for select using (auth.uid() = user_id);
create policy "Public boards viewable" on boards
  for select using (is_public = true);
create policy "Users can insert own boards" on boards
  for insert with check (auth.uid() = user_id);
create policy "Users can update own boards" on boards
  for update using (auth.uid() = user_id);
create policy "Users can delete own boards" on boards
  for delete using (auth.uid() = user_id);

-- Board_cards: follow board ownership
create policy "Users can view own board_cards" on board_cards
  for select using (
    exists (
      select 1 from boards
      where boards.id = board_cards.board_id
      and boards.user_id = auth.uid()
    )
  );
create policy "Public board_cards viewable" on board_cards
  for select using (
    exists (
      select 1 from boards
      where boards.id = board_cards.board_id
      and boards.is_public = true
    )
  );
create policy "Users can insert own board_cards" on board_cards
  for insert with check (
    exists (
      select 1 from boards
      where boards.id = board_cards.board_id
      and boards.user_id = auth.uid()
    )
  );
create policy "Users can delete own board_cards" on board_cards
  for delete using (
    exists (
      select 1 from boards
      where boards.id = board_cards.board_id
      and boards.user_id = auth.uid()
    )
  );

-- Indexes for performance
create index if not exists idx_cards_user_id on cards(user_id);
create index if not exists idx_cards_tags on cards using gin(tags);
create index if not exists idx_cards_created_at on cards(created_at desc);
create index if not exists idx_boards_user_id on boards(user_id);
create index if not exists idx_boards_share_token on boards(share_token);
create index if not exists idx_board_cards_board_id on board_cards(board_id);
create index if not exists idx_board_cards_card_id on board_cards(card_id);
