"use client";
import { Chip, Insight, Kpis, PageHead, Panel, Stars } from "@/components/ui";
import { HBars, LineChart } from "@/components/charts";
import { FEEDBACK, MONTHS, SERIES } from "@/data/ops";
import { TECHS } from "@/data/core";

const ESC = ["Supervisor review", "Priority escalation", "Senior technician", "Resolution", "Customer confirmation"];
export default function Feedback() {
  const top = [...TECHS].sort((a, b) => b.rating - a.rating).slice(0, 5);
  return (
    <div className="page">
      <PageHead title="Customer Feedback" sub="Rating requested automatically after every completed job — low scores escalate on their own." />
      <Insight tone="r"><b>Gupta Office rated 2★ for a repeat gas-leakage issue.</b> The escalation workflow is already at Senior technician; resolve before they churn (₹1.8L lifetime).</Insight>
      <Kpis items={[{ label: "Average rating", value: "★ 4.6", tone: "g" }, { label: "NPS", value: "58", hint: "▲ 4 vs last quarter" }, { label: "Positive (4–5★)", value: "88%" }, { label: "Negative (1–2★)", value: "4%", tone: "r" }, { label: "Response rate", value: "63%" }]} />
      <div className="grid g3" style={{ marginBottom: 14 }}>
        <Panel title="Rating trend"><LineChart labels={MONTHS} series={[{ name: "CSAT", data: SERIES.csat, color: "green" }]} fmt={(v) => v} min={4.1} /></Panel>
        <Panel title="Top technicians"><HBars items={top.map((t) => ({ k: t.name, v: t.rating }))} fmt={(v) => v.toFixed(1)} tone="green" max={5} /></Panel>
        <Panel title="Common complaints"><HBars items={[["Arrived late", 34], ["Repeat visit needed", 28], ["Part delay", 21], ["Poor communication", 12], ["Pricing", 9]].map(([k, v]) => ({ k, v }))} tone="amber" /></Panel>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) 420px" }}>
        <Panel title="Recent responses" tight>{FEEDBACK.map((f, i) => <div key={i} className="feed-i" style={{ display: "block" }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><Stars v={f.overall} /><b>{f.customer}</b><span className="faint">· {f.tech}</span><span style={{ flex: 1 }} /><Chip tone={f.nps >= 9 ? "g" : f.nps >= 7 ? "n" : "r"}>NPS {f.nps}</Chip></div><div style={{ margin: "4px 0", fontSize: 12 }} className="muted">Behaviour {f.behaviour} · Quality {f.quality} · Timeliness {f.timeliness}</div><div>“{f.comment}”</div></div>)}</Panel>
        <Panel title="Complaint escalation" sub="Gupta Office · JOB-2776">
          <div className="tl">{ESC.map((s, i) => <div key={s} className={`tl-i ${i < 2 ? "done" : i === 2 ? "now" : "todo"}`}><b style={{ fontWeight: 600 }}>{s}</b><div className="faint" style={{ fontSize: 12 }}>{["Anil Dubey · 11:22 AM", "Raised to High · 11:40 AM", "Pankaj Kumar assigned · due 04:00 PM", "Root cause + fix", "Customer call-back"][i]}</div></div>)}</div>
          <div className="muted" style={{ fontSize: 12.5 }}>Triggered by: rating ≤ 2★ and repeat issue within 30 days.</div>
        </Panel>
      </div>
    </div>
  );
}
