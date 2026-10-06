"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Crosshair } from "lucide-react";
import { CITIES, HUBS, P, ROUTES, RISK_ZONES, STATES, pathPoints, pointAt } from "@/data/geo";
import { tripById, driverById, fmtMin } from "@/data/fleet";
import { markerTone } from "@/data/ops";
import { inr } from "@/lib/format";
import { Chip, VehChip, TripChip } from "./ui";

const TONE = { g: "var(--green)", a: "var(--amber)", r: "var(--red)", b: "var(--blue)", n: "var(--grey)" };
const HUB_SET = new Set(HUBS.map((h) => h.name));

function split(route, f) {
  const pts = pathPoints(route);
  const cut = pointAt(route, f);
  const i = cut[2];
  return [[...pts.slice(0, i + 1), [cut[0], cut[1]]], [[cut[0], cut[1]], ...pts.slice(i + 1)]];
}
const pl = (pts) => pts.map((p) => p.join(",")).join(" ");

export function VehicleCard({ v, onClose, style }) {
  const t = v.tripId ? tripById(v.tripId) : null;
  const d = driverById(v.driverId);
  return (
    <div className="map-card" style={style} onMouseDown={(e) => e.stopPropagation()}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <b className="mono" style={{ fontSize: 14 }}>{v.id}</b>
        <VehChip s={v.status} sub={v.sub} />
        <span style={{ flex: 1 }} />
        {onClose && <button className="btn ghost sm" onClick={onClose} style={{ padding: "0 6px" }}>✕</button>}
      </div>
      <div className="faint" style={{ marginBottom: 8 }}>{v.model} · {v.type}</div>
      <dl className="kv" style={{ fontSize: 12 }}>
        <dt>Driver</dt><dd>{d?.name}</dd>
        <dt>Location</dt><dd>{v.loc}</dd>
        {t && <><dt>Trip</dt><dd><Link className="link" href={`/trips/${t.id}`}>{t.id}</Link></dd>
          <dt>Customer</dt><dd>{t.customer.short}</dd>
          <dt>Route</dt><dd>{t.from} → {t.to}</dd>
          <dt>Load</dt><dd>{t.load} MT · {t.material}</dd>
          <dt>ETA</dt><dd style={{ color: t.delay > 30 ? "var(--red)" : undefined }}>{fmtMin(t.etaMin)}{t.delay ? ` (+${t.delay}m)` : ""}</dd>
          <dt>Trip value</dt><dd>{inr(t.freight + t.other)}</dd></>}
        <dt>Speed</dt><dd>{v.speed} km/h · {v.last}</dd>
      </dl>
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        <Link className="btn sm" href={`/vehicles/${v.id}`}>Vehicle 360°</Link>
        {t && <Link className="btn sm pri" href={`/trips/${t.id}`}>Open trip</Link>}
      </div>
    </div>
  );
}

