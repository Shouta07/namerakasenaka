import { MobileAppBar } from "@/components/ui/app-bar";
import { CaseDetailView } from "@/components/cases/case-detail-view";

export default async function TherapistCaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return (
    <div className="space-y-2">
      <MobileAppBar title="症例詳細" eyebrow="Therapist" backHref="/t/cases" />
      <CaseDetailView caseId={caseId} basePath="/t/cases" />
    </div>
  );
}
