import { MobileAppBar } from "@/components/ui/app-bar";
import { AdminGuideCustomersList } from "@/components/guide/admin-customers-list";

export default function AdminGuideCustomersPage() {
  return (
    <div className="space-y-2">
      <MobileAppBar title="回復ガイド" eyebrow="SalonAdmin" backHref="/admin/dashboard" />
      <AdminGuideCustomersList />
    </div>
  );
}
