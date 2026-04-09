import { useEffect, useMemo, useRef, useState } from 'react'
import type { TChatMessage } from '../types/TChat'
import Message from './Message'

type TChatBoxProps = {
  messages: TChatMessage[]
  isSending: boolean
  onSend: (question: string) => Promise<void> | void
  placeholder?: string
}

export default function ChatBox({
  messages,
  isSending,
  onSend,
  placeholder,
}: TChatBoxProps) {
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)

  const userQuestionCount = useMemo(
    () => messages.filter((m) => m.role === 'user').length,
    [messages]
  )

  const isEmptyThread = messages.length === 0

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  async function handleSubmit(): Promise<void> {
    const question = input.trim()
    if (!question) return
    if (isSending) return

    try {
      await onSend(question)
      setInput('')
    } catch {
      // 错误由页面层 Toast 处理；此处避免未捕获 Promise
    }
  }

  return (
    <div
      className="space-y-4"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-h-[min(30rem,62dvh)] overflow-y-auto overflow-x-hidden pr-1 [-webkit-overflow-scrolling:touch] sm:max-h-[28rem] md:max-h-[440px]">
        {isEmptyThread ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/30 px-4 py-8 text-center animate-fadeIn">
            <p className="text-sm font-medium text-slate-400">暂无对话</p>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
              主持人已就位。在下方输入你的第一个问题（尽量问成可以判断「是 / 否」的事实）。
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {userQuestionCount === 0 && (
              <div className="rounded-lg border border-amber-400/15 bg-amber-400/5 px-3 py-3 text-center text-xs leading-relaxed text-amber-200/90 animate-fadeIn">
                你还没有提问。试试从「谁 / 何时 / 何地 / 做了什么」切入，避免只输入一个词。
              </div>
            )}
            {messages.map((m) => (
              <Message key={m.id} message={m} />
            ))}
            <div ref={endRef} className="h-1" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
        <div className="min-w-0 flex-1">
          <label className="sr-only" htmlFor="question-input">
            输入问题
          </label>
          <input
            id="question-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder ?? '输入你的问题（例如：戒指是谁拿走的？）'}
            className="min-h-[48px] w-full rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-60 sm:min-h-[44px] sm:text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void handleSubmit()
              }
            }}
            disabled={isSending}
            enterKeyHint="send"
            autoComplete="off"
          />
        </div>
        <button
          type="button"
          onClick={() => void handleSubmit()}
          className="flex min-h-[48px] shrink-0 items-center justify-center rounded-xl bg-amber-400 px-5 text-base font-semibold text-slate-950 shadow-lg transition hover:bg-amber-300 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 sm:min-h-[44px] sm:px-6 sm:text-sm"
          disabled={isSending}
        >
          {isSending ? (
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-4 w-4 rounded-full border-2 border-slate-900/30 border-t-slate-900 animate-spin" />
              发送中
            </span>
          ) : (
            '发送'
          )}
        </button>
      </div>
    </div>
  )
}
