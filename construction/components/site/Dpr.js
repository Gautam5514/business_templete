"use client";
import { useState } from "react";
import { AlertTriangle, Building2, Camera, Check, CloudSun, FileText, Flag, HardHat, Mic, Plus, Truck, Users, Video } from "lucide-react";
import { DAILY_STORY, DPR_ACTIVITIES, PHOTOS } from "@/data/ops";
import { getProject, PROJECTS } from "@/data/core";
import SiteArt from "./SiteArt";
import { Btn, Card, Field, Kpi, Kv, Modal, Pill, cn, inputCls, Bar } from "@/components/ui/ui";
import { useStore } from "@/lib/store";

const ICO = { users: Users, build: Building2, truck: Truck, check: Check, warn: AlertTriangle, flag: Flag, doc: FileText };

export function DailyStory({ pid = "skyline" }) {
  const p = getProject(pid);
  const story = pid === "skyline" ? DAILY_STORY : [
    { t: "07:50 AM", e: `${p.workers} workers checked in`, ico: "users" }, { t: "09:30 AM", e: `${p.type} works resumed — priority activities started`, ico: "build" },
    { t: "12:10 PM", e: "Material delivery received at gate", ico: "truck" }, { t: "03:20 PM", e: "Supervisor walk-through — no blockers", ico: "check" }, { t: "05:45 PM", e: "Daily progress submitted", ico: "doc" },
  ];
  return (
    <Card title={`Today at ${p.name}`} sub="Daily site story, assembled from DPR, gate entries, inspections and equipment logs">
      <ol className="relative ml-1">
        <span className="absolute bottom-2 left-[75px] top-2 w-px bg-line-strong" />
        {story.map((s, i) => { const I = ICO[s.ico] || Check; return (
          <li key={i} className="relative flex items-start gap-3 pb-5 last:pb-0">
            <span className="num w-[62px] shrink-0 pt-1 text-right text-[11.5px] font-medium text-mute">{s.t}</span>
            <span className={cn("z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-surface", s.tone === "bad" ? "border-bad text-bad" : s.tone === "good" ? "border-good text-good" : "border-line-strong text-mute")}><I size={12} /></span>
            <div className={cn("flex-1 rounded-[6px] border px-3 py-2 text-[13px]", s.tone === "bad" ? "border-bad/30 bg-bad-soft" : s.tone === "good" ? "border-good/30 bg-good-soft" : "border-line bg-surface")}>{s.e}</div>
          </li>); })}
      </ol>
    </Card>
  );
}

export function DprForm({ open, onClose, pid = "skyline" }) {
  const { toast, log } = useStore();
  const [f, setF] = useState({ p: pid, weather: "Clear", workers: "146", activity: "", progress: "", issue: "", safety: "", comments: "" });
  const [acts, setActs] = useState([]);
  const add = () => { if (f.activity) { setActs([...acts, [f.activity, f.progress]]); setF({ ...f, activity: "", progress: "" }); } };
  const submit = () => { log(`DPR submitted for ${PROJECTS.find((x) => x.id === f.p).name} — ${f.workers} workers, ${acts.length + DPR_ACTIVITIES.length} activities.`, "Rahul Sinha", f.p); toast("Daily progress report submitted"); setActs([]); onClose(); };
  return (
    <Modal open={open} onClose={onClose} title="Submit daily progress report" width={560} footer={<><Btn onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={submit}>Submit DPR</Btn></>}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Project" className="col-span-2"><select className={inputCls} value={f.p} onChange={(e) => setF({ ...f, p: e.target.value })}>{PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
        <Field label="Date"><input className={inputCls} defaultValue="06 Oct 2026" readOnly /></Field>
        <Field label="Weather"><select className={inputCls} value={f.weather} onChange={(e) => setF({ ...f, weather: e.target.value })}>{["Clear", "Cloudy", "Light rain", "Heavy rain", "Hot"].map((w) => <option key={w}>{w}</option>)}</select></Field>
        <Field label="Workers present" className="col-span-2"><input className={inputCls} value={f.workers} onChange={(e) => setF({ ...f, workers: e.target.value })} inputMode="numeric" /></Field>
        <div className="col-span-2">
          <div className="mb-1 text-[11.5px] font-medium text-mute">Activities today</div>
          <div className="space-y-1">{[...DPR_ACTIVITIES.map((a) => [a.a, a.r]), ...acts].map(([a, r], i) => <div key={i} className="flex justify-between rounded-[6px] bg-panel px-3 py-1.5 text-[12.5px]"><span>{a}</span><span className="num font-medium">{r}</span></div>)}</div>
          <div className="mt-2 flex gap-2"><input className={inputCls} placeholder="Activity" value={f.activity} onChange={(e) => setF({ ...f, activity: e.target.value })} /><input className={cn(inputCls, "w-36")} placeholder="Progress" value={f.progress} onChange={(e) => setF({ ...f, progress: e.target.value })} /><Btn onClick={add}><Plus size={14} /></Btn></div>
        </div>
        <Field label="Issues / delays" className="col-span-2"><input className={inputCls} value={f.issue} onChange={(e) => setF({ ...f, issue: e.target.value })} placeholder="e.g. Crane TC-02 stopped 2:40 PM — hydraulic" /></Field>
        <Field label="Safety observations" className="col-span-2"><input className={inputCls} value={f.safety} onChange={(e) => setF({ ...f, safety: e.target.value })} /></Field>
        <div className="col-span-2 grid grid-cols-3 gap-2">{[[Camera, "Add photos"], [Video, "Add video"], [Mic, "Voice note"]].map(([I, l]) => <button key={l} type="button" className="flex h-14 flex-col items-center justify-center gap-1 rounded-[6px] border border-dashed border-line-strong text-[12px] text-mute hover:bg-panel"><I size={16} />{l}</button>)}</div>
      </div>
    </Modal>
  );
}

