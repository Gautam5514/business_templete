"use client";
import { useMemo, useState } from "react";
import DataTable from "@/components/table";
import { Chip, Insight, Kpis, PageHead, Panel, Tabs, Mono } from "@/components/ui";
import { INVOICES } from "@/data/ops";
import { full, inr } from "@/lib/format";
import { useApp } from "@/lib/store";

const tone = { Paid: "g", Partial: "a", Unpaid: "n", Overdue: "r" };
export default function Invoices() {
  const { notify, setOverlay } = useApp();
  const [tab, setTab] = useState("Invoices");
  const cols = useMemo(() => [
    { key: "id", label: "Invoice", render: (i) => <Mono>{i.id}</Mono> }, { key: "customer", label: "Customer", render: (i) => <b style={{ fontWeight: 560 }}>{i.customer}</b> }, { key: "job", label: "Job", render: (i) => <Mono href={`/jobs/${i.job}`}>{i.job}</Mono> }, { key: "service", label: "Service type" },
    { key: "parts", label: "Parts", right: true, render: (i) => full(i.parts) }, { key: "labour", label: "Labour", right: true, render: (i) => full(i.labour) }, { key: "tax", label: "Tax", right: true, render: (i) => full(i.tax) },
    { key: "total", label: "Total", right: true, render: (i) => <b>{full(i.total)}</b> }, { key: "paid", label: "Paid", right: true, render: (i) => full(i.paid) }, { key: "balance", label: "Balance", right: true, render: (i) => i.balance ? <b className={i.age > 0 ? "neg" : ""}>{full(i.balance)}</b> : "—" },
    { key: "due", label: "Due", render: (i) => <span className={i.age > 0 ? "neg" : "faint"}>{i.due}</span>, sort: (i) => i.age }, { key: "status", label: "Status", render: (i) => <Chip tone={tone[i.status]} dot>{i.status}</Chip> },
  ], []);
  const views = [{ name: "All", count: INVOICES.length }, ...["Overdue", "Unpaid", "Partial", "Paid"].map((s) => ({ name: s, filter: (i) => i.status === s, count: INVOICES.filter((i) => i.status === s).length }))];
  return (
    <div className="page">
      <PageHead title="Invoices" sub="Generated automatically on customer sign-off — single job or consolidated monthly for corporate clients.">
        <button className="btn pri" onClick={() => setOverlay({ type: "create", kind: "Create Invoice" })}>New invoice</button>
      </PageHead>
      <Insight tone="r"><b>₹4.2L is overdue by more than 30 days across 11 customers</b> and is the main drag on the Collections score (79). Send reminders from Receivables.</Insight>
      <Kpis items={[{ label: "Billed this month", value: "₹84.6L" }, { label: "Collected", value: "₹69.4L", tone: "g" }, { label: "Outstanding", value: "₹16.8L", tone: "r" }, { label: "Overdue", value: "₹6.9L", tone: "a" }, { label: "Expected billing today", value: "₹6.8L" }]} />
      <Tabs tabs={["Invoices", "Monthly consolidated billing"]} value={tab} onChange={setTab} />
      {tab === "Invoices" && <DataTable title="Invoices" rows={INVOICES} cols={cols} views={views} searchKeys={["id", "customer", "job", "service"]} />}
      {tab !== "Invoices" && (
        <div className="grid g2">
          <Panel title="City Hospital — September 2026" sub="consolidated invoice" actions={<Chip tone="a" dot>Ready to issue</Chip>}>
            <div className="muted" style={{ marginBottom: 10 }}>Multiple jobs roll into a single monthly invoice with job-wise annexure — no more 84 separate bills.</div>
            <dl className="kv"><dt>Service jobs</dt><dd>84 jobs</dd><dt>Total service</dt><dd>₹6,40,000</dd><dt>Parts</dt><dd>₹2,10,000</dd><dt>AMC</dt><dd>₹4,80,000</dd><dt className="tot">Total invoice</dt><dd className="tot">₹13,30,000</dd></dl>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}><button className="btn pri" onClick={() => notify("Consolidated invoice INV-26/C-0914 issued and emailed")}>Issue consolidated invoice</button><button className="btn" onClick={() => notify("Annexure of 84 jobs exported")}>Download annexure</button></div>
          </Panel>
          <Panel title="Other consolidated accounts" tight>{[["Bihar Retail Group", "212 jobs", "₹21.4L"], ["Metro Office Park", "46 jobs", "₹4.1L"], ["Apex Mall", "38 jobs", "₹3.6L"], ["Eastern Public School", "22 jobs", "₹1.9L"]].map(([c, j, v]) => <div key={c} className="feed-i"><b style={{ flex: 1, fontWeight: 560 }}>{c}</b><span className="faint">{j}</span><b>{v}</b></div>)}</Panel>
        </div>
      )}
    </div>
  );
}
