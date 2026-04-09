import type { TGameStatus } from '../types/TGameStatus'

const PREFIX = 'ssc21_game_status_'

function getKey(storyId: string): string {
  return `${PREFIX}${storyId}`
}

/** 进入对局/继续推理 */
export function setGameStatus(
  storyId: string,
  status: Exclude<TGameStatus, 'idle'>
): void {
  if (!storyId) return
  sessionStorage.setItem(getKey(storyId), status)
}

export function getGameStatus(storyId: string): TGameStatus {
  if (!storyId) return 'idle'
  const raw = sessionStorage.getItem(getKey(storyId))
  if (raw === 'playing' || raw === 'ended') return raw
  return 'idle'
}

export function clearGameStatus(storyId: string): void {
  if (!storyId) return
  sessionStorage.removeItem(getKey(storyId))
}
