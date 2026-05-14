# Senacare（仮称）顧客管理サービス 要件定義書 v0.1

> **想定読者**: Claude Code（開発エージェント）／開発担当者
> **作成**: Vitality Design LLC
> **作成日**: 2026/05/14
> **ステータス**: 初版ドラフト（未決事項あり、§11.2 参照）

---

## 0. このドキュメントの使い方（Claude Code向け）

- 本書は MVP 構築前の一次情報。実装の細部は Claude Code の判断に委ねる。
- ただし要件・受入条件・法務制約は本書を**最優先**で参照すること。
- 未決事項（§11.2）は実装着手前にユーザー（事業オーナー）に確認すること。勝手に仮決定して進めない。
- 既存設計判断（Supabase + Next.js）は原則維持。変更提案は理由とともに事前提示。

---

## 1. プロダクト概要

### 1.1 仮称
`Senacare`（要協議）

### 1.2 1行で言うと
高単価背中ケア専門サロン向け、**来店と来店の「間」の体験**を設計してコース継続率と顧客単価を最大化する顧客管理プラットフォーム。

### 1.3 中核仮説
来店時の施術品質は変えなくていい。施術と施術の間に発生する「自分の背中が見えない」「聞きにくい」「忘れる」「面倒」「不安」をデジタルで埋めれば、完遂率・LTV・改善率エビデンスが同時に伸びる。

### 1.4 対象事業
- 第一導入候補: 株式会社carat（なめらかせなか®）
- 想定業態: Before/After 訴求型の高単価特化サロン
- コース単価レンジ: ¥30万〜
- 顧客接点期間: 1.5ヶ月〜12ヶ月

---

## 2. 事業背景

### 2.1 解決する課題

**顧客側**
1. コース進行中、自分の背中が改善しているか自分では見えない
2. 来店間で出た疑問の聞き先がない／LINEは聞きにくい
3. 食事・生活習慣との関連を知りたいが個別アドバイスがない
4. 次回予約の調整が手間（電話・LINE経由）

**サロン側**
1. 顧客カルテが紙・LINE・各セラピスト個人スマホに分散、属人化
2. セラピスト退職時に顧客資産が消える
3. コース完遂率がセラピスト個別のフォロー力に依存
4. 改善率95% の定量エビデンスが資産化されていない
5. 業務時間外の顧客対応がセラピスト個人のLINEに貼り付く

### 2.2 ビジネスモデル（3パターン）

| パターン | 課金主体 | 月額目安 | 想定収益源 |
|---|---|---|---|
| A | サロン（B2B単独） | ¥30,000〜100,000/店舗 | プラットフォーム利用料 |
| B | 顧客（B2C単独） | ¥5,000〜8,000/人 | 上位機能利用料 |
| **C: ダブルレイヤー（推奨）** | サロン + 顧客 | A + B | A + B + レベニューシェア |

**本要件定義は Pattern C を主とする**。ただし、アーキテクチャは以下を満たすこと：
- 課金モジュールは feature flag (`BILLING_MODE = "B2B_ONLY" | "B2C_ONLY" | "DUAL"`) で挙動切替可能
- B2C課金 OFF 時、上位機能（食事ログ等）は SalonAdmin が顧客単位で有効化できる
- 単独パターン運用にいつでも縮退可能

### 2.3 想定 KPI（初年度）
- 導入サロン数: 1 → 3〜5
- 利用顧客数（caratベース）: 月間 100〜300人
- B2C上位プラン加入率: 20〜40%
- コース完遂率: ベースライン比 +15pt
- 食事ログ月次継続率: 60% 以上

---

## 3. ユーザーロール

| ロール | 主な行動 |
|---|---|
| **Client** | 進捗閲覧、予約調整、食事ログ提出、Q&A |
| **Therapist** | 施術記録入力、写真アップロード、顧客Q&A応答 |
| **SalonAdmin** | スタッフ管理、予約全体管理、KPI閲覧、料金設定 |
| **Nutritionist** | 食事ログのレビュー、AI生成FBの監修・承認 |
| **SuperAdmin** | 全テナント管理、課金管理、システム監査 |

### 権限ポリシー（Supabase RLS で実装）
- Client: 自分のデータのみ R/W
- Therapist: 担当 Client のデータのみ R/W、他 Therapist の顧客は閲覧不可
- SalonAdmin: 自店舗内の全データ R/W
- Nutritionist: 自分が監修担当の食事ログのみ R/W
- SuperAdmin: 全データ閲覧可、write は監査ログ必須

---

## 4. 機能要件

### 4.1 認証・プロフィール

