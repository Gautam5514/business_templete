"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { useStore } from "@/lib/store";
import { Btn, Card, Empty, KV, PageHeader, Pill, Progress, Tabs, cn } from "@/components/ui/ui";
import { DataTable, type Col } from "@/components/ui/table";
import { CustLink, DspLink, OrderLink, ProdLink } from "@/components/ui/links";
import { EMPLOYEES, WAREHOUSES, prodBySku } from "@/data/core";
import { STOCK, available, stockStatus } from "@/data/ops";
import { POS, PO_STAGES } from "@/data/misc";
import { BarsChart } from "@/components/ui/charts";
import { fdate, inr, num } from "@/lib/format";
import type { StockRow, WhId } from "@/types";

export const WH_FACTS: Record<WhId, { value: string; products: number; avail: number; reserved: number; today: string; low: number; area: string; accuracy: string; pack: string; errors: number; util: number }> = {
  RNC: { value: "₹1.12 Cr", products: 482, avail: 24800, reserved: 6420, today: "₹7.2L", low: 16, area: "42,000 sq ft", accuracy: "99.1%", pack: "38 min", errors: 3, util: 78 },
  DHN: { value: "₹58.4 L", products: 394, avail: 17400, reserved: 4980, today: "₹3.9L", low: 11, area: "26,500 sq ft", accuracy: "98.6%", pack: "44 min", errors: 3, util: 71 },
  PAT: { value: "₹47.6 L", products: 356, avail: 14900, reserved: 3760, today: "₹1.7L", low: 9, area: "22,000 sq ft", accuracy: "98.9%", pack: "41 min", errors: 1, util: 64 },
};

