# ADR-001: hisrecoveries × Field CX プラットフォーム設計

**版**: v1.0（2026-07）／ ステータス: 提案 → ユーザー承認で「採択」に更新
**前提**: hisrecoveries は山本作の既存プロダクト（患者側・hisrecoveries.com/member）。
Field CX はその**配下**で開発する。最適化の優先軸 = **①セキュリティ ②データ保存 ③連携**。

---

## 決定（サマリ）

> **1つの背骨（共有 Identity + 共有 Postgres）に、2つのサーフェス（患者面 hisrecoveries / 院面 Field CX）。**
> 連携は「API連携」ではなく「同一DBの射影（ビュー）」で実現し、**連携そのものを消す**。
> 分離はスキーマ・DBロール・サブドメイン・JWTクレームの4点で担保する。

```
                    hisrecoveries.com（1ドメイン＝1事業体）
      ┌────────────────────────┬────────────────────────┐
      │  member.hisrecoveries  │  field-cx.hisrecoveries   │   ← サーフェス分離（別app）
      │  患者面（B2B2C）        │  院面（B2B）             │      ※Field CXは将来 field-cx.jp 等に
      │  読み取り中心・軽い      │  入力・分析・課金        │        独立ドメイン化しても背骨は不変
      └───────────┬────────────┴───────────┬────────────┘
                  │        共有 Identity（Supabase Auth 1つ）
                  │        JWT: { role: patient | staff | owner, org_id?, customer_id? }
      ┌───────────▼────────────────────────▼────────────┐
      │            共有 Postgres（Supabase 1プロジェクト） │
      │  schema shared     … identity / customers / consents / audit │
      │  schema field-cx     … counseling / funnel / roleplay / copilot │
      │  schema recoveries … deliveries / patient_prefs / 患者ビュー   │
      │  ＋ RLS（唯一の境界）＋ スキーマ別DBロール                     │
      ├──────────────────────────────────────────────────┤
      │  Storage（写真: org/customer プレフィックス + 短寿命署名URL）  │
      │  Edge Functions（LINE webhook 署名検証 / ETL / 集計ジョブ）    │
      └──────────────────────────────────────────────────┘
                  ▲ data-import（B4A/キレイパスCSV → staging → ETL）
```

---

## 1. なぜこの形か（3軸それぞれの根拠）

### 連携面 — 「最良の連携は、連携を無くすこと」
hisrecoveries と Field CX を別システムにして API/webhook で繋ぐと、二重書き込み・同期ズレ・
結果整合バグ・認証の橋渡しが永久の税金になる。**同一DBの上の2つの顔**にすれば、
「院のコメントが患者に出る」は同期ではなく **SELECT（射影）** になる。二面配信設計
（two-sided-delivery.md の audience × visibility × surface_when）はこの形でだけ素直に実装できる。

### セキュリティ — 境界を「1種類の強い壁」に集約
壁を増やすより、**RLS という1枚の壁を確実に効かせる**方が事故が少ない（壁が多いと
「どこかで開いてるのに誰も気づかない」が起きる）。RLS + 4つの分離（§2）で多層化する。

### データ保存 — 堀は1本の背骨にしか貯まらない
成果ラベル付き会話データ（堀#1）は「院の入力 × 患者の反応」が同一キーで結合できて
初めて成立する。DBを分けた瞬間、この蓄積は分断される。

## 2. セキュリティ設計（4つの分離 + 原則）

| # | 分離 | 実装 |
|---|---|---|
| 1 | **テナント分離** | 全テーブル RLS。`org_id = (select auth.jwt()->>'org_id')` 型の単純ポリシー + org_id 先頭複合インデックス |
| 2 | **プリンシパル分離** | 患者と院スタッフは**同じAuthでも別 role**。患者JWTは `customer_id` クレームを持ち、`recoveries` スキーマの自分の射影ビューしか読めない。院JWTは `org_id` + role(owner/staff)。**1つのセッションが両面を跨がない** |
| 3 | **スキーマ×DBロール分離**（巻き添え半径） | `field_cx_app` ロールは recoveries の実表に触れない（定義済みビュー/RPCのみ）。`recoveries_app` は読み取り中心。`service_role` はサーバ側ジョブ（ETL・集計・削除カスケード）専用でクライアントに絶対出さない |
| 4 | **サーフェス分離** | 別サブドメイン・別Next.jsアプリ（モノレポ内）。患者面に院面のコード・権限ロジックを同梱しない |

