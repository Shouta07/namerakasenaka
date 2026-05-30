import { MobileAppBar } from "@/components/ui/app-bar";
import { CaseListView } from "@/components/cases/case-list-view";

export default function TherapistCasesPage() {
  return (
    <div className="space-y-2">
      <MobileAppBar title="症例" eyebrow="Therapist" backHref="/t/today" />
      <CaseListView basePath="/t/cases" />
    </div>
  );
}
