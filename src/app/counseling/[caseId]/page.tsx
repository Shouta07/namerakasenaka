import { CounselingView } from "@/components/cases/counseling-view";

export const dynamic = "force-dynamic";

export default async function CounselingPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return <CounselingView caseId={caseId} />;
}