**原則（全機能共通）**
- 患者への表示は**既定 internal**。`shared` への昇格は明示アクション + 同意ゲート（サーバ403強制）
- 写真は Storage の `org_id/customer_id/` プレフィックス + **短寿命署名URL**のみ。公開バケット禁止
- LINEチャネルトークン等の秘匿値はアプリ層でも暗号化して保存。環境変数は Vercel/Supabase の secret 管理
- 監査ログ: 閲覧・共有・出力・運営impersonate を `shared.audit_logs` に（1年保持）
- スタッフ/オーナーは 2FA 推奨（Pro契約は必須化）。患者ログインは LINEログイン第一候補（既にLINE接点がある）
- 環境は dev / staging / prod の3系統（Supabaseブランチ or 3プロジェクト）。本番データをdevに複製しない

## 3. データ保存設計

| 項目 | 決定 |
|---|---|
| System of record | 共有Postgres（1プロジェクト）。**将来hisrecoveriesの既存バックエンドと二重管理にしない**（§5） |
| 成長テーブル | `funnel_events` / `roleplay_turns` / `deliveries` / `metrics_daily` は追記専用 + 日付パーティション可能な設計 |
| 分析経路 | 生データ直読み禁止。copilot・ダッシュボードは `metrics_daily` ロールアップを読む |
| 横断ベンチマーク | RLSを跨ぐため service_role の集計ジョブ → 匿名化 `shared.benchmarks` へ（利用規約に統計利用同意を初版から） |
| 成果ラベル | roleplay/ai-minutes の記録に counseling_records.outcome へ結合できるキーを初日から持たせる（堀#1） |
| バックアップ | PITR（Supabase Pro）+ 日次スナップショット。RPO 24h / RTO 12h |
| 保持・削除 | 解約後90日で削除。**患者単位の削除カスケード**（field-cx側エビデンス・recoveries側・Storage写真を横断）を初日に実装。要配慮情報のため物理削除 |
| ベクトル/コーパス | 会話コーパスの類似検索（将来）は専用テーブルに隔離し、肥大時は外部ストアへ逃がす（後から可能） |

## 4. 連携設計

| 連携 | 形 |
|---|---|
| hisrecoveries ⇄ Field CX | **連携しない（同一DBの射影）**。患者面は `recoveries` スキーマのビュー経由で読む |
| B4A / キレイパス等（外部） | data-import: CSV → `shared.import_staging` → service_role ETL → `metrics_daily`。**外部データを患者面に直接流さない**（必ず院面の承認済みデータ経由） |
| LINE | 店舗ごとの公式アカウント。webhook は Edge Function で署名検証。送信は同意ゲート通過分のみ |
| 決済 | Stripe webhook → `shared.entitlements` 同期（既設計どおり） |

## 5. 既存 hisrecoveries の取り込み方（移行判断）

hisrecoveries が既に別バックエンドで動いている場合の判断ルール:

- **患者数が小さい/初期（〜数百人）** → **背骨に畳み込む**（推奨）。患者アカウントとデータを
  共有Postgresへ移行し、既存バックエンドは廃止。二重管理の期間を最短にする
- **既に大きい/移行が重い** → 過渡期のみ「腐敗防止層」（背骨側に patient_accounts を正とし、
  旧システムは読み取り専用でリダイレクト）。**恒久ブリッジは作らない**（連携税が堀の蓄積を壊す）

いずれでも: **hisrecoveries のドメインとブランドは残す**。変わるのは中身の背骨だけ。

## 6. やらないこと

- 別DB2本 + 同期ジョブ（結果整合の泥沼）
- 患者面から Field CX 内部APIを呼ぶ（プリンシパル混線）
- 1つの神アプリで if(role) 出し分け（RSC境界・権限・トーンが絡まる）
- service_role キーのクライアント露出／公開Storageバケット
- 匿名化なしのテナント横断クエリ

## 7. 承認後の実装順（M0への写像）

1. モノレポ骨格 + `packages/{ui,toppings,auth,db}`（toppings は実装済みを移設）
2. 共有スキーマ v1（shared/field-cx/recoveries）+ RLS + ロール3種 + 監査
3. 患者面: 既存 /share・/c/guide を `recoveries` ビュー読みに載せ替え（見た目は不変）
4. 院面: Field CX デモを実データ化（既存 M0〜M2 計画どおり）
5. 削除カスケード + バックアップ検証（リストア演習1回）
