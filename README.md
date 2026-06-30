# React + Laravel 業務管理サンプル

**このリポジトリは backend を自分で作る学習状態です。**

Laravel API、React SPA、MySQL 9.7.0 で構成する顧客・案件管理のサンプル業務システムです。
現在のリポジトリには `backend/` を含めていません。まず [Laravel 学習ステップ](docs/05_Laravel学習ステップ/01_学習ロードマップ.md) に沿って `backend/` を作成し、その後 Docker Compose でバックエンド、フロントエンド、データベースをまとめて起動します。

`backend/` を作成する前は、`docker compose up --build` や Laravel テストは実行できません。

## 構成

- バックエンド: 学習者が `backend/` に作成する Laravel API + Sanctum Cookie 認証。ログイン、顧客、案件、タスクの API を担当します。
- フロントエンド: React + Vite + TypeScript。ブラウザで操作する画面を担当します。
- データベース: MySQL `9.7.0`。登録した顧客、案件、タスク、ユーザーを保存します。
- 権限: `admin` / `staff`。`admin` は削除もでき、`staff` は登録・編集が中心です。

## 学習の進め方

最初に次の資料を読んで、`backend/` を作成してください。

```text
docs/05_Laravel学習ステップ/01_学習ロードマップ.md
```

仕様書の読み方や作り方を先に学びたい場合は、次の資料から始めます。

```text
docs/06_仕様書作成学習ステップ/01_仕様書作成ロードマップ.md
```

この資料では、要件定義書、基本設計書、詳細設計書、テスト仕様書をどの順番で作るか、既存の仕様書を題材にして学べます。

複数の学習者で同じリポジトリを使う場合は、作業前に [Gitブランチ運用](docs/00_導入・環境構築/02_Gitブランチ運用.md) も確認してください。

教材では、次の順番で Laravel API を作ります。

1. Laravel プロジェクトを `backend/` に作成する。
2. MySQL、Session、CORS、Sanctum を設定する。
3. ログイン、ログアウト、ログイン状態確認 API を作る。
4. 顧客、案件、タスクの Model、Migration、Factory、Seeder を作る。
5. CRUD API と削除権限チェックを作る。
6. Dashboard API を作る。
7. Feature Test と React 連携を確認する。

## 画面でできること

教材を最後まで進めると、次の操作ができる状態になります。

- ログイン・ログアウト
- 顧客の登録、編集、一覧表示、削除
- 案件の登録、編集、一覧表示、削除
- タスクの登録、編集、一覧表示、削除
- ダッシュボードで件数と期限間近のタスクを確認

削除操作は管理者だけが実行できます。担当者でログインした場合、削除ボタンは表示されません。

## 起動

この章の手順は、`backend/` を作成した後に実行します。

```bash
docker compose up --build
```

このコマンドで行われる主な処理は次のとおりです。

- MySQL コンテナを起動します。
- Laravel 用の PHP コンテナをビルドし、Composer 依存関係をインストールします。
- Laravel のアプリケーションキーを生成し、マイグレーションと初期データ投入を実行します。
- React 用の Node.js コンテナを起動し、npm 依存関係をインストールして開発サーバーを起動します。

起動後に以下へアクセスします。ブラウザで見るのは基本的に React の URL です。

- React: http://localhost:5173
- Laravel API: http://localhost:8000

停止するときは、起動中のターミナルで `Ctrl+C` を押します。コンテナを削除したい場合は次を実行します。

```bash
docker compose down
```

テスト、ビルド確認、クリーンアップなどの詳しいコマンドは [ローカル開発環境構築](docs/00_導入・環境構築/01_ローカル開発環境構築.md) にまとめています。

## 初期ログイン

教材の Seeder まで作成すると、次のユーザーでログインできます。

| 権限 | メールアドレス | パスワード |
| --- | --- | --- |
| 管理者 | `admin@example.com` | `password` |
| 担当者 | `staff@example.com` | `password` |

管理者は削除操作ができます。担当者は登録・編集のみできます。

## ディレクトリの見方

- `backend/`: 最初は存在しません。教材に沿って Laravel API のコードを作成します。
- `frontend/`: React SPA のコードです。画面、API クライアント、TypeScript の型が入っています。
- `docker/`: Docker イメージを作るための設定です。
- `docker-compose.yml`: 複数のコンテナをまとめて起動するための設定です。
- `docs/05_Laravel学習ステップ/`: `backend/` を自分で作るための教材です。
- `docs/06_仕様書作成学習ステップ/`: 要件定義書、基本設計書、詳細設計書、テスト仕様書の作り方を学ぶための教材です。

## 学習者向けメモ

- `backend/` を作る前に `docker compose up --build` を実行すると、Laravel のファイルが足りないため失敗します。
- `.env.example` は環境変数の見本です。教材で Laravel を作成すると `backend/.env.example` ができます。
- `localhost:5173` は React の画面、`localhost:8000` は Laravel API です。API の URL を直接開くと JSON が返ることがあります。
- `node_modules/` や `vendor/` は依存パッケージの置き場です。自分で編集する場所ではありません。
