# SSC-21 后端 API 说明

Base URL（本地默认）：`http://localhost:8787`  
所有 JSON 响应（含错误）均包含 **`requestId`**（与响应头 **`X-Request-Id`** 一致），便于排障。

---

## GET `/api/test`

健康检查。

**响应 200**

```json
{
  "ok": true,
  "message": "backend is running",
  "timestamp": "2026-04-03T08:00:00.000Z",
  "requestId": "uuid"
}
```

---

## GET `/api/docs`

返回本 Markdown 文档正文（`text/markdown`）。

---

## POST `/api/chat`

海龟汤对话：根据 **汤面 + 汤底 + 用户问题** 调用 DeepSeek，返回 **是 / 否 / 无关**。

**请求** `Content-Type: application/json`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `question` | string | 是 | 用户问题 |
| `story` | object | 是 | 须含 `surface`、`bottom` 字符串 |

示例：

```json
{
  "question": "戒指在洗衣机里吗？",
  "story": {
    "id": "ring",
    "title": "失踪的戒指",
    "surface": "汤面文本…",
    "bottom": "汤底文本…",
    "difficulty": "easy",
    "category": "mystery"
  }
}
```

服务端只读取 `story.surface` 与 `story.bottom`；其余字段可一并传入（与前端 `TStory` 对齐）。

**成功 200**

```json
{
  "answer": "是",
  "requestId": "uuid"
}
```

`answer` 取值：`"是"` | `"否"` | `"无关"`。

当模型输出无法通过严格解析（且宽松提取也失败）时，服务端仍会返回 **200**，并记默认答案 **`无关`**，同时提示前端引导用户换问法：

```json
{
  "answer": "无关",
  "fallback": true,
  "hint": "本次模型输出不符合「仅一个字」的格式要求，已按规则记为「无关」。请把问题改成更短、更明确的判断句后再问（例如：「……是否……？」）。",
  "requestId": "uuid"
}
```

**错误（示例）**

| HTTP | code | 说明 |
|------|------|------|
| 400 | `INVALID_PAYLOAD` | 参数缺失或类型错误 |
| 500 | `MISSING_API_KEY` | 未配置 `DEEPSEEK_API_KEY` |
| 4xx/5xx | `UPSTREAM_ERROR` | DeepSeek 上游错误，详见 `detail` |
| 500 | `INTERNAL_ERROR` | 未预期异常，详见 `detail` |

错误体：

```json
{
  "error": "错误简述",
  "code": "INVALID_PAYLOAD",
  "requestId": "uuid",
  "detail": "可选，上游或调试信息"
}
```

---

## POST `/api/ai/answer`

兼容旧版入参（顶层 `surface` / `bottom` / `question`），可选自定义 `prompt` 覆盖服务端拼接提示词。AI 解析与 **`fallback` / `hint`** 行为与 `/api/chat` 一致。

**请求** `Content-Type: application/json`

| 字段 | 类型 | 必填 |
|------|------|------|
| `surface` | string | 是 |
| `bottom` | string | 是 |
| `question` | string | 是 |
| `prompt` | string | 否 |

**成功 200**：`{ "answer": "是|否|无关", "requestId": "..." }`，若触发 fallback 则额外包含 `fallback` 与 `hint`。

---

## 环境变量

| 变量 | 说明 |
|------|------|
| `PORT` | 监听端口，默认 `8787` |
| `CORS_ORIGIN` | 允许的前端源，默认 `http://localhost:5173` |
| `DEEPSEEK_API_KEY` | **必填**，DeepSeek API Key |
| `DEEPSEEK_API_URL` | 可选，默认 `https://api.deepseek.com/v1/chat/completions` |
| `DEEPSEEK_MODEL` | 可选，默认 `deepseek-chat` |

---

## 日志

每个请求结束时在控制台输出一行 JSON，包含 `method`、`path`、`status`、`ms`、`requestId`。
