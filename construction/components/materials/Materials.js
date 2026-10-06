"use client";
import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, Flame } from "lucide-react";
import { MATERIALS, MOVE, MR, MAT_STATUS } from "@/data/ops";
import { projName } from "@/data/core";
import { Bar, Btn, Card, Drawer, Flow, Insight, Kpi, Pill, cn } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { num } from "@/lib/format";
import { useStore } from "@/lib/store";

export function MrCard() {
  const { toast, log } = useStore();
  const [done, setDone] = useState(false);
  const days = +(MR.stock / MR.rate).toFixed(1);
  return (
    <div className="overflow-hidden rounded-[8px] border border-bad/40 bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bad/25 bg-bad-soft px-4 py-2">
        <div className="flex items-center gap-2 text-[12.5px] font-semibold text-bad"><Flame size={14} /> CRITICAL · Material Request {MR.id} · Skyline Residency</div>
        <Pill tone="bad">Estimated stock-out in {days} days</Pill>
      </div>
      <div className="grid gap-5 p-4 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <div className="text-[18px] font-semibold tracking-[-0.01em]">{MR.material}</div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {[["Required", `${MR.required} MT`, ""], ["On site", `${MR.stock} MT`, "text-bad"], ["Burn rate", `${MR.rate} MT/day`, ""]].map(([k, v, c]) => <div key={k}><div className="text-[10.5px] uppercase tracking-wide text-faint">{k}</div><div className={cn("num text-[20px] font-semibold", c)}>{v}</div></div>)}
          </div>
          <div className="mt-4"><div className="mb-1 flex justify-between text-[11.5px] text-mute"><span>Stock vs requirement</span><span className="num">{Math.round((MR.stock / MR.required) * 100)}%</span></div><Bar value={MR.stock} max={MR.required} tone="bad" h={9} /></div>
          <p className="mt-3 text-[13px]"><b>5.4 MT available — only {days} days of stock remaining.</b> Tower B column work stops tomorrow afternoon without a delivery. Required by <b>{MR.by}</b>.</p>
          <div className="mt-3 flex gap-2"><Btn variant="primary" disabled={done} onClick={() => { setDone(true); toast("MR-2841 approved — PO-1844 released to JSW"); log("Steel Material Request MR-2841 approved — PO-1844 released.", "Arjun Mehta", "skyline"); }}>{done ? <><Check size={14} /> Approved</> : "Approve & release PO"}</Btn><Link href="/procurement"><Btn>Compare suppliers <ArrowRight size={13} /></Btn></Link></div>
        </div>
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-faint">Procurement trace</div>
          <Flow steps={MR.flow.map((l) => ({ label: l }))} current={done ? 5 : MR.step} />
          <div className="mt-3 text-[11.5px] text-mute">Requested by {MR.requester} · priority {MR.priority}</div>
        </div>
      </div>
    </div>
  );
}

export const daysOfStock = (m) => { const use = m.rate || m.consumed / 150; return use ? m.stock / use : 99; };
function Pipe({ m }) {
  const total = Math.max(m.ordered, 1);
  const seg = [[m.consumed + m.wastage, "var(--faint)", "Consumed"], [Math.max(0, m.stock), m.status === "Healthy" ? "var(--good)" : "var(--bad)", "In store"], [m.transit, "var(--info)", "In transit"], [Math.max(0, m.ordered - m.received - m.transit), "var(--line-strong)", "Awaiting"]];
  return <div className="flex h-2.5 w-44 overflow-hidden rounded-[2px] bg-panel">{seg.map(([v, c, t], i) => <div key={i} title={`${t}: ${num(v, 1)}`} style={{ width: `${(v / total) * 100}%`, background: c }} />)}</div>;
}

