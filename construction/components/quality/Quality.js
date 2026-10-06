"use client";
import { useState } from "react";
import { Camera, Check, Minus, X } from "lucide-react";
import { CHECKLIST, INSPECTIONS, INCIDENTS, QUALITY_STATS, SAFETY_CHECK, SAFETY_STATS, SNAGS } from "@/data/ops";
import { projName } from "@/data/core";
import { Bar, Btn, Card, Drawer, Flow, Kpi, Kv, Pill, cn, Ring } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import SiteArt from "@/components/site/SiteArt";
import { useStore } from "@/lib/store";

const QFLOW = ["Inspection Request", "Engineer Check", "Pass / Fail", "Snag", "Rectification", "Re-inspection", "Closed"];
export function QualitySection({ pid }) {
  const q = QUALITY_STATS, [sel, setSel] = useState(null), [snag, setSnag] = useState(null);
  const ins = INSPECTIONS.filter((i) => !pid || i.p === pid), sn = SNAGS.filter((i) => !pid || i.p === pid);
  const k = pid ? 0.2 : 1;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">{[["Inspections", q.inspections], ["Passed", q.passed, "good"], ["Failed", q.failed, "bad"], ["Pending", q.pending, "warn"], ["Open snags", q.snags, "risk"], ["Rework items", q.rework, "bad"]].map(([l, v, t]) => <Kpi key={l} label={l} value={Math.round(v * (pid ? 0.22 : 1)) || (pid ? 1 : v)} tone={t} />)}</div>
      <Card title="Quality workflow"><Flow steps={QFLOW} current={3} compact /></Card>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card pad={false} title="Inspections" sub="Click an inspection to open its checklist">
          <DataTable exportName="inspections" dense pageSize={6} onRowClick={setSel} columns={[
            { key: "id", label: "ID", render: (r) => <span className="num font-medium text-accent-ink">{r.id}</span> }, { key: "activity", label: "Activity" },
            ...(pid ? [] : [{ key: "p", label: "Project", render: (r) => <span className="text-mute">{projName(r.p)}</span> }]),
            { key: "by", label: "Engineer" }, { key: "date", label: "Date" }, { key: "status", label: "Result", render: (r) => <Pill>{r.status}</Pill>, csv: (r) => r.status },
          ]} rows={ins} />
        </Card>
        <Card title="Snag management" sub="Raised, assigned and tracked to closure">
          <div className="space-y-2.5">{sn.length === 0 && <div className="py-6 text-center text-mute">No open snags 🎉</div>}{sn.map((s) => (
            <button key={s.id} onClick={() => setSnag(s)} className="lift block w-full rounded-[6px] border border-line p-3 text-left">
              <div className="flex items-start justify-between gap-2"><div><span className="num text-[12px] font-semibold text-accent-ink">{s.id}</span><div className="text-[13px] font-medium">{s.issue}</div><div className="text-[11.5px] text-mute">{projName(s.p)} · {s.area}</div></div><div className="flex flex-col items-end gap-1"><Pill>{s.sev}</Pill><Pill>{s.status}</Pill></div></div>
              <div className="mt-1.5 text-[11.5px] text-mute">Assigned: {s.assigned} · Due {s.due}</div>
            </button>))}</div>
        </Card>
      </div>
      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel ? `${sel.id} · ${sel.activity}` : ""} sub={sel ? projName(sel.p) : ""} width={520}>
        {sel && (<div className="space-y-3">
          <div className="flex items-center gap-2"><Pill>{sel.status}</Pill><span className="text-[12px] text-mute">{sel.by} · {sel.date}</span></div>
          <div className="divide-y divide-line rounded-[6px] border border-line">{CHECKLIST.map(([k, r, c, ph]) => (
            <div key={k} className="flex items-center gap-3 px-3 py-2.5"><span className={cn("flex h-5 w-5 items-center justify-center rounded-full", sel.status === "Failed" && k === "Cover block" ? "bg-bad text-white" : "bg-good text-white")}>{sel.status === "Failed" && k === "Cover block" ? <X size={12} /> : <Check size={12} />}</span>
              <div className="flex-1"><div className="text-[13px] font-medium">{k}</div><div className="text-[11.5px] text-mute">{c}</div></div>{ph && <Camera size={14} className="text-mute" />}<div className="flex gap-0.5">{["Pass", "Fail", "NA"].map((o) => <span key={o} className={cn("rounded px-1.5 py-0.5 text-[10.5px] font-semibold", o === (sel.status === "Failed" && k === "Cover block" ? "Fail" : "Pass") ? (o === "Fail" ? "bg-bad-soft text-bad" : "bg-good-soft text-good") : "text-faint")}>{o}</span>)}</div></div>))}</div>
        </div>)}
      </Drawer>
      <Drawer open={!!snag} onClose={() => setSnag(null)} title={snag ? `${snag.id} · ${snag.issue}` : ""} sub={snag ? `${projName(snag.p)} · ${snag.area}` : ""} width={500}>
        {snag && (<div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">{["Before", "After"].map((l, i) => <div key={l}><div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-faint">{l} photo</div>{i === 0 || snag.status === "Closed" ? <SiteArt kind="interior" progress={i ? 90 : 45} seed={snag.id.length + i} className="aspect-[4/3] w-full rounded-[6px]" crane={false} /> : <div className="flex aspect-[4/3] items-center justify-center rounded-[6px] border border-dashed border-line-strong text-[12px] text-mute">Awaiting rectification</div>}</div>)}</div>
          <div><Kv k="Severity" v={snag.sev} /><Kv k="Assigned to" v={snag.assigned} /><Kv k="Due" v={snag.due} /><Kv k="Status" v={snag.status} /></div>
          <Flow steps={["Snag raised", "Assigned", "Rectification", "Re-inspection", "Closed"]} current={snag.status === "Closed" ? 5 : 2} compact />
        </div>)}
      </Drawer>
    </div>
  );
}

