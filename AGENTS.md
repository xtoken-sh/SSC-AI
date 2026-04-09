# 🧠 AGENTS.md – AI 海龟汤游戏项目开发指令文档

本文件用于指导 Cursor Agents / Auto Dev / AI 协作时的开发规范，确保生成的代码一致、可维护、符合项目技术方案。

---

# 1. 项目简介
AI 海龟汤推理游戏使用以下技术栈构建：
- React + TypeScript + Vite
- Tailwind CSS
- React Router
- 状态管理：React Hooks / useContext（或 Zustand）
- AI API：DeepSeek / Claude
- 部署：Vercel

---

# 2. Agents 行为规范

## ✅ Agents 可以做：
- 创建组件（tsx）
- 创建页面（tsx）
- 编写 hooks / utils
- 实现 API 调用封装
- 重构局部代码
- 创建/更新 stories.ts（题库）
- 修复错误、类型问题
- 补充缺失的逻辑

## ❌ Agents 不允许做：
- 不得写入 API Key / 修改 `.env` 文件
- 不得推理或泄露海龟汤“汤底”
- 不得进行整个项目的全局重写（除非用户明确允许）
- 不得删除无关文件
- 不得生成与本项目无关的服务端结构

如需大规模重构，必须由用户明确授权：
“允许 Agent 进行项目级重构”

---

# 3. 代码规范

## 命名规则
- 组件名：PascalCase
- 函数名：camelCase
- Hook：useXxx
- 类型名：以 T 开头，如 `TStory`
- 常量：UPPER_SNAKE_CASE
- 文件名：组件 PascalCase.tsx / 工具 camelCase.ts

## TypeScript 规范
- 禁止 any（除非极特殊）
- 所有 props 必须有类型
- 所有 API 调用必须写明返回类型

---

# 4. UI / 设计规范

## 全局主题
- 深色悬疑风格：`bg-slate-900`
- 强调色（金色）：`text-amber-400`
- 辅助色：`sky-400`
- 圆角：`rounded-lg` 或 `rounded-xl`
- 阴影：`shadow-lg`

## 响应式
- Mobile First
- 移动端：flex-col
- PC 端：md:flex-row

Agents 必须使用 Tailwind CSS（禁止写独立 CSS 文件，除非必要）。

---

# 5. 项目结构（Agents 必须遵守）