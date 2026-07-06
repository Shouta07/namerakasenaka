# Accord — SaaS サービス設計・開発設計書

**版**: v1.0（2026-07）
**目標**: 課金 MRR ¥1,000,000
**作成**: バイタリティデザイン合同会社

---

# 第1部 サービス設計（ビジネス）

## 1. プロダクト定義

> **Accord は、クリニック・サロンの「初回カウンセリング」を、いちばん得意な接客に変える SaaS。**
> AI相手の接客練習 × 成約の見える化 × 月1回の伴走で、スタッフの接客を底上げする。
> 記録・写真の経過は本人同意のもと LINE でお客様の手元に届き、成約後の関わりも顧客ごとに蓄積される。

### 1.1 解いている課題（誰の・何を）

| 誰 | 課題 | Accord の答え |
|---|---|---|
| オーナー | 成約が「スタッフの感覚」任せで、売上が読めない | ファネルとスタッフ別成約率で数字にする |
| スタッフ | 苦手なお客様（価格比較型・不信型）で失注する。練習相手がいない | AIお客様で何度でも練習、5観点フィードバック |
| 店舗 | 導入したツールが3ヶ月で使われなくなる | 月1伴走で「数字→翌月の練習テーマ」を回し続ける |
| お客様 | カウンセリングの内容を持ち帰れない、経過が見えない | 同意ベースの LINE 経過共有 |

### 1.2 既存資産との関係

- **なめらかせなか（senacare）= 1社目の導入事例**。翻訳辞書・図解・伴走ループ・LINE共有の設計思想は Accord の土台としてそのまま流用する。
- デモは稼働済み（`/accord` 4画面 + モジュール増減機構）。本書はこれを**マルチテナント SaaS に昇格させる**設計である。

## 2. 市場と ICP（理想顧客像）

### 2.1 ターゲット市場

初回カウンセリングの成否が売上に直結する「高単価・カウンセリング型」店舗:

1. **美容サロン**（背中ケア・痩身・脱毛・フェイシャル）— 1st ビーチヘッド。なめらかせなかの隣接市場
2. **自由診療クリニック**（美容皮膚科・審美歯科・AGA・矯正）— 単価が高く ARPU を引き上げる
3. **整体・パーソナルジム** — 回数券/長期コースの成約型

### 2.2 ICP の条件

- 客単価 5万円以上のコース商品がある（成約1件の価値が大きい＝ツール代を1件で回収できる）
- スタッフ 2〜10名（オーナー1人だけだと練習・比較の価値が薄い、大手はSFA領域）
- 初回予約は月 10 件以上ある（集客はできている＝Accord の効果が数字に出る）
- **除外**: 集客に困っている店舗（Accord は集客ツールではない。予約系SaaSと競合しない位置取り）

### 2.3 競合と差別化

| 分類 | 例 | 彼らの主戦場 | Accord の違い |
|---|---|---|---|
| 予約・POS | リザービア、KireiPass 等（月1.5〜9万円） | 予約獲得・決済・カルテ | **予約の後ろ側（成約と継続）**に特化。併用される前提 |
| 接客研修 | 研修会社・コンサル（1回数十万） | 単発研修 | 毎日練習できる。数字と接続。1/10 の価格で常設 |
| SFA/CRM | Salesforce 等 | 記録・管理 | 記録で終わらず「練習→数字→伴走」の行動変容ループ |

**一言の差別化**: 「予約を増やす道具は世に溢れている。**来た人を成約させ、通い続けてもらう道具**は Accord だけ」

## 3. プライシング設計

### 3.1 プラン（月額・税抜）

| | **Starter** ¥14,800/月 | **Standard** ¥29,800/月 | **Pro** ¥49,800/月 |
|---|---|---|---|
| 想定 | 1〜2名の小規模店 | **主力**。スタッフ3名〜 | 多店舗・FC・クリニック |
| カウンセリング記録・顧客フォロー | ✅ 顧客200名 | ✅ 無制限 | ✅ 無制限 |
| LINE経過共有 | ✅ 月100通 | ✅ 月1,000通 | ✅ 無制限 |
| AI接客練習 | 月20セッション | 月100セッション | 無制限（フェアユース） |
| 成約ダッシュボード | 基本 | ✅ スタッフ別・推移 | ✅ + 多店舗横断 |
| 月1伴走（オンライン30分） | — | ✅ | ✅ 60分 + 四半期レビュー |
| カスタム練習シナリオ | — | 3本 | 無制限 + 自店の失注データから生成 |
| 契約 | 月次 | 月次/年次 | 年次（請求書払い可） |

