import { MobileAppBar } from "@/components/ui/app-bar";
import { CaseSearchView } from "@/components/cases/case-search-view";

export default function AdminCaseSearchPage() {
  return (
    <div className="space-y-2">
      <MobileAppBar title="症例検索" eyebrow="SalonAdmin" backHref="/admin/cases" />
      <CaseSearchView basePath="/admin/cases" />
    </div>
  );
}
