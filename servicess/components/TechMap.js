"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, Crosshair } from "lucide-react";
import { LOCALITIES, KM, dist } from "@/data/core";
import { CURRENT, etaOf } from "@/data/ops";
import { Chip, TechChip, PrioChip, Avatar } from "./ui";

const TONE = { available: "var(--green)", onjob: "var(--blue)", travelling: "var(--amber)", delayed: "var(--red)", offline: "var(--grey)" };
const W = 1000, H = 620;

// Road network: connect each locality to its 2 nearest neighbours.
function roads(branch) {
  const L = Object.entries(LOCALITIES[branch]), seen = new Set(), out = [];
  L.forEach(([a, pa]) => {
    L.filter(([b]) => b !== a).map(([b, pb]) => [b, pb, Math.hypot(pa[0] - pb[0], pa[1] - pb[1])]).sort((x, y) => x[2] - y[2]).slice(0, 2).forEach(([b, pb]) => {
      const k = [a, b].sort().join("|"); if (seen.has(k)) return; seen.add(k);
      const mx = (pa[0] + pb[0]) / 2 + (pb[1] - pa[1]) * 0.08, my = (pa[1] + pb[1]) / 2 - (pb[0] - pa[0]) * 0.08;
      out.push(`M${pa[0]},${pa[1]} Q${mx},${my} ${pb[0]},${pb[1]}`);
    });
  });
  return out;
}

export function TechCard({ t, style, onClose }) {
  const j = CURRENT[t.id], eta = etaOf(t);
  return (
    <div className="map-card" style={style} onMouseDown={(e) => e.stopPropagation()}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <Avatar name={t.name} size={30} />
        <div style={{ minWidth: 0 }}><b style={{ fontSize: 13.5 }}>{t.name}</b><div className="faint" style={{ fontSize: 11.5 }}>{t.title}</div></div>
        <span style={{ flex: 1 }} />{onClose && <button className="btn ghost sm" onClick={onClose} style={{ padding: "0 6px" }}>✕</button>}
      </div>
      <div style={{ marginBottom: 8 }}><TechChip s={t.status} /></div>
      <dl className="kv" style={{ fontSize: 12 }}>
        <dt>Current job</dt><dd>{j ? (j.id ? <Link className="link" href={`/jobs/${j.id}`}>{j.id}</Link> : j.service) : "—"}</dd>
        <dt>Customer</dt><dd>{j?.customer || "—"}</dd>
        <dt>ETA / free in</dt><dd style={{ color: t.status === "delayed" ? "var(--red)" : undefined }}>{eta != null ? `${eta} min` : "Available now"}</dd>
        <dt>Skill</dt><dd>{t.skills[0]}</dd>
        <dt>Jobs today</dt><dd>{t.jobsToday}</dd>
        <dt>Near</dt><dd>{t.loc}</dd>
      </dl>
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}><Link className="btn sm pri" href={`/technicians/${t.id}`}>Technician 360°</Link></div>
    </div>
  );
}

