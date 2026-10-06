"use client";
import { useRouter } from "next/navigation";
import { Kpi, PageHeader, Pill, Progress, Tabs } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { useTab } from "@/lib/useTab";
import { FG, FG_BATCHES } from "@/data/ops";
import { fdate, lakh, num } from "@/lib/format";
import { BatchLink, WoLink } from "@/components/ui/links";

export default function FinishedGoods() {
  const [tab, setTab] = useTab(["stock", "batches"], "stock");
  const router = useRouter();
  return (
    <div>
      <PageHeader title="Finished Goods" sub="What is made, what is promised to customers and what is free to sell." />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Total FG value" value="₹2.16 Cr" sub="At standard cost" />
        <Kpi label="Ready stock" value={num(FG.reduce((s, r) => s + r.available, 0))} sub="units in FG warehouse" />
        <Kpi label="Reserved vs orders" value={num(FG.reduce((s, r) => s + r.reserved, 0))} sub="units promised" />
        <Kpi label="Packed stock" value={num(FG.reduce((s, r) => s + r.packed, 0))} sub="boxed & labelled" />
        <Kpi label="Ready for dispatch" value="2,940" sub="Loading today: 2,800" />
        <Kpi label="Slow-moving" value="1" tone="warn" sub="Floor Drain · 41 days cover" />
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "stock", label: "Stock by product" }, { id: "batches", label: "Batches & traceability" }]} />
      {tab === "stock" ? (
        <DataTable rows={FG} rowKey={(r) => r.pid} pageSize={10} exportName="finished-goods" searchPlaceholder="Search product or SKU…"
          filters={[{ key: "st", label: "Status", options: ["In Stock", "Low Stock", "Overstock"], match: (r, v) => r.status === v }]}
          expand={(r) => <div className="grid gap-4 text-[12.5px] sm:grid-cols-3"><div><div className="label mb-0.5">Free to promise</div><b className="num text-[15px]">{num(r.free)}</b> units</div><div><div className="label mb-0.5">Stock value</div>{lakh(r.value)}</div><div><div className="label mb-0.5">Cover vs min stock</div><Progress value={r.available} max={r.min * 2} tone={r.available < r.min ? "bad" : "ok"} /></div></div>}
          cols={[
            { key: "product", header: "Product", render: (r) => <span className="font-medium">{r.product}</span> }, { key: "sku", header: "SKU", muted: true },
            { key: "produced", header: "Produced (month)", align: "right", render: (r) => num(r.produced) }, { key: "available", header: "Available", align: "right", render: (r) => <b>{num(r.available)}</b> },
            { key: "reserved", header: "Reserved", align: "right", render: (r) => num(r.reserved) }, { key: "packed", header: "Packed", align: "right", render: (r) => num(r.packed) },
            { key: "dispatched", header: "Dispatched (month)", align: "right", render: (r) => num(r.dispatched) }, { key: "min", header: "Min stock", align: "right", render: (r) => num(r.min) },
            { key: "wh", header: "Warehouse", muted: true }, { key: "status", header: "Status", render: (r) => <Pill>{r.status}</Pill> },
          ]} />
      ) : (
        <DataTable rows={FG_BATCHES} rowKey={(b) => b.id} pageSize={10} exportName="fg-batches" searchPlaceholder="Search batch, work order, product…" onRowClick={(b) => router.push(`/finished-goods/${b.id}`)}
          cols={[
            { key: "id", header: "Batch", render: (b) => <BatchLink id={b.id} /> }, { key: "product", header: "Product" }, { key: "qty", header: "Quantity", align: "right", render: (b) => num(b.qty) }, { key: "date", header: "Produced", render: (b) => fdate(b.date) },
            { key: "wo", header: "Work order", render: (b) => <WoLink id={b.wo} /> }, { key: "rm", header: "Raw material batch", get: (b) => b.rmBatch, muted: true }, { key: "machine", header: "Machine" }, { key: "qc", header: "QC", render: (b) => <Pill>{b.qc}</Pill> },
          ]} />
      )}
    </div>
  );
}
