/**
 * Banned-word filter for AI-generated and human-written messages.
 * Source: §8.2 of requirements.md.
 *
 * Compliance scope: 薬機法, 健康増進法, 景品表示法.
 */

export const BANNED_WORDS: readonly string[] = [
  "治る",
  "治す",
  "治癒",
  "改善する",
  "効く",
  "効能",
  "効果がある",
  "効果的",
  "完治",
  "必ず",
  "絶対",
  "が消える",
  "が無くなる",
  "がなくなる",
  "医薬品同等",
  "ニキビが治る",
  "肌荒れが治る",
  "の治療",
  // 回復ガイド（三社共同開発, §17）追加禁止表現。
  // 「治る」は「治ります」に部分一致しないため別途登録する。
  "治ります",
  "必ず改善します",
  "病気です",
  "医師の指示は不要",
  "これをしないと悪化",
];

export const DISCLAIMER =
  "本情報は一般的な栄養に関する参考情報であり、医療上の助言ではありません。症状がある場合は医師にご相談ください。";

export type BannedWordCheck = {
  ok: boolean;
  hits: string[];
};

export function containsBannedWord(text: string): BannedWordCheck {
  if (!text) return { ok: true, hits: [] };
  const normalized = text.normalize("NFKC");
  const hits: string[] = [];
  for (const word of BANNED_WORDS) {
    if (normalized.includes(word)) {
      hits.push(word);
    }
  }
  return { ok: hits.length === 0, hits };
}

export function appendDisclaimer(text: string): string {
  const trimmed = text.trimEnd();
  if (trimmed.includes(DISCLAIMER)) return trimmed;
  return `${trimmed}\n\n— ${DISCLAIMER}`;
}
