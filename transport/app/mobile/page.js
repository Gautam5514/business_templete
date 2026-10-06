"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Camera, Check, MapPin, Navigation, Phone, Plus, Truck, Wrench } from "lucide-react";
import { useApp } from "@/lib/store";
import { PENDING_LOADS, BREAKDOWNS } from "@/data/ops";
import { HUBS } from "@/data/geo";

const STEPS = ["Start Trip", "Reached Pickup", "Start Loading", "Loading Complete", "Trip Started", "Reached Destination", "Start Unloading", "Upload POD", "Complete Trip"];
const EXP = ["Fuel", "Toll", "Parking", "Loading", "Unloading", "Repair", "Food", "Police / Checkpost", "Other"];

const Phone_ = ({ children, title }) => (
  <div style={{ width: 392, height: 806, borderRadius: 46, background: "#0b0d10", padding: 11, boxShadow: "0 40px 80px -30px rgba(0,0,0,.55), 0 0 0 1.5px #2a2f38", flex: "none" }} className="phone">
    <div style={{ width: "100%", height: "100%", borderRadius: 36, background: "var(--bg)", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ height: 34, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 22px 0", fontSize: 12, fontWeight: 600 }}><span>3:12</span><span style={{ width: 90, height: 22, background: "#0b0d10", borderRadius: 14, marginTop: -2 }} /><span>5G ▮▮▮</span></div>
      <div style={{ padding: "6px 18px 10px", display: "flex", alignItems: "center", gap: 8 }}><b style={{ fontSize: 17, letterSpacing: "-0.02em" }}>{title}</b></div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 14px 16px" }}>{children}</div>
    </div>
  </div>
);
const Card = ({ children, style }) => <div className="panel" style={{ padding: 14, ...style }}>{children}</div>;
const Big = ({ children, onClick, tone, disabled }) => <button disabled={disabled} onClick={onClick} style={{ width: "100%", height: 58, borderRadius: 14, border: 0, fontSize: 16, fontWeight: 650, background: disabled ? "var(--grey-soft)" : tone === "g" ? "var(--green)" : "var(--ink)", color: disabled ? "var(--ink3)" : tone === "g" ? "#fff" : "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{children}</button>;

function Driver() {
  const { notify } = useApp();
  const [step, setStep] = useState(4);
  const [sheet, setSheet] = useState(false);
  const [cat, setCat] = useState("Fuel");
  const done = step >= STEPS.length;
  return (
    <>
      <Card style={{ marginBottom: 10 }}>
        <div className="lbl">Current trip · TRP-9824</div>
        <div style={{ fontSize: 22, fontWeight: 650, letterSpacing: "-0.03em", margin: "4px 0" }}>Ranchi → Patna</div>
        <div className="muted">Sharma Distribution · 18.4 MT FMCG cartons</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
          {[["Distance", "334 km"], ["ETA", "07:20 PM"], ["Advance", "₹15,000"]].map(([a, b]) => <div key={a}><div className="lbl">{a}</div><b>{b}</b></div>)}
        </div>
        <div className="hr" />
        <div style={{ fontSize: 12.5 }}><b>Freight ₹82,000</b> · Instructions: <span className="muted">Unload at Gate 3 before 9 PM. Call receiver 30 min before arrival.</span></div>
      </Card>
      <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
        {done ? <Card style={{ textAlign: "center" }}><Check size={28} className="pos" style={{ margin: "0 auto 6px" }} /><b>Trip completed</b><div className="muted">POD sent for verification</div></Card> : <Big tone="g" onClick={() => { setStep(step + 1); notify(`${STEPS[step]} · logged with GPS & time`); }}><Navigation size={18} /> {STEPS[step]}</Big>}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" style={{ flex: 1, height: 46, justifyContent: "center", borderRadius: 12 }} onClick={() => setSheet(true)}><Plus size={16} /> Add expense</button>
          <button className="btn" style={{ flex: 1, height: 46, justifyContent: "center", borderRadius: 12 }}><Phone size={16} /> Call dispatch</button>
        </div>
      </div>
      <Card>
        <div className="lbl" style={{ marginBottom: 8 }}>Trip steps</div>
        {STEPS.map((s, i) => <div key={s} style={{ display: "flex", gap: 10, alignItems: "center", padding: "5px 0", opacity: i > step ? 0.45 : 1 }}><span style={{ width: 20, height: 20, borderRadius: "50%", display: "grid", placeItems: "center", background: i < step ? "var(--green)" : "var(--grey-soft)", color: "#fff", fontSize: 11, border: i === step ? "2px solid var(--accent)" : 0 }}>{i < step ? <Check size={12} /> : ""}</span><span style={{ fontWeight: i === step ? 650 : 400 }}>{s}</span></div>)}
      </Card>
      {sheet && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "flex-end", zIndex: 10 }} onClick={() => setSheet(false)}>
          <div style={{ background: "var(--panel)", width: "100%", borderRadius: "24px 24px 0 0", padding: 18, maxHeight: "86%", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
            <b style={{ fontSize: 17 }}>Add expense</b>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "12px 0" }}>{EXP.map((e) => <button key={e} className={"btn" + (cat === e ? " pri" : "")} style={{ borderRadius: 20 }} onClick={() => setCat(e)}>{e}</button>)}</div>
            <input className="input" style={{ height: 52, fontSize: 22, fontWeight: 650 }} placeholder="₹ Amount" inputMode="numeric" />
            <label className="drop" style={{ display: "grid", placeItems: "center", height: 90, margin: "10px 0", cursor: "pointer", color: "var(--ink2)" }}><div style={{ textAlign: "center" }}><Camera size={22} style={{ margin: "0 auto 4px" }} />Photo of receipt<input type="file" accept="image/*" capture="environment" hidden /></div></label>
            <div className="muted" style={{ fontSize: 12, display: "grid", gap: 3, marginBottom: 10 }}><span><MapPin size={11} style={{ display: "inline" }} /> Gaya bypass, Bihar (auto)</span><span>🕒 06 Oct 2026 · 03:12 PM (auto)</span></div>
            <input className="input" placeholder="Notes (optional)" style={{ marginBottom: 12 }} />
            <Big onClick={() => { setSheet(false); notify(`${cat} expense saved to TRP-9824`); }}>Save {cat} expense</Big>
          </div>
        </div>
      )}
    </>
  );
}

function Hub() {
  const h = HUBS[0];
  return (
    <>
      <Card style={{ marginBottom: 10 }}><div className="lbl">Ranchi Hub · live</div><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 8 }}>{[["Present", h.present], ["Arriving", h.arriving], ["Departing", h.departing], ["Pending loads", h.pending], ["Staff", h.staff], ["Turnaround", h.turnaround]].map(([a, b]) => <div key={a}><div className="lbl">{a}</div><b style={{ fontSize: 18 }}>{b}</b></div>)}</div></Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>{["Gate entry", "Gate exit", "Loading bay", "Unloading bay"].map((b) => <button key={b} className="btn" style={{ height: 64, justifyContent: "center", borderRadius: 14, fontWeight: 600 }}>{b}</button>)}</div>
      <Card><div className="lbl" style={{ marginBottom: 6 }}>Arriving next</div>{[["JH01CZ6212", "12 min"], ["JH05CZ1284", "35 min"], ["BR06MN7412", "58 min"]].map(([v, t]) => <div key={v} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid var(--line2)" }}><b className="mono">{v}</b><span className="muted">{t}</span></div>)}</Card>
    </>
  );
}
function Dispatcher() {
  return (
    <>
      {PENDING_LOADS.slice(0, 3).map((l) => <Card key={l.id} style={{ marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between" }}><b>{l.customer}</b>{l.urgent && <span className="chip r">Urgent</span>}</div><div className="muted">{l.from} → {l.to} · {l.mt} MT</div><div style={{ margin: "8px 0", fontSize: 12.5 }}>Best match <b className="mono">JH05BX1188</b> · 6.2 km · margin 28%</div><Big>Assign vehicle</Big></Card>)}
    </>
  );
}
function Maintenance() {
  const b = BREAKDOWNS[0];
  return (
    <>
      <Card style={{ marginBottom: 10, borderColor: "var(--red)" }}><span className="chip r">Critical · {b.id}</span><div style={{ fontSize: 18, fontWeight: 650, margin: "6px 0" }}>{b.vehicleId}</div><div className="muted">{b.issue} · {b.loc}</div><div style={{ marginTop: 10 }}><Big><Wrench size={16} /> Update repair status</Big></div></Card>
      <Card><div className="lbl" style={{ marginBottom: 6 }}>Today’s jobs</div>{[["JH01AB2245", "Scheduled service"], ["JH05CZ1182", "Injector check"], ["JH01AB2214", "Engine inspection"]].map(([v, t]) => <div key={v} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid var(--line2)" }}><b className="mono">{v}</b><span className="muted">{t}</span></div>)}</Card>
    </>
  );
}

const SCREENS = { "Driver": ["Driver · Sunil Yadav", <Driver key="d" />], "Hub manager": ["Hub · Ranchi", <Hub key="h" />], "Dispatcher": ["Dispatch", <Dispatcher key="x" />], "Maintenance": ["Workshop", <Maintenance key="m" />] };
export default function Mobile() {
  const [s, setS] = useState("Driver");
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(var(--map-grid) 1px, transparent 1px) 0 0/18px 18px, var(--map-bg)", display: "grid", gridTemplateColumns: "280px 1fr", gap: 30, padding: "28px 40px", alignItems: "start" }}>
      <div>
        <Link href="/command-center" className="faint" style={{ display: "inline-flex", gap: 6, alignItems: "center", marginBottom: 14 }}><ArrowLeft size={13} /> Back to FleetOps</Link>
        <h1 style={{ margin: "0 0 4px", fontSize: 24, letterSpacing: "-0.03em" }}>Field mobile</h1>
        <p className="muted" style={{ marginTop: 0 }}>One-hand, large-button workflows for people who aren’t at a desk. Minimal typing, camera for POD and receipts.</p>
        <div style={{ display: "grid", gap: 6, marginTop: 14 }}>{Object.keys(SCREENS).map((k) => <button key={k} className={"btn" + (s === k ? " pri" : "")} style={{ justifyContent: "flex-start", height: 38 }} onClick={() => setS(k)}><Truck size={14} /> {k}</button>)}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}><Phone_ title={SCREENS[s][0]}>{SCREENS[s][1]}</Phone_></div>
    </div>
  );
}
