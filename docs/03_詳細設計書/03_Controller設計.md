# 業務管理システム 詳細設計書 03_Controller設計

## 1. Controller設計

| Controller | 主な責務 |
| --- | --- |
| `AuthController` | ログイン、ログアウト、ログイン中ユーザー取得 |
| `DashboardController` | ダッシュボード集計の作成 |
| `CustomerController` | 顧客の一覧、登録、詳細、更新、削除 |
| `ProjectController` | 案件の一覧、登録、詳細、更新、削除 |
| `TaskController` | タスクの一覧、登録、詳細、更新、削除 |

削除処理は `CustomerController`、`ProjectController`、`TaskController` の `destroy` で共通して `role === 'admin'` を確認します。
