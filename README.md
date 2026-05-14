# Senacare

Senacare は高単価背中ケア専門サロン向けの顧客管理プラットフォームです。来店と来店の「間」の体験
（進捗写真、施術カルテ、予約、Q&A、食事ログ＆栄養士監修）を一元化し、コース継続率と顧客単価を
最大化することを目的としています。

Phase 0 MVP のスキャフォールド版です。要件定義は `docs/requirements.md` を参照してください。

## 技術スタック

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- Supabase (Auth + Postgres + Storage + Edge Functions)
- Stripe (B2B Subscription)
- Anthropic Claude API (`claude-sonnet-4-6`)
- Vitest（コンプライアンス系ユニットテスト）

## ディレクトリ

```
src/
  app/                # Next.js App Router（ロール別レイアウト）
    (client)/c/...    # 顧客
    (therapist)/t/... # セラピスト
    (admin)/admin/... # サロン管理者
    (nutritionist)/n/...
    api/              # 認証・写真・予約・Stripe webhook 等
  components/         # UI / 機能別コンポーネント
  lib/                # Supabase / Anthropic / Stripe / コンプライアンス
  types/              # ドメインenum
supabase/
  migrations/         # 0001_init / 0002_rls / 0003_storage / 0004_audit
  functions/          # generate-meal-feedback (Edge Function)
  seed.sql            # ローカル開発用シード
docs/
  requirements.md     # 一次要件定義
```

## セットアップ

```bash
# 1. Supabase プロジェクトを用意して URL / 各 KEY を取得
# 2. .env.local を作成（.env.example をコピーして値を埋める）
cp .env.example .env.local

# 3. 依存をインストール
npm install

# 4. データベースを適用
#   - リモートに push する場合
supabase link --project-ref <your-ref>
supabase db push
#   - ローカル開発の場合
supabase start
supabase db reset

# 5. 生成型を更新
npm run db:types

# 6. 開発サーバ
npm run dev
```

## 環境変数

`.env.example` の通り。必須は以下：

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`（サーバ専用）
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_B2B_STARTER`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_APP_URL`
- `BILLING_MODE`（`B2B_ONLY` / `B2C_ONLY` / `DUAL`）

## コマンド

| コマンド | 説明 |
|---|---|
| `npm run dev` | 開発サーバ |
| `npm run build` / `npm start` | プロダクションビルド／起動 |
| `npm run typecheck` | TypeScript 型チェック |
| `npm run lint` | ESLint |
| `npm test` | Vitest（コンプライアンスフィルタ等） |
| `npm run db:types` | Supabase 型を再生成 |

## Phase 0 で「ダミー値・TODO」のまま残っている箇所

- カメラAPI（getUserMedia）と撮影ガイド線描画（`src/app/(therapist)/t/clients/[clientId]/photos/new/`）
- Stripe webhook の本番ハンドリング（`src/app/api/stripe/webhook/route.ts`）
- Edge Function `generate-meal-feedback` の自動起動（meal-log 作成時の hook）
- B2C プラン購入フロー（B2B のみ実装）
- Google Calendar / iCal エクスポート
- iOS スクリーンショット検知、画像ウォーターマーク

各箇所には `TODO(phase-0):` のコメントを残しています。

## コンプライアンス

- `src/lib/compliance/banned-words.ts` — §8.2 の禁止語リストとフィルタ
- すべての AI 生成FB は栄養士承認時に禁止語フィルタを通過必須
- 進捗写真は private bucket、署名付き URL 15分（§4.2 受入条件）
- 監査ログ：`audit_logs` テーブル + `audit_write()` トリガで主要テーブルの write を記録

## ライセンス

Proprietary — Vitality Design LLC.
