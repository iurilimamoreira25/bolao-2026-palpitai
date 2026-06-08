'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) throw new Error('Sem permissão')
  return supabase
}

export async function createGame(formData: FormData) {
  const supabase = await assertAdmin()
  await supabase.from('games').insert({
    home_team:  formData.get('home_team')  as string,
    away_team:  formData.get('away_team')  as string,
    home_flag:  formData.get('home_flag')  as string,
    away_flag:  formData.get('away_flag')  as string,
    match_date: formData.get('match_date') as string,
    city:       (formData.get('city')       as string) || null,
    group_name: (formData.get('group_name') as string) || null,
    stage:      formData.get('stage')      as string,
  })
  revalidatePath('/admin')
  revalidatePath('/palpites')
}

export async function deleteGame(gameId: string) {
  const supabase = await assertAdmin()
  await supabase.from('games').delete().eq('id', gameId)
  revalidatePath('/admin')
  revalidatePath('/palpites')
}

export async function setResult(formData: FormData) {
  const supabase   = await assertAdmin()
  const gameId     = formData.get('game_id')     as string
  const homeScore  = Number(formData.get('home_score'))
  const awayScore  = Number(formData.get('away_score'))
  const isFinished = formData.get('is_finished') === 'true'

  await supabase.from('games').update({
    home_score:  homeScore,
    away_score:  awayScore,
    is_finished: isFinished,
  }).eq('id', gameId)

  if (isFinished) {
    await supabase.rpc('recalculate_points', { p_game_id: gameId })
  }

  revalidatePath('/admin/resultados')
  revalidatePath('/ranking')
  revalidatePath('/meus-palpites')
  revalidatePath('/palpites')
}

export async function togglePaid(userId: string, paid: boolean) {
  const supabase = await assertAdmin()
  await supabase.from('profiles').update({
    paid,
    paid_at: paid ? new Date().toISOString() : null,
  }).eq('id', userId)
  revalidatePath('/admin/participantes')
  revalidatePath('/ranking')
}

export async function updateSettings(formData: FormData) {
  const supabase = await assertAdmin()
  await supabase.from('settings').update({
    site_name:          formData.get('site_name')          as string,
    prize:              formData.get('prize')              as string,
    points_exact:       Number(formData.get('points_exact')),
    points_winner_diff: Number(formData.get('points_winner_diff')),
    points_winner:      Number(formData.get('points_winner')),
    entry_fee:          Number(formData.get('entry_fee')),
    admin_fee:          Number(formData.get('admin_fee')),
    prize_pct_1:        Number(formData.get('prize_pct_1')),
    prize_pct_2:        Number(formData.get('prize_pct_2')),
    prize_pct_house:    Number(formData.get('prize_pct_house')),
    updated_at:         new Date().toISOString(),
  }).neq('id', '00000000-0000-0000-0000-000000000000')

  revalidatePath('/regras')
  revalidatePath('/admin/settings')
}
