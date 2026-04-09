import { useEffect } from 'react'

export type TToastVariant = 'error' | 'info'

type TToastProps = {
  message: string
  variant: TToastVariant
  title?: string
  /** 后端 requestId，便于对照日志 */
  requestId?: string
  onClose: () => void
  durationMs?: number
}

export default function Toast({
  message,
  variant,
  title,
  requestId,
  onClose,
  durationMs = 5600,
}: TToastProps) {
  useEffect(() => {
    const t = window.setTimeout(onClose, durationMs)
    return () => window.clearTimeout(t)
  }, [durationMs, onClose, message])

  const bar =
    variant === 'error'
      ? 'border-rose-500/45 bg-rose-950/95 text-rose-50'
      : 'border-sky-500/40 bg-slate-950/95 text-slate-100'

  const heading =
    variant === 'error'
      ? title ?? '出了点问题'
      : title ?? '提示'

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-4 pt-2 sm:pb-6 animate-slideInUp"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
      role="alert"
    >
      <div
        className={`pointer-events-auto flex max-w-lg flex-1 gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${bar}`}
      >
        <div
          className={`mt-0.5 h-8 w-1 shrink-0 rounded-full ${
            variant === 'error' ? 'bg-rose-400/90' : 'bg-sky-400/80'
          }`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide opacity-90">
            {heading}
          </div>
          <div className="mt-1 text-sm leading-snug">{message}</div>
          {requestId ? (
            <div className="mt-2 font-mono text-[10px] leading-none text-slate-400/90">
              ID {requestId}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 self-start rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 transition hover:bg-white/10 hover:text-slate-100 min-h-[32px] min-w-[32px]"
          aria-label="关闭提示"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
