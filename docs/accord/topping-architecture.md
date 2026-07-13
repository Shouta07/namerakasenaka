# Accord トッピング・アーキテクチャ設計書

**版**: v2.2（2026-07）

> **v2.2 変更点（cull＝最も良い形へ）**: ローンチを物語1周の最小構成に絞った。
> - **ローンチ トッピング（10）**: core / copilot / dashboard / line-share / roleplay /
>   photos / follow-loop / evidence / at-risk / mentoring。ヘッドラインは前7つ、
>   evidence・at-risk は「継続」に内包、mentoring はサービス。
> - **削除（別事業・レジストリから除去）**: ai-minutes（文字起こしは別プロダクト）/
>   meals-review（栄養士ネットワークが要る別事業）/ staff-kpi（dashboard に統合）。
> - **backlog（保持・料金表から除外・全プランOUT）**: data-import / lessons / theme-pack /
>   ai-guide / case-library / multi-location / qa。3院ルール（moat §4-B）で昇格判定。
> - **単品アドオン価格を廃止**（ローンチは3プラン束のみ販売）。
> - **senaCRMを丸ごと相続しない**: モノレポ化時、トッピングになった部分（顧客・タイムライン・
>   evidence・retention・回復ガイド）だけ抽出。予約カレンダー(S11)・食事/栄養士(S10)・QA(S12)は
>   持ち込まない（前者は「作らない」既決、後2つは別事業）。
>
> _旧 v2.0: 経営コパイロット化に伴い階層「🧠 AI頭脳」を新設し4トッピング追加（§2.2b）。_
**目的**: 「機能をトッピングできる SaaS」として Accord をローンチするための、現状機能の棚卸しとモジュール設計
**前提**: `docs/accord/saas-design.md`（事業・技術設計 v1.0）の実装詳細版。矛盾時は本書が優先

---

## 1. 現状の機能棚卸し（リポジトリ実測）

このリポジトリには **2つのプロダクト実装**が同居している。トッピング化の原料はこの両方。

### 1.1 Accord デモ（`/accord` — 4画面・モジュール機構つき）

| # | 機能 | 実装 | SaaS昇格 |
|---|---|---|---|
| A1 | モジュール増減パネル + ModuleGate | `components/accord/module-panel.tsx`, `lib/accord/store.ts`（localStorage） | ◎ **トッピング機構の原型**。DB化して昇格 |
| A2 | AI接客練習（3ペルソナ・5観点採点・履歴） | `components/accord/roleplay-*.tsx`（台本エンジン） | ◎ Claude API 接続で本実装 |
| A3 | 成約ダッシュボード（ファネル/推移/スタッフ別/月1伴走） | `components/accord/charts.tsx`, `app/accord/dashboard` | ◎ 実データ接続 |
| A4 | 顧客フォロー（タイムライン/LINE同意ファースト送信/メモ） | `app/accord/customers`, `customer-actions.tsx` | ◎ コア（生地）に昇格 |

### 1.2 senacare CRM（なめらかせなか向け — 1社目の実装資産）

