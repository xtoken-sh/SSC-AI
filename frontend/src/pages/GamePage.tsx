import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getStoryById } from '../lib/stories'
import { clearGameMessages, loadGameMessages, saveGameMessages } from '../lib/gameStorage'
import { clearGameStatus, getGameStatus, setGameStatus } from '../lib/gameState'
import type { TChatMessage, TChatRole } from '../types/TChat'
import ChatBox from '../components/ChatBox'
import Toast from '../components/Toast'
import { askAI, ChatApiError } from '../api'

function createMessage(role: TChatRole, content: string): TChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    at: Date.now(),
  }
}

type TToastState = {
  variant: 'error' | 'info'
  title?: string
  text: string
  requestId?: string
}

type TAskAIErrorUi = {
  variant: 'error' | 'info'
  title?: string
  toast: string
  /** 对话里替掉「思考中…」的短句，需与 Toast 语义一致 */
  bubble: string
  requestId?: string
}

function resolveAskAIError(e: unknown): TAskAIErrorUi {
  if (e instanceof ChatApiError) {
    const base = {
      variant: 'error' as const,
      requestId: e.requestId,
    }
    switch (e.code) {
      case 'INVALID_PAYLOAD':
        return {
          ...base,
          title: '参数错误',
          toast: '请求参数不正确。请刷新页面后重试，或检查前端与后端版本是否一致。',
          bubble: '请求被拒绝：参数不合法。请刷新后重试。',
        }
      case 'MISSING_API_KEY':
        return {
          ...base,
          title: 'AI 未配置',
          toast:
            '后端未设置 DEEPSEEK_API_KEY。请在运行后端的终端配置环境变量并重启服务。',
          bubble: 'AI 服务未就绪。请配置密钥后重试。',
        }
      case 'UPSTREAM_ERROR':
        return {
          ...base,
          title: '上游服务异常',
          toast:
            'DeepSeek 接口返回错误。请稍后重试；若持续失败，检查余额、模型名与网关地址。',
          bubble: '上游暂时不可用。请稍后再试。',
        }
      case 'NETWORK_ERROR':
        return {
          ...base,
          title: '网络异常',
          toast: '无法连接到后端。请确认本机后端已启动，且 Vite 代理目标端口正确。',
          bubble: '网络异常。请检查后端与网络后重试。',
        }
      case 'INVALID_AI_FORMAT':
        return {
          ...base,
          title: '回答格式不符',
          toast:
            'AI 回复未通过格式校验（仅限「是 / 否 / 无关」）。请把问题改成更完整的判断句后再试。',
          bubble: '这次没能拿到合规回答。请换一种问法（更像判断句）后再试。',
        }
      default:
        break
    }

    const m = e.message
    if (
      m.includes('INVALID_AI_FORMAT') ||
      m.includes('INVALID_AI') ||
      e.status === 422
    ) {
      return {
        ...base,
        title: '回答格式不符',
        toast:
          'AI 回复未通过格式校验（仅限「是 / 否 / 无关」）。请把问题改成更完整的判断句后再试。',
        bubble: '这次没能拿到合规回答。请换一种问法（更像判断句）后再试。',
      }
    }
    if (m.includes('Missing') && (m.includes('KEY') || m.includes('API'))) {
      return {
        ...base,
        title: 'AI 未配置',
        toast: 'AI 服务未就绪：请在后端终端设置 DEEPSEEK_API_KEY 并重启 backend。',
        bubble: 'AI 服务未就绪。请检查后端密钥配置后重试。',
      }
    }
    if (m.includes('Balance') || m.includes('余额') || m.includes('Insufficient')) {
      return {
        ...base,
        title: '额度不足',
        toast: '账户余额或额度不足，请到 DeepSeek 控制台充值后再试。',
        bubble: '账户额度不足，暂时无法继续追问。',
      }
    }
    if (m.includes('401') || m.includes('403') || m.includes('Incorrect API key')) {
      return {
        ...base,
        title: '鉴权失败',
        toast: 'API Key 无效或未授权，请检查密钥是否正确、是否与当前接口地址匹配。',
        bubble: '授权失败。请检查 API Key 与接口地址是否匹配。',
      }
    }
    return {
      ...base,
      title: '暂时无法完成',
      toast: m || '暂时无法连接 AI，请检查网络、后端是否在运行，或稍后再试。',
      bubble: '请求失败。请稍后重试。',
    }
  }

  const m = e instanceof Error ? e.message : String(e)
  const err = { variant: 'error' as const }
  if (
    m.includes('INVALID_AI_FORMAT') ||
    m.includes('INVALID_AI') ||
    m.includes('422')
  ) {
    return {
      ...err,
      title: '回答格式不符',
      toast:
        'AI 回复未通过格式校验（仅限「是 / 否 / 无关」）。请把问题改成更完整的判断句后再试。',
      bubble: '这次没能拿到合规回答。请换一种问法（更像判断句）后再试。',
    }
  }
  if (m.includes('Missing') && (m.includes('KEY') || m.includes('API'))) {
    return {
      ...err,
      title: 'AI 未配置',
      toast: 'AI 服务未就绪：请在后端终端设置 DEEPSEEK_API_KEY 并重启 backend。',
      bubble: 'AI 服务未就绪。请检查后端密钥配置后重试。',
    }
  }
  if (m.includes('Balance') || m.includes('余额') || m.includes('Insufficient')) {
    return {
      ...err,
      title: '额度不足',
      toast: '账户余额或额度不足，请到 DeepSeek 控制台充值后再试。',
      bubble: '账户额度不足，暂时无法继续追问。',
    }
  }
  if (m.includes('401') || m.includes('403') || m.includes('Incorrect API key')) {
    return {
      ...err,
      title: '鉴权失败',
      toast: 'API Key 无效或未授权，请检查密钥是否正确、是否与当前接口地址匹配。',
      bubble: '授权失败。请检查 API Key 与接口地址是否匹配。',
    }
  }
  return {
    ...err,
    title: '暂时无法完成',
    toast: '暂时无法连接 AI，请检查网络、后端是否在运行，或稍后再试。',
    bubble: '连接失败。请检查网络与后端后重试。',
  }
}

