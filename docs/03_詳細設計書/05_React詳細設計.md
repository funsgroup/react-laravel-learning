# 業務管理システム 詳細設計書 05_React詳細設計

## 1. 主な状態

| state | 内容 |
| --- | --- |
| `booting` | 初回のログイン状態確認中かどうか |
| `loading` | API通信中かどうか |
| `activeTab` | 表示中タブ、`dashboard`、`customers`、`projects`、`tasks` |
| `user` | ログイン中ユーザー。未ログイン時は `null` |
| `error` | 画面に表示するエラーメッセージ |
| `dashboard` | ダッシュボード集計 |
| `customers` | 顧客一覧 |
| `projects` | 案件一覧 |
| `tasks` | タスク一覧 |
| `customerForm` | 顧客フォーム入力値 |
| `projectForm` | 案件フォーム入力値 |
| `taskForm` | タスクフォーム入力値 |
| `editingCustomerId` | 顧客編集対象ID。`null` なら新規登録 |
| `editingProjectId` | 案件編集対象ID。`null` なら新規登録 |
| `editingTaskId` | タスク編集対象ID。`null` なら新規登録 |

## 2. 主な関数

| 関数 | 内容 |
| --- | --- |
| `loadAll()` | ダッシュボード、顧客、案件、タスクを並行取得する。 |
| `login()` | CSRF Cookie取得後にログインAPIを呼ぶ。 |
| `logout()` | ログアウトAPIを呼び、画面側のデータを空にする。 |
| `saveCustomer()` | 顧客を登録または更新する。 |
| `editCustomer()` | 一覧の顧客データをフォームへ反映する。 |
| `saveProject()` | 案件を登録または更新する。 |
| `editProject()` | 一覧の案件データをフォームへ反映する。 |
| `saveTask()` | タスクを登録または更新する。 |
| `editTask()` | 一覧のタスクデータをフォームへ反映する。 |
| `destroyRecord()` | 顧客、案件、タスクの削除APIを呼ぶ。 |

## 3. APIクライアント

`frontend/src/api/client.ts` の `apiRequest()` は、Laravel APIへの通信を共通化します。

主な処理は次のとおりです。

- `Accept: application/json` を常に付ける。
- JSON送信時は `Content-Type: application/json` を付ける。
- Cookie の `XSRF-TOKEN` を読み取り、`X-XSRF-TOKEN` ヘッダーへ設定する。
- `credentials: 'include'` により Cookie を送信する。
- APIエラー時は `ApiError` を投げる。
