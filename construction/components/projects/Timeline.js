"use client";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Check, ChevronDown, Circle, CircleDot, Diamond } from "lucide-react";
import { MILESTONES } from "@/data/core";
import { GANTT, CRIT_PATH } from "@/data/ops";
import { Bar, Card, Insight, Pill, Seg, cn, TONES } from "@/components/ui/ui";
import { fdate } from "@/lib/format";

export function genMilestones(p) {
  if (!p || p.id === "skyline") return MILESTONES;
  const t0 = new Date(p.start).getTime(), t1 = new Date(p.end).getTime(), at = (f) => new Date(t0 + (t1 - t0) * f).toISOString().slice(0, 10);
  const names = [["Excavation", 0, 0.1, "Civil team"], ["Foundation", 0.1, 0.28, "Civil team"], ["Structure", 0.28, 0.58, "Structural"], ["Masonry", 0.5, 0.74, "Civil team"], ["MEP", 0.6, 0.86, "MEP team"], ["Finishes", 0.78, 0.97, "Interiors"], ["Handover", 0.97, 1, p.pm]];
  const prog = p.pct / 100, delay = Math.max(0, p.planned - p.pct);
  return names.map(([name, a, b, owner]) => {
    const done = prog > b, on = !done && prog > a - 0.02, pctDone = done ? 100 : on ? Math.min(98, Math.round(((prog - a) / (b - a)) * 100)) : Math.max(0, Math.round(((prog - a + 0.1) / (b - a)) * 40));
    return { name, state: done ? "Completed" : on ? "In Progress" : "Upcoming", pctDone, ps: at(a), pe: at(b), as: done || on ? at(a + 0.01) : null, ae: done ? at(b + delay / 400) : null, var: done || on ? delay : 0, owner };
  });
}
export function MilestoneTimeline({ p }) {
  const MS = genMilestones(p);
  return (
    <div className="scroll-thin overflow-x-auto pb-2">
      <div className="flex min-w-[980px]">
        {MS.map((m, i) => {
          const done = m.state === "Completed", on = m.state === "In Progress";
          return (
            <div key={m.name} className="relative flex-1 pr-3">
              <div className="relative mb-3 flex items-center">
                <span className={cn("z-10 flex h-6 w-6 items-center justify-center rounded-full border-2", done ? "border-good bg-good text-white" : on ? "border-accent bg-surface" : "border-line-strong bg-surface")}>
                  {done ? <Check size={13} strokeWidth={3} /> : on ? <span className="h-2 w-2 rounded-full bg-accent blink" /> : <Circle size={6} className="text-faint" />}
                </span>
                {i < MS.length - 1 && <span className={cn("absolute left-6 right-[-12px] h-[2px]", done ? "bg-good" : "bg-line-strong")} />}
              </div>
              <div className="text-[13px] font-semibold">{m.name}</div>
              <div className={cn("text-[11px] font-semibold uppercase tracking-wide", done ? "text-good" : on ? "text-accent-ink" : "text-faint")}>{m.state}</div>
              <Bar value={m.pctDone} h={4} tone={done ? "good" : "accent"} className="my-2 max-w-[120px]" />
              <dl className="space-y-0.5 text-[11px] text-mute">
                <div className="flex gap-1"><dt className="w-11 text-faint">Plan</dt><dd className="num">{fdate(m.ps)} → {fdate(m.pe)}</dd></div>
                <div className="flex gap-1"><dt className="w-11 text-faint">Actual</dt><dd className="num">{m.as ? `${fdate(m.as)} → ${m.ae ? fdate(m.ae) : "…"}` : "—"}</dd></div>
                <div className="flex gap-1"><dt className="w-11 text-faint">Var</dt><dd className={cn("num font-semibold", m.var > 2 ? "text-bad" : m.var > 0 ? "text-warn" : "text-mute")}>{m.var ? `+${m.var} days` : "—"}</dd></div>
                <div className="flex gap-1"><dt className="w-11 text-faint">Owner</dt><dd className="truncate">{m.owner}</dd></div>
              </dl>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PX = 2.1, ROW = 30, TODAY = 264;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
export function Gantt() {
  const [crit, setCrit] = useState("all");
  const [collapsed, setCollapsed] = useState(new Set());
  const rows = useMemo(() => {
    const out = []; let skip = null;
    GANTT.forEach((r, i) => {
      if (skip != null && r.lvl > skip) return; skip = null;
      if (crit === "crit" && !r.crit && r.lvl > 0) return;
      const hasKids = GANTT[i + 1] && GANTT[i + 1].lvl > r.lvl;
      out.push({ ...r, hasKids });
      if (collapsed.has(r.id)) skip = r.lvl;
    });
    return out;
  }, [collapsed, crit]);
  const idx = Object.fromEntries(rows.map((r, i) => [r.id, i]));
  const total = 430 * PX;
  const monthStarts = [0, 17, 45, 76, 106, 137, 167, 198, 229, 259, 290, 320, 351, 382];
  return (
    <div className="overflow-hidden rounded-[8px] border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-3 py-2"><Seg options={[{ key: "all", label: "All activities" }, { key: "crit", label: "Critical path" }]} value={crit} onChange={setCrit} /><div className="hidden items-center gap-3 text-[11px] text-mute sm:flex"><span className="flex items-center gap-1"><i className="h-2 w-4 rounded-[1px] bg-accent" />Actual</span><span className="flex items-center gap-1"><i className="h-2 w-4 rounded-[1px] bg-line-strong" />Planned</span><span className="flex items-center gap-1"><i className="h-2 w-4 rounded-[1px] bg-bad" />Critical / delay</span><span className="flex items-center gap-1"><i className="h-3 w-px bg-ink" />Today</span></div></div>
      <div className="flex">
        <div className="w-[340px] shrink-0 border-r border-line">
          <div className="flex h-8 items-center border-b border-line bg-panel px-3 text-[10.5px] font-semibold uppercase tracking-wider text-faint"><span className="flex-1">Work breakdown</span><span className="w-20">Team</span><span className="w-9 text-right">%</span></div>
          {rows.map((r) => (
            <div key={r.id} style={{ height: ROW }} className="flex items-center border-b border-line/60 px-3 text-[12px] hover:bg-panel">
              <div className="flex min-w-0 flex-1 items-center gap-1" style={{ paddingLeft: r.lvl * 14 }}>
                {r.hasKids ? <button onClick={() => { const n = new Set(collapsed); n.has(r.id) ? n.delete(r.id) : n.add(r.id); setCollapsed(n); }}><ChevronDown size={12} className={cn("text-faint transition-transform", collapsed.has(r.id) && "-rotate-90")} /></button> : <span className="w-3" />}
                {r.type === "Milestone" && <Diamond size={10} className="text-info" />}
                <span className={cn("truncate", r.lvl < 2 ? "font-semibold" : "", r.crit && "text-bad")}>{r.name}</span>
                {r.delay && <span className="num rounded-[3px] bg-bad-soft px-1 text-[10px] font-bold text-bad">+{r.delay}d</span>}
              </div>
              <span className="w-20 truncate text-[11px] text-mute">{r.resp}</span><span className="num w-9 text-right font-semibold">{r.prog}%</span>
            </div>
          ))}
        </div>
        <div className="scroll-thin flex-1 overflow-x-auto">
          <div className="relative" style={{ width: total }}>
            <div className="relative flex h-8 border-b border-line bg-panel">{monthStarts.map((d, i) => <div key={i} className="absolute top-0 flex h-full items-center border-l border-line pl-1.5 text-[10.5px] font-medium text-faint" style={{ left: d * PX }}>{MONTHS[i]}{i > 11 ? " ’27" : i === 0 ? " ’26" : ""}</div>)}</div>
            <div className="relative" style={{ height: rows.length * ROW }}>
              {monthStarts.map((d, i) => <div key={i} className="absolute inset-y-0 border-l border-line/50" style={{ left: d * PX }} />)}
              <div className="absolute inset-y-0 z-20 w-px bg-ink" style={{ left: TODAY * PX }}><span className="absolute -top-0 left-1 rounded-[3px] bg-ink px-1 text-[9.5px] font-bold text-bg">TODAY</span></div>
              <svg className="pointer-events-none absolute inset-0 z-10" width={total} height={rows.length * ROW}>
                {rows.filter((r) => r.dep && idx[r.dep] != null).map((r) => {
                  const a = rows[idx[r.dep]], x1 = (a.s + a.d) * PX, y1 = idx[r.dep] * ROW + ROW / 2, x2 = r.s * PX, y2 = idx[r.id] * ROW + ROW / 2;
                  return <path key={r.id} d={`M${x1},${y1} h6 V${y2} H${x2 - 2}`} fill="none" stroke="var(--bad)" strokeWidth="1.3" markerEnd="url(#ah)" opacity="0.8" />;
                })}
                <defs><marker id="ah" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6z" fill="var(--bad)" /></marker></defs>
              </svg>
              {rows.map((r, i) => (
                <div key={r.id} className="absolute inset-x-0 border-b border-line/40" style={{ top: i * ROW, height: ROW }}>
                  {r.type === "Milestone" ? <Diamond size={14} className="absolute text-info" style={{ left: r.s * PX - 3, top: 8 }} fill="currentColor" /> : (
                    <div className="absolute rounded-[2px]" style={{ left: r.s * PX, width: r.d * PX, top: r.lvl < 2 ? 11 : 9, height: r.lvl < 2 ? 8 : 12, background: "var(--line-strong)", outline: r.crit ? "1.5px solid var(--bad)" : "none" }}>
                      <div className="h-full rounded-[2px]" style={{ width: `${r.prog}%`, background: r.crit ? "var(--bad)" : r.lvl < 2 ? "var(--ink)" : "var(--accent)" }} />
                      {r.delay && <div className="absolute top-0 h-full bg-bad/40" style={{ left: "100%", width: r.delay * PX }} />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CriticalPath() {
  return (
    <Card title="Critical path" sub="Activities where any delay moves the handover date">
      <div className="flex flex-wrap items-stretch gap-1.5">
        {CRIT_PATH.map((c, i) => (
          <div key={c.s} className="flex items-center gap-1.5">
            <div className="rounded-[6px] border px-3 py-2" style={{ borderColor: TONES[c.tone].var, background: `color-mix(in srgb, ${TONES[c.tone].var} 8%, transparent)` }}><div className="text-[12.5px] font-semibold">{c.s}</div><div className={cn("text-[11px] font-medium", TONES[c.tone].text)}>{c.note}</div></div>
            {i < CRIT_PATH.length - 1 && <ArrowRight size={14} className="text-faint" />}
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-[6px] bg-panel p-3"><div className="text-[11px] uppercase tracking-wide text-faint">Steel procurement delay</div><div className="num text-[20px] font-semibold text-bad">4 days</div></div><div className="rounded-[6px] bg-panel p-3"><div className="text-[11px] uppercase tracking-wide text-faint">Projected project impact</div><div className="num text-[20px] font-semibold text-warn">3 days</div></div></div>
      <div className="mt-3"><Insight tone="warn" title="AI warning">If PO-1844 is not delivered by 09 Oct, Block B slab casting slips beyond 28 Oct and pushes masonry start by 3 days. Approving the faster supplier recovers 2 of those days.</Insight></div>
    </Card>
  );
}
