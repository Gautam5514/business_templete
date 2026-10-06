"use client";
import { useId } from "react";

/** Procedural construction-site illustration. progress 0-100 controls how much of the structure is built. */
export default function SiteArt({ kind = "tower", progress = 50, seed = 1, tone = "day", className, crane = true, label }) {
  const id = useId().replace(/:/g, "");
  const night = tone === "night", dusk = tone === "dusk";
  const sky = night ? ["#0c1424", "#1d2a44"] : dusk ? ["#33405c", "#e9a87a"] : ["#a9c4dc", "#e9eff3"];
  const W = 320, H = 200, ground = 168;
  const rnd = (n) => { const x = Math.sin(seed * 997 + n * 131.7) * 10000; return x - Math.floor(x); };
  const built = Math.max(0.08, progress / 100);
  const bodyCol = night ? "#3a4656" : "#b9c2ca", frameCol = night ? "#6c7f95" : "#7c8791", glass = night ? "#e9c46a" : "#6e8fa8";
  const els = [];
  const tower = (x, w, floors, key) => {
    const fh = 9, built_f = Math.round(floors * built);
    const top = ground - built_f * fh;
    els.push(<g key={key}>
      <rect x={x} y={top} width={w} height={built_f * fh} fill={bodyCol} opacity={0.92} />
      {Array.from({ length: built_f }).map((_, i) => (
        <g key={i}>
          <line x1={x} x2={x + w} y1={ground - (i + 1) * fh} y2={ground - (i + 1) * fh} stroke={frameCol} strokeWidth="1" />
          {i < built_f * 0.7 && Array.from({ length: Math.floor(w / 9) }).map((__, j) => rnd(i * 7 + j + x) > 0.25 && <rect key={j} x={x + 3 + j * 9} y={ground - (i + 1) * fh + 2.5} width="5" height="4" fill={glass} opacity={night ? 0.9 : 0.75} />)}
        </g>
      ))}
      {/* rebar columns on unfinished top */}
      {built < 0.97 && Array.from({ length: Math.floor(w / 10) + 1 }).map((_, j) => <line key={j} x1={x + 2 + j * 10} x2={x + 2 + j * 10} y1={top} y2={top - 12} stroke="#d96d2b" strokeWidth="1.2" />)}
      <rect x={x - 1} y={top - 2} width={w + 2} height="2.5" fill={frameCol} />
    </g>);
    return top;
  };
  let craneX = 70, craneTop = 60;
  if (kind === "tower") {
    const t1 = tower(110, 46, 14, "a"); tower(168, 38, 11, "b"); tower(214, 34, 9, "c"); tower(62, 30, 6, "d");
    craneX = 100; craneTop = Math.min(t1, 100) - 28;
  } else if (kind === "commercial") {
    const t = tower(90, 90, 12, "a"); tower(190, 50, 8, "b"); craneX = 80; craneTop = t - 30;
  } else if (kind === "industrial" || kind === "warehouse") {
    const bw = 220, bh = kind === "warehouse" ? 48 : 64, h = bh * (0.35 + 0.65 * built);
    els.push(<g key="w">
      <rect x={50} y={ground - h} width={bw} height={h} fill={bodyCol} />
      {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={50 + i * (bw / 11)} x2={50 + i * (bw / 11)} y1={ground - h} y2={ground} stroke={frameCol} strokeWidth="1" />)}
      <polygon points={`${50},${ground - h} ${50 + bw},${ground - h} ${50 + bw - 14},${ground - h - 14 * built - 2} ${64},${ground - h - 14 * built - 2}`} fill={frameCol} />
      {kind === "industrial" && <><rect x={250} y={ground - h - 38 * built} width="9" height={38 * built} fill={frameCol} /><rect x={270} y={ground - h - 28 * built} width="7" height={28 * built} fill={frameCol} /></>}
      <rect x={140} y={ground - 22} width="44" height="22" fill={night ? "#222c38" : "#8c97a2"} />
    </g>);
    craneX = 40; craneTop = 52;
  } else if (kind === "villa") {
    [60, 130, 200].forEach((x, i) => {
      const f = built > 0.3 + i * 0.1 ? 2 : 1;
      els.push(<g key={i}><rect x={x} y={ground - 22 * f * Math.min(1, built + 0.2)} width="52" height={22 * f * Math.min(1, built + 0.2)} fill={bodyCol} />
        <polygon points={`${x - 4},${ground - 22 * f * Math.min(1, built + 0.2)} ${x + 26},${ground - 22 * f * Math.min(1, built + 0.2) - 14} ${x + 56},${ground - 22 * f * Math.min(1, built + 0.2)}`} fill={built > 0.5 ? "#b8603a" : frameCol} opacity={built > 0.45 ? 1 : 0.4} />
        <rect x={x + 8} y={ground - 14} width="9" height="14" fill={glass} opacity="0.7" /><rect x={x + 32} y={ground - 14} width="12" height="9" fill={glass} opacity="0.7" /></g>);
    });
    craneX = 30; craneTop = 66;
  } else { // interior
    els.push(<g key="i">
      <rect x={40} y={50} width={240} height={ground - 50} fill={night ? "#1b2330" : "#e8e6e1"} />
      <rect x={40} y={ground - 14} width={240} height="14" fill={night ? "#2b3646" : "#c8c1b3"} />
      {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={58 + i * 38} y={66} width="26" height={ground - 90} fill={i / 6 < built ? glass : frameCol} opacity={i / 6 < built ? 0.55 : 0.18} />)}
      {Array.from({ length: 4 }).map((_, i) => <rect key={i} x={70 + i * 56} y={52} width="22" height="3" fill={i / 4 < built ? "#f6e9b8" : "#9aa3ab"} />)}
    </g>);
    crane = false;
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label={label || "Site illustration"}>
      <defs>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="1" stopColor={sky[1]} /></linearGradient>
        <pattern id={`h${id}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#fff" strokeOpacity="0.1" strokeWidth="2" /></pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#s${id})`} />
      {night && Array.from({ length: 22 }).map((_, i) => <circle key={i} cx={rnd(i) * W} cy={rnd(i + 40) * 90} r={0.6 + rnd(i + 9)} fill="#fff" opacity={0.6} />)}
      {!night && <g opacity="0.7"><ellipse cx={60 + rnd(1) * 180} cy={34} rx="30" ry="6" fill="#fff" /><ellipse cx={200 + rnd(2) * 60} cy={54} rx="22" ry="5" fill="#fff" /></g>}
      <polygon points={`0,${ground - 18} 60,${ground - 34} 130,${ground - 16} 210,${ground - 38} 320,${ground - 14} 320,${ground} 0,${ground}`} fill={night ? "#18212c" : "#9fb0b8"} opacity="0.55" />
      {els}
      {crane && (
        <g stroke={night ? "#e0a82e" : "#d9a21b"} strokeWidth="1.3" fill="none">
          <line x1={craneX} x2={craneX} y1={ground} y2={craneTop} strokeWidth="2.2" />
          <g className="crane-arm"><line x1={craneX - 36} x2={craneX + 72} y1={craneTop} y2={craneTop} strokeWidth="2.2" /><line x1={craneX} x2={craneX + 60} y1={craneTop - 12} y2={craneTop} /><line x1={craneX + 56} x2={craneX + 56} y1={craneTop} y2={craneTop + 26} stroke="#888" strokeWidth="0.8" /><rect x={craneX + 52} y={craneTop + 26} width="8" height="5" fill="#d9a21b" stroke="none" /></g>
          <line x1={craneX} x2={craneX - 18} y1={craneTop - 12} y2={craneTop} />
        </g>
      )}
      <rect y={ground} width={W} height={H - ground} fill={night ? "#10161d" : "#8b8478"} />
      <rect y={ground} width={W} height="3" fill={night ? "#1e2832" : "#a49c8d"} />
      <rect width={W} height={H} fill={`url(#h${id})`} opacity="0.5" />
    </svg>
  );
}
