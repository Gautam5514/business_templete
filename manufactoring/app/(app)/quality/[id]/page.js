"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Camera, Check, X } from "lucide-react";
import { Btn, Card, Field, Input, Kpi, KV, PageHeader, Pill, Progress } from "@/components/ui/ui";
import { HBar } from "@/components/ui/charts";
import { useStore } from "@/lib/store";
import { CHECKLIST, DEFECTS_1182 } from "@/data/orders";
import { fdt, num } from "@/lib/format";
import { BatchLink, WoLink } from "@/components/ui/links";

const R = { Pass: "bg-ok text-white", Fail: "bg-bad text-white", "N/A": "bg-panel text-mute" };

export default function QcDetail() {
  const { id } = useParams();
  const { qcs, toast } = useStore();
  const q = qcs.find((x) => x.id === id);
  const is = id === "QC-1182";
  const [list, setList] = useState(CHECKLIST.map((c) => ({ ...c })));
  const [photos, setPhotos] = useState(is ? ["dent-close-up.jpg", "weld-pinhole.jpg"] : []);
  if (!q) return <Card><div className="p-6 text-center text-[13px] text-mute">Inspection {id} not found. <Link href="/quality" className="text-accent">Back</Link></div></Card>;
  const defects = is ? DEFECTS_1182 : q.rejected ? [["Surface Dent", Math.ceil(q.rejected * 0.45), "Forming press"], ["Welding Issue", Math.ceil(q.rejected * 0.3), "Welding station"], ["Scratch", Math.floor(q.rejected * 0.25), "Handling"]] : [];
  const cycle = (i) => setList((l) => l.map((c, j) => (j === i ? { ...c, result: c.result === "Pass" ? "Fail" : c.result === "Fail" ? "N/A" : "Pass" } : c)));
  return (
    <div>
      <PageHeader crumbs={[{ label: "Quality Control", href: "/quality" }, { label: q.id }]} title={<span className="flex items-center gap-3">{q.id}<Pill>{q.status}</Pill>{q.rate > 3 && <Pill tone="bad">{q.rate.toFixed(2)}% rejection</Pill>}</span>} sub={`${q.product} · ${q.batch}`}
        actions={<><Btn onClick={() => toast("Batch put on QC hold", "bad", "Dispatch blocked until released")}>Hold batch</Btn><Btn variant="primary" onClick={() => toast("Inspection signed off", "ok", "Accepted units released to packing")}>Sign off</Btn></>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Kpi label="Inspected" value={num(q.inspected)} sub="units" /><Kpi label="Accepted" value={num(q.accepted)} /><Kpi label="Rejected" value={num(q.rejected)} tone="bad" /><Kpi label="Rework" value={num(q.rework)} tone="warn" sub="re-routed to polishing" /></div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Inspection" className="lg:col-span-1">
          <div className="grid grid-cols-2 gap-3.5"><KV label="Work order">{q.ref.startsWith("WO") ? <WoLink id={q.ref} /> : q.ref}</KV><KV label="Batch">{q.batch.startsWith("FG") ? <BatchLink id={q.batch} /> : q.batch}</KV><KV label="Inspector">{q.inspector}</KV><KV label="Time"><span className="num">{fdt(q.ts)}</span></KV></div>
          {q.inspected > 0 && <div className="mt-4"><Progress value={q.accepted} max={q.inspected} tone="ok" /><div className="mt-1 text-[12px] text-mute">{((q.accepted / q.inspected) * 100).toFixed(1)}% accepted</div></div>}
        </Card>
        <Card title="Defects found" className="lg:col-span-2">
          {defects.length ? <div className="space-y-3">{defects.map(([k, n, why]) => <HBar key={k} label={k} right={`${n} units`} pct={(n / defects[0][1]) * 100} tone="bad" sub={`Likely cause: ${why}`} />)}</div> : <p className="text-[13px] text-mute">No defects recorded.</p>}
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Checklist" sub="Tap a result to cycle Pass → Fail → N/A" pad={false}>
          <ul className="divide-y divide-line">
            {list.map((c, i) => (
              <li key={c.item} className="flex items-center gap-3 px-4 py-2.5">
                <button onClick={() => cycle(i)} className={`flex h-6 w-[58px] shrink-0 items-center justify-center gap-1 rounded-[4px] text-[11.5px] font-medium ${R[c.result]}`}>{c.result === "Pass" ? <Check size={11} /> : c.result === "Fail" ? <X size={11} /> : null}{c.result}</button>
                <div className="min-w-0 flex-1"><div className="text-[13px] font-medium">{c.item}</div><input value={c.note} onChange={(e) => setList((l) => l.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))} placeholder="Comment…" className="w-full bg-transparent text-[12px] text-mute placeholder:text-faint focus:outline-none" /></div>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Photos" sub="Attach evidence from the shop floor">
          <div className="grid grid-cols-3 gap-2.5">
            {photos.map((p) => <div key={p} className="hatch flex aspect-square flex-col items-center justify-end rounded-[8px] border border-line bg-panel p-1.5"><span className="w-full truncate rounded bg-surface/90 px-1.5 py-0.5 text-center text-[10.5px] text-mute">{p}</span></div>)}
            <button onClick={() => { setPhotos((p) => [...p, `photo-${p.length + 1}.jpg`]); toast("Photo attached", "ok"); }} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[8px] border border-dashed border-line-strong text-[12px] text-mute hover:border-accent hover:text-accent"><Camera size={18} />Add photo</button>
          </div>
          <div className="mt-4"><Field label="Inspector note"><Input defaultValue={is ? "Dent pattern repeats at same position — die guide wear suspected." : ""} placeholder="Add a note…" /></Field></div>
        </Card>
      </div>
    </div>
  );
}
