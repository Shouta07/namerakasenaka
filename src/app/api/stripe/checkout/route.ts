import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";

export async function POST(req: Request) {
  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "stripe_unavailable" },
      { status: 503 },
    );
  }

  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: me } = await supabase
    .from("users")
    .select("organization_id, role")
    .eq("id", user.id)
    .maybeSingle();
  const meRow = me as { organization_id: string | null; role: string } | null;
  if (!meRow || meRow.role !== "salon_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const priceId = process.env.STRIPE_PRICE_B2B_STARTER;
  if (!priceId) {
    return NextResponse.json({ error: "price_not_configured" }, { status: 503 });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/admin/billing?status=success`,
    cancel_url: `${origin}/admin/billing?status=cancelled`,
    metadata: { organization_id: meRow.organization_id ?? "" },
  });

  return NextResponse.redirect(session.url ?? `${origin}/admin/billing`, { status: 303 });
}
