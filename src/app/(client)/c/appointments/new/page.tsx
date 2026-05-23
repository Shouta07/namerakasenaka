export const dynamic = "force-dynamic";

import { isDemoMode } from "@/lib/demo";
import { demoClient, getAvailability } from "@/lib/demo/fixtures";
import { NewAppointmentFlow } from "@/components/appointments/new-appointment-flow";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const dateParam = typeof sp.date === "string" ? sp.date : undefined;

  const therapistName = demoClient.primaryTherapistName;
  const availability = getAvailability({
    therapistName,
    daysAhead: 14,
  });

  const recommendedDate = availability.find((d) => d.isRecommended)?.date;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">新規予約</h1>
        <p className="mt-1 text-sm text-stone-600">
          ご希望の日付と時間を選んでください。空き状況はリアルタイムに更新されます。
        </p>
      </header>

      <NewAppointmentFlow
        availability={availability}
        recommendedDate={recommendedDate}
        recommendedTime="14:00"
        clientId={demoClient.id}
        clientName={demoClient.displayName}
        therapistId={therapistName}
        therapistName={therapistName}
        initialDate={dateParam ?? recommendedDate}
        demoMode={isDemoMode()}
        redirectTo="/c/appointments"
      />
    </div>
  );
}
