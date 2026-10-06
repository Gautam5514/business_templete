"use client";
import { Check, Plus } from "lucide-react";
import { Btn, Card, Kpi, PageHeader, Pill, Tabs, cn } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { useStore } from "@/lib/store";
import { useTab } from "@/lib/useTab";
import { GRNS, POS, PURCHASE_FLOW, PURCHASE_FLOW_COUNTS, SUPPLIER_INVOICES } from "@/data/ops";
import { SUPPLIERS } from "@/data/masters";
import { fdate, inr, lakh, num } from "@/lib/format";
import { SupplierLink } from "@/components/ui/links";

const sid = (name) => SUPPLIERS.find((s) => s.name === name)?.id;

function Flow() {
  return (
    <div className="space-y-4">
      <Card title="Procurement pipeline" sub="Requirement to payment — number of open documents at each step">
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-11">
          {PURCHASE_FLOW.map((s, i) => <div key={s} className={cn("rounded-[8px] border bg-bg p-2.5", i === 0 || i === 4 ? "border-accent/40" : "border-line")}><div className="label !text-[10px]">{i + 1}</div><div className="mt-0.5 min-h-[32px] text-[12.5px] font-medium leading-tight">{s}</div><div className="num mt-1 text-[20px] font-semibold">{PURCHASE_FLOW_COUNTS[i]}</div></div>)}
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Open requirement"><p className="text-[13px] text-mute">MRP found <b className="text-ink">3 materials short</b> for the coming week. 2 requisitions are urgent.</p><Btn className="mt-3" size="sm" href="/raw-materials?tab=mrp">Open MRP</Btn></Card>
        <Card title="Late deliveries"><p className="text-[13px] text-mute"><b className="text-ink">PO-3319</b> Brass Cartridge, 4,000 pcs from Bharat Hardware — <b className="text-bad">2 days late</b>. WO-2845 is waiting.</p></Card>
        <Card title="Payables"><p className="text-[13px] text-mute">Supplier payable <b className="text-ink">₹63.6 L</b>, of which <b className="text-bad">₹1.32 L</b> is overdue (SINV-8801).</p></Card>
      </div>
    </div>
  );
}

function Pr() {
  const { prs, toast, openQuick } = useStore();
  return (
    <DataTable rows={prs} rowKey={(p) => p.id} pageSize={10} exportName="requisitions" searchPlaceholder="Search PR, material…" toolbar={<Btn size="sm" variant="primary" icon={<Plus size={14} />} onClick={() => openQuick("pr")}>New requisition</Btn>}
      filters={[{ key: "p", label: "Priority", options: ["Urgent", "High", "Medium", "Low"], match: (r, v) => r.priority === v }, { key: "s", label: "Status", options: ["Pending Approval", "Approved", "RFQ Sent", "Quote Received", "Ordered"], match: (r, v) => r.status === v }]}
      expand={(p) => <div className="grid gap-4 text-[12.5px] sm:grid-cols-3"><div><div className="label mb-0.5">Reason</div>{p.reason}</div><div><div className="label mb-0.5">Requested by</div>{p.requestedBy}</div><div><div className="label mb-0.5">Suggested suppliers</div>{p.suppliers.length ? p.suppliers.join(" · ") : "—"}</div></div>}
      cols={[{ key: "id", header: "PR", render: (p) => <span className="font-semibold">{p.id}</span> }, { key: "material", header: "Material" }, { key: "qty", header: "Required", align: "right", render: (p) => `${num(p.qty)} ${p.unit}` }, { key: "by", header: "Required by", render: (p) => fdate(p.by) }, { key: "reason", header: "Reason", muted: true, render: (p) => <span className="block max-w-[280px] truncate">{p.reason}</span> }, { key: "requestedBy", header: "Requested by", muted: true }, { key: "priority", header: "Priority", render: (p) => <Pill>{p.priority}</Pill> }, { key: "status", header: "Status", render: (p) => <Pill>{p.status}</Pill> },
        { key: "act", header: "", sortable: false, render: (p) => p.status === "Pending Approval" ? <Btn size="xs" variant="primary" icon={<Check size={12} />} onClick={() => toast(`${p.id} approved`, "ok", "RFQ will go to suggested suppliers")}>Approve</Btn> : null }]} />
  );
}

