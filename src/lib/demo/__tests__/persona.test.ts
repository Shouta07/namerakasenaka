import { describe, expect, it } from "vitest";
import {
  demoActivityFeed,
  demoAppointments,
  demoClient,
  demoClientRoster,
  demoMealLogs,
  demoProgressPhotos,
  demoTreatmentRecords,
} from "@/lib/demo/fixtures";

/**
 * Persona unify guard — the primary demo client (client-yamada) must be
 * 田村 洋子 across every fixture surface. Older copy mentioning 山田 would
 * break the cross-page story (/c/* ↔ /admin/clients/client-yamada ↔ /share).
 */
describe("persona unify — 田村 洋子 across demo fixtures", () => {
  it("primary demoClient is client-yamada with displayName starting 田", () => {
    expect(demoClient.id).toBe("client-yamada");
    expect(demoClient.displayName.startsWith("田")).toBe(true);
    expect(demoClient.displayName).toContain("田村");
  });

  it("no remaining 山田 reference in any client-yamada fixture row", () => {
    const yamadaAppts = demoAppointments.filter((a) => a.clientId === "client-yamada");
    for (const a of yamadaAppts) {
      expect(a.clientName, `appt ${a.id} clientName`).not.toContain("山田");
    }

    const yamadaMeals = demoMealLogs.filter((m) => m.clientId === "client-yamada");
    expect(yamadaMeals.length).toBeGreaterThan(0);

    const yamadaPhotos = demoProgressPhotos.filter((p) => p.clientId === "client-yamada");
    for (const p of yamadaPhotos) {
      expect(p.caption, `photo ${p.id} caption`).not.toContain("山田");
    }

    const yamadaRecs = demoTreatmentRecords.filter((r) => r.clientId === "client-yamada");
    for (const r of yamadaRecs) {
      expect(r.observations).not.toContain("山田");
      expect(r.homeCareNotes).not.toContain("山田");
    }
  });

  it("activity feed for the primary client uses 田村, never 山田", () => {
    const entries = demoActivityFeed.filter(
      (e) => e.href === "/admin/clients/client-yamada",
    );
    expect(entries.length).toBeGreaterThan(0);
    for (const e of entries) {
      expect(e.body).not.toContain("山田");
      expect(e.actor).not.toContain("山田");
    }
  });

  it("the roster keeps the other 8 personas unchanged", () => {
    const expected = [
      "client-yamada",
      "client-suzuki",
      "client-tanaka",
      "client-kato",
      "client-kimura",
      "client-takahashi",
      "client-watanabe",
      "client-nakamura",
      "client-kobayashi",
    ];
    expect(demoClientRoster.map((c) => c.id)).toEqual(expected);
    // Only the first row was renamed.
    expect(demoClientRoster[0].displayName).toContain("田村");
    for (const c of demoClientRoster.slice(1)) {
      expect(c.displayName).not.toContain("山田");
      expect(c.displayName).not.toContain("田村");
    }
  });
});
