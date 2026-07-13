import { describe, expect, it } from "vitest";
import { TOPPINGS, ALL_TOPPING_IDS, launchToppings } from "../registry";
import { PLAN_ORDER } from "../types";

describe("toppings registry integrity", () => {
  it("every dependsOn references an existing topping", () => {
    for (const [id, def] of Object.entries(TOPPINGS)) {
      for (const dep of def.dependsOn) {
        expect(ALL_TOPPING_IDS, `${id} depends on unknown ${dep}`).toContain(
          dep,
        );
      }
    }
  });

  it("has no dependency cycles", () => {
    const visiting = new Set<string>();
    const done = new Set<string>();
    const walk = (id: string, trail: string[]) => {
      if (done.has(id)) return;
      expect(visiting.has(id), `cycle: ${[...trail, id].join(" → ")}`).toBe(
        false,
      );
      visiting.add(id);
      for (const dep of TOPPINGS[id as keyof typeof TOPPINGS].dependsOn) {
        walk(dep, [...trail, id]);
      }
      visiting.delete(id);
      done.add(id);
    };
    for (const id of ALL_TOPPING_IDS) walk(id, []);
  });

  it("non-base toppings ultimately depend on core", () => {
    const reachesCore = (id: string, seen = new Set<string>()): boolean => {
      if (id === "core") return true;
      if (seen.has(id)) return false;
      seen.add(id);
      return TOPPINGS[id as keyof typeof TOPPINGS].dependsOn.some((d) =>
        reachesCore(d, seen),
      );
    };
    for (const [id, def] of Object.entries(TOPPINGS)) {
      if (def.tier === "base") continue;
      expect(reachesCore(id), `${id} does not reach core`).toBe(true);
    }
  });

  it("later-status toppings are excluded from the launch matrix", () => {
    const launchIds = launchToppings().map(([id]) => id);
    expect(launchIds).not.toContain("meals-review");
    expect(launchIds).not.toContain("qa");
    expect(launchIds).toContain("roleplay");
  });

  it("copilot starts at standard, depends on dashboard, hidden from starter", () => {
    const c = TOPPINGS.copilot;
    expect(c.tier).toBe("copilot");
    expect(c.dependsOn).toContain("dashboard");
    expect(c.plans.starter.included).toBe(false);
    expect(c.plans.standard.included).toBe(true);
    expect(c.plans.pro.included).toBe(true);
  });

  it("cull v2.2: backlog toppings are not in the launch catalog and grant nothing", () => {
    const launchIds = launchToppings().map(([id]) => id);
    for (const id of ["case-library", "multi-location", "data-import", "lessons", "qa"]) {
      expect(launchIds, `${id} must be excluded from launch`).not.toContain(id);
      // backlog は全プラン OUT（実体が無いものを付与しない）
      const def = TOPPINGS[id as keyof typeof TOPPINGS];
      expect(def.plans.pro.included).toBe(false);
    }
  });

  it("cull v2.2: deleted toppings are gone from the registry", () => {
    expect("ai-minutes" in TOPPINGS).toBe(false);
    expect("staff-kpi" in TOPPINGS).toBe(false);
    expect("meals-review" in TOPPINGS).toBe(false);
  });

  it("cull v2.2: no launch topping carries a single-item addon price", () => {
    for (const [, def] of launchToppings()) {
      expect("addon" in def).toBe(false);
    }
  });

  it("a topping included on a lower plan is included on higher plans (monotonic)", () => {
    for (const [id, def] of Object.entries(TOPPINGS)) {
      let seenIncluded = false;
      for (const plan of PLAN_ORDER) {
        const inc = def.plans[plan].included;
        if (seenIncluded) {
          expect(inc, `${id}: ${plan} regressed vs a lower plan`).toBe(true);
        }
        seenIncluded = seenIncluded || inc;
      }
    }
  });
});
