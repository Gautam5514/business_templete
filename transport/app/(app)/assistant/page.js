"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { Panel } from "@/components/ui";
import { MorningBrief } from "@/components/blocks";
import { answer, PROMPTS } from "@/lib/ai";

function AnswerView({ a }) {
  return (
    <div>
      <h3 style={{ margin: "0 0 12px", fontSize: 17, letterSpacing: "-0.02em" }}>{a.head}</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {a.items?.map((it, i) => (
          <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 9, padding: "10px 12px", background: "var(--panel)" }}>
            <div style={{ fontWeight: 650, marginBottom: 6 }}>{it.link ? <Link href={it.link} className="link">{it.title}</Link> : it.title}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 18px", fontSize: 12.5 }}>{it.rows?.map(([k, v]) => <span key={k}><span className="faint">{k}: </span><b style={{ fontWeight: 600 }}>{v}</b></span>)}</div>
            {it.bullets && <div style={{ marginTop: 8 }}><div className="lbl" style={{ marginBottom: 3 }}>Primary reasons</div><ul style={{ margin: 0, paddingLeft: 16 }}>{it.bullets.map((b) => <li key={b}>{b}</li>)}</ul></div>}
            {it.action && <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 6, background: "var(--accent-soft)", fontSize: 12.5 }}><b>Recommended action:</b> {it.action}</div>}
          </div>
        ))}
      </div>
      {a.action && <div style={{ marginTop: 10, padding: "6px 10px", borderRadius: 6, background: "var(--accent-soft)", fontSize: 12.5 }}><b>Recommended action:</b> {a.action}</div>}
      {a.foot && <p className="muted" style={{ margin: "10px 0 0" }}>{a.foot}</p>}
    </div>
  );
}

export default function Assistant() {
  const [msgs, setMsgs] = useState([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [brief, setBrief] = useState(false);
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);
  const ask = (text) => {
    if (!text.trim() || busy) return;
    setMsgs((m) => [...m, { q: text }]); setQ(""); setBusy(true);
    setTimeout(() => { setMsgs((m) => [...m, { a: answer(text) }]); setBusy(false); }, 800);
  };
  return (
    <div className="page" style={{ maxWidth: 1100 }}>
      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) 300px", alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span className="logo" style={{ background: "var(--ink)", color: "var(--bg)" }}><Sparkles size={15} /></span>
            <div><h1 style={{ margin: 0, fontSize: 24, letterSpacing: "-0.03em" }}>Ask FleetOps</h1><div className="muted">Answers come from live trips, vehicles, drivers, fuel and finance — with the reason, not just the number.</div></div>
          </div>
          <div style={{ minHeight: 360, display: "grid", gap: 16, alignContent: "start", marginBottom: 14 }}>
            {!msgs.length && (
              <Panel title="Try asking">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{PROMPTS.map((p) => <button key={p} className="btn" onClick={() => ask(p)}>{p}</button>)}</div>
              </Panel>
            )}
            {msgs.map((m, i) => m.q ? (
              <div key={i} style={{ justifySelf: "end", background: "var(--ink)", color: "var(--bg)", padding: "8px 14px", borderRadius: "14px 14px 3px 14px", maxWidth: "80%" }}>{m.q}</div>
            ) : (
              <div key={i} className="panel" style={{ padding: 16 }}><AnswerView a={m.a} /></div>
            ))}
            {busy && <div className="faint" style={{ display: "flex", gap: 6, alignItems: "center" }}><Sparkles size={14} /> Analysing trips, vehicles and finance…</div>}
            <div ref={end} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(q); }} style={{ position: "sticky", bottom: 16, display: "flex", gap: 8, background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 12, padding: 8, boxShadow: "var(--shadow)" }}>
            <input className="input" style={{ border: 0, height: 38, fontSize: 14 }} placeholder="Ask anything about trips, vehicles, drivers, fuel or money..." value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="btn pri" style={{ height: 38 }} type="submit"><ArrowUp size={15} /></button>
          </form>
          {!!msgs.length && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>{PROMPTS.slice(0, 6).map((p) => <button key={p} className="btn sm ghost" onClick={() => ask(p)}>{p}</button>)}</div>}
        </div>
        <Panel title="Owner morning brief" sub="Tue, 06 Oct">
          <div style={{ display: "grid", gap: 8, fontSize: 12.5 }}>
            {[["Fleet", "72 running · 31 idle · 3 breakdowns"], ["Deliveries", "18 due · 2 at risk · 1 delayed"], ["Money", "₹24.8L billing · ₹8.6L collection · ₹32.8L overdue"], ["POD", "17 pending · ₹18.4L blocked"], ["Maintenance", "6 due this week"], ["Profitability", "3 vehicles below target margin"]].map(([a, b]) => <div key={a}><div className="lbl">{a}</div><div>{b}</div></div>)}
          </div>
          <button className="btn pri" style={{ marginTop: 12, width: "100%", justifyContent: "center" }} onClick={() => setBrief(true)}>Open full brief</button>
        </Panel>
      </div>
      <MorningBrief open={brief} onClose={() => setBrief(false)} />
    </div>
  );
}
