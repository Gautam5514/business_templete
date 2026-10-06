"use client";
import { Fuel, Gauge, Wrench } from "lucide-react";
import { EQUIPMENT } from "@/data/ops";
import { projName } from "@/data/core";
import { Bar, Card, Kpi, Pill, Ring, cn } from "@/components/ui/ui";
import { rs } from "@/lib/format";

export function EquipmentSection({ pid }) {
  const rows = EQUIPMENT.filter((e) => !pid || e.p === pid);
  const run = rows.filter((e) => e.status === "Running").length;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Fleet" value={rows.length} /><Kpi label="Running now" value={run} tone="good" /><Kpi label="Down / maintenance" value={rows.filter((e) => e.status === "Breakdown" || e.status === "Maintenance").length} tone="bad" /><Kpi label="Fuel / power today" value={rs(rows.reduce((a, e) => a + e.fuel, 0))} />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((e) => (
          <div key={e.id} className={cn("lift rounded-[8px] border bg-surface p-4", e.status === "Breakdown" ? "border-bad/50" : "border-line")}>
            <div className="flex items-start justify-between gap-2"><div><div className="text-[14px] font-semibold">{e.name}</div><div className="text-[11.5px] text-mute">{projName(e.p)}</div></div><Pill>{e.status}</Pill></div>
            <div className="mt-3 flex items-center gap-4">
              <Ring size={72} stroke={8} value={e.util} tone={e.util > 70 ? "good" : e.util > 40 ? "warn" : "bad"} label={`${e.util}%`} sub="util." />
              <dl className="flex-1 space-y-1 text-[12px]">
                <div className="flex justify-between"><dt className="text-mute">Operator</dt><dd className="font-medium">{e.operator}</dd></div>
                <div className="flex justify-between"><dt className="text-mute">Runtime today</dt><dd className="num font-medium">{e.runtime}</dd></div>
                <div className="flex justify-between"><dt className="text-mute">Fuel / power</dt><dd className="num font-medium">{rs(e.fuel)}</dd></div>
                <div className="flex justify-between"><dt className="text-mute">Next maintenance</dt><dd className={cn("font-medium", e.maint === "Now" && "text-bad")}>{e.maint}</dd></div>
              </dl>
            </div>
            {e.status === "Breakdown" && <div className="mt-3 rounded-[4px] bg-bad-soft px-2.5 py-1.5 text-[12px] text-bad">Hydraulic hose failure — estimated 3 days lost. ₹4.2K hire cost today.</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
