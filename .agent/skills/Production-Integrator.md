---
name: Production-Integrator
description: 全自動生產力數據整合與狀態管理規範
---

# Production-Integrator

此 Skill 用於整合各種生產力數據，並確保資料在實體裝置與雲端之間的一致性。

## 1. API 健壯性 (Robust Fetching)
- **axios 封裝**: 在 Infrastructure 層將 API 的原始回應轉換為 Domain Entities。
- **錯誤攔截**: 使用 `try-catch` 並轉譯為對使用者友善的中文提示。

## 2. 狀態持久化 (Persistence)
- 優先使用 `localStorage` 配合應用程式層的 UseCase 管理設定。
- 提供 `refresh` 機制，確保即時數據的手動更新能力。

## 3. 無縫存取
- 邏輯封裝在 Custom Hooks 中 (`useExchangeRate`, `useAuth` 等)，確保 UI 層不直接接觸外部 API。
