"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, MessageSquare, PhoneCall } from "lucide-react";
import { useStore } from "@/lib/store";
import { Btn, Card, Field, Input, Modal, PageHeader, Pill, Select, Textarea, cn } from "@/components/ui/ui";
import { DataTable, type Col } from "@/components/ui/table";
import { CustLink } from "@/components/ui/links";
import { BarsChart, CHART_COLORS } from "@/components/ui/charts";
import { fdate, inr, lakh } from "@/lib/format";
import { RecordPaymentModal } from "@/components/shell/QuickModals";
import type { Customer } from "@/types";

const BUCKETS: [string, number, string][] = [["Not Due", 18.2, "ok"], ["0–7 Days", 8.4, "info"], ["8–15 Days", 6.2, "info"], ["16–30 Days", 5.1, "warn"], ["31–60 Days", 4.8, "bad"], ["60+ Days", 4.02, "bad"]];
const risk = (c: Customer) => (c.oldestDays > 45 || c.overdue / c.creditLimit > 0.45 ? "Critical" : c.oldestDays > 30 ? "High" : c.oldestDays > 10 || c.overdue > 0 ? "Medium" : "Low");

export function Receivables() {
  const { customers, followups, addFollowup, toast } = useStore();
  const router = useRouter();
  const [fu, setFu] = useState<{ cust: string; kind: string; text: string; amt: string; date: string } | null>(null);
  const [pay, setPay] = useState(false);
  const rows = customers.filter((c) => c.outstanding > 0);
  const lastFu = (id: string) => followups.find((f) => f.custId === id);
  const promises = followups.filter((f) => f.kind === "Promise To Pay");
  const cols: Col<Customer>[] = [
    { key: "name", header: "Customer", render: (c) => <CustLink id={c.id} /> },
    { key: "outstanding", header: "Outstanding", align: "right", render: (c) => <b>{inr(c.outstanding)}</b> },
    { key: "overdue", header: "Overdue", align: "right", render: (c) => <span className={c.overdue ? "text-bad" : "text-faint"}>{inr(c.overdue)}</span> },
    { key: "oldest", header: "Oldest Invoice", align: "right", get: (c) => c.oldestDays, render: (c) => <span className="num text-mute">{c.oldestDays ? fdate(new Date(new Date("2026-10-06").getTime() - (c.oldestDays + 30) * 864e5)) : "—"}</span> },
    { key: "days", header: "Days Overdue", align: "right", get: (c) => c.oldestDays, render: (c) => <span className={cn(c.oldestDays > 30 ? "font-semibold text-bad" : c.oldestDays > 0 ? "text-warn" : "text-faint")}>{c.oldestDays || "—"}</span> },
    { key: "limit", header: "Credit Limit", align: "right", get: (c) => c.creditLimit, render: (c) => inr(c.creditLimit) },
    { key: "risk", header: "Risk", get: (c) => risk(c), render: (c) => <Pill>{risk(c)}</Pill> },
    { key: "rep", header: "Salesperson", muted: true },
    { key: "last", header: "Last Follow-Up", get: (c) => lastFu(c.id)?.ts ?? "", render: (c) => { const f = lastFu(c.id); return f ? <span className="text-mute"><span className="num">{fdate(f.ts)}</span> · {f.kind}</span> : <span className="text-faint">None</span>; } },
    { key: "act", header: "", sortable: false, render: (c) => <div className="flex gap-1" onClick={(e) => e.stopPropagation()}><Btn size="xs" icon={<PhoneCall size={12} />} onClick={() => setFu({ cust: c.id, kind: "Phone Call", text: "", amt: "", date: "" })}>Follow up</Btn></div> },
  ];
  const save = () => {
    if (!fu || !fu.text.trim()) return toast("Add a note", "bad");
    addFollowup({ custId: fu.cust, kind: fu.kind, note: fu.text, promiseAmt: fu.amt ? Number(fu.amt) : undefined, promiseDate: fu.date || undefined });
    toast("Follow-up logged", "ok", `${fu.kind} · reminder scheduled`); setFu(null);
  };
  return (
    <div className="space-y-4">
      <PageHeader title="Receivables" sub="Who owes what, for how long, and what was promised." actions={<><Btn icon={<MessageSquare size={14} />} onClick={() => toast("Reminders sent to 12 overdue customers", "ok", "WhatsApp · statements attached")}>Send reminders</Btn><Btn variant="primary" onClick={() => setPay(true)}>Record payment</Btn></>} />
      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <Card><div className="label">Total Receivables</div><div className="num mt-1 text-[34px] font-semibold tracking-[-0.02em]">₹46.72 Lakh</div><div className="mt-1 text-[12.5px] text-mute">across {rows.length} customers · <span className="font-medium text-bad">₹14.7 L overdue</span></div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-panel flex">{BUCKETS.map(([l, v, t]) => <div key={l} className={t === "ok" ? "bg-ok" : t === "info" ? "bg-info" : t === "warn" ? "bg-[#d4a017]" : "bg-bad"} style={{ width: `${(v / 46.72) * 100}%` }} title={l} />)}</div>
        </Card>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {BUCKETS.map(([l, v, t]) => <div key={l} className="rounded-[8px] border border-line bg-surface p-3"><div className="flex items-center gap-1.5"><i className={cn("h-2 w-2 rounded-full", t === "ok" ? "bg-ok" : t === "info" ? "bg-info" : t === "warn" ? "bg-[#d4a017]" : "bg-bad")} /><span className="label !text-[10.5px]">{l}</span></div><div className="num mt-1.5 text-[20px] font-semibold tracking-tight">₹{v}L</div><div className="num text-[11.5px] text-faint">{Math.round((v / 46.72) * 100)}% of total</div></div>)}
        </div>
      </div>

      <div className="space-y-4">
        <DataTable rows={rows} cols={cols} rowKey={(c) => c.id} pageSize={10} exportName="receivables" defaultSort={{ key: "overdue", dir: "desc" }} searchPlaceholder="Search customer, salesperson…" onRowClick={(c) => router.push(`/customers/${c.id}`)}
          filters={[{ key: "risk", label: "Risk", options: ["Critical", "High", "Medium", "Low"], match: (c, v) => risk(c) === v }, { key: "rep", label: "Salesperson", options: ["Amit Kumar", "Rohit Singh", "Vikash Sharma"], match: (c, v) => c.rep === v }, { key: "age", label: "Overdue age", options: ["30+ days", "15–30 days", "Under 15 days"], match: (c, v) => (v === "30+ days" ? c.oldestDays > 30 : v === "15–30 days" ? c.oldestDays >= 15 && c.oldestDays <= 30 : c.oldestDays > 0 && c.oldestDays < 15) }]} />
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Promises to pay" sub="Reminders fire the day before" pad={false}>
            <ul className="divide-y divide-line text-[13px]">
              <li className="flex items-start justify-between gap-3 px-4 py-3"><div><CustLink id="sharma-hardware" /><div className="text-[12px] text-mute">Outstanding ₹5,31,200 on INV-2941</div><div className="mt-1.5 space-y-0.5 text-[12.5px]"><div className="flex items-center gap-1.5"><Bell size={12} className="text-accent" /><b className="num">₹2,00,000</b> on 10 Oct</div><div className="flex items-center gap-1.5"><Bell size={12} className="text-faint" /><b className="num">₹3,31,200</b> on 18 Oct</div></div></div><Pill tone="warn">Next: 10 Oct</Pill></li>
              {promises.filter((p) => p.custId !== "sharma-hardware").map((p) => <li key={p.id} className="flex items-start justify-between gap-3 px-4 py-3"><div><CustLink id={p.custId} /><div className="mt-1 text-[12.5px]"><b className="num">{inr(p.promiseAmt ?? 0)}</b> on {fdate(p.promiseDate ?? "")}</div></div><Pill tone="info">Scheduled</Pill></li>)}
            </ul>
          </Card>
          <Card title="Recent follow-ups" pad={false}>
            <ul className="divide-y divide-line text-[13px]">{followups.slice(0, 5).map((f) => <li key={f.id} className="px-4 py-2.5"><div className="flex items-center justify-between"><CustLink id={f.custId} /><span className="num text-[11.5px] text-faint">{fdate(f.ts)}</span></div><div className="mt-0.5 flex items-center gap-1.5"><Pill>{f.kind}</Pill><span className="text-[12px] text-mute">{f.by}</span></div><p className="mt-1 line-clamp-2 text-[12.5px] text-mute">{f.note}</p></li>)}</ul>
          </Card>
        </div>
      </div>
      <Card title="Ageing by month" sub="Closing receivables, last 12 months"><BarsChart data={[["Nov", 31], ["Dec", 33], ["Jan", 34], ["Feb", 36], ["Mar", 41], ["Apr", 38], ["May", 40], ["Jun", 43], ["Jul", 45], ["Aug", 44], ["Sep", 43], ["Oct", 46.72]].map(([label, v]) => ({ label: label as string, Outstanding: (v as number) * 1e5 }))} keys={[{ k: "Outstanding", name: "Outstanding" }]} colors={[CHART_COLORS.bad]} height={200} /></Card>

      <Modal open={!!fu} onClose={() => setFu(null)} title="Log collection follow-up" footer={<><Btn onClick={() => setFu(null)}>Cancel</Btn><Btn variant="primary" onClick={save}>Save follow-up</Btn></>}>
        {fu && <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Customer" className="sm:col-span-2"><Select value={fu.cust} onChange={(e) => setFu({ ...fu, cust: e.target.value })}>{rows.map((c) => <option key={c.id} value={c.id}>{c.name} — {inr(c.outstanding)}</option>)}</Select></Field>
          <Field label="Type" className="sm:col-span-2"><Select value={fu.kind} onChange={(e) => setFu({ ...fu, kind: e.target.value })}>{["Phone Call", "WhatsApp", "Email", "Promise To Pay", "Visit", "Payment Dispute"].map((k) => <option key={k}>{k}</option>)}</Select></Field>
          <Field label="Notes" className="sm:col-span-2"><Textarea rows={3} value={fu.text} onChange={(e) => setFu({ ...fu, text: e.target.value })} /></Field>
          {fu.kind === "Promise To Pay" && <><Field label="Promised amount (₹)"><Input type="number" value={fu.amt} onChange={(e) => setFu({ ...fu, amt: e.target.value })} /></Field><Field label="Promised date"><Input type="date" value={fu.date} onChange={(e) => setFu({ ...fu, date: e.target.value })} /></Field></>}
        </div>}
      </Modal>
      <RecordPaymentModal key={pay ? "o" : "c"} open={pay} onClose={() => setPay(false)} />
      <span className="hidden">{lakh(0)}</span>
    </div>
  );
}
