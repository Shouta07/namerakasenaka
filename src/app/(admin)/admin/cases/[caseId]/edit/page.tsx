import { MobileAppBar } from "@/components/ui/app-bar";
import { CaseFormView } from "@/components/cases/case-form-view";

export default async function AdminCaseEditPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return (
    <div className="space-y-2">
      <MobileAppBar title="症例を編集" eyebrow="SalonAdmin" backHref={`/admin/cases/${caseId}`} />
      <CaseFormView caseId={caseId} basePath="/admin/cases" />
    </div>
  );
}
