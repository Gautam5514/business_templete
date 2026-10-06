"use client";
import Link from "next/link";
import { useState } from "react";
import { Check, Truck } from "lucide-react";
import { Chip, Insight, Kpis, PageHead, Panel, Tabs, Mono } from "@/components/ui";
import { PARTS, PART_REQ, TRANSFERS, WARRANTY } from "@/data/ops";
import { useApp } from "@/lib/store";

const FLOW = ["Request part", "Supervisor approval", "Nearest branch", "Dispatch", "Technician receives", "Job continues"];
const wt = { None: "n", "Claim raised": "a", "Replaced by supplier": "g", "Claim rejected": "r" };
export default function Inventory() {
  const { notify } = useApp();
  const [tab, setTab] = useState("Part requests");
  const critical = PARTS.filter((p) => p.status === "Out of stock" && p.branch === "Ranchi").slice(0, 6);
  return (
    <div className="page">
      <PageHead title="Inventory" sub="Branch stock, technician requests, transfers and supplier warranty — and what each shortage costs in SLA." />
      <Insight tone="r"><b>3 critical parts are below minimum level.</b> Compressor 1.5 Ton (0 in Ranchi) is the only blocker with an SLA breach — 3 jobs, ₹84,000.</Insight>
      <Kpis items={[{ label: "Open part requests", value: PART_REQ.length, tone: "a" }, { label: "Jobs blocked by stock", value: 3, tone: "r", hint: "₹84,000" }, { label: "Transfers in flight", value: 2 }, { label: "Out of stock (Ranchi)", value: critical.length, tone: "r" }, { label: "Warranty claims open", value: 1 }]} />
      <Tabs tabs={["Part requests", "Transfers", "Warranty tracking", "Branch shortages"]} value={tab} onChange={setTab} />
      {tab === "Part requests" && <div style={{ display: "grid", gap: 14 }}>{PART_REQ.map((p) => (
        <Panel key={p.id} title={`${p.id} · ${p.part}`} sub={`${p.tech} · ${p.cust}`} actions={<Link href={`/jobs/${p.job}`} className="link mono">{p.job}</Link>}>
          <div className="stepper" style={{ marginBottom: 10 }}>{FLOW.map((s, i) => <div key={s} className={i < p.stage ? "done" : i === p.stage ? "now" : ""}>{s}</div>)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span className={p.impact.includes("breached") ? "neg" : "warn"}>SLA impact: <b>{p.impact}</b></span><span style={{ flex: 1 }} />{p.stage < 3 && <button className="btn sm pri" onClick={() => notify(`${p.id} approved · routed to nearest branch`)}><Check size={12} /> Approve & route</button>}</div>
        </Panel>))}</div>}
      {tab === "Transfers" && <Panel title="Inventory transfers" sub="branch ↔ warehouse ↔ technician ↔ returns ↔ damaged" tight><table className="tbl"><thead><tr><th>ID</th><th>Type</th><th>Item</th><th>From</th><th>To</th><th>Status</th><th>ETA / date</th></tr></thead><tbody>{TRANSFERS.map((t) => <tr key={t.id}><td className="mono">{t.id}</td><td>{t.kind}</td><td style={{ fontWeight: 560 }}>{t.item}{t.note && <div className="faint" style={{ fontSize: 11 }}>{t.note}</div>}</td><td>{t.from}</td><td>{t.to}</td><td><Chip tone={{ "In transit": "a", Delivered: "g", Received: "g", "Written off": "r", Approved: "b" }[t.status]} dot>{t.status}</Chip></td><td>{t.eta}</td></tr>)}</tbody></table></Panel>}
      {tab === "Warranty tracking" && <Panel title="Replaced-part warranty" tight><table className="tbl"><thead><tr><th>Part</th><th>Job</th><th>Customer</th><th>Warranty start</th><th>Warranty end</th><th>Supplier</th><th>Claim status</th></tr></thead><tbody>{WARRANTY.map((w) => <tr key={w.job}><td style={{ fontWeight: 560 }}>{w.part}</td><td><Mono href={`/jobs/${w.job}`}>{w.job}</Mono></td><td>{w.cust}</td><td>{w.start}</td><td>{w.end}</td><td>{w.supplier}</td><td><Chip tone={wt[w.claim]}>{w.claim}</Chip></td></tr>)}</tbody></table></Panel>}
      {tab === "Branch shortages" && <Panel title="Out of stock — Ranchi" tight>{critical.map((p) => <div key={p.key} className="feed-i"><Truck size={14} className="faint" /><b style={{ flex: 1 }}>{p.name}</b><span className="faint">reorder level {p.reorder}</span><Chip tone="r">Out of stock</Chip><button className="btn sm" onClick={() => notify(`Purchase order raised for ${p.name}`)}>Raise PO</button></div>)}</Panel>}
    </div>
  );
}
