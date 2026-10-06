"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Check, Circle, Gauge, Hammer, Package } from "lucide-react";
import { Btn, Card, Field, Input, Insight, Kpi, KV, PageHeader, Pill, Progress, Stepper, Tabs, cn } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { BarsChart, C, HBar } from "@/components/ui/charts";
import { useStore } from "@/lib/store";
import { useTab } from "@/lib/useTab";
import { woDetail } from "@/data/wodetail";
import { so, SALES_ORDERS } from "@/data/orders";
import { DEFECTS_1182 } from "@/data/orders";
import { fdt, inr, lakh, num } from "@/lib/format";
import { MachineLink, QcLink } from "@/components/ui/links";
import { INVOICES } from "@/data/finance";

const TABS = ["overview", "material", "production", "wip", "quality", "machines", "employees", "downtime", "cost", "documents", "activity"];
const LABEL = { overview: "Overview", material: "Material Consumption", production: "Production", wip: "WIP", quality: "Quality", machines: "Machine Activity", employees: "Employees", downtime: "Downtime", cost: "Cost", documents: "Documents", activity: "Activity" };

function Journey({ d }) {
  return (
    <ol className="relative">
      {d.journey.map((j, i) => {
        const last = i === d.journey.length - 1;
        return (
          <li key={j.label} className="relative flex gap-3 pb-4 last:pb-0">
            {!last && <span className={cn("absolute left-[9px] top-5 h-[calc(100%-12px)] w-px", j.state === "done" ? "bg-ok/40" : "bg-line-strong")} />}
            <span className={cn("relative z-10 mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border", j.state === "done" ? "border-ok bg-ok text-white" : j.state === "current" ? "border-accent bg-surface" : "border-line-strong bg-surface")}>
              {j.state === "done" ? <Check size={11} strokeWidth={3} /> : j.state === "current" ? <span className="live-dot h-2 w-2 rounded-full bg-accent" /> : null}
            </span>
            <div className="grid min-w-0 flex-1 gap-x-4 gap-y-0.5 sm:grid-cols-[170px_1fr]">
              <div className={cn("text-[13.5px] font-medium", j.state === "todo" && "text-faint")}>{j.label}</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[12px] text-mute sm:grid-cols-5">
                <span><span className="text-faint">Start </span><span className="num">{j.start}</span></span>
                <span><span className="text-faint">End </span><span className="num">{j.end}</span></span>
                <span><span className="text-faint">Duration </span><span className="num">{j.dur}</span></span>
                <span><span className="text-faint">Output </span><b className="num text-ink">{typeof j.output === "number" ? num(j.output) : j.output}</b></span>
                <span><span className="text-faint">Rejected </span><b className={cn("num", j.rejected ? "text-bad" : "text-ink")}>{j.rejected}</b></span>
                <span className="col-span-2 sm:col-span-5 text-faint">{j.who}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function WoPage() {
  const { id } = useParams();
  const s = useStore();
  const w = s.wos.find((x) => x.id === id);
  const [tab, setTab] = useTab(TABS, "overview");
  if (!w) return <Card><div className="p-6 text-center text-[13px] text-mute">Work order {id} was not found. <Link className="text-accent" href="/production">Back to production orders</Link></div></Card>;
  const d = woDetail(w);
  const order = so(w.so);
  const inv = INVOICES.find((i) => i.so === w.so);
  const qcs = s.qcs.filter((q) => q.ref === w.id);
  const logs = s.logs.filter((l) => l.ref === w.id || l.detail.includes(w.id));
  const rejRate = w.produced ? (w.rejected / w.produced) * 100 : 0;
  const is41 = w.id === "WO-2841";
  const chain = [["Customer", w.customer, "/customers"], ["Sales Order", w.so, "/orders"], ["Work Order", w.id, null], ["RM Batch", is41 ? "SS304S-250926-C" : "—", "/raw-materials?tab=batches"], ["Machine", is41 ? "HP-03 / P-04" : "—", "/machines"], ["Finished Batch", is41 ? "FG-061026-02" : "—", is41 ? "/finished-goods/FG-061026-02" : null], ["Dispatch", order?.status === "Dispatched" ? "DSP" : "Pending", "/dispatch"], ["Invoice", inv ? inv.id : "Not yet", "/invoices"], ["Payment", inv && inv.paid >= inv.amount ? "Received" : "Pending", "/payments"]];

  return (
    <div>
      <PageHeader crumbs={[{ label: "Production Orders", href: "/production" }, { label: w.id }]}
        title={<span className="flex flex-wrap items-center gap-3">{w.id}<Pill>{w.status}</Pill>{is41 && <Pill tone="warn">6 h behind plan</Pill>}</span>}
        sub={<>{d.p.name} · linked to <Link href="/orders" className="font-medium text-ink hover:underline">{w.so}</Link> ({w.customer})</>}
        actions={<><Btn icon={<Gauge size={14} />} onClick={() => s.openQuick("entry")}>Enter production</Btn><Btn icon={<Package size={14} />} onClick={() => s.openQuick("issue")}>Issue material</Btn><Btn icon={<Hammer size={14} />} onClick={() => s.openQuick("bd")}>Report breakdown</Btn></>} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Planned quantity" value={num(w.planned)} sub="units" />
        <Kpi label="Produced" value={num(w.produced)} sub={`${w.progress}% complete`} hint={<div className="mt-2"><Progress value={w.progress} tone="info" /></div>} />
        <Kpi label="Accepted" value={num(w.accepted)} />
        <Kpi label="Rejected" value={num(w.rejected)} tone={rejRate > 3 ? "bad" : undefined} sub={`${rejRate.toFixed(1)}% of produced`} />
        <Kpi label="Remaining" value={num(w.remaining)} tone={w.remaining && is41 ? "warn" : undefined} />
        <Kpi label="WIP" value={num(w.wip)} sub="units in process" />
      </div>

      <div className="mt-4"><Tabs value={tab} onChange={setTab} tabs={TABS.map((t) => ({ id: t, label: LABEL[t] }))} /></div>

      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card title="Order details" className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 sm:grid-cols-3">
                <KV label="Product">{d.p.name}</KV><KV label="Linked sales order">{w.so} · {order ? inr(order.value) : "—"}</KV><KV label="Customer">{w.customer}</KV>
                <KV label="Start"><span className="num">{fdt(w.start)}</span></KV><KV label="Expected completion"><span className="num">{fdt(w.due)}</span></KV><KV label="Production line">{w.line}</KV>
                <KV label="Supervisor">{w.supervisor}</KV><KV label="Shift">{is41 ? "Morning + Evening" : "Morning"}</KV><KV label="Standard cost / unit">₹{d.p.std}</KV>
              </div>
            </Card>
            <Card title="Why the delay?">
              {is41 ? <div className="space-y-2 text-[12.5px]"><Insight>Press P-04 die jam at 08:50 stopped Line 2 for 1 h 52 m. Output is 6 hours behind plan.</Insight><p className="text-mute">Recovery: evening shift added (Vijay Kumar), HP-03 covering forming. New completion <b className="text-ink">07 Oct 04:00 PM</b> still meets the 10 Oct dispatch for ORD-5084.</p></div> : <p className="text-[13px] text-mute">{w.status === "Running" ? "Running on schedule." : w.status === "Material Pending" ? "Waiting for material — see purchase delay on PO-3319." : w.status === "Completed" ? "Completed on time." : "No delay recorded."}</p>}
            </Card>
          </div>
          <Card title="Traceability chain" sub="Customer demand to payment"><Stepper stages={chain.map((c) => c[0])} current={is41 ? 4 : 3} />
            <div className="mt-3 grid gap-x-6 gap-y-1.5 text-[12.5px] sm:grid-cols-3 lg:grid-cols-5">{chain.map(([k, v, href]) => <div key={k}><span className="text-mute">{k}: </span>{href ? <Link href={href} className="font-medium hover:text-accent hover:underline">{v}</Link> : <b>{v}</b>}</div>)}</div></Card>
          <Card title="Production journey" sub="Every stage with time, output, rejection and who/what ran it"><Journey d={d} /></Card>
        </div>
      )}

      {tab === "material" && (
        <div className="space-y-4">
          {is41 && <Insight>SS 304 Sheet: <b>4,872 kg</b> consumed against <b>4,712 kg</b> standard for 1,240 units — <b>+160 kg (+3.4%)</b>. Cause: blank nesting loss and 54 rejected sinks.</Insight>}
          <DataTable rows={d.material} rowKey={(r) => r.name} pageSize={10} exportName={`${w.id}-materials`} searchPlaceholder="Search material…" cols={[
            { key: "name", header: "Material", render: (r) => <span className="font-medium">{r.name}</span> },
            { key: "perUnit", header: "Std / unit", align: "right", render: (r) => `${r.perUnit} ${r.unit}` },
            { key: "planned", header: "Planned total", align: "right", render: (r) => num(r.planned) },
            { key: "issued", header: "Issued to floor", align: "right", render: (r) => num(r.issued) },
            { key: "std", header: "Standard for output", align: "right", render: (r) => num(r.std) },
            { key: "actual", header: "Actual consumed", align: "right", render: (r) => num(r.actual) },
            { key: "variance", header: "Variance", align: "right", render: (r) => <span className={r.variance > 0 ? "font-medium text-bad" : "text-ok"}>{r.variance > 0 ? "+" : ""}{r.variance} ({r.vpct.toFixed(1)}%)</span> },
            { key: "onFloor", header: "Balance on floor", align: "right", render: (r) => num(r.onFloor) },
          ]} />
          <Card title="Issued from batches"><p className="text-[12.5px] text-mute">{is41 ? "SS304S-250926-C (4,360 kg, ISS-7712) · SS304S-251126-A (1,400 kg, ISS-7708) · DRN-CPL-0910 (2,000 pcs, ISS-7711)" : "Issued from FIFO batches — see Raw Materials → Material Issue."}</p></Card>
        </div>
      )}

      {tab === "production" && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card title="Output by entry" className="lg:col-span-2"><BarsChart height={220} stacked colors={[C.ok, C.bad]} data={[...d.entries, ...s.entries.filter((e) => e.wo === w.id).map((e) => ({ 0: "now", 3: e.produced, 4: e.accepted, 5: e.rejected }))].map((e) => ({ label: String(e[0]).slice(0, 5), accepted: Array.isArray(e) ? e[4] : e[4], rejected: e[5] }))} keys={[{ k: "accepted", name: "Accepted" }, { k: "rejected", name: "Rejected" }]} /></Card>
            <Card title="Shift target"><div className="space-y-3"><HBar label="Morning shift" right="1,240 / 1,500" pct={83} tone="info" /><HBar label="Evening shift" right="starts 02:00 PM" pct={0} /><p className="text-[12px] text-mute">Supervisors add incremental entries through the shift — each updates this order live.</p></div></Card>
          </div>
          <DataTable rows={[...s.entries.filter((e) => e.wo === w.id).map((e, i) => ({ k: `n${i}`, t: "Just now", m: e.machine, o: e.operator, p: e.produced, a: e.accepted, r: e.rejected, sh: "Morning", sv: w.supervisor, n: e.note || "Entered from mobile" })), ...d.entries.map((e, i) => ({ k: `e${i}`, t: e[0], m: e[1], o: e[2], p: e[3], a: e[4], r: e[5], sh: e[6], sv: e[7], n: e[8] }))]} rowKey={(r) => r.k} pageSize={10} exportName={`${w.id}-entries`} searchPlaceholder="Search entries…" cols={[
            { key: "t", header: "Time" }, { key: "m", header: "Machine", render: (r) => <MachineLink id={r.m} /> }, { key: "o", header: "Operator", muted: true },
            { key: "p", header: "Produced", align: "right", render: (r) => num(r.p) }, { key: "a", header: "Accepted", align: "right", render: (r) => num(r.a) }, { key: "r", header: "Rejected", align: "right", render: (r) => <span className={r.r > 12 ? "text-bad" : ""}>{r.r}</span> },
            { key: "sh", header: "Shift", muted: true }, { key: "n", header: "Notes", muted: true, render: (r) => <span className="whitespace-normal">{r.n || "—"}</span> },
          ]} />
        </div>
      )}

      {tab === "wip" && (
        <Card title="Work in progress by stage" sub={`${num(w.wip)} units currently in process`}>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{d.wipStages.map((x) => <div key={x.stage} className="rounded-[8px] border border-line bg-bg p-3"><div className="label !text-[10px]">{x.stage}</div><div className="num mt-1 text-[22px] font-semibold">{x.n}</div></div>)}</div>
          <div className="mt-4"><BarsChart height={200} data={d.wipStages.map((x) => ({ label: x.stage, n: x.n }))} keys={[{ k: "n", name: "Units" }]} /></div>
        </Card>
      )}

      {tab === "quality" && (
        <div className="space-y-4">
          {qcs.length ? <DataTable rows={qcs} rowKey={(q) => q.id} pageSize={10} exportName="qc" cols={[
            { key: "id", header: "QC", render: (q) => <QcLink id={q.id} /> }, { key: "batch", header: "Batch" }, { key: "inspected", header: "Inspected", align: "right" }, { key: "accepted", header: "Accepted", align: "right" }, { key: "rejected", header: "Rejected", align: "right", render: (q) => <span className="text-bad">{q.rejected}</span> }, { key: "rework", header: "Rework", align: "right" }, { key: "status", header: "Status", render: (q) => <Pill>{q.status}</Pill> },
          ]} /> : <Card><p className="text-[13px] text-mute">No inspections yet for this work order.</p></Card>}
          {is41 && <Card title="Defect reasons (QC-1182)"><div className="space-y-3">{DEFECTS_1182.map(([k, n, why]) => <HBar key={k} label={k} right={`${n} units`} pct={(n / 19) * 100} tone="bad" sub={why} />)}</div></Card>}
        </div>
      )}

      {tab === "machines" && (
        d.machines.length ? <DataTable rows={d.machines} rowKey={(m) => m.id + m.role} pageSize={10} exportName="machines" cols={[
          { key: "id", header: "Machine", render: (m) => <MachineLink id={m.id} /> }, { key: "role", header: "Process" }, { key: "run", header: "Run time", align: "right" }, { key: "idle", header: "Idle", align: "right" }, { key: "down", header: "Downtime", align: "right", render: (m) => <span className={m.down.startsWith("1") ? "font-medium text-bad" : ""}>{m.down}</span> }, { key: "out", header: "Units", align: "right", render: (m) => num(m.out) }, { key: "eff", header: "Efficiency", align: "right", render: (m) => <span className={m.eff < 80 ? "text-warn" : ""}>{m.eff}%</span> },
        ]} /> : <Card><p className="text-[13px] text-mute">No machine activity yet — order has not started.</p></Card>
      )}
      {tab === "employees" && (d.employees.length ? <DataTable rows={d.employees.map((e, i) => ({ k: i, n: e[0], r: e[1], m: e[2], sh: e[3], out: e[4], acc: e[5], rej: e[6], eff: e[7] }))} rowKey={(r) => r.k} pageSize={10} exportName="wo-employees" cols={[
        { key: "n", header: "Employee", render: (r) => <span className="font-medium">{r.n}</span> }, { key: "r", header: "Role", muted: true }, { key: "m", header: "Machine" }, { key: "sh", header: "Shift", muted: true }, { key: "out", header: "Output", align: "right", render: (r) => num(r.out) }, { key: "acc", header: "Accepted", align: "right", render: (r) => num(r.acc) }, { key: "rej", header: "Rejection %", align: "right", render: (r) => <span className={r.rej > 3 ? "text-bad" : ""}>{r.rej}%</span> }, { key: "eff", header: "Efficiency", align: "right" },
      ]} /> : <Card><p className="text-[13px] text-mute">No operators assigned yet.</p></Card>)}
      {tab === "downtime" && (d.downtime.length ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3"><Kpi label="Total downtime" value="2 h 27 m" tone="warn" /><Kpi label="Lost output (est.)" value="≈ 410 units" /><Kpi label="Cost impact" value={inr(454)} sub="Machine + labour idle (₹ per min × 3.1)" /></div>
          <DataTable rows={d.downtime.map((r, i) => ({ k: i, t: r[0], m: r[1], c: r[2], min: r[3], n: r[4], cost: r[5] }))} rowKey={(r) => r.k} pageSize={10} exportName="wo-downtime" cols={[{ key: "t", header: "Time" }, { key: "m", header: "Machine", render: (r) => <MachineLink id={r.m} /> }, { key: "c", header: "Category", render: (r) => <Pill tone={r.c === "Machine Breakdown" ? "bad" : "warn"}>{r.c}</Pill> }, { key: "min", header: "Minutes", align: "right" }, { key: "n", header: "Reason" }, { key: "cost", header: "Cost", align: "right", render: (r) => inr(r.cost) }]} />
        </div>
      ) : <Card><p className="text-[13px] text-mute">No downtime recorded for this order.</p></Card>)}

      {tab === "cost" && (d.cost ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Kpi label="Standard cost / unit" value={`₹${d.cost.std}`} /><Kpi label="Actual cost / unit" value={`₹${d.cost.perUnit}`} /><Kpi label="Variance" value={`${d.cost.perUnit - d.cost.std >= 0 ? "+" : ""}₹${d.cost.perUnit - d.cost.std}`} tone={d.cost.perUnit - d.cost.std > 10 ? "bad" : undefined} sub={is41 ? "Higher material usage + machine downtime" : ""} /><Kpi label="Total production cost" value={lakh(d.cost.total)} sub={`${num(d.cost.units)} units`} /></div>
          <Card title="Cost breakdown" pad={false}><DataTable rows={[["Raw material", d.cost.material], ["Material variance", d.cost.matVar], ["Labour", d.cost.labour], ["Machine", d.cost.machine], ["Power", d.cost.power], ["Packaging", d.cost.packaging], ["Rejection loss", d.cost.rejLoss], ["Overhead", d.cost.overhead]].map(([k, v]) => ({ k, v, u: v / d.cost.units }))} rowKey={(r) => r.k} pageSize={10} cols={[{ key: "k", header: "Component" }, { key: "v", header: "Amount", align: "right", render: (r) => inr(r.v) }, { key: "u", header: "Per unit", align: "right", render: (r) => `₹${r.u.toFixed(1)}` }]} /></Card>
        </div>
      ) : <Card><p className="text-[13px] text-mute">Costing starts once production begins.</p></Card>)}

      {tab === "documents" && <Card pad={false}><ul className="divide-y divide-line">{d.docs.map(([n, by, dt]) => <li key={n} className="flex items-center justify-between px-4 py-3 text-[13px]"><span className="font-medium">{n}</span><span className="text-mute">{by} · {dt}</span></li>)}</ul></Card>}
      {tab === "activity" && <Card pad={false}>{logs.length ? <ul className="divide-y divide-line">{logs.map((l, i) => <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5 text-[13px]"><span><b>{l.user}</b> · {l.action} — <span className="text-mute">{l.detail}</span></span><span className="num text-[12px] text-mute">{fdt(l.ts)}</span></li>)}</ul> : <p className="p-4 text-[13px] text-mute">No activity logged yet.</p>}</Card>}
    </div>
  );
}
void Circle; void Field; void Input; void SALES_ORDERS;
