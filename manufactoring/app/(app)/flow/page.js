"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Btn, Card, Pill, PageHeader, cn } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { num } from "@/lib/format";

const STAGES = [
  { k: "Raw Material Warehouse", qty: "6,12,400 kg+", wip: "—", delay: "—", issues: "2 critical, 3 low", value: "₹3.42 Cr", tone: "bad", href: "/raw-materials", recs: [["RM-BRS-CART", "Brass Cartridge — critical", "1,480 pcs on hand, 3,000 reserved"], ["RM-DRN-01", "Drain Coupling — critical", "Reserved 5,800 of 7,200"], ["RM-SS304-12", "SS 304 Coil — low", "7,220 kg available vs 8,000 min"]] },
  { k: "Material Issue", qty: "8 issues today", wip: "—", delay: "None", issues: "+160 kg variance", value: "₹9.9 L", tone: "warn", href: "/raw-materials?tab=issue", recs: [["ISS-7712", "SS 304 Sheet → WO-2841", "4,360 kg (+160 kg)"], ["ISS-7707", "SS 304 Sheet → WO-2848", "1,230 kg (+30 kg)"], ["ISS-7709", "Brass Cartridge → WO-2845", "1,480 pcs (−20)"]] },
  { k: "Cutting", qty: "2,800 blanks", wip: "380", delay: "0 h", issues: "—", value: "₹2.9 L", tone: "ok", href: "/machines/CNC-01", recs: [["CNC-01", "CNC Cutting — running", "2,800 blanks · 94% efficiency"], ["WO-2845", "Brass blanks", "380 pcs waiting"]] },
  { k: "Forming", qty: "3,560 units", wip: "1,070", delay: "1 h 52 m", issues: "Dent rejects, P-04 die jam", value: "₹18.4 L", tone: "warn", href: "/machines/P-04", recs: [["P-04", "Press P-04 — die jam, 1 h 52 m", "112 min lost · 74% efficiency"], ["HP-03", "HP-03 — maintenance due today", "482 h since service"], ["HP-05", "HP-05 — breakdown, Line 4", "Restart expected 2:30 PM"]] },
  { k: "Welding", qty: "3,010 units", wip: "620", delay: "0 h 36 m", issues: "11 pinholes (WS-04)", value: "₹12.1 L", tone: "ok", href: "/machines/WS-04", recs: [["WS-04", "Welding Station WS-04", "655 units · 82% efficiency"], ["WS-01", "Welding Station WS-01", "1,210 units · 89%"]] },
  { k: "Polishing", qty: "2,860 units", wip: "390", delay: "0 h 44 m", issues: "8 scratches", value: "₹9.6 L", tone: "ok", href: "/machines/PL-02", recs: [["PL-02", "Polishing Line PL-02", "604 units · 80%"], ["PL-01", "Polishing Line PL-01", "1,190 units · 90%"]] },
  { k: "Quality", qty: "1,880 units", wip: "532", delay: "—", issues: "Rejection 2.8%", value: "₹7.2 L", tone: "bad", href: "/quality", recs: [["QC-1182", "Sink 24×18 — 6.17% rejection", "42 of 680 rejected"], ["QC-1183", "Utility Sink — 5.3% rejection", "16 of 300 rejected"], ["QC-1186", "In progress — 136 units", "Neha Verma"]] },
  { k: "Finished Goods", qty: "4,860 units", wip: "—", delay: "—", issues: "3 products low", value: "₹2.16 Cr", tone: "warn", href: "/finished-goods", recs: [["P-01", "Premium Kitchen Sink 24×18", "1,220 free · min 800"], ["P-03", "Double Bowl Sink 37×18", "120 vs min 400 — low"], ["P-06", "Utility Sink 21×18", "360 vs min 400 — low"]] },
  { k: "Packing", qty: "3,740 units", wip: "1,120", delay: "—", issues: "—", value: "₹26.1 L", tone: "ok", href: "/packing", recs: [["PK-2201", "WO-2838 — packing", "980 of 1,226 packed"], ["PK-2202", "WO-2841 — packing", "640 of 1,186 packed"]] },
  { k: "Dispatch", qty: "2,940 units", wip: "—", delay: "—", issues: "—", value: "₹21.2 L", tone: "ok", href: "/dispatch", recs: [["DSP-8821", "Agarwal Buildmart — loading", "800 sinks"], ["DSP-8820", "Agarwal Buildmart — loading", "2,000 floor drains"], ["DSP-8819", "Bihar Home Solutions — in transit", "700 sinks"]] },
];
const dot = { ok: "bg-ok", warn: "bg-warn", bad: "bg-bad" };

export default function Flow() {
  const [sel, setSel] = useState(STAGES[3]);
  return (
    <div>
      <PageHeader title="Factory Flow" sub="Raw material to dispatch — live quantity, WIP, delay, issues and value at every stage. Click a stage for its records." />
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        {STAGES.map((s, i) => (
          <div key={s.k} className="relative">
            <button onClick={() => setSel(s)} className={cn("block h-full w-full rounded-[8px] border bg-surface p-3.5 text-left transition-colors hover:border-accent", sel.k === s.k ? "border-accent ring-2 ring-accent/15" : "border-line")}>
              <div className="flex items-center justify-between"><span className="label !text-[10px]">{i + 1}</span><span className={cn("h-2 w-2 rounded-full", dot[s.tone])} /></div>
              <div className="mt-1 text-[14px] font-semibold leading-tight">{s.k}</div>
              <div className="num mt-2 text-[20px] font-semibold tracking-[-0.02em]">{s.qty}</div>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11.5px]">
                <dt className="text-mute">WIP</dt><dd className="num text-right">{s.wip}</dd>
                <dt className="text-mute">Delay</dt><dd className={cn("num text-right", s.delay !== "—" && s.delay !== "None" && s.delay !== "0 h" && "text-warn")}>{s.delay}</dd>
                <dt className="text-mute">Value</dt><dd className="num text-right font-medium">{s.value}</dd>
              </dl>
              <div className={cn("mt-2 truncate text-[11.5px]", s.issues === "—" ? "text-faint" : "text-bad")}>{s.issues === "—" ? "No issues" : s.issues}</div>
            </button>
            {i < STAGES.length - 1 && <ArrowRight size={14} className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-bg text-faint lg:block [&:nth-child(5n)]:hidden" />}
            {i < STAGES.length - 1 && <ArrowDown size={14} className="absolute -bottom-2.5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-bg text-faint sm:hidden" />}
          </div>
        ))}
      </div>
      <Card className="mt-4" title={`${sel.k} — records`} sub={`${sel.qty} · value ${sel.value}`} action={<Btn size="sm" href={sel.href}>Open module <ArrowRight size={13} /></Btn>} pad={false}>
        <div className="divide-y divide-line">
          {sel.recs.map(([id, t, sub]) => <div key={id} className="flex items-center justify-between gap-3 px-4 py-2.5"><div className="min-w-0"><div className="text-[13px] font-medium"><span className="num text-mute">{id}</span> · {t}</div><div className="text-[12px] text-mute">{sub}</div></div><Link href={sel.href} className="text-[12.5px] text-accent hover:underline">View</Link></div>)}
        </div>
      </Card>
      <p className="mt-3 text-[12px] text-faint">Quantities are units/kg processed today; WIP is currently inside the stage.</p>
    </div>
  );
}
void DataTable; void Pill; void num;