#### 4.1.1 サインアップ／ログイン
- 方式: メール + パスワード（Phase 0）、Magic Link（Phase 0）、LINEログイン（Phase 1）
- **招待制**: Client は SalonAdmin が発行した招待リンクからのみ登録可
- Therapist も SalonAdmin の招待リンクから登録

#### 4.1.2 プロフィール
- 共通: 氏名、メール、電話、生年月日
- Client 追加: 性別、肌タイプ、悩み履歴、契約コース、担当 Therapist
- Therapist 追加: 所属店舗、保有資格

**受入条件**
- 招待リンクなしで Client がセルフ登録できない
- 招待リンクは72時間で失効
- パスワード要件: 8文字以上、英数字混在

---

### 4.2 進捗管理（背中写真）— **最重要機能**

#### 4.2.1 写真撮影（Therapist 側）
- アプリ内カメラから直接撮影
- **撮影ガイド**: 画面に距離マーク・角度ガイドラインを表示し、毎回同条件で撮影
- 自動で当該 Client の進捗タイムラインに紐付け
- 1施術あたり最低2枚（施術前・施術後）、最大10枚

#### 4.2.2 進捗閲覧（Client 側）
- **タイムライン UI**: 縦スクロール時系列、各写真に施術日・施術内容併記
- **比較ビュー**: 任意の2時点を選択して左右並列表示
- **自己評価**: 各写真に対し1-5スケールで「自覚改善度」をタップ入力

#### 4.2.3 自己セルフログ（Client が来店間に記録）
- 写真は任意（自撮り困難なため）
- 必須項目: 痒み (1-5)、赤み (1-5)、新規吹き出物の有無
- 頻度: 任意、リマインダー通知あり

**受入条件**
- 写真は AES-256 で暗号化保存
- 写真 URL は署名付き、有効期限15分
- Client 退会時、写真は30日後に物理削除（バックアップからも消去）
- Therapist は担当外 Client の写真にアクセス不可（RLSで担保）

#### 4.2.4 セキュリティ要件（特記）
- 背中写真は**要配慮個人情報相当**として扱う
- public bucket には絶対に置かない
- 端末ダウンロード時はウォーターマーク（顧客名 + 日時）付与
- iOS: スクリーンショット検知時に警告通知

---

### 4.3 予約管理（コース理解型）

#### 4.3.1 基本予約
- Client が空き枠から選択 → Therapist 確認 → 確定
- カレンダー連携: Google Calendar、iCal エクスポート
- リマインダー通知: 前日・当日2時間前

#### 4.3.2 コース理解型推奨（差別化機能）
- Client がコース契約済の場合、システムが次回最適予約日を算出
- 算出ロジック: コース定義の推奨間隔 ± Therapist 裁量幅
- 「次回推奨枠」を UI 上でハイライト表示

#### 4.3.3 来店時クロージング導線
- 施術終了後、Therapist が Client と一緒にその場で次回予約確定
- ワンタップで次回推奨3スロット → 確定（1分以内）

**受入条件**
- 同一時間帯・同一 Therapist の重複予約が物理的に作成不可
- 既存予約システム（リザービア等）から CSV インポート可能

---

### 4.4 食事ログ＆AIフィードバック（B2C上位プラン）

**このモジュールは課金顧客のみ利用可。feature flag で完全 OFF も可能。**

#### 4.4.1 食事ログ提出
- 写真 + テキストメモ + タグ（朝/昼/夜/間食）
- 1日最大5件
- 過去ログのタイムライン閲覧

#### 4.4.2 AIフィードバック生成
- **Anthropic Claude API** で一次FB生成（モデル: claude-sonnet-4-6）
- プロンプトは管理栄養士監修済みテンプレートから組み立て
- **絶対禁止表現**: 「治る」「効く」「改善する」「治療」「効能」「効果がある」
- **許容表現**: 「健康的な習慣作りをサポート」「肌コンディションに配慮した」「一般的な栄養バランスの観点で」

#### 4.4.3 栄養士監修フロー
- AI生成FB → Nutritionist のレビュー画面に流れる
- Nutritionist が承認 or 修正 → Client に送信
- SLA: 提出から48時間以内
- 頻出パターンは Nutritionist が「自動承認テンプレ」を登録可

#### 4.4.4 法務制約（厳守）
- 個別の医療的助言は不可
- すべての送信前メッセージは禁止語フィルタを通過必須
- すべてのFB末尾に定型免責文を自動付与
> 例: 「本情報は一般的な栄養に関する参考情報であり、医療上の助言ではありません。症状がある場合は医師にご相談ください。」