- **年払い 10% OFF**（キャッシュフロー先取り + 解約抑止）
- **初期費（別建て・one-time）**: セットアップ ¥50,000 ／ 体験設計込み導入 ¥300,000〜600,000（プランB資産の流用。SaaS の MRR とは別レイヤー）
- **拡張収益**: 業種別テーマパック（腸・食事・スキンケア・運動 等のコンテンツ + 専用シナリオ）1テーマ ¥100,000（買い切り）— 既存の「パーツで売る」設計をそのまま expansion に使う
- **無料トライアル**: 14日（クレカ登録あり）。トライアル中に必ず1回オンボーディング面談を入れる（activation が継続の最大因子）

### 3.2 価格の根拠

- Standard ¥29,800 = **コース1件の成約増（客単価10万円前後）の 1/3 以下**。「月に1件、練習の成果で成約が増えれば3倍返し」という営業ロジック
- 予約系SaaS（1.5〜9万円）と同レンジに収め、稟議の相場観を外さない
- 月1伴走の人件費は Pro/Standard の粗利内に収まる（§3.4）

### 3.3 MRR ¥1,000,000 の構成モデル

**基本式**: MRR = 店舗数 × ARPU

| シナリオ | 構成 | MRR |
|---|---|---|
| **A（本命）** | Standard×25 + Pro×5 = **30店舗** | ¥994,000 |
| B（分散） | Starter×10 + Standard×15 + Pro×8 = 33店舗 | ¥993,400 |
| C（クリニック寄せ） | Standard×10 + Pro×14 = 24店舗 | ¥995,200 |

→ **目標は「有償30店舗・ブレンドARPU ¥33,000」**。テーマパック・初期費は上乗せ（MRRに数えない）。

### 3.4 ユニットエコノミクス（目標値）

| 指標 | 目標 | 根拠 |
|---|---|---|
| 月次解約率 | ≤ 2.0% | 月1伴走がタッチポイント。業界SaaS平均(3〜5%)を伴走で下回らせる |
| LTV | ≈ ¥1,650,000 | ARPU 33,000 ÷ 2% |
| CAC | ≤ ¥100,000 | 紹介・事例中心。回収 3ヶ月以内 |
| 売上総利益率 | ≥ 80% | 変動費 = AI原価 + LINE従量 + 伴走人件費（下表） |

**1店舗あたり月次変動費（Standard 想定）**

| 費目 | 目安 | 備考 |
|---|---|---|
| AI（練習100セッション） | ¥2,000〜4,000 | §開発設計 8.4 の原価計算。キャッシュ活用後 |
| LINE Messaging API | ¥500〜1,500 | 従量（無料枠200通 + ¥3/通程度） |
| 月1伴走 30分 | ¥3,000〜5,000 | 内製時給換算。将来は録画+レポート半自動化 |
| インフラ按分 | 〜¥500 | Vercel Pro / Supabase Pro / Sentry |
| **計** | **¥6,000〜11,000** | 粗利 63〜80%（Standard）。Pro はさらに高い |

⚠️ **伴走がスケールのボトルネック**。30店舗 × 30〜60分 = 月20〜30時間。M12 までに「伴走の型化」（数字レポート自動生成 → 面談は意思決定だけ）を済ませること（§ロードマップ M4）。

## 4. GTM（拡販戦略）

### 4.1 販売チャネル（優先順）

1. **導入事例エンジン（なめらかせなか）** — 「成約率 53%→61%」のような数字つき事例を最初の3ヶ月で作る。事例がない SaaS は売れない。**田村さんの経営者コミュニティへの紹介**が最初の5社の主経路
2. **紹介プログラム** — 紹介1件成約で紹介者に ¥30,000 or 利用料1ヶ月無料。ICP同士は横で繋がっている業界
3. **FC・多店舗本部営業** — なめらかせなかが FC 再展開すれば1契約×n店舗。本部向け Pro 一括が最短の MRR ジャンプ
4. **コンテンツ/セミナー** — 「成約率の教科書」ウェビナー月1回。デモ（/accord）をその場で触らせる
5. **パートナー** — 予約系SaaS・ディーラー・補助金支援会社（ライトアップ社）との相互送客。IT導入補助金の**ベンダー登録は M13 以降**に検討（販売が回証明されてから）

