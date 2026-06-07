import { Webhooks } from '@abacatepay/supabase'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Cadastre no painel da AbacatePay:
// https://<seu-site>/api/webhooks/abacatepay?webhookSecret=<ABACATEPAY_WEBHOOK_SECRET>
// O pacote oficial @abacatepay/supabase já cuida de: validar o webhookSecret,
// verificar a assinatura HMAC (x-webhook-signature) e validar o payload com zod.
//
// `Webhooks()` valida `secret` na hora da chamada — criamos o handler dentro de
// POST (em vez de no topo do módulo) para não derrubar o build/boot enquanto
// ABACATEPAY_WEBHOOK_SECRET ainda não estiver configurada no ambiente.
export async function POST(req: Request) {
  const handler = Webhooks({
    secret: process.env.ABACATEPAY_WEBHOOK_SECRET!,
    async onBillingPaid({ data }) {
      const { payment } = data
      const pixId = 'pixQrCode' in payment ? payment.pixQrCode.id : null
      if (!pixId) return

      await supabase.rpc('confirm_pix_payment', { p_pix_id: pixId, p_status: 'PAID' })
    },
  })

  return handler(req)
}
