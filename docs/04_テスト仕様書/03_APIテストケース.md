# 業務管理システム テスト仕様書 03_APIテストケース

## 1. 認証

| ID | 観点 | 前提 | 操作 | 期待結果 |
| --- | --- | --- | --- | --- |
| TC-AUTH-001 | ログイン成功 | ユーザーが存在する | 正しいメールアドレスとパスワードで `POST /api/login` | `200 OK`、ユーザー情報が返る |
| TC-AUTH-002 | ログイン失敗 | ユーザーが存在する | 誤ったパスワードで `POST /api/login` | `422 Unprocessable Entity` |
| TC-AUTH-003 | 未ログイン制御 | 未ログイン | `GET /api/customers` | `401 Unauthorized` |
| TC-AUTH-004 | ログインユーザー取得 | ログイン済み | `GET /api/me` | ログイン中ユーザーが返る |
| TC-AUTH-005 | ログアウト | ログイン済み | `POST /api/logout` | ログアウトメッセージが返る |

## 2. 権限

| ID | 観点 | 前提 | 操作 | 期待結果 |
| --- | --- | --- | --- | --- |
| TC-AUTHZ-001 | 管理者削除 | `admin` でログイン済み | 顧客、案件、タスクの `DELETE` APIを呼ぶ | 削除できる |
| TC-AUTHZ-002 | 担当者削除不可 | `staff` でログイン済み | 顧客、案件、タスクの `DELETE` APIを呼ぶ | `403 Forbidden` |
| TC-AUTHZ-003 | 画面上の削除ボタン | `staff` でログイン済み | 各一覧画面を表示 | 削除ボタンが表示されない |

## 3. 顧客管理

| ID | 観点 | 操作 | 期待結果 |
| --- | --- | --- | --- |
| TC-CUS-001 | 一覧取得 | `GET /api/customers` | `{ data: [...] }` 形式で顧客一覧が返る |
| TC-CUS-002 | 登録成功 | 必須項目を入力して `POST /api/customers` | `201 Created`、登録データが返る |
| TC-CUS-003 | 更新成功 | 既存顧客を `PUT /api/customers/{id}` | 更新後データが返る |
| TC-CUS-004 | 詳細取得 | `GET /api/customers/{id}` | 顧客と関連案件が返る |
| TC-CUS-005 | 入力エラー | 会社名を空にして登録 | `422 Unprocessable Entity` |
| TC-CUS-006 | 状態値エラー | 未定義の `status` を送信 | `422 Unprocessable Entity` |
| TC-CUS-007 | メール形式エラー | 不正なメール形式を送信 | `422 Unprocessable Entity` |

## 4. 案件管理

| ID | 観点 | 操作 | 期待結果 |
| --- | --- | --- | --- |
| TC-PRJ-001 | 一覧取得 | `GET /api/projects` | 顧客、担当者、タスク数を含む一覧が返る |
| TC-PRJ-002 | 登録成功 | 顧客、件名、金額、状態を入力して登録 | `201 Created` |
| TC-PRJ-003 | 担当者自動設定 | `owner_id` 未指定で登録 | ログイン中ユーザーが `owner_id` に設定される |
| TC-PRJ-004 | 更新成功 | 既存案件を更新 | 更新後データが返る |
| TC-PRJ-005 | 顧客存在チェック | 存在しない `customer_id` で登録 | `422 Unprocessable Entity` |
| TC-PRJ-006 | 金額エラー | `amount` に負数を指定 | `422 Unprocessable Entity` |
| TC-PRJ-007 | 日付エラー | `due_date` を `start_date` より前にする | `422 Unprocessable Entity` |

## 5. タスク管理

| ID | 観点 | 操作 | 期待結果 |
| --- | --- | --- | --- |
| TC-TSK-001 | 一覧取得 | `GET /api/tasks` | 案件、顧客、担当者を含む一覧が返る |
| TC-TSK-002 | 登録成功 | 案件、件名、状態を入力して登録 | `201 Created` |
| TC-TSK-003 | 担当者自動設定 | `assignee_id` 未指定で登録 | ログイン中ユーザーが `assignee_id` に設定される |
| TC-TSK-004 | 更新成功 | 既存タスクを更新 | 更新後データが返る |
| TC-TSK-005 | 案件存在チェック | 存在しない `project_id` で登録 | `422 Unprocessable Entity` |
| TC-TSK-006 | 状態値エラー | 未定義の `status` を送信 | `422 Unprocessable Entity` |
| TC-TSK-007 | 並び順 | 複数タスクを取得 | 期限ありを期限昇順、期限なしを後ろに表示する |

## 6. ダッシュボード

| ID | 観点 | 操作 | 期待結果 |
| --- | --- | --- | --- |
| TC-DASH-001 | 基本件数 | `GET /api/dashboard/summary` | 顧客数、案件数、未完了タスク数が返る |
| TC-DASH-002 | 案件ステータス | 複数状態の案件を作成して集計 | 状態ごとの件数が返る |
| TC-DASH-003 | 期限間近タスク | 7日以内の未完了タスクを作成 | `upcoming_tasks` に含まれる |
| TC-DASH-004 | 完了タスク除外 | `done` タスクを作成 | 未完了タスク数、期限間近タスクから除外される |
