import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit/log";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    // Dev convenience: keep endpoint registered with Stripe even when the secret
    // isn't wired up locally. Production must always have STRIPE_WEBHOOK_SECRET set.
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "webhook_secret_missing" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, note: "webhook_secret_missing" }, { status: 200 });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "stripe_unavailable" },
      { status: 503 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing_signature" }, { status: 400 });

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    return NextResponse.json(
      { error: `invalid_signature: ${err instanceof Error ? err.message : ""}` },
      { status: 400 },
    );
  }

  const admin = getAdminSupabase();

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = (sub.metadata?.organization_id ?? "") || null;
      const plan = sub.items.data[0]?.price.id ?? "unknown";
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const periodEnd =
        typeof sub.current_period_end === "number"
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;
      await admin.from("subscriptions").upsert(
        {
          subject_type: orgId ? "organization" : "client",
          subject_id: orgId ?? customerId,
          plan,
          status: sub.status as "trialing" | "active" | "past_due" | "cancelled" | "unpaid",
          stripe_subscription_id: sub.id,
          stripe_customer_id: customerId,
          current_period_end: periodEnd,
        },
        { onConflict: "stripe_subscription_id" },
      );
      break;
    }
    default:
      // Unhandled — record for audit and move on.
      break;
  }

  await logAudit({
    actorId: null,
    action: "webhook_received",
    targetType: "stripe",
    targetId: event.id,
    metadata: { type: event.type },
  });

  return NextResponse.json({ received: true });
}