export function SafetySection({ pid }) {
  const s = SAFETY_STATS, { toast } = useStore();
  const [sel, setSel] = useState(null);
  const rows = INCIDENTS.filter((i) => !pid || i.p === pid);
  const fail = SAFETY_CHECK.filter(([, r]) => r === "Fail").length;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <div className="col-span-2 flex items-center gap-4 rounded-[8px] border border-good/40 bg-good-soft p-3.5 lg:col-span-2"><div className="num text-[44px] font-semibold leading-none tracking-[-0.04em] text-good">{s.daysClear}</div><div className="text-[12.5px] text-ink"><b>days without a lost-time incident</b><br /><span className="text-mute">Company record: 112 days</span></div></div>
        <Kpi label="Inspections (30d)" value={s.inspections} /><Kpi label="Open issues" value={s.open} tone="warn" /><Kpi label="Near misses" value={s.nearMiss} tone="risk" /><Kpi label="PPE compliance" value={`${s.ppe}%`} tone="good" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_1.3fr]">
        <Card title="Safety inspection checklist" sub="Skyline Residency · today 8:30 AM · Safety Officer" action={<Btn size="sm" onClick={() => toast("Corrective actions assigned")}>Assign actions</Btn>}>
          <div className="divide-y divide-line">{SAFETY_CHECK.map(([k, r]) => <div key={k} className="flex items-center justify-between py-2"><span className="flex items-center gap-2 text-[13px]">{r === "Pass" ? <Check size={14} className="text-good" /> : <X size={14} className="text-bad" />}{k}</span><Pill tone={r === "Pass" ? "good" : "bad"}>{r}</Pill></div>)}</div>
          <p className="mt-2 text-[12px] text-bad">{fail} items failed — barricading and scaffolding on Tower B L11.</p>
        </Card>
        <Card title="Incidents & observations" pad={false}>
          <DataTable dense exportName="incidents" pageSize={5} onRowClick={setSel} columns={[
            { key: "id", label: "ID", render: (r) => <span className="num font-medium text-accent-ink">{r.id}</span> }, { key: "type", label: "Type" },
            ...(pid ? [] : [{ key: "p", label: "Project", render: (r) => <span className="text-mute">{projName(r.p)}</span> }]),
            { key: "date", label: "Date" }, { key: "sev", label: "Severity", render: (r) => <Pill>{r.sev}</Pill>, csv: (r) => r.sev }, { key: "status", label: "Status", render: (r) => <Pill>{r.status}</Pill>, csv: (r) => r.status },
          ]} rows={rows} />
        </Card>
      </div>
      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel ? `${sel.id} · ${sel.type}` : ""} sub={sel ? `${projName(sel.p)} · ${sel.loc}` : ""} width={500}>
        {sel && <div><Kv k="Date" v={sel.date} /><Kv k="Location" v={sel.loc} /><Kv k="Person involved" v={sel.person} /><Kv k="Severity" v={sel.sev} /><Kv k="Description" v={sel.desc} className="items-start" /><Kv k="Immediate action" v={sel.action} className="items-start" /><Kv k="Root cause" v={sel.root} className="items-start" /><Kv k="Corrective action" v={sel.corrective} className="items-start" /><Kv k="Status" v={sel.status} />
          <div className="mt-4 grid grid-cols-2 gap-2">{[0, 1].map((i) => <SiteArt key={i} kind="commercial" progress={41} seed={i + 9} className="aspect-[4/3] w-full rounded-[6px]" />)}</div></div>}
      </Drawer>
    </div>
  );
}
