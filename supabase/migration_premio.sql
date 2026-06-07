-- ============================================================
-- MIGRAÇÃO: Sistema de Premiação
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Adiciona campo de pagamento nos perfis
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS paid boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Adiciona configurações de premiação nas settings
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS entry_fee    numeric NOT NULL DEFAULT 50.00,
  ADD COLUMN IF NOT EXISTS admin_fee    numeric NOT NULL DEFAULT 5.00,
  ADD COLUMN IF NOT EXISTS prize_pct_1  int     NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS prize_pct_2  int     NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS prize_pct_house int   NOT NULL DEFAULT 10;

-- Atualiza a linha existente
UPDATE public.settings SET
  entry_fee      = 50.00,
  admin_fee      = 5.00,
  prize_pct_1    = 60,
  prize_pct_2    = 30,
  prize_pct_house = 10;

-- VIEW: resumo do prêmio calculado dinamicamente
CREATE OR REPLACE VIEW public.prize_summary AS
SELECT
  (SELECT COUNT(*)                        FROM public.profiles WHERE paid = true)::int       AS paid_count,
  (SELECT COUNT(*) * s.entry_fee          FROM public.profiles WHERE paid = true)            AS total_collected,
  (SELECT COUNT(*) * s.admin_fee          FROM public.profiles WHERE paid = true)            AS total_admin_fees,
  (SELECT COUNT(*) * (s.entry_fee - s.admin_fee) FROM public.profiles WHERE paid = true)    AS net_prize_pool,
  ROUND((SELECT COUNT(*) * (s.entry_fee - s.admin_fee) FROM public.profiles WHERE paid = true) * s.prize_pct_1   / 100.0, 2) AS prize_1st,
  ROUND((SELECT COUNT(*) * (s.entry_fee - s.admin_fee) FROM public.profiles WHERE paid = true) * s.prize_pct_2   / 100.0, 2) AS prize_2nd,
  ROUND((SELECT COUNT(*) * (s.entry_fee - s.admin_fee) FROM public.profiles WHERE paid = true) * s.prize_pct_house / 100.0, 2) AS prize_house,
  s.entry_fee,
  s.admin_fee,
  s.prize_pct_1,
  s.prize_pct_2,
  s.prize_pct_house
FROM public.settings s
LIMIT 1;

-- Política: admin pode ver e alterar campo paid
CREATE POLICY "profiles_paid_admin" ON public.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Política: qualquer autenticado pode ver o prize_summary
-- (view não precisa de RLS, herda das tabelas base)
