# 業務管理システム 基本設計書 04_APIとデータ設計

## 1. 認証API

| メソッド | パス | 認証 | 概要 |
| --- | --- | --- | --- |
| POST | `/api/login` | 不要 | ログインする。 |
| POST | `/api/logout` | 必要 | ログアウトする。 |
| GET | `/api/me` | 必要 | ログイン中のユーザー情報を返す。 |

## 2. 業務API

| メソッド | パス | 概要 |
| --- | --- | --- |
| GET | `/api/dashboard/summary` | ダッシュボード集計を返す。 |
| GET | `/api/customers` | 顧客一覧を返す。 |
| POST | `/api/customers` | 顧客を登録する。 |
| GET | `/api/customers/{customer}` | 顧客詳細を返す。 |
| PUT/PATCH | `/api/customers/{customer}` | 顧客を更新する。 |
| DELETE | `/api/customers/{customer}` | 顧客を削除する。 |
| GET | `/api/projects` | 案件一覧を返す。 |
| POST | `/api/projects` | 案件を登録する。 |
| GET | `/api/projects/{project}` | 案件詳細を返す。 |
| PUT/PATCH | `/api/projects/{project}` | 案件を更新する。 |
| DELETE | `/api/projects/{project}` | 案件を削除する。 |
| GET | `/api/tasks` | タスク一覧を返す。 |
| POST | `/api/tasks` | タスクを登録する。 |
| GET | `/api/tasks/{task}` | タスク詳細を返す。 |
| PUT/PATCH | `/api/tasks/{task}` | タスクを更新する。 |
| DELETE | `/api/tasks/{task}` | タスクを削除する。 |

`/api/logout`、`/api/me`、`/api/dashboard/summary`、各業務APIは `auth:sanctum` によりログイン必須です。

## 3. データ構成

主要な業務データは次の関係を持ちます。

```text
users
  ├─ projects.owner_id
  └─ tasks.assignee_id

customers
  └─ projects.customer_id
        └─ tasks.project_id
```

| テーブル | 概要 |
| --- | --- |
| `users` | ログインユーザーを保存する。`role` で権限を判定する。 |
| `customers` | 顧客情報を保存する。 |
| `projects` | 顧客に紐づく案件情報を保存する。 |
| `tasks` | 案件に紐づくタスク情報を保存する。 |
| `sessions` | Cookie認証のセッション情報を保存する。 |

削除時の主な動作は次のとおりです。

- 顧客を削除すると、紐づく案件も削除される。
- 案件を削除すると、紐づくタスクも削除される。
- ユーザーを削除した場合、案件担当者やタスク担当者は `null` になる。
