# Coffex

Coffex はコーヒー抽出ログアプリです。  
現在は以下のモノレポ構成です。

- `apps/web`: TanStack Start + React フロントエンド
- `apps/api`: Hono + Drizzle + SQLite バックエンド
- `packages/shared`: Web/API で共有する型・Zodスキーマ

## セットアップ

```bash
pnpm install
```

## 開発起動

API と Web を同時起動:

```bash
pnpm dev
```

個別起動:

```bash
pnpm dev:api
pnpm dev:web
```

デフォルトURL:

- Web: `http://127.0.0.1:3000`
- API: `http://127.0.0.1:8787`

## 環境変数

主に利用する環境変数:

- `DATABASE_URL` (api): SQLite ファイルパス（デフォルト: `./apps/api/data/coffex.db`）
- `PORT` (api): API ポート（デフォルト: `8787`）
- `VITE_API_BASE_URL` (web): API ベースURL（デフォルト: `http://127.0.0.1:8787`）

## コマンド

```bash
pnpm build
pnpm build:web
pnpm build:api

pnpm test
pnpm test:web
pnpm test:api
pnpm test:e2e
```

## DB (Drizzle)

```bash
pnpm --filter @coffex/api db:generate
pnpm --filter @coffex/api db:studio
```

## 補足

`better-sqlite3` のネイティブモジュールが環境依存で未ビルドの場合は、以下を実行してください。

```bash
pnpm rebuild better-sqlite3
```

## 開発ルール

- UI 文言は原則日本語を維持する
- 既存の shadcn/ui コンポーネントを優先して利用する
- API の入出力型は `packages/shared` の Zod スキーマを優先する
- DB は SQLite + Drizzle を前提にし、変更時は移行方針を明示する

### 変更時の最低確認

```bash
pnpm build
pnpm test:api
pnpm test:e2e
```
