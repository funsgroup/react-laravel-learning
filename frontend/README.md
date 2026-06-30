# React SPA

顧客・案件・タスクを管理する業務システムサンプルのフロントエンドです。Vite + React + TypeScript で構成しています。

## 役割

React 側はブラウザに表示される画面を担当します。
Laravel API から JSON を受け取り、ダッシュボード、顧客、案件、タスクの画面として表示します。

## 環境変数

```bash
VITE_API_BASE_URL=http://localhost:8000
```

`VITE_API_BASE_URL` は Laravel API の URL です。
Docker Compose で起動すると `docker-compose.yml` から自動で渡されるため、通常この値を変更する必要はありません。
完成品版 `react-laravel-complete` は、学習版と同時起動しやすいように別ポートを使います。

## 起動

このコマンドは、Laravel 学習ステップで `backend/` を作成した後に実行します。

```bash
docker compose up --build
```

このコマンドはリポジトリ直下で実行します。
React 画面、Laravel API、MySQL をまとめて起動します。
起動後は `http://localhost:5173` で React 画面を確認できます。

## よく見るファイル

- `src/App.tsx`: 画面全体、ログイン、一覧、登録・編集フォームをまとめています。
- `src/api/client.ts`: Laravel API と通信する共通処理です。
- `src/types.ts`: API から返ってくるデータの形を TypeScript の型として定義しています。
- `src/App.css`: 画面の見た目を整える CSS です。

## よく使うコマンド

型チェックと本番用ビルドの確認を行います。

```bash
docker compose run --rm --no-deps frontend npm run build
```

ESLint でコードの書き方を確認します。

```bash
docker compose run --rm --no-deps frontend npm run lint
```
