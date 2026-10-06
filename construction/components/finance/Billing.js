"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import { CHANGE_ORDERS, MEASUREMENTS, PAYABLE, PAYMENTS, RA_BILLS, RA_FLOW, VENDOR_BILLS } from "@/data/ops";
import { getProject, projName } from "@/data/core";
import { Bar, Btn, Card, Drawer, Flow, Insight, Kpi, Kv, Pill, Tabs, cn } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { L, num, rs, cr } from "@/lib/format";
import { useStore } from "@/lib/store";

export function RaDashboard() {
  const t = [["Work executed", "₹47.8 Cr", ""], ["Billed", "₹39.4 Cr", ""], ["Certified", "₹36.7 Cr", ""], ["Collected", "₹31.8 Cr", "good"], ["Unbilled work", "₹8.4 Cr", "warn"], ["Outstanding", "₹4.9 Cr", "bad"]];
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">{t.map(([l, v, tn]) => <Kpi key={l} label={l} value={v} tone={tn} />)}</div>;
}
export function RaTable({ pid, openId }) {
  const rows = RA_BILLS.filter((b) => !pid || b.p === pid);
  const [sel, setSel] = useState(openId ? RA_BILLS.find((b) => b.id === openId) : null);
  const { toast, log } = useStore();
  return (
    <>
      <Card pad={false} title="RA bills" sub="Running account bills raised to clients · amounts in ₹ lakh" action={null}>
        <DataTable exportName="ra-bills" dense pageSize={8} searchKeys={["id", "client"]} onRowClick={setSel} columns={[
          { key: "id", label: "Bill", render: (r) => <span className="num font-medium text-accent-ink">{r.id}</span> },
          ...(pid ? [] : [{ key: "p", label: "Project", render: (r) => projName(r.p), sort: (r) => projName(r.p) }]), { key: "client", label: "Client", render: (r) => <span className="text-mute">{r.client}</span> },
          { key: "submitted", label: "Submitted", align: "right", render: (r) => L(r.submitted) }, { key: "certified", label: "Certified", align: "right", render: (r) => (r.certified ? L(r.certified) : "—") },
          { key: "deduction", label: "Deduction", align: "right", render: (r) => (r.deduction ? L(r.deduction) : "—") }, { key: "received", label: "Received", align: "right", render: (r) => (r.received ? L(r.received) : "—") },
          { key: "outstanding", label: "Outstanding", align: "right", render: (r) => <b className={r.outstanding ? "text-bad" : "text-mute"}>{r.outstanding ? L(r.outstanding) : "—"}</b> },
          { key: "days", label: "Days out", align: "right", render: (r) => (r.days ? <span className={r.days > 15 ? "font-semibold text-bad" : "text-warn"}>{r.days}d</span> : "—") },
          { key: "step", label: "Stage", render: (r) => <Pill tone={r.step === 7 ? "good" : r.step >= 6 ? "warn" : "info"} dot={false}>{RA_FLOW[r.step - 1]}</Pill>, sort: (r) => r.step, csv: (r) => RA_FLOW[r.step - 1] },
        ]} rows={rows} />
      </Card>
      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel ? `RA Bill #${sel.id.slice(3)}` : ""} sub={sel ? `${projName(sel.p)} · ${sel.client}` : ""} width={520}
        footer={sel?.outstanding ? <Btn variant="primary" onClick={() => { toast(`Payment reminder sent to ${sel.client}`); log(`Payment reminder sent to ${sel.client} for ${sel.id}.`, "Accounts Manager", sel.p); }}><Send size={13} /> Send payment reminder</Btn> : null}>
        {sel && (<div className="space-y-4">
          <Flow steps={RA_FLOW} current={sel.step - 1} />
          <div className="grid grid-cols-2 gap-3">
            {[["Submitted", L(sel.submitted)], ["Certified", sel.certified ? L(sel.certified) : "Awaiting"], ["Deduction", L(sel.deduction)], ["Received", L(sel.received)]].map(([k, v]) => <div key={k} className="rounded-[6px] bg-panel p-3"><div className="text-[10.5px] uppercase tracking-wide text-faint">{k}</div><div className="num text-[18px] font-semibold">{v}</div></div>)}
          </div>
          {sel.outstanding > 0 && <Insight tone={sel.days > 15 ? "bad" : "warn"} title="Action"><b>₹{sel.outstanding}L has been pending from {sel.client} for {sel.days} days.</b> {sel.days > 15 ? "This is beyond the 15-day contract term — escalate to their finance head." : "Within contract terms; reminder is optional."}</Insight>}
          <div><Kv k="Deduction reason" v="Retention 5% + TDS + short-certified items" /><Kv k="Invoice no." v={`VB/INV/${sel.id}/26`} /><Kv k="Days outstanding" v={sel.days ? `${sel.days} days` : "—"} /></div>
        </div>)}
      </Drawer>
    </>
  );
}
export function MeasurementBook({ pid }) {
  const { toast } = useStore();
  const rows = MEASUREMENTS.filter((m) => !pid || m.p === pid).map((m) => ({ ...m, qty: +(m.l * m.w * m.h).toFixed(2) }));
  return (
    <Card pad={false} title="Measurement book" sub="Digital MB — quantities measured on site, verified by QS, approved by client">
      <DataTable exportName="measurement-book" dense pageSize={6} columns={[
        { key: "id", label: "MB ref", render: (r) => <span className="num font-medium">{r.id}</span> }, { key: "boq", label: "BOQ item" }, { key: "loc", label: "Location" },
        { key: "l", label: "L", align: "right" }, { key: "w", label: "W", align: "right" }, { key: "h", label: "H", align: "right" },
        { key: "qty", label: "Qty", align: "right", render: (r) => <b>{num(r.qty, 2)} {r.unit}</b> }, { key: "measured", label: "Measured by" }, { key: "verified", label: "Verified by" },
        { key: "client", label: "Client approval", render: (r) => <Pill>{r.client}</Pill>, csv: (r) => r.client },
      ]} rows={rows} />
    </Card>
  );
}
export function ChangeOrders({ pid }) {
  const { toast } = useStore();
  const rows = CHANGE_ORDERS.filter((c) => !pid || c.p === pid);
  return (
    <Card pad={false} title="Change orders" sub="Client change requests — scope, cost, timeline, approval, execution, billing">
      <DataTable exportName="change-orders" dense columns={[
        { key: "id", label: "CO", render: (r) => <span className="num font-medium text-accent-ink">{r.id}</span> }, ...(pid ? [] : [{ key: "p", label: "Project", render: (r) => <span className="text-mute">{projName(r.p)}</span> }]),
        { key: "scope", label: "Scope" }, { key: "value", label: "Value", align: "right", render: (r) => L(r.value) }, { key: "days", label: "Timeline", align: "right", render: (r) => `+${r.days} days` },
        { key: "approval", label: "Client approval", render: (r) => <Pill>{r.approval}</Pill>, csv: (r) => r.approval }, { key: "exec", label: "Execution", render: (r) => <span className="text-mute">{r.exec}</span> }, { key: "billing", label: "Billing", render: (r) => <span className="text-mute">{r.billing}</span> },
      ]} rows={rows} />
    </Card>
  );
}

