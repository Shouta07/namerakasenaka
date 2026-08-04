"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { LabDropZone } from "./lab-drop-zone";
import {
  ingestWarnings,
  parseLabReport,
  type LabParseResult,
} from "@/lib/labtest/parse";
import {
  CONSENT_DESCRIPTION,
  CONSENT_SCOPE_LABEL,
  canPublishLabtest,
} from "@/lib/labtest/consent";
import {
  addStoredLabImport,
  grantConsent,
  removeStoredLabImport,
  revokeConsent,
  setLabImportPublished,
  useHydrated,
  useStoredConsents,
  useStoredLabImports,
} from "@/lib/demo/store";
import { LAB_ROWS, judgeLab } from "@/lib/vitality-design/labtest-fixtures";
import { labPublishedText } from "@/lib/line/send";
import { isDemoMode } from "@/lib/demo";
import { cn } from "@/lib/utils/cn";

const ROW_BY_ID = new Map(LAB_ROWS.map((r) => [r.id, r]));

/**
 * 検査結果の取り込み — 落とす → 確認する → 同意を確かめて出す。
 *
 * この画面が守っている約束:
 * 1. 患者は入力しない。データは必ずここ（施術者側）から入る。
 * 2. 落としただけでは患者に見えない。人が目で確認する段が必ず挟まる。
 * 3. 同意が無ければ公開できない。ボタンを隠すだけでなく、API が 403 を返す。
 * 4. 読めなかった行を黙って捨てない。何行落としたかを必ず出す。
 */
