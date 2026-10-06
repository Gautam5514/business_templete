"use client";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import TechMap from "./TechMap";
import { Chip, Panel } from "./ui";
import { LOCALITIES } from "@/data/core";
import { useApp } from "@/lib/store";

const STOPS = [["Morabadi", "Sharma Residence", "09:30"], ["Lalpur", "Apex Mall", "11:00"], ["Harmu", "City Hospital", "13:30"], ["Doranda", "Gupta Office", "15:00"]];
const ORIG = [[0, 0], [6.4, 20], [9.2, 34], [8.6, 30]], OPT = [[0, 0], [6.4, 20], [3.5, 12], [6.1, 18]];
export default function RoutePlan({ t }) {
  const { route, optimise, notify } = useApp();
  const done = !!route[t.id], [view, setView] = useState(null);
  const opt = view ?? done;
  const order = opt ? [0, 1, 3, 2] : [0, 1, 2, 3], legs = opt ? OPT : ORIG;
  const km = legs.reduce((a, l) => a + l[0], 0), min = legs.reduce((a, l) => a + l[1], 0), idle = opt ? 6 : 22;
  const pts = order.map((i) => LOCALITIES.ranchi[STOPS[i][0]]);
  return (
    <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.2fr)" }}>
      <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
        <div className="panel" style={{ padding: 14, borderLeft: "3px solid var(--accent)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Sparkles size={14} style={{ color: "var(--accent)" }} /><b>AI route suggestion</b></div>
          <p className="muted" style={{ margin: "6px 0 10px" }}>Reordering {t.name.split(" ")[0]}’s next two jobs can save <b style={{ color: "var(--ink)" }}>34 minutes and 8.2 km</b> of travel.</p>
          <button className="btn pri" disabled={done} onClick={() => { optimise(t.id); notify(`Optimised route applied for ${t.name} · customers re-notified of new ETAs`); }}>{done ? "Optimised route applied ✓" : "Apply Optimized Route"}</button>
        </div>
        <Panel title={`${t.name} — today’s route`} actions={<div className="seg"><button className={!opt ? "on" : ""} onClick={() => setView(false)}>Current</button><button className={opt ? "on" : ""} onClick={() => setView(true)}>Optimised</button></div>}>
          <div className="tl">
            {order.map((si, k) => <div key={si} className="tl-i done" style={{ transition: "all .4s" }}><div style={{ display: "flex", gap: 8, alignItems: "baseline" }}><b>Job {k + 1}</b><span>{STOPS[si][0]}</span><span className="faint">· {STOPS[si][1]}</span></div><div className="faint" style={{ fontSize: 12 }}>{k ? `${legs[k][0]} km · ${legs[k][1]} min travel` : "Start of day"}</div></div>)}
          </div>
          <div className="hr" />
          <div className="metric"><div><div className="lbl">Total distance</div><b style={{ fontSize: 18 }}>{km.toFixed(1)} km</b></div><div><div className="lbl">Travel time</div><b style={{ fontSize: 18 }}>{min} min</b></div><div><div className="lbl">Idle gap</div><b style={{ fontSize: 18 }} className={idle > 15 ? "warn" : "pos"}>{idle} min</b></div></div>
          {opt && <div style={{ marginTop: 10 }}><Chip tone="g">Saves 34 min · 8.2 km vs current</Chip></div>}
        </Panel>
      </div>
      <div style={{ position: "relative", minHeight: 420 }}><TechMap techs={[t]} jobs={[]} route={pts} fillParent showLegend={false} drift={false} initialZoom={1.5} selectedId={null} /></div>
    </div>
  );
}