export default function GamePage() {
  const params = useParams<{ id: string }>()
  const storyId = params.id ?? ''
  const navigate = useNavigate()

  const story = useMemo(() => {
    if (!storyId) return undefined
    return getStoryById(storyId)
  }, [storyId])

  const [messages, setMessages] = useState<TChatMessage[]>([])
  const [isSending, setIsSending] = useState(false)
  const [statusPulse, setStatusPulse] = useState(0)
  const [toast, setToast] = useState<TToastState | null>(null)

  useEffect(() => {
    if (!storyId) return
    setGameStatus(storyId, 'playing')
    setStatusPulse((n) => n + 1)
  }, [storyId])

  useEffect(() => {
    if (!storyId) return
    const stored = loadGameMessages(storyId)
    if (stored.length > 0) {
      setMessages(stored)
      return
    }
    setMessages([
      createMessage(
        'ai',
        '你好！我是主持人。请提出你的问题，我只能回答「是 / 否 / 无关」。'
      ),
    ])
  }, [storyId])

  function handleHint(): void {
    setMessages((prev) => {
      const next = [
        ...prev,
        createMessage('ai', '提示：优先问“谁/何时/何地/做了什么”，避免直接猜答案。'),
      ]
      saveGameMessages(storyId, next)
      return next
    })
  }

  async function handleSend(question: string): Promise<void> {
    if (!question) return
    if (!storyId) return
    if (!story) return

    setIsSending(true)

    const userMsg = createMessage('user', question)
    const typingMsg = createMessage('ai', '思考中...')
    const typingId = typingMsg.id

    setMessages((prev) => {
      const next = [...prev, userMsg, typingMsg]
      saveGameMessages(storyId, next)
      return next
    })

    try {
      const result = await askAI(question, story)

      setMessages((prev) => {
        const next = prev.map((m) =>
          m.id === typingId ? { ...m, content: result.answer } : m
        )
        saveGameMessages(storyId, next)
        return next
      })
      if (result.fallback && result.hint) {
        setToast({
          variant: 'info',
          title: '需要重新提问',
          text: result.hint,
        })
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Ask AI failed:', e)
      const resolved = resolveAskAIError(e)
      setToast({
        variant: resolved.variant,
        title: resolved.title,
        text: resolved.toast,
        requestId: resolved.requestId,
      })
      setMessages((prev) => {
        const next = prev.map((m) =>
          m.id === typingId ? { ...m, content: resolved.bubble } : m
        )
        saveGameMessages(storyId, next)
        return next
      })
    } finally {
      setIsSending(false)
    }
  }

  const liveStatus = storyId ? getGameStatus(storyId) : 'idle'

  function leaveToHall(): void {
    if (!storyId) return
    clearGameMessages(storyId)
    clearGameStatus(storyId)
    navigate('/')
  }

  if (!story) {
    return (
      <div className="space-y-3 animate-fadeIn">
        <h1 className="text-2xl font-semibold text-amber-400">无效的题目</h1>
        <p className="text-sm text-slate-300">该题目可能不存在或已被移除。</p>
        <Link to="/" className="text-sm text-amber-400 underline">
          返回大厅
        </Link>
      </div>
    )
  }

  return (
    <div
      className="space-y-4 pb-8 md:pb-10"
      style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 0px))' }}
    >
      {toast ? (
        <Toast
          message={toast.text}
          variant={toast.variant}
          title={toast.title}
          requestId={toast.requestId}
          onClose={() => setToast(null)}
        />
      ) : null}
      <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 shadow-lg transition-shadow hover:shadow-xl sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xl font-semibold text-slate-100">{story.title}</div>
              <span
                key={statusPulse}
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 ${
                  liveStatus === 'playing'
                    ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.15)] animate-softPulse'
                    : 'border border-slate-600 bg-slate-800/60 text-slate-400'
                }`}
              >
                {liveStatus === 'playing' ? '进行中' : liveStatus === 'ended' ? '已结束' : '未开始'}
              </span>
            </div>
            <div className="mt-2 text-sm leading-relaxed text-slate-300">
              汤面：{story.surface}
            </div>
          </div>
        </div>
      </section>

      <section
        className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 shadow-lg transition-transform duration-300 sm:p-5"
        aria-busy={isSending}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-slate-200">对话</h2>
          <button
            type="button"
            onClick={handleHint}
            disabled={isSending}
            className="min-h-[40px] rounded-lg px-2 text-xs text-slate-400 transition hover:bg-slate-800/60 hover:text-amber-200 disabled:opacity-50"
          >
            提示
          </button>
        </div>

        {isSending ? (
          <div
            className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-800/80"
            aria-hidden
          >
            <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400 to-amber-500/20 animate-loadingBar" />
          </div>
        ) : (
          <div className="mt-2 h-1" aria-hidden />
        )}

        <div className="mt-3">
          <ChatBox
            messages={messages}
            isSending={isSending}
            onSend={(q) => handleSend(q)}
          />
        </div>

        <div className="mt-3 text-xs leading-relaxed text-slate-400">
          AI 只回答「是 / 否 / 无关」。推理完成后可前往结果页揭晓汤底。
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
        <Link
          to={`/result/${story.id}`}
          onClick={() => setGameStatus(story.id, 'ended')}
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-amber-400/10 px-4 py-3 text-center text-sm font-semibold text-amber-400 transition active:scale-[0.98] hover:border hover:border-amber-400/50 sm:min-h-[44px]"
        >
          查看汤底
        </Link>
        <button
          type="button"
          onClick={leaveToHall}
          className="flex min-h-[48px] items-center justify-center rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-3 text-sm font-semibold text-slate-200 transition active:scale-[0.98] hover:border-slate-700 sm:min-h-[44px]"
        >
          结束游戏
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('确定放弃本局？未揭晓汤底的进度仍将清空。')) {
              leaveToHall()
            }
          }}
          className="flex min-h-[48px] items-center justify-center rounded-xl border border-rose-900/50 bg-rose-950/20 px-4 py-3 text-sm font-semibold text-rose-300 transition active:scale-[0.98] hover:border-rose-700/60 sm:min-h-[44px]"
        >
          放弃本局
        </button>
      </div>
    </div>
  )
}
