"use client";

import { useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * 検査票を落とす場所。
 *
 * 現場の前提:
 * - 施術者は片手が塞がっている。押す場所は大きく、狙いは1つだけ。
 * - ドラッグ&ドロップが分からない人もいる。だから「クリックでも選べる」を
 *   同じ枠の中に置く（別ボタンにすると、どちらが正解か迷わせる）。
 * - 検査票をコピペしたい人もいる。貼り付けも同じ枠で受ける。
 */

const ACCEPT = ".csv,.tsv,.txt,text/csv,text/plain";

export function LabDropZone({
  onText,
  disabled = false,
}: {
  /** 読み取ったテキストと、元のファイル名を渡す。 */
  onText: (text: string, fileName: string) => void;
  disabled?: boolean;
}) {
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function accept(file: File) {
    setError(null);
    if (file.size > 2_000_000) {
      setError("ファイルが大きすぎます（2MB まで）。検査票の該当ページだけを書き出してください。");
      return;
    }
    // PDF は現状そのままでは読めない。黙って失敗させず、次の手を書く。
    if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
      setError(
        "PDF はこの画面では読み取れません。検査票の表を選択してコピーし、下の枠に貼り付けてください。",
      );
      return;
    }
    try {
      const text = await file.text();
      onText(text, file.name);
    } catch {
      setError("ファイルを読み取れませんでした。もう一度お試しください。");
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (disabled) return;
          const file = e.dataTransfer.files?.[0];
          if (file) void accept(file);
        }}
        className={cn(
          "rounded-2xl border-2 border-dashed p-6 text-center transition",
          disabled
            ? "border-stone-200 bg-stone-50 opacity-60"
            : over
              ? "border-brand-500 bg-brand-50"
              : "border-stone-300 bg-white",
        )}
      >
        <Upload
          className={cn(
            "mx-auto h-7 w-7",
            over ? "text-brand-700" : "text-stone-400",
          )}
          aria-hidden
        />
        <p className="mt-2 text-sm font-bold text-stone-900">
          検査結果のファイルをここにドラッグ
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-stone-500">
          CSV・TSV・テキストに対応。患者さんに入力していただく必要はありません。
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 text-[13px] font-bold text-stone-700 transition hover:border-brand-500 disabled:opacity-50"
        >
          <FileText className="h-4 w-4" aria-hidden />
          ファイルを選ぶ
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void accept(file);
            e.target.value = "";
          }}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[12px] leading-relaxed text-amber-900"
        >
          {error}
        </p>
      ) : null}

      <details className="mt-3">
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-[12.5px] font-bold text-brand-700">
          検査票から貼り付ける ▼
        </summary>
        <textarea
          disabled={disabled}
          rows={6}
          placeholder={"フェリチン\t42\tng/ml\nビタミンD\t18\tng/ml\n亜鉛\t62\tμg/dl"}
          onChange={(e) => {
            const text = e.target.value;
            if (text.trim().length > 0) onText(text, "貼り付け");
          }}
          className="mt-2 w-full rounded-xl border border-stone-200 p-3 font-mono text-[12px] leading-relaxed focus:border-brand-500 focus:outline-none disabled:opacity-50"
        />
        <p className="text-[11.5px] leading-relaxed text-stone-500">
          1行に「項目名・値・単位」。区切りはタブ / カンマ / 空白2つ以上のどれでも読みます。
        </p>
      </details>
    </div>
  );
}
