"use client";
import Link from "next/link";
import { FLEET_STRIP, ALERTS } from "@/data/ops";
import { cx } from "@/lib/format";
import { Drawer, Chip } from "./ui";

export function FleetStrip({ active, onPick, dark }) {
  return (
    <div className="kpis" style={{ marginBottom: 0, gridTemplateColumns: "repeat(8, minmax(0,1fr))", borderRadius: 10 }}>
      {FLEET_STRIP.map((s) => (
        <div key={s.k} className={cx("kpi click", active === s.k && "sel")} style={{ padding: "9px 12px" }} onClick={() => onPick(active === s.k ? null : s.k)}>
          <div className="lbl" style={{ display: "flex", alignItems: "center", gap: 6 }}><i className={cx("dot", s.tone === "g" ? "g" : s.tone === "r" ? "r" : s.tone === "a" ? "a" : s.tone === "b" ? "b" : "n")} style={{ width: 6, height: 6 }} />{s.label}</div>
          <div className="v" style={{ fontSize: 20 }}>{s.v}</div>
        </div>
      ))}
    </div>
  );
}

export function AlertFeed({ limit, compact }) {
  return (
    <div>
      {ALERTS.slice(0, limit || ALERTS.length).map((a) => (
        <Link key={a.id} href={a.href} className="feed-i" style={{ alignItems: "flex-start" }}>
          <i className={cx("dot", a.tone, a.tone === "r" && "pulse")} style={{ marginTop: 6 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Chip tone={a.tone}>{a.kind}</Chip><b style={{ fontWeight: 600 }}>{a.title}</b><span className="faint" style={{ marginLeft: "auto" }}>{a.time}</span></div>
            {!compact && <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 16px", marginTop: 6, fontSize: 12 }}>
              {a.rows.map(([k, v]) => <span key={k}><span className="faint">{k}: </span>{v}</span>)}
            </div>}
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
    <Drawer open={open} onClose={onClose} title="Fleet Brief" sub="Tuesday, 06 October · generated 06:00 AM by FleetOps AI">
      <p className="muted" style={{ marginTop: 0 }}>Good morning, Sanjay. Three things need you today: <b>TRP-9812 clutch breakdown</b>, <b>₹18.4L blocked by missing PODs</b>, and <b>₹32.8L overdue</b> from customers.</p>
      <S t="Fleet" items={[["Vehicles running", "72"], ["Idle", "31", "warn"], ["Breakdowns", "3", "neg"]]} />
      <S t="Deliveries" items={[["Due today", "18"], ["At risk", "2", "warn"], ["Delayed", "1", "neg"]]} />
      <S t="Money" items={[["Expected billing today", "₹24.8L"], ["Expected collection", "₹8.6L"], ["Overdue", "₹32.8L", "neg"]]} />
      <S t="POD" items={[["Pending", "17", "warn"], ["Invoice value blocked", "₹18.4L", "neg"]]} />
      <S t="Maintenance" items={[["Vehicles due this week", "6", "warn"]]} />
      <S t="Profitability" items={[["Vehicles below target margin", "3", "neg"]]} />
      <Link href="/assistant" className="btn pri" onClick={onClose}>Ask a follow-up</Link>
    </Drawer>
  );
}
