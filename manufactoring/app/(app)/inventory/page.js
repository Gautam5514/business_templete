"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Btn, Card, Kpi, PageHeader, Progress } from "@/components/ui/ui";
import { BarsChart, C, Donut, HBar } from "@/components/ui/charts";
import { DataTable } from "@/components/ui/table";
import { INV_VALUE_TREND, FG } from "@/data/ops";
import { MATERIALS, WAREHOUSES } from "@/data/masters";
import { lakh, num } from "@/lib/format";
import { Pill } from "@/components/ui/ui";

export default function Inventory() {
  const alerts = MATERIALS.filter((m) => m.status !== "In Stock");
  return (
    <div>
      <PageHeader title="Inventory" sub="Raw material, work in progress and finished goods — one value, three warehouses." />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Raw material" value="₹3.42 Cr" sub="420 SKUs" href="/raw-materials" /><Kpi label="Work in progress" value="₹68.4 L" sub="7 work orders" href="/wip" />
        <Kpi label="Finished goods" value="₹2.16 Cr" sub="180 SKUs" href="/finished-goods" /><Kpi label="Total inventory" value="₹6.26 Cr" sub="+2.8% vs last month" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Inventory value trend" sub="₹ Crore, month end" className="lg:col-span-2"><BarsChart data={INV_VALUE_TREND} stacked keys={[{ k: "rm", name: "Raw material" }, { k: "fg", name: "Finished goods" }, { k: "wip", name: "WIP" }]} fmt={(v) => `₹${v}Cr`} height={250} /></Card>
        <Card title="Value split"><Donut height={160} fmt={(v) => lakh(v)} data={[{ name: "Raw material", value: 34200000, color: C.accent }, { name: "Finished goods", value: 21600000, color: C.soft }, { name: "WIP", value: 6840000, color: C.warn }]} />
          <div className="mt-2 space-y-1 text-[12.5px]">{[["Raw material", "54.6%", C.accent], ["Finished goods", "34.5%", C.soft], ["WIP", "10.9%", C.warn]].map(([k, v, c]) => <div key={k} className="flex justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: c }} />{k}</span><b className="num">{v}</b></div>)}</div></Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {WAREHOUSES.map((w) => <Card key={w.id} title={w.name} sub={`${w.plant} · space used ${w.util}%`}><div className="num text-[22px] font-semibold">{lakh(w.value)}</div><Progress value={w.util} tone={w.util > 85 ? "bad" : "accent"} className="mt-2" /></Card>)}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Materials needing action" action={<Btn size="xs" href="/raw-materials?tab=mrp">MRP <ArrowRight size={12} /></Btn>} pad={false}>
          <div className="divide-y divide-line">{alerts.map((m) => <Link key={m.code} href="/raw-materials" className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-bg"><div><div className="text-[13px] font-medium">{m.name}</div><div className="text-[12px] text-mute">Available {num(m.avail)} {m.unit} · min {num(m.min)} · incoming {num(m.incoming)}</div></div><Pill>{m.status}</Pill></Link>)}</div>
        </Card>
        <Card title="Finished goods cover" sub="Free stock vs minimum">
          <div className="space-y-3">{FG.map((f) => <HBar key={f.pid} label={f.product} right={`${num(f.free)} free / min ${num(f.min)}`} pct={Math.min(100, (f.free / (f.min * 2)) * 100)} tone={f.free < f.min ? "bad" : "ok"} />)}</div>
        </Card>
      </div>
    </div>
  );
}
void DataTable;
