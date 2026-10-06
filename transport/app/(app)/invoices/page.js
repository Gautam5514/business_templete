"use client";
import Link from "next/link";
import DataTable from "@/components/table";
import { Chip, Insight, Kpis, PageHead } from "@/components/ui";
import { INVOICES } from "@/data/ops";
import { customerById } from "@/data/fleet";
import { full, inr } from "@/lib/format";

const tone = { Paid: "g", Overdue: "r", "Part Paid": "a", Sent: "b", "Blocked · POD": "r" };
export default function Invoices() {
  const billed = INVOICES.reduce((a, i) => a + i.total, 0), paid = INVOICES.reduce((a, i) => a + i.paid, 0);
  const blocked = INVOICES.filter((i) => i.status === "Blocked · POD");
  return (
    <div className="page">
      <PageHead title="Invoices" sub="Freight invoices generated straight from delivered trips — detention, loading and GST included."><button className="btn pri">Create invoice</button></PageHead>
      <Insight tone="a"><b>Freight billed vs collected: {inr(billed)} vs {inr(paid)}.</b> {blocked.length} drafts ({inr(blocked.reduce((a, i) => a + i.total, 0))}) can’t be released because their PODs are missing.</Insight>
      <Kpis items={[{ label: "Billed (listed)", value: inr(billed) }, { label: "Collected", value: inr(paid), tone: "g" }, { label: "Balance", value: inr(billed - paid), tone: "a" }, { label: "Overdue invoices", value: INVOICES.filter((i) => i.status === "Overdue").length, tone: "r" }, { label: "Blocked by POD", value: blocked.length, tone: "r" }]} />
      <DataTable rows={INVOICES} title="Invoices" views={[{ name: "All" }, { name: "Overdue", filter: (i) => i.status === "Overdue" }, { name: "Blocked by POD", filter: (i) => i.status === "Blocked · POD" }, { name: "Unpaid", filter: (i) => i.balance > 0 }]}
        cols={[{ key: "id", label: "Invoice Number", render: (i) => <b className="mono">{i.id}</b> }, { key: "customer", label: "Customer", render: (i) => customerById(i.customerId).short, csv: (i) => customerById(i.customerId).short }, { key: "tripId", label: "Trip", render: (i) => <Link className="mono link" href={`/trips/${i.tripId}`}>{i.tripId}</Link> }, { key: "route", label: "Route" },
          { key: "freight", label: "Freight", right: true, render: (i) => full(i.freight) }, { key: "detention", label: "Detention", right: true, hide: true, render: (i) => full(i.detention) }, { key: "loading", label: "Loading", right: true, hide: true, render: (i) => full(i.loading) }, { key: "unloading", label: "Unloading", right: true, hide: true, render: (i) => full(i.unloading) }, { key: "other", label: "Other", right: true, hide: true, render: (i) => full(i.other) },
          { key: "tax", label: "Tax (5%)", right: true, render: (i) => full(i.tax) }, { key: "total", label: "Grand Total", right: true, render: (i) => <b>{full(i.total)}</b> }, { key: "due", label: "Due Date" }, { key: "paid", label: "Paid", right: true, render: (i) => full(i.paid) }, { key: "balance", label: "Balance", right: true, render: (i) => full(i.balance) },
          { key: "status", label: "Status", render: (i) => <Chip tone={tone[i.status]} dot>{i.status}</Chip> }]} />
    </div>
  );
}
