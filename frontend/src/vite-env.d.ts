/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 生产环境后端根 URL，如 https://xxx.railway.app（不要尾斜杠）；不设则使用 /api/chat */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
