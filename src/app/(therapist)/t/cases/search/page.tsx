import { MobileAppBar } from "@/components/ui/app-bar";
import { CaseSearchView } from "@/components/cases/case-search-view";

export default function TherapistCaseSearchPage() {
  return (
    <div className="space-y-2">
      <MobileAppBar title="症例検索" eyebrow="Therapist" backHref="/t/cases" />
      <CaseSearchView basePath="/t/cases" />
    </div>
  );
}
