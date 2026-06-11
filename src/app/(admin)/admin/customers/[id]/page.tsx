import { MobileAppBar } from "@/components/ui/app-bar";
import { GuideCustomerDetail } from "@/components/guide/guide-customer-detail";

export default async function AdminGuideCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-2">
      <MobileAppBar title="回復ガイド詳細" eyebrow="SalonAdmin" backHref="/admin/customers" />
      <GuideCustomerDetail guideCustomerId={id} />
    </div>
  );
}
