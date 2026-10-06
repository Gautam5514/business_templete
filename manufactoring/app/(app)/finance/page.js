"use client";
import { useState } from "react";
import { Card, Insight, Kpi, PageHeader, Pill, Tabs } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { BarsChart, C, Donut, HBar, LineChartX } from "@/components/ui/charts";
import { useTab } from "@/lib/useTab";
import { COSTS, FINANCE, VARIANCE, profitability } from "@/data/finance";
import { inr, lakh, num } from "@/lib/format";
import { WoLink } from "@/components/ui/links";

function Overview() {
  const f = FINANCE;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {[["Sales", lakh(f.sales)], ["Collections", lakh(f.collections)], ["Raw material purchases", lakh(f.rmPurchases)], ["Production cost", lakh(f.production)], ["Labour cost", lakh(f.labour)], ["Power cost", lakh(f.power)], ["Maintenance cost", lakh(f.maintenance)], ["Packaging cost", lakh(f.packaging)], ["Freight", lakh(f.freight)], ["Gross margin", `${f.margin}%`], ["Outstanding", lakh(f.outstanding)], ["Supplier payable", lakh(f.payable)]].map(([k, v]) => <Kpi key={k} label={k} value={v} sub="Month to date" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card title="Sales, cost and margin" sub="₹ Lakh by month"><BarsChart data={f.byMonth} keys={[{ k: "sales", name: "Sales" }, { k: "cost", name: "Cost" }, { k: "margin", name: "Margin" }]} fmt={(v) => `₹${v}L`} height={250} colors={[C.accent, C.soft, C.ok]} /></Card>
        <Card title="Where the money goes" sub="Cost split, month to date"><Donut height={170} fmt={(v) => lakh(v)} data={f.costSplit} /><div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[12.5px]">{f.costSplit.map((c) => <div key={c.name} className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: c.color }} />{c.name}</span><b className="num">{lakh(c.value)}</b></div>)}</div></Card>
      </div>
      <Card title="Product profitability" pad={false}><DataTable rows={profitability} rowKey={(p) => p.product} pageSize={10} cols={[{ key: "product", header: "Product", render: (p) => <span className="font-medium">{p.product}</span> }, { key: "price", header: "Selling price", align: "right", render: (p) => inr(p.price) }, { key: "cost", header: "Standard cost", align: "right", render: (p) => inr(p.cost) }, { key: "margin", header: "Margin", align: "right", render: (p) => <span className={p.margin < 30 ? "text-warn" : "text-ok"}>{p.margin}%</span> }]} /></Card>
    </div>
  );
}

function Costing() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Kpi label="WO-2841 standard / unit" value="₹428" /><Kpi label="WO-2841 actual / unit" value="₹447" /><Kpi label="Variance" value="+₹19" tone="bad" sub="Higher material usage + machine downtime" /><Kpi label="Cost of rejection (MTD)" value="₹2.1 L" tone="warn" /></div>
      <DataTable rows={COSTS} rowKey={(c) => c.wo} pageSize={10} exportName="production-costing" searchPlaceholder="Search work order or product…"
        expand={(c) => <div className="text-[12.5px] text-mute">{c.wo === "WO-2841" ? <>Actual <b className="text-ink">₹447</b> vs standard <b className="text-ink">₹428</b> per unit (<b className="text-bad">+₹19</b>). Reason: higher material usage (+160 kg steel) and machine downtime (P-04, 1 h 52 m).</> : <>Per-unit variance ₹{c.perUnit - c.std} against standard ₹{c.std}.</>}</div>}
        cols={[{ key: "wo", header: "Work order", render: (c) => <WoLink id={c.wo} /> }, { key: "product", header: "Product" }, { key: "units", header: "Units", align: "right", render: (c) => num(c.units) }, { key: "material", header: "Raw material", align: "right", render: (c) => lakh(c.material) }, { key: "matVar", header: "Material variance", align: "right", render: (c) => <span className={c.matVar > 0 ? "text-bad" : "text-ok"}>{c.matVar > 0 ? "+" : ""}{inr(c.matVar)}</span> }, { key: "labour", header: "Labour", align: "right", render: (c) => lakh(c.labour) }, { key: "machine", header: "Machine", align: "right", render: (c) => lakh(c.machine) }, { key: "power", header: "Power", align: "right", render: (c) => lakh(c.power) }, { key: "packaging", header: "Packaging", align: "right", render: (c) => lakh(c.packaging) }, { key: "rejLoss", header: "Rejection loss", align: "right", render: (c) => lakh(c.rejLoss) }, { key: "overhead", header: "Overhead", align: "right", render: (c) => lakh(c.overhead) }, { key: "total", header: "Total cost", align: "right", render: (c) => <b>{lakh(c.total)}</b> }, { key: "std", header: "Std / unit", align: "right", render: (c) => `₹${c.std}` }, { key: "perUnit", header: "Actual / unit", align: "right", render: (c) => <b>₹{c.perUnit}</b> }, { key: "v", header: "Variance", align: "right", get: (c) => c.perUnit - c.std, render: (c) => <span className={c.perUnit - c.std > 10 ? "font-medium text-bad" : c.perUnit - c.std > 0 ? "text-warn" : "text-ok"}>{c.perUnit - c.std > 0 ? "+" : ""}₹{c.perUnit - c.std}</span> }]} />
    </div>
  );
}

function Variance() {
  const [open, setOpen] = useState(0);
  const tot = VARIANCE.rows.reduce((s, r) => s + r[1], 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">{VARIANCE.rows.map(([k, v], i) => <button key={k} onClick={() => setOpen(i)} className="text-left"><Kpi label={k} value={`+₹${v.toFixed(1)}`} sub="per unit · WO-2841" tone={open === i ? "warn" : undefined} /></button>)}<Kpi label="Total cost variance" value={`+₹${tot.toFixed(0)}`} tone="bad" sub="per unit" /></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={`Drill-down — ${VARIANCE.rows[open][0]}`} sub="Click a tile above to switch driver"><Insight>{VARIANCE.rows[open][2]}</Insight><div className="mt-4 space-y-3">{VARIANCE.rows.map(([k, v]) => <HBar key={k} label={k} right={`₹${v.toFixed(1)} / unit`} pct={(v / VARIANCE.rows[0][1]) * 100} tone={k === VARIANCE.rows[open][0] ? "bad" : "accent"} />)}</div></Card>
        <Card title="Average variance per unit" sub="₹ vs standard, by month"><LineChartX data={VARIANCE.trend} keys={[{ k: "v", name: "₹ / unit", color: C.bad }]} fmt={(v) => `₹${v}`} height={230} /></Card>
      </div>
    </div>
  );
}

export default function Finance() {
  const [tab, setTab] = useTab(["overview", "costing", "variance"], "overview");
  return (
    <div>
      <PageHeader title="Costing & Finance" sub="What it cost to make, what it sold for, and where the margin went." />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "overview", label: "Financial overview" }, { id: "costing", label: "Production costing" }, { id: "variance", label: "Standard vs actual" }]} />
      {tab === "overview" && <Overview />}{tab === "costing" && <Costing />}{tab === "variance" && <Variance />}
    </div>
  );
}
void Pill;
