"use client";
import { useMemo, useState } from "react";
import FleetMap from "@/components/FleetMap";
import { FleetStrip } from "@/components/blocks";
import { Chip, VehChip } from "@/components/ui";
import { VEHICLES, DRIVERS, CUSTOMERS, driverById, tripById } from "@/data/fleet";
import { matchFleet, markerTone } from "@/data/ops";
import { HUBS, ROUTES } from "@/data/geo";

const types = [...new Set(VEHICLES.map((v) => v.type))];
export default function LiveFleet() {
  const [strip, setStrip] = useState(null);
  const [sel, setSel] = useState("JH01DK4821");
  const [f, setF] = useState({ q: "", customer: "", status: "", driver: "", hub: "", type: "", delay: "", route: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const list = useMemo(() => VEHICLES.filter((v) => {
    const t = v.tripId ? tripById(v.tripId) : null;
    if (strip && !matchFleet(v, strip)) return false;
    if (f.q && !(v.id + " " + (t?.id || "")).toLowerCase().includes(f.q.toLowerCase())) return false;
    if (f.customer && t?.customerId !== f.customer) return false;
    if (f.status && t?.status !== f.status) return false;
    if (f.driver && v.driverId !== f.driver) return false;
    if (f.hub && v.hub !== f.hub) return false;
    if (f.type && v.type !== f.type) return false;
    if (f.delay === "delayed" && !(t?.delay > 30)) return false;
    if (f.delay === "ontime" && t?.delay > 0) return false;
    if (f.route && t?.routeId !== f.route) return false;
    return true;
  }), [strip, f]);

  const S = (k, label, opts) => (
    <select className="select" style={{ width: 138, height: 30 }} value={f[k]} onChange={set(k)}><option value="">{label}</option>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
  );
  return (
    <div className="page flush" style={{ height: "calc(100vh - 56px)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 16px 8px", display: "grid", gap: 10 }}>
        <FleetStrip active={strip} onPick={setStrip} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input className="input" style={{ width: 190, height: 30 }} placeholder="Vehicle or trip no." value={f.q} onChange={set("q")} />
          {S("customer", "Customer", CUSTOMERS.slice(0, 12).map((c) => [c.id, c.short]))}
          {S("status", "Trip status", [["transit", "In transit"], ["delayed", "Delayed"], ["loading", "Loading"], ["athub", "At hub"], ["ofd", "Out for delivery"], ["breakdown", "Breakdown"]])}
          {S("driver", "Driver", DRIVERS.slice(0, 40).map((d) => [d.id, d.name]))}
          {S("hub", "Hub", HUBS.map((h) => [h.name, h.name]))}
          {S("type", "Vehicle type", types.map((t) => [t, t]))}
          {S("delay", "Delay", [["delayed", "Delayed > 30m"], ["ontime", "On time"]])}
          {S("route", "Route", ROUTES.slice(0, 8).map((r) => [r.id, `${r.from} → ${r.to}`]))}
          <span style={{ flex: 1 }} />
          <span className="live-pill"><i className="dot g" /> {list.length} vehicles · updated 12 s ago</span>
        </div>
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "minmax(0,1fr) 330px", gap: 12, padding: "0 16px 16px", minHeight: 0 }}>
        <div style={{ position: "relative", minHeight: 0 }}><FleetMap vehicles={list} selectedId={sel} onSelect={setSel} fillParent /></div>
        <div className="panel" style={{ overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div className="panel-h"><h3>Vehicles</h3><span className="sub">{list.length} shown</span></div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {list.slice(0, 80).map((v) => {
              const t = v.tripId ? tripById(v.tripId) : null;
              return (
                <div key={v.id} className="feed-i" style={{ background: v.id === sel ? "var(--accent-soft)" : undefined, flexDirection: "column", gap: 3, padding: "9px 12px" }} onClick={() => setSel(v.id)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><i className={"dot " + markerTone(v)} /><b className="mono">{v.id}</b><span style={{ marginLeft: "auto" }}><VehChip s={v.status} sub={v.sub} /></span></div>
                  <div className="faint" style={{ fontSize: 12 }}>{t ? `${t.id} · ${t.from} → ${t.to}` : "No active trip"} · {driverById(v.driverId)?.name}</div>
                  <div className="faint" style={{ fontSize: 11.5 }}>{v.loc} · {v.speed} km/h · {v.last}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