### 4.2 セールスファネル目標（巡航時・月次）

```
リード 20 → 商談 10 → トライアル 6 → 有償化 4 （商談→有償 40%）
解約 ▲0.5店/月 → 純増 +3.5店/月
```

### 4.3 MRR 成長ロードマップ

| 期 | 店舗数(累計) | MRR | 焦点 |
|---|---|---|---|
| M1〜3 | 1（なめらかせなか） | ¥30,000 | 事例づくり。数字を採る。SaaS基盤開発 |
| M4〜6 | 5 | ¥120,000 | デザインパートナー5社（特別価格 ¥19,800、フィードバック契約） |
| M7〜9 | 10 | ¥300,000 | 正価販売開始。紹介プログラム稼働 |
| M10〜12 | 18 | ¥550,000 | 伴走の型化。クリニック業種パック投入 |
| M13〜15 | 25 | ¥800,000 | FC/多店舗案件 1〜2件。パートナー送客 |
| **M16〜18** | **30〜33** | **¥1,000,000** | 達成。以後は Pro 比率と expansion で ARPU 向上 |

### 4.4 撤退・転換ライン（先に決めておく）

- M6 時点で有償3社未満 → 価格 or ICP を再設計（機能を作り足さない）
- M12 時点で MRR ¥40万未満 or 月次解約 >4% → 高タッチ・高単価の「SaaS付きコンサル」（月10万×10社）へピボット

## 5. KPI ツリー

```
MRR ¥100万
├─ 新規獲得: リード数 / 商談化率 / トライアル開始率 / 有償化率(≥60%)
├─ 継続: 月次解約率(≤2%) ← 先行指標: 週次ログイン店舗率(≥80%) / 月間練習セッション数/店(≥20) / 伴走実施率(100%)
└─ 単価: プランmix / テーマパック added / 年払い比率(≥40%)
```

**North Star Metric**: 「週に1回以上、練習 or ダッシュボード閲覧をした店舗の割合」— これが 80% を切ったら解約が3ヶ月後に来る。

---

# 第2部 開発設計書（技術）

## 6. 全体アーキテクチャ

```
[店舗スタッフ/オーナー]         [お客様]
   │ Web (PWA)                    │ LINE
   ▼                              ▼
┌──────────────────────────────────────────────┐
│ Next.js 15 (App Router / RSC) on Vercel Pro   │
│  ├ /app…… テナントアプリ（要認証）              │
│  ├ /share/[token]…… 顧客向け限定公開           │
│  ├ /api/roleplay…… AI会話 (streaming)          │
│  ├ /api/line/webhook…… LINE受信                │
│  └ /api/stripe/webhook…… 課金イベント           │
└──────┬───────────┬───────────┬───────────────┘
       ▼           ▼           ▼
  Supabase     Anthropic     Stripe Billing
  (Auth/       Claude API    (subscription +
   Postgres    (roleplay/     entitlement)
   +RLS/       feedback/         │
   Storage)    report draft)     ▼
       │                     LINE Messaging API
       └─ Edge Functions（署名検証・非同期ジョブ）
```

**方針**

- 現行デモ（senacare リポジトリ）の設計思想を継承しつつ、**Accord は独立リポジトリ・独立 Supabase プロジェクト**に切り出す（テナントデータと1社目カスタム実装を混ぜない）
- デモモード機構（env 未設定時 localStorage）は営業デモ用に**維持**する — `/accord` デモがそのまま営業資産になる
- モノリス（Next.js + Supabase）で M12 まで引っ張る。マイクロサービス化はしない

## 7. マルチテナント設計

### 7.1 原則

- **1テナント = organization（店舗 or 法人）**。全テーブルに `organization_id`
- **Postgres RLS を唯一の境界にする**。アプリ層のフィルタ忘れがあっても他社データは漏れない
- 多店舗法人は `organization`（本部）→ `location`（店舗）の2層。Pro のみ location 複数可

### 7.2 ロール

| ロール | 権限 |
|---|---|
| `owner` | 全機能 + 課金 + メンバー管理 + モジュール設定 |
| `manager` | ダッシュボード全体 + 顧客 + 練習 |
| `staff` | 自分の練習・自分の担当顧客・記録 |
| （システム）`accord_admin` | 運営用。伴走レポート閲覧、サポート impersonate（監査ログ必須） |

