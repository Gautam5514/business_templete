"use client";
import Link from "next/link";
import { use } from "react";
import { notFound } from "next/navigation";
import { Camera, FileText } from "lucide-react";
import { Chip, Insight, Panel, Mono } from "@/components/ui";
import { Bars } from "@/components/charts";
import { assetById, custById } from "@/data/core";
import { full, inr } from "@/lib/format";

const HIST = {
  "AC-28941": [["06 Oct", "Breakdown — no cooling", "JOB-2841", 0, "In progress · estimate ₹29,854", "Compressor"], ["29 Sep", "Cooling complaint", "JOB-2688", 4000, "Gas leakage topped up", "R410A gas ×2.1 kg"], ["18 Sep", "Preventive maintenance + cooling complaint", "JOB-2602", 2700, "Capacitor replaced", "Capacitor 45µF"], ["02 Aug", "Compressor replacement", "JOB-2531", 18500, "Compressor replaced (warranty 12 mo)", "Compressor assembly"], ["12 Jul", "Cooling complaint", "JOB-2470", 3200, "Gas top-up", "R410A gas ×2.4 kg"], ["12 Mar 2023", "Installation", "JOB-0412", 0, "Commissioned", "—"]],
};
export default function Asset360({ params }) {
  const { id } = use(params);
  const a = assetById(id);
  if (!a) notFound();
  const c = custById(a.custId);
  const hist = HIST[a.id] || [["18 Sep", "Preventive maintenance", "JOB-2602", 0, "Cleaned, tested", "Filters"], ["02 Aug", "Service call", "JOB-2511", a.cost ? Math.round(a.cost * 0.6) : 900, "Fault rectified", "Consumables"], [a.installed, "Installation", "JOB-0412", 0, "Commissioned", "—"]];
  const total = a.id === "AC-28941" ? 28400 : a.cost;
  const rep = a.repeat >= 3;
  return (
    <div className="page">
      <div className="ph" style={{ alignItems: "flex-start" }}>
        <div className="grow"><div className="lbl" style={{ marginBottom: 4 }}>Asset 360°</div><h1 style={{ fontSize: 28 }} className="mono">{a.id}</h1><p style={{ fontSize: 15 }}><b style={{ color: "var(--ink)" }}>{a.brand} {a.model}</b> · {c?.name} — {a.loc}</p></div>
        <Link href={`/customers/${a.custId}`} className="btn">Customer 360°</Link>
      </div>
      <div className="kpis" style={{ gridTemplateColumns: "repeat(7, minmax(0,1fr))" }}>
        {[["Capacity", a.capacity], ["Installed", a.installed], ["Warranty", a.warranty], ["AMC", a.amc], ["Last service", a.last], ["Next PM", a.next], ["Condition", a.cond]].map(([l, v]) => <div key={l} className="kpi"><div className="lbl">{l}</div><div className="v" style={{ fontSize: 17 }}>{v}</div></div>)}
      </div>
      {rep && (
        <div className="panel" style={{ marginBottom: 14, borderLeft: "3px solid var(--red)", padding: 16, display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr) auto", gap: 20, alignItems: "center" }}>
          <div><div className="lbl" style={{ color: "var(--red)" }}>Repeat failure detected · AI insight</div><div style={{ fontSize: 17, fontWeight: 600, margin: "4px 0", letterSpacing: "-0.01em" }}>This AC has had {a.repeat} cooling complaints in 90 days.</div><div className="muted">Likely issue: <b style={{ color: "var(--ink)" }}>Compressor performance</b> — the compressor replaced on 02 Aug is still short-cycling. Evaluate replacement instead of continued repair.</div></div>
          <dl className="kv"><dt>Total service cost</dt><dd className="neg">{full(total)}</dd><dt>Downtime (90d)</dt><dd>31 hours</dd><dt>Projected repairs / 12m</dt><dd>₹1.1L+</dd><dt>Replacement estimate</dt><dd>₹2.1L</dd></dl>
          <div style={{ display: "grid", gap: 6 }}><button className="btn pri">Create replacement estimate</button><button className="btn">Escalate to senior technician</button></div>
        </div>
      )}
      <div className="grid g-main">
        <div style={{ display: "grid", gap: 14, alignContent: "start", minWidth: 0 }}>
          <Panel title="Service history" sub={`${hist.length} events`}>
            <div className="tl">{hist.map(([d, t, j, cost, note, part], i) => <div key={i} className={`tl-i ${i === 0 && a.id === "AC-28941" ? "now" : "done"}`}><div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}><b className="mono" style={{ minWidth: 70 }}>{d}</b><b style={{ fontWeight: 600 }}>{t}</b><Link href={`/jobs/${j}`} className="link mono">{j}</Link>{cost > 0 && <Chip tone="a">{full(cost)}</Chip>}</div><div className="muted" style={{ fontSize: 12.5 }}>{note} · Part: {part}</div></div>)}</div>
          </Panel>
          <Panel title="Cost per service event" sub="₹ · last 90 days"><Bars data={hist.filter((h) => h[3] > 0 || true).slice(0, 5).reverse().map((h) => ({ k: h[0], v: h[3], color: h[3] > 10000 ? "red" : "ink" }))} height={150} fmt={(v) => (v ? inr(v) : "—")} /></Panel>
        </div>
        <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
          <Panel title="Maintenance summary"><dl className="kv"><dt>Total maintenance cost</dt><dd>{full(total)}</dd><dt>Parts replaced</dt><dd>{rep ? "Compressor, capacitor, gas ×2" : "Consumables"}</dd><dt>Recurring issues</dt><dd>{rep ? "Cooling failure" : a.repeat ? "Intermittent fault" : "None"}</dd><dt>Downtime</dt><dd>{rep ? "31 h / 90 days" : "< 4 h"}</dd><dt>Serial number</dt><dd className="mono">{a.serial}</dd></dl></Panel>
          <Panel title="Photos"><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>{["Nameplate", "Before", "After", "Compressor", "Wiring", "Outdoor unit"].map((x) => <div key={x} className="drop" style={{ height: 66, display: "grid", placeItems: "center", fontSize: 11, color: "var(--ink3)" }}><div style={{ textAlign: "center" }}><Camera size={14} style={{ margin: "0 auto 2px" }} />{x}</div></div>)}</div></Panel>
          <Panel title="Manuals & documents" tight>{[`${a.brand} ${a.model} — service manual`, "Warranty card", "Installation commissioning report"].map((d) => <div key={d} className="feed-i"><FileText size={14} className="faint" /><span style={{ flex: 1 }}>{d}</span><span className="link">View</span></div>)}</Panel>
        </div>
      </div>
    </div>
  );
}