**受入条件**
- 禁止語が含まれるFBは送信ブロック + Nutritionist 再レビュー必須
- Nutritionist の監修者名・資格番号が各FBに紐付け記録
- 監査ログで「いつ・誰が・何を承認したか」追跡可能

---

### 4.5 Q&A機能

#### 4.5.1 スレッド型コミュニケーション
- Client → 担当 Therapist にメッセージ送信
- テキスト、画像対応
- 既読表示

#### 4.5.2 営業時間外対応
- 営業時間外メッセージには自動応答「次の営業日にお返事します」
- Phase 1: AI一次応答（FAQマッチング）

#### 4.5.3 FAQ自動化（Phase 1）
- 過去Q&Aから頻出質問を抽出し、SalonAdmin に FAQ候補を提示
- 承認後、新規 Client が同じ質問を投げる前に「もしかしてこれ？」表示

**受入条件**
- 営業時間設定が SalonAdmin 画面で変更可能
- LINE公式アカウント連携は Phase 2

---

### 4.6 顧客カルテ（施術記録）

**セラピスト退職時の資産散逸防止が最大目的。**

#### 4.6.1 施術記録入力
- 必須: 施術日、施術内容、使用製品、肌コンディション所見、次回プラン
- 任意: 顧客との会話メモ、注意事項
- 入力時間目標: 1施術あたり90秒以内（UI設計の最大制約）

#### 4.6.2 記録閲覧権限
- 担当 Therapist: 自分が担当した記録の R/W
- 引継ぎ後の Therapist: 過去記録は閲覧のみ、編集不可
- SalonAdmin: 全閲覧可

#### 4.6.3 引継ぎフロー
- SalonAdmin が担当変更操作 → 旧担当の編集権剥奪、新担当に閲覧+今後の編集権付与
- 引継ぎメモ機能（旧担当 → 新担当への申し送り）

**受入条件**
- Therapist 退職フラグを立てた瞬間、新規ログイン不可
- ログイン不可後も、過去入力データは閲覧・監査可能

---

### 4.7 課金・サブスク管理

#### 4.7.1 B2B課金（サロン側）
- Stripe Subscription
- プラン例（要協議）: Starter（〜50顧客）、Standard（〜200）、Pro（無制限）
- 請求書・領収書PDF発行

#### 4.7.2 B2C課金（顧客側）
- Stripe Subscription（月額）
- Phase 0: カード決済のみ
- Phase 2: LINE Pay 対応
- いつでも解約可、解約時は当月末まで利用可

#### 4.7.3 レベニューシェア
- B2C課金収益のうち、サロンに一定%（デフォルト30%、要協議）を自動振分
- 月次精算、SaaS提供者経由でサロンに振込

**受入条件**
- 課金失敗時のリトライ: 3日後、7日後の2回
- 2回失敗で自動的にプラン無効化、Free機能のみ利用可

---

### 4.8 管理画面・ダッシュボード

#### 4.8.1 SalonAdmin ダッシュボード
- 当日来店一覧
- 当月KPI: 新規顧客数、コース成約数、完遂率、食事プラン加入率
- セラピスト別パフォーマンス
- 要対応Q&Aアラート

#### 4.8.2 SuperAdmin 画面
- テナント一覧
- 課金状況
- システム監査ログ
- 障害アラート

---

## 5. データモデル（概要）

主要テーブル（PostgreSQL / Supabase 想定、命名 snake_case）:

```
organizations           (id, name, plan, billing_mode, ...)
locations               (id, organization_id, address, ...)
users                   (id, email, role, organization_id, status, ...)
profiles                (user_id, name, phone, birthdate, ...)
clients                 (id, user_id, location_id, primary_therapist_id, skin_type, ...)
therapists              (id, user_id, location_id, status, hire_date, ...)
nutritionists           (id, user_id, license_number, ...)
course_templates        (id, organization_id, name, sessions, recommended_interval_days, ...)
client_courses          (id, client_id, course_template_id, started_at, status, ...)
appointments            (id, client_id, therapist_id, scheduled_at, status, ...)
treatment_records       (id, appointment_id, therapist_id, notes, products_used, next_plan, ...)
progress_photos         (id, client_id, appointment_id, photo_url, taken_at, photo_type, ...)
self_logs               (id, client_id, logged_at, itch_score, redness_score, ...)
meal_logs               (id, client_id, photo_url, memo, meal_type, logged_at, ...)
meal_feedbacks          (id, meal_log_id, ai_draft, nutritionist_id, approved_at, final_text, status, ...)
conversations           (id, client_id, therapist_id, ...)
messages                (id, conversation_id, sender_id, body, image_url, created_at, read_at, ...)
subscriptions           (id, subject_type, subject_id, plan, status, stripe_subscription_id, ...)
revenue_shares          (id, organization_id, b2c_subscription_id, percent, settled_at, ...)
audit_logs              (id, actor_id, action, target_type, target_id, metadata, created_at, ...)
```