| # | 機能クラスタ | 実装（主要パス） | SaaS昇格 |
|---|---|---|---|
| S1 | 経営ダッシュボード（KPI/売上/活動/リスク） | `admin/dashboard`, `components/admin/` | ○ A3 に統合 |
| S2 | 顧客・カルテ管理（一覧/詳細/招待/スタッフ） | `admin/clients`, `admin/customers`, `admin/staff`, `admin/invites` | ◎ コア（生地） |
| S3 | 施術記録・経過写真（before/after 比較・自己評価） | `t/clients/[id]/records`, `photos`, `c/progress/compare`, `lib/storage/` | ◎ トッピング「経過写真」 |
| S4 | 症例ライブラリ（登録/タグ/類似検索） | `admin/cases/*`, `lib/cases/`（similarity.ts） | ◎ トッピング「症例ライブラリ」 |
| S5 | 離脱リスク検知 | `admin/at-risk`, `lib/retention/`（純関数エンジン） | ◎ トッピング「離脱アラート」 |
| S6 | エビデンスエンジン（効果集計・印刷レポート） | `admin/evidence`, `lib/evidence/`（純関数） | ◎ トッピング「効果の見える化」 |
| S7 | 回復ガイド（AI生成・翻訳辞書・/share 限定公開） | `lib/ai/recovery-guide.ts`, `lib/guide/`, `share/[token]` | ◎ トッピング「AIパーソナルガイド」 |
| S8 | 学習レッスン（7章・クイズ・種/バッジ・図解SVG） | `lib/lessons/`, `components/lessons/`（illustrations 7本） | ◎ トッピング「学習コンテンツ」+ テーマパック |
| S9 | 伴走ループ（今日のひとつ・自己ログ・リマインド） | `c/self-log`, `c/guide`, `lib/retention/` | ◎ トッピング「継続フォロー」 |
| S10 | 食事記録 + AI下書き + 専門家承認フロー | `c/meals`, `n/queue`, `lib/ai/meal-feedback.ts` | △ 後期トッピング（監修者の調達が前提） |
| S11 | 予約・カレンダー | `c/appointments`, `t/calendar`, `admin/calendar`, `lib/business-hours.ts` | ✕ 機能は作らない（競合位置）。**v2: `data-import` で予約・POS・広告データを取り込み、上に乗るAIレイヤーとして活かす** |
| S12 | Q&A メッセージング（自動応答つき） | `c/qa`, `t/qa` | △ 後期（LINE連携があれば初期は不要） |
| S13 | カウンセリング共有ビュー（iPadで一緒に見る） | `counseling/[caseId]` | ◎ コアの一部（初回カウンセリング画面） |

### 1.3 横断基盤（トッピングではなく「厨房設備」）

| 基盤 | 実装 | 備考 |
|---|---|---|
| フラグ機構（現状3系統に分裂） | ①`lib/accord/store.ts` の UI トグル ②`lib/billing/feature-flags.ts`（env + 顧客別フラグ） ③ロール別ルートグループ | **本書で1系統に統一する**（§3） |
| デモモード | `lib/demo/`（env未設定→localStorage） | 営業デモ資産として維持 |
| 禁止語フィルタ | `lib/compliance/banned-words.ts` | 全AI出力・配信文面に適用（全トッピング共通） |
| 監査ログ | `lib/audit/` | 共通 |
| 認証・課金・ストレージ | `lib/supabase/`, `lib/stripe/`, `lib/storage/`（署名URL/GDrive） | 共通 |

**結論**: トッピングの原料は 13 クラスタ。うち即戦力 10、後期 2（S10/S12）、対象外 1（S11 予約）。

---

## 2. トッピング・カタログ（商品設計）

### 2.1 ピザの比喩で構造を固定する

```
🍕 生地（Base・外せない・全プラン共通）
    顧客台帳 / 初回カウンセリング記録 / タイムライン / メンバー・権限
🧠 AI頭脳（Copilot・Standard以上の中核価値）〔v2 新設〕
    経営コパイロット — 全トッピングのデータから気づきと次の一手を提案し、その場で実行させる司令塔
🧀 チーズ（既定トッピング・プランに標準で載る）
    成約ダッシュボード / LINE経過共有
🍄 トッピング（足し引き自由・課金単位）
    AI接客練習 / 継続フォロー / 経過写真 / 症例ライブラリ / 離脱アラート /
    効果の見える化 / AIパーソナルガイド / 学習コンテンツ / 多店舗
📦 コンテンツパック（トッピングの中に入れる具材・買い切り）
    テーマパック: 腸 / 食事 / スキンケア / 運動 / （業種別: 脱毛・痩身・審美 …）
🤝 サービストッピング（人が乗る）
    月1伴走 / 導入・体験設計
```

**設計判断**: 完全アラカルト販売はしない。**プラン = トッピングのプリセット束**とし、アラカルトは「プランへの追い足し（expansion）」に限定する。理由: (1) 営業時の説明コストと意思決定疲れを避ける (2) 単品最適で「効くのに外される」トッピング（継続フォロー等）を守る (3) 請求の複雑化を防ぐ。

