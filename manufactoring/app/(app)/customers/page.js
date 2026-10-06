"use client";
import { useRouter } from "next/navigation";
import { Kpi, PageHeader, Pill, Progress } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { CUSTOMERS } from "@/data/masters";
import { lakh, num } from "@/lib/format";
import { CustLink } from "@/components/ui/links";

export default function Customers() {
  const router = useRouter();
  return (
    <div>
      <PageHeader title="Customers" sub="126 dealers across Jharkhand, Bihar, West Bengal, Odisha and Uttar Pradesh — top accounts shown." />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4"><Kpi label="Active dealers" value="126" /><Kpi label="Lifetime sales (top 7)" value={lakh(CUSTOMERS.reduce((s, c) => s + c.lifetime, 0))} /><Kpi label="Outstanding" value={lakh(CUSTOMERS.reduce((s, c) => s + c.outstanding, 0))} tone="warn" /><Kpi label="Over credit limit" value="1" tone="bad" sub="Eastern Kitchen World" /></div>
      <DataTable rows={CUSTOMERS} rowKey={(c) => c.id} pageSize={10} exportName="customers" searchPlaceholder="Search customer or city…" onRowClick={(c) => router.push(`/customers/${c.id}`)}
        cols={[{ key: "name", header: "Customer", render: (c) => <CustLink name={c.name} id={c.id} /> }, { key: "city", header: "Location", get: (c) => `${c.city}, ${c.state}`, muted: true }, { key: "lifetime", header: "Lifetime sales", align: "right", render: (c) => lakh(c.lifetime) }, { key: "orders", header: "Open orders", align: "right" }, { key: "pendingProd", header: "Pending production", align: "right", render: (c) => c.pendingProd ? num(c.pendingProd) : "—" }, { key: "ready", header: "Ready to dispatch", align: "right", render: (c) => c.ready ? num(c.ready) : "—" }, { key: "outstanding", header: "Outstanding", align: "right", render: (c) => <div className="w-28 text-right"><span className={c.outstanding > c.credit ? "font-medium text-bad" : ""}>{lakh(c.outstanding)}</span><Progress value={c.outstanding} max={c.credit} tone={c.outstanding > c.credit ? "bad" : c.outstanding / c.credit > 0.8 ? "warn" : "ok"} className="mt-1" /></div> }, { key: "behaviour", header: "Payment behaviour", render: (c) => <Pill>{c.behaviour}</Pill> }]} />
    </div>
  );
}
