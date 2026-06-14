/**
 * 🌱 「腸のおはなし」 — レッスン用イラストの中央レジストリ。
 *
 * `lessonIllustration(lesson.id)` で対応 SVG コンポーネントを取り出す。
 * 該当しない id は null を返す（呼び出し側で gracefully に省略する）。
 *
 * すべて Server-renderable: lesson-sheet (client) から `lessonIllustration(id)`
 * を呼び出して JSX として描く。関数を props で渡さないこと（serialization 制約）。
 */
import type { ComponentType } from "react";
import { GutMapIllustration } from "./gut-map";
import { SiboTrafficIllustration } from "./sibo-traffic";
import { FructanFeedingIllustration } from "./fructan-feeding";
import { OvercrowdingIllustration } from "./overcrowding";
import { TidyOrderIllustration } from "./tidy-order";
import { ButyrateRepairIllustration } from "./butyrate-repair";
import { InflammationFlowIllustration } from "./inflammation-flow";

export type LessonIllustration = ComponentType<{ className?: string }>;

const REGISTRY: Record<string, LessonIllustration> = {
  "lesson-1-gut-map": GutMapIllustration,
  "lesson-2-sibo": SiboTrafficIllustration,
  "lesson-3-fructan": FructanFeedingIllustration,
  "lesson-4-lactic-not-always": OvercrowdingIllustration,
  "lesson-5-order-of-care": TidyOrderIllustration,
  "lesson-6-butyrate": ButyrateRepairIllustration,
  "lesson-7-back-connection": InflammationFlowIllustration,
};

export function lessonIllustration(lessonId: string): LessonIllustration | null {
  return REGISTRY[lessonId] ?? null;
}

export {
  GutMapIllustration,
  SiboTrafficIllustration,
  FructanFeedingIllustration,
  OvercrowdingIllustration,
  TidyOrderIllustration,
  ButyrateRepairIllustration,
  InflammationFlowIllustration,
};
