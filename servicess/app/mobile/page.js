"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Camera, Check, ChevronLeft, MapPin, Navigation, Phone, WifiOff, Wrench, CreditCard, PenLine, FileText } from "lucide-react";
import { useApp } from "@/lib/store";
import SignaturePad from "@/components/SignaturePad";
import { Chip } from "@/components/ui";

const ACTIONS = ["Start Travel", "Arrived", "Start Diagnosis", "Create Estimate", "Start Work", "Complete Job", "Collect Payment"];
const Frame = ({ children }) => (
  <div style={{ width: 392, height: 806, borderRadius: 46, background: "#0b0d10", padding: 11, boxShadow: "0 40px 80px -30px rgba(0,0,0,.55), 0 0 0 1.5px #2a2f38", flex: "none" }}>
    <div style={{ width: "100%", height: "100%", borderRadius: 36, background: "var(--bg)", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ height: 34, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 22px 0", fontSize: 12, fontWeight: 600 }}><span>1:16</span><span style={{ width: 90, height: 22, background: "#0b0d10", borderRadius: 14, marginTop: -2 }} /><span>5G ▮▮▮</span></div>
      {children}
    </div>
  </div>
);
const Head = ({ title, back, go }) => <div style={{ padding: "6px 14px 10px", display: "flex", alignItems: "center", gap: 8 }}>{back && <button className="iconbtn" onClick={() => go(back)}><ChevronLeft size={16} /></button>}<b style={{ fontSize: 17, letterSpacing: "-0.02em" }}>{title}</b><span style={{ flex: 1 }} /><span className="chip n" title="Offline mode placeholder"><WifiOff size={11} /> Sync on</span></div>;
const Card = ({ children, style }) => <div className="panel" style={{ padding: 14, ...style }}>{children}</div>;
const Big = ({ children, onClick, tone, disabled }) => <button disabled={disabled} onClick={onClick} style={{ width: "100%", height: 58, borderRadius: 14, border: 0, fontSize: 16, fontWeight: 650, background: disabled ? "var(--grey-soft)" : tone === "g" ? "var(--green)" : "var(--ink)", color: disabled ? "var(--ink3)" : tone === "g" ? "#fff" : "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{children}</button>;

export default function Mobile() {
  const { notify } = useApp();
  const [view, setView] = useState("home"), [step, setStep] = useState(2), [signed, setSigned] = useState(false), [mode, setMode] = useState("UPI"), [photos, setPhotos] = useState(0);
  const adv = () => { notify(`${ACTIONS[step]} · logged with GPS & time`); setStep((s) => Math.min(ACTIONS.length, s + 1)); };
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(var(--map-grid) 1px, transparent 1px) 0 0/18px 18px, var(--map-bg)", display: "grid", gridTemplateColumns: "300px 1fr", gap: 30, padding: "28px 40px", alignItems: "start" }}>
      <div>
        <Link href="/command-center" className="faint" style={{ display: "inline-flex", gap: 6, alignItems: "center", marginBottom: 14 }}><ArrowLeft size={13} /> Back to FieldDesk</Link>
        <h1 style={{ margin: "0 0 4px", fontSize: 24, letterSpacing: "-0.03em" }}>Technician app</h1>
        <p className="muted" style={{ marginTop: 0 }}>One-hand, large-button workflow for Rohit Kumar. Minimal typing, camera for photos, customer signature and on-site payment.</p>
        <div style={{ display: "grid", gap: 6, marginTop: 14 }}>{[["home", "Home · today’s jobs"], ["job", "Current job"], ["diagnosis", "Diagnosis"], ["estimate", "Estimate"], ["complete", "Complete & sign"], ["payment", "Collect payment"]].map(([k, l]) => <button key={k} className={"btn" + (view === k ? " pri" : "")} style={{ justifyContent: "flex-start", height: 38 }} onClick={() => setView(k)}><Wrench size={14} /> {l}</button>)}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Frame>
          {view === "home" && <><Head title="Today · Rohit" go={setView} /><div style={{ flex: 1, overflowY: "auto", padding: "0 14px 16px", display: "grid", gap: 10, alignContent: "start" }}>
            <Card style={{ borderColor: "var(--accent)" }}><div className="lbl">Current job · in progress</div><div style={{ fontSize: 20, fontWeight: 650, letterSpacing: "-0.03em", margin: "4px 0" }}>Sharma Residence</div><div className="muted">AC Repair · Morabadi</div><div style={{ margin: "10px 0" }}><Chip tone="a" dot>Finishing in 18 min</Chip></div><Big onClick={() => setView("job")}>Open job</Big></Card>
            <Card><div className="lbl">Next job · 11:00</div><b style={{ fontSize: 16 }}>Apex Mall — Lalpur</b><div className="muted">AMC visit · Food Court AC</div><div style={{ display: "flex", gap: 8, marginTop: 10 }}><span className="chip n"><Navigation size={11} /> 4.8 km · 14 min</span><Chip tone="b">AMC</Chip></div></Card>
            <Card><div className="lbl" style={{ marginBottom: 6 }}>Today’s jobs · 5</div>{[["Sharma Residence", "Morabadi", "In progress"], ["Apex Mall", "Lalpur", "Next"], ["City Hospital", "Harmu", "13:30"], ["Gupta Office", "Doranda", "15:00"], ["Royal Villa", "Kokar", "16:30"]].map(([c, l, s], i) => <div key={c} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderTop: i ? "1px solid var(--line2)" : 0 }}><div><b>{c}</b><div className="faint" style={{ fontSize: 12 }}>{l}</div></div><Chip tone={i === 0 ? "b" : "n"}>{s}</Chip></div>)}</Card>
          </div></>}
          {view === "job" && <><Head title="JOB-2818" back="home" go={setView} /><div style={{ flex: 1, overflowY: "auto", padding: "0 14px 16px", display: "grid", gap: 10, alignContent: "start" }}>
            <Card><div className="lbl">Customer</div><div style={{ fontSize: 20, fontWeight: 650, letterSpacing: "-0.03em" }}>Sharma Residence</div><div className="muted" style={{ marginTop: 4 }}><MapPin size={12} style={{ display: "inline" }} /> B-14, Morabadi Road, Ranchi</div><div style={{ display: "flex", gap: 8, marginTop: 10 }}><button className="btn" style={{ flex: 1, height: 44, justifyContent: "center", borderRadius: 12 }}><Phone size={15} /> Call</button><button className="btn" style={{ flex: 1, height: 44, justifyContent: "center", borderRadius: 12 }}><Navigation size={15} /> Directions</button></div></Card>
            <Card><dl className="kv"><dt>Issue</dt><dd>Cooling failure — bedroom</dd><dt>Asset</dt><dd>Daikin Split 1.5T</dd><dt>Last service</dt><dd>12 Aug (gas top-up)</dd><dt>Required parts</dt><dd>Capacitor, R32 gas</dd></dl></Card>
            <Card><div className="lbl" style={{ marginBottom: 8 }}>Job steps</div>{ACTIONS.map((a, i) => <div key={a} style={{ display: "flex", gap: 10, alignItems: "center", padding: "5px 0", opacity: i > step ? 0.45 : 1 }}><span style={{ width: 20, height: 20, borderRadius: "50%", display: "grid", placeItems: "center", background: i < step ? "var(--green)" : "var(--grey-soft)", color: "#fff", border: i === step ? "2px solid var(--accent)" : 0 }}>{i < step ? <Check size={12} /> : ""}</span><span style={{ fontWeight: i === step ? 650 : 400 }}>{a}</span></div>)}</Card>
            {step < ACTIONS.length ? <Big tone="g" onClick={adv}><Navigation size={18} /> {ACTIONS[step]}</Big> : <Card style={{ textAlign: "center" }}><Check className="pos" style={{ margin: "0 auto 4px" }} /><b>Job closed</b></Card>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><button className="btn" style={{ height: 48, justifyContent: "center", borderRadius: 12 }} onClick={() => notify("Part request sent to supervisor")}>Request Part</button><label className="btn" style={{ height: 48, justifyContent: "center", borderRadius: 12, cursor: "pointer" }}><Camera size={15} /> Upload Photos {photos > 0 && `(${photos})`}<input type="file" accept="image/*" capture="environment" hidden onChange={() => setPhotos((p) => p + 1)} /></label></div>
          </div></>}
          {view === "diagnosis" && <><Head title="Diagnosis" back="job" go={setView} /><div style={{ flex: 1, overflowY: "auto", padding: "0 14px 16px", display: "grid", gap: 12, alignContent: "start" }}>
            {[["Issue found", ["Compressor not starting", "Gas leakage", "Capacitor failure", "PCB fault"]], ["Root cause", ["Capacitor burnout", "Pipe joint leak", "Voltage fluctuation"]], ["Recommended repair", ["Replace capacitor", "Gas refill + leak repair", "Replace compressor"]]].map(([l, o]) => <div key={l}><div className="lbl" style={{ marginBottom: 6 }}>{l}</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{o.map((x, i) => <button key={x} className={"btn" + (i === 0 ? " pri" : "")} style={{ borderRadius: 20, height: 36 }}>{x}</button>)}</div></div>)}
            <div className="grid g2"><div><div className="lbl">Est. time</div><input className="input" defaultValue="1h 30m" style={{ height: 44 }} /></div><div><div className="lbl">Labour (₹)</div><input className="input" defaultValue="2800" style={{ height: 44 }} /></div></div>
            <label className="drop" style={{ display: "grid", placeItems: "center", height: 80, cursor: "pointer", color: "var(--ink2)" }}><div style={{ textAlign: "center" }}><Camera size={20} style={{ margin: "0 auto 4px" }} />Add photos<input type="file" accept="image/*" capture="environment" hidden /></div></label>
            <Big onClick={() => { setView("estimate"); }}>Continue to estimate</Big>
          </div></>}
          {view === "estimate" && <><Head title="Estimate" back="diagnosis" go={setView} /><div style={{ flex: 1, overflowY: "auto", padding: "0 14px 16px", display: "grid", gap: 12, alignContent: "start" }}>
            <Card><div className="lbl">JOB-2841 · Compressor Replacement</div><dl className="kv" style={{ marginTop: 8 }}><dt>Part</dt><dd>₹18,500</dd><dt>Labour</dt><dd>₹2,800</dd><dt>Gas refill</dt><dd>₹3,200</dd><dt>Visit charge</dt><dd>₹800</dd><dt>GST</dt><dd>₹4,554</dd><dt className="tot">Total</dt><dd className="tot">₹29,854</dd></dl></Card>
            <Big onClick={() => { notify("Estimate sent to customer on WhatsApp"); setView("job"); }}><FileText size={18} /> Send estimate</Big>
          </div></>}
          {view === "complete" && <><Head title="Complete job" back="job" go={setView} /><div style={{ flex: 1, overflowY: "auto", padding: "0 14px 16px", display: "grid", gap: 12, alignContent: "start" }}>
            <Card><div className="lbl">Work summary</div><div style={{ margin: "6px 0" }}>Capacitor replaced, gas topped up, test run 20 min — cooling restored.</div><div className="faint" style={{ fontSize: 12 }}>Parts: capacitor ×1, R32 gas 0.8 kg (auto-deducted from van)</div></Card>
            <div><div className="lbl" style={{ marginBottom: 6 }}>Customer signature</div><SignaturePad onChange={setSigned} /></div>
            <Big tone="g" disabled={!signed} onClick={() => { notify("Job completed · service report sent to customer"); setView("payment"); }}><PenLine size={18} /> Complete & sign off</Big>
          </div></>}
          {view === "payment" && <><Head title="Collect payment" back="job" go={setView} /><div style={{ flex: 1, overflowY: "auto", padding: "0 14px 16px", display: "grid", gap: 12, alignContent: "start" }}>
            <Card style={{ textAlign: "center" }}><div className="lbl">Amount due</div><div style={{ fontSize: 40, fontWeight: 650, letterSpacing: "-0.04em" }}>₹6,800</div></Card>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{["Cash", "UPI", "Card", "Credit"].map((m) => <button key={m} className={"btn" + (mode === m ? " pri" : "")} style={{ height: 56, justifyContent: "center", borderRadius: 14, fontSize: 15 }} onClick={() => setMode(m)}>{m}</button>)}</div>
            <Big tone="g" onClick={() => notify(`₹6,800 received via ${mode} · digital receipt sent`)}><CreditCard size={18} /> Collect ₹6,800 · {mode}</Big>
          </div></>}
        </Frame>
      </div>
    </div>
  );
}
