"use client";
import DataTable from "@/components/table";
import { Chip, Insight, Kpis, PageHead, Panel, Plate } from "@/components/ui";
import { HBars } from "@/components/charts";
import { EXPENSES, EXPENSE_MIX, EXPENSE_CATS } from "@/data/ops";
import { full } from "@/lib/format";

export default function Expenses() {
  const noReceipt = EXPENSES.filter((e) => !e.receipt);
  const pend = EXPENSES.filter((e) => e.status === "Pending");
  return (
    <div className="page">
      <PageHead title="Expenses" sub="Every rupee spent on a trip, vehicle or driver — captured at source from the driver app."><button className="btn pri">Record expense</button></PageHead>
      <Insight tone="a"><b>{noReceipt.length} expenses have no receipt</b> ({full(noReceipt.reduce((a, e) => a + e.amount, 0))}) and {pend.length} await approval. Receipts captured by the driver app cut month-end reconciliation from days to hours.</Insight>
      <Kpis items={[{ label: "Total this month", value: "₹1.74 Cr" }, { label: "Driver expenses", value: "₹21.4L" }, { label: "Pending approval", value: pend.length, tone: "a" }, { label: "Missing receipts", value: noReceipt.length, tone: "r" }, { label: "Penalties", value: "₹46K", hint: "overload / checkpost" }]} />
      <div className="grid" style={{ gridTemplateColumns: "360px minmax(0,1fr)", alignItems: "start" }}>
        <Panel title="Expense mix" sub="₹ Lakh · this month"><HBars items={EXPENSE_MIX.map(([k, v]) => ({ k, v }))} fmt={(v) => v + "L"} /><div className="hr" /><div className="lbl" style={{ marginBottom: 6 }}>Tracked categories</div><div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{EXPENSE_CATS.map((c) => <Chip key={c}>{c}</Chip>)}</div></Panel>
        <DataTable rows={EXPENSES} title="Expenses" views={[{ name: "All" }, { name: "Pending", count: pend.length, filter: (e) => e.status === "Pending" }, { name: "No receipt", count: noReceipt.length, filter: (e) => !e.receipt }]}
          cols={[{ key: "id", label: "ID" }, { key: "date", label: "Date" }, { key: "cat", label: "Category" }, { key: "tripId", label: "Trip" }, { key: "vehicleId", label: "Vehicle", render: (e) => <Plate id={e.vehicleId} /> }, { key: "amount", label: "Amount", right: true, render: (e) => full(e.amount) }, { key: "by", label: "Entered by" }, { key: "receipt", label: "Receipt", render: (e) => (e.receipt ? <Chip tone="g">Attached</Chip> : <Chip tone="r">Missing</Chip>) }, { key: "status", label: "Status", render: (e) => <Chip tone={e.status === "Approved" ? "g" : "a"}>{e.status}</Chip> }]} />
      </div>
    </div>
  );
}