### 2.2 カタログ（ID・依存・課金）

| ID | トッピング | 由来 | 依存 | Starter | Standard | Pro | 単品追加 |
|---|---|---|---|:---:|:---:|:---:|---|
| `core` | 顧客台帳・カウンセリング記録・タイムライン | A4+S2+S13 | — | ✅ | ✅ | ✅ | 不可（生地） |
| `dashboard` | 成約ダッシュボード | A3+S1 | core | 基本 | ✅ | ✅ | — |
| `line-share` | LINE経過共有（同意管理込み） | A4+S7の/share | core | 100通 | 1,000通 | 無制限 | 通数追加 ¥3/通 |
| `roleplay` | AI接客練習 | A2 | core | 20回 | 100回 | 無制限* | 50回 ¥5,000 |
| `follow-loop` | 継続フォロー（今日のひとつ・自己ログ） | S9 | core, line-share | — | ✅ | ✅ | ¥5,000/月 |
| `photos` | 経過写真（before/after・同意管理） | S3 | core | ✅ | ✅ | ✅ | — |
| `evidence` | 効果の見える化（トレンド・印刷レポート） | S6 | photos | — | ✅ | ✅ | ¥3,000/月 |
| `at-risk` | 離脱アラート | S5 | core, follow-loop | — | ✅ | ✅ | ¥3,000/月 |
| `case-library` | 症例ライブラリ（類似検索） | S4 | photos | — | — | ✅ | ¥8,000/月 |
| `ai-guide` | AIパーソナルガイド（翻訳辞書ベース） | S7 | core, line-share | — | — | ✅ | ¥10,000/月 |
| `lessons` | 学習コンテンツ配信（クイズ・種） | S8 | line-share | — | 1パック | 無制限 | パックで購入 |
| `theme-*` | テーマパック（腸/食事/スキンケア/運動/業種別） | S8+パーツ売り設計 | lessons | — | 追加可 | 追加可 | **¥100,000 買い切り** |
| `multi-location` | 多店舗・FC横断 | 新規 | dashboard | — | — | ✅ | ¥10,000/店舗 |
| `mentoring` | 月1伴走（サービス） | A3右下+人 | dashboard | — | 30分 | 60分 | ¥15,000/回 |
| `meals-review` | 食事記録+専門家レビュー | S10 | core | 後期（M10+）。監修者ネットワークが前提 | | | |
| `qa` | 店舗⇔顧客メッセージング | S12 | core | 後期。初期は LINE で代替 | | | |

*Pro のフェアユース: 実績上限 300回/月（saas-design §8.3）

**プラン価格は据え置き**（Starter ¥14,800 / Standard ¥29,800 / Pro ¥49,800）。トッピング表はプラン間の**アップグレード理由**と**単品 expansion** の2役を担う。

### 2.2b v2 追加トッピング（経営コパイロット群）

| ID | トッピング | 由来ペイン | 依存 | Starter | Standard | Pro | 単品追加 |
|---|---|---|---|:---:|:---:|:---:|---|
| `copilot` | 接客と継続のコパイロット（気づき+提案+実行。スコープは成約・継続・練習に限定 — saas-design §2.3b） | ⑥経営管理 | core, dashboard | — | 週次ブリーフ | **日次 + 提案実行** | なし（アップグレード導線） |
| `ai-minutes` | AI議事録（録音→構造化記録→フィードバック） | ②カウンセリング | core | — | 30件/月 | フェアユース200件 | ¥8,000/月 |
| `staff-kpi` | スタッフ別KPI（成約率・ヒアリング傾向） | ③スタッフ | dashboard | — | ✅ | ✅ | ¥5,000/月 |
| `data-import` | 外部データ連携（予約/POS/広告 CSV→将来API） | ④オペ・⑥経営 | core | — | CSV取込 | CSV + API(順次) | なし |

- `copilot` を **Starter に出さない**のは意図的: Standard へ上がる最大の理由にする
- `ai-minutes` の採点は roleplay の5観点ルーブリックを再利用（実装・学習コストを共有）
- `staff-kpi` は「責めるためではなく練習テーマを決める材料」の文言をUIに常設（文化制約）
- 依存の追加: copilot ← dashboard ／ staff-kpi ← dashboard ／ ai-minutes・data-import ← core