### 7.3 データモデル（主要テーブル）

```sql
-- テナント・課金
organizations(id, name, plan, stripe_customer_id, line_channel_id, created_at, …)
locations(id, organization_id, name, …)
members(id, organization_id, user_id, role, display_name, …)
entitlements(organization_id, module_id, enabled, limit_value, source)  -- §9

-- 顧客・カウンセリング（コア）
customers(id, organization_id, location_id, name, status, assigned_member_id,
          concern, next_action, line_user_id, …)
line_consents(id, customer_id, granted_at, revoked_at, scope, evidence)   -- 同意の監査証跡
counseling_records(id, customer_id, member_id, held_at, structured_json, outcome,
                   proposed_amount, contracted_amount, …)
timeline_events(id, customer_id, kind, title, body, occurred_at, created_by, …)
photos(id, customer_id, storage_path, consent_id, taken_at, …)            -- 同意なしでは共有不可

-- 成約ファネル
funnel_events(id, organization_id, customer_id, stage, occurred_at)
  -- stage: booked / visited / counseled / proposed / contracted / lost(reason)

-- AIロールプレイ
roleplay_scenarios(id, organization_id NULLABLE, title, persona_json, script_json,
                   difficulty, theme, is_builtin)
roleplay_sessions(id, organization_id, member_id, scenario_id, started_at,
                  finished_at, score, rubric_json, token_usage_json)
roleplay_turns(id, session_id, role, body, created_at)

-- LINE
line_messages(id, organization_id, customer_id, direction, kind, payload_json,
              consent_id, sent_at, delivery_status)
share_tokens(id, customer_id, token, scope, expires_at, revoked_at)

-- 伴走
mentoring_sessions(id, organization_id, held_on, report_md, next_theme,
                   metrics_snapshot_json, coach_member)

-- 運営
audit_logs(id, organization_id, actor, action, target, detail_json, created_at)
```

**RLS 例**（全テーブル同型）:

```sql
create policy tenant_isolation on customers
  using (organization_id = (auth.jwt() ->> 'org_id')::uuid);
```

## 8. AIロールプレイ設計（コア差別化機能）

### 8.1 構成

```
Client (chat UI, streaming表示)
  → POST /api/roleplay/[sessionId]/turn   … スタッフ発話を送る
  → Next.js Route Handler:
      1. entitlement チェック（残セッション数）
      2. Claude API 呼び出し（streaming, persona system prompt はキャッシュ）
      3. turn を DB 保存、SSE でクライアントへ
  → 練習終了時 POST /api/roleplay/[sessionId]/feedback
      … 全会話を渡して採点（structured outputs で rubric JSON を強制）
```

### 8.2 モデルと呼び出し方針

| 用途 | モデル | 理由 |
|---|---|---|
| お客様役の会話 | `claude-opus-4-8`（標準） | ペルソナの一貫性・自然な感情表現が商品価値そのもの |
| 採点フィードバック | `claude-opus-4-8` + structured outputs | rubric JSON を `output_config.format`(json_schema) で保証 |
| 伴走レポート下書き | `claude-opus-4-8` | 月1回・低頻度なので品質優先 |
| コスト最適化オプション | `claude-sonnet-5` へ切替可能な設計 | model はテナント設定ではなく**サーバ側 config** で一元管理 |

実装上の要点:

- **プロンプトキャッシュ必須**: system（ペルソナ定義 + 採点rubric + 禁止語ルール ≒ 3〜4K tokens）に `cache_control` を置く。会話が進むほど読み取りはキャッシュヒット
- **streaming 必須**（体感応答 < 2秒）。`client.messages.stream()` + `finalMessage()`
- 採点は `output_config: {format: {type: "json_schema", …}}` で `{score, passed[], advice[]}` を強制。パース失敗リトライを排除
- **禁止語フィルタ（senacare §8.2 継承）**: 生成後にサーバ側で医療広告・薬機法 NG 表現を後置チェック。ヒット時は再生成
- ペルソナは `persona_json`（性格・背景・失注理由・感情遷移ルール）として DB 管理。**台本エンジン（現行デモ）は fallback** として残し、API 障害時も練習を止めない

### 8.3 フェアユースとガードレール

