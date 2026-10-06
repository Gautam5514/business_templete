"use client";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { PROJECTS } from "@/data/core";
import SiteArt from "@/components/site/SiteArt";
import { Bar, Pill, TONES, cn } from "@/components/ui/ui";
import { cr } from "@/lib/format";

const X0 = 82.9, Y0 = 27.5, S = 90;
const px = (lon) => (lon - X0) * S + 8, py = (lat) => (Y0 - lat) * S + 8;
const poly = (pts) => pts.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join(" ");
const STATES = {
  Jharkhand: [[83.3, 24.4], [84.0, 24.5], [85.0, 24.6], [86.2, 24.8], [87.5, 25.2], [88.1, 25.3], [87.9, 24.8], [87.3, 23.8], [87.0, 22.9], [86.6, 22.2], [85.8, 22.0], [84.8, 22.0], [84.1, 22.5], [83.4, 23.1]],
  Bihar: [[83.3, 24.4], [84.0, 24.5], [85.0, 24.6], [86.2, 24.8], [87.5, 25.2], [88.1, 25.3], [88.2, 26.5], [87.0, 26.5], [86.0, 26.6], [85.0, 26.8], [84.2, 27.3], [83.6, 27.0], [83.9, 26.1], [83.3, 25.6]],
  "West Bengal": [[86.6, 22.2], [87.0, 22.9], [87.3, 23.8], [87.9, 24.8], [88.1, 25.3], [88.2, 26.5], [89.4, 26.6], [88.9, 25.6], [88.7, 24.2], [89.0, 22.0], [88.2, 21.6], [87.2, 21.6], [86.8, 21.9]],
};
const LABELS = { Jharkhand: [84.1, 23.0], Bihar: [85.4, 26.0], "West Bengal": [88.0, 23.2] };
const OFFSET = { skyline: [-6, 6], riverside: [16, -14], eastern: [-4, 14], orion: [10, -6] };
// label placement per marker: dx, dy (relative to marker), text anchor
const LABEL = { skyline: [-17, 0, "end"], riverside: [0, -30, "middle"], eastern: [0, 28, "middle"], orion: [17, -1, "start"] };
const labelAt = (id) => LABEL[id] || [17, -1, "start"];

