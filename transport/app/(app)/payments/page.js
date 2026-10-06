"use client";
import DataTable from "@/components/table";
import { Chip, Insight, Kpis, PageHead, Panel } from "@/components/ui";
import { Bars } from "@/components/charts";
import { PAYMENTS } from "@/data/ops";
import { customerById } from "@/data/fleet";
import { full, inr } from "@/lib/format";

export default function Payments() {
  const total = PAYMENTS.reduce((a, p) => a + p.amount, 0), un = PAYMENTS.filter((p) => p.status === "Unmatched");
  return (
    <div className="page">
      <PageHead title="Payments" sub="Customer receipts matched to invoices — NEFT, RTGS, UPI and cheques."><button className="btn pri">Record payment</button></PageHead>
      <Insight tone="b"><b>{inr(2.34e7)} collected this month</b> — 80% of billed freight. {un.length} receipts ({inr(un.reduce((a, p) => a + p.amount, 0))}) are not yet matched to invoices; match them to release customer statements.</Insight>
      <Kpis items={[{ label: "Collected (MTD)", value: "₹2.34 Cr", tone: "g" }, { label: "Expected today", value: "₹8.6L" }, { label: "Unmatched receipts", value: un.length, tone: "a" }, { label: "Avg collection time", value: "29 days" }]} />
      <div className="grid" style={{ gridTemplateColumns: "340px minmax(0,1fr)", alignItems: "start" }}>
        <Panel title="Collections by week" sub="₹ Lakh"><Bars data={[{ k: "W1", v: 48 }, { k: "W2", v: 61 }, { k: "W3", v: 54 }, { k: "W4", v: 71 }]} fmt={(v) => v} height={170} highlight={3} /></Panel>
        <DataTable rows={PAYMENTS} title="Payments" views={[{ name: "All" }, { name: "Unmatched", count: un.length, filter: (p) => p.status === "Unmatched" }]}
          cols={[{ key: "id", label: "Receipt" }, { key: "date", label: "Date" }, { key: "customer", label: "Customer", render: (p) => customerById(p.customerId).short, csv: (p) => customerById(p.customerId).short }, { key: "invoice", label: "Invoice" }, { key: "mode", label: "Mode" }, { key: "ref", label: "Reference", render: (p) => <span className="mono">{p.ref}</span> }, { key: "amount", label: "Amount", right: true, render: (p) => <b>{full(p.amount)}</b> }, { key: "status", label: "Status", render: (p) => <Chip tone={p.status === "Reconciled" ? "g" : "a"}>{p.status}</Chip> }]} />
      </div>
    </div>
  );
}
