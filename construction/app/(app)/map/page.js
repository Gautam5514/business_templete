"use client";
import Link from "next/link";
import { PROJECTS } from "@/data/core";
import SiteMap from "@/components/dashboard/SiteMap";
import { Pill, PageHead, Bar } from "@/components/ui/ui";
import { cr } from "@/lib/format";
import { Map } from "lucide-react";

export default function MapPage() {
  return (
    <div>
      <PageHead icon={Map} title="Site map" sub="All projects across Jharkhand, Bihar and West Bengal. Click a pin for the project summary." />
      <div className="grid overflow-hidden rounded-[8px] border border-line bg-surface lg:grid-cols-[1fr_320px]">
        <SiteMap height={640} />
        <div className="divide-y divide-line border-t border-line lg:border-l lg:border-t-0">
          {PROJECTS.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="block p-3.5 hover:bg-panel">
              <div className="flex items-center justify-between"><span className="text-[13px] font-semibold">{p.name}</span><Pill tone={p.mapTone}>{p.status === "On Track" && p.nearDone ? "Near done" : p.status}</Pill></div>
              <div className="mt-0.5 text-[11.5px] text-mute">{p.city} · {cr(p.value)} · PM {p.pm}</div>
              <div className="mt-2 flex items-center gap-2"><Bar value={p.pct} tone={p.mapTone} h={5} marker={p.planned} /><span className="num text-[12px] font-semibold">{p.pct}%</span></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
