"use client";
import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Bell, BookOpenCheck, Camera, Check, ChevronLeft, ClipboardCheck, ClipboardList, Home, HardHat, MapPin, PackagePlus, Plus, Receipt, Truck, User, Wallet, X } from "lucide-react";
import { getProject } from "@/data/core";
import { TASKS, MATERIALS, DAILY_STORY } from "@/data/ops";
import SiteArt from "@/components/site/SiteArt";
import { Bar, Pill, cn } from "@/components/ui/ui";
import { useStore } from "@/lib/store";

const ACTIONS = [[BookOpenCheck, "Submit DPR", "DPR submitted"], [Camera, "Upload photo", "3 photos uploaded"], [PackagePlus, "Request material", "MR-2842 raised"], [AlertTriangle, "Report issue", "Issue IS-518 reported"], [ClipboardCheck, "Create inspection", "QI-2483 created"], [Wallet, "Add expense", "Expense EX-5530 saved"], [Truck, "Record delivery", "Gate entry GE-7732 saved"]];

export default function Mobile() {
  const { toast } = useStore();
  const [tab, setTab] = useState("home"), [sheet, setSheet] = useState(false), [done, setDone] = useState(new Set(["T-899"]));
  const p = getProject("skyline");
  const fire = (m) => { setSheet(false); toast(m); };
  const tasks = TASKS.filter((t) => t.p === "skyline");
  const mats = MATERIALS.filter((m) => m.p === "skyline" && m.status !== "Healthy");
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0d0f] p-0 sm:p-6">
      <div className="hidden w-[300px] pr-12 text-white lg:block">
        <Link href="/command-center" className="mb-8 inline-flex items-center gap-1 text-[12.5px] text-[#8c98a2] hover:text-white"><ChevronLeft size={14} /> Back to SiteControl</Link>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#f5b301]">Site app</div>
        <h1 className="display text-[34px] font-semibold leading-tight">Built for the person standing in the mud.</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-[#98a3ad]">Site engineers, store managers and supervisors file the DPR, upload photos, raise material requests and record deliveries in under a minute — on any phone, even on weak networks.</p>
      </div>
      <div className="relative flex h-screen w-full max-w-[400px] flex-col overflow-hidden bg-bg text-ink sm:h-[820px] sm:rounded-[38px] sm:border-[10px] sm:border-[#1b2024] sm:shadow-2xl">
        <div className="flex items-center justify-between bg-nav px-5 pb-3 pt-4 text-white sm:pt-5">
          <div><div className="text-[11px] text-[#8c98a2]">Site Engineer · Rahul Sinha</div><div className="flex items-center gap-1 text-[15px] font-semibold"><MapPin size={13} className="text-[#f5b301]" />{p.name}</div></div>
          <div className="flex items-center gap-2"><span className="relative"><Bell size={19} /><span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#ff5d6c]" /></span></div>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto pb-20">
          {tab === "home" && (<div className="space-y-4 p-4">
            <div><div className="text-[20px] font-semibold tracking-tight">Good Afternoon, Rahul</div><div className="text-[12.5px] text-mute">Tue 06 Oct · {p.weather}</div></div>
            <div className="grid grid-cols-4 gap-2">{ACTIONS.slice(0, 7).map(([I, l, m]) => <button key={l} onClick={() => fire(m)} className="flex flex-col items-center gap-1.5 rounded-[10px] border border-line bg-surface px-1 py-3 active:scale-95"><I size={20} className="text-accent" /><span className="text-center text-[10.5px] font-medium leading-tight">{l}</span></button>)}<button onClick={() => setSheet(true)} className="flex flex-col items-center gap-1.5 rounded-[10px] bg-ink px-1 py-3 text-bg"><Plus size={20} /><span className="text-[10.5px] font-medium">More</span></button></div>
            <div className="rounded-[10px] border border-bad/40 bg-bad-soft p-3"><div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-bad"><AlertTriangle size={12} /> Needs action</div><div className="mt-1 text-[13.5px] font-semibold">TMT Steel 12mm — 1.1 days of stock left</div><button onClick={() => fire("MR-2841 escalated to Purchase Manager")} className="mt-2 rounded-[6px] bg-bad px-3 py-1.5 text-[12px] font-semibold text-white">Escalate request</button></div>
            <div className="overflow-hidden rounded-[10px] border border-line bg-surface"><div className="relative h-28"><SiteArt kind="tower" progress={71} seed={1} className="h-full w-full" /><div className="absolute bottom-2 left-3 rounded bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">Tower A · 71%</div></div><div className="p-3"><div className="flex justify-between text-[12px]"><span className="text-mute">Project progress</span><b className="num">62% (plan 65%)</b></div><Bar value={62} marker={65} h={6} className="mt-2" /></div></div>
            <div><div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint">Today so far</div><div className="space-y-1.5">{DAILY_STORY.slice(0, 5).map((s) => <div key={s.t} className="flex gap-3 rounded-[8px] bg-panel px-3 py-2 text-[12.5px]"><span className="num w-[62px] shrink-0 text-mute">{s.t}</span><span>{s.e}</span></div>)}</div></div>
          </div>)}
          {tab === "site" && (<div className="space-y-3 p-4">
            <div className="text-[17px] font-semibold">Site overview</div>
            <div className="grid grid-cols-2 gap-2">{[["Workers", "146"], ["Open issues", "3"], ["Inspections", "2 pending"], ["Equipment down", "1"]].map(([k, v]) => <div key={k} className="rounded-[10px] border border-line bg-surface p-3"><div className="text-[10.5px] uppercase tracking-wide text-faint">{k}</div><div className="num text-[18px] font-semibold">{v}</div></div>)}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-faint">Stock alerts</div>
            {mats.map((m) => <div key={m.id} className="flex items-center justify-between rounded-[10px] border border-line bg-surface p-3"><div><div className="text-[13px] font-semibold">{m.name}</div><div className="num text-[12px] text-mute">{m.stock} {m.unit} left</div></div><Pill tone="bad">Low</Pill></div>)}
            <div className="text-[11px] font-semibold uppercase tracking-wider text-faint">Towers</div>
            {[["Tower A", 71], ["Tower B", 54], ["Tower C", 38], ["Club House", 66]].map(([n, v]) => <div key={n} className="rounded-[10px] border border-line bg-surface p-3"><div className="mb-1.5 flex justify-between text-[13px]"><span className="font-medium">{n}</span><b className="num">{v}%</b></div><Bar value={v} h={6} /></div>)}
          </div>)}
          {tab === "tasks" && (<div className="space-y-2 p-4"><div className="mb-1 text-[17px] font-semibold">My tasks</div>
            {tasks.map((t) => { const d = done.has(t.id); return <button key={t.id} onClick={() => { const n = new Set(done); d ? n.delete(t.id) : n.add(t.id); setDone(n); }} className="flex w-full items-start gap-3 rounded-[10px] border border-line bg-surface p-3 text-left"><span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", d ? "border-good bg-good text-white" : "border-line-strong")}>{d && <Check size={12} strokeWidth={3} />}</span><span className="flex-1"><span className={cn("block text-[13.5px] font-medium", d && "text-faint line-through")}>{t.title}</span><span className="text-[11.5px] text-mute">Due {t.due} · {t.owner}</span></span><Pill>{t.prio}</Pill></button>; })}</div>)}
          {tab === "profile" && (<div className="space-y-3 p-4"><div className="flex items-center gap-3 rounded-[10px] border border-line bg-surface p-4"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-[18px] font-semibold text-white">RS</span><div><div className="text-[16px] font-semibold">Rahul Sinha</div><div className="text-[12.5px] text-mute">Site Engineer · Skyline Residency</div></div></div>{["My DPRs this month — 24", "Pending uploads — 0 (all synced)", "Offline mode — On", "Language — English / हिन्दी"].map((x) => <div key={x} className="rounded-[10px] border border-line bg-surface px-4 py-3 text-[13px]">{x}</div>)}<Link href="/command-center" className="block rounded-[10px] bg-ink py-3 text-center text-[13px] font-semibold text-bg">Open desktop view</Link></div>)}
        </div>
        {sheet && (<div className="absolute inset-0 z-20 flex items-end bg-black/50" onClick={() => setSheet(false)}><div className="w-full rounded-t-[20px] bg-surface p-4 pb-8" onClick={(e) => e.stopPropagation()}><div className="mx-auto mb-3 h-1 w-10 rounded bg-line-strong" /><div className="mb-3 text-[15px] font-semibold">Add</div><div className="grid grid-cols-2 gap-2">{ACTIONS.map(([I, l, m]) => <button key={l} onClick={() => fire(m)} className="flex items-center gap-3 rounded-[10px] border border-line px-3 py-3 text-left text-[13px] font-medium active:bg-panel"><I size={18} className="text-accent" />{l}</button>)}</div></div></div>)}
        <nav className="absolute inset-x-0 bottom-0 z-10 grid grid-cols-5 border-t border-line bg-surface px-1 pb-4 pt-1.5 sm:pb-3">
          {[["home", Home, "Home"], ["site", HardHat, "Site"], ["add", Plus, "Add"], ["tasks", ClipboardList, "Tasks"], ["profile", User, "Profile"]].map(([k, I, l]) => k === "add"
            ? <button key={k} onClick={() => setSheet(true)} className="-mt-5 flex flex-col items-center"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-black shadow-lg"><Plus size={24} strokeWidth={2.6} /></span><span className="mt-0.5 text-[10px] font-medium text-mute">{l}</span></button>
            : <button key={k} onClick={() => setTab(k)} className={cn("flex flex-col items-center gap-0.5 py-1.5", tab === k ? "text-ink" : "text-faint")}><I size={20} /><span className="text-[10px] font-medium">{l}</span></button>)}
        </nav>
      </div>
    </div>
  );
}
