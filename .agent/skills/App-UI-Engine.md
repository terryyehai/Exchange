---
name: App-UI-Engine
description: 現代化毛玻璃視覺與高階裝置自適應設計規範
---

# App-UI-Engine

此 Skill 專注於打造具備「高級感」與「物理真實感」的現代化前端介面。

## 1. 設計語言：Glassmorphism (毛玻璃)
- **背景**: 使用透明度低的 `rgba` 與 `backdrop-filter: blur()`.
- **邊框**: 1px 的細邊框，顏色與背景微透明對應，增加立體感。
- **漸層**: 使用動態漸層作為底層背景 (例如: `linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)`).

## 2. 旗艦裝置自適應 (Responsive Breakpoints)
針對以下高階裝置進行精確優化：
- **iPhone 16 Pro Max**: `max-width: 440px`.
- **Pixel 5**: `max-width: 393px`.
- **iPad Pro 11" M4**: `min-width: 834px`, 重視欄位展開與資訊密度。

## 3. 動效引擎
- 使用 `framer-motion` 管理所有卡片載入與列表排序 (layout animation)。
- 點擊按鈕需具備物理按壓感 (`whileTap={{ scale: 0.95 }}`).