export function DprSection({ pid = "skyline", full }) {
  const p = getProject(pid);
  const [open, setOpen] = useState(false);
  const acts = pid === "skyline" ? DPR_ACTIVITIES : [{ a: `${p.type} — main works`, r: `${Math.round(p.pct / 20 + 3)}% of daily target`, tone: "good" }, { a: "Material handling", r: "On schedule" }, { a: "Finishing / support works", r: "In progress" }];
  const photos = PHOTOS.filter((x) => x.p === pid).slice(0, 4);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-4 text-[13px]"><b className="text-[15px]">{p.name}</b><span className="text-mute">06 Oct 2026</span><span className="flex items-center gap-1 text-mute"><CloudSun size={14} />{p.weather}</span></div>
        <Btn variant="primary" onClick={() => setOpen(true)}><Plus size={14} /> New DPR</Btn>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi label="Workers present" value={p.workers} icon={Users} sub="of 158 planned" />
        <Kpi label="Activities" value={acts.length} sub="reported today" />
        <Kpi label="Open issues" value={p.issues} tone={p.issues > 4 ? "bad" : "warn"} icon={AlertTriangle} />
        <Kpi label="Photos today" value={pid === "skyline" ? 28 : 12} icon={Camera} />
        <Kpi label="Submitted" value={p.update} sub="by Site Engineer" tone="good" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <Card title="Activities today" pad={false}>
            <ul className="divide-y divide-line">{acts.map((a) => <li key={a.a} className="flex items-center justify-between px-4 py-2.5"><span className="text-[13px] font-medium">{a.a}</span><Pill tone="good" dot={false}>{a.r}</Pill></li>)}</ul>
          </Card>
          <Card title="Resources & observations">
            <Kv k="Labour" v={`${p.workers} (Masons 34 · Bar benders 22 · Carpenters 26 · Helpers 64)`} />
            <Kv k="Equipment used" v="Tower crane TC-02 (6h 20m), Material lift, 2 concrete pumps" />
            <Kv k="Material consumed" v="Cement 410 bags · TMT 4.8 MT · RMC 36 CUM · AAC blocks 11,200" />
            <Kv k="Safety observations" v="2 workers without harness — corrected on spot" />
            <Kv k="Delay / issue" v={pid === "skyline" ? "Crane TC-02 down 2:40 PM → 3 h lost" : "—"} />
          </Card>
          {photos.length > 0 && <Card title="Today’s photos"><div className="grid grid-cols-4 gap-2">{photos.map((x) => <div key={x.id} className="overflow-hidden rounded-[4px] border border-line"><SiteArt kind={p.kind} progress={x.prog} seed={x.id.length + x.prog} tone={x.tone} className="aspect-[4/3] w-full" /></div>)}</div></Card>}
        </div>
        <DailyStory pid={pid} />
      </div>
      <DprForm open={open} onClose={() => setOpen(false)} pid={pid} />
    </div>
  );
}
