"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Building2, Camera, CheckCircle2, ClipboardCheck, ClipboardList, FileText, HardHat, Package, PackagePlus, Receipt, Search, ShieldAlert, ShoppingCart, Wallet, AlertTriangle, ListTodo, X, ArrowRight, CornerDownLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { search } from "@/lib/search";
import { PROJECTS } from "@/data/core";
import { Btn, cn, Field, inputCls, Modal, Pill, TONES } from "@/components/ui/ui";

export function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[120] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }} className="pointer-events-auto flex items-center gap-2 rounded-[8px] border border-line-strong bg-ink px-3.5 py-2.5 text-[12.5px] font-medium text-bg shadow-xl">
            <span className={cn("h-2 w-2 rounded-full", TONES[t.tone].dot)} /> {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function SearchPalette() {
  const { searchOpen, setSearchOpen } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const groups = useMemo(() => search(q), [q]);
  useEffect(() => {
    const f = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen((o) => !o); } if (e.key === "Escape") setSearchOpen(false); };
    window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f);
  }, [setSearchOpen]);
  const go = (href) => { setSearchOpen(false); setQ(""); router.push(href); };
  return (
    <AnimatePresence>
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[10vh]">
          <motion.div className="fixed inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSearchOpen(false)} />
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className="glass relative w-full max-w-xl overflow-hidden rounded-[12px] shadow-2xl" style={{ background: "var(--surface)" }}>
            <div className="flex items-center gap-2 border-b border-line px-4">
              <Search size={16} className="text-faint" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects, POs, bills, drawings, contractors, materials…" className="h-12 flex-1 bg-transparent text-[14px] outline-none placeholder:text-faint"
                onKeyDown={(e) => { if (e.key === "Enter" && groups[0]) go(groups[0].items[0].href); }} />
              <kbd className="rounded border border-line-strong px-1.5 py-0.5 text-[10.5px] text-faint">ESC</kbd>
            </div>
            <div className="scroll-thin max-h-[56vh] overflow-y-auto p-2">
              {!q && <div className="p-5 text-center text-[12.5px] text-mute">Try <button className="font-semibold text-accent-ink" onClick={() => setQ("Skyline")}>Skyline</button>, <button className="font-semibold text-accent-ink" onClick={() => setQ("steel")}>steel</button>, <button className="font-semibold text-accent-ink" onClick={() => setQ("STR-104")}>STR-104</button> or <button className="font-semibold text-accent-ink" onClick={() => setQ("Shivam")}>Shivam</button></div>}
              {q && groups.length === 0 && <div className="p-6 text-center text-[13px] text-mute">No results for “{q}”</div>}
              {groups.map((g) => (
                <div key={g.type} className="mb-1">
                  <div className="px-2 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-faint">{g.type}{g.items.length + g.more > 1 ? "s" : ""}</div>
                  {g.items.map((i, k) => (
                    <button key={k} onClick={() => go(i.href)} className="group flex w-full items-center justify-between gap-3 rounded-[6px] px-2.5 py-1.5 text-left hover:bg-panel">
                      <span className="min-w-0"><span className="block truncate text-[13px] font-medium">{i.label}</span><span className="block truncate text-[11.5px] text-mute">{i.sub}</span></span>
                      <CornerDownLeft size={12} className="shrink-0 text-faint opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                  {g.more > 0 && <div className="px-2.5 pb-1 text-[11px] text-faint">+{g.more} more</div>}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export const QUICK = [
  { k: "dpr", label: "Daily Progress", icon: ClipboardList, desc: "Submit today's DPR" },
  { k: "mr", label: "Material Request", icon: PackagePlus, desc: "Request material for site" },
  { k: "expense", label: "Site Expense", icon: Wallet, desc: "Log expense with receipt" },
  { k: "qi", label: "Quality Inspection", icon: ClipboardCheck, desc: "Raise inspection request" },
  { k: "safety", label: "Safety Observation", icon: ShieldAlert, desc: "Report unsafe act or near miss" },
  { k: "pr", label: "Purchase Request", icon: ShoppingCart, desc: "Start procurement" },
  { k: "task", label: "Task", icon: ListTodo, desc: "Assign work to a team member" },
  { k: "cbill", label: "Contractor Bill", icon: Receipt, desc: "Record contractor RA bill" },
  { k: "cl", label: "Client Bill", icon: FileText, desc: "Prepare RA bill for client" },
  { k: "issue", label: "Issue", icon: AlertTriangle, desc: "Raise a blocker or delay" },
  { k: "photo", label: "Photo Update", icon: Camera, desc: "Upload site photos" },
];
const PREFIX = { dpr: "DPR", mr: "MR", expense: "EX", qi: "QI", safety: "SO", pr: "PR", task: "T", cbill: "CB", cl: "RA", issue: "IS", photo: "PH" };

export function QuickCreate() {
  const { quick, setQuick, toast, log } = useStore();
  const [f, setF] = useState({ project: "skyline", title: "", qty: "" });
  const cur = QUICK.find((q) => q.k === quick);
  const submit = () => {
    const ref = `${PREFIX[quick]}-${Math.floor(3000 + Math.random() * 900)}`;
    const pn = PROJECTS.find((p) => p.id === f.project).name;
    log(`${cur.label} ${ref} created${f.title ? ` — ${f.title}` : ""} (${pn}).`, "Arjun Mehta", f.project);
    toast(`${cur.label} ${ref} created`);
    setQuick(null); setF({ project: "skyline", title: "", qty: "" });
  };
  return (
    <>
      <Modal open={quick === "menu"} onClose={() => setQuick(null)} title="Quick create" width={560}>
        <div className="grid grid-cols-2 gap-2">
          {QUICK.map((q) => (
            <button key={q.k} onClick={() => setQuick(q.k)} className="lift flex items-start gap-3 rounded-[8px] border border-line p-3 text-left">
              <q.icon size={18} className="mt-0.5 text-accent" />
              <span><span className="block text-[13px] font-semibold">{q.label}</span><span className="block text-[11.5px] text-mute">{q.desc}</span></span>
            </button>
          ))}
        </div>
      </Modal>
      <Modal open={!!cur} onClose={() => setQuick(null)} title={cur ? `New ${cur.label}` : ""} footer={<><Btn onClick={() => setQuick("menu")}>Back</Btn><Btn variant="primary" onClick={submit}>Create</Btn></>}>
        <div className="space-y-3">
          <Field label="Project"><select className={inputCls} value={f.project} onChange={(e) => setF({ ...f, project: e.target.value })}>{PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
          <Field label="Title / description"><input className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder={quick === "mr" ? "e.g. TMT Steel 16mm" : "Short description"} /></Field>
          <Field label={quick === "expense" || quick === "cbill" || quick === "cl" ? "Amount (₹)" : "Quantity / details"}><input className={inputCls} value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} /></Field>
          {(quick === "expense" || quick === "photo" || quick === "issue") && <div className="flex h-20 items-center justify-center rounded-[6px] border border-dashed border-line-strong text-[12.5px] text-mute"><Camera size={15} className="mr-2" /> Tap to attach {quick === "expense" ? "receipt" : "photo"}</div>}
        </div>
      </Modal>
    </>
  );
}

export function NotificationsPanel({ open, onClose }) {
  const { notifs, setNotifs } = useStore();
  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={onClose} />
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 top-11 z-[61] w-[380px] max-w-[92vw] overflow-hidden rounded-[10px] border border-line-strong bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5"><span className="text-[13px] font-semibold">Notifications</span><button className="text-[12px] text-accent-ink" onClick={() => setNotifs([])}>Clear all</button></div>
            <div className="scroll-thin max-h-[60vh] overflow-y-auto">
              {notifs.length === 0 && <div className="p-8 text-center text-mute">You’re all caught up.</div>}
              {notifs.map((n) => (
                <Link key={n.id} href={n.href} onClick={onClose} className="flex gap-3 border-b border-line/70 px-4 py-2.5 last:border-0 hover:bg-panel">
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", TONES[n.tone].dot)} />
                  <span className="min-w-0 flex-1"><span className="block text-[11px] font-semibold uppercase tracking-[0.05em] text-faint">{n.kind}</span><span className="block text-[12.5px] leading-snug">{n.text}</span></span>
                  <span className="num shrink-0 text-[11px] text-faint">{n.t}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
