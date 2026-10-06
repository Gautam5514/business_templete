"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { TOWERS } from "@/data/core";
import { Bar, Drawer, Kv, Pill, cn, Counter } from "@/components/ui/ui";

const STAGE_COL = { Structure: "#64748b", Brickwork: "#c2703d", Plaster: "#c9b48a", MEP: "#3b82f6", Flooring: "#8b5cf6", Painting: "#16a34a" };
const ORDER = ["Structure", "Brickwork", "Plaster", "MEP", "Flooring", "Painting"];
const DETAIL = {
  Structure: ["Eastern Structural / Shivam Civil", "RCC frame, slabs, staircases"],
  Brickwork: ["Shivam Civil Contractors", "AAC block masonry, lintels"],
  Plaster: ["Shivam Civil Contractors", "Internal 12mm + external sand-face"],
  MEP: ["Apex MEP Solutions", "Conduits, risers, plumbing & drainage lines"],
  Flooring: ["Shree Interiors", "800x800 vitrified tile with skirting"],
  Painting: ["Shree Interiors", "Putty, primer, 2 coat emulsion"],
};

function floorsReached(t, stage, hi) {
  return Math.round((t.stages[stage] / 100) * t.floors);
}
function Tower({ t, hi, setHi, onPick }) {
  const fh = Math.min(16, 170 / t.floors), W = 96, H = t.floors * fh + 18;
  const cells = Array.from({ length: t.floors }, (_, i) => {
    let best = null;
    ORDER.forEach((s) => { if (i < floorsReached(t, s)) best = s; });
    return best;
  });
  return (
    <svg viewBox={`0 0 ${W + 20} ${H + 6}`} className="mx-auto w-[88px]" role="img" aria-label={`${t.name} progress`}>
      <rect x="10" y={H} width={W} height="3" fill="var(--line-strong)" />
      {cells.map((s, i) => {
        const y = H - (i + 1) * fh;
        const dim = hi && s !== hi;
        return (
          <motion.g key={i} initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} transition={{ delay: i * 0.035, duration: 0.3 }} style={{ transformOrigin: `0px ${y + fh}px` }}>
            <rect x="10" y={y + 0.5} width={W} height={fh - 1} fill={s ? STAGE_COL[s] : "none"} stroke={s ? "none" : "var(--line-strong)"} strokeDasharray={s ? "" : "3 2"} opacity={dim ? 0.18 : s ? 0.92 : 0.7} />
            {s && Array.from({ length: 5 }).map((_, j) => <rect key={j} x={16 + j * 18} y={y + fh * 0.28} width="9" height={fh * 0.42} fill="#fff" opacity={dim ? 0.1 : 0.35} />)}
          </motion.g>
        );
      })}
      {!cells[t.floors - 1] && <g stroke="#d96d2b" strokeWidth="1.2">{Array.from({ length: 6 }).map((_, j) => <line key={j} x1={14 + j * 18} x2={14 + j * 18} y1={H - cells.filter(Boolean).length * fh - 1} y2={H - cells.filter(Boolean).length * fh - 9} />)}</g>}
    </svg>
  );
}

export default function BuildingProgress({ compact }) {
  const [hi, setHi] = useState(null);
  const [pick, setPick] = useState(null);
  const towers = compact ? TOWERS.slice(0, 4) : TOWERS;
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[11.5px] text-mute">Highlight stage:</span>
        {ORDER.map((s) => <button key={s} onMouseEnter={() => setHi(s)} onMouseLeave={() => setHi(null)} className="flex items-center gap-1.5 rounded-[4px] border border-line px-2 py-0.5 text-[11.5px] hover:bg-panel"><span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: STAGE_COL[s] }} />{s}</button>)}
      </div>
      <div className={cn("grid gap-3", compact ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2 xl:grid-cols-5")}>
        {towers.map((t) => {
          const ext = t.id === "EX";
          return (
            <div key={t.id} className="rounded-[8px] border border-line bg-surface">
              <div className="flex items-start justify-between border-b border-line px-3.5 py-2.5"><div><div className="text-[13.5px] font-semibold">{t.name}</div><div className="text-[11px] text-mute">{ext ? "Site works" : `${t.floors} floors`}</div></div><div className="text-right"><div className="num text-[20px] font-semibold leading-none"><Counter value={t.overall} suffix="%" /></div><div className="text-[10px] uppercase tracking-wider text-faint">overall</div></div></div>
              <div className="grid-bg px-3 pt-4">
                {!ext ? <Tower t={t} hi={hi} /> : <div className="mx-auto flex h-[150px] items-end justify-center gap-1.5 pb-1">{Object.values(t.stages).map((v, i) => <div key={i} className="w-3 rounded-t-[2px] bg-accent/80" style={{ height: `${v * 1.4}px` }} />)}</div>}
              </div>
              <div className="space-y-1 p-3">
                {Object.entries(t.stages).map(([s, v]) => (
                  <button key={s} onClick={() => setPick({ t, s, v })} onMouseEnter={() => !ext && setHi(s)} onMouseLeave={() => setHi(null)} className="group flex w-full items-center gap-2 rounded px-1 py-0.5 text-left hover:bg-panel">
                    <span className="w-[62px] shrink-0 text-[11.5px] text-mute">{s}</span>
                    <Bar value={v} h={5} track tone={v === 100 ? "good" : "accent"} className="flex-1" />
                    <span className="num w-8 text-right text-[11.5px] font-semibold">{v}%</span>
                    <ChevronRight size={11} className="text-faint opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
              {!compact && <p className="border-t border-line px-3.5 py-2 text-[11.5px] leading-snug text-mute">{t.note}</p>}
            </div>
          );
        })}
      </div>
      <Drawer open={!!pick} onClose={() => setPick(null)} title={pick ? `${pick.t.name} — ${pick.s}` : ""} sub="Stage detail" width={420}>
        {pick && (
          <div className="space-y-4">
            <div className="flex items-center gap-4"><div className="num text-[44px] font-semibold leading-none tracking-[-0.03em]">{pick.v}%</div><div className="flex-1"><Bar value={pick.v} h={8} tone={pick.v === 100 ? "good" : "accent"} /><div className="mt-1 text-[12px] text-mute">{pick.v === 100 ? "Stage complete" : `${100 - pick.v}% remaining`}</div></div></div>
            <div>
              <Kv k="Floors done" v={pick.t.id === "EX" ? "—" : `${Math.round((pick.v / 100) * pick.t.floors)} of ${pick.t.floors}`} />
              <Kv k="Contractor" v={DETAIL[pick.s]?.[0] ?? "Shivam Civil Contractors"} />
              <Kv k="Scope" v={DETAIL[pick.s]?.[1] ?? "As per BOQ"} />
              <Kv k="Daily output" v={pick.v === 100 ? "—" : "~1 floor / 4 days"} />
              <Kv k="Expected completion" v={pick.v === 100 ? "Completed" : pick.v > 70 ? "Nov 2026" : pick.v > 30 ? "Jan 2027" : "Feb 2027"} />
            </div>
            <div className="rounded-[6px] bg-panel p-3 text-[12.5px] text-mute">{pick.s === "Structure" && pick.t.id === "B" ? "Block B slab reinforcement is on the critical path — 12mm steel arrives 09 Oct." : "Progress verified against measurement book and site photos."}</div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
