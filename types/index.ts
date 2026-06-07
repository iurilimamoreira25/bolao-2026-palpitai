export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Profile {
  id: string
  email: string
  name: string
  avatar_url: string | null
  is_admin: boolean
  paid: boolean
  paid_at: string | null
  created_at: string
}

export interface Game {
  id: string
  home_team: string
  away_team: string
  home_flag: string
  away_flag: string
  match_date: string
  group_name: string | null
  stage: 'group' | 'round_of_16' | 'quarter' | 'semi' | 'third' | 'final'
  home_score: number | null
  away_score: number | null
  is_finished: boolean
  created_at: string
}

export interface Prediction {
  id: string
  user_id: string
  game_id: string
  home_score: number
  away_score: number
  points: number | null
  created_at: string
  updated_at: string
  game?: Game
  profile?: Profile
}

export interface RankingEntry {
  user_id: string
  name: string
  avatar_url: string | null
  total_points: number
  exact_scores: number
  correct_winners: number
  position: number
}

export interface Settings {
  id: string
  site_name: string
  prize: string
  points_exact: number
  points_winner_diff: number
  points_winner: number
  entry_fee: number
  admin_fee: number
  prize_pct_1: number
  prize_pct_2: number
  prize_pct_house: number
  updated_at: string
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED'

export interface Payment {
  id: string
  user_id: string
  pix_id: string
  amount_cents: number
  status: PaymentStatus
  br_code: string | null
  br_code_base64: string | null
  expires_at: string | null
  paid_at: string | null
  created_at: string
}

export interface PrizeSummary {
  paid_count: number
  total_collected: number
  total_admin_fees: number
  net_prize_pool: number
  prize_1st: number
  prize_2nd: number
  prize_house: number
  entry_fee: number
  admin_fee: number
  prize_pct_1: number
  prize_pct_2: number
  prize_pct_house: number
}

export type Stage =
  | 'group'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarter'
  | 'semi'
  | 'third'
  | 'final'

export const STAGE_LABELS: Record<Stage, string> = {
  group:       'Fase de Grupos',
  round_of_32: 'Fase de 32',
  round_of_16: 'Oitavas de Final',
  quarter:     'Quartas de Final',
  semi:        'Semifinal',
  third:       'Disputa de 3º Lugar',
  final:       'Final',
}
