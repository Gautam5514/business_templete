"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Btn, Card, Field, Input, Insight, Kpi, PageHeader, Pill, Progress, Select, Tabs } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { Mrp } from "@/components/materials/Mrp";
import { useStore } from "@/lib/store";
import { useTab } from "@/lib/useTab";
import { MATERIALS, mat } from "@/data/masters";
import { BATCHES } from "@/data/orders";
import { fdate, fdt, lakh, num } from "@/lib/format";
import { WoLink } from "@/components/ui/links";

function Stock() {
  const total = MATERIALS.reduce((s, m) => s + m.value, 0);
  const low = MATERIALS.filter((m) => m.status === "Low Stock").length, crit = MATERIALS.filter((m) => m.status === "Critical").length;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Total raw material value" value="₹3.42 Cr" sub="420 SKUs · 14 shown below" />
        <Kpi label="Low stock" value={low} tone="warn" sub="Below reorder level" />
        <Kpi label="Critical stock" value={crit} tone="bad" sub="Below minimum" />
        <Kpi label="Reserved material" value="₹1.12 Cr" sub="Against 9 active work orders" />
        <Kpi label="Incoming material" value="₹6.3 L" sub="5 POs in transit" />
        <Kpi label="Rejected material" value="1,200 pcs" sub="Brass cartridge · GRN-4412" tone="bad" />
      </div>
      <DataTable rows={MATERIALS} rowKey={(m) => m.code} pageSize={10} exportName="raw-materials" searchPlaceholder="Search material or code…" defaultSort={{ key: "status", dir: "asc" }}
        filters={[{ key: "st", label: "Status", options: ["In Stock", "Low Stock", "Critical"], match: (r, v) => r.status === v }, { key: "cat", label: "Category", options: ["Steel", "Fittings", "Packaging", "Consumable"], match: (r, v) => r.cat === v }]}
        expand={(m) => <div className="grid gap-4 text-[12.5px] sm:grid-cols-4"><div><div className="label mb-0.5">Stock cover</div><Progress value={m.avail} max={m.reorder * 1.5} tone={m.avail < m.min ? "bad" : m.avail < m.reorder ? "warn" : "ok"} /><div className="mt-1 text-mute">Available {num(m.avail)} vs reorder {num(m.reorder)}</div></div><div><div className="label mb-0.5">Preferred supplier</div>{m.supplier}</div><div><div className="label mb-0.5">Rate</div>₹{m.rate} / {m.unit}</div><div><div className="label mb-0.5">Stock value</div>{lakh(m.value)}</div></div>}
        cols={[
          { key: "name", header: "Material", render: (m) => <span className="font-medium">{m.name}</span> }, { key: "code", header: "Code", muted: true }, { key: "cat", header: "Category", muted: true }, { key: "unit", header: "Unit", muted: true },
          { key: "cur", header: "Current stock", align: "right", render: (m) => num(m.cur) }, { key: "reserved", header: "Reserved", align: "right", render: (m) => num(m.reserved) },
          { key: "avail", header: "Available", align: "right", render: (m) => <b className={m.avail < m.min ? "text-bad" : ""}>{num(m.avail)}</b> },
          { key: "min", header: "Min stock", align: "right", render: (m) => num(m.min) }, { key: "reorder", header: "Reorder level", align: "right", render: (m) => num(m.reorder) },
          { key: "incoming", header: "Incoming", align: "right", render: (m) => m.incoming ? num(m.incoming) : "—" }, { key: "status", header: "Status", render: (m) => <Pill>{m.status}</Pill> },
        ]} />
      <p className="text-[12px] text-faint">Total value of rows shown: {lakh(total)}.</p>
    </div>
  );
}

function Batches() {
  return (
    <div className="space-y-4">
      <Insight tone="info">Every lot carries supplier, heat/lot number and the work orders that consumed it — so a customer complaint can be traced back to the exact steel coil.</Insight>
      <DataTable rows={BATCHES} rowKey={(b) => b.id} pageSize={10} exportName="material-batches" searchPlaceholder="Search batch, material, supplier…"
        filters={[{ key: "qc", label: "QC", options: ["Passed", "Rejected"], match: (r, v) => r.qc === v }]}
        expand={(b) => <div className="space-y-2 text-[12.5px]"><div className="flex flex-wrap items-center gap-2"><span className="label">Traceability</span><Pill tone="neutral" dot={false}>{b.supplier}</Pill>→<Pill tone="info" dot={false}>{b.id}</Pill>→{b.usedIn.map((w) => <WoLink key={w} id={w} />)}→<Pill tone="neutral" dot={false}>Finished batches</Pill></div><div className="text-mute">Heat / lot no. {b.lot} · received {fdate(b.received, true)}</div></div>}
        cols={[
          { key: "id", header: "Batch", render: (b) => <span className="font-medium">{b.id}</span> }, { key: "material", header: "Material" }, { key: "supplier", header: "Supplier", muted: true }, { key: "received", header: "Received", render: (b) => fdate(b.received, true) },
          { key: "qty", header: "Quantity", align: "right", render: (b) => `${num(b.qty)} ${b.unit}` },
          { key: "remaining", header: "Remaining", align: "right", render: (b) => <div className="w-24 text-right"><span>{num(b.remaining)}</span><Progress value={b.remaining} max={b.qty} className="mt-1" /></div> },
          { key: "used", header: "Used in", sortable: false, render: (b) => <span className="flex gap-1.5">{b.usedIn.map((w) => <WoLink key={w} id={w} />)}</span> }, { key: "qc", header: "Inward QC", render: (b) => <Pill>{b.qc}</Pill> },
        ]} />
    </div>
  );
}

