"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, Kpi, KV, PageHeader, Pill } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { BarsChart, C, LineChartX } from "@/components/ui/charts";
import { sup, SUPPLIERS } from "@/data/masters";
import { POS, SUPPLIER_INVOICES } from "@/data/ops";
import { fdate, lakh, num } from "@/lib/format";

export default function Supplier360() {
  const { id } = useParams();
  const s = SUPPLIERS.find((x) => x.id === id);
  if (!s) return <Card><div className="p-6 text-center text-[13px] text-mute">Supplier not found. <Link href="/suppliers" className="text-accent">Back</Link></div></Card>;
  const pos = POS.filter((p) => p.supplier === s.name);
  const inv = SUPPLIER_INVOICES.filter((i) => i.supplier === s.name);
  const trend = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((label, i) => ({ label, otd: Math.min(99, Math.round(s.otd + [-3, 2, -1, 3, -2, 1][i])), quality: Math.min(99, Math.round(s.quality + [1, -2, 1, 0, 2, -1][i])) }));
  void sup;
  return (
    <div>
      <PageHeader crumbs={[{ label: "Suppliers", href: "/suppliers" }, { label: s.name }]} title={s.name} sub={`${s.city} · contact ${s.contact}`} meta={[<Pill key="a" tone={s.otd >= 90 ? "ok" : "warn"}>{s.otd >= 90 ? "Preferred" : "Watch-list"}</Pill>]} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <Kpi label="Total purchase" value={lakh(s.total)} /><Kpi label="Pending orders" value={s.pending} /><Kpi label="Payable" value={lakh(s.payable)} /><Kpi label="Avg lead time" value={`${s.lead} d`} />
        <Kpi label="Quality score" value={`${s.quality}%`} /><Kpi label="Price score" value={`${s.price}%`} /><Kpi label="On-time delivery" value={`${s.otd}%`} tone={s.otd < 80 ? "bad" : undefined} /><Kpi label="Rejection" value={`${s.rej}%`} tone={s.rej > 3 ? "warn" : undefined} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Materials supplied"><ul className="space-y-1.5 text-[13px]">{s.mats.map((m) => <li key={m} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent" />{m}</li>)}</ul></Card>
        <Card title="On-time delivery & quality" className="lg:col-span-2"><LineChartX data={trend} keys={[{ k: "otd", name: "On-time %" }, { k: "quality", name: "Quality %", color: C.ok }]} height={190} fmt={(v) => `${v}%`} domain={[60, 100]} /></Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Purchase orders" pad={false}><DataTable rows={pos} rowKey={(p) => p.id} pageSize={10} empty={{ title: "No purchase orders" }} cols={[{ key: "id", header: "PO" }, { key: "material", header: "Material" }, { key: "qty", header: "Qty", align: "right", render: (p) => `${num(p.qty)} ${p.unit}` }, { key: "expected", header: "Expected", render: (p) => fdate(p.expected) }, { key: "status", header: "Status", render: (p) => <Pill>{p.status}</Pill> }]} /></Card>
        <Card title="Invoices & payables" pad={false}><DataTable rows={inv} rowKey={(p) => p.id} pageSize={10} empty={{ title: "No open invoices" }} cols={[{ key: "id", header: "Invoice" }, { key: "po", header: "PO", muted: true }, { key: "amount", header: "Amount", align: "right", render: (i) => lakh(i.amount) }, { key: "due", header: "Due", render: (i) => fdate(i.due) }, { key: "status", header: "Status", render: (i) => <Pill>{i.status}</Pill> }]} /></Card>
      </div>
    </div>
  );
}
void BarsChart; void KV;
