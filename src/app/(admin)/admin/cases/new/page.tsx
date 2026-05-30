import { MobileAppBar } from "@/components/ui/app-bar";
import { CaseFormView } from "@/components/cases/case-form-view";

export default function AdminNewCasePage() {
  return (
    <div className="space-y-2">
      <MobileAppBar title="症例を登録" eyebrow="SalonAdmin" backHref="/admin/cases" />
      <CaseFormView caseId={null} basePath="/admin/cases" />
    </div>
  );
}
