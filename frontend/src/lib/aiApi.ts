import { normalizeAiAnswer } from './aiAnswer'
import type { TAiAnswer } from '../types/TAiAnswer'

type TRequestPayload = {
  surface: string
  bottom: string
  question: string
}

type TResponsePayload = {
  answer?: unknown
  error?: unknown
}

export async function requestAiAnswer(payload: TRequestPayload): Promise<TAiAnswer> {
  try {
    const resp = await fetch('/api/ai/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = (await resp.json().catch(() => ({}))) as TResponsePayload
    if (!resp.ok) {
      // 不改变 UI（仍返回无关），但方便你在控制台看到真实原因
      // eslint-disable-next-line no-console
      console.error('AI answer request failed:', resp.status, data)
      return '无关'
    }

    return normalizeAiAnswer(typeof data.answer === 'string' ? data.answer : '')
  } catch {
    return '无关'
  }
}

