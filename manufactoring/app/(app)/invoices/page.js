"use client";
import { Kpi, PageHeader, Pill } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { INVOICES } from "@/data/finance";
import { cust } from "@/data/masters";
import { fdate, lakh } from "@/lib/format";
import { CustLink } from "@/components/ui/links";

export default function Invoices() {
  const sum = (f) => INVOICES.filter(f).reduce((s, i) => s + i.balance, 0);
  return (
    <div>
      <PageHeader title="Invoices" sub="Every invoice links back to the sales order, work order and dispatch." />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4"><Kpi label="Invoiced (MTD)" value={lakh(INVOICES.filter((i) => i.date >= "2026-10-01").reduce((s, i) => s + i.amount, 0))} /><Kpi label="Outstanding" value={lakh(sum(() => true))} /><Kpi label="Overdue" value={lakh(sum((i) => i.status === "Overdue"))} tone="bad" sub={`${INVOICES.filter((i) => i.status === "Overdue").length} invoices`} /><Kpi label="Due in 7 days" value={lakh(sum((i) => i.due >= "2026-10-06" && i.due <= "2026-10-13" && i.status !== "Paid"))} tone="warn" /></div>
      <DataTable rows={INVOICES} rowKey={(i) => i.id} pageSize={10} exportName="invoices" searchPlaceholder="Search invoice or customer…" defaultSort={{ key: "date", dir: "desc" }}
        filters={[{ key: "s", label: "Status", options: ["Unpaid", "Partially Paid", "Paid", "Overdue"], match: (r, v) => r.status === v }]}
        cols={[{ key: "id", header: "Invoice", render: (i) => <span className="font-semibold">{i.id}</span> }, { key: "customer", header: "Customer", render: (i) => <CustLink name={i.customer} id={cust(i.customer)?.id} /> }, { key: "so", header: "Sales order", muted: true }, { key: "date", header: "Date", render: (i) => fdate(i.date) }, { key: "due", header: "Due", render: (i) => fdate(i.due) }, { key: "amount", header: "Amount", align: "right", render: (i) => lakh(i.amount) }, { key: "paid", header: "Paid", align: "right", render: (i) => lakh(i.paid) }, { key: "balance", header: "Balance", align: "right", render: (i) => <b>{lakh(i.balance)}</b> }, { key: "status", header: "Status", render: (i) => <Pill>{i.status}</Pill> }]} />
    </div>
  );
}