export default function FleetMap({ vehicles, selectedId, onSelect, height = 520, focusRoute, showAllRoutes = true, showZones = true, showHubs = true, className, fillParent, cardAnchor = true, trafficLabels = true, initialZoom = 1.22, fitRoute, initialCenter }) {
  const wrap = useRef(null);
  const [size, setSize] = useState({ w: 900, h: height });
  const [z, setZ] = useState(initialZoom);
  const [c, setC] = useState(initialCenter || [470, 250]);
  const drag = useRef(null);

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(wrap.current); return () => ro.disconnect();
  }, []);
  const fitKey = fitRoute?.id;
  const fitted = useRef(null);
  useEffect(() => {
    if (!fitRoute || fitted.current === fitKey + size.w) return;
    fitted.current = fitKey + size.w;
    const pts = pathPoints(fitRoute), xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const w = Math.max(...xs) - Math.min(...xs) + 110, h = Math.max(...ys) - Math.min(...ys) + 90;
    const b = Math.max(1000, (600 * size.w) / size.h);
    setZ(Math.min(6, Math.max(0.8, Math.min(b / w, (b * size.h) / size.w / h))));
    setC([(Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2]);
  }, [fitRoute, fitKey, size.w, size.h]);
  const base = Math.max(1000, (600 * size.w) / size.h);
  const vw = base / z, vh = (vw * size.h) / size.w, vx = c[0] - vw / 2, vy = c[1] - vh / 2;
  const k = vw / 1000; // marker scale for constant screen size

  const sel = vehicles.find((v) => v.id === selectedId);
  const selTrip = sel?.tripId ? tripById(sel.tripId) : null;
  const focus = focusRoute || selTrip?.route;
  const zoomTo = (nz) => setZ(Math.max(0.8, Math.min(8, nz)));

  const pt = (e) => ({ x: e.clientX, y: e.clientY });
  const onDown = (e) => { drag.current = { ...pt(e), c0: c, moved: false }; };
  const onMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
    setC([drag.current.c0[0] - (dx * vw) / size.w, drag.current.c0[1] - (dy * vh) / size.h]);
  };
  const onUp = () => { const m = drag.current?.moved; drag.current = null; if (!m) setTimeout(() => {}, 0); };

  let cardPos = null;
  if (sel) {
    const sx = ((sel.pos[0] - vx) / vw) * size.w, sy = ((sel.pos[1] - vy) / vh) * size.h;
    cardPos = { left: Math.min(Math.max(8, sx + 14), size.w - 280), top: Math.min(Math.max(8, sy - 40), size.h - 270) };
  }

  const fn = fillParent ? { position: "absolute", inset: 0 } : { height };
  return (
    <div ref={wrap} className={"map " + (className || "")} style={fn} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}>
      <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} preserveAspectRatio="none" onClick={(e) => { if (!drag.current?.moved && e.target.tagName === "svg") onSelect?.(null); }} style={{ cursor: "grab" }}>
        <defs>
          <pattern id="mg" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="var(--map-grid)" strokeWidth={0.8 * k} /></pattern>
          <pattern id="mg2" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="0.5" fill="var(--map-grid)" /></pattern>
        </defs>
        <rect x={vx - 500} y={vy - 500} width={vw + 1000} height={vh + 1000} fill="url(#mg2)" />
        <rect x={vx - 500} y={vy - 500} width={vw + 1000} height={vh + 1000} fill="url(#mg)" />
        {STATES.map((s) => <text key={s.n} x={s.x} y={s.y} fontSize={26} letterSpacing={6} fill="var(--map-ink)" opacity="0.55" style={{ pointerEvents: "none" }}>{s.n}</text>)}

        {showZones && RISK_ZONES.map((zn) => { const [x, y] = P(zn.city); return (
          <g key={zn.name}><circle cx={x} cy={y} r={zn.r} fill="var(--amber)" opacity="0.1" stroke="var(--amber)" strokeOpacity="0.5" strokeDasharray={`${3 * k} ${3 * k}`} strokeWidth={1 * k} />
            {trafficLabels && z >= 1.3 && <text x={x + zn.r + 3} y={y + 3} fontSize={9 * k} fill="var(--amber)">{zn.name}</text>}</g>); })}

        {showAllRoutes && ROUTES.map((r) => <polyline key={r.id} points={pl(pathPoints(r))} fill="none" stroke="var(--map-ink)" strokeWidth={1.4 * k} strokeLinejoin="round" opacity="0.8" />)}
        {focus && (() => { const f = selTrip ? selTrip.progress : 0; const [done, rest] = split(focus, f); return (
          <g>
            <polyline points={pl(pathPoints(focus))} fill="none" stroke="var(--accent)" strokeOpacity="0.15" strokeWidth={9 * k} strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={pl(done)} fill="none" stroke="var(--accent)" strokeWidth={2.6 * k} strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={pl(rest)} className="route-anim" fill="none" stroke="var(--accent)" strokeWidth={2 * k} strokeDasharray={`${6 * k} ${6 * k}`} style={{ animationDuration: "1.4s" }} />
          </g>); })()}

        {Object.keys(CITIES).map((n) => { const [x, y] = P(n); const hub = HUB_SET.has(n); if (hub && showHubs) return null; return (
          <g key={n}><circle cx={x} cy={y} r={2 * k} fill="var(--ink3)" />{z >= 1.2 && <text x={x + 5 * k} y={y + 3 * k} fontSize={9 * k} fill="var(--ink3)">{n}</text>}</g>); })}
        {showHubs && HUBS.map((h) => { const [x, y] = P(h.name); return (
          <g key={h.id}><rect x={x - 6 * k} y={y - 6 * k} width={12 * k} height={12 * k} rx={2 * k} fill="var(--panel)" stroke="var(--ink)" strokeWidth={1.4 * k} />
            <rect x={x - 2.4 * k} y={y - 2.4 * k} width={4.8 * k} height={4.8 * k} fill="var(--ink)" />
            <text x={x + 10 * k} y={y + 4 * k} fontSize={11 * k} fontWeight="600" fill="var(--ink)" style={{ paintOrder: "stroke", stroke: "var(--map-bg)", strokeWidth: 3 * k }}>{h.name}</text></g>); })}

        {vehicles.map((v) => {
          const tone = markerTone(v), isSel = v.id === selectedId, crit = tone === "r";
          const r = (isSel ? 6.2 : v.status === "idle" || v.status === "maintenance" ? 3.4 : 4.4) * k;
          return (
            <g key={v.id} className="mk" onClick={(e) => { e.stopPropagation(); if (!drag.current?.moved) onSelect?.(v.id); }}>
              {crit && <circle className="ring-pulse" cx={v.pos[0]} cy={v.pos[1]} r={r} fill={TONE.r} opacity="0.5" />}
              {isSel && <circle cx={v.pos[0]} cy={v.pos[1]} r={r + 5 * k} fill="none" stroke="var(--ink)" strokeWidth={1.2 * k} />}
              <circle cx={v.pos[0]} cy={v.pos[1]} r={r} fill={TONE[tone]} stroke="var(--map-bg)" strokeWidth={1.4 * k} />
              <circle cx={v.pos[0]} cy={v.pos[1]} r={Math.max(r * 2.2, 9 * k)} fill="transparent" />
              {(isSel || z >= 3) && <text x={v.pos[0] + 8 * k} y={v.pos[1] - 7 * k} fontSize={9.5 * k} fontWeight="600" fill="var(--ink)" style={{ paintOrder: "stroke", stroke: "var(--map-bg)", strokeWidth: 3 * k }}>{v.id}</text>}
            </g>
          );
        })}
      </svg>
      {sel && cardAnchor && cardPos && <VehicleCard v={sel} style={cardPos} onClose={() => onSelect?.(null)} />}
      <div className="map-legend">
        {[["g", "On time"], ["a", "Risk"], ["r", "Delayed / breakdown"], ["b", "Loading / unloading"], ["n", "Idle"]].map(([t, l]) => <span key={t}><i style={{ background: TONE[t] }} />{l}</span>)}
        <span><i style={{ background: "transparent", border: "1px dashed var(--amber)" }} />Traffic risk</span>
      </div>
      <div className="map-ctl">
        <button onClick={() => zoomTo(z * 1.5)} aria-label="Zoom in"><Plus size={14} style={{ margin: "auto" }} /></button>
        <button onClick={() => zoomTo(z / 1.5)} aria-label="Zoom out"><Minus size={14} style={{ margin: "auto" }} /></button>
        <button onClick={() => { setZ(initialZoom); setC(initialCenter || [470, 250]); }} aria-label="Reset"><Crosshair size={14} style={{ margin: "auto" }} /></button>
      </div>
    </div>
  );
}
