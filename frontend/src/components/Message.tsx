import type { TChatMessage } from '../types/TChat'
import LoadingSpinner from './LoadingSpinner'

type TMessageProps = {
  message: TChatMessage
}

function roleLabel(role: TChatMessage['role']): string {
  return role === 'user' ? '你' : 'AI'
}

const THINKING = '思考中...'

const AI_ANSWER = new Set(['是', '否', '无关'])

export default function Message({ message }: TMessageProps) {
  const isUser = message.role === 'user'
  const isThinking = !isUser && message.content === THINKING
  const isShortAnswer = !isUser && !isThinking && AI_ANSWER.has(message.content.trim())

  return (
    <div
      className={`${isUser ? 'flex justify-end' : 'flex justify-start'} animate-messageIn`}
    >
      {!isUser && (
        <div className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900/40 text-xs font-semibold text-amber-400 transition-transform hover:scale-105">
          AI
        </div>
      )}

      <div
        className={[
          'max-w-[85%] rounded-xl px-3 py-2.5 text-sm shadow-lg transition duration-200 active:scale-[0.99] sm:py-2',
          isUser
            ? 'bg-amber-400/15 text-amber-200 border border-amber-400/20'
            : 'bg-slate-900/60 text-slate-100 border border-slate-800',
          isThinking ? 'animate-pulse border-amber-400/20' : '',
          isShortAnswer ? 'font-semibold tracking-wide text-amber-100/95 border-amber-400/25' : '',
        ].join(' ')}
      >
        {isThinking ? (
          <LoadingSpinner label="思考中…" />
        ) : (
          <div
            className={`whitespace-pre-wrap ${isShortAnswer ? 'animate-fadeIn text-base sm:text-sm' : ''}`}
          >
            {message.content}
          </div>
        )}
      </div>

      {isUser && (
        <div className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-xs font-semibold text-amber-200 transition-transform hover:scale-105">
          {roleLabel(message.role)}
        </div>
      )}
    </div>
  )
}
