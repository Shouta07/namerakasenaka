import { MobileAppBar } from "@/components/ui/app-bar";
import { CaseFormView } from "@/components/cases/case-form-view";

export default function TherapistNewCasePage() {
  return (
    <div className="space-y-2">
      <MobileAppBar title="症例を登録" eyebrow="Therapist" backHref="/t/cases" />
      <CaseFormView caseId={null} basePath="/t/cases" />
    </div>
  );
}
