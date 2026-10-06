"use client";
import { HEALTH, HEALTH_NOTE, getProject } from "@/data/core";
import { Bar, Insight, Ring } from "@/components/ui/ui";

const tone = (v) => (v >= 85 ? "good" : v >= 70 ? "warn" : v >= 55 ? "risk" : "bad");
export default function Health({ id }) {
  const h = HEALTH[id], p = getProject(id);
  return (
    <div className="grid gap-5 sm:grid-cols-[150px_1fr]">
      <div className="flex flex-col items-center"><Ring size={140} stroke={11} value={p.health} tone={tone(p.health)} label={`${p.health}`} sub="of 100" /><div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-faint">Project health</div></div>
      <div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
          {Object.entries(h).map(([k, v]) => (
            <div key={k}><div className="mb-1 flex justify-between text-[12px]"><span className="text-mute">{k}</span><span className="num font-semibold">{v}</span></div><Bar value={v} tone={tone(v)} h={5} /></div>
          ))}
        </div>
        <div className="mt-3.5"><Insight>{HEALTH_NOTE[id]}</Insight></div>
      </div>
    </div>
  );
}
