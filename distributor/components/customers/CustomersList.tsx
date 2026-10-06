"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { Btn, PageHeader, Pill, Progress, cn } from "@/components/ui/ui";
import { DataTable, type Col } from "@/components/ui/table";
import { CustLink } from "@/components/ui/links";
import { SALES_REPS } from "@/data/core";
import { fdate, inr } from "@/lib/format";
import type { Customer, Segment } from "@/types";

const SEGS: Segment[] = ["Platinum", "Gold", "Silver", "New", "At Risk"];

export function CustomersList() {
  const { customers, openQuick } = useStore();
  const router = useRouter();
  const seg = useSearchParams().get("segment") ?? "";
  const rows = seg ? customers.filter((c) => c.segment === seg) : customers;
  const cols: Col<Customer>[] = [
    { key: "name", header: "Customer Name", render: (c) => <CustLink id={c.id} /> },
    { key: "code", header: "Dealer Code", muted: true, render: (c) => <span className="num">{c.code}</span> },
    { key: "city", header: "City" },
    { key: "territory", header: "Territory", muted: true },
    { key: "rep", header: "Salesperson", muted: true },
    { key: "creditLimit", header: "Credit Limit", align: "right", render: (c) => inr(c.creditLimit) },
    { key: "outstanding", header: "Outstanding", align: "right", render: (c) => (
      <div className="ml-auto w-[120px]"><div className={cn("font-medium", c.overdue > 0 && "text-bad")}>{inr(c.outstanding)}</div><Progress className="mt-1" value={c.outstanding} max={c.creditLimit} tone={c.outstanding / c.creditLimit > 0.85 ? "bad" : c.outstanding / c.creditLimit > 0.6 ? "warn" : "accent"} /></div>
    ) },
    { key: "lastOrder", header: "Last Order", get: (c) => c.lastOrder, render: (c) => <span className="num text-mute">{fdate(c.lastOrder)}</span> },
    { key: "totalSales", header: "Total Sales", align: "right", render: (c) => inr(c.totalSales) },
    { key: "behaviour", header: "Payment Behaviour", render: (c) => <Pill>{c.behaviour}</Pill> },
    { key: "segment", header: "Status", render: (c) => <Pill>{c.segment}</Pill> },
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Customers / Dealers" sub={`${customers.length} active dealers across Jharkhand, Bihar and West Bengal`} actions={<Btn variant="primary" icon={<Plus size={15} />} onClick={() => openQuick("customer")}>New Customer</Btn>} />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {[["All", customers.length, ""], ...SEGS.map((s) => [s, customers.filter((c) => c.segment === s).length, s] as const)].map(([l, n, v]) => (
          <button key={l as string} onClick={() => router.replace(v ? `/customers?segment=${encodeURIComponent(v as string)}` : "/customers")} className={cn("rounded-[8px] border bg-surface p-3 text-left hover:border-line-strong", (v || "") === seg ? "border-accent ring-1 ring-accent/30" : "border-line")}>
            <div className="label">{l as string}</div><div className="num mt-1 text-[22px] font-semibold">{n as number}</div>
          </button>
        ))}
      </div>
      <DataTable key={seg} rows={rows} cols={cols} rowKey={(c) => c.id} pageSize={12} searchPlaceholder="Search dealer, code, city, salesperson…" exportName="customers" defaultSort={{ key: "totalSales", dir: "desc" }}
        onRowClick={(c) => router.push(`/customers/${c.id}`)}
        filters={[
          { key: "seg", label: "Segment", options: SEGS, match: (c, v) => c.segment === v },
          { key: "city", label: "City", options: Array.from(new Set(customers.map((c) => c.city))).sort(), match: (c, v) => c.city === v },
          { key: "state", label: "State", options: ["Jharkhand", "Bihar", "West Bengal"], match: (c, v) => c.state === v },
          { key: "rep", label: "Salesperson", options: SALES_REPS, match: (c, v) => c.rep === v },
          { key: "beh", label: "Behaviour", options: ["Excellent", "Good", "Delayed", "Risky"], match: (c, v) => c.behaviour === v },
          { key: "od", label: "Overdue", options: ["Has overdue", "No overdue"], match: (c, v) => (v === "Has overdue" ? c.overdue > 0 : c.overdue === 0) },
        ]} />
    </div>
  );
}
