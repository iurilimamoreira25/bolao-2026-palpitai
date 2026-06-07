'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface SavePayload {
  gameId: string
  homeScore: number
  awayScore: number
}

export async function savePrediction({ gameId, homeScore, awayScore }: SavePayload) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  // Verifica se o jogo ainda não começou
  const { data: game } = await supabase
    .from('games')
    .select('match_date')
    .eq('id', gameId)
    .single()

  if (!game || new Date() >= new Date(game.match_date)) {
    throw new Error('Jogo já começou — palpite bloqueado.')
  }

  await supabase.from('predictions').upsert(
    {
      user_id:    user.id,
      game_id:    gameId,
      home_score: homeScore,
      away_score: awayScore,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,game_id' }
  )

  revalidatePath('/palpites')
  revalidatePath('/meus-palpites')
}
