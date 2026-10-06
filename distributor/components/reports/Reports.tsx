"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Download, FileBarChart } from "lucide-react";
import { useStore } from "@/lib/store";
import { Btn, Card, Delta, PageHeader, Pill, Progress, Segmented, Tabs, cn } from "@/components/ui/ui";
import { DataTable, type Col } from "@/components/ui/table";
import { BarsChart, CHART_COLORS, Donut, TrendChart } from "@/components/ui/charts";
import { CustLink, ProdLink } from "@/components/ui/links";
import { CATEGORIES, PRODUCTS, WAREHOUSES, prodBySku } from "@/data/core";
import { STOCK, available, stockStatus } from "@/data/ops";
import { EXP_CATS, MONTHLY, SUPPLIERS, series } from "@/data/misc";
import { lakh, num, inr } from "@/lib/format";

const PERIODS = ["Today", "Yesterday", "This Week", "This Month", "Last Month", "Quarter", "Financial Year", "Custom Date"] as const;
const FACT: Record<string, number> = { Today: 0.036, Yesterday: 0.041, "This Week": 0.22, "This Month": 1, "Last Month": 0.89, Quarter: 2.85, "Financial Year": 7.9, "Custom Date": 0.5 };
const GROUPS: [string, [string, string][]][] = [
  ["Sales", [["sales", "Sales Report"], ["collections", "Collection Report"], ["outstanding", "Outstanding Report"]]],
  ["Stock", [["inventory", "Inventory Report"], ["movement", "Stock Movement Report"], ["warehouse", "Warehouse Performance"], ["purchase", "Purchase Report"]]],
  ["Performance", [["customers", "Customer Performance"], ["sales-team", "Salesperson Performance"], ["products", "Product Performance"], ["profit", "Profitability"]]],
  ["Operations", [["returns", "Returns"], ["expenses", "Expenses"]]],
];

function Kpis({ items }: { items: [string, string, string?][] }) {
  return <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">{items.map(([l, v, t]) => <div key={l} className="rounded-[8px] border border-line bg-surface p-3"><div className="label">{l}</div><div className={cn("num mt-1 text-[21px] font-semibold tracking-tight", t === "ok" && "text-ok", t === "bad" && "text-bad")}>{v}</div></div>)}</div>;
}
function Simple<T extends Record<string, unknown>>({ rows, cols, size = 8 }: { rows: T[]; cols: Col<T>[]; size?: number }) {
  return <DataTable rows={rows} cols={cols} rowKey={(r) => JSON.stringify(Object.values(r).slice(0, 2))} pageSize={size} />;
}

export function Reports() {
  const sp = useSearchParams();
  const router = useRouter();
  const { customers, toast } = useStore();
  const id = sp.get("r") ?? "sales";
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("This Month");
  const f = FACT[period];
  const title = GROUPS.flatMap((g) => g[1]).find((r) => r[0] === id)?.[1] ?? "Report";
  const exp = () => toast(`${title} exported`, "ok", `${period} · ${title.toLowerCase().replace(/ /g, "-")}.xlsx`);

  return (
    <div className="space-y-4">
      <PageHeader title="Reports Center" sub="Every report, filtered by period, exportable in one click." actions={<Btn icon={<Download size={14} />} onClick={exp}>Export</Btn>} />
      <div className="grid gap-4 lg:grid-cols-[230px_1fr]">
        <nav className="space-y-4 lg:sticky lg:top-[68px] lg:self-start">
          {GROUPS.map(([g, items]) => (
            <div key={g}>
              <div className="px-2 pb-1 text-[10.5px] font-medium uppercase tracking-[0.06em] text-faint">{g}</div>
              <div className="flex flex-wrap gap-1 lg:block">{items.map(([k, l]) => <button key={k} onClick={() => router.replace(`/reports?r=${k}`)} className={cn("flex items-center gap-2 whitespace-nowrap rounded-[6px] px-2.5 py-1.5 text-left text-[13px] lg:w-full", id === k ? "bg-surface font-medium text-ink shadow-[0_0_0_1px_var(--line)]" : "text-mute hover:bg-panel hover:text-ink")}><FileBarChart size={14} className={id === k ? "text-accent" : "text-faint"} />{l}</button>)}</div>
            </div>
          ))}
        </nav>
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-[17px] font-semibold tracking-tight">{title}</h2><div className="max-w-full overflow-x-auto"><Segmented options={[...PERIODS]} value={period} onChange={setPeriod} size="sm" /></div></div>
          {id === "sales" && <SalesR f={f} />}
          {id === "collections" && <CollR f={f} />}
          {id === "outstanding" && <OutR />}
          {id === "inventory" && <InvR />}
          {id === "movement" && <MoveR f={f} />}
          {id === "warehouse" && <WhR f={f} />}
          {id === "purchase" && <PurR f={f} />}
          {id === "customers" && <CustR customers={customers} f={f} />}
          {id === "sales-team" && <TeamR f={f} />}
          {id === "products" && <ProdR f={f} />}
          {id === "profit" && <ProfitR f={f} />}
          {id === "returns" && <RetR f={f} />}
          {id === "expenses" && <ExpR f={f} />}
        </div>
      </div>
    </div>
  );
}

