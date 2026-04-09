const crypto = require('crypto')
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()

// 允许前端访问（默认 Vite 地址；可通过 CORS_ORIGIN 覆盖）
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'
app.use(
  cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)
app.use(express.json({ limit: '1mb' }))

function requestLogger(req, res, next) {
  const requestId = crypto.randomUUID()
  req.requestId = requestId
  res.setHeader('X-Request-Id', requestId)
  const started = Date.now()
  res.on('finish', () => {
    const line = {
      t: new Date().toISOString(),
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      ms: Date.now() - started,
    }
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(line))
  })
  next()
}

app.use(requestLogger)

/** @param {import('express').Request} req */
/** @param {import('express').Response} res */
function sendApiError(req, res, status, { code, message, detail }) {
  const body = {
    error: message,
    code,
    requestId: req.requestId,
  }
  if (detail !== undefined) body.detail = detail
  res.status(status).json(body)
}

/** @param {import('express').Request} req */
/** @param {import('express').Response} res */
/** @param {{ answer: string }} data */
function sendApiOk(req, res, data) {
  res.json({
    ...data,
    requestId: req.requestId,
  })
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {object} outcome
 */
function sendAiOutcome(req, res, outcome) {
  if (!outcome.ok) {
    sendApiError(req, res, outcome.status, {
      code: outcome.code,
      message: outcome.message,
      detail: outcome.detail,
    })
    return
  }
  const payload = { answer: outcome.answer }
  if (outcome.fallback) {
    payload.fallback = true
    payload.hint = outcome.hint
    // eslint-disable-next-line no-console
    console.warn(
      JSON.stringify({
        t: new Date().toISOString(),
        requestId: req.requestId,
        event: 'ai_answer_fallback',
        preview: String(outcome.rawModel ?? '').slice(0, 160),
      })
    )
  }
  sendApiOk(req, res, payload)
}

// 测试接口：确认服务已正常启动
app.get('/api/test', (req, res) => {
  res.json({
    ok: true,
    message: 'backend is running',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  })
})

const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions'

const FALLBACK_ANSWER = '无关'
const FALLBACK_HINT =
  '本次模型输出不符合「仅一个字」的格式要求，已按规则记为「无关」。请把问题改成更短、更明确的判断句后再问（例如：「……是否……？」）。'

function getAiAnswerPrompt(surface, bottom, question) {
  return [
    '【角色】你是海龟汤游戏主持人，只负责回答玩家提问。',
    '【已知信息】',
    '· 汤面：玩家可见的故事表层描述。',
    '· 汤底：完整真相，仅供你在内心对照判断；禁止在回复中复述、暗示或泄露汤底内容。',
    '【任务】依据汤底判断玩家问题在故事设定中是否成立。',
    '【输出规则（必须全部遵守）】',
    '1) 回复只能是以下三个汉字之一：是、否、无关。不得出现第四个汉字或英文。',
    '2) 不得输出解释、理由、标点、换行、引号、序号、前缀（如「答案是」「输出：」）。',
    '3) 「是」表示问题与汤底一致或为真；「否」表示与汤底矛盾或为假；「无关」表示问题与推理无关、无法据此判断、或不是是非题。',
    '4) 若玩家问开放式问题、闲聊、或无法只用是/否判断的事实，输出：无关。',
    '',
    '【标准示例（你的回复必须且只能是每段最后一行的一个字）】',
    '汤面：钥匙不见了。',
    '汤底：钥匙被放在抽屉里。',
    '玩家问题：钥匙在抽屉里吗？',
    '是',
    '',
    '汤面：站台有人迟到。',
    '汤底：他因改道而比其他人更早到达。',
    '玩家问题：他是不是所有人里最晚到的？',
    '否',
    '',
    '汤面：屋里传来怪声。',
    '汤底：声音来自藏在墙里的设备。',
    '玩家问题：外面天气怎么样？',
    '无关',
    '',
    '汤面：死者口袋里有纸条。',
    '汤底：纸条是死者自己写的。',
    '玩家问题：纸条是别人塞进去的吗？',
    '否',
    '',
    '汤面：门从内侧反锁。',
    '汤底：有人事先布置了机关，离开后机关落下。',
    '玩家问题：门是不是一直没人碰过？',
    '否',
    '',
    '汤面：花瓶碎了。',
    '汤底：猫碰倒的。',
    '玩家问题：是不是人为故意砸碎的？',
    '否',
    '',
    '【本题】',
    '汤面：',
    surface,
    '',
    '汤底（内化判断，禁止向玩家输出）：',
    bottom,
    '',
    '玩家问题：',
    question,
    '',
    '（只输出一个字：是、否、或 无关）',
  ].join('\n')
}

function parseStrictAnswer(text) {
  const raw = String(text ?? '').trim()
  const noQuotes = raw.replace(/[“”‘’"']/g, '')
  const compact = noQuotes.replace(/\s+/g, '')

  const match = compact.match(/^(是|否|无关)[。．.!！?？]*$/)
  if (!match) return { valid: false, answer: FALLBACK_ANSWER }
  return { valid: true, answer: match[1] }
}

/**
 * 宽松提取：严格格式失败时，尝试从首行或「答案：」类前缀中取出 是/否/无关。
 * @param {string} text
 * @returns {string | null}
 */
function tryLooseExtractAnswer(text) {
  const raw = String(text ?? '').trim()
  if (!raw) return null
  const firstLine = raw.split(/\r?\n/)[0].trim().replace(/[“”‘’"']/g, '')
  const compact = firstLine.replace(/\s+/g, '')
  const strict = compact.match(/^(是|否|无关)[。．.!！?？]*$/)
  if (strict) return strict[1]

  const prefixed = firstLine.match(
    /(?:答案|输出|回复|结果)[^:：\n]{0,24}[:：]\s*(是|否|无关)\s*$/
  )
  if (prefixed) return prefixed[1]

  const tail = firstLine.match(/(是|否|无关)\s*[。．.!！?？]*\s*$/)
  if (tail && firstLine.length <= 28) return tail[1]

  return null
}

/**
 * @param {{ surface: string, bottom: string, question: string, prompt?: string }} input
 */
async function runAiCompletion(input) {
  const { surface, bottom, question, prompt } = input
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      code: 'MISSING_API_KEY',
      message: 'Missing DEEPSEEK_API_KEY in server env',
    }
  }

  const aiPrompt = typeof prompt === 'string' ? prompt : getAiAnswerPrompt(surface, bottom, question)

  const resp = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages: [{ role: 'user', content: aiPrompt }],
      temperature: 0.1,
      max_tokens: 12,
    }),
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    return {
      ok: false,
      status: resp.status,
      code: 'UPSTREAM_ERROR',
      message: 'DeepSeek request failed',
      detail: text,
    }
  }

  const data = await resp.json()
  const raw =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.text ??
    ''

  const parsed = parseStrictAnswer(raw)
  if (parsed.valid) {
    return { ok: true, answer: parsed.answer, fallback: false }
  }

  const loose = tryLooseExtractAnswer(raw)
  if (loose) {
    return { ok: true, answer: loose, fallback: false }
  }

  // 仍不规范：默认「无关」+ 提示用户换问法（HTTP 仍 200，避免前端当错误中断游戏）
  return {
    ok: true,
    answer: FALLBACK_ANSWER,
    fallback: true,
    hint: FALLBACK_HINT,
    rawModel: raw,
  }
}

