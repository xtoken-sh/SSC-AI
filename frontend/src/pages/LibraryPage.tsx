import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { stories } from '../lib/stories'
import type { TDifficulty } from '../types/TStory'

function difficultyLabel(d: TDifficulty): string {
  if (d === 'easy') return '简单'
  if (d === 'medium') return '中等'
  return '困难'
}

export default function LibraryPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const storyCards = useMemo(() => stories, [])

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold text-amber-400">题库</h1>
        <p className="text-sm text-slate-300">查看汤面/汤底（折叠）并开始游戏。</p>
      </section>

      <section className="grid gap-4">
        {storyCards.map((s) => {
          const expanded = expandedId === s.id
          return (
            <div
              key={s.id}
              className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 shadow-lg"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-100">
                    {s.title}
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    难度：{difficultyLabel(s.difficulty)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/game/${s.id}`}
                    className="rounded-lg bg-amber-400/10 px-3 py-2 text-sm font-semibold text-amber-400 hover:border hover:border-amber-400/50"
                  >
                    开始游戏
                  </Link>
                  <button
                    type="button"
                    onClick={() => setExpandedId((prev) => (prev === s.id ? null : s.id))}
                    className="rounded-lg border border-slate-800 bg-slate-950/30 px-3 py-2 text-sm text-slate-200 hover:border-slate-700"
                  >
                    {expanded ? '收起汤底' : '查看汤底'}
                  </button>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/20 p-3">
                <div className="text-xs font-semibold text-slate-300">汤面</div>
                <div className="mt-1 text-sm text-slate-200">{s.surface}</div>
              </div>

              {expanded && (
                <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/20 p-3">
                  <div className="text-xs font-semibold text-amber-400">汤底</div>
                  <div className="mt-1 text-sm text-slate-200">{s.bottom}</div>
                </div>
              )}
            </div>
          )
        })}
      </section>
    </div>
  )
}

