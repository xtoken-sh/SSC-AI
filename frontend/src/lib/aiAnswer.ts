import type { TAiAnswer } from '../types/TAiAnswer'

function normalizeText(raw: string): string {
  // 归一化：去首尾空格、去常见引号/标点中的包裹字符
  return raw
    .trim()
    .replace(/[“”‘’"']/g, '')
    .replace(/\s+/g, '')
}

export function normalizeAiAnswer(raw: string): TAiAnswer {
  const text = normalizeText(raw)
  const lower = text.toLowerCase()

  // 无关/不确定优先，避免“否定句”误判为“是”
  if (
    /无关|不相关|无法判断|不能判断|不清楚|不确定|不太确定|也许|可能|大概/.test(
      text
    ) ||
    /irrelevant|cannot\s*determine|not\s*sure|maybe|probably/.test(lower)
  ) {
    return '无关'
  }

  if (
    /不是|否|不可以|不对|不符合|不正确|不能|无法/.test(text) ||
    /no|can't|cannot|not/.test(lower)
  ) {
    return '否'
  }

  if (/是|对|可以|确认|正确|成立/.test(text) || /yes|ok|true/.test(lower)) {
    return '是'
  }

  // 匹配失败时保守返回“无关”，避免误导
  return '无关'
}

