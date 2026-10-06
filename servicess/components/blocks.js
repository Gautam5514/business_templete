"use client";
import Link from "next/link";
import { ALERTS } from "@/data/ops";
import { cx } from "@/lib/format";
import { Drawer, Chip } from "./ui";

export function AlertFeed({ limit, compact }) {
  return (
    <div>
      {ALERTS.slice(0, limit || ALERTS.length).map((a) => (
        <Link key={a.id} href={a.href} className="feed-i" style={{ alignItems: "flex-start" }}>
          <i className={cx("dot", a.tone, a.tone === "r" && "pulse")} style={{ marginTop: 6 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Chip tone={a.tone}>{a.kind}</Chip><b style={{ fontWeight: 600 }}>{a.title}</b><span className="faint" style={{ marginLeft: "auto" }}>{a.time}</span></div>
            {!compact && <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 16px", marginTop: 6, fontSize: 12 }}>{a.rows.map(([k, v]) => <span key={k}><span className="faint">{k}: </span>{v}</span>)}</div>}
            <div className="muted" style={{ marginTop: 5, fontSize: 12.5 }}>→ {a.impact}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function S({ t, items }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="lbl" style={{ marginBottom: 6 }}>{t}</div>
      {items.map(([a, b, tone]) => <div key={a} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--line2)" }}><span>{a}</span><b className={tone}>{b}</b></div>)}
    </div>
  );
}
export function MorningBrief({ open, onClose }) {
  return (
    <Drawer open={open} onClose={onClose} title="Service Brief" sub="Tuesday, 06 October · generated 06:00 AM by FieldDesk AI">
      <p className="muted" style={{ marginTop: 0 }}>Good morning, Vivek. Three things need you today: the <b>Apex Mall emergency</b> with no technician assigned, <b>City Hospital’s ₹4.8L AMC</b> expiring in 12 days, and <b>₹4.2L overdue 30+ days</b>.</p>
      <S t="Today" items={[["Service requests", "86"], ["Scheduled", "74"], ["Unassigned", "6", "neg"]]} />
      <S t="Technicians" items={[["Active", "52"], ["Available", "8", "pos"], ["Absent", "3", "warn"]]} />
      <S t="SLA" items={[["Within SLA", "92%"], ["Jobs at risk", "4", "neg"]]} />
      <S t="Money" items={[["Expected billing", "₹6.8L"], ["Expected collection", "₹4.2L"], ["Outstanding", "₹16.8L", "neg"]]} />
      <S t="AMC" items={[["Visits due this week", "18", "warn"], ["Contracts expiring this month", "7", "neg"]]} />
      <S t="Stock" items={[["Critical parts below minimum", "3", "neg"]]} />
      <Link href="/assistant" className="btn pri" onClick={onClose}>Ask a follow-up</Link>
    </Drawer>
  );
}
