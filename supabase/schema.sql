-- ============================================================
-- BOLÃO 2026 - Schema Supabase
-- ============================================================

-- Extensão para UUIDs
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (espelha auth.users)
-- ============================================================
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  name       text not null default '',
  avatar_url text,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_select_all_authenticated" on public.profiles
  for select using (auth.role() = 'authenticated');

-- ============================================================
-- SETTINGS (configurações do bolão)
-- ============================================================
create table public.settings (
  id               uuid primary key default uuid_generate_v4(),
  site_name        text not null default 'Bolão 2026',
  prize            text not null default 'R$ 500,00',
  points_exact     int  not null default 10,
  points_winner_diff int not null default 7,
  points_winner    int  not null default 5,
  updated_at       timestamptz not null default now()
);

alter table public.settings enable row level security;

create policy "settings_select_all" on public.settings
  for select using (true);

create policy "settings_modify_admin" on public.settings
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Insere configuração padrão
insert into public.settings (site_name, prize) values ('Palpitaí', 'R$ 500,00');

-- ============================================================
-- GAMES (jogos da copa)
-- ============================================================
create table public.games (
  id          uuid primary key default uuid_generate_v4(),
  home_team   text not null,
  away_team   text not null,
  home_flag   text not null default '',
  away_flag   text not null default '',
  match_date  timestamptz not null,
  group_name  text,
  stage       text not null default 'group'
    check (stage in ('group','round_of_32','round_of_16','quarter','semi','third','final')),
  home_score  int,
  away_score  int,
  is_finished boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.games enable row level security;

create policy "games_select_all" on public.games
  for select using (true);

create policy "games_modify_admin" on public.games
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ============================================================
-- PREDICTIONS (palpites)
-- ============================================================
create table public.predictions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  game_id     uuid not null references public.games(id) on delete cascade,
  home_score  int  not null,
  away_score  int  not null,
  points      int,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, game_id)
);

alter table public.predictions enable row level security;

create policy "predictions_select_own" on public.predictions
  for select using (auth.uid() = user_id);

create policy "predictions_insert_own" on public.predictions
  for insert with check (auth.uid() = user_id);

create policy "predictions_update_own" on public.predictions
  for update using (auth.uid() = user_id);

create policy "predictions_select_all_authenticated" on public.predictions
  for select using (auth.role() = 'authenticated');

-- ============================================================
-- FUNÇÃO: recalcular pontos após resultado inserido
-- ============================================================
create or replace function public.recalculate_points(p_game_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_home_score    int;
  v_away_score    int;
  v_home_diff     int;
  v_game_winner   int;
  v_pts_exact     int;
  v_pts_win_diff  int;
  v_pts_winner    int;
  rec             record;
  pred_winner     int;
  pred_diff       int;
  earned_pts      int;
begin
  select home_score, away_score into v_home_score, v_away_score
  from public.games where id = p_game_id;

  select points_exact, points_winner_diff, points_winner
  into v_pts_exact, v_pts_win_diff, v_pts_winner
  from public.settings limit 1;

  v_home_diff   := v_home_score - v_away_score;
  v_game_winner := sign(v_home_diff);

  for rec in
    select id, home_score, away_score from public.predictions where game_id = p_game_id
  loop
    pred_diff   := rec.home_score - rec.away_score;
    pred_winner := sign(pred_diff);

    if rec.home_score = v_home_score and rec.away_score = v_away_score then
      earned_pts := v_pts_exact;
    elsif pred_winner = v_game_winner and pred_diff = v_home_diff then
      earned_pts := v_pts_win_diff;
    elsif pred_winner = v_game_winner then
      earned_pts := v_pts_winner;
    else
      earned_pts := 0;
    end if;

    update public.predictions set points = earned_pts, updated_at = now()
    where id = rec.id;
  end loop;
end;
$$;

-- ============================================================
-- VIEW: ranking
-- ============================================================
create or replace view public.ranking as
select
  p.id              as user_id,
  p.name,
  p.avatar_url,
  coalesce(sum(pr.points), 0)                          as total_points,
  count(*) filter (where pr.points = (select points_exact from public.settings limit 1))   as exact_scores,
  count(*) filter (where pr.points >= (select points_winner from public.settings limit 1) and pr.points < (select points_exact from public.settings limit 1)) as correct_winners
from public.profiles p
left join public.predictions pr on pr.user_id = p.id
group by p.id, p.name, p.avatar_url
order by total_points desc;

-- ============================================================
-- TRIGGER: criar perfil ao cadastrar usuário
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- JOGOS DA COPA 2026 (fase de grupos - amostra)
-- ============================================================
insert into public.games (home_team, away_team, home_flag, away_flag, match_date, group_name, stage) values
  ('México',       'Polônia',      'mx', 'pl', '2026-06-11 18:00:00+00', 'A', 'group'),
  ('Argentina',    'Arábia Saudita','ar', 'sa', '2026-06-12 13:00:00+00', 'C', 'group'),
  ('França',       'Austrália',    'fr', 'au', '2026-06-13 10:00:00+00', 'D', 'group'),
  ('Marrocos',     'Croácia',      'ma', 'hr', '2026-06-13 16:00:00+00', 'F', 'group'),
  ('Alemanha',     'Japão',        'de', 'jp', '2026-06-14 13:00:00+00', 'E', 'group'),
  ('Espanha',      'Costa Rica',   'es', 'cr', '2026-06-15 10:00:00+00', 'E', 'group'),
  ('Brasil',       'Sérvia',       'br', 'rs', '2026-06-16 19:00:00+00', 'G', 'group'),
  ('Portugal',     'Gana',         'pt', 'gh', '2026-06-17 16:00:00+00', 'H', 'group'),
  ('Inglaterra',   'Irã',          'gb', 'ir', '2026-06-21 13:00:00+00', 'B', 'group'),
  ('Brasil',       'Suíça',        'br', 'ch', '2026-06-28 16:00:00+00', 'G', 'group');
