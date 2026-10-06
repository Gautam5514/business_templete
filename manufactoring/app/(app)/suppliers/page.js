"use client";
import { useRouter } from "next/navigation";
import { Kpi, PageHeader, Progress } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { SUPPLIERS } from "@/data/masters";
import { lakh } from "@/lib/format";
import { SupplierLink } from "@/components/ui/links";

export default function Suppliers() {
  const router = useRouter();
  return (
    <div>
      <PageHeader title="Suppliers" sub="68 active suppliers — the six that matter most are shown with live performance scores." />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4"><Kpi label="Active suppliers" value="68" /><Kpi label="Total purchases (FY)" value={lakh(SUPPLIERS.reduce((s, x) => s + x.total, 0))} /><Kpi label="Payable" value={lakh(SUPPLIERS.reduce((s, x) => s + x.payable, 0))} /><Kpi label="Weakest on-time" value="71%" tone="bad" sub="Bharat Hardware Components" /></div>
      <DataTable rows={SUPPLIERS} rowKey={(s) => s.id} pageSize={10} exportName="suppliers" searchPlaceholder="Search supplier or material…" onRowClick={(s) => router.push(`/suppliers/${s.id}`)}
        cols={[{ key: "name", header: "Supplier", render: (s) => <SupplierLink name={s.name} id={s.id} /> }, { key: "city", header: "City", muted: true }, { key: "mats", header: "Materials", get: (s) => s.mats.join(", "), render: (s) => <span className="block max-w-[260px] truncate text-mute">{s.mats.join(", ")}</span> }, { key: "total", header: "Total purchase", align: "right", render: (s) => lakh(s.total) }, { key: "pending", header: "Pending orders", align: "right" }, { key: "payable", header: "Payable", align: "right", render: (s) => lakh(s.payable) }, { key: "lead", header: "Lead time", align: "right", render: (s) => `${s.lead} d` }, { key: "quality", header: "Quality", align: "right", render: (s) => <span className={s.quality < 90 ? "text-warn" : ""}>{s.quality}%</span> }, { key: "otd", header: "On-time", align: "right", render: (s) => <div className="w-20 text-right"><span className={s.otd < 80 ? "font-medium text-bad" : ""}>{s.otd}%</span><Progress value={s.otd} tone={s.otd < 80 ? "bad" : "ok"} className="mt-1" /></div> }, { key: "rej", header: "Rejection", align: "right", render: (s) => `${s.rej}%` }]} />
    </div>
  );
}
