-- ============================================================
-- AJUSTE DA REGRA DE PREMIAÇÃO — sem taxa da casa
-- ============================================================
-- Zera a taxa de inscrição (admin_fee) e o percentual reservado
-- à casa (prize_pct_house): o valor integral de cada inscrição
-- (R$ 50) entra no pool e é dividido só entre os participantes —
-- 60% pro 1º lugar, 30% pro 2º. Isso faz o cálculo ao vivo
-- (view prize_summary, já usada em /ranking) bater exatamente
-- com "1º leva 60% · 2º leva 30% do total arrecadado".
update public.settings set
  admin_fee       = 0,
  prize_pct_house = 0;

-- Função pública que expõe SÓ o resumo agregado da premiação
-- (quantos pagaram + valores de 1º/2º) — sem dar acesso de leitura
-- à tabela profiles pra visitantes anônimos. security definer pra
-- contornar a RLS de profiles com segurança (só devolve agregados,
-- nunca dado individual). Usada na landing page (antes do login)
-- pra mostrar "Prêmio em tempo real" e incentivar o cadastro.
create or replace function public.get_prize_summary()
returns table (paid_count int, prize_1st numeric, prize_2nd numeric)
language sql
security definer
set search_path = public
as $$
  select paid_count, prize_1st, prize_2nd from public.prize_summary;
$$;

grant execute on function public.get_prize_summary() to anon, authenticated;
