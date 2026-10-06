"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, KV, PageHeader, Pill, Stepper } from "@/components/ui/ui";
import { fgBatch } from "@/data/ops";
import { so, wo as getWo } from "@/data/orders";
import { INVOICES } from "@/data/finance";
import { BATCHES } from "@/data/orders";
import { fdate, lakh, num } from "@/lib/format";
import { WoLink, MachineLink, QcLink } from "@/components/ui/links";

export default function Trace() {
  const { id } = useParams();
  const b = fgBatch(id);
  if (!b) return <Card><div className="p-6 text-center text-[13px] text-mute">Batch {id} not found. <Link className="text-accent" href="/finished-goods?tab=batches">Back</Link></div></Card>;
  const w = getWo(b.wo);
  const orders = b.orders.map((o) => so(o));
  const inv = INVOICES.find((i) => i.so === b.orders[0]);
  const rm = BATCHES.find((x) => x.id === b.rmBatch);
  const steps = [["Supplier", rm?.supplier ?? "—"], ["Raw material batch", b.rmBatch], ["Work order", b.wo], ["Machine", b.machine], ["QC", `${b.qcId} · ${b.qc}`], ["Finished batch", b.id], ["Customer order", b.orders.join(", ")], ["Invoice", inv ? inv.id : "Pending"], ["Payment", inv && inv.paid >= inv.amount ? "Received" : "Pending"]];
  return (
    <div>
      <PageHeader crumbs={[{ label: "Finished Goods", href: "/finished-goods?tab=batches" }, { label: b.id }]} title={<span className="flex items-center gap-3">{b.id}<Pill>{b.qc}</Pill></span>} sub="End-to-end product traceability — supplier steel to customer payment" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Batch" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 sm:grid-cols-3">
            <KV label="Product">{b.product}</KV><KV label="Quantity"><span className="num">{num(b.qty)} units</span></KV><KV label="Produced">{fdate(b.date)} 2026</KV>
            <KV label="Work order"><WoLink id={b.wo} /></KV><KV label="Raw material batch">{b.rmBatch}</KV><KV label="Machine"><MachineLink id={b.machine} /></KV>
            <KV label="Supervisor">{b.sup}</KV><KV label="QC"><QcLink id={b.qcId} /> · {b.qc}</KV><KV label="Customer orders linked">{b.orders.join(", ")}</KV>
          </div>
        </Card>
        <Card title="Employees on this batch"><ul className="space-y-1 text-[13px]">{b.emps.map((e) => <li key={e}>{e}</li>)}</ul></Card>
      </div>
      <Card className="mt-4" title="Traceability chain"><Stepper stages={steps.map((s) => s[0])} current={5} />
        <div className="mt-3 grid gap-x-6 gap-y-1.5 text-[12.5px] sm:grid-cols-3 lg:grid-cols-5">{steps.map(([k, v]) => <div key={k}><span className="text-mute">{k}: </span><b>{v}</b></div>)}</div></Card>
      <Card className="mt-4" title="Answers for this batch">
        <dl className="grid gap-3 text-[13px] sm:grid-cols-2">
          {[["Which customer order created this?", orders.map((o) => `${o?.id} · ${o?.customer}`).join("; ")], ["Which raw material batch was used?", `${b.rmBatch}${rm ? ` (${rm.supplier}, received ${fdate(rm.received)})` : ""}`], ["Which machine produced it?", b.machine], ["Who worked on it?", b.emps.join(", ")], ["What was rejected?", `${w?.rejected ?? 0} units across the work order`], ["Did we get the money?", inv ? (inv.paid >= inv.amount ? "Yes — received in full" : `Not yet — ${lakh(inv.balance)} pending on ${inv.id}`) : "Not invoiced yet — batch is waiting for dispatch"]].map(([q, a]) => <div key={q} className="rounded-[6px] bg-bg p-3"><dt className="text-[12px] text-mute">{q}</dt><dd className="mt-0.5 font-medium">{a}</dd></div>)}
        </dl>
      </Card>
    </div>
  );
}