export function VendorBillsSection({ pid }) {
  const rows = VENDOR_BILLS.filter((b) => !pid || b.p === pid);
  const { toast } = useStore();
  const P = PAYABLE, k = pid ? getProject(pid).value / 86.9 : 1;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Kpi label="Total payable" value={cr(P.total * k, 2)} tone="risk" /><Kpi label="Due this week" value={cr(P.week * k, 2)} tone="warn" /><Kpi label="Overdue" value={`₹${(P.overdue * k * 100).toFixed(0)}L`} tone="bad" /><Kpi label="Retention held" value={`₹${(P.retention * k * 100).toFixed(0)}L`} /><Kpi label="Supplier payable" value={cr(P.supplier * k, 2)} /><Kpi label="Contractor payable" value={cr(P.contractor * k, 2)} />
      </div>
      <Card pad={false} title="Bills to pay">
        <DataTable exportName="vendor-bills" dense pageSize={8} searchKeys={["id", "vendor"]} selectable filters={[{ key: "type", label: "Type", options: ["Supplier", "Contractor"] }, { key: "status", label: "Status", options: ["Pending", "Overdue"] }]}
          toolbar={<Btn size="sm" onClick={() => toast("Payment batch created for selected bills")}>Pay selected</Btn>} columns={[
            { key: "id", label: "Bill", render: (r) => <span className="num font-medium text-accent-ink">{r.id}</span> }, { key: "vendor", label: "Vendor" }, { key: "type", label: "Type", render: (r) => <span className="text-mute">{r.type}</span> },
            ...(pid ? [] : [{ key: "p", label: "Project", render: (r) => <span className="text-mute">{projName(r.p)}</span> }]),
            { key: "amount", label: "Amount", align: "right", render: (r) => rs(r.amount) }, { key: "due", label: "Due" }, { key: "status", label: "Status", render: (r) => <Pill>{r.status}</Pill>, csv: (r) => r.status },
          ]} rows={rows} />
      </Card>
    </div>
  );
}
export function PaymentsSection({ pid }) {
  const rows = PAYMENTS.filter((b) => !pid || b.p === pid);
  const inn = rows.filter((r) => r.dir === "In").reduce((a, r) => a + r.amount, 0), out = rows.filter((r) => r.dir === "Out").reduce((a, r) => a + r.amount, 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3"><Kpi label="Received (recent)" value={rs(inn)} tone="good" /><Kpi label="Paid out (recent)" value={rs(out)} /><Kpi label="Net" value={rs(inn - out)} tone={inn >= out ? "good" : "bad"} /></div>
      <Card pad={false} title="Payments ledger">
        <DataTable exportName="payments" dense pageSize={8} searchKeys={["party", "ref"]} filters={[{ key: "dir", label: "Direction", options: ["In", "Out"] }]} columns={[
          { key: "id", label: "Txn", render: (r) => <span className="num">{r.id}</span> }, { key: "dir", label: "Dir", render: (r) => <Pill tone={r.dir === "In" ? "good" : "mute"}>{r.dir === "In" ? "Received" : "Paid"}</Pill>, csv: (r) => r.dir },
          { key: "party", label: "Party" }, ...(pid ? [] : [{ key: "p", label: "Project", render: (r) => <span className="text-mute">{projName(r.p)}</span> }]), { key: "ref", label: "Against", render: (r) => <span className="num text-accent-ink">{r.ref}</span> },
          { key: "mode", label: "Mode" }, { key: "date", label: "Date" }, { key: "amount", label: "Amount", align: "right", render: (r) => <b className={r.dir === "In" ? "text-good" : ""}>{r.dir === "In" ? "+" : "−"}{rs(r.amount)}</b> },
        ]} rows={rows} />
      </Card>
    </div>
  );
}
