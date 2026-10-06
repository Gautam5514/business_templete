"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { answer, SUGGESTED } from "@/lib/ai";

export default function Assistant() {
  const [msgs, setMsgs] = useState([]), [q, setQ] = useState(""), [busy, setBusy] = useState(false);
  const end = useRef(null);
  const ask = (text) => {
    if (!text.trim() || busy) return;
    setMsgs((m) => [...m, { me: true, text }]); setQ(""); setBusy(true);
    setTimeout(() => { setMsgs((m) => [...m, { me: false, ...answer(text) }]); setBusy(false); }, 650);
  };
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, busy]);
  return (
    <div className="page" style={{ maxWidth: 1180 }}>
      <div className="grid" style={{ gridTemplateColumns: "300px minmax(0,1fr)" }}>
        <div>
          <div className="ph" style={{ display: "block" }}><h1 style={{ display: "flex", gap: 8, alignItems: "center" }}><Sparkles size={22} style={{ color: "var(--accent)" }} /> Ask FieldDesk</h1><p>Plain-language answers from live jobs, technicians, AMC, stock and money.</p></div>
          <div className="lbl" style={{ marginBottom: 8 }}>Suggested</div>
          <div style={{ display: "grid", gap: 6 }}>{SUGGESTED.map((s) => <button key={s} className="btn" style={{ height: "auto", padding: "8px 10px", whiteSpace: "normal", textAlign: "left", justifyContent: "flex-start", lineHeight: 1.3 }} onClick={() => ask(s)}>{s}</button>)}</div>
        </div>
        <div className="panel" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", minHeight: 520 }}>
          <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "grid", gap: 14, alignContent: "start" }}>
            {!msgs.length && <div style={{ margin: "auto", textAlign: "center", padding: 40 }}><Sparkles size={28} style={{ color: "var(--accent)" }} /><div style={{ fontSize: 18, fontWeight: 600, margin: "10px 0 4px" }}>Which jobs need my attention right now?</div><div className="muted">Pick a suggested question or type your own.</div><button className="btn pri" style={{ marginTop: 14 }} onClick={() => ask("Which jobs need attention right now?")}>Ask this</button></div>}
            {msgs.map((m, i) => m.me ? <div key={i} className="bubble me">{m.text}</div> : (
              <div key={i} className="bubble" style={{ maxWidth: 720 }}>
                <h3 style={{ margin: "0 0 10px", fontSize: 17, letterSpacing: "-0.02em" }}>{m.title}</h3>
                <div style={{ display: "grid", gap: 2 }}>{m.items.map((it, k) => <Link key={k} href={it.href} className="feed-i" style={{ padding: "8px 6px", borderRadius: 6, borderBottom: 0 }}><b style={{ width: 24, color: "var(--ink3)" }}>{k + 1}.</b><div><b className={/^(JOB|AMC)/.test(it.id) ? "mono" : ""}>{it.id}</b>{it.head && <b> — {it.head}</b>}<div style={{ fontSize: 12.5 }} className="muted">{it.a}</div>{it.b && <div style={{ fontSize: 12.5 }} className="faint">{it.b}</div>}</div></Link>)}</div>
                {m.note && <div className="insight b" style={{ margin: "10px 0 0" }}><div><b>{m.note}</b></div></div>}
                {m.actions && <div style={{ marginTop: 10 }}>{m.actions.map(([l, h]) => <Link key={l} className="btn pri" href={h}>{l}</Link>)}</div>}
              </div>
            ))}
            {busy && <div className="bubble typing" style={{ width: 70 }}><i /><i /><i /></div>}
            <div ref={end} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(q); }} style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid var(--line)" }}>
            <input className="input" style={{ height: 42, fontSize: 14 }} placeholder="Ask anything about customers, jobs, technicians, AMC or revenue..." value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="btn pri" style={{ height: 42, width: 42, justifyContent: "center", padding: 0 }}><ArrowUp size={16} /></button>
          </form>
        </div>
      </div>
    </div>
  );
}
