# 02_Gitブランチ運用

## 1. この資料の目的

この資料は、複数の学習者が同じリポジトリで安全に学習するための作業手順です。

学習者ごとに専用の `develop-<氏名>` ブランチを作り、その中で課題ごとの `feature` ブランチを管理します。これにより、他の学習者の作業途中の変更と混ざりにくくなり、レビューややり直しもしやすくなります。

この資料では、奥村亮さんを例にして `okumura-ryo` という名前を使います。自分が作業するときは、必ず自分の氏名に置き換えてください。

## 2. 氏名の書き方

ブランチ名に入れる `<氏名>` は、ローマ字小文字の姓-名で書きます。

```text
okumura-ryo
```

例えば、奥村亮さんの場合は次のようなブランチ名にします。

```text
develop-okumura-ryo
feature/okumura-ryo/add-purchase-api
```

日本語の氏名やスペースは使わないでください。Git コマンドで扱いにくくなったり、入力ミスが起きやすくなったりするためです。

| 書き方 | 例 | 説明 |
|---|---|---|
| 良い例 | `okumura-ryo` | ローマ字小文字、姓と名の間は `-` |
| 避ける例 | `奥村亮` | 日本語は環境によって扱いづらいことがあります |
| 避ける例 | `Okumura Ryo` | 大文字とスペースは入力ミスの原因になります |

## 3. ブランチの役割

| ブランチ | 役割 |
|---|---|
| `main` | 安定版です。講師・管理者だけが更新します。 |
| `develop-<氏名>` | 学習者ごとの統合ブランチです。例: `develop-okumura-ryo` |
| `feature/<氏名>/<topic>` | 1 つの課題・修正ごとの作業ブランチです。例: `feature/okumura-ryo/add-purchase-api` |

既存の `develop` ブランチは残しても構いませんが、学習者の通常作業先としては使いません。

`develop/<氏名>` ではなく `develop-<氏名>` を使います。Git では `develop` というブランチがすでにある場合、`develop/okumura-ryo` のような名前のブランチを同時に作れないためです。

## 4. 初回に学習者用developブランチを作る

最初に、自分専用の `develop-<氏名>` ブランチを作ります。

```bash
git switch main
git pull origin main
git switch -c develop-okumura-ryo
git push -u origin develop-okumura-ryo
```

`okumura-ryo` の部分は、自分の氏名に置き換えてください。この操作は、講師・管理者がまとめて行っても、各学習者が自分で行っても構いません。

`git push -u origin develop-okumura-ryo` の `-u` は、手元のブランチと GitHub 側のブランチを関連付ける指定です。次回以降は、同じブランチ上で `git push` や `git pull` を短く実行しやすくなります。

## 5. 日々の作業手順

作業を始める前に、自分の `develop-<氏名>` を最新にします。

```bash
git switch develop-okumura-ryo
git pull origin develop-okumura-ryo
```

次に、課題ごとの `feature` ブランチを作ります。

```bash
git switch -c feature/okumura-ryo/add-purchase-api
```

`add-purchase-api` の部分は、作業内容が分かる短い英単語にします。例えば、README を直す場合は `update-readme`、テストを追加する場合は `add-request-test` のようにします。

1 つの `feature` ブランチでは、1 つの課題・修正だけを扱います。複数の変更をまとめすぎると、レビューする人が「どの変更を確認すればよいか」を追いにくくなります。

## 6. 変更をコミットしてpushする

作業が終わったら、変更内容を確認します。

```bash
git status
```

コードを変更した場合は、基本的にテストも実行します。このリポジトリでは `backend/` を作成した後、Laravel のテストを次のように実行できます。

```bash
docker compose run --rm backend php artisan test
```

`backend/` をまだ作成していない場合や、ドキュメントだけを変更した場合は、このコマンドを実行できない、または実行しなくてもよいことがあります。その場合は Pull Request の説明に「何を確認していないか」「なぜ確認していないか」を書きます。

