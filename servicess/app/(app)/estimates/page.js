"use client";
import { useState } from "react";
import { Chip, Insight, Kpis, PageHead, Panel, Modal } from "@/components/ui";
import SignaturePad from "@/components/SignaturePad";
import { ESTIMATES } from "@/data/ops";
import { full, inr } from "@/lib/format";
import { useApp } from "@/lib/store";

const L = { part: 18500, labour: 2800, gas: 3200, visit: 800, gst: 4554, total: 29854 };
const tone = { Draft: "n", "Awaiting approval": "a", Approved: "g", Rejected: "r" };
export default function Estimates() {
  const { notify } = useApp();
  const [rows, setRows] = useState(ESTIMATES);
  const [sel, setSel] = useState(ESTIMATES[0]);
  const [cust, setCust] = useState(false), [signed, setSigned] = useState(false), [record, setRecord] = useState(null);
  const setStatus = (id, status) => { setRows((r) => r.map((e) => (e.id === id ? { ...e, status } : e))); setSel((s) => ({ ...s, status })); };
  const pending = rows.filter((e) => e.status === "Awaiting approval");
  return (
    <div className="page">
      <PageHead title="Estimates" sub="Diagnosis-driven quotations with digital customer approval — nothing starts without a signed amount." />
      <Insight><b>{pending.length} estimates worth {inr(pending.reduce((a, e) => a + e.total, 0))} are waiting for customer approval</b>, the oldest for 3 hours — technicians are idle on site meanwhile.</Insight>
      <Kpis items={[{ label: "Awaiting approval", value: pending.length, tone: "a" }, { label: "Approved today", value: 14, tone: "g" }, { label: "Approval rate", value: "86%" }, { label: "Avg approval time", value: "42 min" }, { label: "Value pending", value: inr(pending.reduce((a, e) => a + e.total, 0)) }]} />
      <div className="grid g-main" style={{ gridTemplateColumns: "minmax(0,1fr) 420px" }}>
        <Panel title="All estimates" tight><table className="tbl"><thead><tr><th>Estimate</th><th>Job</th><th>Customer</th><th>Scope</th><th className="r">Total</th><th>Waiting</th><th>Status</th></tr></thead><tbody>{rows.map((e) => <tr key={e.id} style={{ cursor: "pointer", background: sel.id === e.id ? "var(--accent-soft)" : undefined }} onClick={() => setSel(e)}><td className="mono"><b>{e.id}</b></td><td className="mono">{e.job}</td><td style={{ fontWeight: 560 }}>{e.customer}</td><td>{e.title}</td><td className="r">{inr(e.total)}</td><td>{e.age}</td><td><Chip tone={tone[e.status]} dot>{e.status}</Chip></td></tr>)}</tbody></table></Panel>
        <Panel title={sel.id} sub={`${sel.job} · ${sel.customer}`} actions={<Chip tone={tone[sel.status]} dot>{sel.status}</Chip>}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{sel.title}</div>
          <dl className="kv"><dt>Part</dt><dd>{full(L.part)}</dd><dt>Labour</dt><dd>{full(L.labour)}</dd><dt>Gas refill</dt><dd>{full(L.gas)}</dd><dt>Visit charge</dt><dd>{full(L.visit)}</dd><dt>GST (18%)</dt><dd>{full(L.gst)}</dd><dt className="tot">Total</dt><dd className="tot">{full(sel.id === "EST-4410" ? L.total : sel.total)}</dd></dl>
          <div className="hr" />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button className="btn pri" onClick={() => { setStatus(sel.id, "Awaiting approval"); notify("Estimate sent on WhatsApp & email — “Your estimate is ready.”"); }}>Send Estimate</button>
            <button className="btn" onClick={() => { setCust(true); setSigned(false); }}>Customer view</button>
            <button className="btn" onClick={() => { setStatus(sel.id, "Approved"); notify("Marked approved by phone"); }}>Customer Approve</button>
            <button className="btn" onClick={() => { setStatus(sel.id, "Rejected"); notify("Estimate rejected — supervisor notified"); }}>Customer Reject</button>
            <button className="btn" onClick={() => notify("Opened line items for editing")}>Modify</button>
          </div>
          {record && record.id === sel.id && <div className="insight g" style={{ margin: "14px 0 0" }}><div><b>Approval stored.</b> {record.time} · {record.device} · {full(record.amount)} · signature captured.</div></div>}
        </Panel>
      </div>
      <Modal open={cust} onClose={() => setCust(false)} title="Customer approval — what the customer sees">
        <div style={{ maxWidth: 420, margin: "0 auto" }}>
          <div className="lbl">PrimeCare Service · estimate {sel.id}</div>
          <div style={{ fontSize: 20, fontWeight: 650, margin: "4px 0 2px" }}>{sel.title}</div><div className="muted">{sel.customer} · {sel.job}</div>
          <div style={{ fontSize: 30, fontWeight: 650, letterSpacing: "-0.03em", margin: "14px 0" }}>{full(sel.id === "EST-4410" ? L.total : sel.total)}</div>
          <SignaturePad onChange={setSigned} />
          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            <button className="btn pri" style={{ height: 44, justifyContent: "center" }} disabled={!signed} onClick={() => { setStatus(sel.id, "Approved"); setRecord({ id: sel.id, time: "06 Oct 2026, 01:16 PM", device: "iPhone 14 · Safari", amount: sel.id === "EST-4410" ? L.total : sel.total }); setCust(false); notify("Estimate approved — time, device, signature and amount stored"); }}>Approve estimate</button>
            <div style={{ display: "flex", gap: 8 }}><button className="btn" style={{ flex: 1, justifyContent: "center" }} onClick={() => { setStatus(sel.id, "Rejected"); setCust(false); }}>Reject</button><button className="btn" style={{ flex: 1, justifyContent: "center" }} onClick={() => { setCust(false); notify("Callback requested — coordinator will call in 10 min"); }}>Request call</button></div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
