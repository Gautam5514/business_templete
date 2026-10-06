"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { Btn, Card, PageHeader, Pill, Stepper, cn } from "@/components/ui/ui";
import { DataTable, type Col } from "@/components/ui/table";
import { CustLink, OrderLink } from "@/components/ui/links";
import { BarsChart, Donut } from "@/components/ui/charts";
import { EXP_CATS, RETURN_STAGES, RETURN_TYPES, type Expense, type Ret } from "@/data/misc";
import { custName } from "@/data/core";
import { fdate, inr, lakh } from "@/lib/format";

export function Returns() {
  const { returns, advanceReturn, toast } = useStore();
  const [typ, setTyp] = useState("");
  const rows = typ ? returns.filter((r) => r.type === typ) : returns;
  const cols: Col<Ret>[] = [
    { key: "id", header: "Return", render: (r) => <span className="num font-medium">{r.id}</span> },
    { key: "type", header: "Type", render: (r) => <Pill tone={r.type === "Damaged Goods" || r.type === "Quality Issue" ? "bad" : "warn"} dot={false}>{r.type}</Pill> },
    { key: "order", header: "Order", get: (r) => r.orderId, render: (r) => <OrderLink id={r.orderId} /> },
    { key: "cust", header: "Customer", get: (r) => custName(r.custId), render: (r) => <CustLink id={r.custId} /> },
    { key: "product", header: "Product", muted: true },
    { key: "qty", header: "Qty", align: "right" },
    { key: "value", header: "Value", align: "right", render: (r) => inr(r.value) },
    { key: "date", header: "Raised", get: (r) => r.date, render: (r) => <span className="num text-mute">{fdate(r.date)}</span> },
    { key: "stage", header: "Stage", get: (r) => r.stage, render: (r) => <Pill tone={r.stage >= 6 ? "ok" : r.stage === 0 ? "warn" : "info"}>{RETURN_STAGES[r.stage]}</Pill> },
    { key: "act", header: "", sortable: false, render: (r) => r.stage < 6 ? <div onClick={(e) => e.stopPropagation()}><Btn size="xs" onClick={() => { advanceReturn(r.id); toast(`${r.id} → ${RETURN_STAGES[r.stage + 1]}`, "ok", custName(r.custId)); }}>→ {RETURN_STAGES[r.stage + 1]}</Btn></div> : null },
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Returns & Damages" sub="From complaint to credit note — nothing slips." actions={<Btn variant="primary" icon={<Plus size={15} />} onClick={() => toast("Return request created", "ok", "Link it to an order from the order page")}>New return</Btn>} />
      <Card pad><Stepper stages={RETURN_STAGES} current={-1} /></Card>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {RETURN_TYPES.map((t) => <button key={t} onClick={() => setTyp(typ === t ? "" : t)} className={cn("rounded-[8px] border bg-surface p-3 text-left hover:border-line-strong", typ === t ? "border-accent ring-1 ring-accent/30" : "border-line")}><div className="label !text-[10.5px]">{t}</div><div className="num mt-1 text-[21px] font-semibold">{returns.filter((r) => r.type === t).length}</div><div className="num text-[11.5px] text-faint">{lakh(returns.filter((r) => r.type === t).reduce((a, r) => a + r.value, 0))}</div></button>)}
      </div>
      <DataTable key={typ} rows={rows} cols={cols} rowKey={(r) => r.id} pageSize={10} exportName="returns" defaultSort={{ key: "date", dir: "desc" }} searchPlaceholder="Search return, customer, product…"
        filters={[{ key: "stage", label: "Stage", options: RETURN_STAGES, match: (r, v) => RETURN_STAGES[r.stage] === v }]}
        expand={(r) => <div className="space-y-3"><Stepper stages={RETURN_STAGES} current={r.stage} /><div className="text-[12.5px] text-mute"><b className="text-ink">Reason:</b> {r.reason} · <b className="text-ink">Outcome:</b> {r.outcome}</div></div>} />
    </div>
  );
}

const WH_EXP = ["Warehouse", "Staff", "Repair", "Office", "Loading / Unloading"];
export function Expenses() {
  const { expenses, openQuick } = useStore();
  const total = expenses.reduce((a, e) => a + e.amount, 0);
  const byCat = EXP_CATS.map((c) => ({ name: c, value: expenses.filter((e) => e.cat === c).reduce((a, e) => a + e.amount, 0) })).filter((x) => x.value);
  const colors = ["#3a3fc4", "#0b6a9c", "#157347", "#a15c07", "#6b5bd6", "#b42318", "#6b6a64", "#9aa0e6"];
  const delivery = expenses.filter((e) => ["Transport", "Fuel"].includes(e.cat)).reduce((a, e) => a + e.amount, 0);
  const wh = expenses.filter((e) => WH_EXP.includes(e.cat)).reduce((a, e) => a + e.amount, 0);
  const cols: Col<Expense>[] = [
    { key: "id", header: "Expense", render: (e) => <span className="num font-medium">{e.id}</span> },
    { key: "date", header: "Date", get: (e) => e.date, render: (e) => <span className="num text-mute">{fdate(e.date)}</span> },
    { key: "cat", header: "Category", render: (e) => <Pill tone="neutral" dot={false}>{e.cat}</Pill> },
    { key: "desc", header: "Description" },
    { key: "wh", header: "Location", muted: true },
    { key: "by", header: "Booked by", muted: true },
    { key: "mode", header: "Mode", muted: true },
    { key: "amount", header: "Amount", align: "right", render: (e) => <b>{inr(e.amount)}</b> },
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Expenses" sub="Where the operating money goes — against sales." actions={<Btn variant="primary" icon={<Plus size={15} />} onClick={() => openQuick("expense")}>Add Expense</Btn>} />
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[["Expense this month", inr(total)], ["Expense vs sales", `${((total / 18.4e6) * 100).toFixed(1)}%`], ["Warehouse expense", inr(wh)], ["Delivery expense", inr(delivery)]].map(([l, v]) => <div key={l} className="rounded-[8px] border border-line bg-surface p-3"><div className="label">{l}</div><div className="num mt-1 text-[21px] font-semibold tracking-tight">{v}</div></div>)}
      </div>
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card title="By category"><Donut data={byCat.map((c, i) => ({ ...c, color: colors[i % colors.length] }))} height={170} /><ul className="mt-2 space-y-1.5 text-[12.5px]">{byCat.map((c, i) => <li key={c.name} className="flex items-center justify-between"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-sm" style={{ background: colors[i % colors.length] }} />{c.name}</span><span className="num font-medium">{lakh(c.value)} <span className="text-faint">· {Math.round((c.value / total) * 100)}%</span></span></li>)}</ul></Card>
        <Card title="Expense as % of sales" sub="Last 6 months"><BarsChart data={[["May", 5.9], ["Jun", 6.1], ["Jul", 5.7], ["Aug", 5.6], ["Sep", 5.5], ["Oct", Number(((total / 18.4e6) * 100).toFixed(1))]].map(([label, v]) => ({ label: label as string, Pct: v as number }))} keys={[{ k: "Pct", name: "% of sales" }]} money={false} height={230} /></Card>
      </div>
      <DataTable rows={expenses} cols={cols} rowKey={(e) => e.id} pageSize={10} exportName="expenses" defaultSort={{ key: "date", dir: "desc" }} searchPlaceholder="Search expense…" filters={[{ key: "cat", label: "Category", options: EXP_CATS, match: (e, v) => e.cat === v }, { key: "loc", label: "Location", options: ["Ranchi", "Dhanbad", "Patna"], match: (e, v) => e.wh === v }]} />
    </div>
  );
}
