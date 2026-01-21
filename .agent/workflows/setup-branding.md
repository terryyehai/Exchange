---
description: 點亮專案靈魂：自動化配置高質感 App 圖示與手機優化
---

# 品牌化配置流程 (setup-branding)

當新建專案或進行 UI 升級時，執行此流程以確保 Web App 具备「App 感」。

## 執行步驟

1. **視覺生成**：
   - 根據專案主題，呼叫 `generate_image` 生成一個正方形、簡約且高端的 App Icon。
   - 將生成結果存為或參考其風格手繪 SVG。

2. **資產部署**：
   - 將圖示檔案命名為 `apple-touch-icon.svg` (或 .png) 並移動至專案的 `public/` 目錄。

3. **HTML 注入**：
   - 檢查 `index.html` 並在 `<head>` 中插入 `Visual-Identity-Engine` 規範的 Meta 標籤。

4. **環境優化**：
   - 確保 `viewport` 的 `viewport-fit=cover` 已加入，以支援 iPhone 的劉海屏區域。

// turbo
5. **預覽確認**：
   - 提示使用者在手機端開啟並測試「加入主畫面」後的視覺效果。