app.get('/api/docs', (req, res) => {
  try {
    const mdPath = path.join(__dirname, 'API.md')
    const text = fs.readFileSync(mdPath, 'utf8')
    res.type('text/markdown; charset=utf-8')
    res.send(text)
  } catch {
    sendApiError(req, res, 404, {
      code: 'DOCS_NOT_FOUND',
      message: 'API documentation file not found',
    })
  }
})

app.post('/api/ai/answer', async (req, res) => {
  try {
    const { surface, bottom, question, prompt } = req.body || {}
    if (typeof surface !== 'string' || typeof bottom !== 'string' || typeof question !== 'string') {
      sendApiError(req, res, 400, {
        code: 'INVALID_PAYLOAD',
        message:
          'Invalid payload: expected surface, bottom, question as strings.',
      })
      return
    }

    const outcome = await runAiCompletion({ surface, bottom, question, prompt })
    sendAiOutcome(req, res, outcome)
  } catch (e) {
    sendApiError(req, res, 500, {
      code: 'INTERNAL_ERROR',
      message: 'Server error',
      detail: String(e?.message ?? e),
    })
  }
})

app.post('/api/chat', async (req, res) => {
  try {
    const { question, story } = req.body || {}
    if (typeof question !== 'string') {
      sendApiError(req, res, 400, {
        code: 'INVALID_PAYLOAD',
        message:
          'Invalid payload: question must be a string, and story must include surface and bottom strings.',
      })
      return
    }

    if (!story || typeof story !== 'object') {
      sendApiError(req, res, 400, {
        code: 'INVALID_PAYLOAD',
        message:
          'Invalid payload: story must be an object with surface and bottom strings.',
      })
      return
    }

    const surface = story.surface
    const bottom = story.bottom
    if (typeof surface !== 'string' || typeof bottom !== 'string') {
      sendApiError(req, res, 400, {
        code: 'INVALID_PAYLOAD',
        message:
          'Invalid payload: story.surface and story.bottom must be strings.',
      })
      return
    }

    const outcome = await runAiCompletion({ surface, bottom, question })
    sendAiOutcome(req, res, outcome)
  } catch (e) {
    sendApiError(req, res, 500, {
      code: 'INTERNAL_ERROR',
      message: 'Server error',
      detail: String(e?.message ?? e),
    })
  }
})

const port = Number(process.env.PORT || 8787)
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`SSC21 backend listening on http://localhost:${port}`)
})
