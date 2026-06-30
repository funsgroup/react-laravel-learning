# 業務管理システム 詳細設計書 02_API詳細

## 1. 共通仕様

本書では、Laravel API の各エンドポイントについて、画面から呼び出すときに必要な情報を整理します。

### 1.1 認証とCSRF

認証には Laravel Sanctum の Cookie 認証を使用します。

| 項目 | 内容 |
| --- | --- |
| ログインAPI | `/api/login` は未ログインでも呼び出せます。 |
| 業務API | `/api/logout`、`/api/me`、`/api/dashboard/summary`、顧客API、案件API、タスクAPIはログイン必須です。 |
| CSRF対策 | React 側はログイン前に `/sanctum/csrf-cookie` を呼び、取得した CSRF Cookie を使って API を呼び出します。 |
| Cookie送信 | React 側の API クライアントは `credentials: 'include'` で Cookie を送信します。 |

### 1.2 リクエストとレスポンス

リクエストとレスポンスは JSON を基本とします。

| 項目 | 内容 |
| --- | --- |
| リクエストヘッダー | `Accept: application/json` を付けます。JSONを送る場合は `Content-Type: application/json` も付けます。 |
| 単一データ | `{ "data": { ... } }` 形式で返します。 |
| 一覧データ | `{ "data": [ ... ] }` 形式で返します。 |
| 認証ユーザー | 認証APIでは `{ "user": { ... } }` 形式で返します。 |
| メッセージのみ | 削除やログアウトでは `{ "message": "..." }` 形式で返します。 |

### 1.3 共通HTTPステータス

| HTTPステータス | 主な発生条件 | 画面側の扱い |
| --- | --- | --- |
| `200 OK` | 取得、更新、削除、ログアウトに成功した場合 | レスポンス内容を画面に反映します。 |
| `201 Created` | 登録に成功した場合 | 作成されたデータを画面に反映します。 |
| `401 Unauthorized` | ログインが必要なAPIを未ログインで呼び出した場合 | ログイン画面を表示する、またはエラーとして扱います。 |
| `403 Forbidden` | 削除権限がない場合 | APIから返されたメッセージを表示します。 |
| `404 Not Found` | 存在しない顧客、案件、タスクIDを指定した場合 | 対象データが見つからないエラーとして扱います。 |
| `422 Unprocessable Entity` | 入力チェックに失敗した場合 | バリデーションエラーをフォームに表示します。 |

## 2. 認証API

| メソッド | パス | 認証 | 正常時 | 処理 |
| --- | --- | --- | --- | --- |
| POST | `/api/login` | 不要 | `200 OK` | メールアドレスとパスワードでログインします。 |
| POST | `/api/logout` | 必要 | `200 OK` | セッションを破棄してログアウトします。 |
| GET | `/api/me` | 必要 | `200 OK` | ログイン中のユーザーを返します。 |

ログイン時の入力チェックは次のとおりです。

| 項目 | 必須 | ルール |
| --- | --- | --- |
| `email` | はい | メールアドレス形式 |
| `password` | はい | 文字列 |
| `remember` | いいえ | 真偽値として扱う |

正常レスポンス例は次のとおりです。

