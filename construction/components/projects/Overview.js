"use client";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Sparkles, UserRound } from "lucide-react";
import { getProject, HEALTH } from "@/data/core";
import SiteArt from "@/components/site/SiteArt";
import { Bar, Card, Counter, Pill, Ring, Tip, cn } from "@/components/ui/ui";
import { cr, fdate } from "@/lib/format";
import { EvmPanel, SCurve } from "./Charts";
import Health from "./Health";
import BuildingProgress from "./BuildingProgress";
import { MilestoneTimeline } from "./Timeline";
import { DailyStory } from "@/components/site/Dpr";
import { useStore } from "@/lib/store";

export const delayDays = (p) => Math.max(0, p.planned - p.pct);

export function ProjectHero({ p }) {
  const v = p.pct - p.planned, dd = delayDays(p);
  return (
    <div className="overflow-hidden rounded-[8px] border border-line bg-surface">
      <div className="grid lg:grid-cols-[300px_1fr]">
        <div className="relative min-h-[200px]"><SiteArt kind={p.kind} progress={p.pct} seed={p.seed} className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white"><div className="flex items-center gap-1 text-[12px]"><MapPin size={12} />{p.city}, {p.state}</div></div></div>
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><div className="flex items-center gap-2"><h1 className="display text-[30px] font-semibold leading-tight">{p.name}</h1><Pill tone={p.mapTone === "info" ? "good" : p.mapTone}>{p.status}</Pill></div>
              <p className="text-[13px] text-mute">{p.type} · {p.scope}</p><p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-mute"><UserRound size={13} />Client: <b className="text-ink">{p.client}</b> · PM: <b className="text-ink">{p.pm}</b></p></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[["Contract value", cr(p.value)], ["Start date", fdate(p.start, true)], ["Planned completion", fdate(p.end, true)], ["Days remaining", `${p.days}`]].map(([k, val]) => <div key={k}><div className="text-[10.5px] uppercase tracking-[0.06em] text-faint">{k}</div><div className="num text-[20px] font-semibold tracking-[-0.02em]">{val}</div></div>)}
          </div>
          <div className="mt-5 grid items-center gap-5 border-t border-line pt-4 sm:grid-cols-[130px_1fr_1fr]">
            <Ring size={124} stroke={11} value={p.pct} tone={p.mapTone === "info" ? "good" : p.mapTone === "good" ? "accent" : p.mapTone} label={`${p.pct}%`} sub="Project completion" />
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-faint">Planned vs actual</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-3"><span className="w-14 text-[12px] text-mute">Planned</span><Bar value={p.planned} h={7} tone="mute" className="flex-1" /><span className="num w-9 text-right text-[13px] font-semibold">{p.planned}%</span></div>
                <div className="flex items-center gap-3"><span className="w-14 text-[12px] text-mute">Actual</span><Bar value={p.pct} h={7} tone="accent" className="flex-1" /><span className="num w-9 text-right text-[13px] font-semibold">{p.pct}%</span></div>
              </div>
              <div className={cn("mt-2 text-[13px] font-semibold", v < 0 ? "text-bad" : "text-good")}>Variance {v > 0 ? "+" : ""}{v}% {dd > 0 && <span className="font-normal text-mute">· ≈ {dd} day{dd > 1 ? "s" : ""} equivalent delay</span>}</div>
            </div>
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-faint">Budget consumed</div>
              <div className="num text-[28px] font-semibold leading-none tracking-[-0.03em]">{p.budget}%</div>
              <Bar value={p.budget} h={7} tone={p.budget > p.pct + 4 ? "risk" : "good"} className="mt-2" marker={p.pct} />
              <div className="mt-1.5 text-[12px] text-mute">{p.budget > p.pct + 4 ? <span className="font-medium text-risk">Spending faster than progress ({p.budget}% vs {p.pct}%)</span> : "Spending in line with progress"} · {cr(p.spent)} of {cr(p.value)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Overview({ p, go }) {
  const { setAskOpen, setAskSeed } = useStore();
  const sky = p.id === "skyline";
  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card title="Project health" sub="Six signals combined into one score"><Health id={p.id} /></Card>
        <Card title="Today at site" sub={`${p.workers} workers · ${p.weather}`} action={<button onClick={() => go("Daily Progress")} className="flex items-center gap-1 text-[12px] font-semibold text-accent-ink">Daily report <ArrowRight size={12} /></button>}>
          <ul className="space-y-2 text-[13px]">
            {sky ? ["Tower A slab (L14) completed 4:18 PM", "18 MT TMT steel (16mm) received & QC-passed", "Tower B L11 reinforcement inspection passed", "Crane TC-02 down since 2:40 PM"].map((t, i) => <li key={i} className="flex gap-2"><span className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", i === 3 ? "bg-bad" : "bg-good")} />{t}</li>)
              : [`${p.workers} workers on site`, `${p.issues} open issues`, `Last update ${p.update}`].map((t) => <li key={t} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{t}</li>)}
          </ul>
          <button onClick={() => { setAskSeed(`What happened at ${p.name.split(" ")[0]} today?`); setAskOpen(true); }} className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-accent-ink"><Sparkles size={13} /> Ask SiteControl about today</button>
        </Card>
      </div>
      <Card title="Milestones" sub="Planned vs actual dates, variance and owner"><MilestoneTimeline p={p} /></Card>
      {sky && <Card title="Building progress" sub="Where each tower stands, stage by stage" action={<button onClick={() => go("Visual Progress")} className="flex items-center gap-1 text-[12px] font-semibold text-accent-ink">Full view <ArrowRight size={12} /></button>}><BuildingProgress compact /></Card>}
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card title="S-curve — planned vs actual progress" sub="Cumulative completion % · shaded area is earned value (₹ Cr)"><SCurve /></Card>
        <Card title="Earned value, in plain language" sub="Is the project on time and on budget?"><EvmPanel /></Card>
      </div>
    </div>
  );
}
