"use client";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Btn, Card, Insight, Kpi, PageHeader, Pill, Tabs } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { BarsChart, C, HBar, LineChartX } from "@/components/ui/charts";
import { useStore } from "@/lib/store";
import { useTab } from "@/lib/useTab";
import { REJECTIONS, CHECKLIST } from "@/data/orders";
import { REJ_TREND, WEEKLY_REJ_BY_PRODUCT } from "@/data/ops";
import { inr, num } from "@/lib/format";
import { MachineLink, QcLink, WoLink } from "@/components/ui/links";

function Inspections() {
  const { qcs } = useStore();
  const router = useRouter();
  const today = qcs.filter((q) => q.ts.startsWith("2026-10-06") || q.ts.startsWith("2026-10-06T") || q.id > "QC-1181" && q.status !== "Rejected");
  const t = qcs.filter((q) => q.ts.slice(0, 10) === "2026-10-06" && q.status !== "In Progress");
  const insp = t.reduce((s, q) => s + q.inspected, 0), acc = t.reduce((s, q) => s + q.accepted, 0), rej = t.reduce((s, q) => s + q.rejected, 0), rw = t.reduce((s, q) => s + q.rework, 0);
  void today;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Inspected today" value={num(insp)} /><Kpi label="Accepted" value={num(acc)} /><Kpi label="Rejected" value={num(rej)} tone="bad" /><Kpi label="Rework" value={num(rw)} tone="warn" />
        <Kpi label="Rejection rate" value={`${((rej / insp) * 100).toFixed(1)}%`} tone="bad" sub="Target < 2%" /><Kpi label="Top defect" value="Surface dent" sub="19 units · Press P-04" />
      </div>
      <Insight tone="bad"><b>QC-1182</b> · Sink Model GLZY202-2418SB: 42 of 680 inspected rejected (<b>6.17%</b>). Primary defect: surface dent. Linked to P-04 die guide wear — corrective maintenance MT-905 is scheduled.</Insight>
      <DataTable rows={qcs} rowKey={(q) => q.id} pageSize={10} exportName="qc-inspections" searchPlaceholder="Search QC id, work order, batch…" onRowClick={(q) => router.push(`/quality/${q.id}`)} defaultSort={{ key: "id", dir: "desc" }}
        filters={[{ key: "st", label: "Status", options: ["Completed", "In Progress", "Rejected"], match: (r, v) => r.status === v }]}
        cols={[
          { key: "id", header: "QC ID", render: (q) => <QcLink id={q.id} /> }, { key: "ref", header: "Work order", render: (q) => <WoLink id={q.ref} /> }, { key: "product", header: "Product" }, { key: "batch", header: "Batch", muted: true },
          { key: "inspected", header: "Inspected", align: "right", render: (q) => num(q.inspected) }, { key: "accepted", header: "Accepted", align: "right", render: (q) => num(q.accepted) },
          { key: "rejected", header: "Rejected", align: "right", render: (q) => <span className={q.rate > 3 ? "font-medium text-bad" : ""}>{num(q.rejected)} <span className="text-[11px] text-mute">({q.rate.toFixed(1)}%)</span></span> },
          { key: "rework", header: "Rework", align: "right" }, { key: "inspector", header: "Inspector", muted: true }, { key: "status", header: "Status", render: (q) => <Pill>{q.status}</Pill> },
        ]} />
    </div>
  );
}

function Checklist() {
  return (
    <Card title="Quality checklist — Premium Kitchen Sink 24×18" sub="Applied to every lot · example from QC-1182" pad={false}>
      <DataTable rows={CHECKLIST} rowKey={(c) => c.item} pageSize={10} cols={[{ key: "item", header: "Check", render: (c) => <span className="font-medium">{c.item}</span> }, { key: "result", header: "Result", render: (c) => <Pill>{c.result}</Pill> }, { key: "note", header: "Comment", muted: true, render: (c) => c.note || "—" }]} />
    </Card>
  );
}

