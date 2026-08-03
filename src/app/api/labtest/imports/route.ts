import { NextResponse } from "next/server";
import { z } from "zod";
import { isDemoMode } from "@/lib/demo";
import { getServerSupabase } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";
import { assertCustomerInOrg, requireStaff } from "@/lib/auth/caller";
import {
  deleteLabImport,
  insertLabImport,
  listLabImports,
} from "@/lib/labtest/repository";

/**
 * 取り込んだ検査結果を保存する / 一覧する / 消す。
 *
 * これが無かったせいで、画面の導線はあるのに本番では
 * 検査がどこにも残らない状態だった。商品の中核はここ。
 *
 * 書き込みはセッションクライアントで行う（service-role を使わない）。
 * RLS が効くので、テナント境界が二重になる — アプリ側の絞り込みを
 * 将来消してしまっても、DB 側が最後の砦として残る。
 *
 * 取り込んだ時点では **published_at は null**。患者には見えない。
 * 公開は /api/labtest/publish の担当で、そこで同意を確かめる。
 */

const Value = z.object({
  rowId: z.string().min(1).max(64),
  value: z.number().finite(),
  sourceLabel: z.string().max(128),
  sourceUnit: z.string().max(32),
});

const Body = z.object({
  customerId: z.string().min(1).max(200),
  collectedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  values: z.array(Value).min(1).max(300),
  sourceFileName: z.string().max(255).default(""),
  unparsedCount: z.number().int().min(0).max(10_000).default(0),
  importedByName: z.string().max(120).default(""),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const b = parsed.data;

  if (isDemoMode()) {
    // デモは保存先がブラウザ側。ここは検証だけ通して返す。
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  const caller = await requireStaff();
  if ("response" in caller) return caller.response;

  const denied = await assertCustomerInOrg(b.customerId, caller.organizationId);
  if (denied) return denied;

  const db = await getServerSupabase();
  const result = await insertLabImport(db, {
    organizationId: caller.organizationId,
    customerId: b.customerId,
    collectedOn: b.collectedOn,
    values: b.values,
    sourceFileName: b.sourceFileName,
    unparsedCount: b.unparsedCount,
    importedByUserId: caller.userId,
    importedByName: b.importedByName,
  });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  await logAudit({
    actorId: caller.userId,
    action: "create",
    targetType: "lab_import",
    targetId: result.id,
    // 検査値そのものは載せない。件数まで。
    metadata: {
      customerId: b.customerId,
      valueCount: b.values.length,
      unparsedCount: b.unparsedCount,
    },
  });

  return NextResponse.json({ ok: true, id: result.id });
}

export async function GET(req: Request) {
  const customerId = new URL(req.url).searchParams.get("customerId");
  if (!customerId) {
    return NextResponse.json({ error: "customer_required" }, { status: 400 });
  }
  if (isDemoMode()) {
    return NextResponse.json({ ok: true, mode: "demo", imports: [] });
  }

  const caller = await requireStaff();
  if ("response" in caller) return caller.response;

  const db = await getServerSupabase();
  const imports = await listLabImports(db, caller.organizationId, customerId);
  return NextResponse.json({ ok: true, imports });
}

export async function DELETE(req: Request) {
  const importId = new URL(req.url).searchParams.get("importId");
  if (!importId) {
    return NextResponse.json({ error: "import_required" }, { status: 400 });
  }
  if (isDemoMode()) {
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  const caller = await requireStaff();
  if ("response" in caller) return caller.response;

  const db = await getServerSupabase();
  const { error } = await deleteLabImport(db, caller.organizationId, importId);
  if (error) return NextResponse.json({ error }, { status: 500 });

  await logAudit({
    actorId: caller.userId,
    action: "delete",
    targetType: "lab_import",
    targetId: importId,
    metadata: { organizationId: caller.organizationId },
  });
  return NextResponse.json({ ok: true });
}
