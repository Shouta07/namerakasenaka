import { describe, expect, it } from "vitest";
import { can, enabledToppings } from "../can";
import { deriveEntitlements } from "../plans";
import type { ToppingContext } from "../types";

function ctxFor(plan: "starter" | "standard" | "pro"): ToppingContext {
  return { entitlements: deriveEntitlements(plan) };
}

describe("deriveEntitlements", () => {
  it("standard includes roleplay(100) but not case-library", () => {
    const ent = deriveEntitlements("standard");
    expect(ent.roleplay).toMatchObject({ enabled: true, limit: 100 });
    expect(ent["case-library"]).toBeUndefined();
  });

  it("pro includes case-library and ai-guide", () => {
    const ent = deriveEntitlements("pro");
    expect(ent["case-library"]?.enabled).toBe(true);
    expect(ent["ai-guide"]?.enabled).toBe(true);
  });

  it("starter excludes follow-loop", () => {
    expect(deriveEntitlements("starter")["follow-loop"]).toBeUndefined();
  });
});

describe("can()", () => {
  it("base (core) is always ok even with empty entitlements", () => {
    expect(can({ entitlements: {} }, "core").ok).toBe(true);
  });

  it("returns not_entitled when the plan does not include it", () => {
    const r = can(ctxFor("starter"), "roleplay");
    // starter DOES include roleplay(20), so pick one it doesn't: evidence
    expect(r.ok).toBe(true);
    expect(can(ctxFor("starter"), "evidence").reason).toBe("not_entitled");
  });

  it("returns unknown_topping for a bogus id", () => {
    expect(can(ctxFor("pro"), "does-not-exist").reason).toBe("unknown_topping");
  });

  it("enforces dependency: at-risk needs follow-loop", () => {
    // Manually grant at-risk without follow-loop.
    const ctx: ToppingContext = {
      entitlements: {
        "at-risk": { toppingId: "at-risk", enabled: true, source: "manual" },
      },
    };
    const r = can(ctx, "at-risk");
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("dependency");
    expect(r.detail?.missing).toBe("follow-loop");
  });

  it("respects the org-setting layer (contracted but turned off)", () => {
    const ctx: ToppingContext = {
      entitlements: deriveEntitlements("standard"),
      orgSettings: { roleplay: false },
    };
    expect(can(ctx, "roleplay").reason).toBe("disabled");
  });

  it("enforces usage limits and returns detail", () => {
    const ctx: ToppingContext = {
      entitlements: deriveEntitlements("standard"), // roleplay limit 100
      usage: { roleplay: 100 },
    };
    const r = can(ctx, "roleplay", { amount: 1 });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("limit");
    expect(r.detail).toMatchObject({ used: 100, limit: 100, metric: "sessions" });
  });

  it("allows usage under the limit", () => {
    const ctx: ToppingContext = {
      entitlements: deriveEntitlements("standard"),
      usage: { roleplay: 50 },
    };
    expect(can(ctx, "roleplay", { amount: 1 }).ok).toBe(true);
  });

  it("unlimited plan ignores usage", () => {
    const ctx: ToppingContext = {
      entitlements: deriveEntitlements("pro"),
      usage: { "line-share": 999999 },
    };
    expect(can(ctx, "line-share", { amount: 1000 }).ok).toBe(true);
  });

  it("respects trial expiry (validUntil in the past)", () => {
    const ctx: ToppingContext = {
      now: new Date("2026-07-01"),
      entitlements: {
        core: { toppingId: "core", enabled: true, source: "plan" },
        "line-share": {
          toppingId: "line-share",
          enabled: true,
          source: "plan",
        },
        "ai-guide": {
          toppingId: "ai-guide",
          enabled: true,
          source: "trial",
          validUntil: "2026-06-15",
        },
      },
    };
    expect(can(ctx, "ai-guide").reason).toBe("expired");
  });

  it("enabledToppings filters a list down to what's usable", () => {
    const ids = ["core", "roleplay", "evidence", "case-library"];
    expect(enabledToppings(ctxFor("standard"), ids)).toEqual([
      "core",
      "roleplay",
      "evidence",
    ]);
  });
});
