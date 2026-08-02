"use client";

import { useMemo } from "react";
import { LAB_ROWS, type LabRow } from "@/lib/accord/labtest-fixtures";
import {
  useStoredConsents,
  useStoredLabImports,
  type StoredLabImport,
} from "@/lib/demo/store";
import { canPublishLabtest } from "./consent";

/**
 * 患者の画面に出してよい検査結果を組み立てる。
 *
 * 二重の関門を通ったものだけが出る:
 * 1. 施術者が「表示する」を押している（publishedAt がある）
 * 2. いま同意が有効である
 *
 * 2 を毎回見るのが要点。過去に公開した検査でも、同意が取り消されたら
 * その瞬間から見えなくなる。公開フラグを立てたまま放置しない。
 */

export type PublishedLabSeries = {
  /** first = ひとつ前、retest = いちばん新しい、に差し替えた行。 */
  rows: LabRow[];
  /** 表示できる行の id。取り込みに無かった項目は含めない。 */
  rowIds: string[];
  latestCollectedOn: string;
  previousCollectedOn: string | null;
  importedBy: string;
  /** 取り込み全体の項目数（表示している数と食い違うことを隠さない）。 */
  totalValues: number;
};

const BY_ID = new Map(LAB_ROWS.map((r) => [r.id, r]));

/**
 * 取り込み 1〜2件から、レーダーが使える形（first / retest）を作る。
 * 1件しか無いときは first = retest とし、「前回」は無いことを別途伝える。
 */
export function buildSeries(
  imports: StoredLabImport[],
): PublishedLabSeries | null {
  const published = imports
    .filter((r) => r.publishedAt !== null)
    .sort((a, b) => b.collectedOn.localeCompare(a.collectedOn));
  if (published.length === 0) return null;

  const latest = published[0];
  const previous = published[1] ?? null;

  const prevByRow = new Map(
    (previous?.values ?? []).map((v) => [v.rowId, v.value]),
  );

  const rows: LabRow[] = [];
  for (const v of latest.values) {
    const base = BY_ID.get(v.rowId);
    if (!base) continue; // 辞書に無い項目は、意味づけができないので出さない
    rows.push({
      ...base,
      retest: v.value,
      first: prevByRow.get(v.rowId) ?? v.value,
    });
  }
  if (rows.length === 0) return null;

  return {
    rows,
    rowIds: rows.map((r) => r.id),
    latestCollectedOn: latest.collectedOn,
    previousCollectedOn: previous?.collectedOn ?? null,
    importedBy: latest.importedBy,
    totalValues: latest.values.length,
  };
}

/**
 * ログイン中の患者に出せる検査結果。
 * 出せるものが無ければ null（画面側はデモの見本に落とす、または空状態を出す）。
 */
export function usePublishedLabSeries(
  customerId: string | null,
): PublishedLabSeries | null {
  const imports = useStoredLabImports();
  const consents = useStoredConsents();
  return useMemo(() => {
    if (!customerId) return null;
    if (!canPublishLabtest(consents, customerId).ok) return null;
    return buildSeries(imports.filter((r) => r.customerId === customerId));
  }, [customerId, imports, consents]);
}