- プラン別セッション上限（entitlements）。超過時は「今月の練習枠を使い切りました」→ アップセル導線
- 1セッション最大 20 ターン・30分。1テナント同時 3 セッションまで
- 月次トークン集計を `roleplay_sessions.token_usage_json` に保存 → 原価ダッシュボード（運営用）

### 8.4 AI 原価計算（プライシングの裏付け）

前提: 1セッション = 会話10往復 + 採点1回。system 3.5K tokens はキャッシュ、履歴は逐次成長（平均 input 2.5K/回、output 350/回）。

| モデル | 1セッション原価 | 100セッション/月 |
|---|---|---|
| Opus 4.8（$5/$25 per MTok） | ≈ $0.21〜0.28（**¥35〜45**） | **¥3,500〜4,500** |
| Sonnet 5（$3/$15、〜2026-08 は $2/$10） | ≈ $0.08〜0.13（¥13〜20） | ¥1,300〜2,000 |

→ Standard（¥29,800・100回）で AI 原価率 **7〜15%**。粗利目標 80% の範囲内。無制限の Pro はフェアユース（実績上限 300回/月）で上振れを抑える。

## 9. モジュール & エンタイトルメント設計

「機能を増減できる」を課金と直結させる。**モジュール定義（現行 `ACCORD_MODULES`）を DB 化**し、プラン → エンタイトルメントに写像する。

```
plans (starter/standard/pro)
  └─ plan_modules(plan, module_id, limit_value)      … プランの既定
organizations
  └─ entitlements(org, module_id, enabled, limit_value, source)
       source: 'plan' | 'addon' | 'trial' | 'manual'
```

- UI のトグル（現行実装）はそのまま「**使う/使わない**」。課金上のオン/オフは entitlement が上位
- テーマパック購入 = `entitlements(source='addon')` + コンテンツ行の解放
- 判定はサーバ側 `can(org, module, usage)` 一箇所に集約。クライアントは表示制御のみ

## 10. 課金設計（Stripe）

- **Stripe Billing / subscription**。Product: `accord_starter/standard/pro`（月次・年次 Price）、`theme_pack`（one-time）、`setup_fee`（one-time）
- フロー: 14日トライアル（クレカ必須）→ 自動課金開始。Webhook（`checkout.session.completed`, `customer.subscription.updated/deleted`, `invoice.payment_failed`）→ `entitlements` 同期
- 支払い失敗: Smart Retries + 7日猶予（バナー表示）→ 14日で read-only 化（**データは消さない**。解約後90日保持）
- Pro の請求書払いは Stripe Invoicing（銀行振込）
- 税: 税抜表示 + Stripe Tax で消費税自動計算
- 解約はセルフサービス（画面から）+ 解約理由アンケート必須

## 11. LINE 連携設計

- **店舗ごとに LINE公式アカウントを店舗名義で開設**（Messaging API チャネル）。Accord に channel secret / access token を登録（暗号化保存）。※Accord 名義の単一チャネルにしない — 顧客から見た差出人は店舗であるべき + 従量課金を店舗負担にできる
- 友だち追加: 店頭 QR（Accord が生成）→ `line_user_id` と `customers` を紐付け（初回カウンセリング時にスタッフが照合）
- **同意ファースト（現行デモの設計を昇格）**:
  - `line_consents` に取得日時・スコープ（経過写真/要約/予約案内）・取得方法を記録
  - 同意がない顧客には**送信 API 自体が 403**（UI 制御ではなくサーバ強制）
  - 顧客はいつでも LINE から「配信停止」→ consent revoke → 以後送信不可
- 送信物: 経過ページへのリンク（`/share/[token]`、有効期限つき・失効可能トークン）。**写真そのものを LINE に直接送らない**（誤送信・転送リスクの低減）
- Webhook 受信（友だち追加/ブロック/メッセージ）は Edge Function で署名検証 → キュー処理

## 12. セキュリティ・コンプライアンス

健康状態・肌状態・施術写真は**要配慮個人情報に準じて扱う**。ここが競合に対する信頼の壁になる。

