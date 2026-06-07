-- Integração de pagamentos PIX (AbacatePay)
-- Execute este arquivo no SQL Editor do Supabase após o migration_premio.sql

create table if not exists public.payments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  pix_id          text not null unique,
  amount_cents    integer not null,
  status          text not null default 'PENDING'
                    check (status in ('PENDING', 'PAID', 'EXPIRED', 'CANCELLED', 'REFUNDED')),
  br_code         text,
  br_code_base64  text,
  expires_at      timestamptz,
  paid_at         timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists payments_user_id_idx on public.payments(user_id);

alter table public.payments enable row level security;

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments
  for select using (auth.uid() = user_id);

drop policy if exists "payments_insert_own" on public.payments;
create policy "payments_insert_own" on public.payments
  for insert with check (auth.uid() = user_id);

drop policy if exists "payments_update_own" on public.payments;
create policy "payments_update_own" on public.payments
  for update using (auth.uid() = user_id);

-- Função privilegiada chamada pelo webhook/checagem de status: confirma o pagamento
-- e marca o perfil como pago, contornando o RLS de forma controlada (security definer).
create or replace function public.confirm_pix_payment(
  p_pix_id text,
  p_status text,
  p_paid_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  update public.payments
     set status  = p_status,
         paid_at = case when p_status = 'PAID' then p_paid_at else paid_at end
   where pix_id = p_pix_id
   returning user_id into v_user_id;

  if v_user_id is not null and p_status = 'PAID' then
    update public.profiles
       set paid    = true,
           paid_at = p_paid_at
     where id = v_user_id
       and paid = false;
  end if;
end;
$$;

grant execute on function public.confirm_pix_payment(text, text, timestamptz) to anon, authenticated;

comment on function public.confirm_pix_payment is
  'Marca uma cobrança Pix como paga e libera o participante (profiles.paid = true). Chamada pelo webhook da AbacatePay e pela checagem de status.';
