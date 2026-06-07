'use server'

import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { getAbacatePay, createTransparentPixCharge } from '@/lib/abacatepay'
import { revalidatePath } from 'next/cache'
import type { Payment, Settings } from '@/types'

type ActionResult =
  | { data: Payment; error: null }
  | { data: null; error: string }

function ok(data: Payment): ActionResult {
  return { data, error: null }
}

function fail(error: string): ActionResult {
  return { data: null, error }
}

export async function criarCobrancaPix(): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return fail('Você precisa estar logado.')

  const { data: profile } = await supabase
    .from('profiles')
    .select('paid, name, email')
    .eq('id', user.id)
    .single()

  if (profile?.paid) return fail('Você já é um participante confirmado.')

  // Reaproveita uma cobrança pendente e ainda válida, se existir
  const { data: pending } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (pending && pending.expires_at && new Date(pending.expires_at) > new Date()) {
    return ok(pending as Payment)
  }

  const { data: settings } = await supabase
    .from('settings')
    .select('entry_fee, site_name')
    .single()

  const s = settings as Pick<Settings, 'entry_fee' | 'site_name'> | null
  const amountCents = Math.round(Number(s?.entry_fee ?? 50) * 100)

  const createResult = await createTransparentPixCharge({
    amount: amountCents,
    expiresIn: 3600,
    description: `Inscrição — ${s?.site_name ?? 'Palpitaí'}`,
    externalId: randomUUID(),
    metadata: { userId: user.id, site: 'palpitai' },
    customer: {
      name: profile?.name || user.email || 'Participante',
      email: profile?.email || user.email || '',
    },
  })

  if (createResult.error !== null) return fail(createResult.error)
  const pix = createResult.data

  const { data: saved, error: dbError } = await supabase
    .from('payments')
    .insert({
      user_id: user.id,
      pix_id: pix.id,
      amount_cents: pix.amount,
      status: pix.status,
      br_code: pix.brCode,
      br_code_base64: pix.brCodeBase64,
      expires_at: pix.expiresAt,
    })
    .select('*')
    .single()

  if (dbError || !saved) return fail('Cobrança criada, mas houve um erro ao salvá-la. Tente novamente.')

  revalidatePath('/pagamento')
  return ok(saved as Payment)
}

export async function verificarPagamento(pixId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return fail('Você precisa estar logado.')

  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('pix_id', pixId)
    .eq('user_id', user.id)
    .single()

  if (!payment) return fail('Cobrança não encontrada.')
  if (payment.status === 'PAID') return ok(payment as Payment)

  const abacate = getAbacatePay()
  const checkResult = await abacate.pixQrCode.check({ id: pixId })
  if (checkResult.error !== null) return fail(checkResult.error)
  const pix = checkResult.data

  if (pix.status !== payment.status) {
    if (pix.status === 'PAID') {
      await supabase.rpc('confirm_pix_payment', { p_pix_id: pix.id, p_status: 'PAID' })
    } else {
      await supabase.from('payments').update({ status: pix.status }).eq('pix_id', pix.id)
    }
    revalidatePath('/pagamento')
    revalidatePath('/ranking')
  }

  const { data: updated } = await supabase
    .from('payments')
    .select('*')
    .eq('pix_id', pixId)
    .single()

  return ok((updated ?? payment) as Payment)
}
