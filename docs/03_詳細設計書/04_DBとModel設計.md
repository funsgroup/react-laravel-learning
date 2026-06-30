# 業務管理システム 詳細設計書 04_DBとModel設計

## 1. users

| カラム | 型 | 内容 |
| --- | --- | --- |
| `id` | bigint | 主キー |
| `name` | string | 表示名 |
| `email` | string | ログインID、一意 |
| `email_verified_at` | timestamp nullable | メール確認日時 |
| `password` | string | ハッシュ化済みパスワード |
| `role` | string | `admin` または `staff` |
| `remember_token` | string nullable | Remember me 用トークン |
| `created_at` / `updated_at` | timestamp | 作成日時、更新日時 |

## 2. customers

| カラム | 型 | 内容 |
| --- | --- | --- |
| `id` | bigint | 主キー |
| `name` | string | 会社名 |
| `contact_name` | string nullable | 先方担当者名 |
| `email` | string nullable | メールアドレス |
| `phone` | string nullable | 電話番号 |
| `address` | string nullable | 住所 |
| `status` | string | 顧客状態 |
| `memo` | text nullable | メモ |
| `created_at` / `updated_at` | timestamp | 作成日時、更新日時 |

## 3. projects

| カラム | 型 | 内容 |
| --- | --- | --- |
| `id` | bigint | 主キー |
| `customer_id` | foreignId | 顧客ID、顧客削除時に案件も削除 |
| `owner_id` | foreignId nullable | 担当者ID、ユーザー削除時は `null` |
| `title` | string | 案件名 |
| `amount` | decimal(12,0) | 金額 |
| `status` | string | 案件状態 |
| `start_date` | date nullable | 開始日 |
| `due_date` | date nullable | 期限 |
| `description` | text nullable | 内容 |
| `created_at` / `updated_at` | timestamp | 作成日時、更新日時 |

## 4. tasks

| カラム | 型 | 内容 |
| --- | --- | --- |
| `id` | bigint | 主キー |
| `project_id` | foreignId | 案件ID、案件削除時にタスクも削除 |
| `assignee_id` | foreignId nullable | 担当者ID、ユーザー削除時は `null` |
| `title` | string | タスク名 |
| `due_date` | date nullable | 期限 |
| `status` | string | タスク状態 |
| `memo` | text nullable | メモ |
| `created_at` / `updated_at` | timestamp | 作成日時、更新日時 |

## 5. Model設計

| Model | リレーション | 補足 |
| --- | --- | --- |
| `User` | `ownedProjects()`、`assignedTasks()` | パスワードは保存時にハッシュ化される。 |
| `Customer` | `projects()` | 1顧客は複数案件を持つ。 |
| `Project` | `customer()`、`owner()`、`tasks()` | 金額は整数、日付は `Y-m-d` 形式で返す。 |
| `Task` | `project()`、`assignee()` | 期限は `Y-m-d` 形式で返す。 |
