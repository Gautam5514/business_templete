"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import TechMap from "@/components/TechMap";
import { Count, SlaTimer } from "@/components/ui";
import { TECHS, NOW } from "@/data/core";
import { ALERTS, JOBS, TODAY } from "@/data/ops";

export default function ControlRoom() {
  const [now, setNow] = useState(null), [sel, setSel] = useState("T01");
  useEffect(() => { const t0 = setTimeout(() => setNow(new Date()), 0); const i = setInterval(() => setNow(new Date()), 1000); return () => { clearTimeout(t0); clearInterval(i); }; }, []);
  const techs = useMemo(() => TECHS.filter((t) => t.branch === "ranchi"), []);
  const open = useMemo(() => JOBS.filter((j) => j.branch === "ranchi" && j.bucket === "unassigned").sort((a, b) => a.slaLeft - b.slaLeft), []);
  const delayed = JOBS.filter((j) => j.bucket === "delayed").slice(0, 5);
  useEffect(() => { const ids = ["T01", "T02", "T04", "T06", "T03"]; let i = 0; const t = setInterval(() => { i = (i + 1) % ids.length; setSel(ids[i]); }, 6500); return () => clearInterval(t); }, []);
  const stats = [["Jobs today", <Count key="a" to={86} />, ""], ["Completed", <Count key="b" to={58} />, "var(--green)"], ["Delayed", <Count key="c" to={8} />, "var(--amber)"], ["Unassigned", <Count key="d" to={6} />, "var(--red)"], ["SLA risk", <Count key="e" to={4} />, "var(--red)"], ["Revenue (MTD)", "₹84.6L", ""], ["Collections", "₹69.4L", "var(--green)"], ["AMC visits due", "18", "var(--amber)"]];
  return (
    <div className="cr" data-theme="dark" style={{ fontFamily: "var(--font-geist-sans)" }}>
      <header style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 18, padding: "0 6px" }}>
        <div className="logo"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0e1013" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" /></svg></div>
        <div><b style={{ fontSize: 17, letterSpacing: "-0.02em" }}>FieldDesk · Control Room</b><div className="faint" style={{ fontSize: 11.5 }}>PrimeCare Service Solutions · 68 technicians · 4 branches</div></div>
        <span style={{ flex: 1 }} /><span className="chip g"><i className="dot" /> LIVE · Ranchi</span>
        <div style={{ textAlign: "right" }}><div className="mono" style={{ fontSize: 22, letterSpacing: "-0.03em" }}>{now ? now.toLocaleTimeString("en-IN", { hour12: false }) : "--:--:--"}</div><div className="faint" style={{ fontSize: 11 }}>Tue, 06 Oct 2026 · IST</div></div>
        <Link href="/command-center" className="iconbtn" style={{ background: "#12151a", borderColor: "#202631" }} aria-label="Exit"><X size={16} /></Link>
      </header>
      <div style={{ position: "relative", minHeight: 0 }}><TechMap techs={techs} jobs={open} selectedId={sel} onSelect={setSel} fillParent /></div>
      <aside style={{ display: "grid", gridTemplateRows: "auto 1fr auto", gap: 10, minHeight: 0 }}>
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <div className="panel-h"><h3>Unassigned · SLA risk</h3><span className="sub">{open.length} waiting</span></div>
          {open.slice(0, 4).map((j) => <div key={j.id} className="feed-i" style={{ padding: "8px 14px", justifyContent: "space-between", alignItems: "center" }}><div><b>{j.customer}</b><div className="faint" style={{ fontSize: 11.5 }}>{j.issue.slice(0, 32)} · {j.prio}</div></div><SlaTimer left={j.slaLeft} total={j.sla} /></div>)}
        </div>
        <div className="panel" style={{ padding: 0, overflow: "auto" }}>
          <div className="panel-h"><h3>Alerts & escalations</h3><span className="sub">{ALERTS.length} open</span></div>
          {ALERTS.map((a) => <div key={a.id} className="feed-i" style={{ padding: "8px 14px" }}><i className={"dot " + a.tone + (a.tone === "r" ? " pulse" : "")} style={{ marginTop: 6 }} /><div><b style={{ fontWeight: 600 }}>{a.kind}</b><div className="muted" style={{ fontSize: 12 }}>{a.title}</div></div></div>)}
        </div>
        <div className="panel" style={{ padding: 0 }}>
          <div className="panel-h"><h3>Technicians</h3></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", textAlign: "center", padding: "10px 6px" }}>{[["Avail", 8, "var(--green)"], ["On job", 28, "var(--blue)"], ["Travel", 10, "var(--amber)"], ["Delayed", 6, "var(--red)"], ["Off", 16, "var(--grey)"]].map(([l, v, c]) => <div key={l}><div style={{ fontSize: 22, fontWeight: 620, color: c }}>{v}</div><div className="faint" style={{ fontSize: 10.5 }}>{l}</div></div>)}</div>
        </div>
      </aside>
      <footer style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: `repeat(${stats.length},1fr)`, gap: 10 }}>
        {stats.map(([l, v, c]) => <div key={l} className="cr-stat"><div className="lbl">{l}</div><div className="v" style={{ color: c || undefined, fontSize: typeof v === "string" && v.length > 6 ? 26 : 34 }}>{v}</div></div>)}
      </footer>
    </div>
  );
}
