import type { TChatMessage } from '../types/TChat'

const STORAGE_PREFIX = 'ssc21_turtle_game_'

function getKey(storyId: string): string {
  return `${STORAGE_PREFIX}${storyId}`
}

export function saveGameMessages(storyId: string, messages: TChatMessage[]): void {
  sessionStorage.setItem(getKey(storyId), JSON.stringify(messages))
}

export function loadGameMessages(storyId: string): TChatMessage[] {
  const raw = sessionStorage.getItem(getKey(storyId))
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    const result: TChatMessage[] = []
    for (const item of parsed) {
      if (typeof item !== 'object' || item === null) continue
      const record = item as { [key: string]: unknown }
      const role = record.role
      const content = record.content
      const id = record.id
      const at = record.at
      if (
        (role === 'user' || role === 'ai') &&
        typeof content === 'string' &&
        typeof id === 'string' &&
        typeof at === 'number'
      ) {
        result.push({ id, role, content, at })
      }
    }
    return result
  } catch {
    return []
  }
}

export function clearGameMessages(storyId: string): void {
  sessionStorage.removeItem(getKey(storyId))
}

