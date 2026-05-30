/**
 * Similarity scoring for the case library.
 *
 * Pure typed function — given a case and a set of criteria (typically the
 * current customer's profile), return a score in roughly the 0–50 range.
 * Used to rank past cases against the prospect in front of the therapist
 * during counseling.
 *
 * Weights (intentionally simple, easy to tune):
 *   - matched tag        : 3 each
 *   - severity match     : 5
 *   - age band match     : 3
 *   - gender match       : 2
 *   - concern duration   : 2
 */

import type { AgeBand, CaseRecord, CaseSeverity } from "./types";

export type SimilarityCriteria = {
  age?: number;
  ageBand?: AgeBand;
  gender?: string;
  concernDuration?: string;
  severity?: CaseSeverity;
  tagIds: string[];
};

export function computeAgeBand(age: number | null | undefined): AgeBand | null {
  if (age == null || Number.isNaN(age)) return null;
  if (age < 25) return "under_25";
  if (age < 35) return "25_34";
  if (age < 45) return "35_44";
  return "45_plus";
}

export function scoreSimilarity(
  c: CaseRecord,
  criteria: SimilarityCriteria,
): number {
  let score = 0;

  // Matched tags — 3 points each.
  if (criteria.tagIds.length > 0) {
    const set = new Set(criteria.tagIds);
    const matched = c.tagIds.filter((id) => set.has(id)).length;
    score += matched * 3;
  }

  // Severity match — 5.
  if (criteria.severity && c.severity === criteria.severity) {
    score += 5;
  }

  // Age band match — 3.
  const targetBand = criteria.ageBand ?? computeAgeBand(criteria.age ?? null);
  if (targetBand) {
    const caseBand = computeAgeBand(c.age ?? null);
    if (caseBand && caseBand === targetBand) score += 3;
  }

  // Gender match — 2.
  if (criteria.gender && c.gender && criteria.gender === c.gender) {
    score += 2;
  }

  // Concern duration match — 2.
  if (
    criteria.concernDuration &&
    c.concernDuration &&
    criteria.concernDuration === c.concernDuration
  ) {
    score += 2;
  }

  return score;
}

export type RankedCase = {
  case: CaseRecord;
  score: number;
};

/**
 * Rank a set of cases by similarity to the criteria, highest first.
 * Stable ordering on tie via createdAt desc.
 */
export function rankCases(
  cases: CaseRecord[],
  criteria: SimilarityCriteria,
): RankedCase[] {
  return cases
    .map((c) => ({ case: c, score: scoreSimilarity(c, criteria) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.case.createdAt.localeCompare(a.case.createdAt);
    });
}

/**
 * Convert a raw score to a /100 display value. The maximum practical score
 * is roughly 5 (severity) + 3 (band) + 2 (gender) + 2 (duration) + tagsBonus.
 * We anchor 100 at 30 raw points so meaningful matches feel meaningful.
 */
export function scoreToDisplay(raw: number): number {
  const pct = Math.round((raw / 30) * 100);
  if (pct < 0) return 0;
  if (pct > 100) return 100;
  return pct;
}
