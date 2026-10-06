"use client";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CircleAlert, Clock, Package, Receipt, TrendingDown } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ALERTS, CASH_CHAIN, PROJECTS } from "@/data/core";
import SiteArt from "@/components/site/SiteArt";
import { Bar, Btn, Counter, Pill, Ring, Spark, TONES, cn } from "@/components/ui/ui";
import { cr } from "@/lib/format";
import { useStore } from "@/lib/store";

export function ProjectCard({ p }) {
  const spark = Array.from({ length: 10 }, (_, i) => Math.round(p.pct * ((i + 1) / 10) ** 1.15 + (i % 3) * 0.6));
  const delta = p.pct - p.planned;
  return (
    <Link href={`/projects/${p.id}`} className="lift group flex overflow-hidden rounded-[8px] border border-line bg-surface">
      <div className="relative hidden w-[150px] shrink-0 sm:block"><SiteArt kind={p.kind} progress={p.pct} seed={p.seed} className="absolute inset-0 h-full w-full" /></div>
      <div className="min-w-0 flex-1 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0"><h4 className="truncate text-[14.5px] font-semibold tracking-[-0.01em]">{p.name}</h4><p className="truncate text-[12px] text-mute">{p.type} · {p.city} · {p.client}</p></div>
          <Pill tone={p.mapTone === "info" ? "good" : p.mapTone}>{p.status}</Pill>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-4">
          <div><div className="text-[10.5px] uppercase tracking-[0.06em] text-faint">Complete</div><div className="num text-[18px] font-semibold leading-tight">{p.pct}%</div><div className={cn("num text-[11px]", delta < -2 ? "text-bad" : "text-mute")}>{delta === 0 ? "on plan" : `${delta > 0 ? "+" : ""}${delta}% vs plan`}</div></div>
          <div><div className="text-[10.5px] uppercase tracking-[0.06em] text-faint">Project</div><div className="num text-[18px] font-semibold leading-tight">{cr(p.value)}</div><div className="num text-[11px] text-mute">{cr(p.spent)} spent · {cr(p.earned)} earned</div></div>
          <div><div className="text-[10.5px] uppercase tracking-[0.06em] text-faint">Remaining</div><div className="num text-[18px] font-semibold leading-tight">{p.days}d</div><div className="text-[11px] text-mute">{p.budget}% budget used</div></div>
          <div className="flex items-end justify-between"><div><div className="text-[10.5px] uppercase tracking-[0.06em] text-faint">Margin</div><div className={cn("num text-[18px] font-semibold leading-tight", p.margin < 10 ? "text-risk" : "text-good")}>{p.margin}%</div></div><Spark data={spark} tone={p.mapTone === "info" ? "good" : p.mapTone} w={56} h={26} /></div>
        </div>
        <div className="mt-3"><Bar value={p.pct} tone={p.mapTone} h={5} marker={p.planned} /></div>
      </div>
    </Link>
  );
}

const ALERT_ICON = { "Project Delay": Clock, "Budget Risk": TrendingDown, "Client Payment": Receipt, "Material Shortage": Package };
export function AlertsPanel({ limit }) {
  const { setAskSeed, setAskOpen } = useStore();
  return (
    <div className="space-y-2.5">
      {ALERTS.slice(0, limit).map((a) => {
        const Ico = ALERT_ICON[a.kind] || AlertTriangle; const t = TONES[a.tone];
        return (
          <div key={a.id} className="lift relative overflow-hidden rounded-[8px] border border-line bg-surface p-3.5 pl-4">
            <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: t.var }} />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className={cn("flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em]", t.text)}><Ico size={13} />{a.kind}</div>
                <div className="mt-1 text-[14.5px] font-semibold">{a.title}</div>
                <ul className="mt-1 space-y-0.5">{a.lines.map((l) => <li key={l} className="text-[12.5px] text-mute">{l}</li>)}</ul>
              </div>
              <div className="shrink-0 text-right">
                <div className={cn("num rounded-[4px] px-2 py-1 text-[11.5px] font-semibold", t.bg, t.text)}>{a.impact}</div>
                {a.ask ? <button onClick={() => { setAskSeed(a.ask); setAskOpen(true); }} className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-accent-ink">{a.cta} <ArrowRight size={12} /></button>
                  : <Link href={a.href} className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-accent-ink">{a.cta} <ArrowRight size={12} /></Link>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** "Work kiya kitna vs paisa mila kitna" — funnel from contract value down to cash collected */
export function CashWaterfall({ dark }) {
  const max = CASH_CHAIN[0].v;
  return (
    <div className="space-y-1.5">
      {CASH_CHAIN.map((r, i) => {
        const prev = CASH_CHAIN[i - 1];
        const drop = prev && r.k !== "Outstanding" ? +(prev.v - r.v).toFixed(1) : null;
        return (
          <div key={r.k}>
            <div className="grid grid-cols-[110px_1fr_70px] items-center gap-3 sm:grid-cols-[130px_1fr_80px]">
              <div className="text-[12.5px] font-medium">{r.k}</div>
              <div className="relative h-7 rounded-[3px] bg-panel" style={{ boxShadow: "inset 0 0 0 1px var(--line)" }}>
                <div className="absolute inset-y-0 left-0 rounded-[3px] transition-all duration-1000" style={{ width: `${(r.v / max) * 100}%`, background: TONES[r.tone].var, opacity: r.k === "Contract Value" ? 0.35 : 1, minWidth: 3 }} />
                {drop != null && drop > 0 && <div className="absolute inset-y-0 flex items-center text-[10.5px] font-semibold text-faint" style={{ left: `calc(${(r.v / max) * 100}% + 6px)` }}>−{cr(drop)} {r.k === "Billed" ? "unbilled" : r.k === "Certified" ? "in query" : r.k === "Collected" ? "pending" : ""}</div>}
              </div>
              <div className="num text-right text-[14px] font-semibold">{cr(r.v)}</div>
            </div>
            <div className="ml-[122px] hidden text-[11px] text-faint sm:block">{r.note}</div>
          </div>
        );
      })}
    </div>
  );
}
