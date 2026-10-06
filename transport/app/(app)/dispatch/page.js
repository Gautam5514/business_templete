"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Fuel, GripVertical, Sparkles, Wrench } from "lucide-react";
import { Chip, Insight, PageHead, Panel, Plate, Prog } from "@/components/ui";
import { PENDING_LOADS, DISPATCH_VEHICLES, BACKHAUL } from "@/data/ops";
import { CITIES } from "@/data/geo";
import { full, inr } from "@/lib/format";
import { useApp } from "@/lib/store";

const km = (a, b) => { const [x1, y1] = CITIES[a] || CITIES.Ranchi, [x2, y2] = CITIES[b] || CITIES.Ranchi; return Math.hypot((x1 - x2) * 102, (y1 - y2) * 111) * 1.15; };
function rank(load) {
  return DISPATCH_VEHICLES.map((v) => {
    if (load.id === "L-4411") return v;
    const dist = +km(v.loc, load.from).toFixed(1);
    const fitOk = v.type === load.vtype;
    const margin = Math.max(6, Math.round(v.margin - dist * 0.03 - (fitOk ? 0 : 5) + (load.freight > 50000 ? 2 : 0)));
    return { ...v, dist, margin, fit: fitOk ? (dist < 40 ? "Excellent" : "Good") : "Fair", risk: v.nextMaint < 0 ? "High" : v.nextMaint < 1600 ? "Medium" : "Low" };
  }).sort((a, b) => b.margin - a.margin);
}

