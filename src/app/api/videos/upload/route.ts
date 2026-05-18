import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getServerSupabase } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";

const BUCKET = "progress-videos";
const ALLOWED_MIMES = new Set(["video/mp4", "video/quicktime", "video/webm"]);
const MAX_BYTES = 300 * 1024 * 1024;

export async function POST(req: Request) {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "invalid_form" }, { status: 400 });

  const file = form.get("file");
  const clientId = String(form.get("clientId") ?? "");
  const treatmentRecordId = (form.get("treatmentRecordId") as string | null) || null;
  const durationRaw = form.get("durationSeconds");
  const durationSeconds =
    typeof durationRaw === "string" && durationRaw
      ? Math.max(0, Math.round(Number(durationRaw)))
      : null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file_required" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file_too_large" }, { status: 413 });
  }
  const mime = file.type || "application/octet-stream";
  if (!ALLOWED_MIMES.has(mime)) {
    return NextResponse.json({ error: "invalid_mime_type", mime }, { status: 415 });
  }
  if (!clientId) {
    return NextResponse.json({ error: "client_required" }, { status: 400 });
  }

  // Verify caller is a therapist assigned to the client OR a salon_admin in the same org.
  const { data: me } = await supabase
    .from("users")
    .select("role, organization_id")
    .eq("id", user.id)
    .maybeSingle();
  const meRow = (me as { role?: string; organization_id?: string | null } | null) ?? null;
  if (!meRow || (meRow.role !== "therapist" && meRow.role !== "salon_admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: client } = await supabase
    .from("clients")
    .select("organization_id, primary_therapist_id")
    .eq("id", clientId)
    .maybeSingle();
  const c = (client as {
    organization_id?: string;
    primary_therapist_id?: string | null;
  } | null) ?? null;
  if (!c?.organization_id) {
    return NextResponse.json({ error: "client_not_found" }, { status: 404 });
  }
  if (meRow.role === "salon_admin") {
    if (c.organization_id !== meRow.organization_id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  } else {
    const { data: therapist } = await supabase
      .from("therapists")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    const therapistId = (therapist as { id?: string } | null)?.id;
    if (!therapistId || c.primary_therapist_id !== therapistId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  const ext = (file.name.split(".").pop() ?? "mp4").toLowerCase();
  const videoId = randomUUID();
  const storagePath = `${c.organization_id}/${clientId}/${videoId}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, new Uint8Array(arrayBuffer), {
      contentType: mime,
      upsert: false,
    });
  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 });
  }

  const { data: inserted, error: dbErr } = await supabase
    .from("treatment_videos")
    .insert({
      id: videoId,
      treatment_record_id: treatmentRecordId,
      client_id: clientId,
      uploaded_by: user.id,
      storage_path: storagePath,
      duration_seconds: durationSeconds,
    })
    .select("id")
    .single();

  if (dbErr) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  await logAudit({
    actorId: user.id,
    action: "create",
    targetType: "treatment_videos",
    targetId: (inserted as { id: string }).id,
    metadata: {
      client_id: clientId,
      treatment_record_id: treatmentRecordId,
      mime,
    },
  });

  return NextResponse.json({
    id: (inserted as { id: string }).id,
    storagePath,
  });
}