詳細スキーマは Claude Code が初期マイグレーションとして提案する。

**RLS（Row Level Security）は全テーブルで必須**、ロール別アクセス制御を Supabase ネイティブ機能で実装。

---

## 6. 非機能要件

### 6.1 パフォーマンス
- 画面遷移: 2秒以内
- 写真アップロード（5MB相当）: 10秒以内
- AIFB生成: 30秒以内（非同期可、Edge Function 推奨）

### 6.2 セキュリティ
- 全通信 HTTPS
- 認証: Supabase Auth（JWT）
- 写真ストレージ: Supabase Storage、署名付きURL（15分）
- 個人情報暗号化: at rest で AES-256
- 監査ログ: 全write操作を記録、90日保持

### 6.3 可用性
- 稼働率目標: 99.5%（月間ダウンタイム3.6時間以内）
- バックアップ: 日次自動、7日保持

### 6.4 スケーラビリティ
- マルチテナント前提（organization単位で論理分離、RLSで担保）
- 想定スケール: テナント50社、顧客10,000人、施術記録100,000件、写真500,000枚

---

## 7. 技術スタック（推奨）

| レイヤ | 技術 |
|---|---|
| フロントエンド | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| 状態管理 | React Query, Zustand（必要時） |
| バックエンド | Supabase (Auth + DB + Storage + Edge Functions) |
| DB | PostgreSQL (Supabase) |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| 決済 | Stripe |
| ホスティング | Vercel |
| モニタリング | Sentry, Vercel Analytics |
| バックグラウンドジョブ | Supabase Edge Functions + Cron |
| 画像処理 | Sharp（リサイズ・ウォーターマーク） |

**変更の余地**: shadcn/ui の代替は許容。Supabase + Next.js の組合せは原則維持（既存ナレッジ資産活用のため）。

---

## 8. 法務・コンプライアンス

### 8.1 関連法規
- **個人情報保護法**（特に背中写真は要配慮個人情報相当）
- **薬機法**（医薬品医療機器等法）— 効能効果を謳う表現は全面禁止
- **健康増進法** — 食事FBで疾病治癒を謳わない
- **景品表示法** — 「改善率95%」等の表現は別途立証エビデンス必要（実装側ではコピー制御のみ）

### 8.2 表現ガイドライン（CMS実装必須）
- AI生成FB・Q&A応答は禁止語フィルタを必須通過
- 禁止語リストの初期版（拡張前提）:

```
治る / 治す / 治癒 / 改善する / 効く / 効能 / 効果がある / 効果的
完治 / 必ず / 絶対 / 〜が消える / 〜が無くなる / 医薬品同等
ニキビが治る / 肌荒れが治る / 〜の治療
```

### 8.3 個人情報取扱い
- 利用規約・プライバシーポリシーは**法律事務所レビュー前提**（実装より先に文面確定が望ましい）
- 退会時、写真を含む個人データは30日後完全削除（バックアップからも消去）
- 監査ログのみ法的保管義務年数（最低5年）保持

---

## 9. MVP範囲（Phase 0）

**目標期間: 6〜8週間**

### Must（MVP必須）
- 認証（招待制 Client / Therapist / SalonAdmin の3ロール）
- 進捗写真アップロード（Therapist）・閲覧（Client）
- 比較ビュー（2時点並列）
- 基本予約（コース理解型推奨は Phase 1）
- Q&A（人手応答のみ、AIなし）
- 顧客カルテ（施術記録の入力・閲覧）
- SalonAdmin ダッシュボード（当日来店、顧客一覧）
- B2B課金（Stripe Subscription、Starterプラン1つ）

### Should（Phase 1：MVP後 8〜12週）
- 食事ログ + AIFB + 栄養士監修
- コース理解型予約推奨
- B2C課金
- セルフログ（痒み・赤み）

### Could（Phase 2：MVP後 12週〜）
- LINEログイン、LINE連携
- マルチサロン対応強化（SaaS化のための SuperAdmin 強化）
- 物販管理
- レポート分析機能
- AI Q&A一次応答

### Won't（今回は対象外）
- ネイティブモバイルアプリ（PWAで対応）
- 多言語対応
- ヘアサロン等別業態テンプレート

---

## 10. スコープ外
- 既存予約システム（リザービア等）の完全リプレース
- 会計ソフト連携（freee等）
- ECサイト機能（物販はカルテ記録までで完結）
- ブログ・コンテンツ配信機能

