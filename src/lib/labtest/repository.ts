import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { ConsentRecord, ConsentScope } from "./consent";

/**
 * 検査の取り込みと同意の、本番の読み書き。**サーバ専用**。
 * （Supabase クライアントを引数で受けるので、クライアントから
 *   呼んでも service-role が漏れることはないが、置き場所はサーバ側に限る）
 *
 * なぜ層を分けたか: これまで画面は localStorage にしか書いておらず、
 * `lab_imports` / `consents` への INSERT がコードのどこにも無かった。
 * 「導線はあるのに商品が成立しない」状態だったので、
 * **保存の入口をここ1か所に集める**。散らばると、また書き忘れる。
 *
 * ここに置く関数の約束:
 * - 引数で渡された Supabase クライアントを使う（呼び出し側が
 *   セッション/サービスロールを選ぶ。層の中で勝手に選ばない）
 * - **必ず organization_id で絞る**。RLS があっても、service-role は
 *   それを迂回する。テナント境界はアプリ側でも二重に張る
 * - 行 ↔ ドメイン型の変換もここに閉じる（snake_case を外に漏らさない）
 */

export type LabImportValue = {
  rowId: string;
  value: number;
  sourceLabel: string;
  sourceUnit: string;
};

export type LabImportRecord = {
  id: string;
  organizationId: string;
  customerId: string;
  collectedOn: string;
  values: LabImportValue[];
  sourceFileName: string;
  unparsedCount: number;
  importedBy: string;
  importedAt: string;
  publishedAt: string | null;
};

/**
 * 呼び出し側が渡すクライアント。セッション（RLSが効く）か
 * サービスロール（RLSを迂回）かは、呼び出し側が選ぶ。
 * ※ Database は現状 any のプレースホルダなので、ここでの型安全は限定的。
 *   本番スキーマから型を生成したら、この層がそのまま恩恵を受ける。
 */
type Db = SupabaseClient<Database>;

// ---------------------------------------------------------------
// 検査の取り込み
// ---------------------------------------------------------------

export async function insertLabImport(
  db: Db,
  input: {
    organizationId: string;
    customerId: string;
    collectedOn: string;
    values: LabImportValue[];
    sourceFileName: string;
    unparsedCount: number;
    importedByUserId: string | null;
    importedByName: string;
  },
): Promise<{ id: string } | { error: string }> {
  const { data, error } = await db
    .from("lab_imports")
    .insert({
      organization_id: input.organizationId,
      customer_id: input.customerId,
      collected_on: input.collectedOn,
      values: input.values,
      source_file_name: input.sourceFileName,
      unparsed_count: input.unparsedCount,
      imported_by: input.importedByUserId,
      imported_by_name: input.importedByName,
      // 取り込んだだけでは患者に見せない。公開は別の操作。
      published_at: null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: (data as { id: string }).id };
}

export async function listLabImports(
  db: Db,
  organizationId: string,
  customerId: string,
): Promise<LabImportRecord[]> {
  const { data, error } = await db
    .from("lab_imports")
    .select(
      "id, organization_id, customer_id, collected_on, values, source_file_name, unparsed_count, imported_by_name, imported_at, published_at",
    )
    .eq("organization_id", organizationId)
    .eq("customer_id", customerId)
    .order("collected_on", { ascending: false });

  if (error || !data) return [];
  return (data as unknown as Array<Record<string, unknown>>).map(toLabImport);
}

/**
 * 患者ご本人が見られる、公開済みの取り込み。
 *
 * 同意の判定はここではせず、呼び出し側が `canPublishLabtest()` を通す。
 * 「公開済みか」と「同意が有効か」は別の問いなので、混ぜない。
 */
export async function listPublishedLabImports(
  db: Db,
  customerId: string,
): Promise<LabImportRecord[]> {
  const { data, error } = await db
    .from("lab_imports")
    .select(
      "id, organization_id, customer_id, collected_on, values, source_file_name, unparsed_count, imported_by_name, imported_at, published_at",
    )
    .eq("customer_id", customerId)
    .not("published_at", "is", null)
    .order("collected_on", { ascending: false });

  if (error || !data) return [];
  return (data as unknown as Array<Record<string, unknown>>).map(toLabImport);
}

export async function deleteLabImport(
  db: Db,
  organizationId: string,
  importId: string,
): Promise<{ error?: string }> {
  const { error } = await db
    .from("lab_imports")
    .delete()
    .eq("id", importId)
    .eq("organization_id", organizationId);
  return error ? { error: error.message } : {};
}

function toLabImport(r: Record<string, unknown>): LabImportRecord {
  return {
    id: String(r.id),
    organizationId: String(r.organization_id),
    customerId: String(r.customer_id),
    collectedOn: String(r.collected_on),
    values: (r.values as LabImportValue[]) ?? [],
    sourceFileName: String(r.source_file_name ?? ""),
    unparsedCount: Number(r.unparsed_count ?? 0),
    importedBy: String(r.imported_by_name ?? ""),
    importedAt: String(r.imported_at ?? ""),
    publishedAt: (r.published_at as string | null) ?? null,
  };
}

// ---------------------------------------------------------------
// 同意
// ---------------------------------------------------------------

export async function insertConsent(
  db: Db,
  input: {
    organizationId: string;
    customerId: string;
    scope: ConsentScope;
    grantedByUserId: string | null;
    grantedByName: string;
    method: ConsentRecord["method"];
  },
): Promise<{ id: string } | { error: string }> {
  const { data, error } = await db
    .from("consents")
    .insert({
      organization_id: input.organizationId,
      customer_id: input.customerId,
      scope: input.scope,
      granted_by: input.grantedByUserId,
      granted_by_name: input.grantedByName,
      method: input.method,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: (data as { id: string }).id };
}

/**
 * 同意の取り消し。行は消さず revoked_at を立てる。
 * 「取り消した」ことも履歴なので、消してしまうと後で説明できない。
 */
export async function revokeConsentRow(
  db: Db,
  organizationId: string,
  consentId: string,
): Promise<{ error?: string }> {
  const { error } = await db
    .from("consents")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", consentId)
    .eq("organization_id", organizationId)
    // すでに取り消されているものを上書きしない（最初の取消時刻を残す）。
    .is("revoked_at", null);
  return error ? { error: error.message } : {};
}

export async function listConsents(
  db: Db,
  customerId: string,
): Promise<ConsentRecord[]> {
  const { data, error } = await db
    .from("consents")
    .select(
      "id, customer_id, scope, granted_at, granted_by_name, revoked_at, method",
    )
    .eq("customer_id", customerId)
    .order("granted_at", { ascending: false });

  if (error || !data) return [];
  return (data as unknown as Array<Record<string, unknown>>).map((r) => ({
    id: String(r.id),
    customerId: String(r.customer_id),
    scope: r.scope as ConsentScope,
    grantedAt: String(r.granted_at),
    grantedBy: String(r.granted_by_name ?? ""),
    revokedAt: (r.revoked_at as string | null) ?? null,
    method: r.method as ConsentRecord["method"],
  }));
}
