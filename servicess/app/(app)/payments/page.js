"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { Chip, Field, Insight, Kpis, PageHead, Panel, Modal } from "@/components/ui";
import { HBars } from "@/components/charts";
import { MODES, PAYMENTS } from "@/data/ops";
import { full } from "@/lib/format";
import { useApp } from "@/lib/store";

const MODE_LIST = ["Cash", "UPI", "Card", "Bank Transfer", "Cheque", "Credit", "AMC Included"];
export default function Payments() {
  const { notify } = useApp();
  const [mode, setMode] = useState("UPI"), [amt, setAmt] = useState(29854), [receipt, setReceipt] = useState(null);
  return (
    <div className="page">
      <PageHead title="Payments" sub="Collected on-site by technicians or by accounts — every receipt digital and linked to its job." />
      <Insight tone="g"><b>₹69.4L collected this month — 82% of billed.</b> 53% of today’s collection came through UPI captured by technicians on site.</Insight>
      <Kpis items={[{ label: "Collected today", value: "₹3.9L", tone: "g" }, { label: "Collected (MTD)", value: "₹69.4L" }, { label: "On-site by technicians", value: "₹1.2L", hint: "today" }, { label: "Expected today", value: "₹4.2L" }, { label: "Credit given (MTD)", value: "₹3.1L", tone: "a" }]} />
      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) 360px" }}>
        <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
          <Panel title="Today’s receipts" tight><table className="tbl"><thead><tr><th>Payment</th><th>Customer</th><th>Mode</th><th className="r">Amount</th><th>Time</th><th>Collected by</th><th>Against</th></tr></thead><tbody>{PAYMENTS.map((p) => <tr key={p.id}><td className="mono">{p.id}</td><td style={{ fontWeight: 560 }}>{p.customer}</td><td><Chip tone={p.mode === "AMC Included" ? "b" : p.mode === "Credit" ? "a" : "n"}>{p.mode}</Chip></td><td className="r"><b>{p.amount ? full(p.amount) : "—"}</b></td><td>{p.time}</td><td>{p.by}</td><td className="mono">{p.ref}</td></tr>)}</tbody></table></Panel>
          <Panel title="Collection mode mix" sub="% of value · month to date"><HBars items={MODES.map(([k, v]) => ({ k, v }))} fmt={(v) => v + "%"} max={40} /></Panel>
        </div>
        <Panel title="Collect payment" sub="what the technician sees on site">
          <div style={{ display: "grid", gap: 12 }}>
            <Field label="Job"><select className="select"><option>JOB-2790 · Orchid Diagnostics</option><option>JOB-2841 · Apex Mall</option></select></Field>
            <Field label="Amount (₹)"><input className="input" type="number" value={amt} onChange={(e) => setAmt(+e.target.value)} style={{ fontSize: 18, fontWeight: 650, height: 42 }} /></Field>
            <div><div className="lbl" style={{ marginBottom: 6 }}>Mode</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{MODE_LIST.map((m) => <button key={m} className={`btn ${mode === m ? "pri" : ""}`} onClick={() => setMode(m)}>{m}</button>)}</div></div>
            <button className="btn pri" style={{ height: 42, justifyContent: "center" }} onClick={() => { setReceipt({ amt, mode }); notify("Payment recorded · digital receipt generated"); }}>Collect {full(amt)}</button>
          </div>
        </Panel>
      </div>
      <Modal open={!!receipt} onClose={() => setReceipt(null)} title="Digital receipt">
        {receipt && <div style={{ maxWidth: 380, margin: "0 auto", textAlign: "center" }}><div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--green-soft)", color: "var(--green)", display: "grid", placeItems: "center", margin: "0 auto 8px" }}><Check /></div><div className="lbl">Receipt RCP-77{Math.floor(receipt.amt) % 900}</div><div style={{ fontSize: 30, fontWeight: 650, letterSpacing: "-0.03em" }}>{full(receipt.amt)}</div><div className="muted">Paid via {receipt.mode} · 06 Oct 2026 · 01:16 PM</div><dl className="kv" style={{ margin: "14px 0", textAlign: "left" }}><dt>Customer</dt><dd>Orchid Diagnostics</dd><dt>Job</dt><dd>JOB-2790</dd><dt>Collected by</dt><dd>Technician app</dd></dl><button className="btn pri" onClick={() => { setReceipt(null); notify("Receipt sent on WhatsApp"); }}>Send on WhatsApp</button></div>}
      </Modal>
    </div>
  );
}
