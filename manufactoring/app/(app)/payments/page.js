"use client";
import { Plus } from "lucide-react";
import { Btn, Kpi, PageHeader, Pill } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { useStore } from "@/lib/store";
import { PAYMENTS } from "@/data/finance";
import { fdate, lakh } from "@/lib/format";

export default function Payments() {
  const { openQuick } = useStore();
  return (
    <div>
      <PageHeader title="Payments" sub="Customer receipts applied against invoices." actions={<Btn variant="primary" icon={<Plus size={14} />} onClick={() => openQuick("pay")}>Record Payment</Btn>} />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4"><Kpi label="Collected (MTD)" value="₹51.8 L" /><Kpi label="This week" value={lakh(PAYMENTS.filter((p) => p.date >= "2026-10-01").reduce((s, p) => s + p.amount, 0))} /><Kpi label="Cheques pending" value="1" sub="PAY-6115 · ₹4.1 L" tone="warn" /><Kpi label="Avg days to pay" value="34" sub="down from 39" /></div>
      <DataTable rows={PAYMENTS} rowKey={(p) => p.id} pageSize={10} exportName="payments" searchPlaceholder="Search payment or customer…" defaultSort={{ key: "date", dir: "desc" }}
        cols={[{ key: "id", header: "Payment", render: (p) => <span className="font-semibold">{p.id}</span> }, { key: "customer", header: "Customer" }, { key: "invoice", header: "Invoice", muted: true }, { key: "amount", header: "Amount", align: "right", render: (p) => lakh(p.amount) }, { key: "date", header: "Date", render: (p) => fdate(p.date) }, { key: "mode", header: "Mode", muted: true }, { key: "status", header: "Status", render: (p) => <Pill>{p.status}</Pill> }]} />
    </div>
  );
}
