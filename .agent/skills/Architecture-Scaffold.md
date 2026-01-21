---
name: Architecture-Scaffold
description: 基於 Clean Architecture 的專案初始化與結構規範
---

# Architecture-Scaffold

此 Skill 用於快速建立高品質、可維護的 Clean Architecture 專案結構。

## 1. 目錄規範
- `src/core/domain/`: 定義 Entity 與 Repository Interface。
- `src/core/usecases/`: 封裝業務邏輯。
- `src/infrastructure/`: 實作 API 串接、LocalStorage、資料庫等外部服務。
- `src/presentation/`: React Hooks、UI 組件與設計系統。

## 2. TypeScript 編譯優化 (GitHub CI/CD 必備)
為了確保專案能順利在 CI 工具（如 GitHub Actions）中通過檢查，必須遵循：
- **Type-only Imports**: 使用 `import type { ... }` 匯入 Interface。
- **Constructor Explicit Props**: 避免在 `constructor` 中使用 `private` 參數語法，改用顯式屬性宣告以符合 `erasableSyntaxOnly: true` 設定。

## 3. 初始化清單
1. `npm create vite@latest ./`
2. 建立目錄結構 (Domain, UseCases, Infrastructure, Presentation)。
3. 配置 `vite.config.ts` 的 `base` 路徑。