export default function Dispatch() {
  const { notify } = useApp();
  const [loads, setLoads] = useState(PENDING_LOADS.map((l) => ({ ...l, veh: null })));
  const [sel, setSel] = useState("L-4411");
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);
  const [back, setBack] = useState(false);
  const load = loads.find((l) => l.id === sel);
  const ranked = rank(load);
  const used = new Set(loads.map((l) => l.veh).filter(Boolean));

  const assign = (loadId, vid) => {
    setLoads((ls) => ls.map((l) => (l.id === loadId ? { ...l, veh: vid } : l)));
    notify(`${vid} assigned to ${loadId} · driver notified on mobile app`);
  };
  const pending = loads.filter((l) => !l.veh);

  return (
    <div className="page">
      <PageHead title="Dispatch Planning" sub="Drag a vehicle onto a load — or let FleetOps recommend the best match on distance, fit, driver, maintenance risk and margin."><button className="btn">Auto-plan all</button></PageHead>
      <Insight tone="b"><b>{pending.length} loads waiting</b>, {inr(pending.reduce((a, l) => a + l.freight, 0))} of freight to dispatch. <b>{DISPATCH_VEHICLES.length - used.size} vehicles</b> are free in the next 2 hours — assigning the best matches adds ≈ 6 points of margin versus nearest-first dispatch.</Insight>

      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr) 360px", alignItems: "start" }}>
        <Panel title="Pending loads" sub={`${pending.length} unassigned`} tight>
          {loads.map((l) => (
            <div key={l.id} className={"feed-i drop" + (over === l.id ? " over" : "")} style={{ margin: 8, border: `1.5px ${l.veh ? "solid var(--green)" : sel === l.id ? "solid var(--accent)" : "dashed var(--line)"}`, borderRadius: 9, flexDirection: "column", gap: 4, background: l.veh ? "var(--green-soft)" : undefined }}
              onClick={() => setSel(l.id)} onDragOver={(e) => { e.preventDefault(); setOver(l.id); }} onDragLeave={() => setOver(null)} onDrop={() => { setOver(null); if (drag) assign(l.id, drag); setDrag(null); setSel(l.id); }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <b>{l.customer}</b>{l.urgent && <Chip tone="r">Urgent</Chip>}<span style={{ marginLeft: "auto", fontWeight: 650 }}>{full(l.freight)}</span>
              </div>
              <div style={{ fontSize: 13 }}>{l.from} <ArrowRight size={11} style={{ display: "inline" }} /> {l.to} <span className="faint">· {l.mt} MT · {l.vtype}</span></div>
              <div className="faint" style={{ fontSize: 12 }}>Pickup {l.pickup} · {l.id}</div>
              {l.veh && <div className="pos" style={{ fontSize: 12.5, fontWeight: 600 }}>✓ Assigned to {l.veh}</div>}
            </div>
          ))}
        </Panel>

        <Panel title="Available vehicles" sub="drag onto a load" tight>
          {DISPATCH_VEHICLES.map((v) => (
            <div key={v.id} draggable={!used.has(v.id)} onDragStart={() => setDrag(v.id)} onDragEnd={() => setDrag(null)} className="feed-i" style={{ flexDirection: "column", gap: 5, opacity: used.has(v.id) ? 0.4 : 1, cursor: used.has(v.id) ? "not-allowed" : "grab" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><GripVertical size={14} className="faint" /><Plate id={v.id} /><span className="faint">{v.type}</span><span style={{ marginLeft: "auto" }}><Chip tone={v.nextMaint < 0 ? "r" : "g"}>{v.avail}</Chip></span></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 12px", fontSize: 12, paddingLeft: 22 }}>
                <span><span className="faint">Location </span>{v.loc}</span><span><span className="faint">Driver </span>{v.driver}</span>
                <span><Fuel size={11} style={{ display: "inline" }} /> <span className="faint">Fuel </span>{v.fuel}%</span>
                <span className={v.nextMaint < 0 ? "neg" : ""}><Wrench size={11} style={{ display: "inline" }} /> <span className="faint">Service </span>{v.nextMaint < 0 ? `overdue ${-v.nextMaint} km` : `in ${v.nextMaint.toLocaleString("en-IN")} km`}</span>
              </div>
            </div>
          ))}
        </Panel>

        <div style={{ display: "grid", gap: 14 }}>
          <Panel title="Smart recommendation" sub={`for ${load.id}`} actions={<Sparkles size={14} className="faint" />}>
            {ranked.slice(0, 3).map((v, i) => (
              <div key={v.id} style={{ padding: "10px 0", borderTop: i ? "1px solid var(--line2)" : 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <Chip tone={i === 0 ? "k" : "n"}>{i === 0 ? "Best match" : `Alternative ${i}`}</Chip><Plate id={v.id} /><b style={{ marginLeft: "auto", color: v.margin >= 25 ? "var(--green)" : "var(--ink)" }}>{v.margin}% margin</b>
                </div>
                <dl className="kv" style={{ fontSize: 12 }}>
                  <dt>Distance to pickup</dt><dd>{v.dist} km</dd><dt>Vehicle fit</dt><dd>{v.fit}</dd><dt>Driver available</dt><dd>{v.avail === "Needs service" ? "No" : "Yes"} · {v.driver}</dd>
                  <dt>Maintenance risk</dt><dd className={v.risk === "High" ? "neg" : ""}>{v.risk}</dd>
                </dl>
                {i === 0 && !load.veh && <button className="btn pri sm" style={{ marginTop: 8, width: "100%", justifyContent: "center" }} onClick={() => assign(load.id, v.id)}>Assign {v.id}</button>}
              </div>
            ))}
          </Panel>
          <Panel title="Backhaul opportunity" sub="AI · return load" actions={<Chip tone="g">+{inr(BACKHAUL.extra)}</Chip>}>
            <p style={{ margin: "0 0 8px" }}>Vehicle <b className="mono">{BACKHAUL.vehicleId}</b> will unload in <b>{BACKHAUL.unloadAt}</b>. Return load available:</p>
            <dl className="kv"><dt>Route</dt><dd>{BACKHAUL.from} → {BACKHAUL.to}</dd><dt>Customer</dt><dd>{BACKHAUL.customer}</dd><dt>Load</dt><dd>{BACKHAUL.mt} MT</dd><dt>Freight</dt><dd>{full(BACKHAUL.freight)}</dd><dt className="tot">Additional profit</dt><dd className="tot pos">{full(BACKHAUL.extra)}</dd></dl>
            <button className={"btn sm " + (back ? "" : "pri")} style={{ marginTop: 10, width: "100%", justifyContent: "center" }} onClick={() => { setBack(true); notify("Backhaul assigned · return trip created for JH05BX1188"); }}>{back ? "✓ Backhaul assigned" : "Assign Backhaul"}</button>
          </Panel>
        </div>
      </div>
    </div>
  );
}
