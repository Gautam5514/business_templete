"use client";
import { useState } from "react";
import { DoorOpen, Fuel, ParkingSquare, FileText, Moon, Package, PackageOpen, Shuffle } from "lucide-react";
import FleetMap from "@/components/FleetMap";
import { Insight, Kpis, PageHead, Panel, Plate, Prog, Seg, VehChip } from "@/components/ui";
import { VEHICLES, tripById } from "@/data/fleet";
import { HUBS, P } from "@/data/geo";
import { hm } from "@/lib/format";

export default function Hubs() {
  const [h, setH] = useState("Ranchi");
  const hub = HUBS.find((x) => x.name === h);
  const here = VEHICLES.filter((v) => v.hub === h).slice(0, 12);
  const ops = [[DoorOpen, "Gate Entry", "9 pending", 60], [Package, "Loading", "6 bays active", 75], [PackageOpen, "Unloading", "4 bays active", 50], [Shuffle, "Cross-docking", "2 consignments", 25], [Moon, "Driver Rest", "7 drivers", 40], [Fuel, "Fuel", "Pump 2 queue: 3", 35], [ParkingSquare, "Parking", `${hub.parking}% full`, hub.parking], [FileText, "Documents", "5 LR / 3 POD to verify", 45]];
  return (
    <div className="page">
      <PageHead title={`${h} Hub`} sub="Local operations — gate, bays, parking and turnaround."><Seg options={HUBS.map((x) => x.name)} value={h} onChange={setH} /></PageHead>
      <Insight tone={hub.parking > 80 ? "r" : "b"}>{hub.parking > 80 ? <><b>{h} parking is {hub.parking}% full</b> and {hub.arriving} vehicles are arriving — expect gate congestion; hold low-priority loading to protect turnaround.</> : <><b>{hub.pending} loads are waiting</b> at {h} and {hub.present} vehicles are present — average turnaround is {hub.turnaround}, versus 1h 54m network average.</>}</Insight>
      <Kpis items={[{ label: "Vehicles present", value: hub.present }, { label: "Arriving", value: hub.arriving }, { label: "Departing today", value: hub.departing }, { label: "Loads pending", value: hub.pending, tone: "a" }, { label: "Staff", value: hub.staff }, { label: "Avg turnaround", value: hub.turnaround }]} />
      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}>
        <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
          <Panel title="Hub operations" sub="live">
            <div style={{ display: "grid", gap: 14 }}>{ops.map(([I, a, b, p]) => <div key={a} style={{ display: "grid", gridTemplateColumns: "26px 120px 1fr 150px", gap: 10, alignItems: "center" }}><I size={16} className="faint" /><b>{a}</b><Prog v={p} tone={p > 80 ? "r" : p > 65 ? "a" : ""} /><span className="muted" style={{ textAlign: "right" }}>{b}</span></div>)}</div>
          </Panel>
          <Panel title={`Vehicles at ${h}`} tight>
            <table className="tbl"><tbody>{here.map((v) => <tr key={v.id}><td><Plate id={v.id} /></td><td>{v.type}</td><td><VehChip s={v.status} sub={v.sub} /></td><td className="faint">{v.tripId ? tripById(v.tripId)?.to : "Awaiting load"}</td></tr>)}</tbody></table>
          </Panel>
        </div>
        <div style={{ position: "relative", minHeight: 520 }}><FleetMap key={h} vehicles={VEHICLES.filter((v) => v.hub === h && !v.tripId)} fillParent initialZoom={2.6} initialCenter={P(h)} /></div>
      </div>
    </div>
  );
}
