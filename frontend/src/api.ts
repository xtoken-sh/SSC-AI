import type { TStory as Story } from './types/TStory'

function getChatApiUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return `${raw.replace(/\/$/, '')}/api/chat`
  }
  return '/api/chat'
}

/** 本地：`/api/chat`（Vite 代理）；生产：在 Vercel 设置 VITE_API_BASE_URL 为后端根地址（无尾斜杠） */
const CHAT_API_URL = getChatApiUrl()

type TAiAnswer = '是' | '否' | '无关'

type TChatApiJson = {
  answer?: unknown
  fallback?: boolean
  hint?: string
  error?: string
  code?: string
  detail?: unknown
  requestId?: string
}

export type TAskAIResult = {
  answer: TAiAnswer
  /** 模型输出不规范，后端已记默认「无关」并附提示 */
  fallback?: boolean
  hint?: string
}

export class ChatApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly detail?: unknown
  readonly requestId?: string

  constructor(
    message: string,
    opts: { status: number; code?: string; detail?: unknown; requestId?: string }
  ) {
    super(message)
    this.name = 'ChatApiError'
    this.status = opts.status
    this.code = opts.code
    this.detail = opts.detail
    this.requestId = opts.requestId
  }
}

function normalizeAnswer(raw: string): TAiAnswer {
  const text = String(raw ?? '')
    .trim()
    .replace(/[“”‘’"']/g, '')
    .replace(/\s+/g, '')
  const match = text.match(/^(是|否|无关)[。．.!！?？]*$/)
  if (!match) return '无关'
  return match[1] as TAiAnswer
}

export async function askAI(question: string, story: Story): Promise<TAskAIResult> {
  let resp: Response
  try {
    resp = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, story }),
    })
  } catch {
    throw new ChatApiError('网络异常，请检查连接或后端是否在运行后重试。', {
      status: 0,
      code: 'NETWORK_ERROR',
    })
  }

  const data = (await resp.json().catch(() => ({}))) as TChatApiJson

  if (!resp.ok) {
    // eslint-disable-next-line no-console
    console.error('Chat API request failed:', resp.status, data)
    const msg =
      typeof data.error === 'string' && data.error.length > 0
        ? data.error
        : `请求失败（${resp.status}）`
    throw new ChatApiError(msg, {
      status: resp.status,
      code: typeof data.code === 'string' ? data.code : undefined,
      detail: data.detail,
      requestId: typeof data.requestId === 'string' ? data.requestId : undefined,
    })
  }

  const answer = normalizeAnswer(String(data.answer ?? ''))
  const fallback = data.fallback === true
  const hint = typeof data.hint === 'string' ? data.hint : undefined

  if (fallback) {
    return hint ? { answer, fallback: true, hint } : { answer, fallback: true }
  }
  return { answer }
}