| 領域 | 設計 |
|---|---|
| テナント分離 | Postgres RLS（§7）+ Storage も org プレフィックス + 署名URL（短寿命） |
| 認証 | Supabase Auth（メール + パスワード + 招待制）。owner は 2FA 推奨 |
| 暗号化 | 転送 TLS / 保存時暗号化（Supabase 既定）+ LINE トークン等はアプリ層でも暗号化 |
| 監査 | `audit_logs` に閲覧・出力・共有・運営 impersonate を記録（1年保持） |
| データ削除 | 顧客単位の削除 API（お客様からの要請対応）/ 解約後90日で全削除。写真は物理削除 |
| バックアップ | Supabase PITR（Pro）+ 日次スナップショット。復旧目標 RPO 24h / RTO 12h |
| AI への入力 | ロールプレイに実顧客の個人情報を入れない設計（ペルソナは架空 + 統計化した失注理由のみ）。プロンプトに PII を渡す機能は M12 まで作らない |
| 表現コンプラ | 禁止語フィルタ（医療広告ガイドライン・薬機法 NG 語）を全 AI 出力と店舗発信テンプレに適用 |
| 規約類 | 利用規約 / プライバシーポリシー / 特商法表記 / セキュリティチェックシート雛形（クリニック商談で必ず要求される）|

## 13. 非機能要件

| 項目 | 目標 |
|---|---|
| 可用性 | 99.9%（月43分以内の停止）。AI 障害時は台本エンジンに自動フォールバック |
| 性能 | 画面 p95 < 1.5s / AI 応答開始 < 2s（streaming） |
| 監視 | Sentry（エラー）+ Vercel Analytics + Supabase ログ + 運営向け原価/使用量ダッシュボード |
| レート制限 | API: org 単位 60req/min、roleplay 同時3 |
| インフラ費 | Vercel Pro $20 + Supabase Pro $25 + Sentry $26 + LINE/Stripe 従量 ≒ **固定 ¥1.5万/月**（30店舗時でも AI 込み変動費 ≤ 月20万） |

## 14. 開発ロードマップ（工数・体制）

体制: PM/営業 = 山本、デザイン = 黒澤（業務委託）、開発 = 山本 + AI（+必要時 横道さん実装支援）。工数は人日（AI 支援前提）。

| マイルストーン | 期間 | 内容 | 工数目安 |
|---|---|---|---|
| **M0 基盤** | M1〜2 | 新リポジトリ / Supabase プロジェクト / Auth・組織・メンバー招待 / RLS / 監査ログ / CI | 15人日 |
| **M1 コア** | M2〜3 | 顧客・カウンセリング記録・タイムライン・ファネル入力とダッシュボード（実データ版） | 20人日 |
| **M2 課金** | M3〜4 | Stripe subscription + entitlements + トライアル + プラン画面。**ここから課金開始可能** | 10人日 |
| **M3 AI練習** | M4〜5 | Claude API 本接続（streaming / キャッシュ / structured 採点 / 禁止語 / フェアユース）+ ビルトインシナリオ10本 | 15人日 |
| **M4 LINE** | M5〜6 | Messaging API 連携 / 同意管理 / share トークン / 配信ログ | 12人日 |
| **M5 伴走の型化** | M7〜9 | 月次レポート自動生成（数字 + 練習ログ → Claude 下書き → 人が確定）/ 運営管理画面 | 10人日 |
| **M6 拡張** | M10〜 | テーマパック配信基盤 / 多店舗（location）/ クリニック業種パック / セキュリティシート対応 | 随時 |

**クリティカルパス**: M2（課金）を M4 末までに終える — デザインパートナー5社の有償化（GTM M4〜6）と同期させる。

## 15. テスト・品質

- 単体: Vitest（entitlement 判定・採点 rubric・禁止語フィルタは網羅テスト必須）
- E2E: Playwright（サインアップ→トライアル→練習→課金 の happy path を CI で毎日）
- RLS テスト: 別テナントの JWT で全テーブル SELECT が 0 件になることを自動検証
- AI 回帰: 代表シナリオ 10 本のゴールデン会話でペルソナ崩れ・禁止語をスナップショット監視

## 16. 本書の TODO（意思決定が必要な項目）

1. プラン金額の最終確定（本書は ¥14,800/29,800/49,800 で設計。競合調査に基づく推奨値）
2. Accord の商標・ドメイン取得（accord-app.jp 等）
3. 特商法・利用規約の法務レビュー（契約書ドラフト同様、締結前に専門家確認を推奨）
4. なめらかせなかとの事例公開合意（数字・店名の掲載範囲）
5. LINE公式アカウントの開設オペレーション（店舗側作業の代行範囲）

---

*本書は v1.0。M3（課金開始）前に、実際のトライアル5社のフィードバックで §3 プライシングと §8 フェアユース値を必ず見直すこと。*
