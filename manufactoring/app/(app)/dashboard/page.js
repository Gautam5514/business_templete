"use client";
import { Fragment } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { Btn, Card, Delta, Insight, Kpi, PageHeader, Pill, Progress, cn } from "@/components/ui/ui";
import { BarsChart, C, HBar, LineChartX, Spark } from "@/components/ui/charts";
import { useStore } from "@/lib/store";
import { ALERTS, DOWNTIME_CATS, HEALTH, KPI, MONTH_TREND, PIPELINE, PLANT_PERF, PROD_TREND, REJ_TREND, UTIL_TREND } from "@/data/ops";
import { FINANCE } from "@/data/finance";
import { MRP } from "@/data/orders";
import { MACHINES } from "@/data/masters";
import { SALES_ORDERS } from "@/data/orders";
import { lakh, num, fdate } from "@/lib/format";
import { SUGGESTED } from "@/lib/ai";

const sevStyle = { critical: "border-bad/30 bg-bad-soft/40", warn: "border-warn/30 bg-warn-soft/50", info: "border-line bg-surface" };

function Health() {
  const s = HEALTH.score;
  const R = 44, Cc = 2 * Math.PI * R;
  return (
    <Card title="Factory Health" sub="Composite of 6 operating measures" action={<Pill tone="ok">Healthy</Pill>}>
      <div className="flex flex-wrap items-center gap-6">
        <div className="relative h-[116px] w-[116px] shrink-0">
          <svg viewBox="0 0 100 100" className="-rotate-90"><circle cx="50" cy="50" r={R} fill="none" stroke="#f1f1ee" strokeWidth="9" /><circle cx="50" cy="50" r={R} fill="none" stroke={C.ok} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(s / 100) * Cc} ${Cc}`} /></svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center"><div className="num text-[30px] font-semibold leading-none">{s}</div><div className="text-[11px] text-mute">out of 100</div></div>
        </div>
        <div className="grid min-w-[240px] flex-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
          {HEALTH.parts.map(([k, v]) => (
            <div key={k}><div className="flex items-baseline justify-between text-[12.5px]"><span>{k}</span><span className={cn("num font-semibold", v < 80 && "text-warn")}>{v}</span></div><Progress value={v} tone={v >= 85 ? "ok" : v >= 78 ? "accent" : "warn"} className="mt-1" /></div>
          ))}
        </div>
      </div>
      <div className="mt-4"><Insight>Quality score dropped because rejection increased from 1.9% to 2.8% this week.</Insight></div>
    </Card>
  );
}

function Attention() {
  return (
    <Card title="Needs Your Attention" sub="4 items across production, material, quality and machines" pad={false}>
      <div className="grid gap-2.5 p-3 sm:grid-cols-2">
        {ALERTS.map((a) => (
          <Link key={a.id} href={a.href} className={cn("group block rounded-[8px] border p-3 transition-colors hover:border-line-strong", sevStyle[a.sev])}>
            <div className="flex items-center justify-between"><span className="text-[11px] font-semibold uppercase tracking-[0.04em]">{a.icon} {a.kind}</span><ChevronRight size={14} className="text-faint group-hover:text-ink" /></div>
            <div className="mt-1 text-[13.5px] font-semibold">{a.title}</div>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[12.5px]">
              {a.rows.map(([k, v]) => <Fragment key={k}><dt className="text-mute">{k}</dt><dd className="num font-medium">{v}</dd></Fragment>)}
            </dl>
          </Link>
        ))}
      </div>
    </Card>
  );
}

function Pipeline() {
  const max = PIPELINE[0][1];
  return (
    <Card title="Production Overview" sub="Units at each stage — click a stage for records">
      <div className="grid gap-2 sm:grid-cols-4 xl:grid-cols-8">
        {PIPELINE.map(([k, v, href], i) => (
          <Link key={k} href={href} className="group relative rounded-[8px] border border-line bg-bg p-3 transition-colors hover:border-accent hover:bg-surface">
            <div className="label !text-[10px]">{i + 1}. {k}</div>
            <div className="num mt-1 text-[22px] font-semibold tracking-[-0.02em]">{num(v)}</div>
            <div className="mt-2 h-1 rounded-full bg-line"><div className="h-full rounded-full bg-accent" style={{ width: `${(v / max) * 100}%` }} /></div>
            {i < PIPELINE.length - 1 && <ArrowRight size={13} className="absolute -right-[10px] top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-surface text-faint xl:block" />}
          </Link>
        ))}
      </div>
    </Card>
  );
}

function Plants() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {PLANT_PERF.map((p) => {
        const ach = Math.round((p.today / p.target) * 100);
        return (
          <Card key={p.plant} title={p.plant} sub={p.plant.startsWith("Ranchi") ? "Main production facility · Line 1, Line 2" : "Secondary production & fabrication · Line 3, Line 4"} action={<Pill tone={ach >= 90 ? "ok" : "warn"}>{ach}% of target</Pill>}>
            <div className="flex items-baseline gap-2"><span className="num text-[28px] font-semibold tracking-[-0.02em]">{num(p.today)}</span><span className="text-[13px] text-mute">of {num(p.target)} units today</span></div>
            <Progress value={p.today} max={p.target} tone={ach >= 90 ? "ok" : "warn"} className="mt-2" />
            <div className="mt-4 grid grid-cols-4 gap-3">
              {[["Efficiency", `${p.eff}%`], ["Utilization", `${p.util}%`], ["Rejection", `${p.rej}%`, p.rej > 3], ["Downtime", p.down]].map(([k, v, bad]) => <div key={k}><div className="label !text-[10px]">{k}</div><div className={cn("num text-[15px] font-semibold", bad && "text-bad")}>{v}</div></div>)}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function MaterialRisk() {
  const short = MRP.filter((m) => m.shortage > 0);
  return (
    <Card title="Material Risk" sub="Against the next 7 days of planned production" action={<Btn size="xs" href="/raw-materials?tab=mrp">MRP <ArrowRight size={12} /></Btn>}>
      <div className="space-y-3.5">
        {short.map((m) => <HBar key={m.code} label={m.name} right={`short ${num(m.shortage)} ${m.unit}`} pct={Math.min(100, (m.shortage / m.required) * 100)} tone="bad" sub={`Required ${num(m.required)} · available ${num(m.avail)} · incoming ${num(m.incoming)}`} />)}
        <div className="rounded-[6px] bg-warn-soft px-3 py-2 text-[12.5px] text-warn">3 work orders affected · PR-1838 for 9,700 kg is awaiting approval</div>
      </div>
    </Card>
  );
}

function MachineHealth() {
  const g = (s) => MACHINES.filter((m) => m.status === s).length;
  return (
    <Card title="Machine Health" sub="16 machines across both plants" action={<Btn size="xs" href="/machines">Machines <ArrowRight size={12} /></Btn>}>
      <div className="grid grid-cols-4 gap-2">
        {[["Running", g("Running"), "text-ok"], ["Idle / Paused", g("Idle") + g("Paused"), "text-mute"], ["Maintenance", g("Maintenance"), "text-warn"], ["Due today", 1, "text-bad"]].map(([k, v, c]) => <div key={k} className="rounded-[6px] bg-bg p-2.5"><div className={cn("num text-[22px] font-semibold", c)}>{v}</div><div className="text-[11.5px] text-mute">{k}</div></div>)}
      </div>
      <div className="mt-3"><LineChartX data={UTIL_TREND} keys={[{ k: "util", name: "Utilization %" }]} height={140} domain={[60, 100]} fmt={(v) => `${v}%`} /></div>
    </Card>
  );
}

function Downtime() {
  const rows = DOWNTIME_CATS.slice(0, 6);
  return (
    <Card title="Downtime today" sub="3 hr 42 min · est. lost output 690 units" action={<Btn size="xs" href="/maintenance?tab=downtime">Details <ArrowRight size={12} /></Btn>}>
      <div className="space-y-3">{rows.map((d) => <HBar key={d.cat} label={d.cat} right={`${d.min} min`} pct={(d.min / rows[0].min) * 100} tone={d.cat === "Machine Breakdown" ? "bad" : "accent"} />)}</div>
    </Card>
  );
}

function Orders() {
  const open = SALES_ORDERS.filter((o) => o.prodReq > 0 && !["Delivered", "Dispatched"].includes(o.status)).slice(0, 6);
  return (
    <Card title="Orders awaiting production" sub={`${lakh(KPI.awaiting)} of customer demand needs manufacturing`} pad={false} action={<Btn size="xs" href="/orders">All orders <ArrowRight size={12} /></Btn>}>
      <div className="divide-y divide-line">
        {open.map((o) => (
          <Link key={o.id} href="/orders" className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-bg">
            <div className="min-w-0"><div className="truncate text-[13px] font-medium">{o.id} · {o.customer}</div><div className="truncate text-[12px] text-mute">{o.product} · make {num(o.prodReq)} of {num(o.qty)} · dispatch {fdate(o.dispatch)}</div></div>
            <Pill>{o.priority}</Pill>
          </Link>
        ))}
      </div>
    </Card>
  );
}

function Money() {
  return (
    <Card title="Financial overview" sub="Month to date" action={<Btn size="xs" href="/finance">Finance <ArrowRight size={12} /></Btn>}>
      <div className="grid grid-cols-2 gap-3">
        {[["Sales", lakh(FINANCE.sales)], ["Collections", lakh(FINANCE.collections)], ["Gross margin", `${FINANCE.margin}%`], ["Outstanding", lakh(FINANCE.outstanding)], ["Supplier payable", lakh(FINANCE.payable)], ["Production cost", lakh(FINANCE.production)]].map(([k, v]) => <div key={k}><div className="label !text-[10px]">{k}</div><div className="num text-[17px] font-semibold">{v}</div></div>)}
      </div>
    </Card>
  );
}

function AskBox() {
  const { setAiOpen } = useStore();
  return (
    <Card title="Ask Your Factory" action={<Sparkles size={15} className="text-accent" />}>
      <button onClick={() => setAiOpen(true)} className="flex h-10 w-full items-center rounded-[8px] border border-line-strong bg-bg px-3 text-left text-[13px] text-faint hover:border-faint">Ask anything about production, material, machines or orders...</button>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {[SUGGESTED[0], SUGGESTED[1], SUGGESTED[10], SUGGESTED[3]].map((q) => <button key={q} onClick={() => setAiOpen(true, q)} className="rounded-full border border-line bg-surface px-2.5 py-1 text-[12px] text-mute hover:border-accent hover:text-accent-ink">{q}</button>)}
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { ownerMode } = useStore();
  const ach = Math.round((KPI.prodToday / KPI.targetToday) * 100);
  const sparkP = PROD_TREND.map((d) => d.actual / 100);
  return (
    <div>
      <PageHeader title="Good Morning, Rakesh" sub="Here’s how your plants are performing today." actions={<span className="num rounded-[6px] bg-panel px-2.5 py-1.5 text-[12px] text-mute">Tue, 06 Oct 2026 · Morning shift</span>} />

      <div className={cn("grid gap-3", ownerMode ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 md:grid-cols-3 xl:grid-cols-5")}>
        <Kpi label="Production Today" value={`${num(KPI.prodToday)} units`} sub={`Target ${num(KPI.targetToday)} · Achievement ${ach}%`} href="/lines" hint={<div className="mt-2"><Progress value={KPI.prodToday} max={KPI.targetToday} tone="ok" /></div>} />
        <Kpi label="Production This Month" value={num(KPI.prodMonth)} delta={KPI.monthDelta} sub="vs last month" hint={<div className="mt-1.5"><Spark data={sparkP} tone="ok" /></div>} href="/reports" />
        <Kpi label="Raw Material Value" value={lakh(KPI.rmValue)} sub="420 SKUs · 3 low, 2 critical" href="/inventory" />
        <Kpi label="Finished Goods Value" value={lakh(KPI.fgValue)} sub="Reserved against 11 orders" href="/finished-goods" />
        <Kpi label="Work In Progress" value={lakh(KPI.wipValue)} sub="7 work orders in process" href="/wip" />
        {!ownerMode && <Kpi label="Pending Production Orders" value={KPI.pending} sub="9 active · 28 planned" href="/production" />}
        <Kpi label="Rejection Rate" value={`${KPI.reject}%`} tone="bad" sub="Target < 2% · was 1.9% last week" href="/quality" />
        <Kpi label="Machine Utilization" value={`${KPI.util}%`} sub="16 machines · 2 plants" href="/machines" />
        {!ownerMode && <Kpi label="Production Downtime Today" value={KPI.downtime} tone="warn" sub="Breakdown 1 h 52 m · material 42 m" href="/maintenance?tab=downtime" />}
        <Kpi label="Orders Awaiting Production" value={lakh(KPI.awaiting)} sub="6 customer orders" href="/orders" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.15fr]">
        <Health />
        <Attention />
      </div>

      {!ownerMode && <div className="mt-4"><Pipeline /></div>}
      <div className="mt-4"><Plants /></div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Production vs Target" sub="Units per day, last 15 days"><BarsChart data={PROD_TREND} keys={[{ k: "actual", name: "Actual" }, { k: "target", name: "Target", type: "line", dash: "4 3" }]} height={230} /></Card>
        <Card title="Rejection Trend" sub="% of inspected units — target below 2%"><LineChartX data={REJ_TREND} keys={[{ k: "rate", name: "Rejection %", color: C.bad }]} height={230} target={2} fmt={(v) => `${v}%`} domain={[1, 3.5]} /></Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <MaterialRisk />
        <MachineHealth />
        <Downtime />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Orders />
        <Money />
        <AskBox />
      </div>
      {!ownerMode && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card title="Monthly production" sub="Units, Apr – Oct 2026 (October is month-to-date run-rate)"><BarsChart data={MONTH_TREND} keys={[{ k: "v", name: "Units" }]} height={200} /></Card>
          <Card title="At a glance"><div className="flex items-start gap-2 text-[13px] text-mute"><AlertTriangle size={15} className="mt-0.5 shrink-0 text-warn" /><p>Right now you know how much material you bought and how much you sold. FactoryFlow shows everything between — <Link href="/flow" className="font-medium text-accent hover:underline">see the Factory Flow</Link> or trace any order from customer demand to payment.</p></div></Card>
        </div>
      )}
    </div>
  );
}
