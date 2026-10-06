"use client";
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Btn, Field, Input, Select, Textarea } from "@/components/ui/ui";
import { useStore } from "@/lib/store";
import { CUSTOMERS, MACHINES, MATERIALS, PRODUCTS, SUPPLIERS } from "@/data/masters";
import { POS } from "@/data/ops";
import { PAYMENTS } from "@/data/finance";

export function QuickModals() {
  const s = useStore();
  const router = useRouter();
  const { quick, closeQuick, toast } = s;
  const [v, setV] = useState({});
  const wos = s.wos.filter((w) => !["Completed", "Cancelled"].includes(w.status)).slice(0, 12).map((w) => w.id);
  const mats = MATERIALS.map((m) => m.name);
  const machines = MACHINES.map((m) => m.id);

  const FORMS = {
    so: { title: "Create Sales Order", sub: "Demand enters the planning engine immediately.", fields: [["customer", "Customer", CUSTOMERS.map((c) => c.name)], ["product", "Product", PRODUCTS.map((p) => p.name)], ["qty", "Quantity", "number", 500], ["date", "Required by", "date", "2026-10-20"], ["priority", "Priority", ["Medium", "High", "Low"]]],
      go: () => { toast("Sales order created", "ok", `${v.qty ?? 500} × ${v.product ?? PRODUCTS[0].name} — sent to Production Planning`); s.log("Sales order created", "ORD-5102", `${v.customer ?? CUSTOMERS[0].name}`); router.push("/planning"); } },
    wo: { title: "Create Production Order", sub: "Reserves material and books line capacity.", fields: [["product", "Product", PRODUCTS.map((p) => p.name)], ["qty", "Planned quantity", "number", 1000], ["line", "Production line", ["Line 1", "Line 2", "Line 3", "Line 4"]], ["start", "Start", "date", "2026-10-09"]],
      go: () => { toast("Production order WO-2885 created", "ok", "Material reserved · Line capacity booked"); s.log("Work order created", "WO-2885", `${v.qty ?? 1000} × ${v.product ?? PRODUCTS[0].name}`); router.push("/production"); } },
    issue: { title: "Issue Material", sub: "Issue raw material against a work order.", fields: [["wo", "Work order", wos], ["material", "Material", mats], ["std", "Standard requirement", "number", 1000], ["actual", "Issue quantity", "number", 1000]],
      go: () => { const m = MATERIALS.find((x) => x.name === (v.material ?? mats[0])); const id = s.addIssue({ wo: v.wo ?? wos[0], material: m.name, unit: m.unit, std: +(v.std ?? 1000), actual: +(v.actual ?? 1000), batch: "AUTO-FIFO", to: "Vijay Kumar" }); toast(`Material issued — ${id}`, "ok", `${v.actual ?? 1000} ${m.unit} ${m.name}`); router.push("/raw-materials?tab=issue"); } },
    entry: { title: "Enter Production", sub: "Incremental update for the running shift.", fields: [["wo", "Work order", wos], ["machine", "Machine", machines], ["produced", "Produced", "number", 200], ["accepted", "Accepted", "number", 192], ["rejected", "Rejected", "number", 8]],
      go: () => { s.addProduction({ wo: v.wo ?? wos[0], machine: v.machine ?? machines[0], produced: v.produced ?? 200, accepted: v.accepted ?? 192, rejected: v.rejected ?? 8, operator: "Kailash Mahto", scrap: 0, note: "" }); toast("Production recorded", "ok", `${v.wo ?? wos[0]} updated`); } },
    qc: { title: "Create QC Inspection", sub: "Record an inspection result.", fields: [["ref", "Work order", wos], ["batch", "Batch", "text", "FG-061026-07"], ["inspected", "Inspected qty", "number", 300], ["rejected", "Rejected", "number", 6], ["rework", "Rework", "number", 2]],
      go: () => { const w = s.wos.find((x) => x.id === (v.ref ?? wos[0])); const id = s.addQC({ ref: w.id, pid: w.pid, product: w.product, batch: v.batch ?? "FG-061026-07", inspected: +(v.inspected ?? 300), rejected: +(v.rejected ?? 6), rework: +(v.rework ?? 2), accepted: +(v.inspected ?? 300) - +(v.rejected ?? 6), inspector: "Neha Verma" }); toast(`Inspection ${id} saved`, "ok"); router.push(`/quality/${id}`); } },
    bd: { title: "Report Breakdown", sub: "Creates a ticket and alerts maintenance.", fields: [["machine", "Machine", machines], ["issue", "Issue", "textarea", ""], ["severity", "Severity", ["Medium", "High", "Critical", "Low"]]],
      go: () => { const id = s.addBreakdown({ machine: v.machine ?? machines[0], issue: v.issue || "Unusual noise and vibration", severity: v.severity ?? "Medium", by: "Vijay Kumar", affected: "Line impact being assessed", tech: "Unassigned" }); toast(`Breakdown ${id} reported`, "bad", "Maintenance team notified"); router.push("/maintenance?tab=breakdowns"); } },
    pr: { title: "Create Purchase Requisition", sub: "Send a requirement to the purchase team.", fields: [["material", "Material", mats], ["qty", "Quantity", "number", 1000], ["by", "Required by", "date", "2026-10-15"], ["priority", "Priority", ["High", "Urgent", "Medium", "Low"]]],
      go: () => { const m = MATERIALS.find((x) => x.name === (v.material ?? mats[0])); const id = s.createPR({ material: m.name, qty: +(v.qty ?? 1000), unit: m.unit, by: v.by ?? "2026-10-15", priority: v.priority ?? "High", requestedBy: "Rakesh Agarwal" }); toast(`${id} created`, "ok", "Pending approval"); router.push("/purchase?tab=pr"); } },
    grn: { title: "Receive Material (GRN)", sub: "Book a goods receipt against a purchase order.", fields: [["po", "Purchase order", POS.filter((p) => p.pending > 0).map((p) => p.id)], ["qty", "Received qty", "number", 2000], ["rej", "Rejected qty", "number", 0], ["vehicle", "Vehicle", "text", "JH-01-AB-0000"]],
      go: () => { toast("Goods receipt GRN-4414 booked", "ok", "Sent to QC · stock updates after approval"); s.log("GRN created", "GRN-4414", `${v.po ?? "PO"} received ${v.qty ?? 2000}`); router.push("/purchase?tab=grn"); } },
    dispatch: { title: "Create Dispatch", sub: "Assign packed goods to a vehicle.", fields: [["customer", "Customer", CUSTOMERS.map((c) => c.name)], ["product", "Product", PRODUCTS.map((p) => p.name)], ["qty", "Quantity", "number", 500], ["transporter", "Transporter", ["Ranchi Roadlines", "Patna Express Cargo", "Dhanbad Transport Co."]]],
      go: () => { const id = s.addDispatch({ customer: v.customer ?? CUSTOMERS[0].name, product: v.product ?? PRODUCTS[0].name, so: "ORD-5084", qty: +(v.qty ?? 500), packages: Math.ceil((v.qty ?? 500) / 6), value: +(v.qty ?? 500) * 750, transporter: v.transporter ?? "Ranchi Roadlines", eta: "2026-10-09" }); toast(`Dispatch ${id} created`, "ok"); router.push("/dispatch"); } },
    pay: { title: "Record Payment", sub: "Apply a customer receipt to an invoice.", fields: [["customer", "Customer", CUSTOMERS.map((c) => c.name)], ["amount", "Amount (₹)", "number", 500000], ["mode", "Mode", ["NEFT", "RTGS", "UPI", "Cheque"]]],
      go: () => { toast("Payment recorded", "ok", `₹${Number(v.amount ?? 500000).toLocaleString("en-IN")} from ${v.customer ?? CUSTOMERS[0].name}`); s.log("Payment received", `PAY-${6121 + PAYMENTS.length - 7}`, `${v.customer ?? CUSTOMERS[0].name}`); router.push("/payments"); } },
  };

  const f = quick ? FORMS[quick] : null;
  useEffect(() => { setV({}); }, [quick]);
  if (!f) return null;
  const submit = () => { f.go(); closeQuick(); };
  return (
    <Modal open onClose={closeQuick} title={f.title} sub={f.sub} footer={<><Btn onClick={closeQuick}>Cancel</Btn><Btn variant="primary" onClick={submit}>Save</Btn></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        {f.fields.map(([k, label, t, d]) => {
          const opts = Array.isArray(t) ? t : null;
          const type = opts ? "select" : t;
          const cur = v[k] ?? (opts ? opts[0] : d);
          return (
            <Field key={k} label={label} className={type === "textarea" ? "sm:col-span-2" : ""}>
              {type === "select" ? <Select value={cur} onChange={(e) => setV({ ...v, [k]: e.target.value })}>{opts.map((o) => <option key={o}>{o}</option>)}</Select>
                : type === "textarea" ? <Textarea rows={3} value={cur} placeholder="Describe the issue…" onChange={(e) => setV({ ...v, [k]: e.target.value })} />
                : <Input type={type} value={cur} onChange={(e) => setV({ ...v, [k]: e.target.value })} />}
            </Field>
          );
        })}
      </div>
    </Modal>
  );
}
void SUPPLIERS;
