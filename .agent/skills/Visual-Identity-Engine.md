---
name: Visual-Identity-Engine
description: 確保 Web App 具備 PWA 級別的高感官圖示與品牌一致性規範
---

# Visual-Identity-Engine

此 Skill 確保 Web App 在安裝到手機主畫面時，具備與原生 App 同等質感的視覺表現。

## 1. 圖示規範 (Apple Touch Icon)
- **格式**: 優先使用 SVG (可無限放大且體積小)，備選為 180x180 PNG。
- **路徑**: 統存放於 `/public/apple-touch-icon.svg`。
- **設計風格**: 
  - 背景：深色漸層或品牌色。
  - 主體：簡約、高對比的 3D 感符號或品牌 Logotype。
  - 圓角：iOS 會自動處理，但設計時應預留安全區域。

## 2. HTML Meta 標籤標準表
每個新專案的 `index.html` 必須包含：
```html
<!-- iOS 主畫面圖示 -->
<link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
<!-- 狀態欄與全螢幕設定 -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<!-- 視口優化：防止縮放並支援滿版屏 (Safe Area) -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

## 3. 圖示生成指令
若無圖示，應呼叫 `generate_image` 工具並指定：
- Prompt: "Professional high-end minimalist app icon for [App Name], deep background, golden/vibrant accents, 1024x1024, no text."
