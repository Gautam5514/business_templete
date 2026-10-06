"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Download, Wallet } from "lucide-react";
import { useStore } from "@/lib/store";
import { Btn, Card, Empty, KV, PageHeader, Pill, Progress, cn } from "@/components/ui/ui";
import { DataTable, type Col } from "@/components/ui/table";
import { CustLink, InvLink, OrderLink, ShpLink, ProdLink } from "@/components/ui/links";
import { custName, prodBySku } from "@/data/core";
import { lineTotal } from "@/data/ops";
import { fdate, fdt, inr, num, NOW } from "@/lib/format";
import { RecordPaymentModal } from "@/components/shell/QuickModals";
import type { Invoice } from "@/types";

export function InvoicesList() {
  const { invoices } = useStore();
  const router = useRouter();
  const cols: Col<Invoice>[] = [
    { key: "id", header: "Invoice Number", render: (i) => <InvLink id={i.id} /> },
    { key: "cust", header: "Customer", get: (i) => custName(i.custId), render: (i) => <CustLink id={i.custId} /> },
    { key: "order", header: "Order", get: (i) => i.orderId, render: (i) => <OrderLink id={i.orderId} /> },
    { key: "date", header: "Invoice Date", get: (i) => i.date, render: (i) => <span className="num text-mute">{fdate(i.date)}</span> },
    { key: "due", header: "Due Date", get: (i) => i.due, render: (i) => <span className="num text-mute">{fdate(i.due)}</span> },
    { key: "taxable", header: "Taxable Value", align: "right", render: (i) => inr(i.taxable) },
    { key: "gst", header: "GST", align: "right", render: (i) => inr(i.gst) },
    { key: "total", header: "Grand Total", align: "right", render: (i) => <b>{inr(i.total)}</b> },
    { key: "paid", header: "Paid", align: "right", render: (i) => <span className="text-ok">{inr(i.paid)}</span> },
    { key: "balance", header: "Balance", align: "right", render: (i) => <b className={i.balance ? "text-bad" : "text-faint"}>{inr(i.balance)}</b> },
    { key: "status", header: "Status", render: (i) => <Pill>{i.status}</Pill> },
  ];
  const tot = (f: (i: Invoice) => boolean, k: "total" | "balance") => invoices.filter(f).reduce((a, i) => a + i[k], 0);
  return (
    <div className="space-y-4">
      <PageHeader title="Invoices" sub="Every invoice linked to its order, shipment and payments." />
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[["Invoiced (listed)", inr(tot(() => true, "total"))], ["Collected", inr(invoices.reduce((a, i) => a + i.paid, 0))], ["Outstanding", inr(tot(() => true, "balance"))], ["Overdue", inr(tot((i) => i.status === "Overdue", "balance"))]].map(([l, v], i) => <div key={l} className="rounded-[8px] border border-line bg-surface p-3"><div className="label">{l}</div><div className={cn("num mt-1 text-[21px] font-semibold tracking-tight", i === 3 && "text-bad")}>{v}</div></div>)}
      </div>
      <DataTable rows={invoices} cols={cols} rowKey={(i) => i.id} pageSize={12} exportName="invoices" defaultSort={{ key: "date", dir: "desc" }} searchPlaceholder="Search invoice, customer, order…" onRowClick={(i) => router.push(`/invoices/${i.id}`)} selectable
        filters={[{ key: "st", label: "Status", options: ["Paid", "Partially Paid", "Unpaid", "Overdue"], match: (i, v) => i.status === v }, { key: "cust", label: "Customer", options: Array.from(new Set(invoices.map((i) => custName(i.custId)))).sort(), match: (i, v) => custName(i.custId) === v }]} />
    </div>
  );
}

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  const [pay, setPay] = useState(false);
  const inv = s.invoices.find((i) => i.id === id);
  if (!inv) return <Empty title="Invoice not found" action={<Btn href="/invoices">Back to invoices</Btn>} />;
  const pays = s.payments.filter((p) => p.invoiceId === inv.id);
  const sh = s.shipments.find((x) => x.orderId === inv.orderId);
  const days = Math.round((NOW.getTime() - new Date(inv.due).getTime()) / 864e5);
  return (
    <div className="space-y-4">
      <PageHeader crumbs={[{ label: "Invoices", href: "/invoices" }, { label: inv.id }]} title={<span className="flex flex-wrap items-center gap-3"><span className="num">{inv.id}</span><Pill>{inv.status}</Pill></span>} sub={<><CustLink id={inv.custId} /> · Order <OrderLink id={inv.orderId} />{sh && <> · Shipment <ShpLink id={sh.id} /></>}</>}
        actions={<><Btn icon={<Download size={14} />} onClick={() => s.toast("Invoice downloaded", "ok", `${inv.id}.pdf`)}>Download invoice</Btn>{inv.balance > 0 && <Btn variant="primary" icon={<Wallet size={14} />} onClick={() => setPay(true)}>Record payment</Btn>}</>} />
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card pad={false} title="Products" sub={`${num(inv.lines.reduce((a, l) => a + l.qty, 0))} units`}>
            <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-[13px]"><thead><tr className="border-b border-line bg-bg text-left text-[11px] uppercase tracking-[0.04em] text-mute"><th className="px-4 py-2 font-medium">Product</th><th className="px-3 text-right font-medium">Qty</th><th className="px-3 text-right font-medium">Rate</th><th className="px-3 text-right font-medium">Disc</th><th className="px-3 text-right font-medium">GST</th><th className="px-4 text-right font-medium">Amount</th></tr></thead>
              <tbody>{inv.lines.map((l) => { const p = prodBySku(l.sku)!; return <tr key={l.sku} className="border-b border-line"><td className="px-4 py-2.5"><ProdLink id={p.id}>{p.name}</ProdLink><div className="num text-[11.5px] text-faint">HSN 8481 · {l.sku}</div></td><td className="num px-3 text-right">{num(l.qty)}</td><td className="num px-3 text-right">{inr(l.price)}</td><td className="num px-3 text-right text-mute">{l.disc ? `${l.disc}%` : "—"}</td><td className="num px-3 text-right text-mute">{l.gst}%</td><td className="num px-4 text-right font-medium">{inr(lineTotal(l))}</td></tr>; })}</tbody></table></div>
            <dl className="ml-auto w-full max-w-[320px] space-y-1.5 p-4 text-[13px]">
              {[["Taxable value", inr(inv.taxable)], ["Discount (included)", inr(inv.discount)], ["GST", inr(inv.gst)], ["Freight", inr(inv.freight)]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-mute">{k}</dt><dd className="num">{v}</dd></div>)}
              <div className="flex justify-between border-t border-line pt-2 text-[15px] font-semibold"><dt>Grand total</dt><dd className="num">{inr(inv.total)}</dd></div>
            </dl>
          </Card>
          <Card pad={false} title="Payment history">{pays.length ? <ul className="divide-y divide-line text-[13px]">{pays.map((p) => <li key={p.id} className="flex items-center justify-between px-4 py-2.5"><span><b className="num">{p.id}</b> · {p.method}<div className="num text-[12px] text-mute">{p.ref} · {p.by} · {fdt(p.date)}</div></span><b className="num">{inr(p.amount)}</b></li>)}</ul> : <Empty title="No payments yet" body="Payments received against this invoice will appear here." />}</Card>
        </div>
        <div className="space-y-4">
          <Card title="Settlement">
            <div className="num text-[26px] font-semibold tracking-tight">{inr(inv.balance)}</div><div className="text-[12px] text-mute">balance due</div>
            <Progress className="mt-3" value={inv.paid} max={inv.total} tone={inv.balance === 0 ? "ok" : "accent"} /><div className="mt-1 flex justify-between text-[12px] text-mute"><span>Paid {inr(inv.paid)}</span><span>of {inr(inv.total)}</span></div>
            <div className="mt-4 grid grid-cols-2 gap-4"><KV label="Invoice date"><span className="num">{fdate(inv.date, true)}</span></KV><KV label="Due date"><span className={cn("num", days > 0 && inv.balance > 0 && "font-medium text-bad")}>{fdate(inv.due, true)}</span></KV></div>
            {inv.balance > 0 && <div className={cn("mt-3 rounded-[6px] px-2.5 py-1.5 text-[12.5px]", days > 0 ? "bg-bad-soft text-bad" : "bg-panel text-mute")}>{days > 0 ? `${days} days overdue` : `Due in ${-days} days`}</div>}
          </Card>
          <Card title="Linked records" pad={false}><ul className="divide-y divide-line text-[13px]"><li className="flex justify-between px-4 py-2.5"><span className="text-mute">Sales order</span><OrderLink id={inv.orderId} /></li><li className="flex justify-between px-4 py-2.5"><span className="text-mute">Shipment</span>{sh ? <ShpLink id={sh.id} /> : "—"}</li><li className="flex justify-between px-4 py-2.5"><span className="text-mute">Customer</span><CustLink id={inv.custId} /></li></ul></Card>
        </div>
      </div>
      <RecordPaymentModal key={pay ? "o" : "c"} open={pay} onClose={() => setPay(false)} custId={inv.custId} invoiceId={inv.id} />
    </div>
  );
}
