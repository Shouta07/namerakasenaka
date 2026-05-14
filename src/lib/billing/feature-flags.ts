import type { BillingMode } from "@/types/domain";

export function getBillingMode(): BillingMode {
  const raw = process.env.BILLING_MODE;
  if (raw === "B2C_ONLY" || raw === "DUAL") return raw;
  return "B2B_ONLY";
}

export function isMealLogEnabledForOrg(): boolean {
  const mode = getBillingMode();
  return mode === "B2C_ONLY" || mode === "DUAL";
}

/**
 * Per-client override: when B2C billing is OFF globally, SalonAdmin can still
 * enable meal logs for an individual client via clients.feature_meal_log.
 */
export function isMealLogEnabledForClient(opts: {
  clientFeatureFlag: boolean;
}): boolean {
  return isMealLogEnabledForOrg() || opts.clientFeatureFlag;
}
