-- THE TECH BHARAT — Supabase Schema
-- Run in: Supabase Dashboard → SQL Editor → New Query

create table if not exists articles (
  id           text primary key,
  title        text not null,
  content      text default '',
  excerpt      text default '',
  category     text default 'launch',
  brand        text default 'The Tech Bharat',
  img_url      text default '',
  rating       numeric(3,1),
  published_at timestamptz default now(),
  views        integer default 0,
  featured     boolean default false,
  source_url   text default '',
  dedup_key    text unique
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  article_id text references articles(id) on delete cascade,
  name text not null, body text not null,
  approved boolean default false, created_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  article_id text references articles(id) on delete cascade,
  name text not null, rating integer check (rating between 1 and 5),
  body text not null, approved boolean default false, created_at timestamptz default now()
);

alter table articles enable row level security;
alter table comments enable row level security;
alter table reviews  enable row level security;

create policy "Public read articles"  on articles for select using (true);
create policy "Public read comments"  on comments for select using (approved = true);
create policy "Public read reviews"   on reviews  for select using (approved = true);
create policy "Anon write articles"   on articles for all   using (true) with check (true);
create policy "Anon write comments"   on comments for all   using (true) with check (true);
create policy "Anon write reviews"    on reviews  for all   using (true) with check (true);

create index if not exists idx_articles_published on articles(published_at desc);
create index if not exists idx_articles_views     on articles(views desc);
create index if not exists idx_articles_category  on articles(category);
