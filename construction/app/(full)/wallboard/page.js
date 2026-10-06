"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Package, Receipt, Timer, X } from "lucide-react";
import { ALERTS, CASH_CHAIN, PROJECTS } from "@/data/core";
import SiteMap from "@/components/dashboard/SiteMap";
import SiteArt from "@/components/site/SiteArt";
import { Bar, Counter, Ring, TONES, cn } from "@/components/ui/ui";
import { Logo } from "@/components/shell/AppShell";
import { cr } from "@/lib/format";

export default function Wallboard() {
  const router = useRouter();
  const [now, setNow] = useState(() => new Date("2026-10-06T14:20:00")), [hi, setHi] = useState(0);
  useEffect(() => {
    const a = setInterval(() => setNow((n) => new Date(n.getTime() + 1000)), 1000), b = setInterval(() => setHi((h) => (h + 1) % ALERTS.length), 4500);
    const k = (e) => e.key === "Escape" && router.push("/command-center");
    window.addEventListener("keydown", k);
    return () => { clearInterval(a); clearInterval(b); window.removeEventListener("keydown", k); };
  }, [router]);
  const t = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const stat = [["Active projects", 7, "", "good"], ["Overall completion", 55, "%", "accent"], ["Delayed", 1, "", "bad"], ["Critical alerts", 4, "", "risk"], ["Workers on site", 606, "", "info"]];
  return (
    <div data-theme="dark" className="wallboard fixed inset-0 flex flex-col overflow-hidden bg-bg p-4 text-ink">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-70" />
      <header className="relative z-10 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-4"><Logo dark /><span className="hazard h-4 w-16" /><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">Executive control room</span></div>
        <div className="flex items-center gap-5"><div className="text-right"><div className="num text-[26px] font-semibold leading-none tracking-tight">{t}</div><div className="text-[11px] uppercase tracking-[0.12em] text-faint">Tue · 06 Oct 2026</div></div>
          <Link href="/command-center" className="flex items-center gap-1.5 rounded-[6px] border border-line-strong px-3 py-1.5 text-[12px] text-mute hover:text-ink"><X size={14} /> Exit · Esc</Link></div>
      </header>
      <div className="relative z-10 mb-3 grid grid-cols-5 gap-3">
        {stat.map(([l, v, s, tn]) => <div key={l} className="rounded-[8px] border border-line bg-surface/80 px-4 py-3"><div className="text-[11px] font-medium uppercase tracking-[0.1em] text-faint">{l}</div><div className="num display text-[44px] font-semibold leading-none" style={{ color: TONES[tn].var }}><Counter value={v} suffix={s} /></div></div>)}
      </div>
      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-[330px_1fr_360px] gap-3">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="rounded-[8px] border border-line bg-surface/80 p-4">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">Portfolio</div>
            <div className="flex items-center gap-4"><Ring size={120} stroke={11} value={55} tone="accent" label="55%" sub="complete" />
              <div className="space-y-1.5 text-[13px]">{[["On track", 4, "good"], ["Attention", 1, "warn"], ["Cost risk", 1, "risk"], ["Delayed", 1, "bad"]].map(([l, n, tn]) => <div key={l} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: TONES[tn].var }} /><span className="w-20 text-mute">{l}</span><b className="num">{n}</b></div>)}</div></div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden rounded-[8px] border border-line bg-surface/80 p-3">
            <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">Projects</div>
            <div className="space-y-2.5">{PROJECTS.map((p) => (
              <div key={p.id}><div className="flex items-center justify-between text-[13px]"><span className="flex items-center gap-2 font-medium"><span className={cn("h-2 w-2 rounded-full", p.status !== "On Track" && "blink")} style={{ background: TONES[p.mapTone].var }} />{p.name}</span><span className="num font-semibold">{p.pct}%</span></div><Bar value={p.pct} tone={p.mapTone} h={5} marker={p.planned} className="mt-1" /></div>))}</div>
          </div>
        </div>
        <div className="flex min-h-0 flex-col gap-3">
          <div className="min-h-0 flex-1 overflow-hidden rounded-[8px] border border-line"><SiteMap height="100%" dark /></div>
          <div className="grid grid-cols-6 gap-3">{CASH_CHAIN.map((c) => <div key={c.k} className="rounded-[8px] border border-line bg-surface/80 px-3 py-2"><div className="text-[10px] font-medium uppercase tracking-[0.08em] text-faint">{c.k}</div><div className="num text-[22px] font-semibold leading-tight" style={{ color: c.tone === "mute" ? undefined : TONES[c.tone].var }}>{cr(c.v)}</div></div>)}</div>
        </div>
        <div className="flex min-h-0 flex-col gap-3">
          <div className="min-h-0 flex-1 rounded-[8px] border border-line bg-surface/80 p-3">
            <div className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-faint"><AlertTriangle size={12} /> Critical alerts</div>
            <div className="space-y-2">{ALERTS.map((a, i) => (
              <div key={a.id} className={cn("relative overflow-hidden rounded-[6px] border p-3 transition-all", i === hi ? "scale-[1.01] border-line-strong bg-panel" : "border-line opacity-70")}>
                <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: TONES[a.tone].var }} />
                <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: TONES[a.tone].var }}>{a.kind}</div>
                <div className="text-[14px] font-semibold">{a.title}</div><div className="text-[12px] text-mute">{a.lines[0]} · {a.lines[a.lines.length - 1]}</div>
              </div>))}</div>
          </div>
          <div className="rounded-[8px] border border-line bg-surface/80 p-3">
            <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">Live sites</div>
            <div className="grid grid-cols-3 gap-2">{PROJECTS.slice(0, 6).map((p) => <div key={p.id} className="relative overflow-hidden rounded-[4px]"><SiteArt kind={p.kind} progress={p.pct} seed={p.seed} tone="night" className="aspect-[4/3] w-full" /><div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-0.5 text-[10px] text-white">{p.city} · {p.workers}</div></div>)}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[8px] border border-line bg-surface/80 p-3"><div className="flex items-center gap-1 text-[10.5px] uppercase tracking-[0.1em] text-faint"><Receipt size={11} /> Collections today</div><div className="num text-[24px] font-semibold text-good">₹28L</div></div>
            <div className="rounded-[8px] border border-line bg-surface/80 p-3"><div className="flex items-center gap-1 text-[10.5px] uppercase tracking-[0.1em] text-faint"><Package size={11} /> Material risk</div><div className="num text-[24px] font-semibold text-bad">4 items</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
