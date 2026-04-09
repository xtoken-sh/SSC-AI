export type TChatRole = 'user' | 'ai'

export type TChatMessage = {
  id: string
  role: TChatRole
  content: string
  at: number
}

