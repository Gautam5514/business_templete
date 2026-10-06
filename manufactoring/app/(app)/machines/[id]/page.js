"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Hammer } from "lucide-react";
import { Btn, Card, Insight, Kpi, KV, PageHeader, Pill, Progress, Tabs } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { BarsChart, C } from "@/components/ui/charts";
import { useStore } from "@/lib/store";
import { useTab } from "@/lib/useTab";
import { machine } from "@/data/masters";
import { MAINT } from "@/data/ops";
import { fdt, hm, inr, num } from "@/lib/format";
import { WoLink } from "@/components/ui/links";

const TABS = ["overview", "production", "maintenance", "downtime", "breakdowns", "documents", "cost", "activity"];
const L = { overview: "Overview", production: "Production History", maintenance: "Maintenance", downtime: "Downtime", breakdowns: "Breakdowns", documents: "Documents", cost: "Cost", activity: "Activity" };

export default function MachinePage() {
  const { id } = useParams();
  const m = machine(id);
  const s = useStore();
  const [tab, setTab] = useTab(TABS, "overview");
  if (!m) return <Card><div className="p-6 text-center text-[13px] text-mute">Machine {id} not found. <Link href="/machines" className="text-accent">Back</Link></div></Card>;
  const bds = s.breakdowns.filter((b) => b.machine === m.id);
  const mt = MAINT.filter((x) => x.machine === m.id);
  const hist = ["06 Oct", "05 Oct", "04 Oct", "03 Oct", "02 Oct", "01 Oct", "30 Sep"].map((d, i) => ({ label: d, out: Math.round(m.out * [1, 1.08, 1.02, 0.94, 1.1, 0.88, 1.04][i]), eff: Math.round(Math.min(97, m.eff * [1, 1.03, 1.01, 0.97, 1.04, 0.94, 1.02][i])), wo: m.wo, down: Math.round(m.downMin * [1, 0.5, 0.7, 1.2, 0.4, 0.9, 0.6][i]) }));
  const due = m.sinceService >= 480;
  const dts = [["08:50 – 10:42", "Machine Breakdown", 112, "BD-0412"], ["10:50 – 11:10", "Tool Change", 20, "—"]];
  return (
    <div>
      <PageHeader crumbs={[{ label: "Machines", href: "/machines" }, { label: m.id }]} title={<span className="flex flex-wrap items-center gap-3">{m.name}<Pill>{m.status}</Pill></span>} sub={`${m.type} · ${m.plant} · ${m.line}`} actions={<Btn icon={<Hammer size={14} />} variant="secondary" onClick={() => s.openQuick("bd")}>Report breakdown</Btn>} />
      {due && <div className="mb-4"><Insight>Runtime since last service is <b>{m.sinceService} h</b> (limit 480 h) — preventive maintenance MT-901 is due <b>today</b>. Calendar service remains booked for {m.nextM}.</Insight></div>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <Kpi label="Status" value={m.status} /><Kpi label="Work order" value={m.wo} /><Kpi label="Runtime today" value={hm(m.runMin)} /><Kpi label="Units today" value={num(m.out)} />
        <Kpi label="Efficiency" value={`${m.eff}%`} tone={m.eff < 80 ? "warn" : undefined} /><Kpi label="Downtime" value={`${m.downMin} min`} tone={m.downMin > 100 ? "bad" : undefined} /><Kpi label="Last service" value={m.lastM} /><Kpi label="Next service" value={m.nextM} tone={due ? "warn" : undefined} />
      </div>
      <div className="mt-4"><Tabs value={tab} onChange={setTab} tabs={TABS.map((t) => ({ id: t, label: L[t] }))} /></div>
      {tab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card title="Details" className="lg:col-span-2"><div className="grid grid-cols-2 gap-x-6 gap-y-3.5 sm:grid-cols-3"><KV label="Current work order">{m.wo === "—" ? "—" : <WoLink id={m.wo} />}</KV><KV label="Operator">{m.operator}</KV><KV label="Total runtime"><span className="num">{num(m.totalHrs)} hours</span></KV><KV label="Since last service"><span className="num">{m.sinceService} h</span></KV><KV label="Plant / line">{m.plant} · {m.line}</KV><KV label="Asset type">{m.type}</KV></div>
            <div className="mt-5"><div className="label mb-1.5">Service interval used</div><Progress value={m.sinceService} max={480} tone={m.sinceService >= 480 ? "bad" : m.sinceService > 380 ? "warn" : "ok"} /><div className="mt-1 text-[12px] text-mute">{m.sinceService} of 480 h</div></div></Card>
          <Card title="Output — last 7 days"><BarsChart data={[...hist].reverse()} keys={[{ k: "out", name: "Units" }]} height={190} /></Card>
        </div>
      )}
      {tab === "production" && <DataTable rows={hist.map((h, i) => ({ ...h, k: i }))} rowKey={(r) => r.k} pageSize={10} exportName={`${m.id}-production`} cols={[{ key: "label", header: "Date" }, { key: "wo", header: "Work order", render: (r) => <WoLink id={r.wo} /> }, { key: "out", header: "Units", align: "right", render: (r) => num(r.out) }, { key: "eff", header: "Efficiency", align: "right", render: (r) => `${r.eff}%` }, { key: "down", header: "Downtime", align: "right", render: (r) => `${r.down} min` }]} />}
      {tab === "maintenance" && <DataTable rows={mt.length ? mt : []} rowKey={(r) => r.id} pageSize={10} exportName={`${m.id}-maintenance`} empty={{ title: "No maintenance tasks", body: "Nothing scheduled for this machine." }} cols={[{ key: "id", header: "Task" }, { key: "task", header: "Description" }, { key: "type", header: "Type", render: (r) => <Pill tone="neutral">{r.type}</Pill> }, { key: "due", header: "Due", render: (r) => fdt(r.due + "T08:00:00").split(",")[0] }, { key: "tech", header: "Technician", muted: true }, { key: "down", header: "Est. downtime", align: "right", render: (r) => `${r.down} min` }, { key: "status", header: "Status", render: (r) => <Pill>{r.status}</Pill> }]} />}
      {tab === "downtime" && <DataTable rows={dts.map((d, i) => ({ k: i, t: d[0], c: d[1], min: d[2], r: d[3] }))} rowKey={(r) => r.k} pageSize={10} cols={[{ key: "t", header: "Time" }, { key: "c", header: "Category", render: (r) => <Pill tone={r.c === "Machine Breakdown" ? "bad" : "warn"}>{r.c}</Pill> }, { key: "min", header: "Minutes", align: "right" }, { key: "r", header: "Ticket" }]} />}
      {tab === "breakdowns" && <DataTable rows={bds} rowKey={(b) => b.id} pageSize={10} empty={{ title: "No breakdowns", body: "This machine has no breakdown tickets this month." }} cols={[{ key: "id", header: "Ticket" }, { key: "reported", header: "Reported", render: (b) => fdt(b.reported) }, { key: "issue", header: "Issue", render: (b) => <span className="whitespace-normal">{b.issue}</span> }, { key: "severity", header: "Severity", render: (b) => <Pill>{b.severity === "Critical" ? "Critical" : b.severity}</Pill> }, { key: "down", header: "Downtime", align: "right", render: (b) => `${b.down} min` }, { key: "status", header: "Status", render: (b) => <Pill>{b.status}</Pill> }]} />}
      {tab === "documents" && <Card pad={false}><ul className="divide-y divide-line text-[13px]">{[`${m.name} — operating manual.pdf`, "Hydraulic circuit diagram.pdf", "Preventive maintenance checklist.pdf", "Warranty & AMC certificate.pdf", "Safety inspection 2026.pdf"].map((d) => <li key={d} className="flex justify-between px-4 py-3"><span className="font-medium">{d}</span><span className="text-mute">PDF</span></li>)}</ul></Card>}
      {tab === "cost" && <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Kpi label="Spares (YTD)" value={inr(m.id === "HP-05" ? 168000 : 62000)} /><Kpi label="Labour" value={inr(24000)} /><Kpi label="External service" value={inr(m.id === "HP-03" ? 48000 : 0)} /><Kpi label="Downtime cost (MTD)" value={inr(m.downMin * 312 * 5)} tone="warn" /></div>}
      {tab === "activity" && <Card pad={false}><ul className="divide-y divide-line text-[13px]">{s.logs.filter((l) => l.detail.includes(m.id) || l.ref.startsWith("BD")).slice(0, 8).map((l, i) => <li key={i} className="flex flex-wrap justify-between gap-2 px-4 py-2.5"><span><b>{l.user}</b> · {l.action} — <span className="text-mute">{l.detail}</span></span><span className="num text-[12px] text-mute">{fdt(l.ts)}</span></li>)}</ul></Card>}
    </div>
  );
}
void C;
