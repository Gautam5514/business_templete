"use client";
import { Insight, Kpi, PageHeader, Progress } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { BarsChart, C } from "@/components/ui/charts";
import { Card } from "@/components/ui/ui";
import { WIP, WIP_STAGES } from "@/data/orders";
import { lakh, num } from "@/lib/format";
import { WoLink } from "@/components/ui/links";

export default function Wip() {
  const total = WIP.reduce((s, w) => s + w.value, 0), units = WIP.reduce((s, w) => s + w.total, 0);
  const avg = WIP.reduce((s, w) => s + w.age * w.total, 0) / units;
  const delayed = WIP.filter((w) => w.age > 3);
  const stage = WIP_STAGES.map((s) => ({ label: s, n: WIP.reduce((a, w) => a + w[s], 0) }));
  return (
    <div>
      <PageHeader title="Work In Progress" sub="Everything between raw material and finished goods — by stage, order and age." />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Total WIP value" value={lakh(total)} sub="At standard cost" /><Kpi label="Units in production" value={num(units)} sub={`${WIP.length} work orders`} />
        <Kpi label="Average WIP age" value={`${avg.toFixed(1)} days`} sub="Unit-weighted" /><Kpi label="Delayed WIP (> 3 days)" value={lakh(delayed.reduce((s, w) => s + w.value, 0))} tone="bad" sub={`${delayed.length} orders · ${num(delayed.reduce((s, w) => s + w.total, 0))} units`} />
      </div>
      <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card title="Units by stage"><BarsChart data={stage} keys={[{ k: "n", name: "Units" }]} height={230} /></Card>
        <Card title="Stage breakdown — Sink 24×18" sub="WO-2841 · Line 2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Forming", 420], ["Welding", 280], ["Polishing", 190], ["QC", 136]].map(([k, v]) => <div key={k} className="rounded-[8px] border border-line bg-bg p-3"><div className="label !text-[10px]">{k}</div><div className="num mt-1 text-[24px] font-semibold">{v}</div><Progress value={v} max={420} className="mt-2" /></div>)}</div>
          <div className="mt-3"><Insight tone="warn">Basin Mixer WIP (WO-2845) is 3.4 days old — 210 units wait at assembly for brass cartridges.</Insight></div>
        </Card>
      </div>
      <DataTable rows={WIP} rowKey={(w) => w.wo} pageSize={10} exportName="wip" searchPlaceholder="Search work order or product…" defaultSort={{ key: "age", dir: "desc" }}
        filters={[{ key: "age", label: "Age", options: ["Over 3 days", "Under 3 days"], match: (r, v) => (v === "Over 3 days" ? r.age > 3 : r.age <= 3) }]}
        cols={[{ key: "wo", header: "Work order", render: (w) => <WoLink id={w.wo} /> }, { key: "product", header: "Product" }, ...WIP_STAGES.map((s) => ({ key: s, header: s, align: "right", render: (w) => w[s] ? num(w[s]) : <span className="text-faint">—</span> })), { key: "total", header: "Total units", align: "right", render: (w) => <b>{num(w.total)}</b> }, { key: "age", header: "Age", align: "right", render: (w) => <span className={w.age > 3 ? "font-medium text-bad" : ""}>{w.age.toFixed(1)} d</span> }, { key: "value", header: "Value", align: "right", render: (w) => lakh(w.value) }]} />
    </div>
  );
}
void C;