```json
{
  "user": {
    "id": 1,
    "name": "管理者",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

認証に失敗した場合は `422 Unprocessable Entity` を返します。メールアドレス項目に「メールアドレスまたはパスワードが正しくありません。」というバリデーションエラーを設定します。

`/api/logout` と `/api/me` はログイン必須です。未ログインの場合は `401 Unauthorized` を返します。

## 3. ダッシュボードAPI

| メソッド | パス | 認証 | 正常時 | 処理 |
| --- | --- | --- | --- | --- |
| GET | `/api/dashboard/summary` | 必要 | `200 OK` | 件数、案件ステータス別件数、期限間近タスクを返します。 |

レスポンスの `data` には次の情報を含めます。

| 項目 | 内容 |
| --- | --- |
| `counts.customers` | 顧客数 |
| `counts.projects` | 案件数 |
| `counts.open_tasks` | `done` 以外のタスク数 |
| `project_statuses` | 案件ステータスごとの件数 |
| `upcoming_tasks` | 期限切れを含む、期限が7日以内で未完了のタスク最大5件 |

`upcoming_tasks` は期限日の昇順で返します。完了済みの `done` タスクと期限未設定のタスクは含めません。

正常レスポンス例は次のとおりです。

```json
{
  "data": {
    "counts": {
      "customers": 10,
      "projects": 15,
      "open_tasks": 6
    },
    "project_statuses": {
      "planned": 3,
      "in_progress": 8
    },
    "upcoming_tasks": []
  }
}
```

未ログインの場合は `401 Unauthorized` を返します。

## 4. 顧客API

| メソッド | パス | 認証 | 正常時 | 処理 |
| --- | --- | --- | --- | --- |
| GET | `/api/customers` | 必要 | `200 OK` | 顧客一覧を返します。 |
| POST | `/api/customers` | 必要 | `201 Created` | 顧客を登録します。 |
| GET | `/api/customers/{customer}` | 必要 | `200 OK` | 顧客詳細を返します。 |
| PUT/PATCH | `/api/customers/{customer}` | 必要 | `200 OK` | 顧客を更新します。 |
| DELETE | `/api/customers/{customer}` | 必要 | `200 OK` | 顧客を削除します。 |

一覧APIの検索条件は次のとおりです。

| クエリ | 内容 |
| --- | --- |
| `q` | 会社名または担当者名の部分一致検索 |
| `status` | 顧客状態で絞り込み |

一覧APIはページネーションを行わず、条件に一致する顧客をすべて返します。並び順は新しい顧客が先です。レスポンスには、顧客に紐づく案件数を `projects_count` として含めます。

登録・更新の入力チェックは次のとおりです。

| 項目 | 必須 | ルール |
| --- | --- | --- |
| `name` | はい | 文字列、255文字以内 |
| `contact_name` | いいえ | 文字列、255文字以内 |
| `email` | いいえ | メールアドレス形式、255文字以内 |
| `phone` | いいえ | 文字列、255文字以内 |
| `address` | いいえ | 文字列、255文字以内 |
| `status` | はい | `prospect`、`active`、`inactive` のいずれか |
| `memo` | いいえ | 文字列 |

正常レスポンス例は次のとおりです。

```json
{
  "data": {
    "id": 1,
    "name": "株式会社サンプル",
    "contact_name": "山田 太郎",
    "status": "active",
    "projects_count": 2
  }
}
```

詳細APIでは、顧客情報に加えて関連する案件を含めます。

削除APIは `admin` 権限のユーザーだけ実行できます。`staff` 権限の場合は `403 Forbidden` を返します。顧客を削除すると、その顧客に紐づく案件も削除されます。さらに、削除された案件に紐づくタスクも削除されます。

主なエラーは次のとおりです。

| HTTPステータス | 条件 |
| --- | --- |
| `401 Unauthorized` | 未ログインで呼び出した場合 |
| `403 Forbidden` | `admin` 以外が削除APIを呼び出した場合 |
| `404 Not Found` | 存在しない顧客IDを指定した場合 |
| `422 Unprocessable Entity` | 登録・更新時の入力チェックに失敗した場合 |

## 5. 案件API

| メソッド | パス | 認証 | 正常時 | 処理 |
| --- | --- | --- | --- | --- |
| GET | `/api/projects` | 必要 | `200 OK` | 案件一覧を返します。 |
| POST | `/api/projects` | 必要 | `201 Created` | 案件を登録します。 |
| GET | `/api/projects/{project}` | 必要 | `200 OK` | 案件詳細を返します。 |
| PUT/PATCH | `/api/projects/{project}` | 必要 | `200 OK` | 案件を更新します。 |
| DELETE | `/api/projects/{project}` | 必要 | `200 OK` | 案件を削除します。 |

一覧APIの検索条件は次のとおりです。

| クエリ | 内容 |
| --- | --- |
| `status` | 案件状態で絞り込み |
| `customer_id` | 顧客IDで絞り込み |

一覧APIはページネーションを行わず、条件に一致する案件をすべて返します。並び順は新しい案件が先です。レスポンスには、顧客、担当者、タスク数 `tasks_count` を含めます。

登録・更新の入力チェックは次のとおりです。

| 項目 | 必須 | ルール |
| --- | --- | --- |
| `customer_id` | はい | `customers.id` に存在すること |
| `owner_id` | いいえ | `users.id` に存在すること |
| `title` | はい | 文字列、255文字以内 |
| `amount` | はい | 整数、0以上 |
| `status` | はい | `planned`、`in_progress`、`completed`、`on_hold` のいずれか |
| `start_date` | いいえ | 日付 |
| `due_date` | いいえ | 日付、`start_date` 以降 |
| `description` | いいえ | 文字列 |

`owner_id` が未指定の場合、登録時はログイン中ユーザーのIDを設定します。

正常レスポンス例は次のとおりです。

```json
{
  "data": {
    "id": 1,
    "customer_id": 1,
    "owner_id": 1,
    "title": "販売管理システム導入",
    "amount": 1200000,
    "status": "planned",
    "customer": {
      "id": 1,
      "name": "株式会社サンプル"
    },
    "owner": {
      "id": 1,
      "name": "管理者"
    },
    "tasks_count": 3
  }
}
```

詳細APIでは、案件情報に加えて顧客、担当者、関連タスクとタスク担当者を含めます。

削除APIは `admin` 権限のユーザーだけ実行できます。`staff` 権限の場合は `403 Forbidden` を返します。案件を削除すると、その案件に紐づくタスクも削除されます。

主なエラーは次のとおりです。

| HTTPステータス | 条件 |
| --- | --- |
| `401 Unauthorized` | 未ログインで呼び出した場合 |
| `403 Forbidden` | `admin` 以外が削除APIを呼び出した場合 |
| `404 Not Found` | 存在しない案件IDを指定した場合 |
| `422 Unprocessable Entity` | 登録・更新時の入力チェックに失敗した場合 |

## 6. タスクAPI

| メソッド | パス | 認証 | 正常時 | 処理 |
| --- | --- | --- | --- | --- |
| GET | `/api/tasks` | 必要 | `200 OK` | タスク一覧を返します。 |
| POST | `/api/tasks` | 必要 | `201 Created` | タスクを登録します。 |
| GET | `/api/tasks/{task}` | 必要 | `200 OK` | タスク詳細を返します。 |
| PUT/PATCH | `/api/tasks/{task}` | 必要 | `200 OK` | タスクを更新します。 |
| DELETE | `/api/tasks/{task}` | 必要 | `200 OK` | タスクを削除します。 |

一覧APIの検索条件は次のとおりです。

| クエリ | 内容 |
| --- | --- |
| `status` | タスク状態で絞り込み |
| `project_id` | 案件IDで絞り込み |

一覧APIはページネーションを行わず、条件に一致するタスクをすべて返します。並び順は、期限ありのタスクを期限日の昇順にし、期限なしのタスクは後ろに表示します。同じ条件の中では新しいタスクが先です。レスポンスには、案件、顧客、担当者を含めます。

登録・更新の入力チェックは次のとおりです。

| 項目 | 必須 | ルール |
| --- | --- | --- |
| `project_id` | はい | `projects.id` に存在すること |
| `assignee_id` | いいえ | `users.id` に存在すること |
| `title` | はい | 文字列、255文字以内 |
| `due_date` | いいえ | 日付 |
| `status` | はい | `todo`、`doing`、`done` のいずれか |
| `memo` | いいえ | 文字列 |

`assignee_id` が未指定の場合、登録時はログイン中ユーザーのIDを設定します。

正常レスポンス例は次のとおりです。

```json
{
  "data": {
    "id": 1,
    "project_id": 1,
    "assignee_id": 1,
    "title": "初回打ち合わせ",
    "due_date": "2026-07-10",
    "status": "todo",
    "project": {
      "id": 1,
      "title": "販売管理システム導入",
      "customer": {
        "id": 1,
        "name": "株式会社サンプル"
      }
    },
    "assignee": {
      "id": 1,
      "name": "管理者"
    }
  }
}
```

削除APIは `admin` 権限のユーザーだけ実行できます。`staff` 権限の場合は `403 Forbidden` を返します。タスク削除では、指定したタスクだけを削除します。

主なエラーは次のとおりです。

| HTTPステータス | 条件 |
| --- | --- |
| `401 Unauthorized` | 未ログインで呼び出した場合 |
| `403 Forbidden` | `admin` 以外が削除APIを呼び出した場合 |
| `404 Not Found` | 存在しないタスクIDを指定した場合 |
| `422 Unprocessable Entity` | 登録・更新時の入力チェックに失敗した場合 |
