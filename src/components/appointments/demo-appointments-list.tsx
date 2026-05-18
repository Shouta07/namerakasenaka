"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  APPOINTMENT_STATUS_LABEL,
  type AppointmentStatus,
} from "@/types/domain";
import { demoAppointments, demoClient } from "@/lib/demo/fixtures";
import { useStoredAppointments } from "@/lib/demo/store";

type Item = {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  menuName: string;
  status: AppointmentStatus;
};

export function DemoAppointmentsList() {
  const stored = useStoredAppointments();
  const merged = useMemo<Item[]>(() => {
    const fixture: Item[] = demoAppointments
      .filter((a) => a.clientId === demoClient.id)
      .map((a) => ({
        id: a.id,
        scheduledAt: a.scheduledAt,
        durationMinutes: a.durationMinutes,
        menuName: a.menuName,
        status: a.status,
      }));
    const mine: Item[] = stored
      .filter((a) => a.clientId === demoClient.id)
      .map((a) => ({
        id: a.id,
        scheduledAt: a.scheduledAt,
        durationMinutes: a.durationMin,
        menuName: a.menuName,
        status: a.status,
      }));
    return [...fixture, ...mine].sort((a, b) =>
      a.scheduledAt.localeCompare(b.scheduledAt),
    );
  }, [stored]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">予約</h1>
        <Link href="/c/appointments/new">
          <Button>新規予約</Button>
        </Link>
      </header>
      <div className="space-y-3">
        {merged.length === 0 ? (
          <p className="text-sm text-stone-500">予約はまだありません。</p>
        ) : (
          merged.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {new Date(a.scheduledAt).toLocaleString("ja-JP")}
                  </p>
                  <p className="text-xs text-stone-500">
                    所要 {a.durationMinutes}分 ・ {a.menuName}
                  </p>
                </div>
                <Badge tone={a.status === "confirmed" ? "success" : "neutral"}>
                  {APPOINTMENT_STATUS_LABEL[a.status]}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
