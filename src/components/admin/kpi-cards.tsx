import { Card, CardContent } from "@/components/ui/card";

export type Kpi = {
  label: string;
  value: string | number;
  hint?: string;
};

export function KpiCards({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {kpis.map((k) => (
        <Card key={k.label}>
          <CardContent>
            <p className="text-xs text-stone-500">{k.label}</p>
            <p className="mt-1 text-2xl font-semibold">{k.value}</p>
            {k.hint ? <p className="mt-1 text-[10px] text-stone-400">{k.hint}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
