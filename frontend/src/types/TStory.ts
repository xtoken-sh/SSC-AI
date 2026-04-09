export type TDifficulty = 'easy' | 'medium' | 'hard'

export type TStory = {
  id: string
  title: string
  difficulty: TDifficulty
  surface: string
  bottom: string
}