function Po() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Kpi label="Open POs" value={POS.filter((p) => p.pending > 0).length} sub={lakh(POS.filter((p) => p.pending > 0).reduce((s, p) => s + p.value, 0))} /><Kpi label="Delayed" value={POS.filter((p) => p.status === "Delayed").length} tone="bad" /><Kpi label="In transit" value={POS.filter((p) => p.status === "In Transit").length} /><Kpi label="Payment overdue" value={POS.filter((p) => p.pay === "Overdue").length} tone="warn" /></div>
      <DataTable rows={POS} rowKey={(p) => p.id} pageSize={10} exportName="purchase-orders" searchPlaceholder="Search PO, supplier, material…" defaultSort={{ key: "expected", dir: "asc" }}
        filters={[{ key: "s", label: "Status", options: ["Ordered", "In Transit", "Delayed", "Partially Received", "Completed"], match: (r, v) => r.status === v }, { key: "p", label: "Payment", options: ["Unpaid", "Partially Paid", "Paid", "Overdue"], match: (r, v) => r.pay === v }]}
        cols={[{ key: "id", header: "PO number", render: (p) => <span className="font-semibold">{p.id}</span> }, { key: "supplier", header: "Supplier", render: (p) => <SupplierLink name={p.supplier} id={sid(p.supplier)} /> }, { key: "material", header: "Material" }, { key: "qty", header: "Quantity", align: "right", render: (p) => `${num(p.qty)} ${p.unit}` }, { key: "value", header: "Value", align: "right", render: (p) => lakh(p.value) }, { key: "expected", header: "Expected delivery", render: (p) => fdate(p.expected) }, { key: "received", header: "Received", align: "right", render: (p) => num(p.received) }, { key: "pending", header: "Pending", align: "right", render: (p) => p.pending ? <b>{num(p.pending)}</b> : "0" }, { key: "pay", header: "Payment", render: (p) => <Pill>{p.pay}</Pill> }, { key: "status", header: "Status", render: (p) => <Pill>{p.status}</Pill> }]} />
    </div>
  );
}

function Grn() {
  const { openQuick } = useStore();
  return (
    <DataTable rows={GRNS} rowKey={(g) => g.id} pageSize={10} exportName="grn" searchPlaceholder="Search GRN, PO, supplier…" toolbar={<Btn size="sm" variant="primary" icon={<Plus size={14} />} onClick={() => openQuick("grn")}>Receive material</Btn>}
      cols={[{ key: "id", header: "GRN", render: (g) => <span className="font-semibold">{g.id}</span> }, { key: "po", header: "PO" }, { key: "supplier", header: "Supplier", muted: true }, { key: "material", header: "Material" }, { key: "ordered", header: "Ordered", align: "right", render: (g) => num(g.ordered) }, { key: "received", header: "Received", align: "right", render: (g) => num(g.received) }, { key: "rejected", header: "Rejected", align: "right", render: (g) => g.rejected ? <span className="font-medium text-bad">{num(g.rejected)}</span> : "0" }, { key: "accepted", header: "Accepted", align: "right", render: (g) => num(g.accepted) }, { key: "batch", header: "Batch", muted: true }, { key: "vehicle", header: "Vehicle", muted: true }, { key: "invoice", header: "Invoice no.", muted: true }, { key: "wh", header: "Warehouse", muted: true, defaultHidden: true }, { key: "by", header: "Received by", muted: true, defaultHidden: true }, { key: "qc", header: "QC", render: (g) => <Pill>{g.qc}</Pill> }]} />
  );
}

function Inv() {
  return <DataTable rows={SUPPLIER_INVOICES} rowKey={(i) => i.id} pageSize={10} exportName="supplier-invoices" cols={[{ key: "id", header: "Invoice", render: (i) => <span className="font-semibold">{i.id}</span> }, { key: "supplier", header: "Supplier" }, { key: "po", header: "PO", muted: true }, { key: "amount", header: "Amount", align: "right", render: (i) => inr(i.amount) }, { key: "due", header: "Due", render: (i) => fdate(i.due) }, { key: "status", header: "Status", render: (i) => <Pill>{i.status}</Pill> }]} />;
}

export default function Purchase() {
  const [tab, setTab] = useTab(["flow", "pr", "po", "grn", "invoices"], "flow");
  return (
    <div>
      <PageHeader title="Purchase" sub="Requirement → requisition → RFQ → PO → receipt → QC → stock → invoice → payment." />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "flow", label: "Workflow" }, { id: "pr", label: "Requisitions" }, { id: "po", label: "Purchase orders" }, { id: "grn", label: "Goods receipt" }, { id: "invoices", label: "Supplier invoices" }]} />
      {tab === "flow" && <Flow />}{tab === "pr" && <Pr />}{tab === "po" && <Po />}{tab === "grn" && <Grn />}{tab === "invoices" && <Inv />}
    </div>
  );
}