---

## 11. リスクと未決事項

### 11.1 主要リスク
- **写真の取扱い**: セキュリティ事故が起きると事業終了レベル。RLS・暗号化・署名付きURL を最初から徹底
- **食事FB法務リスク**: 健康増進法違反は刑事罰の可能性。禁止語フィルタは初日から必須
- **サロン側ITリテラシー**: 導入摩擦の見積もり要。UI は徹底的にシンプルに

### 11.2 未決事項（事業オーナーに確認すべき項目）

| # | 項目 | 仮置き | 確認優先度 |
|---|---|---|---|
| 1 | プロダクト正式名 | Senacare | 高 |
| 2 | レベニューシェア比率 | 30%（サロン取分） | 高 |
| 3 | 栄養士の契約形態 | 業務委託 | 中 |
| 4 | 既存予約システムの有無・継続使用可否 | 不明 | 高 |
| 5 | 初期導入店舗数 | carat単店 | 高 |
| 6 | B2C上位プラン価格 | ¥5,000/月 | 中 |
| 7 | データ保持ポリシー | 退会後30日削除 | 高 |
| 8 | 想定 carat 既存顧客の移行方法 | 不明 | 高 |
| 9 | 利用規約・プライバシーポリシーの法務レビュー担当 | 未定 | 高 |

---

## 12. リポジトリ構成（推奨）

```
senacare/
├── apps/
│   └── web/              # Next.js (Client / Therapist / SalonAdmin 兼用、ロール別ルーティング)
├── packages/
│   ├── ui/               # 共通UIコンポーネント
│   ├── db/               # Supabase schema, migrations, generated types
│   └── lib/              # 共通ロジック（AI prompts, validators, banned-words filter）
├── supabase/
│   ├── migrations/
│   ├── functions/        # Edge Functions（AI生成、webhook受信等）
│   └── seed.sql
├── docs/                 # 本書を含むドキュメント
├── .env.example
└── README.md
```

Monorepo は Turborepo を推奨。シングルパッケージでも可（最初はシンプル優先）。

---

## 13. Phase 0 開発タスク分解（Claude Code向け）

着手順の推奨:

1. **プロジェクト初期化** — Next.js 15 + Supabase + Tailwind + shadcn/ui のセットアップ、`.env.example` 整備
2. **Supabase スキーマ設計** — §5 をベースに migration 作成、generated types を packages/db に
3. **RLS ポリシー設計** — 全テーブルに対しロール別ポリシー、テスト用シード含む
4. **認証フロー** — 招待リンク発行 → サインアップ → ロール別リダイレクト
5. **ロール別レイアウト雛形** — Client / Therapist / SalonAdmin の3ダッシュボードのシェル
6. **進捗写真機能** — 撮影UI（カメラAPI、ガイド線描画）、Supabase Storage、署名付きURL、タイムライン、比較ビュー
7. **顧客カルテ** — 施術記録の CRUD、入力時間90秒目標のUI最適化
8. **基本予約** — 空き枠表示、予約、Therapist 確認、カレンダーエクスポート
9. **Q&A** — スレッド型UI、既読、画像添付
10. **Stripe B2B課金** — Subscription、webhook、プラン管理
11. **SalonAdmin ダッシュボード KPI** — 当日来店、当月成約、要対応アラート
12. **監査ログ** — 全write操作を audit_logs に記録するミドルウェア
13. **禁止語フィルタ基盤** — Phase 1 で食事FBに使うが、Phase 0 で Q&A 送信時にも適用しておく

各タスクは独立で進行可能な粒度。タスク間の依存は: 1→2→3 が前提、以降は並列可。

---

## 14. 用語集

| 用語 | 意味 |
|---|---|
| Client | サロンに通う顧客（エンドユーザー） |
| Therapist | サロンに所属する施術者 |
| SalonAdmin | サロンの管理責任者 |
| Nutritionist | 食事FB監修担当の管理栄養士 |
| SuperAdmin | SaaS提供者（Vitality Design） |
| Organization | 1つのサロン会社（マルチテナント単位） |
| Course | サロンが提供する複数回施術パッケージ |
| Session | 1回の施術 |
| Progress Photo | Therapist が撮影・管理する Before/After 写真 |
| Self Log | Client が来店間で記録する自己評価 |
| Meal Log | Client が記録する食事の写真・メモ |
| Meal Feedback | Meal Log に対する AI 生成 + Nutritionist 監修済のFB |

---

## 15. 改訂履歴

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1 | 2026/05/14 | Vitality Design LLC | 初版 |
