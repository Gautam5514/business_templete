"use client";
import { useMemo } from "react";
import DataTable from "@/components/table";
import { Chip, Insight, Kpis, PageHead, Panel } from "@/components/ui";
import { Bars } from "@/components/charts";
import { AGING, INVOICES } from "@/data/ops";
import { inr, full } from "@/lib/format";
import { useApp } from "@/lib/store";

const bucket = (age) => age <= 0 ? "Not due" : age <= 7 ? "0–7 days" : age <= 15 ? "8–15 days" : age <= 30 ? "16–30 days" : age <= 60 ? "31–60 days" : "60+ days";
export default function Receivables() {
  const { notify } = useApp();
  const rows = useMemo(() => INVOICES.filter((i) => i.balance > 0), []);
  const cols = useMemo(() => [
    { key: "customer", label: "Customer", render: (i) => <b style={{ fontWeight: 560 }}>{i.customer}</b> }, { key: "id", label: "Invoice", style: { fontFamily: "var(--font-geist-mono)" } },
    { key: "balance", label: "Balance", right: true, render: (i) => <b>{full(i.balance)}</b> }, { key: "age", label: "Bucket", render: (i) => <Chip tone={i.age > 30 ? "r" : i.age > 7 ? "a" : "n"}>{bucket(i.age)}</Chip>, sort: (i) => i.age, csv: (i) => bucket(i.age) },
    { key: "due", label: "Due" }, { key: "act", label: "", sortable: false, render: () => <button className="btn sm" onClick={(e) => { e.stopPropagation(); notify("Reminder sent on WhatsApp & SMS"); }}>Remind</button> },
  ], [notify]);
  const total = AGING.reduce((a, b) => a + b.v, 0);
  return (
    <div className="page">
      <PageHead title="Receivables" sub="Where the money is stuck, how old it is and who owes it." />
      <Insight tone="r"><b>₹4.2L has been overdue for more than 30 days</b> — Eastern Public School, Royal Residency and Bihar Retail Group hold 71% of it. Collections score is 79 because of this.</Insight>
      <Kpis cols={7} items={AGING.map((a, i) => ({ label: a.k, value: inr(a.v), tone: i >= 4 ? "r" : i >= 2 ? "a" : undefined })).concat([{ label: "Total outstanding", value: inr(total) }])} />
      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) 380px", marginBottom: 14 }}>
        <Panel title="Ageing" sub="₹ lakh"><Bars data={AGING.map((a, i) => ({ k: a.k, v: +(a.v / 1e5).toFixed(1), color: i === 0 ? "grey" : i < 4 ? "amber" : "red" }))} height={190} fmt={(v) => v + "L"} /></Panel>
        <Panel title="Top debtors" tight>{[["Bihar Retail Group", 418000], ["Eastern Public School", 224000], ["City Hospital", 312000], ["Royal Residency", 142000], ["Ranchi Business Centre", 96000]].sort((a, b) => b[1] - a[1]).map(([c, v]) => <div key={c} className="feed-i"><b style={{ flex: 1, fontWeight: 560 }}>{c}</b><b>{inr(v)}</b></div>)}</Panel>
      </div>
      <DataTable title="Open invoices" rows={rows} cols={cols} views={[{ name: "All", count: rows.length }, { name: "Overdue 30+", filter: (i) => i.age > 30 }, { name: "Overdue", filter: (i) => i.age > 0 }, { name: "Not due", filter: (i) => i.age <= 0 }]} searchKeys={["customer", "id"]} />
    </div>
  );
}
