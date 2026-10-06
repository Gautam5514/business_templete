"use client";
import Link from "next/link";
import { AlertTriangle, CloudSun, HardHat, Users, Video } from "lucide-react";
import { PROJECTS } from "@/data/core";
import SiteArt from "@/components/site/SiteArt";
import { Bar, PageHead, Pill } from "@/components/ui/ui";

const TODAY = { skyline: ["Tower A slab casting ✓", "Tower B reinforcement", "Plumbing Block A"], orion: ["Block A L6 columns", "Basement waterproofing rework", "Steel shortage"], greenfield: ["PEB roof sheeting", "Utilities trenching"], royal: ["Podium slab shuttering", "Plumbing sleeves"], metro: ["L3 lobby tile rework", "False ceiling L2", "Paint touch-ups"], eastern: ["Floor slab PQC", "Dock leveller pits"], riverside: ["Block B reinforcement (slow)", "Crane repair"] };
export default function LiveSites() {
  return (
    <div>
      <PageHead icon={Video} title="Live sites" sub="Camera snapshots, workforce and today’s work from every site — refreshed every 15 minutes." actions={<span className="flex items-center gap-1.5 rounded-[4px] bg-bad-soft px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-bad"><span className="h-1.5 w-1.5 rounded-full bg-bad blink" /> Live</span>} />
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {PROJECTS.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}?tab=daily-progress`} className="lift group overflow-hidden rounded-[8px] border border-line bg-surface">
            <div className="relative aspect-[16/9]"><SiteArt kind={p.kind} progress={p.pct} seed={p.seed} tone={p.id === "metro" ? "dusk" : "day"} className="absolute inset-0 h-full w-full" />
              <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded bg-black/55 px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-white"><span className="h-1.5 w-1.5 rounded-full bg-bad blink" />CAM-01 · {p.city}</div>
              <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded bg-black/55 px-1.5 py-0.5 text-[11px] text-white"><CloudSun size={12} />{p.weather}</div>
              <div className="absolute bottom-2.5 left-2.5"><Pill tone={p.mapTone} className="!bg-black/60 !text-white">{p.status}</Pill></div>
              <div className="num absolute bottom-2.5 right-2.5 rounded bg-black/55 px-1.5 py-0.5 text-[11px] text-white">06 Oct · {p.update}</div></div>
            <div className="p-3.5">
              <div className="flex items-start justify-between"><div><div className="text-[14.5px] font-semibold">{p.name}</div><div className="text-[12px] text-mute">Site manager: {p.pm}</div></div><div className="text-right"><div className="num text-[22px] font-semibold leading-none">{p.pct}%</div><div className="text-[10.5px] uppercase tracking-wider text-faint">complete</div></div></div>
              <Bar value={p.pct} tone={p.mapTone} h={5} marker={p.planned} className="my-3" />
              <div className="mb-2 flex gap-4 text-[12px]"><span className="flex items-center gap-1 text-mute"><Users size={13} /><b className="num text-ink">{p.workers}</b> workers</span><span className={p.issues > 4 ? "flex items-center gap-1 text-bad" : "flex items-center gap-1 text-mute"}><AlertTriangle size={13} /><b className="num">{p.issues}</b> open issues</span></div>
              <ul className="space-y-0.5 text-[12px] text-mute">{TODAY[p.id].map((t) => <li key={t} className="flex gap-1.5"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-faint" />{t}</li>)}</ul>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