export function LabImportFlow({
  customerId,
  customerName,
  staffName,
}: {
  customerId: string;
  customerName: string;
  staffName: string;
}) {
  const hydrated = useHydrated();
  const consents = useStoredConsents();
  const imports = useStoredLabImports();

  const [parsed, setParsed] = useState<LabParseResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [collectedOn, setCollectedOn] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [busy, setBusy] = useState(false);

  const consent = canPublishLabtest(consents, customerId);
  const mine = useMemo(
    () =>
      imports
        .filter((r) => r.customerId === customerId)
        .sort((a, b) => b.collectedOn.localeCompare(a.collectedOn)),
    [imports, customerId],
  );

  const warnings = parsed ? ingestWarnings(parsed) : [];

  function handleText(text: string, name: string) {
    setParsed(parseLabReport(text));
    setFileName(name);
  }

  /**
   * 取り込みを保存する。
   *
   * 必ず API を通す。以前はここが localStorage への書き込みだけで、
   * 本番では検査がどこにも残らなかった。保存の入口はサーバに一本化する。
   */
  async function save() {
    if (!parsed || parsed.values.length === 0) return;
    const values = parsed.values.map((v) => ({
      rowId: v.rowId,
      value: v.value,
      sourceLabel: v.sourceLabel,
      sourceUnit: v.sourceUnit,
    }));
    setBusy(true);
    try {
      // お試し中は、検査値をサーバへ送らない。
      //
      // 試用のお客様が、実際の患者さんの検査票を落とすことが十分にあり得る。
      // 契約前に要配慮個人情報が当社のサーバを通ると、
      // リクエストのログに残る可能性まで含めて、こちらの責任になる。
      // 取り込みの API には同意ゲートが無く、通しても得るものが無いので、
      // お試しではブラウザの中だけで完結させる。
      // （同意ゲートのある公開の API は、お試しでも通す。効いていることを
      //   確かめられなくなるため。あちらは検査値を運ばない。）
      if (isDemoMode()) {
        addStoredLabImport({
          customerId,
          collectedOn,
          values,
          sourceFileName: fileName,
          unparsedCount: parsed.unparsed.length,
          importedBy: staffName,
        });
      } else {
        const res = await fetch("/api/labtest/imports", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            customerId,
            collectedOn,
            values,
            sourceFileName: fileName,
            unparsedCount: parsed.unparsed.length,
            importedByName: staffName,
          }),
        });
        const json = (await res.json()) as { ok?: boolean };
        if (!res.ok || !json.ok) {
          toast.error("取り込みを保存できませんでした。もう一度お試しください。");
          return;
        }
      }
      const count = parsed.values.length;
      setParsed(null);
      setFileName("");
      toast.success(
        `${count} 項目を取り込みました。まだ ${customerName} 様には表示されていません。`,
      );
    } finally {
      setBusy(false);
    }
  }

  /**
   * 公開 / 取り下げ。同意の判定はサーバに投げる —
   * 画面側で判定を済ませてしまうと、同意ゲートが「見た目だけ」になる。
   */
  async function togglePublish(importId: string, published: boolean) {
    setBusy(true);
    try {
      const res = await fetch("/api/labtest/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ importId, customerId, published, consents }),
      });
      if (res.status === 403) {
        const body = (await res.json()) as { reason?: string };
        toast.error(body.reason ?? "同意が確認できないため公開できません。");
        return;
      }
      if (!res.ok) {
        toast.error("公開状態を変更できませんでした。");
        return;
      }
      setLabImportPublished(importId, published);
      toast.success(
        published
          ? `${customerName} 様の画面に表示しました。`
          : "表示を取り下げました。",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4">
      {/* 1. 同意の状態 — 何より先に見えるべきもの */}
      <ConsentPanel
        customerId={customerId}
        customerName={customerName}
        staffName={staffName}
      />

      {/* 2. 落とす */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-bold text-stone-900">検査結果を取り込む</h2>
        <p className="mt-1 text-[12px] leading-relaxed text-stone-500">
          取り込んでも、すぐには {customerName} 様の画面に出ません。
          内容を確認し、同意を確かめてから公開します。
        </p>
        <div className="mt-3">
          <LabDropZone onText={handleText} disabled={busy} />
        </div>
      </div>

      {/* 3. 確認 — 人が目で見る段 */}
      {parsed ? (
        <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-5">
          <h2 className="text-sm font-bold text-stone-900">
            読み取った内容をご確認ください
          </h2>
          <p className="mt-1 text-[12px] text-stone-600">
            {fileName} — {parsed.values.length} 項目を認識
          </p>

          {warnings.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {warnings.map((w) => (
                <li
                  key={w}
                  className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[12px] leading-relaxed text-amber-900"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {parsed.values.length > 0 ? (
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-[440px] border-collapse text-[12px]">
                <thead>
                  <tr className="bg-white/70 text-stone-500">
                    <th className="border border-stone-200 px-2 py-1.5 text-left font-medium">
                      検査票の項目
                    </th>
                    <th className="border border-stone-200 px-2 py-1.5 text-right font-medium">
                      値
                    </th>
                    <th className="border border-stone-200 px-2 py-1.5 text-left font-medium">
                      対応する項目
                    </th>
                    <th className="border border-stone-200 px-2 py-1.5 text-left font-medium">
                      判定
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.values.map((v) => {
                    const row = ROW_BY_ID.get(v.rowId)!;
                    const j = judgeLab(row, v.value);
                    return (
                      <tr key={v.rowId} className="bg-white">
                        <td className="border border-stone-200 px-2 py-1.5">
                          {v.sourceLabel}
                          {v.converted ? (
                            <span className="ml-1 rounded bg-amber-100 px-1 text-[10px] font-bold text-amber-800">
                              単位換算
                            </span>
                          ) : null}
                        </td>
                        <td className="border border-stone-200 px-2 py-1.5 text-right tabular-nums">
                          {v.value} {row.unit}
                        </td>
                        <td className="border border-stone-200 px-2 py-1.5 text-stone-600">
                          {row.name}
                        </td>
                        <td className="border border-stone-200 px-2 py-1.5">
                          <JudgeChip judgement={j} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}

          {parsed.unparsed.length > 0 ? (
            <details className="mt-3">
              <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-[12.5px] font-bold text-stone-700">
                読み取れなかった {parsed.unparsed.length} 行を見る ▼
              </summary>
              <ul className="mt-1 space-y-1">
                {parsed.unparsed.slice(0, 30).map((u) => (
                  <li
                    key={`${u.line}-${u.text}`}
                    className="rounded bg-white px-2 py-1 font-mono text-[11px] text-stone-500"
                  >
                    <span className="mr-2 text-stone-400">{u.line}行目</span>
                    {u.text}
                    <span className="ml-2 text-stone-400">（{u.reason}）</span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="text-[12px] font-bold text-stone-700">
              採血日
              <input
                type="date"
                value={collectedOn}
                onChange={(e) => setCollectedOn(e.target.value)}
                className="ml-2 h-11 rounded-lg border border-stone-200 px-3 text-[13px] focus:border-brand-500 focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => void save()}
              disabled={parsed.values.length === 0}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand-700 px-5 text-[13px] font-bold text-white transition hover:bg-brand-500 disabled:opacity-40"
            >
              <Check className="h-4 w-4" aria-hidden />
              この内容で取り込む
            </button>
            <button
              type="button"
              onClick={() => setParsed(null)}
              className="inline-flex min-h-11 items-center px-2 text-[12.5px] font-bold text-stone-500 hover:text-stone-700"
            >
              やめる
            </button>
          </div>
        </div>
      ) : null}

      {/* 4. 取り込み済み — 公開状態がひと目で分かること */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-bold text-stone-900">取り込み済みの検査</h2>
        {!hydrated ? (
          <p className="mt-2 text-[12px] text-stone-400">読み込み中…</p>
        ) : mine.length === 0 ? (
          <p className="mt-2 text-[12px] leading-relaxed text-stone-500">
            まだ取り込まれていません。上の枠に検査結果のファイルを落としてください。
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {mine.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-stone-200 p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13px] font-bold text-stone-900">
                    {r.collectedOn} 採血
                  </p>
                  <span className="text-[11.5px] text-stone-500">
                    {r.values.length} 項目
                    {r.unparsedCount > 0
                      ? ` ・ 未取り込み ${r.unparsedCount} 行`
                      : ""}
                  </span>
                  <span
                    className={cn(
                      "ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
                      r.publishedAt
                        ? "bg-[#e8f2e8] text-[#3c6347]"
                        : "bg-stone-100 text-stone-600",
                    )}
                  >
                    {r.publishedAt ? (
                      <Eye className="h-3 w-3" aria-hidden />
                    ) : (
                      <EyeOff className="h-3 w-3" aria-hidden />
                    )}
                    {r.publishedAt ? "ご本人に表示中" : "未公開"}
                  </span>
                </div>
                <p className="mt-1 text-[11.5px] text-stone-400">
                  {r.sourceFileName} ・ 取り込み {r.importedBy}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={busy || (!r.publishedAt && !consent.ok)}
                    onClick={() => void togglePublish(r.id, !r.publishedAt)}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-[12.5px] font-bold transition disabled:opacity-40",
                      r.publishedAt
                        ? "border border-stone-300 text-stone-700 hover:border-stone-500"
                        : "bg-brand-700 text-white hover:bg-brand-500",
                    )}
                  >
                    {r.publishedAt ? "表示を取り下げる" : "ご本人の画面に表示する"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void (async () => {
                        if (!isDemoMode()) {
                          const res = await fetch(
                            `/api/labtest/imports?importId=${encodeURIComponent(r.id)}`,
                            { method: "DELETE" },
                          );
                          if (!res.ok) {
                            toast.error("削除できませんでした。");
                            return;
                          }
                        }
                        removeStoredLabImport(r.id);
                        toast("取り込みを削除しました");
                      })();
                    }}
                    aria-label="この取り込みを削除"
                    className="tap-44 rounded-full p-1 text-stone-400 hover:text-stone-700"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                {!r.publishedAt && !consent.ok ? (
                  <p className="mt-2 text-[11.5px] leading-relaxed text-amber-800">
                    {consent.reason}
                  </p>
                ) : null}
                {r.publishedAt ? (
                  <NotifyButton
                    customerId={customerId}
                    customerName={customerName}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/**
 * 公開したことを LINE でお知らせする。
 *
 * 送るのは**リンクだけ**。検査の数値は本文に入れない
 * （トーク履歴は端末に残り、退会後も消せないため）。
 * 同意の判定はサーバに任せる — 画面で判定すると、ゲートが見た目だけになる。
 */
function NotifyButton({
  customerId,
  customerName,
}: {
  customerId: string;
  customerName: string;
}) {
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true);
    try {
      const url = `${window.location.origin}/c/guide`;
      const res = await fetch("/api/line/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customerId,
          text: labPublishedText(customerName, url),
        }),
      });
      const json = (await res.json()) as { ok?: boolean; reason?: string };
      if (!res.ok || !json.ok) {
        toast.error(json.reason ?? "お知らせを送れませんでした。");
        return;
      }
      toast.success(`${customerName} 様の LINE にお知らせしました。`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void send()}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-stone-300 px-4 text-[12.5px] font-bold text-stone-700 transition hover:border-brand-500 disabled:opacity-40"
      >
        <Send className="h-3.5 w-3.5" aria-hidden />
        LINEでお知らせする
      </button>
      <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
        お送りするのはページへのリンクだけです。検査の数値は LINE に残しません。
      </p>
    </div>
  );
}

function JudgeChip({ judgement }: { judgement: "optimal" | "watch" | "out" }) {
  const map = {
    optimal: { label: "適正", cls: "bg-[#e8f2e8] text-[#3c6347]" },
    watch: { label: "基準内・適正外", cls: "bg-[#faf1e4] text-[#8a6a34]" },
    out: { label: "基準外", cls: "bg-[#f3e9e4] text-[#8c5a3c]" },
  } as const;
  const m = map[judgement];
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", m.cls)}>
      {m.label}
    </span>
  );
}

/**
 * 同意の確認。取り込みの前に置く。
 * 「同意を取ってから入れる」という順番自体を、画面の並びで教える。
 */
function ConsentPanel({
  customerId,
  customerName,
  staffName,
}: {
  customerId: string;
  customerName: string;
  staffName: string;
}) {
  const consents = useStoredConsents();
  const hydrated = useHydrated();
  const scope = "labtest_view" as const;

  const active = consents
    .filter(
      (c) => c.customerId === customerId && c.scope === scope && !c.revokedAt,
    )
    .sort((a, b) => b.grantedAt.localeCompare(a.grantedAt))[0];

  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        active ? "border-[#cfe0cf] bg-[#f3f8f3]" : "border-amber-200 bg-amber-50",
      )}
    >
      <div className="flex items-start gap-2">
        <ShieldCheck
          className={cn(
            "mt-0.5 h-5 w-5 flex-none",
            active ? "text-[#3c6347]" : "text-amber-700",
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-stone-900">
            {CONSENT_SCOPE_LABEL[scope]}
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-stone-600">
            {CONSENT_DESCRIPTION[scope]}
          </p>

          {!hydrated ? null : active ? (
            <div className="mt-3">
              <p className="text-[12.5px] font-bold text-[#3c6347]">
                同意を確認済み
              </p>
              <p className="mt-0.5 text-[11.5px] text-stone-500">
                {new Date(active.grantedAt).toLocaleDateString("ja-JP")} ・
                {active.method} ・ 確認 {active.grantedBy}
              </p>
              <button
                type="button"
                onClick={() => {
                  void (async () => {
                    const res = await fetch("/api/consents", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({
                        consentId: active.id,
                        customerId,
                      }),
                    });
                    if (!res.ok) {
                      toast.error("同意を取り消せませんでした。");
                      return;
                    }
                    revokeConsent(active.id);
                    toast("同意を取り消しました。表示中の検査結果も見えなくなります。");
                  })();
                }}
                className="mt-2 inline-flex min-h-11 items-center px-1 text-[12.5px] font-bold text-stone-500 underline hover:text-stone-700"
              >
                同意を取り消す
              </button>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-[12.5px] font-bold text-amber-900">
                まだ同意を確認できていません
              </p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-stone-600">
                {customerName} 様に上の内容をお読みいただき、口頭で確認できたら記録してください。
              </p>
              <button
                type="button"
                onClick={() => {
                  void (async () => {
                    const res = await fetch("/api/consents", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({
                        customerId,
                        scope,
                        method: "店頭で口頭確認",
                        grantedByName: staffName,
                      }),
                    });
                    const json = (await res.json()) as {
                      ok?: boolean;
                      mode?: string;
                    };
                    if (!res.ok || !json.ok) {
                      toast.error("同意を記録できませんでした。");
                      return;
                    }
                    if (json.mode === "demo") {
                      grantConsent({
                        customerId,
                        scope,
                        grantedBy: staffName,
                        method: "店頭で口頭確認",
                      });
                    }
                    toast.success("同意を記録しました");
                  })();
                }}
                className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand-700 px-5 text-[13px] font-bold text-white transition hover:bg-brand-500"
              >
                <Check className="h-4 w-4" aria-hidden />
                口頭で同意を確認しました
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