コミットには、必要なファイルだけを追加します。

```bash
git add 変更したファイル名
git commit -m "変更内容が分かる短いメッセージ"
git push -u origin feature/okumura-ryo/add-purchase-api
```

`git add .` は、関係ないファイルまでまとめて追加してしまうことがあります。慣れるまでは `git status` で変更されたファイルを見て、必要なファイルだけを `git add` してください。

コミットメッセージは、あとから見た人が変更内容を思い出せる短い文にします。

```text
add customer request test
update git branch guide
fix login error message
```

## 7. Pull Requestを作る前に最新化する

Pull Request を作る前に、自分の `develop-<氏名>` の最新変更を作業ブランチへ取り込みます。

```bash
git switch develop-okumura-ryo
git pull origin develop-okumura-ryo
git switch feature/okumura-ryo/add-purchase-api
git merge develop-okumura-ryo
```

コンフリクトが出た場合は、慌てて直さず、どのファイルで起きたかを確認してから講師へ相談してください。

コンフリクトとは、同じファイルの同じ場所を複数人が変更したため、Git が自動では選べない状態のことです。無理に消したり書き換えたりすると、他の人の作業を壊してしまうことがあります。

## 8. Pull Requestを作る

GitHub で Pull Request を作成します。向きは次のようにします。

```text
base: develop-okumura-ryo
compare: feature/okumura-ryo/add-purchase-api
```

`base` は「取り込み先」、`compare` は「取り込んでほしい作業ブランチ」です。学習者の通常作業では、`main` ではなく自分の `develop-<氏名>` を `base` にします。

Pull Request の説明には、次の 2 つを書きます。

```text
何を変えたか:
どう確認したか:
```

例えば、ドキュメントを修正した Pull Request なら次のように書きます。

```text
何を変えたか:
- API 詳細のエラー説明を、HTTP ステータスごとの表に整理しました。
- 顧客、案件、タスクで使うエラー条件が分かりやすくなるようにしました。
- 基本設計書と詳細設計書の表現がずれないように確認しました。

どう確認したか:
- docs/02_基本設計書/04_APIとデータ設計.md の記述を確認しました。
- docs/03_詳細設計書/02_API詳細.md の HTTP ステータス定義を確認しました。
- ドキュメントのみの変更なので、Laravel の自動テストは実行していません。
```

確認していないことがある場合も、隠さずに「何を確認していないか」「なぜ確認していないか」を書いてください。レビューする人が残りの確認作業を判断しやすくなります。

講師または管理者のレビュー後、自分の `develop-<氏名>` にマージします。学習者同士の成果物は自動では統合せず、それぞれの `develop-<氏名>` 上で学習・レビューします。

## 9. 共通ルール

- `main` と他人の `develop-<氏名>` へ直接 push しないでください。
- 1 つの `feature` ブランチでは、1 つの課題・修正だけを扱ってください。
- 他の学習者の作業内容を取り込みたい場合は、先に講師へ相談してください。
- 共通教材や正解例として反映する変更だけ、講師・管理者が `main` へ取り込みます。
- Pull Request を作る前に、自分の `develop-<氏名>` を最新化してから作業ブランチへ取り込んでください。
- `node_modules/`、`vendor/`、`.env` など、Git 管理しないファイルをコミットしないでください。

## 10. Pull Request前の確認

Pull Request を作る前に、次の項目を確認します。

- `git status` で関係ないファイルが入っていないことを確認したか。
- `docker compose run --rm backend php artisan test` など、必要な確認を実行したか。
- README や設計書の更新が必要な変更ではないか。
- Pull Request の説明に「何を変えたか」「どう確認したか」を書いたか。
- 確認していないことがある場合、その理由を Pull Request に書いたか。
- Pull Request の向きが `base: develop-<氏名>`、`compare: feature/<氏名>/<topic>` になっているか。