function Rejections() {
  const byDefect = Object.entries(REJECTIONS.reduce((m, r) => ({ ...m, [r.defect]: (m[r.defect] || 0) + r.rejected }), {})).sort((a, b) => b[1] - a[1]);
  const byMachine = Object.entries(REJECTIONS.reduce((m, r) => ({ ...m, [r.machine]: (m[r.machine] || 0) + r.rejected }), {})).sort((a, b) => b[1] - a[1]);
  const byShift = Object.entries(REJECTIONS.reduce((m, r) => ({ ...m, [r.shift]: (m[r.shift] || 0) + r.rejected }), {})).sort((a, b) => b[1] - a[1]);
  const loss = REJECTIONS.reduce((s, r) => s + r.scrapValue + r.rejected * 120, 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi label="Rejected (3 days)" value={num(REJECTIONS.reduce((s, r) => s + r.rejected, 0))} tone="bad" /><Kpi label="Rework" value={num(REJECTIONS.reduce((s, r) => s + r.rework, 0))} /><Kpi label="Scrap units" value={num(REJECTIONS.reduce((s, r) => s + r.scrap, 0))} />
        <Kpi label="Scrap weight" value={`${REJECTIONS.reduce((s, r) => s + r.scrapKg, 0).toFixed(0)} kg`} sub="SS offcuts & rejects" /><Kpi label="Est. quality loss" value={inr(loss)} tone="bad" sub="Scrap value + rework labour" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Top defects"><div className="space-y-3">{byDefect.slice(0, 5).map(([k, v]) => <HBar key={k} label={k} right={`${v} units`} pct={(v / byDefect[0][1]) * 100} tone="bad" />)}</div></Card>
        <Card title="Machines causing rejection"><div className="space-y-3">{byMachine.slice(0, 5).map(([k, v]) => <HBar key={k} label={k} right={`${v} units`} pct={(v / byMachine[0][1]) * 100} tone="warn" />)}</div></Card>
        <Card title="Rejection by shift"><div className="space-y-3">{byShift.map(([k, v]) => <HBar key={k} label={`${k} shift`} right={`${v} units`} pct={(v / byShift[0][1]) * 100} />)}</div></Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Rejection trend" sub="Daily % — target < 2%"><LineChartX data={REJ_TREND} keys={[{ k: "rate", name: "Rejection %", color: C.bad }]} target={2} fmt={(v) => `${v}%`} domain={[1, 3.5]} /></Card>
        <Card title="Product rejection — this week vs last"><BarsChart data={WEEKLY_REJ_BY_PRODUCT} keys={[{ k: "thisWeek", name: "This week" }, { k: "lastWeek", name: "Last week" }]} fmt={(v) => `${v}%`} height={220} colors={[C.bad, C.soft]} /></Card>
      </div>
      <DataTable rows={REJECTIONS.map((r, i) => ({ ...r, k: i }))} rowKey={(r) => r.k} pageSize={10} exportName="rejections-scrap" searchPlaceholder="Search defect, machine, work order…" cols={[
        { key: "date", header: "Date" }, { key: "wo", header: "Work order", render: (r) => <WoLink id={r.wo} /> }, { key: "product", header: "Product" }, { key: "defect", header: "Reason", render: (r) => <span className="font-medium">{r.defect}</span> },
        { key: "rejected", header: "Rejected", align: "right" }, { key: "rework", header: "Rework", align: "right" }, { key: "scrap", header: "Scrap", align: "right" }, { key: "scrapKg", header: "Scrap kg", align: "right", render: (r) => r.scrapKg.toFixed(1) }, { key: "scrapValue", header: "Scrap value", align: "right", render: (r) => inr(r.scrapValue) },
        { key: "process", header: "Process", muted: true }, { key: "machine", header: "Machine", render: (r) => <MachineLink id={r.machine} /> }, { key: "shift", header: "Shift", muted: true },
      ]} />
    </div>
  );
}

export default function Quality() {
  const [tab, setTab] = useTab(["inspections", "checklist", "rejections"], "inspections");
  const { openQuick } = useStore();
  return (
    <div>
      <PageHeader title="Quality Control" sub="Inspections, defects, rework and scrap — tied back to machine, shift and batch." actions={<Btn variant="primary" icon={<Plus size={14} />} onClick={() => openQuick("qc")}>Create QC Inspection</Btn>} />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "inspections", label: "Inspections" }, { id: "checklist", label: "Checklist" }, { id: "rejections", label: "Rejection & scrap" }]} />
      {tab === "inspections" && <Inspections />}{tab === "checklist" && <Checklist />}{tab === "rejections" && <Rejections />}
    </div>
  );
}
