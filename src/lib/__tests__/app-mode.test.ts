import { describe, expect, it } from "vitest";
import { resolveAppMode } from "../app-mode";

/**
 * デモ / 本番の切り分け。
 *
 * ここが緩むと、環境変数の設定漏れだけで
 * **要配慮個人情報を扱うアプリが認証なしで公開される**。
 * 迷ったら閉じる、を全ケースで固定する。
 */

const SUPA = {
  supabaseUrl: "https://example.supabase.co",
  supabaseAnonKey: "anon-key",
};

describe("宣言があれば、それに従う", () => {
  it("production 宣言 + 接続情報あり → 本番", () => {
    const r = resolveAppMode({ appMode: "production", ...SUPA });
    expect(r).toEqual({ mode: "production", source: "declared", fatal: null });
  });

  it("demo 宣言 → デモ（接続情報があっても宣言が勝つ）", () => {
    const r = resolveAppMode({ appMode: "demo", ...SUPA });
    expect(r.mode).toBe("demo");
    expect(r.fatal).toBeNull();
  });

  it("大文字・前後の空白を許す", () => {
    expect(resolveAppMode({ appMode: "  PRODUCTION ", ...SUPA }).mode).toBe(
      "production",
    );
  });
});

describe("本番と宣言して土台が欠けていたら、開かずに落とす", () => {
  it("接続情報がまったく無ければ fatal", () => {
    const r = resolveAppMode({ appMode: "production" });
    expect(r.mode).toBe("production");
    expect(r.fatal).toContain("起動を中止");
  });

  it("片方だけ欠けていても fatal（設定し忘れが事故の原因）", () => {
    const r = resolveAppMode({
      appMode: "production",
      supabaseUrl: SUPA.supabaseUrl,
    });
    expect(r.fatal).not.toBeNull();
  });

  it("**デモに落とさない** — 落とすと静かに認証が外れる", () => {
    const r = resolveAppMode({ appMode: "production" });
    expect(r.mode).not.toBe("demo");
  });
});

describe("綴り間違いをデモとして扱わない", () => {
  it.each(["prod", "Production!", "本番", "true"])(
    '"%s" は fatal（黙って素通しにしない）',
    (value) => {
      const r = resolveAppMode({ appMode: value, ...SUPA });
      expect(r.fatal).not.toBeNull();
      expect(r.mode).not.toBe("demo");
    },
  );
});

describe("宣言が無いときだけ推測する（デモの手軽さを残す）", () => {
  it("接続情報が無ければデモ", () => {
    const r = resolveAppMode({});
    expect(r).toEqual({ mode: "demo", source: "inferred", fatal: null });
  });

  it("接続情報があれば本番", () => {
    const r = resolveAppMode(SUPA);
    expect(r).toEqual({ mode: "production", source: "inferred", fatal: null });
  });

  it("空文字は「宣言なし」として扱う", () => {
    expect(resolveAppMode({ appMode: "   " }).source).toBe("inferred");
  });

  it("推測では決して fatal にしない（デモが立てられなくなる）", () => {
    expect(resolveAppMode({}).fatal).toBeNull();
    expect(resolveAppMode(SUPA).fatal).toBeNull();
  });
});