### 2.3 依存グラフ

```
core ──┬── dashboard ──── multi-location
       │       └───────── mentoring(サービス)
       ├── roleplay
       ├── photos ──┬── evidence
       │            └── case-library
       └── line-share ──┬── follow-loop ── at-risk
                        ├── lessons ── theme-*(コンテンツ)
                        └── ai-guide
```

依存はレジストリで宣言し（§3.2）、**依存先がオフのトッピングは有効化できない／依存元があるトッピングをオフにすると警告**する。

---

## 3. 技術設計 — トッピング機構

### 3.1 統一原則: 「判定は1箇所、表現は4層」

現状3系統に分裂しているフラグを、**単一のモジュールレジストリ + 3層エンタイトルメント**に統一する。

```
第1層  entitlement（課金が決める）   … plan / addon / trial / manual
第2層  org設定（オーナーが決める）   … 契約内でも「使わない」を選べる（現行トグルの役割）
第3層  role（権限が決める）          … staff には課金設定を見せない 等
第4層  UI（画面が従う）              … ナビ・ページ・ボタンは上3層の結果を映すだけ
```

判定関数はサーバ側1箇所:

```ts
// lib/toppings/can.ts — 全レイヤの唯一の判定入口
export async function can(
  orgId: string,
  topping: ToppingId,
  usage?: { metric: string; amount: number },
): Promise<{ ok: boolean; reason?: "not_entitled" | "disabled" | "limit" | "dependency" }>
```

- **API Route / Server Action は必ず `can()` を通す**（UI 制御だけのガードを禁止。LINE 同意の 403 と同じ思想）
- 使用量つき判定（roleplay 残回数、LINE 残通数）も同じ入口で行い、超過時は `limit` を返してアップセル導線へ

### 3.2 モジュールレジストリ（単一の情報源）

現行 `ACCORD_MODULES`（fixtures.ts）を拡張し、**コードのレジストリ + DB のエンタイトルメント**の2段構成にする。トッピングの「定義」はコード（型安全・レビュー可能）、「誰が使えるか」は DB。

```ts
// lib/toppings/registry.ts
export const TOPPINGS = {
  "roleplay": {
    name: "AI接客練習",
    tier: "topping",              // base | cheese | topping | content | service
    dependsOn: ["core"],
    nav: { href: "/app/roleplay", label: "接客練習", order: 20 },
    limits: { sessions_per_month: { starter: 20, standard: 100, pro: 300 } },
    stripe: { addon_price_id: "price_..." },   // 単品販売するものだけ
    tables: ["roleplay_scenarios", "roleplay_sessions", "roleplay_turns"],
  },
  // …
} as const satisfies Record<string, ToppingDef>;
```

```sql
-- DB 側（saas-design §9 を具体化）
entitlements(
  organization_id, topping_id, enabled boolean,
  limit_overrides jsonb,           -- 個別交渉・トライアル延長など
  source text,                     -- 'plan' | 'addon' | 'trial' | 'manual'
  valid_until timestamptz          -- トライアル・期間限定
)
org_topping_settings(organization_id, topping_id, enabled boolean)  -- 第2層（使う/使わない）
usage_counters(organization_id, topping_id, metric, period, used)    -- 上限判定
```

### 3.3 ゲーティングの4点セット（各トッピングが実装契約として持つもの）

| 層 | 実装 | 現行資産 |
|---|---|---|
| ナビ | レジストリの `nav` から動的生成。オフなら消える | `AccordNav` の一般化 |
| ページ | `<ToppingGate id="roleplay">`（サーバコンポーネント化。無効時は「オンにする/アップグレード」画面） | `ModuleGate` の昇格 |
| API | Route Handler 冒頭で `can()`。不許可は 403 + reason | 新規（必須） |
| DB | トッピング専用テーブルは registry `tables` に列挙。**core のテーブルに外部キーで依存してよいが、逆は禁止**（オフにしても生地が壊れない） | 新規規約 |

