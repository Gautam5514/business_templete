"use client";
import { use } from "react";
import { Check, Phone } from "lucide-react";
import TechMap from "@/components/TechMap";
import { Avatar, Chip } from "@/components/ui";
import { JOBS } from "@/data/ops";
import { techById, LOCALITIES, hhmm, NOW } from "@/data/core";
import { full } from "@/lib/format";

const STEPS = ["Request received", "Technician assigned", "On the way", "Arrived", "Work in progress", "Completed", "Invoice & payment"];
export default function Track({ params }) {
  const { id } = use(params);
  const j = JOBS.find((x) => x.id === id) || JOBS.find((x) => x.id === "JOB-2818");
  const t = techById(j.tech || "T01"), stage = 2;
  const route = [LOCALITIES.ranchi.Harmu, [420, 330], j.pos];
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", justifyContent: "center", padding: "24px 12px" }}>
      <div style={{ width: "min(460px,100%)", display: "grid", gap: 12, alignContent: "start" }}>
        <div style={{ textAlign: "center" }}><div className="lbl">PrimeCare Service · live tracking</div><h1 style={{ margin: "4px 0", fontSize: 24, letterSpacing: "-0.03em" }}>Your technician is on the way</h1></div>
        <div className="panel" style={{ padding: 14, display: "flex", gap: 12, alignItems: "center" }}><Avatar name={t.name} size={52} /><div style={{ flex: 1 }}><b style={{ fontSize: 16 }}>{t.name}</b><div className="muted">{t.title} · ★ {t.rating}</div></div><div style={{ textAlign: "right" }}><div className="big">18<small style={{ fontSize: 13 }}> min</small></div><div className="faint" style={{ fontSize: 11 }}>ETA {hhmm(NOW + 18)}</div></div></div>
        <div style={{ position: "relative", height: 240 }}><TechMap techs={[{ ...t, pos: LOCALITIES.ranchi.Harmu, status: "travelling" }]} jobs={[]} route={route} fillParent showLegend={false} initialZoom={1.8} selectedId={null} /></div>
        <div className="panel" style={{ padding: 14 }}>{STEPS.map((s, i) => <div key={s} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0", opacity: i > stage ? 0.45 : 1 }}><span style={{ width: 20, height: 20, borderRadius: "50%", display: "grid", placeItems: "center", background: i < stage ? "var(--green)" : "var(--grey-soft)", color: "#fff", border: i === stage ? "2px solid var(--accent)" : 0 }}>{i < stage ? <Check size={12} /> : ""}</span><span style={{ fontWeight: i === stage ? 650 : 400 }}>{s}</span></div>)}</div>
        <div className="panel" style={{ padding: 14 }}><div className="lbl" style={{ marginBottom: 6 }}>Job details</div><dl className="kv"><dt>Job</dt><dd className="mono">{j.id}</dd><dt>Service</dt><dd>{j.service}</dd><dt>Issue</dt><dd>{j.issue}</dd><dt>Estimate</dt><dd><Chip tone="n">Shared after diagnosis</Chip></dd><dt>Invoice</dt><dd className="faint">After completion</dd><dt>Payment</dt><dd className="faint">{j.pay}</dd></dl></div>
        <button className="btn" style={{ height: 46, justifyContent: "center" }}><Phone size={15} /> Call technician</button>
      </div>
    </div>
  );
}
