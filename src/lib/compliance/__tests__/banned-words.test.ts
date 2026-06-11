import { describe, expect, it } from "vitest";
import {
  BANNED_WORDS,
  DISCLAIMER,
  appendDisclaimer,
  containsBannedWord,
} from "../banned-words";

describe("containsBannedWord", () => {
  it("returns ok=true for clean text", () => {
    const r = containsBannedWord("健康的な習慣作りをサポートします。");
    expect(r.ok).toBe(true);
    expect(r.hits).toEqual([]);
  });

  it("detects single banned word", () => {
    const r = containsBannedWord("このメニューは肌荒れに効く可能性があります。");
    expect(r.ok).toBe(false);
    expect(r.hits).toContain("効く");
  });

  it("detects multiple banned words", () => {
    const r = containsBannedWord("ニキビが治る、必ず効果がある食事です。");
    expect(r.ok).toBe(false);
    expect(r.hits.length).toBeGreaterThanOrEqual(2);
  });

  it("handles empty input", () => {
    expect(containsBannedWord("").ok).toBe(true);
  });

  it("detects the recovery-guide additions (§17)", () => {
    expect(containsBannedWord("続ければ治りますよ。").hits).toContain("治ります");
    expect(containsBannedWord("これは必ず改善します。").ok).toBe(false);
    expect(containsBannedWord("あなたは病気です。").hits).toContain("病気です");
    expect(containsBannedWord("医師の指示は不要です。").ok).toBe(false);
    expect(containsBannedWord("これをしないと悪化します。").ok).toBe(false);
  });

  it("allows gentle recovery-guide phrasing", () => {
    const r = containsBannedWord(
      "腸の炎症が関係している可能性があります。先生の方針に沿って、7割できればOKという気持ちで進めましょう。",
    );
    expect(r.ok).toBe(true);
  });

  it("covers all listed words", () => {
    for (const w of BANNED_WORDS) {
      const r = containsBannedWord(`テスト：${w}と書きます。`);
      expect(r.ok).toBe(false);
      expect(r.hits).toContain(w);
    }
  });
});

describe("appendDisclaimer", () => {
  it("appends the disclaimer when missing", () => {
    const out = appendDisclaimer("バランスの良い食事を心がけましょう。");
    expect(out.endsWith(DISCLAIMER)).toBe(true);
  });

  it("does not duplicate if already present", () => {
    const once = appendDisclaimer("text");
    const twice = appendDisclaimer(once);
    const occurrences = twice.split(DISCLAIMER).length - 1;
    expect(occurrences).toBe(1);
  });
});
