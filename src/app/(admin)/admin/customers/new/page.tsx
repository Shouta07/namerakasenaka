import { MobileAppBar } from "@/components/ui/app-bar";
import { GuideCustomerForm } from "@/components/guide/guide-customer-form";

export default function AdminNewGuideCustomerPage() {
  return (
    <div className="space-y-2">
      <MobileAppBar title="回復ガイド発行先を登録" eyebrow="SalonAdmin" backHref="/admin/customers" />
      <GuideCustomerForm />
    </div>
  );
}
