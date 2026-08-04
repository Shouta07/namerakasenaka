import Link from "next/link";
import { ModuleGate } from "@/components/vitality-design/module-panel";
import { RoleplaySession } from "@/components/vitality-design/roleplay-session";
import { ROLEPLAY_SCENARIOS } from "@/lib/vitality-design/fixtures";

export function generateStaticParams() {
  return ROLEPLAY_SCENARIOS.map((s) => ({ scenarioId: s.id }));
}

export default async function RoleplaySessionPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  return (
    <ModuleGate module="roleplay">
      <div className="mx-auto max-w-2xl space-y-4">
        <Link
          href="/vitality-design/roleplay"
          className="inline-flex min-h-11 items-center text-[12px] font-semibold text-stone-500 hover:text-brand-700"
        >
          ← シナリオ一覧へ
        </Link>
        <RoleplaySession scenarioId={scenarioId} />
      </div>
    </ModuleGate>
  );
}
