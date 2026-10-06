"use client";
import { useRouter } from "next/navigation";
import DataTable from "@/components/table";
import { Chip, Insight, Kpis, PageHead, Panel } from "@/components/ui";
import { HBars } from "@/components/charts";
import { CUSTOMERS } from "@/data/fleet";
import { routeById } from "@/data/geo";
import { inr } from "@/lib/format";

export default function Customers() {
  const router = useRouter();
  const slow = CUSTOMERS.filter((c) => c.payDays > 40);
  const cols = [
    { key: "name", label: "Customer", render: (c) => <b>{c.name}</b> },
    { key: "industry", label: "Industry" },
    { key: "active", label: "Active Trips", right: true },
    { key: "monthly", label: "Monthly Freight", right: true, render: (c) => inr(c.monthly) },
    { key: "outstanding", label: "Outstanding", right: true, render: (c) => <span className={c.outstanding > 6e5 ? "neg" : ""}>{inr(c.outstanding)}</span> },
    { key: "terms", label: "Payment Terms" },
    { key: "onTimePay", label: "On-time Payment %", right: true, render: (c) => <span className={c.onTimePay < 60 ? "neg" : c.onTimePay < 75 ? "warn" : ""}>{c.onTimePay}%</span> },
    { key: "routes", label: "Routes", render: (c) => c.routes.map((r) => { const x = routeById(r); return `${x.from.slice(0, 3)}→${x.to.slice(0, 3)}`; }).join(", "), sort: (c) => c.routes.length },
    { key: "contract", label: "Contract", render: (c) => <Chip tone={c.contract === "Annual" ? "g" : "n"}>{c.contract}</Chip> },
    { key: "manager", label: "Account Manager" },
  ];
  return (
    <div className="page">
      <PageHead title="Customers" sub="64 enterprise customers — freight, collections discipline and contract health."><button className="btn pri">Add customer</button></PageHead>
      <Insight tone="r"><b>{slow.length} customers pay later than 40 days</b> and hold {inr(slow.reduce((a, c) => a + c.outstanding, 0))} of the outstanding balance — at 12% cost of capital, that delay costs ≈ {inr(slow.reduce((a, c) => a + c.outstanding, 0) * 0.12 / 12)} a month.</Insight>
      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", marginBottom: 14 }}>
        <Panel title="Top customers by freight" sub="monthly"><HBars items={CUSTOMERS.slice(0, 6).map((c) => ({ k: c.short.slice(0, 22), v: c.monthly }))} fmt={inr} /></Panel>
        <Panel title="Highest outstanding"><HBars items={[...CUSTOMERS].sort((a, b) => b.outstanding - a.outstanding).slice(0, 6).map((c) => ({ k: c.short.slice(0, 22), v: c.outstanding, tone: "red" }))} fmt={inr} /></Panel>
      </div>
      <DataTable rows={CUSTOMERS} cols={cols} title="Customers" views={[{ name: "All", count: 64 }, { name: "Annual contracts", filter: (c) => c.contract === "Annual" }, { name: "Slow payers", count: slow.length, filter: (c) => c.payDays > 40 }, { name: "Active trips", filter: (c) => c.active > 2 }]} onRow={(c) => router.push(`/customers/${c.id}`)} />
    </div>
  );
}
