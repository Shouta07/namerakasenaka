import { MobileAppBar } from "@/components/ui/app-bar";
import { TagsAdminView } from "@/components/cases/tags-admin-view";

export default function AdminCaseTagsPage() {
  return (
    <div className="space-y-2">
      <MobileAppBar title="タグ管理" eyebrow="SalonAdmin" backHref="/admin/cases" />
      <TagsAdminView />
    </div>
  );
}
