"use client";
import { useRef, useState } from "react";
import { ChevronsLeftRight, Expand, X } from "lucide-react";
import { PHOTOS } from "@/data/ops";
import { getProject, projName } from "@/data/core";
import SiteArt from "./SiteArt";
import { Card, Modal, Pill, Seg, cn } from "@/components/ui/ui";

export function CompareSlider({ kind = "tower", before = 38, after = 71, seed = 1, labelA = "01 Sep", labelB = "06 Oct", className }) {
  const [pos, setPos] = useState(50);
  const ref = useRef(null);
  const move = (clientX) => { const r = ref.current.getBoundingClientRect(); setPos(Math.max(2, Math.min(98, ((clientX - r.left) / r.width) * 100))); };
  return (
    <div ref={ref} className={cn("relative select-none overflow-hidden rounded-[8px] border border-line", className)} onPointerMove={(e) => e.buttons === 1 && move(e.clientX)} onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); move(e.clientX); }} style={{ touchAction: "none", cursor: "ew-resize" }}>
      <SiteArt kind={kind} progress={after} seed={seed} className="block aspect-[16/9] w-full" crane />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}><SiteArt kind={kind} progress={before} seed={seed} tone="dusk" className="block aspect-[16/9] w-full" crane /></div>
      <div className="absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }}><span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-lg"><ChevronsLeftRight size={16} /></span></div>
      <span className="absolute left-3 top-3 rounded bg-black/60 px-2 py-1 text-[11px] font-semibold text-white">{labelA} · {before}%</span>
      <span className="absolute right-3 top-3 rounded bg-black/60 px-2 py-1 text-[11px] font-semibold text-white">{labelB} · {after}%</span>
    </div>
  );
}

export function ProgressCompare({ pid = "skyline" }) {
  const p = getProject(pid);
  const dates = { "15 Aug": 24, "01 Sep": 38, "20 Sep": 55, "06 Oct": Math.min(95, p.pct + 9) };
  const [a, setA] = useState("01 Sep"), [b, setB] = useState("06 Oct");
  return (
    <Card title="Progress comparison" sub="Drag the slider to compare the same view across two dates" action={<div className="flex items-center gap-2 text-[12px]"><select value={a} onChange={(e) => setA(e.target.value)} className="h-7 rounded border border-line-strong bg-surface px-1.5">{Object.keys(dates).map((d) => <option key={d}>{d}</option>)}</select><span className="text-faint">vs</span><select value={b} onChange={(e) => setB(e.target.value)} className="h-7 rounded border border-line-strong bg-surface px-1.5">{Object.keys(dates).map((d) => <option key={d}>{d}</option>)}</select></div>}>
      <CompareSlider className="mx-auto max-w-3xl" kind={p.kind} before={dates[a]} after={dates[b]} labelA={a} labelB={b} seed={p.seed} />
      <p className="mt-2 text-[12.5px] text-mute">{p.name}: Tower A advanced from {dates[a]}% to {dates[b]}% — about {Math.max(0, dates[b] - dates[a])} points of structure and finishes in {Math.abs(Number(b.slice(0, 2)) - Number(a.slice(0, 2)) || 36)} days.</p>
    </Card>
  );
}

const GROUPS = ["date", "loc", "floor", "act", "contractor", "tag"];
const GL = { date: "Date", loc: "Tower / Location", floor: "Floor", act: "Activity", contractor: "Contractor", tag: "Tag" };
export function PhotoGallery({ pid }) {
  const [by, setBy] = useState("date");
  const [view, setView] = useState(null);
  const list = PHOTOS.filter((x) => !pid || x.p === pid);
  const groups = {};
  list.forEach((x) => { (groups[x[by]] ||= []).push(x); });
  const tagTone = { Progress: "good", Quality: "info", Issue: "bad", Safety: "warn", Snag: "risk" };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2"><span className="text-[12px] text-mute">Organise by</span><Seg options={GROUPS.map((g) => ({ key: g, label: GL[g] }))} value={by} onChange={setBy} /></div>
      {Object.entries(groups).map(([g, items]) => (
        <div key={g}>
          <div className="mb-2 flex items-center gap-2"><h3 className="text-[13px] font-semibold">{g}</h3><span className="num text-[11.5px] text-faint">{items.length} photos</span></div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {items.map((x) => (
              <button key={x.id} onClick={() => setView(x)} className="lift group overflow-hidden rounded-[8px] border border-line bg-surface text-left">
                <div className="relative"><SiteArt kind={getProject(x.p).kind} progress={x.prog} seed={x.id.charCodeAt(2) + x.prog} tone={x.tone} className="aspect-[4/3] w-full" /><Expand size={14} className="absolute right-2 top-2 text-white opacity-0 drop-shadow group-hover:opacity-100" /><span className="absolute bottom-2 left-2"><Pill tone={tagTone[x.tag]}>{x.tag}</Pill></span></div>
                <div className="px-3 py-2"><div className="text-[12.5px] font-semibold">{x.loc} · {x.floor}</div><div className="text-[11.5px] text-mute">{x.act} · {x.contractor}</div><div className="num text-[11px] text-faint">{x.date}{!pid && ` · ${projName(x.p)}`}</div></div>
              </button>
            ))}
          </div>
        </div>
      ))}
      <Modal open={!!view} onClose={() => setView(null)} title={view ? `${view.loc} · ${view.floor} — ${view.act}` : ""} width={760}>
        {view && <SiteArt kind={getProject(view.p).kind} progress={view.prog} seed={view.id.charCodeAt(2) + view.prog} tone={view.tone} className="aspect-[16/9] w-full rounded-[6px]" />}
        {view && <div className="mt-3 text-[12.5px] text-mute">{projName(view.p)} · {view.date} · {view.contractor} · uploaded by Site Engineer · geo-tagged</div>}
      </Modal>
    </div>
  );
}