export default function SiteMap({ projects = PROJECTS, dark, height = 460, onOpen, className, compact }) {
  const [sel, setSel] = useState(null);
  const p = projects.find((x) => x.id === sel);
  return (
    <div className={cn("relative overflow-hidden", dark ? "bg-[#0a0e11]" : "bg-panel", className)} style={{ height }}>
      <div className={cn("absolute inset-0", dark ? "opacity-60" : "")} style={{ backgroundImage: "linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
      <svg viewBox="0 0 600 560" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
        {Object.entries(STATES).map(([n, pts]) => (
          <g key={n}>
            <polygon points={poly(pts)} fill={dark ? "#121a20" : "var(--surface)"} stroke={dark ? "#2a3944" : "var(--line-strong)"} strokeWidth="1.2" strokeLinejoin="round" />
            <text x={px(LABELS[n][0])} y={py(LABELS[n][1])} textAnchor="middle" className="fill-faint" fontSize="9.5" letterSpacing="2.5" opacity="0.75">{n.toUpperCase()}</text>
          </g>
        ))}
        <path d={`M${px(83.6)},${py(25.7)} C${px(85)},${py(25.5)} ${px(86.3)},${py(25.3)} ${px(87.4)},${py(25.1)} S${px(88.6)},${py(24.4)} ${px(88.8)},${py(23.5)}`} fill="none" stroke={dark ? "#1f3a52" : "#b9d0e6"} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <text x={px(86.6)} y={py(25.1) - 5} fontSize="7.5" className="fill-faint" opacity="0.7" fontStyle="italic">Ganga</text>
        {/* connector from HQ */}
        {projects.map((q) => {
          if (q.id === "skyline") return null;
          const s = projects.find((x) => x.id === "skyline");
          const o1 = OFFSET.skyline || [0, 0], o2 = OFFSET[q.id] || [0, 0];
          return <line key={q.id} x1={px(s.lon) + o1[0]} y1={py(s.lat) + o1[1]} x2={px(q.lon) + o2[0]} y2={py(q.lat) + o2[1]} stroke={dark ? "#3a4a57" : "var(--line-strong)"} strokeWidth="0.8" strokeDasharray="2 4" opacity="0.7" />;
        })}
        {projects.map((q) => {
          const o = OFFSET[q.id] || [0, 0];
          const x = px(q.lon) + o[0], y = py(q.lat) + o[1];
          const col = TONES[q.mapTone].var;
          const pulse = q.status === "Delayed" || q.status === "Attention Required" || q.status === "Cost Risk";
          const [dx, dy, anchor] = labelAt(q.id);
          return (
            <g key={q.id} className="cursor-pointer" onClick={() => setSel(sel === q.id ? null : q.id)}>
              {pulse && <circle cx={x} cy={y} r="9" fill={col} className="pulse-ring" />}
              <circle cx={x} cy={y} r={sel === q.id ? 13 : 11} fill={dark ? "#0a0e11" : "var(--surface)"} stroke={col} strokeWidth="2.2" />
              <circle cx={x} cy={y} r="4.5" fill={col} />
              <circle cx={x} cy={y} r={sel === q.id ? 17 : 0} fill="none" stroke={col} strokeWidth="1" opacity="0.5" />
              <text x={x + dx} y={y + dy} textAnchor={anchor} fontSize="10.5" fontWeight="600" className="fill-ink">{q.city}</text>
              {!compact && <text x={x + dx} y={y + dy + 11} textAnchor={anchor} fontSize="9" className="fill-mute num">{q.name.split(" ")[0]} · {q.pct}%</text>}
            </g>
          );
        })}
      </svg>
      <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-mute">
        {[["good", "On track"], ["info", "Near completion"], ["warn", "Attention"], ["risk", "Cost risk"], ["bad", "Delayed"]].map(([t, l]) => <span key={t} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: TONES[t].var }} />{l}</span>)}
      </div>
      <div className="absolute bottom-2 right-3 text-[10px] uppercase tracking-[0.1em] text-faint">Schematic · Eastern India</div>
      <AnimatePresence>
        {p && (
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="glass absolute bottom-3 left-3 w-[300px] max-w-[calc(100%-24px)] overflow-hidden rounded-[10px] shadow-xl">
            <div className="relative h-24"><SiteArt kind={p.kind} progress={p.pct} seed={p.seed} className="h-full w-full" />
              <button onClick={() => setSel(null)} className="absolute right-1.5 top-1.5 rounded bg-black/40 p-1 text-white"><X size={13} /></button>
              <div className="absolute bottom-1.5 left-2"><Pill tone={p.mapTone} className="!bg-black/55 !text-white">{p.nearDone ? "Near Completion" : p.status}</Pill></div></div>
            <div className="space-y-2 p-3">
              <div><div className="text-[14px] font-semibold leading-tight">{p.name}</div><div className="text-[11.5px] text-mute">{p.type} · {p.city} · PM {p.pm}</div></div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div><div className="text-faint">Value</div><div className="num text-[13px] font-semibold">{cr(p.value)}</div></div>
                <div><div className="text-faint">Complete</div><div className="num text-[13px] font-semibold">{p.pct}%</div></div>
                <div><div className="text-faint">Budget used</div><div className={cn("num text-[13px] font-semibold", p.budget > p.pct + 4 && "text-risk")}>{p.budget}%</div></div>
              </div>
              <Bar value={p.pct} tone={p.mapTone} h={5} marker={p.planned} />
              {onOpen ? <button onClick={() => onOpen(p)} className="flex items-center gap-1 text-[12px] font-semibold text-accent-ink">Open project <ArrowUpRight size={13} /></button> : <Link href={`/projects/${p.id}`} className="flex items-center gap-1 text-[12px] font-semibold text-accent-ink">Open project <ArrowUpRight size={13} /></Link>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
