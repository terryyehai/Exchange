# Exchange App 開發進度與待辦事項

## 第一階段：基礎架構與核心邏輯 (Foundation & Core)
- [x] 專案環境建置 (Vite + React + TypeScript)
- [x] 導入 Clean Architecture (Domain, UseCase, Infrastructure Layers)
- [x] 核心實體定義 (ExchangeRate, Settings)
- [x] API 串接 (Frankfurter)

## 第二階段：UI/UX 介面實作 (UI Implementation)
- [x] 主畫面貨幣清單 (Currency List)
- [x] 數字鍵盤輸入 (Numeric Keypad)
- [x] 貨幣選擇器 (Currency Picker)
- [x] 轉場動畫 (Framer Motion)

## 第三階段：進階功能 (Advanced Features)
- [x] 真實歷史匯率圖表 (Recharts)
- [x] 動態趨勢指標 (24h Change)
- [x]雲端同步邏輯 (Firebase Sync Logic)

## 待辦事項 / 建議優化 (Pending / To-Do)
- [ ] **嚴重缺失**: 需配置 `src/infrastructure/firebase.ts` 中的 Firebase Credentials (目前為 Placeholder)。
- [ ] **代碼重構**: `App.tsx` 過於龐大，建議依功能拆分為 `ListView`, `KeypadView`, `PickerView`, `ChartView` 等獨立組件。
- [ ] **錯誤處理**: 增強 Error Boundaries 與使用者友善的錯誤提示。
- [ ] **單元測試**: 目前缺乏測試代碼，建議引入 Vitest 進行關鍵邏輯測試。
- [ ] **PWA 支援**: 設定 manifest 與 service worker 以支援離線瀏覽與安裝。
