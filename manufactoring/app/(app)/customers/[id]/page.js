"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, Kpi, KV, PageHeader, Pill, Progress, Stepper } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { Donut, C } from "@/components/ui/charts";
import { useStore } from "@/lib/store";
import { CUSTOMERS } from "@/data/masters";
import { INVOICES } from "@/data/finance";
import { DISPATCHES } from "@/data/ops";
import { fdate, lakh, num } from "@/lib/format";
import { WoLink } from "@/components/ui/links";

export default function Customer360() {
  const { id } = useParams();
  const { sales } = useStore();
  const c = CUSTOMERS.find((x) => x.id === id);
  if (!c) return <Card><div className="p-6 text-center text-[13px] text-mute">Customer not found. <Link href="/customers" className="text-accent">Back</Link></div></Card>;
  const orders = sales.filter((o) => o.customer === c.name);
  const inv = INVOICES.filter((i) => i.customer === c.name);
  const disp = DISPATCHES.filter((d) => d.customer === c.name);
  const cols = [C.accent, C.soft, C.warn, "#c2c0b8"];
  return (
    <div>
      <PageHeader crumbs={[{ label: "Customers", href: "/customers" }, { label: c.name }]} title={c.name} sub={`${c.city}, ${c.state} · credit limit ${lakh(c.credit)}`} meta={[<Pill key="b">{c.behaviour}</Pill>, c.outstanding > c.credit && <Pill key="c" tone="bad">Over credit limit</Pill>].filter(Boolean)} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <Kpi label="Lifetime sales" value={lakh(c.lifetime)} /><Kpi label="Current orders" value={orders.filter((o) => !["Delivered"].includes(o.status)).length} /><Kpi label="Pending production" value={num(c.pendingProd)} sub="units" tone={c.pendingProd ? "warn" : undefined} /><Kpi label="Ready for dispatch" value={num(c.ready)} sub="units" />
        <Kpi label="Outstanding" value={lakh(c.outstanding)} tone={c.outstanding > c.credit ? "bad" : undefined} /><Kpi label="Payment behaviour" value={c.behaviour} sub={c.pay} /><Kpi label="Returns" value={`${c.returns}%`} />
      </div>
      <Card className="mt-4" title="Order-to-cash trace" sub="Customer → sales order → production → finished goods → dispatch → invoice → payment"><Stepper stages={["Customer", "Sales Order", "Production Order", "Finished Goods", "Dispatch", "Invoice", "Payment"]} current={orders.some((o) => o.status === "In Production") ? 2 : 4} />
        <div className="mt-3 text-[12.5px] text-mute">{orders.filter((o) => o.wo).map((o) => <span key={o.id} className="mr-4"><b className="text-ink">{o.id}</b> → <WoLink id={o.wo} /></span>)}</div></Card>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Product mix"><Donut height={170} fmt={(v) => `${v}%`} data={c.mix.map(([name, value], i) => ({ name, value, color: cols[i] }))} /><div className="mt-2 space-y-1 text-[12.5px]">{c.mix.map(([k, v], i) => <div key={k} className="flex justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: cols[i] }} />{k}</span><b>{v}%</b></div>)}</div></Card>
        <Card title="Credit used" className="lg:col-span-2"><div className="num text-[24px] font-semibold">{lakh(c.outstanding)} <span className="text-[14px] font-normal text-mute">of {lakh(c.credit)}</span></div><Progress value={c.outstanding} max={c.credit} tone={c.outstanding > c.credit ? "bad" : "accent"} className="mt-2" /><p className="mt-3 text-[12.5px] text-mute">{c.pay}. {c.outstanding > c.credit ? "New orders need owner approval until the account is back within limit." : "Within approved credit."}</p></Card>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card title="Sales orders" pad={false}><DataTable rows={orders} rowKey={(o) => o.id} pageSize={10} cols={[{ key: "id", header: "Order" }, { key: "product", header: "Product" }, { key: "qty", header: "Qty", align: "right", render: (o) => num(o.qty) }, { key: "dispatch", header: "Dispatch", render: (o) => fdate(o.dispatch) }, { key: "status", header: "Status", render: (o) => <Pill>{o.status}</Pill> }]} /></Card>
        <Card title="Invoices" pad={false}><DataTable rows={inv} rowKey={(o) => o.id} pageSize={10} empty={{ title: "No invoices" }} cols={[{ key: "id", header: "Invoice" }, { key: "amount", header: "Amount", align: "right", render: (i) => lakh(i.amount) }, { key: "due", header: "Due", render: (i) => fdate(i.due) }, { key: "balance", header: "Balance", align: "right", render: (i) => lakh(i.balance) }, { key: "status", header: "Status", render: (i) => <Pill>{i.status}</Pill> }]} /></Card>
      </div>
      {disp.length > 0 && <Card className="mt-4" title="Dispatches" pad={false}><DataTable rows={disp} rowKey={(o) => o.id} pageSize={10} cols={[{ key: "id", header: "Dispatch" }, { key: "product", header: "Product" }, { key: "qty", header: "Qty", align: "right", render: (o) => num(o.qty) }, { key: "eta", header: "ETA", render: (o) => fdate(o.eta) }, { key: "status", header: "Status", render: (o) => <Pill>{o.status}</Pill> }]} /></Card>}
    </div>
  );
}
void KV;
