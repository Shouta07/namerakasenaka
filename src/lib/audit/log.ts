import { getAdminSupabase } from "@/lib/supabase/admin";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "reject"
  | "login"
  | "logout"
  | "invite_sent"
  | "invite_accepted"
  | "webhook_received"
  | "signed_url_issued";

export type AuditEntry = {
  actorId: string | null;
  action: AuditAction | string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
};

/**
 * Append-only audit log. Uses the service-role client so RLS does not block writes.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const supabase = getAdminSupabase();
    const { error } = await supabase.from("audit_logs").insert({
      actor_id: entry.actorId,
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId ?? null,
      metadata: entry.metadata ?? {},
    });
    if (error) {
      console.error("[audit] insert failed", error);
    }
  } catch (err) {
    console.error("[audit] unexpected error", err);
  }
}
