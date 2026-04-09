import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { clearGameMessages, loadGameMessages } from '../lib/gameStorage'
import { clearGameStatus, setGameStatus } from '../lib/gameState'
import { getStoryById } from '../lib/stories'
import type { TChatMessage } from '../types/TChat'

export default function ResultPage() {
  const params = useParams<{ storyId: string }>()
  const storyId = params.storyId ?? ''
  const navigate = useNavigate()

  const story = useMemo(() => {
    if (!storyId) return undefined
    return getStoryById(storyId)
  }, [storyId])

  const [messages] = useState<TChatMessage[]>(() => (storyId ? loadGameMessages(storyId) : []))
  const [showHistory, setShowHistory] = useState(false)
  const [ceremonyPhase, setCeremonyPhase] = useState<'enter' | 'reveal'>('enter')

  useEffect(() => {
    if (storyId) setGameStatus(storyId, 'ended')
  }, [storyId])

  useEffect(() => {
    const t = window.setTimeout(() => setCeremonyPhase('reveal'), 420)
    return () => window.clearTimeout(t)
  }, [])

  const playerQuestionCount = useMemo(
    () => messages.filter((m) => m.role === 'user').length,
    [messages]
  )

  /** 对话历史：排除纯占位/提示类系统句，保留真实问答（可选展示仍显示完整列表更直观） */
  const historyForDisplay = useMemo(() => {
    return messages.filter((m) => {
      if (m.role === 'ai' && m.content === '思考中...') return false
      return true
    })
  }, [messages])

  function handlePlayAgainToHall(): void {
    clearGameMessages(storyId)
    clearGameStatus(storyId)
    navigate('/')
  }

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

  return (
    <div className="relative mx-auto max-w-3xl space-y-8 pb-12">
      {/* 氛围：轻晕光 */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[120%] max-w-4xl -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl"
        aria-hidden
      />
      <div
        className={`transition-opacity duration-700 ${ceremonyPhase === 'reveal' ? 'opacity-100' : 'opacity-40'}`}
      >
        <p className="text-center text-xs font-medium uppercase tracking-[0.35em] text-amber-400/80">
          谜底揭晓
        </p>
        <h1 className="mt-3 text-center text-3xl font-bold tracking-tight text-amber-400 md:text-4xl">
          {story.title}
        </h1>
        <p className="mt-3 text-center text-sm text-slate-400">
          本局提问 <span className="font-semibold text-sky-400">{playerQuestionCount}</span> 次
        </p>
      </div>

      {/* 汤底：仪式感揭晓 */}
      <section
        className={`relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-b from-slate-950/90 to-slate-900/95 p-6 shadow-lg md:p-10 ${
          ceremonyPhase === 'reveal' ? 'animate-glowPulse' : ''
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.08),transparent_55%)]"
          aria-hidden
        />
        <div className="pointer-events-none absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-amber-400/50" />
        <div className="pointer-events-none absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-amber-400/50" />
        <div className="pointer-events-none absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-amber-400/50" />
        <div className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-amber-400/50" />

        <h2 className="relative text-center text-sm font-semibold text-slate-300">汤底 · 完整真相</h2>
        <div
          className={`relative mt-6 ${
            ceremonyPhase === 'reveal' ? 'animate-revealCurtain' : 'opacity-0 blur-md'
          }`}
        >
          <p className="text-center text-lg font-medium leading-relaxed text-slate-100 md:text-xl md:leading-relaxed">
            {story.bottom}
          </p>
        </div>
      </section>

      {/* 可选：对话历史 */}
      <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 shadow-lg">
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className="flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-slate-200 hover:text-amber-400"
        >
          <span>推理对话记录 {showHistory ? '（点击收起）' : '（可选 · 点击展开）'}</span>
          <span className="text-amber-400">{showHistory ? '▲' : '▼'}</span>
        </button>
        {showHistory && (
          <div className="animate-fadeIn mt-4 max-h-80 space-y-3 overflow-y-auto rounded-lg border border-slate-800/80 bg-slate-950/50 p-3">
            {historyForDisplay.length === 0 ? (
              <p className="text-sm text-slate-500">暂无保存的聊天记录。</p>
            ) : (
              historyForDisplay.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={[
                      'max-w-[90%] rounded-lg px-3 py-2 text-sm',
                      m.role === 'user'
                        ? 'border border-amber-400/25 bg-amber-400/10 text-amber-100'
                        : 'border border-slate-700 bg-slate-900/70 text-slate-200',
                    ].join(' ')}
                  >
                    <span className="mr-2 text-[10px] font-bold uppercase text-slate-500">
                      {m.role === 'user' ? '你' : 'AI'}
                    </span>
                    <span className="whitespace-pre-wrap">{m.content}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={handlePlayAgainToHall}
          className="rounded-xl bg-amber-400 px-8 py-3 text-center text-base font-semibold text-slate-950 shadow-lg transition hover:bg-amber-300 hover:shadow-amber-400/20"
        >
          再来一局
        </button>
        <button
          type="button"
          onClick={() => {
            clearGameMessages(storyId)
            clearGameStatus(storyId)
            navigate('/')
          }}
          className="rounded-xl border border-slate-700 bg-slate-950/50 px-8 py-3 text-center text-base font-semibold text-slate-200 hover:border-slate-600"
        >
          返回大厅
        </button>
      </div>
    </div>
  )
}
