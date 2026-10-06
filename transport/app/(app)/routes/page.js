"use client";
import { useState } from "react";
import FleetMap from "@/components/FleetMap";
import DataTable from "@/components/table";
import { Chip, Insight, PageHead, Panel, Plate } from "@/components/ui";
import { HBars } from "@/components/charts";
import { ROUTES } from "@/data/geo";
import { VEHICLES } from "@/data/fleet";
import { BACKHAUL } from "@/data/ops";
import { full, inr, num, pct } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function Routes() {
  const { notify } = useApp();
  const [sel, setSel] = useState(ROUTES[0]);
  const sorted = [...ROUTES].sort((a, b) => b.margin - a.margin);
  const best = ROUTES.find((r) => r.id === "R03"), worst = ROUTES.find((r) => r.id === "R02");
  const empties = [...VEHICLES].filter((v) => v.ownership !== "Attached").sort((a, b) => b.empty - a.empty).slice(0, 6);
  const cols = [
    { key: "route", label: "Route", render: (r) => <b>{r.from} → {r.to}</b>, sort: (r) => r.from + r.to, csv: (r) => `${r.from} -> ${r.to}` },
    { key: "km", label: "Distance", right: true, render: (r) => r.km + " km" }, { key: "std", label: "Standard Time", right: true },
    { key: "tolls", label: "Tolls", right: true }, { key: "fuel", label: "Avg Fuel", right: true, render: (r) => r.fuel + " L" },
    { key: "rev", label: "Avg Revenue", right: true, render: (r) => inr(r.rev) }, { key: "cost", label: "Avg Cost", right: true, render: (r) => inr(r.cost) },
    { key: "margin", label: "Margin", right: true, render: (r) => <b className={r.margin < 20 ? "neg" : r.margin > 30 ? "pos" : ""}>{pct(r.margin, 1)}</b> },
    { key: "trips", label: "Trips", right: true }, { key: "delay", label: "Delay Rate", right: true, render: (r) => <span className={r.delay > 14 ? "warn" : ""}>{r.delay}%</span> },
  ];
  return (
    <div className="page">
      <PageHead title="Routes" sub="Route economics: where the network earns, where it leaks, and where return loads can fix it."><button className="btn pri">Add route</button></PageHead>
      <Insight tone="r"><b>Patna → Ranchi earns only {pct(worst.margin, 1)}</b> versus {pct(best.margin, 1)} on Jamshedpur → Kolkata — low return load, higher toll and frequent empty kilometres. Fixing the empty leg could lift margin by ≈ ₹9K per trip.</Insight>
      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) 420px", marginBottom: 14 }}>
        <div style={{ position: "relative", minHeight: 360 }}><FleetMap vehicles={[]} fillParent fitRoute={sel} focusRoute={sel} cardAnchor={false} showAllRoutes={false} /></div>
        <Panel title={`${sel.from} → ${sel.to}`} sub={`${sel.km} km · ${sel.std}`}>
          <dl className="kv"><dt>Average revenue</dt><dd>{full(sel.rev)}</dd><dt>Average cost</dt><dd>{full(sel.cost)}</dd><dt className="tot">Average margin</dt><dd className="tot">{pct(sel.margin, 1)}</dd><dt>Delay rate</dt><dd>{sel.delay}%</dd><dt>Tolls</dt><dd>{sel.tolls} plazas</dd></dl>
          {sel.why && <p className="warn" style={{ marginBottom: 0 }}>Why it’s weak: {sel.why}</p>}
        </Panel>
      </div>
      <div className="grid g2" style={{ marginBottom: 14 }}>
        <Panel title="Route profitability" sub="margin %"><HBars items={[...sorted.slice(0, 3), ...sorted.slice(-3)].map((r) => ({ k: `${r.from.slice(0, 4)} → ${r.to.slice(0, 4)}`, v: +r.margin.toFixed(1), tone: r.margin < 20 ? "red" : "green" }))} fmt={(v) => v + "%"} /></Panel>
        <Panel title="Empty KM tracking" sub="worst owned vehicles · 30 days">
          <table className="tbl"><thead><tr><th>Vehicle</th><th className="r">Total KM</th><th className="r">Empty KM</th><th className="r">Empty %</th><th className="r">Avoidable cost</th></tr></thead><tbody>
            {empties.map((v) => { const km = v.id === "JH01DK4821" ? 5480 : v.trips30 * 310; const e = Math.round(km * v.empty / 100); return <tr key={v.id}><td><Plate id={v.id} /></td><td className="r">{num(km)}</td><td className="r">{num(e)}</td><td className="r"><b className={v.empty > 22 ? "neg" : "warn"}>{v.empty}%</b></td><td className="r">{inr(e * 30)}</td></tr>; })}
          </tbody></table>
        </Panel>
      </div>
      <Panel title="Backhaul opportunity" sub="AI recommendation" actions={<Chip tone="g">+{inr(BACKHAUL.extra)} profit</Chip>} style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <p style={{ margin: 0, flex: 1, minWidth: 280 }}>Vehicle <b className="mono">{BACKHAUL.vehicleId}</b> will unload in Patna at 5:30 PM. A return load is waiting: <b>{BACKHAUL.from} → {BACKHAUL.to}</b>, {BACKHAUL.customer}, {BACKHAUL.mt} MT, freight {full(BACKHAUL.freight)}.</p>
          <button className="btn pri" onClick={() => notify("Backhaul assigned to JH05BX1188")}>Assign Backhaul</button>
        </div>
      </Panel>
      <DataTable rows={ROUTES} cols={cols} title="Routes" onRow={setSel} views={[{ name: "All" }, { name: "Low margin", filter: (r) => r.margin < 25 }, { name: "High delay", filter: (r) => r.delay > 12 }]} />
    </div>
  );
}
