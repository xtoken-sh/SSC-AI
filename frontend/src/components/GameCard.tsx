import { Link } from 'react-router-dom'
import type { TStory } from '../types/TStory'

type TGameCardProps = {
  story: TStory
}

function difficultyLabel(d: TStory['difficulty']): string {
  if (d === 'easy') return '简单'
  if (d === 'medium') return '中等'
  return '困难'
}

export default function GameCard({ story }: TGameCardProps) {
  return (
    <Link
      to={`/game/${story.id}`}
      className="group block rounded-xl border border-slate-800 bg-slate-950/40 p-4 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-xl active:translate-y-0 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold text-slate-100">{story.title}</div>
          <div className="mt-2 text-sm text-slate-300">
            难度：{difficultyLabel(story.difficulty)}
          </div>
        </div>

        <div className="rounded-lg bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-400">
          开始
        </div>
      </div>

      <div className="mt-3 max-h-10 overflow-hidden text-sm text-slate-300">
        {story.surface}
      </div>
    </Link>
  )
}