export function Warehouses() {
  const { warehouse } = useStore();
  const list = WAREHOUSES.filter((w) => warehouse === "ALL" || w.id === warehouse);
  return (
    <div className="space-y-4">
      <PageHeader title="Warehouses" sub="3 locations · ₹2.18 Cr of stock · ₹12.8L dispatched today" actions={<Btn variant="primary" href="/inventory">Open inventory</Btn>} />
      <div className="grid gap-4 lg:grid-cols-3">
        {list.map((w) => {
          const f = WH_FACTS[w.id];
          return (
            <Link key={w.id} href={`/warehouses/${w.id}`} className="group rounded-[8px] border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-bg">
              <div className="flex items-start justify-between"><div><div className="text-[15px] font-semibold">{w.name}</div><div className="mt-0.5 flex items-center gap-1 text-[12px] text-mute"><MapPin size={12} />{w.city} · {f.area} · Manager {w.manager}</div></div><ArrowRight size={15} className="text-faint group-hover:text-accent" /></div>
              <div className="num mt-4 text-[26px] font-semibold tracking-tight">{f.value}</div><div className="text-[12px] text-mute">inventory value</div>
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-3.5 text-[13px]">
                <KV label="Products"><span className="num font-semibold">{f.products}</span></KV>
                <KV label="Available units"><span className="num font-semibold">{num(f.avail)}</span></KV>
                <KV label="Reserved"><span className="num font-semibold">{num(f.reserved)}</span></KV>
                <KV label="Today's dispatch"><span className="num font-semibold">{f.today}</span></KV>
                <KV label="Low stock"><Pill tone="warn">{f.low} products</Pill></KV>
                <KV label="Space used"><span className="num font-semibold">{f.util}%</span></KV>
              </div>
              <Progress className="mt-3" value={f.util} tone={f.util > 85 ? "bad" : "accent"} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const TABS = ["Stock", "Pending Packing", "Dispatch Queue", "Transfers", "Incoming Purchases", "Employees", "Performance"] as const;
const TRANSFERS = [
  { id: "TRF-210", item: "Premium Kitchen Sink 24×18", qty: 200, from: "RNC", to: "DHN", status: "In Transit", date: "2026-10-05" },
  { id: "TRF-209", item: "Wall Mounted WC", qty: 60, from: "RNC", to: "PAT", status: "Received", date: "2026-10-02" },
  { id: "TRF-208", item: "CPVC Pipe 1 Inch", qty: 800, from: "PAT", to: "RNC", status: "Received", date: "2026-09-29" },
  { id: "TRF-207", item: "Premium LED Panel 18W", qty: 500, from: "RNC", to: "DHN", status: "Packing", date: "2026-10-06" },
];

export function WarehouseDetail() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  const router = useRouter();
  const w = WAREHOUSES.find((x) => x.id === id);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Stock");
  if (!w) return <Empty title="Warehouse not found" action={<Btn href="/warehouses">Back</Btn>} />;
  const f = WH_FACTS[w.id];
  const stock = STOCK.filter((r) => r.wh === w.id);
  const pack = s.orders.filter((o) => o.wh === w.id && ["Stock Allocated", "Packing", "Approved"].includes(o.status));
  const queue = s.dispatches.filter((d) => d.wh === w.id && ["Ready", "Vehicle Assigned", "Packing", "Pending Packing"].includes(d.status));
  const incoming = POS.filter((p) => p.wh === w.city && p.stage < 7);
  const staff = EMPLOYEES.filter((e) => e.location === w.city && ["Warehouse", "Logistics"].includes(e.dept));
  const tr = TRANSFERS.filter((t) => t.from === w.id || t.to === w.id);
  const cols: Col<StockRow>[] = [
    { key: "name", header: "Product", get: (r) => prodBySku(r.sku)!.name, render: (r) => <ProdLink id={prodBySku(r.sku)!.id}>{prodBySku(r.sku)!.name}</ProdLink> },
    { key: "physical", header: "Physical", align: "right", render: (r) => num(r.physical) },
    { key: "avail", header: "Available", align: "right", get: (r) => available(r), render: (r) => <b>{num(available(r))}</b> },
    { key: "reserved", header: "Reserved", align: "right", render: (r) => num(r.reserved) },
    { key: "reorder", header: "Min", align: "right", render: (r) => num(r.reorder) },
    { key: "st", header: "Status", get: (r) => stockStatus(r), render: (r) => <Pill>{stockStatus(r)}</Pill> },
  ];
  const weekly = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => ({ label: d, Units: Math.round(f.avail * (0.07 + ((i * 3 + w.id.length) % 5) * 0.012)) }));
  return (
    <div className="space-y-4">
      <PageHeader crumbs={[{ label: "Warehouses", href: "/warehouses" }, { label: w.name }]} title={w.name} sub={`${w.city} · ${f.area} · Manager ${w.manager}`} actions={<><Btn onClick={() => s.openQuick("transfer")}>Stock transfer</Btn><Btn variant="primary" onClick={() => s.openQuick("po")}>Create PO</Btn></>} />
      <div className="grid grid-cols-2 divide-x divide-y divide-line overflow-hidden rounded-[8px] border border-line bg-surface sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
        {[["Inventory value", f.value], ["Products", String(f.products)], ["Available units", num(f.avail)], ["Reserved", num(f.reserved)], ["Today's dispatch", f.today], ["Low stock", `${f.low} products`]].map(([l, v]) => <div key={l} className="p-3.5"><div className="label !text-[10.5px]">{l}</div><div className="num mt-1 text-[19px] font-semibold tracking-tight">{v}</div></div>)}
      </div>
      <Tabs tabs={TABS.map((t) => ({ id: t, label: t, count: t === "Pending Packing" ? pack.length : t === "Dispatch Queue" ? queue.length : t === "Incoming Purchases" ? incoming.length : t === "Employees" ? staff.length : undefined }))} value={tab} onChange={setTab} />
      {tab === "Stock" && <DataTable rows={stock} cols={cols} rowKey={(r) => r.sku} pageSize={10} exportName={`${w.id}-stock`} defaultSort={{ key: "avail", dir: "asc" }} filters={[{ key: "st", label: "Status", options: ["Healthy", "Low Stock", "Out of Stock", "Overstock"], match: (r, v) => stockStatus(r) === v }]} onRowClick={(r) => router.push(`/products/${prodBySku(r.sku)!.id}`)} />}
      {tab === "Pending Packing" && (
        <Card pad={false}>{pack.length ? <ul className="divide-y divide-line text-[13px]">{pack.map((o) => <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-2.5"><span><OrderLink id={o.id} /> · <CustLink id={o.custId} /><div className="num text-[12px] text-mute">{num(o.qty)} units · {inr(o.value)}</div></span><span className="flex items-center gap-2"><Pill>{o.status}</Pill><Btn size="xs" variant="primary" onClick={() => s.advanceOrder(o.id)}>{o.status === "Stock Allocated" ? "Start packing" : o.status === "Packing" ? "Mark ready" : "Allocate"}</Btn></span></li>)}</ul> : <Empty title="Nothing waiting to be packed" body="All allocated orders have been packed." />}</Card>
      )}
      {tab === "Dispatch Queue" && (
        <Card pad={false}>{queue.length ? <ul className="divide-y divide-line text-[13px]">{queue.map((d) => <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-2.5"><span><DspLink id={d.id} /> · <CustLink id={d.custId} /><div className="num text-[12px] text-mute">{d.packages} packages · {num(d.qty)} units · {d.vehicle}</div></span><Pill>{d.status}</Pill></li>)}</ul> : <Empty title="Dispatch queue is clear" />}</Card>
      )}
      {tab === "Transfers" && (
        <Card pad={false}><ul className="divide-y divide-line text-[13px]">{tr.map((t) => <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-2.5"><span><b className="num">{t.id}</b> · {t.item} × {num(t.qty)}<div className="text-[12px] text-mute">{WAREHOUSES.find((x) => x.id === t.from)?.city} → {WAREHOUSES.find((x) => x.id === t.to)?.city} · {fdate(t.date)}</div></span><Pill>{t.status}</Pill></li>)}</ul></Card>
      )}
      {tab === "Incoming Purchases" && (
        <Card pad={false}>{incoming.length ? <ul className="divide-y divide-line text-[13px]">{incoming.map((p) => <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5"><span><b className="num">{p.id}</b> · {p.supplier}<div className="text-[12px] text-mute">{p.items}</div></span><span className="text-right"><div className="num font-medium">{inr(p.value)}</div><Pill tone="info" dot={false}>{PO_STAGES[p.stage]}</Pill></span></li>)}</ul> : <Empty title="No incoming purchases" />}</Card>
      )}
      {tab === "Employees" && (
        <Card pad={false}><ul className="divide-y divide-line text-[13px]">{staff.map((e) => <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-2.5"><span className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-panel text-[11px] font-semibold text-mute">{e.name.split(" ").map((x) => x[0]).join("")}</span><span><span className="block font-medium">{e.name}</span><span className="text-[12px] text-mute">{e.role}</span></span></span><span className="text-right text-[12px] text-mute">{e.stats.slice(0, 2).map((st) => <div key={st.label}>{st.label}: <b className="text-ink">{st.value}</b></div>)}</span></li>)}</ul></Card>
      )}
      {tab === "Performance" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Card title="Units packed this week"><BarsChart data={weekly} keys={[{ k: "Units", name: "Units packed" }]} money={false} height={240} /></Card>
          <Card title="Service levels"><div className="space-y-4"><KV label="Stock accuracy"><span className="num text-[20px] font-semibold">{f.accuracy}</span></KV><KV label="Avg. pick-pack time"><span className="num text-[20px] font-semibold">{f.pack}</span></KV><KV label="Dispatch errors (30d)"><span className={cn("num text-[20px] font-semibold", f.errors > 2 && "text-warn")}>{f.errors}</span></KV><KV label="On-time dispatch"><span className="num text-[20px] font-semibold">94%</span></KV></div></Card>
        </div>
      )}
    </div>
  );
}
