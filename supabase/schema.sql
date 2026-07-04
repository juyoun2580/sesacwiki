-- ══════════════════════════════════════════════════════════════
-- sesacwiki — Supabase 스키마 (Auth 연동 + 핵심 사용자 데이터)
-- Supabase 대시보드 → SQL Editor에 붙여넣고 실행한다. 여러 번 실행해도
-- 안전하도록 create if not exists / drop-then-create 정책을 사용한다.
-- ══════════════════════════════════════════════════════════════

-- ── profiles: auth.users 1:1, 마이페이지 프로필 오버라이드 ──
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  username text,
  github_username text,
  language text,
  avatar_url text,
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- 신규 auth.users row가 생기면 signup 시 넘긴 user_metadata(name, marketing_opt_in)로
-- profiles row를 자동 생성한다.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, marketing_opt_in)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    coalesce((new.raw_user_meta_data ->> 'marketing_opt_in')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── badges: 기술 뱃지 획득 상태 ──
create table if not exists public.badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id text not null,
  unlocked boolean not null default true,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

alter table public.badges enable row level security;

drop policy if exists "badges_all_own" on public.badges;
create policy "badges_all_own" on public.badges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── quiz_checkpoints: 마이페이지 퀴즈 도전과제 체크포인트 ──
create table if not exists public.quiz_checkpoints (
  user_id uuid not null references auth.users(id) on delete cascade,
  checkpoint_id text not null,
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, checkpoint_id)
);

alter table public.quiz_checkpoints enable row level security;

drop policy if exists "quiz_checkpoints_all_own" on public.quiz_checkpoints;
create policy "quiz_checkpoints_all_own" on public.quiz_checkpoints
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── words: 저장한 단어(mywords) ──
create table if not exists public.words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  term text not null,
  pos text,
  definition text not null,
  example text,
  category text not null,
  category_color text,
  favorite boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.words enable row level security;

drop policy if exists "words_all_own" on public.words;
create policy "words_all_own" on public.words
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── wiki_bookmarks: 위키 즐겨찾기(북마크) ──
create table if not exists public.wiki_bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  wiki_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, wiki_id)
);

alter table public.wiki_bookmarks enable row level security;

drop policy if exists "wiki_bookmarks_all_own" on public.wiki_bookmarks;
create policy "wiki_bookmarks_all_own" on public.wiki_bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── wiki_recent_views: 최근 열람한 위키 글 ──
create table if not exists public.wiki_recent_views (
  user_id uuid not null references auth.users(id) on delete cascade,
  wiki_id text not null,
  visited_at timestamptz not null default now(),
  primary key (user_id, wiki_id)
);

alter table public.wiki_recent_views enable row level security;

drop policy if exists "wiki_recent_views_all_own" on public.wiki_recent_views;
create policy "wiki_recent_views_all_own" on public.wiki_recent_views
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── wiki_highlights: 위키 글 본문 하이라이트 ──
create table if not exists public.wiki_highlights (
  user_id uuid not null references auth.users(id) on delete cascade,
  wiki_id text not null,
  highlights jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, wiki_id)
);

alter table public.wiki_highlights enable row level security;

drop policy if exists "wiki_highlights_all_own" on public.wiki_highlights;
create policy "wiki_highlights_all_own" on public.wiki_highlights
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── exam_attempts: 모의고사 응시 기록 ──
create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id text not null,
  title text,
  icon text,
  score numeric not null,
  points_earned integer not null default 0,
  wrong_question_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.exam_attempts enable row level security;

drop policy if exists "exam_attempts_all_own" on public.exam_attempts;
create policy "exam_attempts_all_own" on public.exam_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── job_progress: 취업핸드북(job_data) + 기능 패널(job_features) 통합 저장 ──
-- job.js/job-features.js가 각자의 localStorage 키(job_data, job_features)를
-- 그대로 컬럼으로 옮긴 형태. 두 페이지 모두 문서형 데이터라 정규화하지 않고
-- jsonb 통짜 저장으로 wiki_highlights와 같은 패턴을 따른다.
create table if not exists public.job_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  job_data jsonb not null default '{}'::jsonb,
  job_features jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.job_progress enable row level security;

drop policy if exists "job_progress_all_own" on public.job_progress;
create policy "job_progress_all_own" on public.job_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
