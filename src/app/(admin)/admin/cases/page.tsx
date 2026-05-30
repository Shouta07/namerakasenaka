import { MobileAppBar } from "@/components/ui/app-bar";
import { CaseListView } from "@/components/cases/case-list-view";

export default function AdminCasesPage() {
  return (
    <div className="space-y-2">
      <MobileAppBar title="症例ライブラリ" eyebrow="SalonAdmin" backHref="/admin/dashboard" />
      <CaseListView basePath="/admin/cases" />
    </div>
  );
}
