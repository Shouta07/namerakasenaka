"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";
import {
  type DemoClient,
  type DemoProgressPhoto,
  type DemoTreatmentRecord,
} from "@/lib/demo/fixtures";
import {
  useAllStoredProgressPhotos,
  useAllStoredSelfLogs,
  useAllStoredTreatmentRecords,
} from "@/lib/demo/store";
import {
  computeClientImprovement,
  trendLabel,
  type EvidencePhoto,
  type EvidenceSelfLog,
  type EvidenceTreatmentRecord,
} from "@/lib/evidence";

/**
 * Single-page A4-friendly progress report. Designed to be saved to PDF via
 * the browser's "Print → Save as PDF" dialog.
 *
 * Sections:
 *  1. プロフィール
 *  2. 進捗サマリ (computed via the evidence engine)
 *  3. Before / After 写真 (2×2 grid)
 *  4. 自覚改善度の推移 (CSS-only bar table)
 *  5. 来店履歴
 *  6. Footer with disclaimer (every print page where possible).
 *
 * No PDF library — only Tailwind + a tiny print stylesheet.
 */
export function ProgressReport({
  salonName,
  client,
  seedPhotos,
  seedRecords,
}: {
  salonName: string;
  client: DemoClient;
  seedPhotos: DemoProgressPhoto[];
  seedRecords: DemoTreatmentRecord[];
}) {
  const storedPhotos = useAllStoredProgressPhotos();
  const storedSelfLogs = useAllStoredSelfLogs();
  const storedRecords = useAllStoredTreatmentRecords();

  const evPhotos: EvidencePhoto[] = useMemo(
    () => [
      ...seedPhotos.map((p) => ({
        id: p.id,
        takenAt: p.takenAt,
        photoType: p.photoType,
        selfRating: p.selfRating,
      })),
      ...storedPhotos
        .filter((p) => p.clientId === client.id)
        .map((p) => ({
          id: p.id,
          takenAt: p.takenAt,
          photoType: p.photoType,
          selfRating: p.selfRating ?? null,
        })),
    ],
    [client.id, seedPhotos, storedPhotos],
  );

  const evSelfLogs: EvidenceSelfLog[] = useMemo(
    () =>
      storedSelfLogs
        .filter((s) => s.clientId === client.id)
        .map((s) => ({
          id: s.id,
          loggedOn: s.loggedOn,
          itchScore: s.itchScore,
          rednessScore: s.rednessScore,
        })),
    [client.id, storedSelfLogs],
  );

  const evRecords: EvidenceTreatmentRecord[] = useMemo(
    () => [
      ...seedRecords.map((r) => ({ id: r.id, performedAt: r.performedAt })),
      ...storedRecords
        .filter((r) => r.clientId === client.id)
        .map((r) => ({ id: r.id, performedAt: r.performedAt })),
    ],
    [client.id, seedRecords, storedRecords],
  );

  const summary = useMemo(
    () =>
      computeClientImprovement({
        photos: evPhotos,
        selfLogs: evSelfLogs,
        treatmentRecords: evRecords,
        courseStartedAt: client.startedOn,
        sessionsCompleted: client.sessionsCompleted,
        sessionsTotal: client.sessionsTotal,
      }),
    [
      client.sessionsCompleted,
      client.sessionsTotal,
      client.startedOn,
      evPhotos,
      evRecords,
      evSelfLogs,
    ],
  );

  // Sorted photos for the Before/After grid.
  const photosSortedAsc = useMemo(
    () => evPhotos.slice().sort((a, b) => a.takenAt.localeCompare(b.takenAt)),
    [evPhotos],
  );
  const beforePhotos = photosSortedAsc.slice(0, 2);
  const afterPhotos = photosSortedAsc.slice(-2).reverse();

  const allRecordsSortedDesc = useMemo(
    () =>
      evRecords
        .slice()
        .sort((a, b) => b.performedAt.localeCompare(a.performedAt))
        .slice(0, 8),
    [evRecords],
  );

  const selfLogsSortedAsc = useMemo(
    () => evSelfLogs.slice().sort((a, b) => a.loggedOn.localeCompare(b.loggedOn)),
    [evSelfLogs],
  );

  const tl = trendLabel(summary.trend);

  const todayLabel = new Date().toLocaleDateString("ja-JP");
  const issuerName = "サロン管理者";

  return (
    <div className="bg-stone-100 print:bg-white">
      {/* Print-only stylesheet */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print-hide { display: none !important; }
          .print-page {
            background: white !important;
            box-shadow: none !important;
            border: 0 !important;
            margin: 0 !important;
            padding: 14mm 12mm !important;
            width: 100% !important;
          }
          .print-section { page-break-inside: avoid; }
          @page { size: A4; margin: 14mm; }
        }
      `}</style>

      <div className="mx-auto max-w-4xl px-4 py-4 print:px-0 print:py-0">
        {/* Header bar (hidden when printing) */}
        <div className="print-hide mb-4 flex flex-wrap items-center justify-between gap-2">
          <Link
            href={`/admin/clients/${client.id}`}
            className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700"
          >
            <ArrowLeft className="h-4 w-4" />
            顧客詳細に戻る
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white"
          >
            <Printer className="h-4 w-4" />
            印刷 / PDF 保存
          </button>
        </div>

        <div className="print-hide mb-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
          ブラウザの印刷ダイアログから「PDF として保存」を選ぶと、A4 サイズで
          出力できます。
        </div>

        <article className="print-page rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <header className="border-b border-stone-200 pb-4">
            <p className="text-xs text-stone-500">{salonName}</p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-900">
              {client.displayName} 様 ・ 進捗レポート
            </h1>
            <p className="mt-1 text-xs text-stone-500">
              出力日 {todayLabel} ・ 出力者 {issuerName}
            </p>
          </header>

          <Section title="1. プロフィール">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
              <Row label="コース" value={client.courseName} />
              <Row
                label="開始日"
                value={new Date(client.startedOn).toLocaleDateString("ja-JP")}
              />
              <Row
                label="進捗"
                value={`${client.sessionsCompleted}/${client.sessionsTotal} 回`}
              />
              <Row label="担当" value={client.primaryTherapistName} />
              <Row label="ふりがな" value={client.furigana} />
              <Row label="肌タイプ" value={client.skinType} />
              <Row label="年代" value={client.ageRange} />
              <Row label="経過週数" value={`${summary.weeksTracked} 週`} />
            </dl>
          </Section>

          <Section title="2. 進捗サマリ">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric
                label="経過週数"
                value={`${summary.weeksTracked} 週`}
              />
              <Metric
                label="撮影枚数"
                value={`${summary.photosCount} 枚`}
              />
              <Metric
                label="自覚改善度Δ"
                value={
                  summary.selfRatingDelta == null
                    ? "—"
                    : summary.selfRatingDelta > 0
                      ? `+${summary.selfRatingDelta.toFixed(2)}`
                      : summary.selfRatingDelta.toFixed(2)
                }
              />
              <Metric label="トレンド" value={`${tl.glyph} ${tl.text}`} />
            </div>
          </Section>

          <Section title="3. Before / After 写真">
            {evPhotos.length === 0 ? (
              <p className="text-sm text-stone-500">写真がまだありません。</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {beforePhotos.map((p) => (
                  <PhotoCell key={p.id} url={lookupUrl(p, seedPhotos, storedPhotos)} caption="Before" takenAt={p.takenAt} />
                ))}
                {afterPhotos.map((p) => (
                  <PhotoCell key={p.id} url={lookupUrl(p, seedPhotos, storedPhotos)} caption="After" takenAt={p.takenAt} />
                ))}
              </div>
            )}
          </Section>

          <Section title="4. 自覚改善度の推移">
            {selfLogsSortedAsc.length === 0 ? (
              <p className="text-sm text-stone-500">
                セルフログはまだありません。
              </p>
            ) : (
              <ul className="space-y-1.5">
                {selfLogsSortedAsc.map((s) => (
                  <li key={s.id} className="text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-stone-700">
                        {new Date(s.loggedOn).toLocaleDateString("ja-JP")}
                      </span>
                      <span className="text-stone-500">
                        痒み {s.itchScore} ・ 赤み {s.rednessScore}
                      </span>
                    </div>
                    <div className="mt-1 flex gap-2">
                      <ScoreBar label="痒" value={s.itchScore} />
                      <ScoreBar label="赤" value={s.rednessScore} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="5. 来店履歴 (最新8件)">
            {allRecordsSortedDesc.length === 0 ? (
              <p className="text-sm text-stone-500">
                施術記録はまだありません。
              </p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {allRecordsSortedDesc.map((r) => {
                  const fixture = seedRecords.find((x) => x.id === r.id);
                  return (
                    <li
                      key={r.id}
                      className="flex items-center justify-between border-b border-stone-100 pb-1.5"
                    >
                      <span className="text-stone-700">
                        {new Date(r.performedAt).toLocaleDateString("ja-JP")} ・{" "}
                        {fixture?.menu ?? "施術"}
                      </span>
                      <span className="text-xs text-stone-500">
                        {fixture?.therapistName ?? client.primaryTherapistName}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          <footer className="mt-8 border-t border-stone-200 pt-3 text-[10px] text-stone-500">
            <p>
              本資料は個別の効果効能を保証するものではなく、参考情報です。
              健康に関するご相談は医師等の専門家にお問い合わせください。
            </p>
            <p className="mt-1">
              出力日 {todayLabel} ・ 出力者 {issuerName} ・ {salonName}
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="print-section mt-6">
      <h2 className="text-base font-semibold text-stone-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-stone-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-stone-900">{value}</dd>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
      <p className="text-[10px] text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold leading-none text-stone-900">
        {value}
      </p>
    </div>
  );
}

function PhotoCell({
  url,
  caption,
  takenAt,
}: {
  url: string;
  caption: string;
  takenAt: string;
}) {
  return (
    <div className="rounded-lg border border-stone-200">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={caption}
        className="aspect-[3/4] w-full rounded-t-lg bg-stone-100 object-cover"
      />
      <div className="flex items-center justify-between px-2 py-1.5 text-[10px]">
        <span className="font-medium text-stone-700">{caption}</span>
        <span className="text-stone-500">
          {new Date(takenAt).toLocaleDateString("ja-JP")}
        </span>
      </div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.max(0, (value / 5) * 100));
  return (
    <div className="flex-1">
      <p className="text-[9px] text-stone-500">{label}</p>
      <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-stone-100">
        <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function lookupUrl(
  p: EvidencePhoto,
  seed: DemoProgressPhoto[],
  stored: { id: string; signedUrl: string }[],
): string {
  const fxs = seed.find((x) => x.id === p.id);
  if (fxs) return fxs.signedUrl;
  const stx = stored.find((x) => x.id === p.id);
  return stx?.signedUrl ?? "";
}
