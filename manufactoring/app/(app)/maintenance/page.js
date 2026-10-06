"use client";
import { Hammer } from "lucide-react";
import { Btn, Card, Kpi, PageHeader, Pill, Tabs } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { BarsChart, C, Donut, HBar } from "@/components/ui/charts";
import { useStore } from "@/lib/store";
import { useTab } from "@/lib/useTab";
import { DOWNTIME_CATS, MAINT, MAINT_COST } from "@/data/ops";
import { fdate, fdt, inr, lakh, num } from "@/lib/format";
import { MachineLink } from "@/components/ui/links";

function Schedule() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[["Preventive Maintenance", MAINT.filter((m) => m.type === "Preventive").length], ["Corrective Maintenance", MAINT.filter((m) => m.type === "Corrective").length], ["Breakdown Maintenance", MAINT.filter((m) => m.type === "Breakdown").length], ["Scheduled Service", MAINT.filter((m) => m.type === "Scheduled Service").length]].map(([k, v]) => <Kpi key={k} label={k} value={v} />)}
      </div>
      <DataTable rows={MAINT} rowKey={(m) => m.id} pageSize={10} exportName="maintenance" searchPlaceholder="Search machine, task, technician…" defaultSort={{ key: "due", dir: "asc" }}
        filters={[{ key: "type", label: "Type", options: ["Preventive", "Corrective", "Breakdown", "Scheduled Service"], match: (r, v) => r.type === v }, { key: "st", label: "Status", options: ["Due Today", "In Progress", "Pending", "Scheduled", "Completed"], match: (r, v) => r.status === v }]}
        expand={(m) => <div className="text-[12.5px] text-mute">{m.note || "No additional notes."}</div>}
        cols={[{ key: "machine", header: "Machine", render: (m) => <MachineLink id={m.machine} /> }, { key: "task", header: "Task", render: (m) => <span className="font-medium">{m.task}</span> }, { key: "type", header: "Type", render: (m) => <Pill tone="neutral" dot={false}>{m.type}</Pill> }, { key: "due", header: "Due date", render: (m) => fdate(m.due) }, { key: "tech", header: "Technician", muted: true }, { key: "down", header: "Est. downtime", align: "right", render: (m) => `${m.down} min` }, { key: "status", header: "Status", render: (m) => <Pill>{m.status}</Pill> }]} />
    </div>
  );
}

function Breakdowns() {
  const { breakdowns, openQuick } = useStore();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Kpi label="Open tickets" value={breakdowns.filter((b) => b.status !== "Closed").length} tone="bad" /><Kpi label="Closed this week" value={breakdowns.filter((b) => b.status === "Closed").length} /><Kpi label="Mean time to repair" value="1 h 12 m" /><Kpi label="Downtime this month" value="14 h 20 m" /></div>
      <DataTable rows={breakdowns} rowKey={(b) => b.id} pageSize={10} exportName="breakdowns" searchPlaceholder="Search ticket, machine, issue…" toolbar={<Btn size="sm" variant="primary" icon={<Hammer size={14} />} onClick={() => openQuick("bd")}>Report breakdown</Btn>}
        filters={[{ key: "st", label: "Status", options: ["Open", "In Progress", "Closed"], match: (r, v) => r.status === v }, { key: "sev", label: "Severity", options: ["Critical", "High", "Medium", "Low"], match: (r, v) => r.severity === v }]}
        expand={(b) => <dl className="grid gap-x-8 gap-y-2 text-[12.5px] sm:grid-cols-3">{[["Production affected", b.affected], ["Reported by", b.by], ["Root cause", b.root], ["Repair action", b.action], ["Parts used", b.parts], ["Closed", b.closed ? fdt(b.closed) : "Open"]].map(([k, v]) => <div key={k}><dt className="label !text-[10px]">{k}</dt><dd>{v}</dd></div>)}</dl>}
        cols={[{ key: "id", header: "Ticket", render: (b) => <span className="font-medium">{b.id}</span> }, { key: "machine", header: "Machine", render: (b) => <MachineLink id={b.machine} /> }, { key: "reported", header: "Reported", render: (b) => fdt(b.reported) }, { key: "issue", header: "Issue", render: (b) => <span className="block max-w-[320px] whitespace-normal">{b.issue}</span> }, { key: "severity", header: "Severity", render: (b) => <Pill>{b.severity}</Pill> }, { key: "tech", header: "Technician", muted: true }, { key: "down", header: "Downtime", align: "right", render: (b) => `${b.down} min` }, { key: "status", header: "Status", render: (b) => <Pill>{b.status}</Pill> }]} />
    </div>
  );
}

function Downtime() {
  const total = DOWNTIME_CATS.reduce((s, d) => s + d.min, 0);
  const cols = [C.bad, C.warn, C.accent, C.soft, C.info, C.ok, "#9a9b94", "#c2c0b8", "#d9d7d0"];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Kpi label="Downtime today" value="3 hr 42 min" tone="warn" /><Kpi label="Estimated lost output" value={`${num(DOWNTIME_CATS.reduce((s, d) => s + d.lost, 0))} units`} /><Kpi label="Cost impact" value={inr(DOWNTIME_CATS.reduce((s, d) => s + d.cost, 0))} tone="bad" /><Kpi label="Top cause" value="Breakdown" sub="224 min · HP-05, P-04" /></div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <Card title="By category" sub={`${total} min recorded across both plants`}><Donut height={190} fmt={(v) => `${v} min`} data={DOWNTIME_CATS.map((d, i) => ({ name: d.cat, value: d.min, color: cols[i] }))} /></Card>
        <Card title="Downtime categories" pad={false}><DataTable rows={DOWNTIME_CATS} rowKey={(d) => d.cat} pageSize={10} cols={[{ key: "cat", header: "Category", render: (d) => <span className="font-medium">{d.cat}</span> }, { key: "min", header: "Minutes", align: "right" }, { key: "lost", header: "Lost production (est.)", align: "right", render: (d) => `${d.lost} units` }, { key: "cost", header: "Cost impact", align: "right", render: (d) => inr(d.cost) }]} /></Card>
      </div>
    </div>
  );
}

function Cost() {
  const c = MAINT_COST;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{[["Total maintenance cost", c.total], ["Spare parts", c.spare], ["Labour", c.labour], ["External service", c.external], ["Downtime cost", c.downtime]].map(([k, v]) => <Kpi key={k} label={k} value={lakh(v)} sub="October to date, trailing 30 d" />)}</div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Machine-wise maintenance expense"><div className="space-y-3">{c.byMachine.map(([k, v]) => <HBar key={k} label={k} right={lakh(v)} pct={(v / c.byMachine[0][1]) * 100} tone={k === "HP-05" ? "bad" : "accent"} />)}</div></Card>
        <Card title="Monthly maintenance cost"><BarsChart data={c.trend} keys={[{ k: "v", name: "Cost" }]} fmt={(v) => lakh(v)} height={230} /></Card>
      </div>
    </div>
  );
}

export default function Maintenance() {
  const [tab, setTab] = useTab(["schedule", "breakdowns", "downtime", "cost"], "schedule");
  return (
    <div>
      <PageHeader title="Maintenance" sub="Preventive, corrective and breakdown work — and what stopped production." />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "schedule", label: "Maintenance schedule" }, { id: "breakdowns", label: "Breakdown tickets" }, { id: "downtime", label: "Downtime" }, { id: "cost", label: "Maintenance cost" }]} />
      {tab === "schedule" && <Schedule />}{tab === "breakdowns" && <Breakdowns />}{tab === "downtime" && <Downtime />}{tab === "cost" && <Cost />}
    </div>
  );
}
