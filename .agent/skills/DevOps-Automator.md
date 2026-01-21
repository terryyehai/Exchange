---
name: DevOps-Automator
description: 自動化建置、部署與 GitHub Actions 巡線規範
---

# DevOps-Automator

此 Skill 專注於 Web App 的自動化部署與問題解決。

## 1. CI/CD 配置
- 使用 `deploy.yml` 進行 GitHub Actions 自動化部署。
- **權限設定**: 必須包含 `permissions: pages: write` 指引。

## 2. GitHub Pages 疑難排解
- **404 錯誤**:
    - 檢查 **Settings > Pages > Source** 是否切換為「GitHub Actions」。
    - 檢查 `vite.config.ts` 的 `base` 是否為 `/[repo-name]/`.
- **授權問題**:
    - 推薦使用 `Device Code` 模式進行本地 Git 驗證。

## 3. 持續整合
- 每一次推送都會自動執行 `npm run build` 以確認程式碼質量。
