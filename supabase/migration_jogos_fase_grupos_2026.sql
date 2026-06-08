-- ============================================================
-- CORREÇÃO DOS JOGOS DA FASE DE GRUPOS — Copa do Mundo 2026
-- ============================================================
-- O schema.sql original trazia 10 jogos de fase de grupos como dado
-- de exemplo (times/datas fictícios, ex: "México x Polônia"). Esta
-- migration substitui esses jogos pelos 72 confrontos oficiais da
-- fase de grupos (3 rodadas x 24 jogos), com horários convertidos
-- de Brasília (UTC-3) para UTC — formato já usado pela coluna
-- `match_date` (timestamptz).
--
-- Grupos (A-L) preenchidos conforme o sorteio oficial informado.
--
-- Seleções ainda não definidas (vagas de repescagem) entram como
-- 'A definir (<repescagem>)' — ex: 'A definir (Europa D)' — sem
-- bandeira (home_flag/away_flag = ''). O sufixo identifica de qual
-- chave de repescagem vem a vaga (são 6 vagas distintas, cada uma
-- aparecendo 3x no grupo). Troque pelo nome real do time assim que
-- as repescagens terminarem — NÃO é o nome de uma seleção real.
--
-- Mata-mata: NÃO incluído aqui — os confrontos só são definidos após
-- o fim da fase de grupos (datas: oitavas 04-07/07, quartas 09-11/07,
-- semis 14-15/07, 3º lugar 18/07, final 19/07 — adicione pelo painel
-- /admin quando os confrontos forem conhecidos).
-- ============================================================

-- Cidade-sede de cada partida (não existia antes)
alter table public.games add column if not exists city text;

-- Trava de segurança: aborta a migration se já existir QUALQUER
-- palpite registrado nos jogos de fase de grupos atuais — preferimos
-- falhar a apagar dado real de usuário (predictions tem
-- "on delete cascade" para games).
do $$
declare
  v_count int;
begin
  select count(*) into v_count
  from public.predictions p
  join public.games g on g.id = p.game_id
  where g.stage = 'group';

  if v_count > 0 then
    raise exception
      'Existem % palpite(s) registrado(s) nos jogos de fase de grupos atuais. Migration abortada para não apagar dados — revise manualmente antes de rodar de novo.',
      v_count;
  end if;
end $$;

delete from public.games where stage = 'group';

insert into public.games
  (home_team, away_team, home_flag, away_flag, match_date, group_name, stage, city)
