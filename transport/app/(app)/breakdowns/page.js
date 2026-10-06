"use client";
import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { Chip, Insight, Kpis, PageHead, Panel, Plate } from "@/components/ui";
import { BREAKDOWNS, BD_FLOW } from "@/data/ops";
import { useApp } from "@/lib/store";

const sev = { Critical: "r", High: "a", Medium: "b", Low: "n" };
export default function Breakdowns() {
  const { notify } = useApp();
  const [sel, setSel] = useState(BREAKDOWNS[0].id);
  const b = BREAKDOWNS.find((x) => x.id === sel);
  return (
    <div className="page">
      <PageHead title="Breakdowns" sub="From first call to replacement vehicle — with the customer impact visible from minute one."><button className="btn pri" onClick={() => notify("Breakdown reported · fleet manager alerted")}>Report breakdown</button></PageHead>
      <Insight tone="r"><b>3 vehicles are broken down right now.</b> BD-1184 on TRP-9812 could delay the Bihar FMCG delivery by 3.2 hours — replacement vehicle <b className="mono">JH01CZ6212</b> is 24 km from Barhi.</Insight>
      <Kpis items={[{ label: "Active breakdowns", value: 3, tone: "r" }, { label: "This month", value: 9 }, { label: "Avg downtime", value: "3h 40m" }, { label: "Trips affected", value: 3, tone: "a" }, { label: "Repair cost (MTD)", value: "₹1.9L" }]} />
      <div className="grid" style={{ gridTemplateColumns: "400px minmax(0,1fr)", alignItems: "start" }}>
        <Panel title="Breakdowns" tight>
          {BREAKDOWNS.map((x) => (
            <div key={x.id} className="feed-i" style={{ flexDirection: "column", gap: 3, background: sel === x.id ? "var(--accent-soft)" : undefined }} onClick={() => setSel(x.id)}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><b className="mono">{x.id}</b><Chip tone={sev[x.severity]}>{x.severity}</Chip><span style={{ marginLeft: "auto" }}>{x.stage >= 8 ? <Chip tone="g">Closed</Chip> : <Chip tone="r" dot>Active</Chip>}</span></div>
              <div><Plate id={x.vehicleId} href={false} /> · {x.issue} · {x.loc}</div>
            </div>
          ))}
        </Panel>
        <Panel title={`${b.id} · ${b.issue}`} sub={`reported ${b.reported}`} actions={<Chip tone={sev[b.severity]}>{b.severity}</Chip>}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
            {[["Vehicle", <Plate key="p" id={b.vehicleId} />], ["Location", b.loc], ["Trip affected", b.tripId !== "—" ? <Link key="l" className="mono link" href={`/trips/${b.tripId}`}>{b.tripId}</Link> : "None"], ["Est. downtime", b.downtime]].map(([a, v]) => <div key={a}><div className="lbl">{a}</div><div style={{ fontWeight: 600, marginTop: 2 }}>{v}</div></div>)}
          </div>
          <div className="lbl" style={{ marginBottom: 10 }}>Breakdown flow</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 4 }}>
            {BD_FLOW.map((s, i) => { const done = i < b.stage, cur = i === b.stage - 1 && b.stage < 8; return (
              <div key={s} style={{ textAlign: "center" }}>
                <div style={{ height: 4, borderRadius: 2, background: done ? "var(--green)" : "var(--line)", marginBottom: 8 }} />
                <div style={{ width: 22, height: 22, borderRadius: "50%", margin: "0 auto 5px", display: "grid", placeItems: "center", background: done ? "var(--green)" : "var(--panel)", border: `2px solid ${done ? "var(--green)" : "var(--line)"}`, color: "#fff", boxShadow: cur ? "0 0 0 4px var(--green-soft)" : "none" }}>{done && <Check size={12} />}</div>
                <div style={{ fontSize: 11, color: done ? "var(--ink)" : "var(--ink3)" }}>{s}</div>
              </div>); })}
          </div>
          <div className="hr" />
          <dl className="kv"><dt>Mechanic</dt><dd>{b.mech}</dd><dt>Customer impact</dt><dd className={b.severity === "Critical" ? "neg" : ""}>{b.impact}</dd><dt>Replacement vehicle</dt><dd>{b.stage < 8 ? "JH01CZ6212 (24 km away) — recommended" : "Not needed"}</dd></dl>
          {b.stage < 8 && <div style={{ display: "flex", gap: 8, marginTop: 14 }}><button className="btn pri" onClick={() => notify("Replacement vehicle JH01CZ6212 dispatched · customer notified")}>Dispatch replacement</button><button className="btn" onClick={() => notify("Customer notified via WhatsApp")}>Notify customer</button></div>}
        </Panel>
      </div>
    </div>
  );
}
