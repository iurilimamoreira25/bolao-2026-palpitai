import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Game, Prediction } from '@/types'

export function cn(...inputs: (string | undefined | null | false | 0)[]): string {
  return inputs.filter(Boolean).join(' ')
}

export function formatMatchDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd/MM · HH'h'mm", { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function formatFullDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function isGameLocked(game: Game): boolean {
  return new Date() >= new Date(game.match_date)
}

export function calcPoints(
  prediction: Pick<Prediction, 'home_score' | 'away_score'>,
  game: Pick<Game, 'home_score' | 'away_score'>,
  scoring = { exact: 10, winnerDiff: 7, winner: 5 }
): number {
  if (game.home_score === null || game.away_score === null) return 0

  const ph = prediction.home_score
  const pa = prediction.away_score
  const gh = game.home_score
  const ga = game.away_score

  if (ph === gh && pa === ga) return scoring.exact

  const predDiff = ph - pa
  const gameDiff = gh - ga
  const predWinner = Math.sign(predDiff)
  const gameWinner = Math.sign(gameDiff)

  if (predWinner === gameWinner && predDiff === gameDiff) return scoring.winnerDiff
  if (predWinner === gameWinner) return scoring.winner

  return 0
}

export function getFlagUrl(countryCode: string): string {
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
