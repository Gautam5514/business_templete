"use client";
import { Plus } from "lucide-react";
import { Btn, Card, Kpi, PageHeader, Pill, Progress, Stepper } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { useStore } from "@/lib/store";
import { cust } from "@/data/masters";
import { INVOICES } from "@/data/finance";
import { fdate, lakh, num } from "@/lib/format";
import { CustLink, WoLink } from "@/components/ui/links";

const STAGES = ["Customer Order", "Production Planning", "Material", "Production", "QC", "Finished Goods", "Packing", "Dispatch", "Invoice", "Payment"];
const stageOf = (o) => ({ New: 0, Approved: 1, "Production Required": 2, "In Production": 3, "Partially Ready": 5, Ready: 6, Dispatched: 8, Delivered: 10 }[o.status] ?? 0);

function Trace({ o }) {
  const inv = INVOICES.find((i) => i.so === o.id);
  return (
    <div className="space-y-3">
      <Stepper stages={STAGES} current={stageOf(o)} />
      <div className="grid gap-x-8 gap-y-1 text-[12.5px] sm:grid-cols-4">
        <div><span className="text-mute">Work order: </span>{o.wo ? <WoLink id={o.wo} /> : "— (served from stock)"}</div>
        <div><span className="text-mute">Reserved from stock: </span><b className="num">{num(o.stock)}</b> units</div>
        <div><span className="text-mute">Invoice: </span>{inv ? `${inv.id} (${inv.status})` : "Not yet invoiced"}</div>
        <div><span className="text-mute">Payment: </span>{inv ? (inv.paid >= inv.amount ? "Received in full" : inv.paid ? `Part paid ${lakh(inv.paid)}` : "Pending") : "—"}</div>
      </div>
    </div>
  );
}

export default function Orders() {
  const { sales, openQuick } = useStore();
  const open = sales.filter((o) => !["Delivered", "Dispatched"].includes(o.status));
  const need = sales.filter((o) => o.prodReq > 0 && !["Delivered", "Dispatched"].includes(o.status));
  return (
    <div>
      <PageHeader title="Sales Orders" sub="Manufacturing starts from demand — every order shows how much must still be produced." actions={<Btn variant="primary" icon={<Plus size={14} />} onClick={() => openQuick("so")}>Create Sales Order</Btn>} />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Open orders" value={open.length} sub={lakh(open.reduce((s, o) => s + o.value, 0))} />
        <Kpi label="Need production" value={need.length} sub={`${num(need.reduce((s, o) => s + o.prodReq, 0))} units to make`} tone="warn" />
        <Kpi label="Ready to dispatch" value={sales.filter((o) => o.status === "Ready").length} sub="Packed & waiting for vehicle" />
        <Kpi label="At risk of missing date" value="3" sub="ORD-5084 · ORD-5088 · ORD-5093" tone="bad" />
      </div>
      <DataTable
        rows={sales} rowKey={(o) => o.id} exportName="sales-orders" pageSize={10} searchPlaceholder="Search order, customer, product…"
        defaultSort={{ key: "dispatch", dir: "asc" }} selectable bulkActions={(sel, clear) => <Btn size="xs" variant="secondary" onClick={clear}>Send {sel.length} to planning</Btn>}
        filters={[
          { key: "status", label: "Status", options: ["New", "Approved", "Production Required", "In Production", "Partially Ready", "Ready", "Dispatched", "Delivered"], match: (r, v) => r.status === v },
          { key: "priority", label: "Priority", options: ["High", "Medium", "Low"], match: (r, v) => r.priority === v },
        ]}
        expand={(o) => <Trace o={o} />}
        cols={[
          { key: "id", header: "Order ID", render: (o) => <span className="font-medium">{o.id}</span> },
          { key: "customer", header: "Customer", render: (o) => <CustLink name={o.customer} id={cust(o.customer)?.id} /> },
          { key: "product", header: "Product" },
          { key: "qty", header: "Quantity", align: "right", render: (o) => num(o.qty) },
          { key: "value", header: "Order value", align: "right", render: (o) => lakh(o.value) },
          { key: "prodReq", header: "Production required", align: "right", render: (o) => o.prodReq ? <b>{num(o.prodReq)}</b> : <span className="text-faint">0</span> },
          { key: "stock", header: "Stock available", align: "right", render: (o) => num(o.stock) },
          { key: "prog", header: "Production status", sortable: false, render: (o) => o.wo ? <div className="w-28"><div className="flex justify-between text-[11.5px] text-mute"><WoLink id={o.wo} /><span>{o.status === "In Production" ? "running" : "queued"}</span></div><Progress value={{ "In Production": 55, "Production Required": 10, "Partially Ready": 80, New: 0, Approved: 5 }[o.status] ?? 0} tone="info" className="mt-1" /></div> : <span className="text-[12px] text-faint">From stock</span> },
          { key: "dispatch", header: "Expected dispatch", render: (o) => fdate(o.dispatch) },
          { key: "priority", header: "Priority", render: (o) => <Pill>{o.priority}</Pill> },
          { key: "status", header: "Status", render: (o) => <Pill>{o.status}</Pill> },
        ]}
      />
      <Card className="mt-4"><p className="text-[12.5px] text-mute">Expand any row to follow the order through planning, material, production, QC, finished goods, packing, dispatch, invoice and payment.</p></Card>
    </div>
  );
}
