"use client";
import { Card, Kpi, PageHeader, Pill } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { Donut, C } from "@/components/ui/charts";
import { EXPENSES } from "@/data/finance";
import { fdate, inr, lakh } from "@/lib/format";

export default function Expenses() {
  const by = Object.entries(EXPENSES.reduce((m, e) => ({ ...m, [e.cat]: (m[e.cat] || 0) + e.amount }), {}));
  const cols = [C.accent, C.soft, C.warn, C.bad, C.ok, C.info];
  return (
    <div>
      <PageHeader title="Expenses" sub="Factory operating costs — power, labour, freight, maintenance and consumables." />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4"><Kpi label="Expenses (MTD)" value={lakh(EXPENSES.reduce((s, e) => s + e.amount, 0))} /><Kpi label="Power & fuel" value={lakh(by.find(([k]) => k === "Power & Fuel")?.[1] ?? 0)} /><Kpi label="Freight" value={lakh(by.find(([k]) => k === "Freight")?.[1] ?? 0)} /><Kpi label="Awaiting approval" value={EXPENSES.filter((e) => e.status === "Pending Approval").length} tone="warn" /></div>
      <div className="grid gap-4 lg:grid-cols-[1fr_2.2fr]">
        <Card title="By category"><Donut height={180} fmt={(v) => inr(v)} data={by.map(([name, value], i) => ({ name, value, color: cols[i % cols.length] }))} /></Card>
        <DataTable rows={EXPENSES} rowKey={(e) => e.id} pageSize={10} exportName="expenses" searchPlaceholder="Search expense…" filters={[{ key: "c", label: "Category", options: by.map(([k]) => k), match: (r, v) => r.cat === v }]}
          cols={[{ key: "id", header: "Ref", render: (e) => <span className="font-medium">{e.id}</span> }, { key: "date", header: "Date", render: (e) => fdate(e.date) }, { key: "cat", header: "Category" }, { key: "desc", header: "Description", muted: true, render: (e) => <span className="block max-w-[300px] truncate">{e.desc}</span> }, { key: "amount", header: "Amount", align: "right", render: (e) => inr(e.amount) }, { key: "by", header: "By", muted: true }, { key: "status", header: "Status", render: (e) => <Pill>{e.status}</Pill> }]} />
      </div>
    </div>
  );
}