export default function TechMap({ branch = "ranchi", techs, jobs = [], selectedId, onSelect, selectedJob, onSelectJob, height = 520, fillParent, route, ghostTo, initialZoom = 1.28, className, showLegend = true, drift = true, cardAnchor = true }) {
  const wrap = useRef(null);
  const [size, setSize] = useState({ w: 900, h: height });
  const [z, setZ] = useState(initialZoom);
  const [c, setC] = useState([500, 290]);
  const [tick, setTick] = useState(0);
  const drag = useRef(null);
  const net = useMemo(() => roads(branch), [branch]);

  useEffect(() => { const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height })); ro.observe(wrap.current); return () => ro.disconnect(); }, []);
  useEffect(() => { if (!drift) return; const i = setInterval(() => setTick((x) => x + 1), 1600); return () => clearInterval(i); }, [drift]);

  const base = Math.max(W, (H * size.w) / size.h);
  const vw = base / z, vh = (vw * size.h) / size.w, vx = c[0] - vw / 2, vy = c[1] - vh / 2, k = vw / W;
  const zoomTo = (nz) => setZ(Math.max(0.8, Math.min(6, nz)));
  const onDown = (e) => { drag.current = { x: e.clientX, y: e.clientY, c0: c, moved: false }; };
  const onMove = (e) => { if (!drag.current) return; const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y; if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true; setC([drag.current.c0[0] - (dx * vw) / size.w, drag.current.c0[1] - (dy * vh) / size.h]); };
  const onUp = () => { drag.current = null; };

  // gentle live movement: travelling technicians creep toward their job, others breathe
  const posOf = (t) => {
    if (!drift || t.status === "offline" || t.status === "available") return t.pos;
    const j = CURRENT[t.id], ph = ((tick + t.id.charCodeAt(2)) % 12) / 12;
    if (t.status === "travelling" && j?.pos) return [t.pos[0] + (j.pos[0] - t.pos[0]) * ph * 0.22, t.pos[1] + (j.pos[1] - t.pos[1]) * ph * 0.22];
    return [t.pos[0] + Math.sin(tick / 2 + t.id.charCodeAt(2)) * 1.5, t.pos[1] + Math.cos(tick / 2 + t.id.charCodeAt(1)) * 1.5];
  };
  const sel = techs.find((t) => t.id === selectedId);
  let cardPos = null;
  if (sel) { const p = posOf(sel), sx = ((p[0] - vx) / vw) * size.w, sy = ((p[1] - vy) / vh) * size.h; cardPos = { left: Math.min(Math.max(8, sx + 14), size.w - 280), top: Math.min(Math.max(8, sy - 40), size.h - 290) }; }
  const loc = LOCALITIES[branch];
  const fn = fillParent ? { position: "absolute", inset: 0 } : { height };
  const selJobObj = jobs.find((j) => j.id === selectedJob);

  return (
    <div ref={wrap} className={"map " + (className || "")} style={fn} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}>
      <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} preserveAspectRatio="none" style={{ cursor: "grab" }} onClick={(e) => { if (!drag.current?.moved && e.target.tagName === "svg") { onSelect?.(null); onSelectJob?.(null); } }}>
        <defs>
          <pattern id="tg" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="var(--map-grid)" strokeWidth={0.7 * k} /></pattern>
        </defs>
        <rect x={vx - 600} y={vy - 600} width={vw + 1200} height={vh + 1200} fill="url(#tg)" />
        {/* decorative river + ring road */}
        <path d={`M-100,${H * 0.78} C 220,${H * 0.55} 420,${H * 0.95} 700,${H * 0.62} S 1050,${H * 0.45} 1200,${H * 0.5}`} fill="none" stroke="var(--blue)" strokeOpacity="0.13" strokeWidth={22 * k} strokeLinecap="round" />
        <ellipse cx="500" cy="310" rx="430" ry="255" fill="none" stroke="var(--map-ink)" strokeWidth={5 * k} strokeOpacity="0.5" strokeDasharray={`${14 * k} ${8 * k}`} />
        {net.map((d, i) => <path key={i} d={d} fill="none" stroke="var(--map-ink)" strokeWidth={2.4 * k} strokeLinecap="round" opacity="0.85" />)}
        {Object.entries(loc).map(([n, [x, y]]) => (
          <g key={n}><circle cx={x} cy={y} r={3 * k} fill="var(--ink3)" opacity="0.7" /><text x={x + 7 * k} y={y + 3.5 * k} fontSize={10 * k} fill="var(--ink3)" style={{ paintOrder: "stroke", stroke: "var(--map-bg)", strokeWidth: 3 * k }}>{n}</text></g>
        ))}

        {route && route.length > 1 && (
          <g>
            <polyline points={route.map((p) => p.join(",")).join(" ")} fill="none" stroke="var(--accent)" strokeOpacity="0.16" strokeWidth={9 * k} strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={route.map((p) => p.join(",")).join(" ")} className="route-anim" fill="none" stroke="var(--accent)" strokeWidth={2.4 * k} strokeDasharray={`${6 * k} ${6 * k}`} strokeLinejoin="round" />
            {route.slice(1).map((p, i) => <g key={i}><circle cx={p[0]} cy={p[1]} r={8 * k} fill="var(--panel)" stroke="var(--accent)" strokeWidth={1.6 * k} /><text x={p[0]} y={p[1] + 3.6 * k} textAnchor="middle" fontSize={10 * k} fontWeight="700" fill="var(--accent)">{i + 1}</text></g>)}
          </g>
        )}

        {/* job pins */}
        {jobs.map((j) => {
          const on = j.id === selectedJob, crit = j.prio === "Emergency";
          return (
            <g key={j.id} className="mk" onClick={(e) => { e.stopPropagation(); onSelectJob?.(j.id); }}>
              {crit && <circle className="ring-pulse" cx={j.pos[0]} cy={j.pos[1]} r={9 * k} fill="var(--red)" opacity="0.4" />}
              <path d={`M${j.pos[0]},${j.pos[1] + 2 * k} l${-6 * k},${-14 * k} a${6.6 * k},${6.6 * k} 0 1 1 ${12 * k},0 z`} fill={crit ? "var(--red)" : "var(--amber)"} stroke="var(--map-bg)" strokeWidth={1.4 * k} transform={on ? `translate(0,${-2 * k})` : undefined} />
              <circle cx={j.pos[0]} cy={j.pos[1] - 12.4 * k} r={2.3 * k} fill="var(--bg)" />
              {(on || z >= 2) && <text x={j.pos[0] + 9 * k} y={j.pos[1] - 12 * k} fontSize={10 * k} fontWeight="650" fill="var(--ink)" style={{ paintOrder: "stroke", stroke: "var(--map-bg)", strokeWidth: 3 * k }}>{j.customer}</text>}
            </g>
          );
        })}
        {selJobObj && ghostTo && (
          <line x1={ghostTo[0]} y1={ghostTo[1]} x2={selJobObj.pos[0]} y2={selJobObj.pos[1]} stroke="var(--accent)" strokeWidth={2 * k} strokeDasharray={`${5 * k} ${4 * k}`} className="route-anim" />
        )}

        {techs.map((t) => {
          const p = posOf(t), isSel = t.id === selectedId, crit = t.status === "delayed", r = (isSel ? 7 : t.status === "offline" ? 4 : 5.4) * k;
          return (
            <g key={t.id} className="mk" style={{ transform: `translate(${p[0] - t.pos[0]}px, ${p[1] - t.pos[1]}px)`, transition: "transform 1.5s linear" }} onClick={(e) => { e.stopPropagation(); if (!drag.current?.moved) onSelect?.(t.id); }}>
              {crit && <circle className="ring-pulse" cx={t.pos[0]} cy={t.pos[1]} r={r} fill="var(--red)" opacity="0.5" />}
              {isSel && <circle cx={t.pos[0]} cy={t.pos[1]} r={r + 5 * k} fill="none" stroke="var(--ink)" strokeWidth={1.2 * k} />}
              <circle cx={t.pos[0]} cy={t.pos[1]} r={r} fill={TONE[t.status]} stroke="var(--map-bg)" strokeWidth={1.6 * k} />
              <circle cx={t.pos[0]} cy={t.pos[1]} r={Math.max(r * 2, 10 * k)} fill="transparent" />
              {(isSel || z >= 2.4) && <text x={t.pos[0] + 9 * k} y={t.pos[1] - 8 * k} fontSize={10 * k} fontWeight="650" fill="var(--ink)" style={{ paintOrder: "stroke", stroke: "var(--map-bg)", strokeWidth: 3 * k }}>{t.name.split(" ")[0]}</text>}
            </g>
          );
        })}
      </svg>
      {sel && cardAnchor && cardPos && <TechCard t={sel} style={cardPos} onClose={() => onSelect?.(null)} />}
      {showLegend && <div className="map-legend">{[["available", "Available"], ["onjob", "On job"], ["travelling", "Travelling"], ["delayed", "Delayed / emergency"], ["offline", "Offline"]].map(([t, l]) => <span key={t}><i style={{ background: TONE[t] }} />{l}</span>)}{jobs.length > 0 && <span><i style={{ background: "var(--amber)", borderRadius: "50% 50% 50% 0" }} />Open job</span>}</div>}
      <div className="map-ctl">
        <button onClick={() => zoomTo(z * 1.4)} aria-label="Zoom in"><Plus size={14} style={{ margin: "auto" }} /></button>
        <button onClick={() => zoomTo(z / 1.4)} aria-label="Zoom out"><Minus size={14} style={{ margin: "auto" }} /></button>
        <button onClick={() => { setZ(initialZoom); setC([500, 290]); }} aria-label="Reset"><Crosshair size={14} style={{ margin: "auto" }} /></button>
      </div>
    </div>
  );
}
export { Chip, PrioChip };