**データの扱い**: トッピングをオフ/解約してもデータは削除しない（read-only 凍結、再オンで復活）。削除は解約後90日ポリシー（saas-design §10）に従う。

### 3.4 コンテンツパックの設計（theme-*）

テーマパックは「コード」ではなく「データ」。レッスン・図解・練習シナリオ・翻訳辞書を1つの束として配信する。

```sql
content_packs(id, slug, name, kind,          -- 'theme' | 'industry'
              price_jpy, published_at)
content_pack_items(pack_id, item_type,        -- 'lesson' | 'illustration' | 'scenario' | 'dictionary'
                   payload jsonb, sort_order)
org_pack_purchases(organization_id, pack_id, purchased_at, stripe_payment_id)
```

- 図解 SVG（S8 の7本 + pillar 4本）は React コンポーネントのままだと配信できないため、**パック化するものから順に「payload 駆動のテンプレート + パラメータ」へ移行**する（初期は既存4テーマぶんをビルトインとして同梱し、移行は M6 以降でよい)
- 練習シナリオ（persona_json / script_json — saas-design §8.2）はすでにデータ駆動設計なのでそのまま載る

### 3.5 移植マップ（senacare → Accord SaaS）

| 資産 | 移植方法 | 工数感 |
|---|---|---|
| `lib/retention/`・`lib/evidence/`・`lib/cases/similarity` | **純関数（DB非依存）で書かれているためそのまま移植可**。入力の hydrate 層だけ書き直し | 小 |
| `lib/compliance/banned-words` | そのまま共通基盤へ | 極小 |
| `/share/[token]` + guide schema | share_tokens テーブル設計（saas-design §7.3）に載せ替え | 中 |
| レッスン・図解 | ビルトインコンテンツとして同梱 → §3.4 でパック化 | 中 |
| 予約・カレンダー・QA・食事レビュー | 移植しない（S11 対象外 / S10・S12 後期） | — |
| Accord 4画面 | デモ→本実装（saas-design M0〜M4 の通り） | 主工数 |

---

## 4. ローンチ構成の推奨

### 4.1 ローンチ時に「載せる」トッピング（M4 末・課金開始時点）

```
生地:    core（台帳・カウンセリング記録・タイムライン）
チーズ:  dashboard / line-share
トッピング: roleplay / follow-loop / photos
サービス:  mentoring（Standard 以上）
コンテンツ: theme-gut（腸）ビルトイン + theme-diet/skincare/exercise を ¥100,000 で販売
```

= **saas-design のM0〜M4 と同一スコープ**。トッピング機構（§3）は M0 の基盤工数に含める（+3人日程度。ModuleGate/registry の原型があるため小さい）。

### 4.2 M6 以降に「追加できる」ようになるトッピング

`evidence` → `at-risk` → `case-library` → `ai-guide` → `multi-location` の順（依存グラフの下流から。かつ営業上のアップセル階段: Standard の店舗に evidence/at-risk を売り、Pro へ引き上げる）。

### 4.3 やらないことの再確認

- 予約管理（S11）— 予約系SaaSの隣に立つ。戦わない
- トッピングの完全アラカルト販売 — プラン束が主、単品は expansion のみ
- テナントごとのコードカスタマイズ — 差異はすべて entitlement とコンテンツパックで表現する（1社目=なめらかせなか専用実装を Accord 本体に持ち込まない）

---

## 5. 次のアクション

1. **レジストリ実装**（M0 内）: `lib/toppings/` に registry / can() / ToppingGate。現行 `ACCORD_MODULES` からの移行
2. **entitlements テーブル + Stripe 連携**（M2）: plan→トッピング束の写像、addon 購入フロー
3. **プラン×トッピング表の営業資材化**: /plans または新 /accord/pricing にトッピング表を載せる（「機能をトッピングできる」はそれ自体が営業トークになる）
4. 田村さん向け: なめらかせなかを **全トッピング載せの Pro 相当（事例特別価格）** として最初のテナントに移行する合意を取る
