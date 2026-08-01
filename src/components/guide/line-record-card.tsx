import { LINE_FORMATS, renderLineExample } from "@/lib/line/formats";

/**
 * LINE で届く記入フォーマットと、その記録先の説明。
 *
 * Web は入力を持たない。だからこそ「どこで・どう答えると・どこに残るか」を
 * ここで示しておかないと、記録が続かない。
 */
export function LineRecordCard() {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4">
      <h2 className="text-sm font-bold text-stone-900">
        💬 記録は LINE から届きます
      </h2>
      <p className="mt-1 text-[12px] leading-relaxed text-stone-500">
        この画面に入力するところはありません。LINE に届く形に沿って返信いただくと、
        そのままここに記録されます。
      </p>

      <div className="mt-3 space-y-3">
        {LINE_FORMATS.map((f) => (
          <div key={f.id} className="rounded-2xl bg-stone-50 p-3">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <p className="text-[13px] font-bold text-stone-900">{f.title}</p>
              <span className="text-[11px] text-stone-400">{f.when}</span>
            </div>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-stone-600">
              {f.why}
            </p>
            <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-white px-3 py-2 text-[11.5px] leading-relaxed text-stone-700">
              {renderLineExample(f)}
            </pre>
            <p className="mt-1.5 text-[11px] text-stone-500">
              → {f.recordedTo}に残ります
            </p>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-stone-500">
        書き方が崩れても大丈夫です。読み取れたぶんだけ記録し、足りないところは
        空のままにします。答えられない週は、返信しなくてかまいません。
      </p>
    </section>
  );
}
