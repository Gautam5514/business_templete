"use client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Plus } from "lucide-react";
import DataTable from "@/components/table";
import { Chip, Insight, Kpis, PageHead, Stars } from "@/components/ui";
import { CUSTOMERS } from "@/data/core";
import { inr } from "@/lib/format";
import { useApp } from "@/lib/store";

const SEGS = ["Enterprise", "AMC Customer", "Residential", "High Value", "At Risk", "Inactive", "Payment Risk"];
export default function Customers() {
  const router = useRouter(), { setOverlay } = useApp();
  const cols = useMemo(() => [
    { key: "name", label: "Customer", render: (c) => <span style={{ fontWeight: 600 }}>{c.name}</span> },
    { key: "type", label: "Type" }, { key: "branch", label: "Branch", render: (c) => c.branch[0].toUpperCase() + c.branch.slice(1) },
    { key: "since", label: "Since" }, { key: "locations", label: "Locations", right: true }, { key: "assets", label: "Assets", right: true }, { key: "amcs", label: "AMCs", right: true },
    { key: "ltv", label: "Lifetime revenue", right: true, render: (c) => inr(c.ltv) },
    { key: "out", label: "Outstanding", right: true, render: (c) => c.out ? <b className="neg">{inr(c.out)}</b> : <span className="faint">—</span> },
    { key: "rating", label: "Rating", render: (c) => <Stars v={c.rating} /> },
    { key: "seg", label: "Segments", sortable: false, render: (c) => <span style={{ display: "inline-flex", gap: 4 }}>{c.seg.slice(0, 3).map((s) => <Chip key={s} tone={s === "At Risk" || s === "Payment Risk" ? "r" : s === "High Value" ? "g" : "n"}>{s}</Chip>)}</span>, csv: (c) => c.seg.join("; ") },
  ], []);
  const views = [{ name: "All", count: CUSTOMERS.length }, ...SEGS.map((s) => ({ name: s, filter: (c) => c.seg.includes(s), count: CUSTOMERS.filter((c) => c.seg.includes(s)).length }))];
  return (
    <div className="page">
      <PageHead title="Customers" sub="8,400 active customers. Every one with assets, AMCs, service history and billing in one profile.">
        <button className="btn pri" onClick={() => setOverlay({ type: "create", kind: "Add Customer" })}><Plus size={14} /> Add customer</button>
      </PageHead>
      <Insight tone="r"><b>{CUSTOMERS.filter((c) => c.seg.includes("Payment Risk")).length} customers carry {inr(CUSTOMERS.filter((c) => c.seg.includes("Payment Risk")).reduce((a, c) => a + c.out, 0))} in outstanding balances</b> and are flagged Payment Risk — hold non-emergency visits until accounts clears.</Insight>
      <Kpis items={[{ label: "Active customers", value: "8,400" }, { label: "Enterprise", value: "312", hint: "62% of revenue" }, { label: "High value", value: "186" }, { label: "At risk", value: "94", tone: "r", hint: "falling service frequency" }, { label: "Payment risk", value: "61", tone: "a" }]} />
      <DataTable title="Customers" rows={CUSTOMERS} cols={cols} views={views} searchKeys={["name", "type", "branch"]} onRow={(c) => router.push(`/customers/${c.id}`)} />
    </div>
  );
}
