"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, User } from "lucide-react";
import { useApp } from "@/lib/store";
import { Avatar } from "@/components/ui";

const STATS = [["86", "requests today"], ["52", "technicians active"], ["92%", "within SLA"], ["₹16.8L", "outstanding"]];

export default function Login() {
  const router = useRouter();
  const { setRole } = useApp();
  const [user, setUser] = useState("vivek.sharma@primecare.in");
  const [pass, setPass] = useState("fielddesk@123");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    setBusy(true);
    setRole("owner");
    setTimeout(() => router.push("/command-center"), 700);
  };
  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)", background: "var(--bg)" }} className="login">
      <section style={{ background: "var(--nav)", color: "#e9ebee", padding: "44px 56px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }} viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <defs><pattern id="lg" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#1b2027" strokeWidth="1" /></pattern></defs>
          <rect width="600" height="800" fill="url(#lg)" />
          <path d="M60,640 Q200,520 300,560 T560,380" fill="none" stroke="#2a313b" strokeWidth="3" />
          <path d="M40,300 Q220,360 330,260 T580,200" fill="none" stroke="#2a313b" strokeWidth="3" />
          {[[300, 560, "#3dd598"], [180, 590, "#6aa0ff"], [430, 470, "#f0b43c"], [330, 262, "#ff6b6b"], [470, 230, "#6aa0ff"], [120, 330, "#3dd598"]].map(([x, y, c], i) => <g key={i}><circle cx={x} cy={y} r="14" fill={c} opacity="0.12" /><circle cx={x} cy={y} r="5" fill={c} /></g>)}
        </svg>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
          <div className="logo"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" /></svg></div>
          <b style={{ fontSize: 18, letterSpacing: "-0.02em" }}>FieldDesk</b>
        </div>
        <div style={{ position: "relative", marginTop: "auto", marginBottom: "auto", maxWidth: 520 }}>
          <h1 style={{ fontSize: 40, lineHeight: 1.1, letterSpacing: "-0.035em", margin: 0, fontWeight: 650 }}>Every customer. Every job. Every technician. Fully under control.</h1>
          <p style={{ color: "#8a92a0", fontSize: 15, marginTop: 16 }}>One control room for PrimeCare Service Solutions — Ranchi, Dhanbad, Jamshedpur and Patna.</p>
        </div>
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "#1b2027", border: "1px solid #1b2027", borderRadius: 10, overflow: "hidden" }}>
          {STATS.map(([v, l]) => <div key={l} style={{ background: "#0e1013", padding: "12px 14px" }}><div style={{ fontSize: 22, fontWeight: 640, letterSpacing: "-0.03em" }}>{v}</div><div style={{ fontSize: 11, color: "#6c727d" }}>{l}</div></div>)}
        </div>
      </section>
      <section style={{ display: "grid", placeItems: "center", padding: 32 }}>
        <form onSubmit={submit} style={{ width: "min(400px,100%)" }}>
          <div className="lbl" style={{ marginBottom: 6 }}>Welcome back</div>
          <h2 style={{ margin: "0 0 4px", fontSize: 28, letterSpacing: "-0.03em" }}>Sign in to FieldDesk</h2>
          <p className="muted" style={{ margin: "0 0 20px" }}>Demo credentials are pre-filled — just click sign in.</p>
          <div className="panel" style={{ padding: 12, display: "flex", gap: 10, alignItems: "center", marginBottom: 18, background: "var(--panel2)" }}>
            <Avatar name="Vivek Sharma" size={38} />
            <div><b>Vivek Sharma</b><div className="faint" style={{ fontSize: 12 }}>Managing Director · PrimeCare Service Solutions</div></div>
          </div>
          <label className="field" style={{ marginBottom: 12 }}><span>Username or email</span>
            <div style={{ position: "relative" }}><User size={15} style={{ position: "absolute", left: 11, top: 14, color: "var(--ink3)" }} /><input className="input" style={{ height: 42, paddingLeft: 34, fontSize: 14 }} value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" /></div>
          </label>
          <label className="field" style={{ marginBottom: 16 }}><span>Password</span>
            <div style={{ position: "relative" }}><Lock size={15} style={{ position: "absolute", left: 11, top: 14, color: "var(--ink3)" }} /><input className="input" type={show ? "text" : "password"} style={{ height: 42, paddingLeft: 34, paddingRight: 38, fontSize: 14 }} value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" />
              <button type="button" onClick={() => setShow(!show)} aria-label="Show password" style={{ position: "absolute", right: 8, top: 9, background: "none", border: 0, color: "var(--ink3)" }}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
          </label>
          <button className="btn pri" disabled={busy} style={{ width: "100%", height: 46, justifyContent: "center", fontSize: 14.5, borderRadius: 9 }} autoFocus>{busy ? "Signing in…" : <>Sign in as Vivek <ArrowRight size={16} /></>}</button>
          <p className="faint" style={{ fontSize: 12, textAlign: "center", marginTop: 16 }}>Demo environment · sample data only</p>
        </form>
      </section>
      <style>{`@media (max-width: 860px){ .login{ grid-template-columns: 1fr !important; } .login > section:first-child{ display:none !important; } }`}</style>
    </div>
  );
}
