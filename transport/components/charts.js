"use client";
import { useState } from "react";

const C = { ink: "var(--ink)", green: "var(--green)", amber: "var(--amber)", red: "var(--red)", blue: "var(--accent)", grey: "var(--ink3)" };

// Multi-series line/area chart with hover read-out.
export function LineChart({ labels, series, height = 190, fmt = (v) => v, area = true, min }) {
  const W = 560, H = height, pl = 34, pr = 8, pt = 10, pb = 20;
  const all = series.flatMap((s) => s.data);
  const lo = min ?? Math.min(...all) * 0.96, hi = Math.max(...all) * 1.04;
  const x = (i) => pl + (i / (labels.length - 1)) * (W - pl - pr);
  const y = (v) => pt + (1 - (v - lo) / (hi - lo)) * (H - pt - pb);
  const [h, setH] = useState(null);
  return (
    <div style={{ position: "relative" }}>
      {series.length > 1 && <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: "var(--ink2)", marginBottom: 4 }}>{series.map((s) => <span key={s.name} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i style={{ width: 14, height: 0, borderTop: `2px ${s.dash ? "dashed" : "solid"} ${C[s.color] || s.color}` }} />{s.name}</span>)}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height }} onMouseLeave={() => setH(null)}
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const i = Math.round(((e.clientX - r.left) / r.width * W - pl) / ((W - pl - pr) / (labels.length - 1))); setH(Math.max(0, Math.min(labels.length - 1, i))); }}>
        {[0, 0.5, 1].map((t) => { const v = lo + (hi - lo) * t; return <g key={t}><line x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} stroke="var(--line2)" /><text x={pl - 6} y={y(v) + 3} textAnchor="end" fontSize="9.5" fill="var(--ink3)">{fmt(+v.toFixed(1))}</text></g>; })}
        {labels.map((l, i) => i % Math.ceil(labels.length / 8) === 0 && <text key={l} x={x(i)} y={H - 5} textAnchor="middle" fontSize="9.5" fill="var(--ink3)">{l}</text>)}
        {series.map((s, si) => {
          const d = s.data.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
          return (
            <g key={si}>
              {area && si === 0 && <path d={`${d} L${x(s.data.length - 1)},${H - pb} L${x(0)},${H - pb} Z`} fill={C[s.color] || s.color} opacity="0.07" />}
              <path d={d} fill="none" stroke={C[s.color] || s.color} strokeWidth="1.8" strokeDasharray={s.dash ? "4 3" : null} strokeLinejoin="round" />
              {h != null && <circle cx={x(h)} cy={y(s.data[h])} r="3.5" fill="var(--panel)" stroke={C[s.color] || s.color} strokeWidth="2" />}
            </g>
          );
        })}
        {h != null && <line x1={x(h)} x2={x(h)} y1={pt} y2={H - pb} stroke="var(--ink3)" strokeDasharray="2 3" />}
      </svg>
      {h != null && (
        <div style={{ position: "absolute", top: 0, left: `${(x(h) / W) * 100}%`, transform: "translateX(-50%)", background: "var(--ink)", color: "var(--bg)", fontSize: 11, borderRadius: 6, padding: "3px 8px", pointerEvents: "none", whiteSpace: "nowrap" }}>
          {labels[h]} · {series.map((s) => `${s.name} ${fmt(s.data[h])}`).join("  ")}
        </div>
      )}
    </div>
  );
}

export function Bars({ data, height = 170, color = "ink", fmt = (v) => v, stack, highlight }) {
  const W = 560, H = height, pl = 8, pb = 22, pt = 12;
  const max = Math.max(...data.map((d) => (stack ? d.v.reduce((a, b) => a + b, 0) : d.v)));
  const bw = (W - pl * 2) / data.length;
  const colors = ["ink", "blue", "amber", "red", "green"];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height }}>
      {data.map((d, i) => {
        const x = pl + i * bw + bw * 0.18, w = bw * 0.64;
        const parts = stack ? d.v : [d.v];
        let acc = 0;
        return (
          <g key={i}>
            {parts.map((p, k) => { const h = (p / max) * (H - pb - pt); const yy = H - pb - acc - h; acc += h; return <rect key={k} x={x} y={yy} width={w} height={Math.max(0, h - (stack && k < parts.length - 1 ? 1 : 0))} rx="2" fill={C[d.color || (stack ? colors[k] : highlight === i ? "blue" : color)]} opacity={stack ? 0.9 - k * 0.12 : highlight == null || highlight === i ? 0.92 : 0.45} />; })}
            <text x={x + w / 2} y={H - 7} textAnchor="middle" fontSize="9.5" fill="var(--ink3)">{d.k}</text>
            <text x={x + w / 2} y={H - pb - acc - 4} textAnchor="middle" fontSize="9.5" fill="var(--ink2)">{fmt(stack ? d.v.reduce((a, b) => a + b, 0) : d.v)}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function Ring({ value, size = 150, stroke = 11, label, sub, tone = "ink" }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C[tone] || tone} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${(value / 100) * c} ${c}`} style={{ transition: "stroke-dasharray 1.1s cubic-bezier(.2,.8,.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div><div style={{ fontSize: size * 0.28, fontWeight: 650, letterSpacing: "-0.04em", lineHeight: 1 }}>{label ?? value}</div>{sub && <div className="faint" style={{ fontSize: 11, marginTop: 3 }}>{sub}</div>}</div>
      </div>
    </div>
  );
}

export function Spark({ data, w = 80, h = 24, tone = "ink" }) {
  const lo = Math.min(...data), hi = Math.max(...data);
  const d = data.map((v, i) => `${i ? "L" : "M"}${(i / (data.length - 1)) * w},${h - 2 - ((v - lo) / (hi - lo || 1)) * (h - 4)}`).join(" ");
  return <svg width={w} height={h}><path d={d} fill="none" stroke={C[tone]} strokeWidth="1.5" /></svg>;
}

export function HBars({ items, fmt = (v) => v, tone = "ink", max }) {
  const m = max ?? Math.max(...items.map((i) => Math.abs(i.v)));
  return (
    <div style={{ display: "grid", gap: 9 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr 64px", gap: 10, alignItems: "center", fontSize: 12.5 }}>
          <span className="muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.k}</span>
          <div className="prog" style={{ height: 7 }}><i style={{ width: `${(Math.abs(it.v) / m) * 100}%`, background: it.v < 0 ? "var(--red)" : C[it.tone || tone] }} /></div>
          <span style={{ textAlign: "right", fontWeight: 550 }}>{fmt(it.v)}</span>
        </div>
      ))}
    </div>
  );
}
