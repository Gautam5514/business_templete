"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import FleetMap from "@/components/FleetMap";
import { Count } from "@/components/ui";
import { VEHICLES, TRIPS, tripById, fmtMin } from "@/data/fleet";
import { ALERTS, BREAKDOWNS } from "@/data/ops";
import { inr } from "@/lib/format";

export default function ControlRoom() {
  const [now, setNow] = useState(null);
  const [sel, setSel] = useState("JH01DK4821");
  useEffect(() => { const t0 = setTimeout(() => setNow(new Date()), 0); const i = setInterval(() => setNow(new Date()), 1000); return () => { clearTimeout(t0); clearInterval(i); }; }, []);
  const focus = useMemo(() => VEHICLES.filter((v) => v.sub === "delayed" || v.status === "breakdown" || v.id === "JH01DK4821").map((v) => v.id), []);
  useEffect(() => { let i = 0; const t = setInterval(() => { i = (i + 1) % focus.length; setSel(focus[i]); }, 7000); return () => clearInterval(t); }, [focus]);
  const delayed = TRIPS.filter((t) => t.status === "delayed").slice(0, 5);
  const stats = [
    ["Active trips", <Count key="a" to={64} />, ""], ["Delayed", <Count key="b" to={7} />, "var(--red)"], ["Breakdowns", <Count key="c" to={3} />, "var(--red)"], ["Revenue in transit", "₹1.84 Cr", ""],
    ["POD pending", "17 · ₹18.4L", "var(--amber)"], ["Idle vehicles", <Count key="d" to={31} />, "var(--amber)"], ["Deliveries due today", "18", ""],
  ];
  return (
    <div className="cr" data-theme="dark" style={{ fontFamily: "var(--font-geist-sans)" }}>
      <header style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 18, padding: "0 6px" }}>
        <div className="logo" style={{ background: "#f4f4f1" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0e1013" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17V7a1 1 0 0 1 1-1h10v11" /><path d="M14 10h4l3 3v4h-7" /></svg></div>
        <div><b style={{ fontSize: 17, letterSpacing: "-0.02em" }}>FleetOps · Control Room</b><div className="faint" style={{ fontSize: 11.5 }}>Eastern Freight &amp; Logistics Pvt. Ltd. · 128 vehicles · 14 hubs</div></div>
        <span style={{ flex: 1 }} />
        <span className="chip g"><i className="dot" /> LIVE</span>
        <div style={{ textAlign: "right" }}><div className="mono" style={{ fontSize: 22, letterSpacing: "-0.03em" }}>{now ? now.toLocaleTimeString("en-IN", { hour12: false }) : "--:--:--"}</div><div className="faint" style={{ fontSize: 11 }}>Tue, 06 Oct 2026 · IST</div></div>
        <Link href="/command-center" className="iconbtn" style={{ background: "#12151a", borderColor: "#202631" }} aria-label="Exit"><X size={16} /></Link>
      </header>

      <div style={{ position: "relative", minHeight: 0 }}>
        <FleetMap vehicles={VEHICLES} selectedId={sel} onSelect={setSel} fillParent />
      </div>

      <aside style={{ display: "grid", gridTemplateRows: "auto 1fr auto", gap: 10, minHeight: 0 }}>
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <div className="panel-h"><h3>Alerts</h3><span className="sub">{ALERTS.length} open</span></div>
          <div style={{ maxHeight: 300, overflow: "auto" }}>
            {ALERTS.map((a) => <div key={a.id} className="feed-i" style={{ padding: "8px 14px" }}><i className={"dot " + a.tone + (a.tone === "r" ? " pulse" : "")} style={{ marginTop: 6 }} /><div><b style={{ fontWeight: 600 }}>{a.kind}</b><div className="muted" style={{ fontSize: 12 }}>{a.title}</div></div></div>)}
          </div>
        </div>
        <div className="panel" style={{ padding: 0, overflow: "auto" }}>
          <div className="panel-h"><h3>Delays</h3><span className="sub">ETA slipping</span></div>
          {delayed.map((t) => <div key={t.id} className="feed-i" style={{ padding: "8px 14px", justifyContent: "space-between" }} onClick={() => setSel(t.vehicleId)}><div><b className="mono">{t.id}</b><div className="faint" style={{ fontSize: 11.5 }}>{t.from} → {t.to}</div></div><div style={{ textAlign: "right" }}><b className="neg">+{t.delay}m</b><div className="faint" style={{ fontSize: 11.5 }}>ETA {fmtMin(t.etaMin)}</div></div></div>)}
        </div>
        <div className="panel" style={{ padding: 0 }}>
          <div className="panel-h"><h3>Breakdowns</h3></div>
          {BREAKDOWNS.slice(0, 3).map((b) => <div key={b.id} className="feed-i" style={{ padding: "8px 14px", justifyContent: "space-between" }} onClick={() => setSel(b.vehicleId)}><span><b className="mono">{b.vehicleId}</b> <span className="faint">{b.loc}</span></span><span className="chip r">{b.issue}</span></div>)}
        </div>
      </aside>

      <footer style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: `repeat(${stats.length},1fr)`, gap: 10 }}>
        {stats.map(([l, v, c]) => <div key={l} className="cr-stat"><div className="lbl">{l}</div><div className="v" style={{ color: c || undefined, fontSize: typeof v === "string" && v.length > 7 ? 24 : 34 }}>{v}</div></div>)}
      </footer>
    </div>
  );
}
