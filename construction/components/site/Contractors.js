"use client";
import { useState } from "react";
import { FileText, HardHat, Star } from "lucide-react";
import { CBILLS, CBILL_FLOW, CONTRACTORS, WORK_ORDER } from "@/data/ops";
import { projName } from "@/data/core";
import { Bar, Card, Drawer, Flow, Insight, Kpi, Kv, Pill, Ring, Tabs, cn } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { cr, L, rs } from "@/lib/format";

const ptone = (s) => (s >= 85 ? "good" : s >= 70 ? "warn" : "bad");
export function ContractorsSection({ pid }) {
  const [sel, setSel] = useState(null);
  const rows = CONTRACTORS.filter((c) => !pid || c.p === pid);
  const tot = (k) => rows.reduce((a, c) => a + c[k], 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi label="Work orders" value={cr(tot("wo"), 2)} sub={`${rows.length} contractors`} /><Kpi label="Executed" value={cr(tot("exec"), 2)} tone="accent" /><Kpi label="Certified" value={cr(tot("cert"), 2)} /><Kpi label="Paid" value={cr(tot("paid"), 2)} tone="good" />
        <Kpi label="Pending + retention" value={cr(tot("pending") + tot("retention"), 2)} tone="warn" sub={`Retention held ${L(tot("retention") * 100)}`} />
      </div>
      <Card pad={false} title="Contractor dashboard" sub="Click a contractor for the 360° view">
        <DataTable exportName="contractors" dense pageSize={8} searchKeys={["name", "trade"]} onRowClick={setSel} columns={[
          { key: "name", label: "Contractor", render: (r) => <div><div className="font-medium">{r.name}</div><div className="text-[11.5px] text-mute">{r.trade}</div></div> },
          ...(pid ? [] : [{ key: "p", label: "Project", render: (r) => <span className="text-mute">{projName(r.p)}</span>, sort: (r) => projName(r.p) }]),
          { key: "wo", label: "Work order", align: "right", render: (r) => cr(r.wo, 2) }, { key: "exec", label: "Executed", align: "right", render: (r) => cr(r.exec, 2) },
          { key: "cert", label: "Certified", align: "right", render: (r) => cr(r.cert, 2) }, { key: "paid", label: "Paid", align: "right", render: (r) => cr(r.paid, 2) },
          { key: "retention", label: "Retention", align: "right", render: (r) => L(r.retention * 100) }, { key: "pending", label: "Pending", align: "right", render: (r) => L(r.pending * 100) },
          { key: "prog", label: "Progress", render: (r) => <div className="w-20"><Bar value={(r.exec / r.wo) * 100} h={5} /></div>, csv: (r) => Math.round((r.exec / r.wo) * 100) + "%" },
          { key: "score", label: "Performance", align: "right", render: (r) => <span className="inline-flex items-center gap-1.5"><Star size={12} className={cn(`text-${ptone(r.score)}`)} fill="currentColor" /><b className="num">{r.score}</b></span> },
        ]} rows={rows} />
      </Card>
      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel?.name} sub={sel ? `${sel.trade} · ${projName(sel.p)}` : ""} width={560}><C360 c={sel} /></Drawer>
    </div>
  );
}
function C360({ c }) {
  const [tab, setTab] = useState("Overview");
  if (!c) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-5"><Ring size={96} stroke={9} value={c.score} tone={ptone(c.score)} label={c.score} sub="score" />
        <div className="grid flex-1 grid-cols-3 gap-2 text-center">{[["Quality", c.quality], ["Safety", c.safety], ["Workers", c.workers]].map(([k, v]) => <div key={k} className="rounded-[6px] bg-panel p-2"><div className="num text-[18px] font-semibold">{v}</div><div className="text-[10.5px] uppercase tracking-wide text-faint">{k}</div></div>)}</div></div>
      <Tabs tabs={["Overview", "Work order", "Bills", "Documents"]} value={tab} onChange={setTab} />
      {tab === "Overview" && (<><div><Kv k="Work order value" v={cr(c.wo, 2)} /><Kv k="Executed" v={cr(c.exec, 2)} /><Kv k="Certified" v={cr(c.cert, 2)} /><Kv k="Paid" v={cr(c.paid, 2)} /><Kv k="Retention held" v={L(c.retention * 100)} /><Kv k="Pending payment" v={L(c.pending * 100)} /></div>
        <Insight tone={c.score < 60 ? "bad" : "accent"}>{c.note ? `Workforce is below plan (${c.workers} vs 26 planned) — ${c.note.toLowerCase()} is delaying the critical activity.` : c.score < 70 ? "Quality score is dragging performance; open snags should be closed before the next bill is released." : "Delivering on plan with good quality and safety compliance."}</Insight></>)}
      {tab === "Work order" && <WorkOrder />}
      {tab === "Bills" && <div className="space-y-2">{CBILLS.filter((b) => b.contractor === c.name).map((b) => <div key={b.id} className="flex items-center justify-between rounded-[6px] border border-line p-3"><div><div className="num text-[13px] font-medium">{b.id} · {b.desc}</div><div className="text-[11.5px] text-mute">Due {b.due}</div></div><div className="text-right"><div className="num font-semibold">{rs(b.amount)}</div><Pill>{b.status}</Pill></div></div>)}</div>}
      {tab === "Documents" && ["Work order WO-0412.pdf", "Insurance & ESI certificate.pdf", "Safety induction register.xlsx", "Measurement book MB-212.pdf"].map((d) => <div key={d} className="mb-1 flex items-center gap-2 rounded-[6px] border border-line px-3 py-2 text-[12.5px]"><FileText size={13} className="text-mute" />{d}</div>)}
    </div>
  );
}
export function WorkOrder() {
  const w = WORK_ORDER;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><div className="num text-[15px] font-semibold">{w.id}</div><Pill tone="good">Active</Pill></div>
      <div><Kv k="Contractor" v={w.contractor} /><Kv k="Project" v="Skyline Residency" /><Kv k="Scope" v={w.scope} className="items-start" /><Kv k="BOQ items" v={w.boq} /><Kv k="Quantity" v={w.qty} /><Kv k="Rate" v={w.rate} /><Kv k="Order value" v={w.value} /><Kv k="Start → End" v={`${w.start} → ${w.end}`} /><Kv k="Retention" v={w.retention} /><Kv k="Payment terms" v={w.terms} /></div>
      <div><div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-faint">Milestones</div>{w.milestones.map(([a, b]) => <div key={a} className="flex justify-between border-b border-line/60 py-1.5 text-[12.5px]"><span>{a}</span><span className="text-mute">{b}</span></div>)}</div>
    </div>
  );
}
export function ContractorBills({ pid }) {
  const [sel, setSel] = useState(null);
  const rows = CBILLS.filter((b) => !pid || b.p === pid);
  return (
    <>
      <Card pad={false} title="Contractor bills" sub="Click a bill to see where it is in the approval chain">
        <DataTable exportName="contractor-bills" dense pageSize={8} searchKeys={["id", "contractor"]} onRowClick={setSel} filters={[{ key: "status", label: "Status", options: ["Pending", "Approved", "Paid"] }]} columns={[
          { key: "id", label: "Bill", render: (r) => <span className="num font-medium text-accent-ink">{r.id}</span> }, { key: "contractor", label: "Contractor" }, { key: "desc", label: "Description" },
          ...(pid ? [] : [{ key: "p", label: "Project", render: (r) => <span className="text-mute">{projName(r.p)}</span> }]),
          { key: "amount", label: "Amount", align: "right", render: (r) => rs(r.amount) }, { key: "due", label: "Due" },
          { key: "step", label: "Stage", render: (r) => <span className="text-[12px] text-mute">{CBILL_FLOW[Math.min(r.step, 7) - 1]}</span>, sort: (r) => r.step, csv: (r) => CBILL_FLOW[Math.min(r.step, 7) - 1] },
          { key: "status", label: "Status", render: (r) => <Pill>{r.status}</Pill>, csv: (r) => r.status },
        ]} rows={rows} />
      </Card>
      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel ? `${sel.id} · ${sel.desc}` : ""} sub={sel ? `${sel.contractor} · ${rs(sel.amount)}` : ""} width={440}>
        {sel && <Flow vertical steps={CBILL_FLOW.map((l, i) => ({ label: l, meta: i < sel.step - 1 ? ["Submitted 02 Oct", "Verified by site engineer", "Qty matched to MB-212", "QS approved", "PM approved", "Accounts approved", "Paid"][i] : i === sel.step - 1 ? "Awaiting action" : "" }))} current={sel.step - 1} />}
      </Drawer>
    </>
  );
}
