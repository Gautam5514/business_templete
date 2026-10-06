"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, ArrowUpRight, Boxes, Clock, PackageX, Send, Sparkles, Truck, X } from "lucide-react";
import { Btn, Card, Delta, PageHeader, Pill, Progress, Segmented, cn } from "@/components/ui/ui";
import { Spark, TrendChart } from "@/components/ui/charts";
import { series, spark } from "@/data/misc";
import { useStore } from "@/lib/store";
import { custName } from "@/data/core";
import { fdt, lakh } from "@/lib/format";

type K = { label: string; value: string; delta?: number; invert?: boolean; hint: string; href: string; seed: number; up?: boolean; tone?: "accent" | "ok" | "bad" | "warn"; note?: string };
const KPIS: K[] = [
  { label: "Sales This Month", value: "₹1.84 Cr", delta: 12.8, hint: "vs last month", href: "/reports?r=sales", seed: 1, tone: "accent" },
  { label: "Collections", value: "₹1.42 Cr", delta: 8.4, hint: "vs last month", href: "/payments", seed: 2, tone: "ok" },
  { label: "Outstanding", value: "₹46.72 Lakh", delta: 8.7, invert: true, hint: "vs last month", href: "/receivables", seed: 3, up: true, tone: "warn" },
  { label: "Inventory Value", value: "₹2.18 Cr", delta: 2.1, hint: "vs last month", href: "/inventory", seed: 4, tone: "accent" },
  { label: "Open Orders", value: "63", delta: 5, hint: "orders vs last week", href: "/orders", seed: 5, tone: "accent" },
  { label: "In Transit", value: "₹28.4 Lakh", hint: "14 vehicles on road", href: "/shipments", seed: 6, tone: "accent" },
  { label: "Today's Dispatch", value: "₹12.8 Lakh", hint: "6 loads · 3 warehouses", href: "/dispatch", seed: 7, tone: "ok" },
  { label: "Overdue Payments", value: "₹14.7 Lakh", hint: "▲ ₹2.8L added this month", href: "/receivables", seed: 8, up: true, tone: "bad" },
];

function KpiCard({ k }: { k: K }) {
  return (
    <Link href={k.href} className="group flex flex-col rounded-[8px] border border-line bg-surface p-3.5 transition-colors hover:border-line-strong hover:bg-bg">
      <div className="flex items-center justify-between"><span className="label">{k.label}</span><ArrowUpRight size={13} className="text-faint opacity-0 transition-opacity group-hover:opacity-100" /></div>
      <div className="num mt-1.5 text-[24px] font-semibold leading-8 tracking-[-0.02em]">{k.value}</div>
      <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-mute">{k.delta !== undefined && <Delta v={k.delta} invert={k.invert} suffix={k.label === "Open Orders" ? "" : "%"} />}{k.hint.startsWith("▲") ? <span className="font-medium text-bad">{k.hint}</span> : <span>{k.hint}</span>}</div>
      <div className="mt-2.5 -mb-1"><Spark data={spark(k.seed, k.up ?? true)} tone={k.tone} /></div>
    </Link>
  );
}

function Gauge({ score }: { score: number }) {
  const r = 46, c = 2 * Math.PI * r, off = c * (1 - score / 100);
  return (
    <div className="relative h-[116px] w-[116px] shrink-0">
      <svg viewBox="0 0 110 110" className="-rotate-90"><circle cx="55" cy="55" r={r} fill="none" stroke="#efeeea" strokeWidth="9" /><circle cx="55" cy="55" r={r} fill="none" stroke="#157347" strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} /></svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="num text-[30px] font-semibold leading-none">{score}</span><span className="mt-0.5 text-[11px] text-mute">/ 100</span></div>
    </div>
  );
}

const HEALTH = [["Sales Growth", 88], ["Collections", 74], ["Inventory", 86], ["Receivables", 68], ["Delivery", 91]] as const;
const STAGES: { label: string; value: string; sub: string; href: string }[] = [
  { label: "New Orders", value: "₹18.4L", sub: "11 orders", href: "/orders?status=Pending Approval" },
  { label: "Approved", value: "₹14.2L", sub: "9 orders", href: "/orders?status=Approved" },
  { label: "Packing", value: "₹8.7L", sub: "7 orders", href: "/orders?status=Packing" },
  { label: "Ready To Dispatch", value: "₹6.4L", sub: "5 orders", href: "/orders?status=Ready" },
  { label: "In Transit", value: "₹28.4L", sub: "14 vehicles", href: "/orders?status=In Transit" },
  { label: "Delivered", value: "₹34.8L", sub: "last 7 days", href: "/orders?status=Delivered" },
  { label: "Payment Pending", value: "₹18.6L", sub: "38 invoices", href: "/receivables" },
];

