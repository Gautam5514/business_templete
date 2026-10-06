"use client";
import { useState } from "react";
import { ArrowRight, Award, Check, Paperclip, Sparkles, Zap } from "lucide-react";
import { MRS, POS, PROC_STATS, SUPPLIERS_CMP } from "@/data/ops";
import { projName } from "@/data/core";
import { Btn, Card, Drawer, Flow, Insight, Kpi, Kv, Pill, cn, Bar } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { num, rs } from "@/lib/format";
import { useStore } from "@/lib/store";

const FLOW = ["Material Request", "Approval", "RFQ", "Supplier Comparison", "Purchase Order", "Dispatch", "In Transit", "Site Receipt", "Quality Check", "Site Store", "Consumption"];
const FLOW_COUNTS = [14, 7, 5, 3, 22, 4, 9, 6, 2, 11, 38];

export function ProcStats() {
  const s = PROC_STATS;
  const tiles = [["Open requests", s.openMR], ["Pending approvals", s.pending, "warn"], ["RFQs out", s.rfq], ["POs issued", s.po], ["In transit", s.transit, "info"], ["Delayed", s.delayed, "bad"], ["Purchase this month", s.purchase], ["Savings vs budget", s.savings, "good"]];
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">{tiles.map(([l, v, t]) => <Kpi key={l} label={l} value={v} tone={t} />)}</div>;
}
export function ProcFlow() {
  return (
    <Card title="Procurement pipeline" sub="Live count of requests at each stage — from need to consumption">
      <div className="scroll-thin flex overflow-x-auto pb-1">
        {FLOW.map((l, i) => (
          <div key={l} className="relative min-w-[104px] flex-1 border-r border-line px-3 last:border-0">
            <div className={cn("num text-[22px] font-semibold", i === 1 || i === 3 ? "text-warn" : i === 6 ? "text-info" : "")}>{FLOW_COUNTS[i]}</div>
            <div className="text-[11.5px] leading-tight text-mute">{l}</div>
            {(i === 1 || i === 3) && <div className="mt-1 text-[10px] font-bold uppercase text-warn">Needs action</div>}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function SupplierCompare() {
  const { toast, log } = useStore();
  const [rec, setRec] = useState(null);
  const best = (k, min = true) => { const v = SUPPLIERS_CMP.map((s) => s[k]); return min ? Math.min(...v) : Math.max(...v); };
  const rows = [
    ["Rate / MT", (s) => rs(s.rate), "rate"], ["Transport / MT", (s) => rs(s.transport), "transport"], ["GST", (s) => `${s.gst}%`, null], ["Delivery time", (s) => `${s.days} days`, "days"],
    ["Credit days", (s) => `${s.credit} days`, "credit", false], ["Quality rating", (s) => `★ ${s.rating}`, "rating", false], ["Past performance", (s) => s.past, null], ["Final landed cost / MT", (s) => rs(s.landed), "landed"],
  ];
  const lowest = SUPPLIERS_CMP.reduce((a, b) => (a.landed < b.landed ? a : b));
  const jsw = SUPPLIERS_CMP[1];
  const delta = Math.round(((jsw.landed - lowest.landed) * 18) / 100) * 100;
  return (
    <Card title="Supplier comparison — TMT Steel 12mm · 18 MT" sub="MR-2841 · Skyline Residency · required by 09 Oct" action={<Pill tone="info">3 quotes received</Pill>}>
      <div className="scroll-thin overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead><tr className="border-b border-line">
            <th className="w-44 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-faint">Compare</th>
            {SUPPLIERS_CMP.map((s) => <th key={s.s} className={cn("px-3 py-2 align-bottom", rec === s.s && "bg-good-soft")}><div className="text-[13px] font-semibold">{s.s}</div><div className="text-[10.5px] font-medium normal-case text-mute">{s.note}{rec === s.s && " · recommended"}</div></th>)}
          </tr></thead>
          <tbody>
            {rows.map(([l, fn, k, min = true], ri) => (
              <tr key={l} className={cn("border-b border-line/60", ri === rows.length - 1 && "bg-panel font-semibold")}>
                <td className="py-2.5 text-[12.5px] text-mute">{l}</td>
                {SUPPLIERS_CMP.map((s) => { const isBest = k && s[k] === best(k, min); return <td key={s.s} className={cn("num px-3 py-2.5 text-[13px]", rec === s.s && "bg-good-soft")}>{fn(s)}{isBest && <Award size={12} className="ml-1.5 inline text-good" />}</td>; })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <Insight title="AI recommendation">JSW Authorized Distributor is <b>₹{num(delta)} more expensive</b> than the lowest landed cost but delivers <b>3 days earlier</b> than the next-fastest, preventing an estimated <b>₹1.2L project delay</b> on Block B.</Insight>
        <div className="flex gap-2">
          <Btn onClick={() => { setRec(lowest.s); toast(`${lowest.s} marked as recommended`, "warn"); }}>Lowest cost</Btn>
          <Btn variant="primary" onClick={() => { setRec(jsw.s); toast("JSW recommended — PO-1844 sent for approval"); log("Supplier recommendation: JSW Authorized Distributor for MR-2841.", "Purchase Manager", "skyline"); }}><Sparkles size={13} /> Recommend supplier</Btn>
        </div>
      </div>
    </Card>
  );
}

export function PoTable({ pid }) {
  const [sel, setSel] = useState(null);
  const rows = POS.filter((p) => !pid || p.p === pid).map((p) => ({ ...p, value: p.qty * p.rate }));
  return (
    <>
      <Card title="Purchase orders" pad={false}>
        <DataTable exportName="purchase-orders" pageSize={8} dense searchKeys={["id", "supplier", "material"]} onRowClick={setSel}
          filters={[{ key: "status", label: "Status", options: ["Received", "Partial", "In Transit", "Delayed"] }]}
          columns={[
            { key: "id", label: "PO", render: (r) => <span className="num font-medium text-accent-ink">{r.id}</span> },
            ...(pid ? [] : [{ key: "p", label: "Project", render: (r) => <span className="text-mute">{projName(r.p)}</span>, sort: (r) => projName(r.p) }]),
            { key: "supplier", label: "Supplier" }, { key: "material", label: "Material" },
            { key: "qty", label: "Qty", align: "right", render: (r) => `${num(r.qty)} ${r.unit}` },
            { key: "value", label: "Value", align: "right", render: (r) => rs(r.value) }, { key: "delivery", label: "Due" },
            { key: "del", label: "Delivered", render: (r) => <div className="flex w-28 items-center gap-2"><Bar value={(r.delivered / r.qty) * 100} h={5} tone="good" /><span className="num text-[11px] text-mute">{Math.round((r.delivered / r.qty) * 100)}%</span></div>, csv: (r) => Math.round((r.delivered / r.qty) * 100) + "%" },
            { key: "status", label: "Status", render: (r) => <Pill>{r.status}</Pill>, csv: (r) => r.status },
          ]} rows={rows} />
      </Card>
      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel ? `${sel.id} · ${sel.material}` : ""} sub={sel ? `${sel.supplier} · ${projName(sel.p)}` : ""} width={480}>
        {sel && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[6px] bg-panel p-3"><div className="text-[10.5px] uppercase tracking-wide text-faint">PO value</div><div className="num text-[20px] font-semibold">{rs(sel.qty * sel.rate)}</div></div>
              <div className="rounded-[6px] bg-panel p-3"><div className="text-[10.5px] uppercase tracking-wide text-faint">Status</div><div className="mt-1"><Pill>{sel.status}</Pill></div></div>
            </div>
            <div><Kv k="Quantity" v={`${num(sel.qty)} ${sel.unit}`} /><Kv k="Rate" v={`${rs(sel.rate)} / ${sel.unit}`} /><Kv k="Delivery date" v={sel.delivery} /><Kv k="Payment terms" v={sel.terms} /><Kv k="Delivered" v={`${num(sel.delivered)} ${sel.unit}`} /><Kv k="Pending" v={`${num(sel.qty - sel.delivered)} ${sel.unit}`} /></div>
            <div><div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-faint">Approvals</div>
              <Flow vertical steps={[{ label: "Requested — Site Engineer", meta: "06 Oct 09:14" }, { label: "Approved — Purchase Manager", meta: "06 Oct 09:38" }, { label: "Approved — Project Manager", meta: "06 Oct 09:55" }, { label: sel.status === "Received" ? "Approved — Managing Director" : "Awaiting — Managing Director", meta: sel.status === "Received" ? "05 Oct" : "Pending" }]} current={sel.status === "Received" ? 4 : 3} /></div>
            <div><div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-faint">Attachments</div>
              {["Quotation_comparison.pdf", `${sel.id}_signed.pdf`, "Supplier_terms.pdf"].map((a) => <div key={a} className="mb-1 flex items-center gap-2 rounded-[6px] border border-line px-3 py-2 text-[12.5px]"><Paperclip size={13} className="text-mute" />{a}</div>)}</div>
          </div>
        )}
      </Drawer>
    </>
  );
}
export function MrTable({ pid }) {
  return (
    <Card title="Material requests" pad={false}>
      <DataTable dense exportName="material-requests" pageSize={6} columns={[
        { key: "id", label: "MR", render: (r) => <span className="num font-medium text-accent-ink">{r.id}</span> },
        ...(pid ? [] : [{ key: "p", label: "Project", render: (r) => <span className="text-mute">{projName(r.p)}</span> }]),
        { key: "material", label: "Material" }, { key: "qty", label: "Qty", align: "right" }, { key: "by", label: "Requested by" }, { key: "date", label: "Date" },
        { key: "priority", label: "Priority", render: (r) => <Pill>{r.priority}</Pill>, csv: (r) => r.priority }, { key: "status", label: "Status", render: (r) => <Pill>{r.status}</Pill>, csv: (r) => r.status },
      ]} rows={MRS.filter((m) => !pid || m.p === pid)} />
    </Card>
  );
}
