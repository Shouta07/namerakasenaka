"use client";

import Link from "next/link";
import { demoOrganization } from "@/lib/demo/fixtures";
import type { RecoveryGuideJson } from "@/lib/guide/schema";
import type { DailyCheckRecord, GuideMessageRecord } from "@/lib/guide/source";
import { LessonsCard } from "@/components/lessons/lessons-card";
import { DailyCheckCard, type DailyCheckSubmit } from "./daily-check-card";
import { ChangeRecordCard } from "./change-record-card";
import { CompanionMessagesCard } from "./companion-messages-card";
import { ResultMappingCard } from "./result-mapping-card";
import { DAILY_CHECK_ANCHOR_ID, TodaysOneThing } from "./todays-one-thing";

/**
 * 回復ガイド本体のセクション群。
 *
 * /share/[token]（スタンドアロン）と /c/guide（クライアントシェル内）の
 * 両方から描画される。挨拶ヘッダ・三社フッタなど「枠」は各ページが持ち、
 * ここはガイド JSON のコンテンツだけを担当する。
 */
export function GuideContent({
  guide,
  today,
  todayCheck,
  checks,
  onCheckSubmit,
  selfLogHref,
  companionMessages,
  shareToken,
  guideCustomerId,
}: {
  guide: RecoveryGuideJson;
  /** YYYY-MM-DD — 今日のチェックの粒度。 */
  today: string;
  todayCheck: DailyCheckRecord | null;
  checks: DailyCheckRecord[];
  onCheckSubmit: (input: DailyCheckSubmit) => Promise<void>;
  /** /c/guide ではセルフログへの導線を出す（共有ページでは出さない）。 */
  selfLogHref?: string;
  /** 伴走ループ — サロンからのお返事メッセージ。空配列でも空状態を描く。 */
  companionMessages?: GuideMessageRecord[];
  /** /share/[token] からの呼び出しのみ — 既読化 API の認証に渡す。 */
  shareToken?: string;
  /** 🌱 腸のおはなし — 学習進捗のキー。null/未指定ならレッスンセクションを描かない。 */
  guideCustomerId?: string | null;
}) {
  return (
    <>
      {/* 1. 今日のまとめ */}
      <SoftCard accent>
        <Eyebrow>今日のまとめ</Eyebrow>
        <Paragraphs text={guide.today_summary} lead />
      </SoftCard>

      {/* 1.5 きょうのひとつ — 今なにをすればいいかをひとつだけ */}
      <TodaysOneThing
        actions={guide.weekly_actions}
        today={today}
        todayCheck={todayCheck}
      />

      {/* 1.7 🌱 腸のおはなし — 学習レッスン（顧客IDがある時だけ） */}
      {guideCustomerId ? (
        <LessonsCard guideCustomerId={guideCustomerId} />
      ) : null}

      {/* 2. あなたの身体で起きていること */}
      <SoftCard>
        <Eyebrow>あなたの身体で起きていること</Eyebrow>
        <Paragraphs text={guide.current_body_state} />
        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#7da589]">
            やさしい解説
          </p>
          {guide.easy_explanations.map((e) => (
            <details
              key={e.term}
              className="group rounded-2xl border border-[#e3ece3] bg-[#fafcfa] px-4 py-3"
            >
              <summary className="flex min-h-[28px] cursor-pointer list-none items-center justify-between text-base font-medium text-stone-700 [&::-webkit-details-marker]:hidden">
                {e.term}
                <span
                  aria-hidden
                  className="ml-2 text-[#7da589] transition-transform group-open:rotate-45"
                >
                  ＋
                </span>
              </summary>
              <p className="mt-2 text-base leading-relaxed text-stone-600">
                {e.explanation}
              </p>
            </details>
          ))}
        </div>
      </SoftCard>

      {/* 2.5 あなたの結果とつながり — 検査結果 → 原因 → 対策の視覚マップ */}
      {guide.result_mappings && guide.result_mappings.length > 0 ? (
        <ResultMappingCard mappings={guide.result_mappings} />
      ) : null}

      {/* 3. 背中ニキビとの関係 */}
      <SoftCard>
        <Eyebrow>背中ニキビとの関係</Eyebrow>
        <Paragraphs text={guide.relation_to_back_acne} />
      </SoftCard>

      {/* 4. 食材 */}
      <SoftCard>
        <Eyebrow>避けた方がよいもの / 食べてよいもの</Eyebrow>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-[#9c5f5f]">いまは控えめに</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {guide.avoid_foods.map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-[#faf1f1] px-3.5 py-1.5 text-sm text-[#8a5a5a]"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-[#3c6347]">どうぞ楽しんで</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {guide.recommended_foods.map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-[#eaf3ea] px-3.5 py-1.5 text-sm text-[#3c6347]"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </SoftCard>

      {/* 5. 今週やること — THE standout */}
      <section className="rounded-3xl border-2 border-[#cfe3cf] bg-gradient-to-b from-[#f3f8f3] to-white p-5 shadow-sm sm:p-6">
        <Eyebrow>今週やること</Eyebrow>
        <p className="mb-4 text-sm leading-relaxed text-stone-500">
          7割できればOK。できない日があっても大丈夫です。
        </p>
        <ol className="space-y-3">
          {guide.weekly_actions.map((action, i) => (
            <li
              key={action}
              className="flex items-center gap-4 rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-[#e3ece3]"
            >
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#5d8a6c] text-base font-bold text-white">
                {i + 1}
              </span>
              <span className="text-lg font-medium leading-snug text-stone-800">
                {action}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* 6. 今日のチェック */}
      <SoftCard id={DAILY_CHECK_ANCHOR_ID}>
        <Eyebrow>今日のチェック</Eyebrow>
        <DailyCheckCard
          today={today}
          existing={todayCheck}
          checks={checks}
          onSubmit={onCheckSubmit}
        />
        {selfLogHref ? (
          <p className="mt-4 text-right">
            <Link
              href={selfLogHref}
              className="text-sm font-medium text-[#587f63] underline underline-offset-2 hover:text-[#3c6347]"
            >
              セルフログを記録 →
            </Link>
          </p>
        ) : null}
      </SoftCard>

      {/* 7. 変化の記録 */}
      <SoftCard>
        <Eyebrow>変化の記録</Eyebrow>
        <ChangeRecordCard checks={checks} guideCustomerId={guideCustomerId ?? null} />
      </SoftCard>

      {/* 7.5 サロンからのお返事 — 伴走ループの顧客側エンドポイント */}
      {companionMessages ? (
        <CompanionMessagesCard
          messages={companionMessages}
          shareToken={shareToken}
        />
      ) : null}

      {/* 8. 次回カウンセリング */}
      <SoftCard>
        <Eyebrow>次回カウンセリングで話すこと</Eyebrow>
        <ul className="space-y-2.5">
          {guide.next_counseling_points.map((p) => (
            <li key={p} className="flex gap-2.5 text-base leading-relaxed text-stone-700">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#7da589]" />
              {p}
            </li>
          ))}
        </ul>
      </SoftCard>

      {/* 9. 今月の方針 */}
      <SoftCard>
        <Eyebrow>今月の方針</Eyebrow>
        <Paragraphs text={guide.monthly_policy} />
      </SoftCard>

      {/* 10. 励ましのメッセージ */}
      <div className="rounded-3xl bg-[#eaf3ea] p-5 sm:p-6">
        <Paragraphs text={guide.encouraging_message} lead />
        <p className="mt-3 text-right text-sm text-[#587f63]">
          — {demoOrganization.shortName}
        </p>
      </div>
    </>
  );
}

// ---------- shared presentation helpers ----------

export function SoftCard({
  children,
  accent = false,
  id,
}: {
  children: React.ReactNode;
  accent?: boolean;
  /** アンカーリンク（scrollIntoView）用の DOM id。 */
  id?: string;
}) {
  return (
    <section
      id={id}
      className={
        accent
          ? "scroll-mt-4 rounded-3xl border-2 border-[#cfe3cf] bg-white p-5 shadow-sm sm:p-6"
          : "scroll-mt-4 rounded-3xl border border-[#e3ece3] bg-white/90 p-5 shadow-sm sm:p-6"
      }
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-lg font-semibold leading-snug text-stone-800">{children}</h2>
  );
}

/** Splits \n\n paragraphs into airy text blocks — no dense walls of text. */
export function Paragraphs({ text, lead = false }: { text: string; lead?: boolean }) {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className="space-y-3">
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className={
            lead
              ? "text-lg leading-relaxed text-stone-800"
              : "text-base leading-relaxed text-stone-600"
          }
        >
          {p}
        </p>
      ))}
    </div>
  );
}
