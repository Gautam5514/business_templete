"use client";
import { useState } from "react";
import { Card, Kpi } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { BarsChart } from "@/components/ui/charts";
import { BOM, PRODUCTS, bomCost } from "@/data/masters";
import { inr } from "@/lib/format";

export function Bom() {
  const [pid, setPid] = useState("P-01");
  const p = PRODUCTS.find((x) => x.id === pid);
  const c = bomCost(pid);
  const rows = c.rows.map((r) => ({ ...r, share: (r.cost / c.total) * 100 }));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {PRODUCTS.map((x) => <button key={x.id} onClick={() => setPid(x.id)} className={`rounded-full border px-3 py-1 text-[12.5px] ${x.id === pid ? "border-accent bg-accent text-white" : "border-line-strong bg-surface text-mute hover:text-ink"}`}>{x.short}</button>)}
      </div>
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Material cost" value={`₹${c.material.toFixed(0)}`} />
        <Kpi label="Labour cost" value={`₹${c.labour}`} />
        <Kpi label="Machine & overhead" value={`₹${c.overhead + c.machine}`} />
        <Kpi label="Packaging cost" value={`₹${c.packaging.toFixed(0)}`} />
        <Kpi label="Std manufacturing cost" value={`₹${Math.round(c.total)}`} sub="per unit" />
        <Kpi label="Selling price" value={inr(p.price)} sub={`Margin ${(((p.price - c.total) / p.price) * 100).toFixed(1)}%`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card title={`BOM — ${p.name}`} sub={`${p.sku} · Model ${p.model} · version 3 (approved)`} pad={false}>
          <DataTable rows={rows} rowKey={(r) => r.name} pageSize={10} searchPlaceholder="Search component…" cols={[
            { key: "name", header: "Component", render: (r) => <span className="font-medium">{r.name}</span> },
            { key: "qty", header: "Qty / unit", align: "right", render: (r) => `${r.qty} ${r.unit}` },
            { key: "rate", header: "Rate", align: "right", render: (r) => `₹${r.rate}` },
            { key: "cost", header: "Cost / unit", align: "right", render: (r) => `₹${r.cost.toFixed(2)}` },
            { key: "share", header: "% of cost", align: "right", render: (r) => `${r.share.toFixed(1)}%` },
          ]} />
        </Card>
        <Card title="Cost build-up" sub="Standard cost per unit">
          <BarsChart hBar xKey="label" height={220} fmt={(v) => `₹${v}`} data={[{ label: "Material", v: Math.round(c.material) }, { label: "Packaging", v: Math.round(c.packaging) }, { label: "Labour", v: c.labour }, { label: "Machine", v: c.machine }, { label: "Overhead", v: c.overhead }]} keys={[{ k: "v", name: "₹ / unit" }]} />
          <div className="mt-2 flex items-center justify-between border-t border-line pt-3 text-[13px]"><span className="text-mute">Estimated manufacturing cost</span><b className="num text-[16px]">₹{Math.round(c.total)}</b></div>
        </Card>
      </div>
      <p className="text-[12px] text-faint">{Object.keys(BOM).length} BOMs shown of 180 finished SKUs. Rates are the latest weighted-average purchase rates.</p>
    </div>
  );
}