export function Dashboard() {
  const { ownerMode, logs, dispatches, toast, user, role, setAiOpen } = useStore();
  const [range, setRange] = useState<"7D" | "30D" | "3M" | "6M" | "12M">("12M");
  const [hello, setHello] = useState("Good Morning");
  const [dismissed, setDismissed] = useState<string[]>([]);
  const data = useMemo(() => series(range), [range]);
  useEffect(() => { const h = new Date().getHours(); setHello(h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening"); }, []);
  const first = user.name.split(" ")[0];
  const todays = dispatches.filter((d) => d.departure?.startsWith("2026-10-06") || d.status === "Vehicle Assigned").slice(0, 5);

  const alerts = [
    { id: "a1", tone: "bad", icon: <AlertTriangle size={15} />, tag: "Payment Overdue", title: "Sharma Hardware", amt: "₹4,75,000", body: "overdue by 31 days", cta: { label: "View Customer", href: "/customers/sharma-hardware" }, sec: { label: "Send reminder", msg: "WhatsApp reminder sent to Sharma Hardware", sub: "Statement + INV-2874 attached" } },
    { id: "a2", tone: "warn", icon: <Clock size={15} />, tag: "Dispatch Delayed", title: "ORD-1048 · Agarwal Traders", amt: "₹3,84,500", body: "Delayed by 2 days due to stock shortage.", cta: { label: "View Order", href: "/orders/ORD-1048" }, sec: { label: "Notify customer", msg: "Delay notice sent to Agarwal Traders", sub: "New expected dispatch 08 Oct" } },
    { id: "a3", tone: "amber", icon: <PackageX size={15} />, tag: "Low Inventory", title: "Premium Kitchen Sink 24×18", amt: "184 units", body: "Dhanbad Warehouse · minimum 300 · estimated stock-out in 6 days", cta: { label: "View Product", href: "/products/ks-2418-p" }, sec: { label: "Create PO", msg: "Draft PO created: SteelCraft Sinks · 600 pcs", sub: "Review in Purchase" } },
    { id: "a4", tone: "bad", icon: <Truck size={15} />, tag: "Delivery Issue", title: "Shipment SHP-392", amt: "20 units", body: "reported damaged by customer (Jaiswal Enterprises).", cta: { label: "View Shipment", href: "/shipments/SHP-392" }, sec: { label: "Open return", msg: "Return RTN-0412 opened for inspection", sub: "Pickup being scheduled" } },
  ].filter((a) => !dismissed.includes(a.id));
  const dotCls = (t: string) => (t === "bad" ? "bg-bad" : t === "warn" ? "bg-warn" : "bg-[#d4a017]");

  return (
    <div className="space-y-5">
      <PageHeader
        title={`${hello}, ${first}`}
        sub="Here’s what needs your attention today."
        meta={<><Pill tone="neutral" dot={false}>Tue, 06 Oct 2026</Pill><Pill tone="ok"><span className="live-dot">Live</span></Pill>{ownerMode && <Pill tone="accent" dot={false}>Owner View</Pill>}</>}
        actions={<><Btn icon={<Sparkles size={14} />} onClick={() => setAiOpen(true)}>Ask Your Business</Btn><Btn variant="primary" href="/orders/new">New Sales Order</Btn></>}
      />

      <div className={cn("grid gap-3", ownerMode ? "grid-cols-2 lg:grid-cols-5" : "grid-cols-2 lg:grid-cols-4")}>
        {(ownerMode ? [KPIS[0], KPIS[1], KPIS[2], KPIS[3], KPIS[4]] : KPIS).map((k) => <KpiCard key={k.label} k={k} />)}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card title="Needs Your Attention" sub={`${alerts.length} items require a decision today`} action={<Link href="/logs" className="text-[12.5px] text-accent hover:underline">All alerts</Link>} pad={false}>
          {alerts.length === 0 ? <div className="p-8 text-center text-[13px] text-mute">You’re all caught up — nothing needs your attention right now.</div> : (
            <ul className="divide-y divide-line">
              {alerts.map((a) => (
                <li key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", dotCls(a.tone))} />
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-mute">{a.tag}</div>
                      <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2"><span className="text-[14.5px] font-semibold">{a.title}</span><span className="num text-[14.5px] font-semibold">{a.amt}</span></div>
                      <div className="text-[12.5px] text-mute">{a.body}</div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 pl-5 sm:pl-0">
                    <Btn size="sm" variant="secondary" icon={<Send size={12} />} onClick={() => toast(a.sec.msg, "ok", a.sec.sub)}>{a.sec.label}</Btn>
                    <Btn size="sm" variant="primary" href={a.cta.href}>{a.cta.label}</Btn>
                    <button className="rounded p-1 text-faint hover:bg-panel hover:text-ink" onClick={() => { setDismissed([...dismissed, a.id]); toast("Alert snoozed for 24 hours", "info"); }} aria-label="Snooze"><X size={14} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Business Health" sub="Composite of 5 operating signals">
          <div className="flex items-center gap-4">
            <Gauge score={82} />
            <div className="min-w-0 flex-1 space-y-2">
              {HEALTH.map(([l, v]) => (
                <div key={l}>
                  <div className="flex justify-between text-[12px]"><span className="text-mute">{l}</span><span className="num font-medium">{v}</span></div>
                  <Progress value={v} tone={v >= 85 ? "ok" : v >= 72 ? "accent" : "warn"} className="mt-1" />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-[6px] bg-warn-soft p-3 text-[12.5px] leading-snug text-warn"><b>Why it moved −2 pts:</b> Receivable health decreased because overdue invoices increased by ₹2.8L this month. Delivery (91) and Sales Growth (88) are holding the score up.</div>
        </Card>
      </div>

      {!ownerMode && (
        <Card title="Order Pipeline" sub="Every rupee in motion — click a stage to drill in" pad={false}>
          <div className="grid divide-y divide-line sm:grid-cols-4 sm:divide-x sm:divide-y-0 lg:grid-cols-7">
            {STAGES.map((s, i) => (
              <Link key={s.label} href={s.href} className="group relative p-4 hover:bg-bg">
                <div className="text-[12px] text-mute">{s.label}</div>
                <div className="num mt-1 text-[21px] font-semibold tracking-tight">{s.value}</div>
                <div className="text-[12px] text-faint">{s.sub}</div>
                <div className="mt-3 h-1 rounded-full bg-panel"><div className="h-full rounded-full bg-accent/80" style={{ width: [45, 35, 22, 16, 70, 85, 46][i] + "%" }} /></div>
                {i < STAGES.length - 1 && <ArrowRight size={13} className="absolute right-1 top-1/2 hidden -translate-y-1/2 text-line-strong lg:block" />}
              </Link>
            ))}
          </div>
        </Card>
      )}

      <Card title="Sales, Collections & Outstanding" sub="Money billed vs money received vs money still pending" action={<Segmented size="sm" options={["7D", "30D", "3M", "6M", "12M"]} value={range} onChange={setRange} />}>
        <div className="mb-2 flex flex-wrap gap-4 text-[12px] text-mute">
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-accent" />Sales</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-ok" />Collections</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-bad" />Outstanding</span>
        </div>
        <TrendChart data={data} height={290} />
      </Card>

      <div className={cn("grid gap-4", ownerMode ? "lg:grid-cols-2" : "xl:grid-cols-[1fr_1fr_1fr]")}>
        <Card title="Team Performance" sub="Sales this month" action={<Link href="/reports?r=sales-team" className="text-[12.5px] text-accent hover:underline">Leaderboard</Link>}>
          {[["Amit Kumar", "₹31.4L", 112], ["Rohit Singh", "₹28.7L", 104], ["Vikash Sharma", "₹24.2L", 91]].map(([n, v, p], i) => (
            <div key={n as string} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
              <span className="num flex h-5 w-5 items-center justify-center rounded bg-panel text-[11px] font-semibold text-mute">{i + 1}</span>
              <div className="min-w-0 flex-1"><div className="flex justify-between text-[13px]"><span className="font-medium">{n}</span><span className="num font-semibold">{v}</span></div><Progress className="mt-1" value={p as number} max={120} tone={(p as number) >= 100 ? "ok" : "warn"} /><div className="mt-0.5 text-[11.5px] text-faint">{p}% of target</div></div>
            </div>
          ))}
        </Card>
        {!ownerMode && (
          <Card title="Today's Dispatches" sub="Loads leaving or ready to leave" action={<Link href="/dispatch" className="text-[12.5px] text-accent hover:underline">All dispatches</Link>} pad={false}>
            <ul className="divide-y divide-line">
              {todays.map((d) => (
                <li key={d.id}><Link href={`/dispatch/${d.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-bg"><div className="min-w-0"><div className="truncate text-[13px] font-medium">{custName(d.custId)}</div><div className="text-[12px] text-mute">{d.id} · {d.vehicle} · {d.qty.toLocaleString("en-IN")} units</div></div><div className="text-right"><div className="num text-[13px] font-semibold">{lakh(d.value)}</div><Pill>{d.status}</Pill></div></Link></li>
              ))}
            </ul>
          </Card>
        )}
        <Card title="Live Activity" sub="Everything is logged" action={<Link href="/logs" className="text-[12.5px] text-accent hover:underline">Activity log</Link>} pad={false}>
          <ul className="divide-y divide-line">
            {logs.slice(0, 6).map((l) => (
              <li key={l.id} className="px-4 py-2.5"><div className="text-[12.5px]"><b className="font-medium">{l.user}</b> <span className="text-mute">{l.action}</span></div><div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-faint"><span className="num">{fdt(l.ts)}</span><span>·</span><span>{l.module}</span></div></li>
            ))}
          </ul>
        </Card>
      </div>

      {ownerMode && (
        <Card title="Ask Your Business" sub="Instead of asking different employees, ask the system">
          <div className="flex flex-wrap gap-2">{["How much money is overdue?", "Which customers have not paid for 30+ days?", "Which products may go out of stock?", "Show delayed deliveries."].map((s) => <button key={s} onClick={() => setAiOpen(true, s)} className="rounded-full border border-line-strong px-3 py-1.5 text-[12.5px] text-mute hover:border-accent hover:text-accent">{s}</button>)}</div>
        </Card>
      )}
      <Boxes className="hidden" /><span className="hidden">{role}</span>
    </div>
  );
}