function SalesR({ f }: { f: number }) {
  const [rg, setRg] = useState<"30D" | "3M" | "12M">("12M");
  const data = useMemo(() => series(rg), [rg]);
  const byCat = CATEGORIES.map((c) => ({ cat: c, sales: PRODUCTS.filter((p) => p.category === c).reduce((a, p) => a + p.sales, 0) * f * 0.12 })).sort((a, b) => b.sales - a.sales);
  const byCity = [["Patna", 24], ["Ranchi", 21], ["Dhanbad", 15], ["Kolkata", 13], ["Jamshedpur", 9], ["Others", 18]];
  return <>
    <Kpis items={[["Net sales", lakh(1.84e7 * f), ""], ["Orders", num(142 * f), ""], ["Avg order value", "₹1.30 L"], ["vs previous period", "+12.8%", "ok"]]} />
    <Card title="Sales trend" action={<Segmented size="sm" options={["30D", "3M", "12M"]} value={rg} onChange={setRg} />}><TrendChart data={data} height={260} /></Card>
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Sales by category"><BarsChart data={byCat.map((c) => ({ label: c.cat.split(" ")[0], Sales: c.sales }))} keys={[{ k: "Sales", name: "Sales" }]} height={220} /></Card>
      <Card title="Sales by city"><ul className="space-y-3">{byCity.map(([c, p]) => <li key={c as string}><div className="flex justify-between text-[13px]"><span>{c}</span><span className="num font-medium">{lakh(1.84e7 * f * (p as number) / 100)} <span className="text-faint">· {p}%</span></span></div><Progress className="mt-1" value={p as number} max={30} /></li>)}</ul></Card>
    </div>
  </>;
}
function CollR({ f }: { f: number }) {
  const m = [["NEFT", 38], ["UPI", 24], ["Bank Transfer", 14], ["Cheque", 11], ["RTGS", 8], ["Cash", 5]];
  return <>
    <Kpis items={[["Collected", lakh(1.42e7 * f), "ok"], ["Collection efficiency", "77%"], ["On-time receipts", "64%"], ["Avg. days to collect", "23 days"]]} />
    <Card title="Sales vs collections"><BarsChart data={MONTHLY.map((x) => ({ label: x.label, Sales: x.sales, Collections: x.collections }))} keys={[{ k: "Sales", name: "Sales" }, { k: "Collections", name: "Collections" }]} colors={[CHART_COLORS.accent, CHART_COLORS.ok]} height={250} /></Card>
    <Card title="Collections by mode"><div className="grid gap-3 sm:grid-cols-3">{m.map(([n, p]) => <div key={n as string}><div className="flex justify-between text-[13px]"><span>{n}</span><span className="num font-medium">{lakh(1.42e7 * f * (p as number) / 100)}</span></div><Progress className="mt-1" value={p as number} max={40} tone="ok" /></div>)}</div></Card>
  </>;
}
function OutR() {
  const { customers } = useStore();
  const rows = customers.filter((c) => c.outstanding > 0).sort((a, b) => b.outstanding - a.outstanding).slice(0, 40);
  return <>
    <Kpis items={[["Total outstanding", "₹46.72 L"], ["Overdue", "₹14.7 L", "bad"], ["Not yet due", "₹18.2 L"], ["Customers with dues", String(customers.filter((c) => c.outstanding > 0).length)]]} />
    <Simple rows={rows} size={10} cols={[{ key: "name", header: "Customer", render: (c) => <CustLink id={c.id} /> }, { key: "city", header: "City", muted: true }, { key: "outstanding", header: "Outstanding", align: "right", render: (c) => <b>{inr(c.outstanding)}</b> }, { key: "overdue", header: "Overdue", align: "right", render: (c) => <span className="text-bad">{inr(c.overdue)}</span> }, { key: "oldestDays", header: "Oldest (days)", align: "right" }, { key: "rep", header: "Salesperson", muted: true }]} />
  </>;
}
function InvR() {
  const cat = CATEGORIES.map((c) => ({ name: c, value: STOCK.filter((s) => prodBySku(s.sku)!.category === c).reduce((a, s) => a + s.physical * prodBySku(s.sku)!.cost, 0) })).sort((a, b) => b.value - a.value);
  const col = ["#3a3fc4", "#0b6a9c", "#157347", "#a15c07", "#6b5bd6", "#b42318", "#6b6a64", "#9aa0e6", "#c9a227", "#2c7a7b"];
  return <>
    <Kpis items={[["Inventory value", "₹2.18 Cr"], ["Units on hand", num(STOCK.reduce((a, s) => a + s.physical, 0))], ["Low stock lines", String(STOCK.filter((s) => stockStatus(s) === "Low Stock").length), "bad"], ["Inventory turns", "8.1×"]]} />
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <Card title="Value by category"><Donut data={cat.map((c, i) => ({ ...c, color: col[i % col.length] }))} height={170} /><ul className="mt-2 space-y-1 text-[12.5px]">{cat.slice(0, 6).map((c, i) => <li key={c.name} className="flex justify-between"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-sm" style={{ background: col[i] }} />{c.name}</span><span className="num">{lakh(c.value)}</span></li>)}</ul></Card>
      <Card title="Stock status by warehouse"><BarsChart data={WAREHOUSES.map((w) => ({ label: w.city, Healthy: STOCK.filter((s) => s.wh === w.id && stockStatus(s) === "Healthy").length, Low: STOCK.filter((s) => s.wh === w.id && stockStatus(s) === "Low Stock").length, Overstock: STOCK.filter((s) => s.wh === w.id && stockStatus(s) === "Overstock").length }))} keys={[{ k: "Healthy", name: "Healthy" }, { k: "Low", name: "Low" }, { k: "Overstock", name: "Overstock" }]} colors={[CHART_COLORS.ok, CHART_COLORS.warn, "#9aa0e6"]} money={false} stacked height={220} /></Card>
    </div>
  </>;
}
function MoveR({ f }: { f: number }) {
  return <>
    <Kpis items={[["Units received", num(18400 * f), "ok"], ["Units dispatched", num(21200 * f)], ["Transfers", num(14 * f)], ["Adjustments / damage", num(212 * f), "bad"]]} />
    <Card title="Inflow vs outflow"><BarsChart data={["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((m, i) => ({ label: m, Received: (14 + ((i * 5) % 7)) * 1000 * 0.1 * 10, Dispatched: (15 + ((i * 3) % 8)) * 1000 }))} keys={[{ k: "Received", name: "Received" }, { k: "Dispatched", name: "Dispatched" }]} money={false} colors={[CHART_COLORS.ok, CHART_COLORS.accent]} height={250} /></Card>
  </>;
}
function WhR({ f }: { f: number }) {
  return <>
    <Kpis items={[["Orders packed", num(412 * f)], ["Avg. pack time", "41 min"], ["Dispatch errors", "7", "bad"], ["Stock accuracy", "98.9%", "ok"]]} />
    <Simple rows={WAREHOUSES.map((w, i) => ({ name: w.name, packed: Math.round([212, 164, 141][i] * f), units: Math.round([14800, 9300, 8400][i] * f), errors: [3, 3, 1][i], acc: ["99.1%", "98.6%", "98.9%"][i], ontime: ["95%", "92%", "94%"][i] }))} cols={[{ key: "name", header: "Warehouse" }, { key: "packed", header: "Orders packed", align: "right" }, { key: "units", header: "Units packed", align: "right", render: (r) => num(r.units) }, { key: "errors", header: "Dispatch errors", align: "right" }, { key: "acc", header: "Stock accuracy", align: "right" }, { key: "ontime", header: "On-time dispatch", align: "right" }]} />
  </>;
}
function PurR({ f }: { f: number }) {
  return <>
    <Kpis items={[["Purchases", lakh(2.9e7 * f * 0.55)], ["Open POs", "12"], ["Payable", lakh(SUPPLIERS.reduce((a, s) => a + s.payable, 0)), "bad"], ["Avg. lead time", "8.4 days"]]} />
    <Simple rows={SUPPLIERS.map((s) => ({ ...s, v: s.value * f * 0.3 }))} cols={[{ key: "name", header: "Supplier" }, { key: "category", header: "Category", muted: true }, { key: "v", header: "Purchased", align: "right", render: (s) => lakh(s.v) }, { key: "payable", header: "Payable", align: "right", render: (s) => lakh(s.payable) }, { key: "lead", header: "Lead time", align: "right", render: (s) => `${s.lead}d` }, { key: "rating", header: "Rating", align: "right" }]} />
  </>;
}

function CustR({ customers, f }: { customers: ReturnType<typeof useStore>["customers"]; f: number }) {
  const T = ["Top Customers", "Fastest Growing", "Highest Outstanding", "Slow Paying", "Inactive", "New", "At Risk"] as const;
  const [t, setT] = useState<(typeof T)[number]>("Top Customers");
  const growth = (c: { name: string }) => ((c.name.length * 7) % 38) + 6;
  const list = useMemo(() => {
    const a = [...customers];
    switch (t) {
      case "Top Customers": return a.sort((x, y) => y.totalSales - x.totalSales);
      case "Fastest Growing": return a.filter((c) => c.segment !== "At Risk").sort((x, y) => growth(y) - growth(x));
      case "Highest Outstanding": return a.sort((x, y) => y.outstanding - x.outstanding);
      case "Slow Paying": return a.sort((x, y) => y.avgDelay - x.avgDelay);
      case "Inactive": return a.filter((c) => c.lastOrder < "2026-09-10").sort((x, y) => x.lastOrder.localeCompare(y.lastOrder));
      case "New": return a.filter((c) => c.segment === "New");
      case "At Risk": return a.filter((c) => c.segment === "At Risk").sort((x, y) => y.overdue - x.overdue);
    }
  }, [t, customers]);
  return <>
    <Kpis items={[["Active dealers", String(customers.length)], ["New this quarter", String(customers.filter((c) => c.segment === "New").length), "ok"], ["At-risk dealers", String(customers.filter((c) => c.segment === "At Risk").length), "bad"], ["Top-10 share of sales", "38%"]]} />
    <Tabs tabs={[...T]} value={t} onChange={setT} />
    <Simple rows={list} size={10} cols={[
      { key: "name", header: "Customer", render: (c) => <CustLink id={c.id} /> }, { key: "city", header: "City", muted: true },
      { key: "totalSales", header: "Sales (lifetime)", align: "right", render: (c) => lakh(c.totalSales * Math.min(1, f + 0.2)) },
      { key: "growth", header: "Growth", align: "right", get: (c) => growth(c), render: (c) => <Delta v={t === "Inactive" || t === "At Risk" ? -growth(c) : growth(c)} /> },
      { key: "outstanding", header: "Outstanding", align: "right", render: (c) => inr(c.outstanding) }, { key: "avgDelay", header: "Avg delay", align: "right", render: (c) => `${c.avgDelay}d` },
      { key: "lastOrder", header: "Last order", muted: true }, { key: "segment", header: "Segment", render: (c) => <Pill>{c.segment}</Pill> },
    ]} />
  </>;
}
function TeamR({ f }: { f: number }) {
  const rows = [
    { rank: 1, name: "Amit Kumar", sales: 3140000, target: 2800000, coll: 2480000, nc: 3, orders: 42, out: 820000 },
    { rank: 2, name: "Rohit Singh", sales: 2870000, target: 2760000, coll: 2310000, nc: 2, orders: 38, out: 740000 },
    { rank: 3, name: "Vikash Sharma", sales: 2420000, target: 2660000, coll: 2060000, nc: 4, orders: 34, out: 610000 },
  ].map((r) => ({ ...r, sales: r.sales * f, coll: r.coll * f, target: r.target * f, ach: Math.round((r.sales / r.target) * 100), aov: Math.round(r.sales / r.orders) }));
  return <>
    <Kpis items={[["Team sales", lakh(8430000 * f)], ["Target achievement", "103%", "ok"], ["Collections", lakh(6850000 * f)], ["New customers", "9"]]} />
    <Card title="Leaderboard" pad={false}>
      <ul className="divide-y divide-line">{rows.map((r) => <li key={r.name} className="flex items-center gap-4 px-4 py-3"><span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-semibold", r.rank === 1 ? "bg-[#fdf1dc] text-[#a15c07]" : "bg-panel text-mute")}>{r.rank}</span><div className="min-w-0 flex-1"><div className="flex justify-between"><span className="font-medium">{r.name}</span><span className="num font-semibold">{lakh(r.sales)}</span></div><Progress className="mt-1.5" value={r.ach} max={120} tone={r.ach >= 100 ? "ok" : "warn"} /><div className="mt-1 text-[12px] text-mute">{r.ach}% of {lakh(r.target)} target</div></div></li>)}</ul>
    </Card>
    <Simple rows={rows} cols={[{ key: "name", header: "Salesperson" }, { key: "target", header: "Target", align: "right", render: (r) => lakh(r.target) }, { key: "ach", header: "Achievement", align: "right", render: (r) => <span className={r.ach >= 100 ? "font-semibold text-ok" : "font-semibold text-warn"}>{r.ach}%</span> }, { key: "coll", header: "Collections", align: "right", render: (r) => lakh(r.coll) }, { key: "nc", header: "New customers", align: "right" }, { key: "orders", header: "Orders", align: "right" }, { key: "aov", header: "Avg order value", align: "right", render: (r) => inr(r.aov) }, { key: "out", header: "Outstanding", align: "right", render: (r) => lakh(r.out) }]} />
  </>;
}
function ProdR({ f }: { f: number }) {
  const T = ["Top Selling", "Slow Moving", "High Margin", "Low Margin", "Low Stock", "Dead Stock"] as const;
  const [t, setT] = useState<(typeof T)[number]>("Top Selling");
  const list = useMemo(() => {
    const a = [...PRODUCTS];
    switch (t) {
      case "Top Selling": return a.sort((x, y) => y.sales - x.sales);
      case "Slow Moving": return a.sort((x, y) => x.units - y.units);
      case "High Margin": return a.sort((x, y) => y.margin - x.margin);
      case "Low Margin": return a.sort((x, y) => x.margin - y.margin);
      case "Low Stock": return a.filter((p) => STOCK.some((s) => s.sku === p.sku && available(s) < s.reorder));
      case "Dead Stock": return a.sort((x, y) => x.units * x.price - y.units * y.price).slice(0, 6);
    }
  }, [t]);
  return <>
    <Kpis items={[["Top product", "Premium Kitchen Sink 24×18"], ["Fast movers", "18 SKUs", "ok"], ["Slow movers", "9 SKUs"], ["Dead stock value", "₹6.4 L", "bad"]]} />
    <Tabs tabs={[...T]} value={t} onChange={setT} />
    <Simple rows={list} size={10} cols={[{ key: "name", header: "Product", render: (p) => <ProdLink id={p.id}>{p.name}</ProdLink> }, { key: "category", header: "Category", muted: true }, { key: "sales", header: "Sales", align: "right", render: (p) => lakh(p.sales * Math.min(1, f + 0.2)) }, { key: "units", header: "Units", align: "right", render: (p) => num(p.units) }, { key: "growth", header: "Growth", align: "right", render: (p) => <Delta v={p.growth} /> }, { key: "margin", header: "Margin", align: "right", render: (p) => `${p.margin}%` }, { key: "stock", header: "Stock", align: "right", get: (p) => STOCK.filter((s) => s.sku === p.sku).reduce((a, s) => a + available(s), 0), render: (p) => num(STOCK.filter((s) => s.sku === p.sku).reduce((a, s) => a + available(s), 0)) }]} />
  </>;
}
function ProfitR({ f }: { f: number }) {
  const cats = CATEGORIES.map((c) => { const ps = PRODUCTS.filter((p) => p.category === c); const s = ps.reduce((a, p) => a + p.sales, 0); const m = ps.reduce((a, p) => a + (p.sales * p.margin) / 100, 0); return { c, s, m, pct: (m / s) * 100 }; }).sort((a, b) => b.m - a.m);
  return <>
    <Kpis items={[["Revenue", lakh(1.84e7 * f)], ["Gross profit", lakh(1.84e7 * f * 0.213), "ok"], ["Gross margin", "21.3%"], ["Net after expenses", lakh(1.84e7 * f * 0.16)]]} />
    <Card title="Margin by category"><BarsChart data={cats.map((x) => ({ label: x.c.split(" ")[0], Margin: Math.round(x.pct * 10) / 10 }))} keys={[{ k: "Margin", name: "Margin %" }]} money={false} height={230} colors={[CHART_COLORS.ok]} /></Card>
    <Simple rows={cats} cols={[{ key: "c", header: "Category" }, { key: "s", header: "Sales", align: "right", render: (r) => lakh(r.s * f * 0.12) }, { key: "m", header: "Gross profit", align: "right", render: (r) => lakh(r.m * f * 0.12) }, { key: "pct", header: "Margin", align: "right", render: (r) => `${r.pct.toFixed(1)}%` }]} />
  </>;
}
function RetR({ f }: { f: number }) {
  const { returns } = useStore();
  return <>
    <Kpis items={[["Returns value", lakh(returns.reduce((a, r) => a + r.value, 0) * f * 3)], ["Return rate", "1.4%"], ["Damaged in transit", "0.6%", "bad"], ["Credit notes issued", "₹1.7 L"]]} />
    <Simple rows={returns} cols={[{ key: "id", header: "Return" }, { key: "type", header: "Type" }, { key: "product", header: "Product", muted: true }, { key: "qty", header: "Qty", align: "right" }, { key: "value", header: "Value", align: "right", render: (r) => inr(r.value) }, { key: "outcome", header: "Outcome", muted: true }]} />
  </>;
}
function ExpR({ f }: { f: number }) {
  const { expenses } = useStore();
  const by = EXP_CATS.map((c) => ({ label: c.split(" ")[0], Amount: expenses.filter((e) => e.cat === c).reduce((a, e) => a + e.amount, 0) * f }));
  return <>
    <Kpis items={[["Total expense", inr(expenses.reduce((a, e) => a + e.amount, 0) * f)], ["% of sales", "5.3%"], ["Transport", inr(by[0].Amount)], ["Warehouse", inr(by[2].Amount)]]} />
    <Card title="Expense by category"><BarsChart data={by} keys={[{ k: "Amount", name: "Amount" }]} height={240} /></Card>
  </>;
}