export function MaterialsSection({ pid, showMr = true }) {
  const [sel, setSel] = useState(null);
  const rows = MATERIALS.filter((m) => !pid || m.p === pid).map((m) => ({ ...m, required: m.required || Math.round(m.ordered * 1.18), days: daysOfStock(m) }));
  const low = rows.filter((r) => r.status !== "Healthy");
  return (
    <div className="space-y-4">
      {showMr && (!pid || pid === "skyline") && <MrCard />}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Materials tracked" value={rows.length} sub={pid ? projName(pid) : "across 7 sites"} />
        <Kpi label="Below minimum" value={low.length} tone={low.length ? "bad" : "good"} sub="Need action this week" />
        <Kpi label="In transit" value={rows.filter((r) => r.transit > 0).length} tone="info" sub="Deliveries on the road" />
        <Kpi label="Wastage" value={`${(rows.reduce((a, r) => a + (r.wastage / Math.max(r.received, 1)) * 100, 0) / Math.max(rows.length, 1)).toFixed(1)}%`} sub="Average of received qty" />
      </div>
      <Card title="Live material tracking" sub="Click a row to trace it from supplier to consumption" pad={false}>
        <DataTable exportName="materials" pageSize={9} dense searchKeys={["name"]} onRowClick={setSel}
          filters={[{ key: "status", label: "Status", options: ["Healthy", "Low_", "Out"], get: (r) => r.status }]}
          columns={[
            ...(pid ? [] : [{ key: "p", label: "Project", render: (r) => <span className="text-mute">{projName(r.p)}</span>, sort: (r) => projName(r.p) }]),
            { key: "name", label: "Material", render: (r) => <span className="font-medium">{r.name}{r.critical && <AlertTriangle size={12} className="ml-1.5 inline text-bad" />}</span> },
            { key: "unit", label: "Unit" },
            { key: "required", label: "Required", align: "right", render: (r) => num(r.required, 1) },
            { key: "ordered", label: "Ordered", align: "right", render: (r) => num(r.ordered, 1) },
            { key: "transit", label: "In transit", align: "right", render: (r) => (r.transit ? num(r.transit, 1) : "—") },
            { key: "received", label: "Received", align: "right", render: (r) => num(r.received, 1) },
            { key: "consumed", label: "Consumed", align: "right", render: (r) => num(r.consumed, 1) },
            { key: "wastage", label: "Wastage", align: "right", render: (r) => num(r.wastage, 1) },
            { key: "stock", label: "In stock", align: "right", render: (r) => <b className={r.status !== "Healthy" ? "text-bad" : ""}>{num(r.stock, 1)}</b> },
            { key: "days", label: "Cover", align: "right", render: (r) => <span className={r.days < 2 ? "font-semibold text-bad" : r.days < 5 ? "text-warn" : "text-mute"}>{r.days > 30 ? "30d+" : `${r.days.toFixed(1)}d`}</span> },
            { key: "pipe", label: "Flow", render: (r) => <Pipe m={r} />, csv: () => "" },
            { key: "status", label: "Status", render: (r) => <Pill tone={MAT_STATUS[r.status][1]}>{MAT_STATUS[r.status][0]}</Pill>, csv: (r) => MAT_STATUS[r.status][0] },
          ]} rows={rows} />
      </Card>
      <div className="flex flex-wrap gap-4 text-[11.5px] text-mute"><span>Flow bar:</span>{[["Consumed", "var(--faint)"], ["In store", "var(--good)"], ["In transit", "var(--info)"], ["Awaiting dispatch", "var(--line-strong)"]].map(([l, c]) => <span key={l} className="flex items-center gap-1.5"><i className="h-2 w-3 rounded-[1px]" style={{ background: c }} />{l}</span>)}</div>
      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel?.name} sub={sel ? `${projName(sel.p)} · material movement` : ""} width={460}>
        {sel && (<div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">{[["Ordered", sel.ordered], ["Received", sel.received], ["Consumed", sel.consumed]].map(([k, v]) => <div key={k} className="rounded-[6px] bg-panel p-2.5"><div className="text-[10.5px] uppercase tracking-wide text-faint">{k}</div><div className="num text-[16px] font-semibold">{num(v, 1)}</div></div>)}</div>
          <Insight tone={sel.status !== "Healthy" ? "bad" : "accent"}>{sel.status === "Healthy" ? `${num(sel.stock, 1)} ${sel.unit} in store — about ${sel.days > 30 ? "a month+" : sel.days.toFixed(0) + " days"} of cover at current usage.` : `${num(sel.stock, 1)} ${sel.unit} available — only ${sel.days.toFixed(1)} days of stock remaining.`}</Insight>
          <MovementTimeline />
        </div>)}
      </Drawer>
    </div>
  );
}

export function MovementTimeline() {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-faint">Material movement · latest delivery</div>
      <ol className="relative">
        {MOVE.map((m, i) => (
          <li key={i} className="relative pb-4 pl-7 last:pb-0">
            {i < MOVE.length - 1 && <span className={cn("absolute left-[8px] top-4 h-full w-px", m.done ? "bg-ink" : "bg-line-strong")} />}
            <span className={cn("absolute left-0 top-0.5 flex h-[17px] w-[17px] items-center justify-center rounded-full border", m.done ? "border-ink bg-ink text-bg" : "border-accent bg-surface")}>{m.done ? <Check size={10} strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-accent blink" />}</span>
            <div className="text-[13px] font-semibold leading-tight">{m.s}</div>
            <div className="text-[12px] text-mute">{m.who}</div>
            <div className="num text-[11px] text-faint">{m.t}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
