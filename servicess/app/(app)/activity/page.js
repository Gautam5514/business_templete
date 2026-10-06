"use client";
import { useState } from "react";
import { MessageSquare, Phone, Mail, Smartphone } from "lucide-react";
import { Chip, PageHead, Panel, Tabs, Avatar, Mono } from "@/components/ui";
import { ACTIVITY, COMMS, COMPLIANCE, DOCS } from "@/data/ops";
import { cx } from "@/lib/format";

const ICON = { WhatsApp: MessageSquare, SMS: Smartphone, Call: Phone, Email: Mail };
export default function Activity() {
  const [tab, setTab] = useState("Activity log");
  return (
    <div className="page">
      <PageHead title="Activity" sub="Every action, message, document and certification — a complete accountability trail." />
      <Tabs tabs={["Activity log", "Customer communication", "Documents", "Safety & compliance"]} value={tab} onChange={setTab} />
      {tab === "Activity log" && <Panel title="Today" sub="SR-5842 · Apex Business Park and others"><div className="tl">{ACTIVITY.map((a, i) => <div key={i} className="tl-i done"><div style={{ display: "flex", gap: 10, alignItems: "baseline" }}><b className="mono" style={{ width: 70 }}>{a.time}</b><span style={{ fontWeight: 560 }}>{a.text}</span></div><div className="faint" style={{ fontSize: 12, marginLeft: 80 }}>{a.by}</div></div>)}</div></Panel>}
      {tab === "Customer communication" && <div className="grid g-main"><Panel title="Communication timeline" tight>{COMMS.map((c, i) => { const I = ICON[c.ch] || MessageSquare; return <div key={i} className="feed-i" style={{ alignItems: "flex-start" }}><span className="iconbtn" style={{ width: 30, height: 30, flex: "none" }}><I size={14} /></span><div style={{ flex: 1 }}><div style={{ display: "flex", gap: 8 }}><b>{c.customer}</b><Chip>{c.ch}</Chip><span className="faint" style={{ marginLeft: "auto" }}>{c.time}</span></div><div className="muted">{c.text}</div></div><Chip tone="g">{c.state}</Chip></div>; })}</Panel>
        <Panel title="Automated customer updates"><div style={{ display: "grid", gap: 8 }}>{["Your technician Rohit Kumar has been assigned.", "Your technician is 18 minutes away.", "Your estimate is ready.", "Your service has been completed.", "Your invoice is ready.", "Your next AMC visit is due on 18 Dec."].map((m) => <div key={m} className="bubble" style={{ fontSize: 12.5 }}>{m}</div>)}</div></Panel></div>}
      {tab === "Documents" && <Panel title="Document register" sub="AMC agreements, invoices, estimates, signatures, reports, certifications, warranty cards, manuals, photos" tight><table className="tbl"><thead><tr><th>Document</th><th>Type</th><th>Linked to</th><th>Date</th><th /></tr></thead><tbody>{DOCS.map((d) => <tr key={d.name}><td style={{ fontWeight: 560 }}>{d.name}</td><td><Chip>{d.type}</Chip></td><td>{d.ref}</td><td>{d.date}</td><td className="r"><span className="link">Open</span></td></tr>)}</tbody></table></Panel>}
      {tab === "Safety & compliance" && <Panel title="Technician safety & compliance" sub="3 certificates expire within 14 days" tight><table className="tbl"><thead><tr><th>Technician</th><th>Safety training</th><th>Certification</th><th>PPE</th><th>Electrical cert.</th><th>Working at height</th></tr></thead><tbody>{COMPLIANCE.map(({ t, safety, cert, ppe, elec, height }) => <tr key={t.id}><td><span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><Avatar name={t.name} size={22} />{t.name}</span></td>{[safety, cert, ppe, elec, height].map((v, i) => <td key={i}><Chip tone={/Expired|Missing/.test(v) ? "r" : /Expires/.test(v) ? "a" : v === "—" ? "n" : "g"}>{v}</Chip></td>)}</tr>)}</tbody></table></Panel>}
    </div>
  );
}
