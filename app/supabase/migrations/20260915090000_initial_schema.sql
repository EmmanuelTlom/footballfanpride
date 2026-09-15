-- FootballFanPrime — initial MVP schema (Sprint 0/1)
-- Covers: identity/profile, clubs/competitions/matches (from football-data.org,
-- cross-checked against API-Football per MASTER_PRODUCT_SPEC.md §15), predictions
-- + settlement, quiz bank + attempts, and an XP event log.

-- ── Reference data ──────────────────────────────────────────────────────────

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text,
  crest_url text,
  country text,
  external_id_football_data integer unique,
  external_id_api_football integer unique,
  created_at timestamptz not null default now()
);

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique, -- e.g. 'PL', 'CL'
  external_id_football_data integer unique,
  external_id_api_football integer unique,
  created_at timestamptz not null default now()
);

-- ── Matches & settlement ─────────────────────────────────────────────────────
-- Settlement follows spec §15: football-data.org is primary, API-Football is the
-- fallback/verification source for final scores specifically. `settlement_flagged`
-- marks a disagreement between providers so it's held for manual review instead
-- of being silently resolved.

create type public.match_status as enum ('scheduled', 'live', 'finished', 'postponed', 'cancelled');
create type public.settlement_source as enum ('football_data_org', 'api_football', 'manual');

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id),
  home_club_id uuid not null references public.clubs (id),
  away_club_id uuid not null references public.clubs (id),
  kickoff_at timestamptz not null,
  status public.match_status not null default 'scheduled',
  home_score integer,
  away_score integer,
  external_id_football_data integer unique,
  external_id_api_football integer unique,
  settlement_source public.settlement_source,
  settlement_flagged boolean not null default false,
  settled_at timestamptz,
  created_at timestamptz not null default now()
);

create index matches_kickoff_at_idx on public.matches (kickoff_at);
create index matches_status_idx on public.matches (status);

-- ── Profiles (extends auth.users) ────────────────────────────────────────────
-- Four separate stats per spec §5.1: xp, football_iq, battle_rating (added later
-- with Fan Battles in Sprint 6), and rank (computed, not stored here).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  club_id uuid references public.clubs (id),
  xp integer not null default 0,
  football_iq integer not null default 0,
  streak_current integer not null default 0,
  streak_longest integer not null default 0,
  star_shields_available integer not null default 1,
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ── Predictions ───────────────────────────────────────────────────────────

create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  match_id uuid not null references public.matches (id) on delete cascade,
  predicted_home_score integer not null,
  predicted_away_score integer not null,
  points_awarded integer,
  created_at timestamptz not null default now(),
  unique (user_id, match_id)
);

-- ── Quiz bank & attempts ─────────────────────────────────────────────────────
-- Practice mode feeds football_iq only; Daily Challenge is the same question set
-- for everyone on a given day. Both are walled off from Battle Rating (Sprint 6).

create type public.quiz_mode as enum ('practice', 'daily_challenge');

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  topic text not null, -- e.g. 'club:arsenal', 'competition:premier-league'
  club_id uuid references public.clubs (id),
  competition_id uuid references public.competitions (id),
  question_text text not null,
  choices jsonb not null, -- ["choice a", "choice b", ...]
  correct_choice_index smallint not null,
  difficulty smallint not null default 1,
  source_note text, -- provenance for the fact, per spec's "always show your source"
  created_at timestamptz not null default now()
);

create table public.daily_challenge_questions (
  challenge_date date primary key,
  question_ids uuid[] not null
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_id uuid not null references public.quiz_questions (id),
  mode public.quiz_mode not null,
  selected_choice_index smallint not null,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

create index quiz_attempts_user_topic_idx on public.quiz_attempts (user_id, question_id);

-- ── XP event log ─────────────────────────────────────────────────────────────
-- Every XP change is logged with its source, so profiles.xp is always derivable
-- and auditable rather than mutated blindly from scattered call sites.

create type public.xp_source as enum ('prediction_settled', 'quiz_practice', 'daily_challenge', 'streak_bonus');

create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  source public.xp_source not null,
  amount integer not null,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index xp_events_user_idx on public.xp_events (user_id, created_at);

-- ── Row Level Security ───────────────────────────────────────────────────────
-- Reference/content tables (clubs, competitions, matches, quiz bank) are
-- public-read. User-owned tables are readable by their owner and, for
-- leaderboard purposes, profiles are public-read too (status is meant to be
-- visible — see spec §5).

alter table public.clubs enable row level security;
alter table public.competitions enable row level security;
alter table public.matches enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.daily_challenge_questions enable row level security;
alter table public.profiles enable row level security;
alter table public.predictions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.xp_events enable row level security;

create policy "clubs are publicly readable" on public.clubs for select using (true);
create policy "competitions are publicly readable" on public.competitions for select using (true);
create policy "matches are publicly readable" on public.matches for select using (true);
create policy "quiz questions are publicly readable" on public.quiz_questions for select using (true);
create policy "daily challenge is publicly readable" on public.daily_challenge_questions for select using (true);

create policy "profiles are publicly readable" on public.profiles for select using (true);
create policy "users can insert their own profile" on public.profiles for insert with check (auth.uid () = id);
create policy "users can update their own profile" on public.profiles for update using (auth.uid () = id);

create policy "users can read their own predictions" on public.predictions for select using (auth.uid () = user_id);
create policy "users can insert their own predictions" on public.predictions for insert with check (auth.uid () = user_id);

create policy "users can read their own quiz attempts" on public.quiz_attempts for select using (auth.uid () = user_id);
create policy "users can insert their own quiz attempts" on public.quiz_attempts for insert with check (auth.uid () = user_id);

create policy "users can read their own xp events" on public.xp_events for select using (auth.uid () = user_id);
-- xp_events are written by backend/service-role logic (settlement, quiz scoring),
-- never directly by the client, so no client-side insert policy here.
