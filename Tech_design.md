# AI 海龟汤游戏 · 技术设计文档（TDD / Technical Design Document）

本技术设计文档描述 AI 海龟汤推理游戏的技术架构、核心流程、数据结构、AI 调用方式、界面与逻辑设计，供开发人员和 AI Agents 在实现过程中参考。

---

# 1. 概述（Overview）

AI 海龟汤推理游戏是一个基于 **React + TypeScript + Tailwind CSS** 的 Web 小游戏。  
玩家根据“汤面（故事表层）”进行推理，AI 扮演主持人，用 **“是 / 否 / 无关”** 回答玩家问题。

目标：
- 提供稳定、沉浸式的海龟汤推理体验  
- 使用 AI 实现自动主持  
- 构建可扩展的故事题库  
- 页面结构简洁、易维护、可扩展  

---

# 2. 技术栈（Tech Stack）

## 前端
- React + TypeScript + Vite
- Tailwind CSS
- React Router
- 状态管理：React Hooks / useContext（或 Zustand）
- Axios / fetch（AI API 调用）

## 后端（可选）
- Node.js + Express  
（前期可直接从前端调用 AI API，无后端）

## AI 模型
- DeepSeek（默认推荐）
- Claude（可选）

## 部署
- Vercel（前端）
- Railway / Render（如果后端上线）

---

# 3. 项目结构（Project Structure）