-- ============================================================
--  Onerios-Quests  |  Supabase Database Schema
-- ============================================================
-- Run this entire file in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → Paste → Run)
-- ============================================================

-- ─── EXTENSIONS ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── TABLES ──────────────────────────────────────────────────

-- 1. Questions
create table if not exists questions (
  id             uuid primary key default uuid_generate_v4(),
  question       text not null,
  option_a       text not null,
  option_b       text not null,
  option_c       text not null,
  option_d       text not null,
  correct_option text not null check (correct_option in ('a','b','c','d','A','B','C','D')),
  points         integer not null default 10,
  created_at     timestamptz not null default now()
);

-- 2. QR Codes
create table if not exists qr_codes (
  id          uuid primary key default uuid_generate_v4(),
  token       text not null unique,
  question_id uuid not null references questions(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- 3. Scans
create table if not exists scans (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  qr_token   text not null,
  is_correct boolean not null,
  created_at timestamptz not null default now(),
  -- Each user can only scan each QR token once
  unique (user_id, qr_token)
);

-- 4. Scoreboard
create table if not exists scoreboard (
  user_id uuid primary key references auth.users(id) on delete cascade,
  score   integer not null default 0 check (score >= 0)
);

-- ─── INDEXES ─────────────────────────────────────────────────
create index if not exists idx_scans_user_id    on scans(user_id);
create index if not exists idx_scans_qr_token   on scans(qr_token);
create index if not exists idx_qrcodes_token    on qr_codes(token);
create index if not exists idx_scoreboard_score on scoreboard(score desc);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
alter table questions  enable row level security;
alter table qr_codes   enable row level security;
alter table scans      enable row level security;
alter table scoreboard enable row level security;

-- questions: anyone can read; only service role can insert/update/delete
create policy "questions_select_all"
  on questions for select using (true);

-- qr_codes: anyone can read
create policy "qr_codes_select_all"
  on qr_codes for select using (true);

-- scans: users can only see and insert their own scans
create policy "scans_select_own"
  on scans for select using (auth.uid() = user_id);

create policy "scans_insert_own"
  on scans for insert with check (auth.uid() = user_id);

-- scoreboard: anyone can read; users can only insert / update their own row
create policy "scoreboard_select_all"
  on scoreboard for select using (true);

create policy "scoreboard_insert_own"
  on scoreboard for insert with check (auth.uid() = user_id);

create policy "scoreboard_update_own"
  on scoreboard for update using (auth.uid() = user_id);

-- NOTE: Questions are hardcoded in PlayPage.jsx — no sample data needed.
