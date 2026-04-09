import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { clearGameMessages, loadGameMessages } from '../lib/gameStorage'
import { getStoryById } from '../lib/stories'

export default function BottomPage() {
  const params = useParams<{ storyId: string }>()
  const storyId = params.storyId ?? ''
  const navigate = useNavigate()

  const story = useMemo(() => {
    if (!storyId) return undefined
    return getStoryById(storyId)
  }, [storyId])

  const [messages] = useState(() => (storyId ? loadGameMessages(storyId) : []))
  const playerQuestions = useMemo(
    () => messages.filter((m) => m.role === 'user').map((m) => m.content),
    [messages]
  )

  if (!story) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-amber-400">无效的题目</h1>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-sm text-amber-400 underline"
        >
          返回大厅
        </button>
      </div>
    )
  }

  function handleRestart(): void {
    clearGameMessages(storyId)
    navigate(`/game/${storyId}`)
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 shadow-lg">
        <h1 className="text-2xl font-semibold text-amber-400">揭晓汤底</h1>
        <div className="mt-2 text-lg font-semibold text-slate-100">{story.title}</div>
        <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/30 p-4">
          <div className="text-xs font-semibold text-slate-300">汤底（完整真相）</div>
          <div className="mt-2 whitespace-pre-wrap text-sm text-slate-100">
            {story.bottom}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-slate-200">你的推理过程</h2>
          <div className="text-xs text-slate-400">提问次数：{playerQuestions.length}</div>
        </div>

        {playerQuestions.length === 0 ? (
          <div className="mt-3 text-sm text-slate-400">本局没有保存到提问内容。</div>
        ) : (
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            {playerQuestions.map((q, idx) => (
              <li key={`${idx}-${q}`} className="text-sm text-slate-200">
                {q}
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleRestart}
          className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300"
        >
          再来一局
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-lg border border-slate-800 bg-slate-950/30 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-700"
        >
          返回大厅
        </button>
      </div>
    </div>
  )
}

