"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { Btn, Card, PageHeader, Pill } from "@/components/ui/ui";
import { DataTable, type Col } from "@/components/ui/table";
import { CustLink, InvLink } from "@/components/ui/links";
import { Donut } from "@/components/ui/charts";
import { RecordPaymentModal } from "@/components/shell/QuickModals";
import { custName } from "@/data/core";
import { fdt, inr, lakh } from "@/lib/format";
import type { Payment } from "@/types";

const MCOL: Record<string, string> = { NEFT: "#3a3fc4", UPI: "#157347", "Bank Transfer": "#0b6a9c", Cheque: "#a15c07", RTGS: "#6b5bd6", Cash: "#6b6a64", "Credit Adjustment": "#b42318" };

export function Payments() {
  const { payments } = useStore();
  const [open, setOpen] = useState(false);
  const today = payments.filter((p) => p.date.startsWith("2026-10-06")).reduce((a, p) => a + p.amount, 0);
  const byMethod = Object.entries(payments.reduce<Record<string, number>>((m, p) => ((m[p.method] = (m[p.method] ?? 0) + p.amount), m), {})).sort((a, b) => b[1] - a[1]);
  const cols: Col<Payment>[] = [
    { key: "id", header: "Receipt Number", render: (p) => <span className="num font-medium">{p.id}</span> },
    { key: "cust", header: "Customer", get: (p) => custName(p.custId), render: (p) => <CustLink id={p.custId} /> },
    { key: "inv", header: "Invoice", get: (p) => p.invoiceId, render: (p) => <InvLink id={p.invoiceId} /> },
    { key: "amount", header: "Amount", align: "right", render: (p) => <b>{inr(p.amount)}</b> },
    { key: "method", header: "Method", render: (p) => <Pill tone="neutral" dot={false}>{p.method}</Pill> },
    { key: "ref", header: "Reference Number", muted: true, render: (p) => <span className="num">{p.ref}</span> },
    { key: "by", header: "Collected By", muted: true },
    { key: "date", header: "Date", get: (p) => p.date, render: (p) => <span className="num text-mute">{fdt(p.date)}</span> },
    { key: "notes", header: "Notes", muted: true, defaultHidden: true },
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Payments" sub="Every rupee received, matched to an invoice." actions={<Btn variant="primary" icon={<Plus size={15} />} onClick={() => setOpen(true)}>Record Payment</Btn>} />
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-5">
        {[["Collected Today", inr(today || 324000)], ["Collected This Month", "₹1.42 Cr"], ["Pending", "₹46.72 L"], ["Overdue", "₹14.7 L"], ["Advance Payments", "₹6.8 L"]].map(([l, v], i) => <div key={l} className="rounded-[8px] border border-line bg-surface p-3"><div className="label">{l}</div><div className={`num mt-1 text-[21px] font-semibold tracking-tight ${i === 3 ? "text-bad" : i === 0 || i === 1 ? "text-ok" : ""}`}>{v}</div></div>)}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <DataTable rows={payments} cols={cols} rowKey={(p) => p.id} pageSize={12} exportName="payments" defaultSort={{ key: "date", dir: "desc" }} searchPlaceholder="Search receipt, customer, reference…" selectable
          filters={[{ key: "m", label: "Method", options: Object.keys(MCOL), match: (p, v) => p.method === v }, { key: "by", label: "Collected by", options: Array.from(new Set(payments.map((p) => p.by))).sort(), match: (p, v) => p.by === v }]}
          expand={(p) => <div className="grid gap-4 text-[12.5px] sm:grid-cols-4"><div><div className="label">Customer</div>{custName(p.custId)}</div><div><div className="label">Against invoice</div>{p.invoiceId}</div><div><div className="label">Reference</div><span className="num">{p.ref}</span></div><div><div className="label">Notes</div>{p.notes || "—"}</div></div>} />
        <Card title="Collections by method" sub="All receipts listed">
          <Donut data={byMethod.map(([name, value]) => ({ name, value, color: MCOL[name] }))} height={170} />
          <ul className="mt-2 space-y-1.5 text-[12.5px]">{byMethod.map(([n, v]) => <li key={n} className="flex items-center justify-between"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-sm" style={{ background: MCOL[n] }} />{n}</span><span className="num font-medium">{lakh(v)}</span></li>)}</ul>
        </Card>
      </div>
      <RecordPaymentModal key={open ? "o" : "c"} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
