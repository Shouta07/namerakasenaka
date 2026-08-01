import {
  LAB_JUDGEMENT_META,
  LAB_META,
  LAB_ROWS,
  judgeLab,
  labChange,
  type LabView,
} from "@/lib/accord/labtest-fixtures";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/**
 * 取り込んだ検査データの一覧（スマホ向けの縦リスト）。
 *
 * 図やスコアだけを見せると「加工された数字」に見える。
 * 元の検査値をそのまま並べられることが、信用の土台になる。
 * 先頭に出所（いつ・どこの・何項目）を必ず置く。
 */
export function LabDataList({ view = "retest" }: { view?: LabView }) {
  return (
    <div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-2xl bg-stone-50 p-3 text-[11.5px]">
        <div>
          <dt className="text-stone-400">採血日</dt>
          <dd className="font-semibold text-stone-700">
            {fmtDate(LAB_META.collectedOn[view])}
          </dd>
        </div>
        <div>
          <dt className="text-stone-400">結果の受領</dt>
          <dd className="font-semibold text-stone-700">
            {fmtDate(LAB_META.receivedOn[view])}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-stone-400">検査</dt>
          <dd className="font-semibold text-stone-700">
            {LAB_META.panel}（{LAB_META.lab}）
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-stone-400">取り込んだ項目</dt>
          <dd className="font-semibold text-stone-700">
            全 {LAB_META.totalItems} 項目のうち、肌に関わる {LAB_ROWS.length} 項目を表示
          </dd>
        </div>
      </dl>

      <ul className="mt-2 divide-y divide-stone-100">
        {LAB_ROWS.map((r) => {
          const j = judgeLab(r, r[view]);
          const meta = LAB_JUDGEMENT_META[j];
          const change = labChange(r);
          return (
            <li key={r.id} className="py-2.5">
              <div className="flex items-baseline gap-2">
                <span className="text-[13px] font-bold text-stone-900">{r.name}</span>
                <span className="text-[10.5px] text-stone-400">{r.category}</span>
                <span
                  className={`ml-auto whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.chip}`}
                >
                  {meta.label}
                </span>
              </div>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="text-[15px] font-extrabold tabular-nums text-stone-900">
                  {r[view]}
                </span>
                <span className="text-[11px] text-stone-500">{r.unit}</span>
                {view === "retest" && r.first !== r.retest ? (
                  <span className="text-[11px] tabular-nums text-stone-400">
                    （前回 {r.first}・{change.label}）
                  </span>
                ) : null}
                <span className="ml-auto text-[10.5px] tabular-nums text-stone-400">
                  基準 {r.refMin}〜{r.refMax} ／ 目安 {r.optMin}〜{r.optMax}
                </span>
              </div>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-stone-500">
                {r.note}
              </p>
            </li>
          );
        })}
      </ul>

      <p className="mt-2 text-[11px] leading-relaxed text-stone-500">
        検査値の解釈と診断は医師が行います。内容は{LAB_META.reviewedBy}が確認しています。
      </p>
    </div>
  );
}
