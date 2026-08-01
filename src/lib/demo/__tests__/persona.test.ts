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

/** サンプルの主人公は、どのフィクスチャ面でもこの名前ひとつに統一する。 */
const SAMPLE_PERSONA = "田中 太郎";
/** 過去に使っていた名前 — 1つでも残ると画面をまたいだ物語が壊れる。 */
const RETIRED_NAMES = ["山田", "田村", "洋子"];

/**
 * Persona unify guard — the primary demo client must be 田中 太郎 across every
 * fixture surface (/c/* ↔ /admin/clients/client-yamada ↔ /share). The id keeps
 * its historical slug on purpose: share links already handed out point at it.
 */
describe(`persona unify — ${SAMPLE_PERSONA} across demo fixtures`, () => {
  it("primary demoClient uses the unified sample name", () => {
    expect(demoClient.id).toBe("client-yamada");
    expect(demoClient.displayName).toBe(SAMPLE_PERSONA);
    expect(demoClient.furigana).toBe("たなか たろう");
  });

  it("no retired persona name survives in any primary-client fixture row", () => {
    const appts = demoAppointments.filter((a) => a.clientId === demoClient.id);
    const meals = demoMealLogs.filter((m) => m.clientId === demoClient.id);
    const photos = demoProgressPhotos.filter((p) => p.clientId === demoClient.id);
    const recs = demoTreatmentRecords.filter((r) => r.clientId === demoClient.id);
    expect(meals.length).toBeGreaterThan(0);

    for (const old of RETIRED_NAMES) {
      for (const a of appts) {
        expect(a.clientName, `appt ${a.id} clientName`).not.toContain(old);
      }
      for (const p of photos) {
        expect(p.caption, `photo ${p.id} caption`).not.toContain(old);
      }
      for (const r of recs) {
        expect(r.observations).not.toContain(old);
        expect(r.homeCareNotes).not.toContain(old);
      }
    }
  });

  it("activity feed for the primary client uses the unified name only", () => {
    const entries = demoActivityFeed.filter(
      (e) => e.href === `/admin/clients/${demoClient.id}`,
    );
    expect(entries.length).toBeGreaterThan(0);
    for (const e of entries) {
      for (const old of RETIRED_NAMES) {
        expect(e.body).not.toContain(old);
        expect(e.actor).not.toContain(old);
      }
    }
  });

  it("the roster keeps 9 distinct personas — only the first is the sample name", () => {
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
    expect(demoClientRoster[0].displayName).toBe(SAMPLE_PERSONA);

    const names = demoClientRoster.map((c) => c.displayName);
    // 一覧画面が成立するよう、他の行は重複しない別人であること。
    expect(new Set(names).size).toBe(names.length);
    for (const c of demoClientRoster.slice(1)) {
      // 同姓（田中）が並ぶと一覧が紛らわしくなる。
      expect(c.displayName.startsWith("田中")).toBe(false);
      for (const old of RETIRED_NAMES) {
        expect(c.displayName).not.toContain(old);
      }
    }
  });
});