values
  -- ── 1ª rodada (11–17/06) ──────────────────────────────────────
  ('México',                  'África do Sul',            'mx',     'za',     '2026-06-11 19:00:00+00', 'Grupo A', 'group', 'Cidade do México'),
  ('Coreia do Sul',           'A definir (Europa D)',     'kr',     '',       '2026-06-12 02:00:00+00', 'Grupo A', 'group', 'Guadalajara'),
  ('Canadá',                  'A definir (Europa A)',     'ca',     '',       '2026-06-12 19:00:00+00', 'Grupo B', 'group', 'Toronto'),
  ('Estados Unidos',          'Paraguai',                 'us',     'py',     '2026-06-13 01:00:00+00', 'Grupo D', 'group', 'Los Angeles'),
  ('Austrália',               'A definir (Europa C)',     'au',     '',       '2026-06-13 04:00:00+00', 'Grupo D', 'group', 'Vancouver'),
  ('Catar',                   'Suíça',                    'qa',     'ch',     '2026-06-13 19:00:00+00', 'Grupo B', 'group', 'San Francisco'),
  ('Brasil',                  'Marrocos',                 'br',     'ma',     '2026-06-13 22:00:00+00', 'Grupo C', 'group', 'Nova York/NJ'),
  ('Haiti',                   'Escócia',                  'ht',     'gb-sct', '2026-06-14 01:00:00+00', 'Grupo C', 'group', 'Boston'),
  ('Alemanha',                'Curaçao',                  'de',     'cw',     '2026-06-14 17:00:00+00', 'Grupo E', 'group', 'Houston'),
  ('Holanda',                 'Japão',                    'nl',     'jp',     '2026-06-14 20:00:00+00', 'Grupo F', 'group', 'Dallas'),
  ('Costa do Marfim',         'Equador',                  'ci',     'ec',     '2026-06-14 23:00:00+00', 'Grupo E', 'group', 'Filadélfia'),
  ('A definir (Europa B)',    'Tunísia',                  '',       'tn',     '2026-06-15 02:00:00+00', 'Grupo F', 'group', 'Monterrey'),
  ('Espanha',                 'Cabo Verde',               'es',     'cv',     '2026-06-15 16:00:00+00', 'Grupo H', 'group', 'Atlanta'),
  ('Bélgica',                 'Egito',                    'be',     'eg',     '2026-06-15 19:00:00+00', 'Grupo G', 'group', 'Seattle'),
  ('Arábia Saudita',          'Uruguai',                  'sa',     'uy',     '2026-06-15 22:00:00+00', 'Grupo H', 'group', 'Miami'),
  ('Irã',                     'Nova Zelândia',            'ir',     'nz',     '2026-06-16 01:00:00+00', 'Grupo G', 'group', 'Los Angeles'),
  ('Argentina',               'Argélia',                  'ar',     'dz',     '2026-06-16 17:00:00+00', 'Grupo J', 'group', 'Kansas City'),
  ('França',                  'Senegal',                  'fr',     'sn',     '2026-06-16 19:00:00+00', 'Grupo I', 'group', 'Nova York/NJ'),
  ('A definir (Intercont. 2)','Noruega',                  '',       'no',     '2026-06-16 22:00:00+00', 'Grupo I', 'group', 'Boston'),
  ('Áustria',                 'Jordânia',                 'at',     'jo',     '2026-06-17 04:00:00+00', 'Grupo J', 'group', 'San Francisco'),
  ('Portugal',                'A definir (Intercont. 1)', 'pt',     '',       '2026-06-17 17:00:00+00', 'Grupo K', 'group', 'Houston'),
  ('Inglaterra',              'Croácia',                  'gb-eng', 'hr',     '2026-06-17 20:00:00+00', 'Grupo L', 'group', 'Dallas'),
  ('Gana',                    'Panamá',                   'gh',     'pa',     '2026-06-17 23:00:00+00', 'Grupo L', 'group', 'Toronto'),
  ('Uzbequistão',             'Colômbia',                 'uz',     'co',     '2026-06-18 02:00:00+00', 'Grupo K', 'group', 'Cidade do México'),

  -- ── 2ª rodada (18–23/06) ──────────────────────────────────────
  ('A definir (Europa D)',    'África do Sul',            '',       'za',     '2026-06-18 16:00:00+00', 'Grupo A', 'group', 'Atlanta'),
  ('Suíça',                   'A definir (Europa A)',     'ch',     '',       '2026-06-18 19:00:00+00', 'Grupo B', 'group', 'Los Angeles'),
  ('Canadá',                  'Catar',                    'ca',     'qa',     '2026-06-18 22:00:00+00', 'Grupo B', 'group', 'Vancouver'),
  ('México',                  'Coreia do Sul',            'mx',     'kr',     '2026-06-19 01:00:00+00', 'Grupo A', 'group', 'Guadalajara'),
  ('A definir (Europa C)',    'Paraguai',                 '',       'py',     '2026-06-19 04:00:00+00', 'Grupo D', 'group', 'San Francisco'),
  ('Estados Unidos',          'Austrália',                'us',     'au',     '2026-06-19 19:00:00+00', 'Grupo D', 'group', 'Seattle'),
  ('Escócia',                 'Marrocos',                 'gb-sct', 'ma',     '2026-06-19 22:00:00+00', 'Grupo C', 'group', 'Boston'),
  ('Brasil',                  'Haiti',                    'br',     'ht',     '2026-06-20 01:00:00+00', 'Grupo C', 'group', 'Filadélfia'),
  ('Holanda',                 'A definir (Europa B)',     'nl',     '',       '2026-06-20 17:00:00+00', 'Grupo F', 'group', 'Houston'),
  ('Alemanha',                'Costa do Marfim',          'de',     'ci',     '2026-06-20 20:00:00+00', 'Grupo E', 'group', 'Toronto'),
  ('Equador',                 'Curaçao',                  'ec',     'cw',     '2026-06-21 00:00:00+00', 'Grupo E', 'group', 'Kansas City'),
  ('Tunísia',                 'Japão',                    'tn',     'jp',     '2026-06-21 04:00:00+00', 'Grupo F', 'group', 'Monterrey'),
  ('Espanha',                 'Arábia Saudita',           'es',     'sa',     '2026-06-21 16:00:00+00', 'Grupo H', 'group', 'Atlanta'),
  ('Bélgica',                 'Irã',                      'be',     'ir',     '2026-06-21 19:00:00+00', 'Grupo G', 'group', 'Los Angeles'),
  ('Uruguai',                 'Cabo Verde',               'uy',     'cv',     '2026-06-21 22:00:00+00', 'Grupo H', 'group', 'Miami'),
  ('Nova Zelândia',           'Egito',                    'nz',     'eg',     '2026-06-22 01:00:00+00', 'Grupo G', 'group', 'Vancouver'),
  ('Argentina',               'Áustria',                  'ar',     'at',     '2026-06-22 17:00:00+00', 'Grupo J', 'group', 'Dallas'),
  ('França',                  'A definir (Intercont. 2)', 'fr',     '',       '2026-06-22 21:00:00+00', 'Grupo I', 'group', 'Filadélfia'),
  ('Noruega',                 'Senegal',                  'no',     'sn',     '2026-06-23 00:00:00+00', 'Grupo I', 'group', 'Nova York/NJ'),
  ('Jordânia',                'Argélia',                  'jo',     'dz',     '2026-06-23 03:00:00+00', 'Grupo J', 'group', 'San Francisco'),
  ('Portugal',                'Uzbequistão',              'pt',     'uz',     '2026-06-23 17:00:00+00', 'Grupo K', 'group', 'Houston'),
  ('Inglaterra',              'Gana',                     'gb-eng', 'gh',     '2026-06-23 20:00:00+00', 'Grupo L', 'group', 'Boston'),
  ('Panamá',                  'Croácia',                  'pa',     'hr',     '2026-06-23 23:00:00+00', 'Grupo L', 'group', 'Toronto'),
  ('Colômbia',                'A definir (Intercont. 1)', 'co',     '',       '2026-06-24 02:00:00+00', 'Grupo K', 'group', 'Guadalajara'),

  -- ── 3ª rodada (24–27/06) ──────────────────────────────────────
  ('Suíça',                   'Canadá',                   'ch',     'ca',     '2026-06-24 19:00:00+00', 'Grupo B', 'group', 'Vancouver'),
  ('A definir (Europa A)',    'Catar',                    '',       'qa',     '2026-06-24 19:00:00+00', 'Grupo B', 'group', 'Seattle'),
  ('Escócia',                 'Brasil',                   'gb-sct', 'br',     '2026-06-24 22:00:00+00', 'Grupo C', 'group', 'Miami'),
  ('Marrocos',                'Haiti',                    'ma',     'ht',     '2026-06-24 22:00:00+00', 'Grupo C', 'group', 'Atlanta'),
  ('A definir (Europa D)',    'México',                   '',       'mx',     '2026-06-25 01:00:00+00', 'Grupo A', 'group', 'Cidade do México'),
  ('África do Sul',           'Coreia do Sul',            'za',     'kr',     '2026-06-25 01:00:00+00', 'Grupo A', 'group', 'Monterrey'),
  ('Equador',                 'Alemanha',                 'ec',     'de',     '2026-06-25 20:00:00+00', 'Grupo E', 'group', 'Nova York/NJ'),
  ('Curaçao',                 'Costa do Marfim',          'cw',     'ci',     '2026-06-25 20:00:00+00', 'Grupo E', 'group', 'Filadélfia'),
  ('Japão',                   'A definir (Europa B)',     'jp',     '',       '2026-06-25 23:00:00+00', 'Grupo F', 'group', 'Dallas'),
  ('Tunísia',                 'Holanda',                  'tn',     'nl',     '2026-06-25 23:00:00+00', 'Grupo F', 'group', 'Kansas City'),
  ('A definir (Europa C)',    'Estados Unidos',           '',       'us',     '2026-06-26 02:00:00+00', 'Grupo D', 'group', 'Los Angeles'),
  ('Paraguai',                'Austrália',                'py',     'au',     '2026-06-26 02:00:00+00', 'Grupo D', 'group', 'San Francisco'),
  ('Noruega',                 'França',                   'no',     'fr',     '2026-06-26 19:00:00+00', 'Grupo I', 'group', 'Boston'),
  ('Senegal',                 'A definir (Intercont. 2)', 'sn',     '',       '2026-06-26 19:00:00+00', 'Grupo I', 'group', 'Toronto'),
  ('Cabo Verde',              'Arábia Saudita',           'cv',     'sa',     '2026-06-27 00:00:00+00', 'Grupo H', 'group', 'Houston'),
  ('Uruguai',                 'Espanha',                  'uy',     'es',     '2026-06-27 00:00:00+00', 'Grupo H', 'group', 'Guadalajara'),
  ('Egito',                   'Irã',                      'eg',     'ir',     '2026-06-27 03:00:00+00', 'Grupo G', 'group', 'Seattle'),
  ('Nova Zelândia',           'Bélgica',                  'nz',     'be',     '2026-06-27 03:00:00+00', 'Grupo G', 'group', 'Vancouver'),
  ('Panamá',                  'Inglaterra',               'pa',     'gb-eng', '2026-06-27 21:00:00+00', 'Grupo L', 'group', 'Nova York/NJ'),
  ('Croácia',                 'Gana',                     'hr',     'gh',     '2026-06-27 21:00:00+00', 'Grupo L', 'group', 'Filadélfia'),
  ('Colômbia',                'Portugal',                 'co',     'pt',     '2026-06-27 23:30:00+00', 'Grupo K', 'group', 'Miami'),
  ('A definir (Intercont. 1)','Uzbequistão',              '',       'uz',     '2026-06-27 23:30:00+00', 'Grupo K', 'group', 'Atlanta'),
  ('Argélia',                 'Áustria',                  'dz',     'at',     '2026-06-28 02:00:00+00', 'Grupo J', 'group', 'Kansas City'),
  ('Jordânia',                'Argentina',                'jo',     'ar',     '2026-06-28 02:00:00+00', 'Grupo J', 'group', 'Dallas');