function Issue() {
  const { wos, issues, addIssue, toast } = useStore();
  const active = wos.filter((w) => ["Running", "Material Pending", "Paused", "Ready"].includes(w.status));
  const [f, setF] = useState({ wo: "WO-2841", material: "SS 304 Sheet 1.2mm", std: 4200, qty: 4360, batch: "SS304S-250926-C", to: "Vijay Kumar" });
  const m = mat(f.material);
  const batches = BATCHES.filter((b) => b.material === f.material && b.remaining > 0);
  const variance = f.qty - f.std;
  const partial = f.qty < f.std;
  const submit = () => {
    if (f.qty > m.avail) return toast("Cannot issue more than available", "bad", `${num(m.avail)} ${m.unit} available`);
    const id = addIssue({ wo: f.wo, material: f.material, unit: m.unit, std: +f.std, actual: +f.qty, batch: f.batch || "AUTO-FIFO", to: f.to });
    toast(`Material issued — ${id}`, "ok", partial ? `Partial issue · ${num(f.std - f.qty)} ${m.unit} still to issue` : `${num(f.qty)} ${m.unit} ${f.material}`);
  };
  return (
    <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
      <Card title="Issue material to work order" sub="Partial issues are allowed">
        <div className="space-y-3">
          <Field label="Work order"><Select value={f.wo} onChange={(e) => setF({ ...f, wo: e.target.value })}>{active.map((w) => <option key={w.id}>{w.id}</option>)}</Select></Field>
          <Field label="Material"><Select value={f.material} onChange={(e) => setF({ ...f, material: e.target.value, batch: "" })}>{MATERIALS.map((x) => <option key={x.code}>{x.name}</option>)}</Select></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={`Required (${m.unit})`}><Input type="number" value={f.std} onChange={(e) => setF({ ...f, std: e.target.value })} /></Field>
            <Field label="Available"><Input disabled value={`${num(m.avail)} ${m.unit}`} readOnly /></Field>
            <Field label={`Issue quantity (${m.unit})`}><Input type="number" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} /></Field>
            <Field label="Batch"><Select value={f.batch} onChange={(e) => setF({ ...f, batch: e.target.value })}><option value="">FIFO (auto)</option>{batches.map((b) => <option key={b.id}>{b.id}</option>)}</Select></Field>
            <Field label="Warehouse"><Input disabled value="Raw Material Warehouse" readOnly /></Field>
            <Field label="Timestamp"><Input disabled value="06 Oct, 11:20 AM" readOnly /></Field>
            <Field label="Issued by"><Input disabled value="Sunil Yadav" readOnly /></Field>
            <Field label="Received by"><Select value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })}>{["Vijay Kumar", "Rajesh Yadav", "Sanjay Prasad", "Imran Ansari"].map((x) => <option key={x}>{x}</option>)}</Select></Field>
          </div>
          <div className={`rounded-[6px] px-3 py-2 text-[12.5px] ${variance > 0 ? "bg-bad-soft text-bad" : partial ? "bg-warn-soft text-warn" : "bg-ok-soft text-ok"}`}>
            Standard requirement <b>{num(f.std)}</b> · issuing <b>{num(f.qty)}</b> · variance <b>{variance > 0 ? "+" : ""}{num(variance)} {m.unit}</b>{f.std > 0 && ` (${((variance / f.std) * 100).toFixed(1)}%)`}{partial && " — partial issue, balance remains open"}
          </div>
          <Btn variant="primary" className="w-full" icon={<Plus size={14} />} onClick={submit}>Issue material</Btn>
        </div>
      </Card>
      <div className="min-w-0 space-y-4">
        <Insight>ISS-7712: standard requirement 4,200 kg, actual issued 4,360 kg — <b>+160 kg variance (+3.8%)</b> on WO-2841.</Insight>
        <DataTable rows={issues} rowKey={(i) => i.id} pageSize={10} exportName="material-issues" searchPlaceholder="Search issue, work order, material…" maxH="520px"
          cols={[
            { key: "id", header: "Issue", render: (i) => <span className="font-medium">{i.id}</span> }, { key: "wo", header: "Work order", render: (i) => <WoLink id={i.wo} /> }, { key: "material", header: "Material" },
            { key: "std", header: "Standard", align: "right", render: (i) => num(i.std) }, { key: "actual", header: "Issued", align: "right", render: (i) => num(i.actual) },
            { key: "variance", header: "Variance", align: "right", render: (i) => <span className={i.variance > 0 ? "font-medium text-bad" : i.variance < 0 ? "text-warn" : "text-ok"}>{i.variance > 0 ? "+" : ""}{num(i.variance)} ({i.vpct.toFixed(1)}%)</span> },
            { key: "batch", header: "Batch", muted: true }, { key: "by", header: "Issued by", muted: true }, { key: "to", header: "Received by", muted: true }, { key: "ts", header: "Time", render: (i) => fdt(i.ts), muted: true },
          ]} />
      </div>
    </div>
  );
}

export default function RawMaterials() {
  const [tab, setTab] = useTab(["stock", "batches", "issue", "mrp"], "stock");
  return (
    <div>
      <PageHeader title="Raw Materials" sub="Stock, lots, issues to the shop floor and what the plan needs next." />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "stock", label: "Stock" }, { id: "batches", label: "Batches / lots" }, { id: "issue", label: "Material issue" }, { id: "mrp", label: "MRP — what to buy" }]} />
      {tab === "stock" && <Stock />}{tab === "batches" && <Batches />}{tab === "issue" && <Issue />}{tab === "mrp" && <Mrp />}
    </div>
  );
}
