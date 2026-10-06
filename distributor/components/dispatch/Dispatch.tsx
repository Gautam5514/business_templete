"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Printer, Truck } from "lucide-react";
import { useStore } from "@/lib/store";
import { Btn, Card, Empty, KV, PageHeader, Pill, Stepper, cn } from "@/components/ui/ui";
import { DataTable, type Col } from "@/components/ui/table";
import { CustLink, DspLink, InvLink, OrderLink, ShpLink } from "@/components/ui/links";
import { TRANSPORTERS } from "@/data/ops";
import { WAREHOUSES, custName, prodBySku, whName } from "@/data/core";
import { fdate, fdt, inr, lakh, num } from "@/lib/format";
import type { Dispatch, DispatchStatus } from "@/types";

const STATUSES: DispatchStatus[] = ["Pending Packing", "Packing", "Ready", "Vehicle Assigned", "Dispatched"];
const NEXT: Record<string, string> = { "Pending Packing": "Start packing", Packing: "Mark ready", Ready: "Dispatch", "Vehicle Assigned": "Dispatch" };

export function DispatchList() {
  const { dispatches, advanceDispatch, warehouse } = useStore();
  const router = useRouter();
  const st = useSearchParams().get("status") ?? "";
  const base = dispatches.filter((d) => warehouse === "ALL" || d.wh === warehouse);
  const rows = st ? base.filter((d) => d.status === st) : base;
  const cols: Col<Dispatch>[] = [
    { key: "id", header: "Dispatch ID", render: (d) => <DspLink id={d.id} /> },
    { key: "order", header: "Order", get: (d) => d.orderId, render: (d) => <OrderLink id={d.orderId} /> },
    { key: "cust", header: "Customer", get: (d) => custName(d.custId), render: (d) => <CustLink id={d.custId} /> },
    { key: "wh", header: "Warehouse", get: (d) => whName(d.wh).replace(" Warehouse", ""), muted: true },
    { key: "packages", header: "Packages", align: "right" },
    { key: "qty", header: "Quantity", align: "right", render: (d) => num(d.qty) },
    { key: "weight", header: "Weight", align: "right", render: (d) => `${num(d.weight)} kg` },
    { key: "value", header: "Invoice Value", align: "right", render: (d) => <b>{inr(d.value)}</b> },
    { key: "transporter", header: "Transporter", muted: true },
    { key: "vehicle", header: "Vehicle", render: (d) => <span className="num">{d.vehicle}</span> },
    { key: "driver", header: "Driver", muted: true },
    { key: "expected", header: "Expected Delivery", get: (d) => d.expected, render: (d) => <span className="num text-mute">{fdate(d.expected)}</span> },
    { key: "status", header: "Status", render: (d) => <Pill>{d.status}</Pill> },
    { key: "act", header: "", sortable: false, render: (d) => NEXT[d.status] ? <div onClick={(e) => e.stopPropagation()}><Btn size="xs" variant="secondary" onClick={() => advanceDispatch(d.id)}>{NEXT[d.status]}</Btn></div> : null },
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Dispatch" sub="Packing queue, vehicle assignment and loads on the road." actions={<Btn variant="primary" icon={<Truck size={14} />} href="/shipments">Live shipments</Btn>} />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {STATUSES.map((s) => {
          const list = base.filter((d) => d.status === s);
          return <button key={s} onClick={() => router.replace(st === s ? "/dispatch" : `/dispatch?status=${encodeURIComponent(s)}`)} className={cn("rounded-[8px] border bg-surface p-3 text-left hover:border-line-strong", st === s ? "border-accent ring-1 ring-accent/30" : "border-line")}><div className="label">{s}</div><div className="num mt-1 text-[22px] font-semibold">{list.length}</div><div className="num text-[12px] text-mute">{lakh(list.reduce((a, d) => a + d.value, 0))}</div></button>;
        })}
      </div>
      <DataTable key={st} rows={rows} cols={cols} rowKey={(d) => d.id} pageSize={12} exportName="dispatches" defaultSort={{ key: "id", dir: "desc" }} searchPlaceholder="Search dispatch, order, customer, vehicle…" onRowClick={(d) => router.push(`/dispatch/${d.id}`)}
        filters={[{ key: "wh", label: "Warehouse", options: WAREHOUSES.map((w) => w.name), match: (d, v) => whName(d.wh) === v }, { key: "tr", label: "Transporter", options: TRANSPORTERS, match: (d, v) => d.transporter === v }]} />
    </div>
  );
}

export function DispatchDetail() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  const d = s.dispatches.find((x) => x.id === id);
  const [chk, setChk] = useState<Record<string, boolean>>({ pack: true, inv: true, ewb: true, lr: false, veh: true });
  if (!d) return <Empty title="Dispatch not found" action={<Btn href="/dispatch">Back to dispatch</Btn>} />;
  const o = s.orders.find((x) => x.id === d.orderId)!;
  const inv = s.invoices.find((i) => i.orderId === d.orderId);
  const sh = s.shipments.find((x) => x.orderId === d.orderId);
  const stage = STATUSES.indexOf(d.status);
  const ratio = d.qty / o.qty;
  return (
    <div className="space-y-4">
      <PageHeader crumbs={[{ label: "Dispatch", href: "/dispatch" }, { label: d.id }]} title={<span className="flex flex-wrap items-center gap-3"><span className="num">{d.id}</span><Pill>{d.status}</Pill></span>}
        sub={<>Order <OrderLink id={d.orderId} /> · <CustLink id={d.custId} /> · {whName(d.wh)}</>}
        actions={<><Btn icon={<Printer size={14} />} onClick={() => s.toast("Loading slip & challan ready", "ok", `${d.id}.pdf`)}>Print loading slip</Btn>{sh && <Btn href={`/shipments/${sh.id}`} icon={<Truck size={14} />}>Track shipment</Btn>}{NEXT[d.status] && <Btn variant="primary" icon={<ArrowRight size={14} className="order-last" />} onClick={() => s.advanceDispatch(d.id)}>{NEXT[d.status]}</Btn>}</>} />
      <Card pad><Stepper stages={STATUSES} current={stage} /></Card>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Consignment"><div className="grid grid-cols-2 gap-4"><KV label="Packages"><span className="num text-[18px] font-semibold">{d.packages}</span></KV><KV label="Units"><span className="num text-[18px] font-semibold">{num(d.qty)}</span></KV><KV label="Weight"><span className="num text-[18px] font-semibold">{num(d.weight)} kg</span></KV><KV label="Invoice value"><span className="num text-[18px] font-semibold">{inr(d.value)}</span></KV></div></Card>
        <Card title="Transport"><div className="grid grid-cols-2 gap-4"><KV label="Transporter">{d.transporter}</KV><KV label="Vehicle"><span className="num font-medium">{d.vehicle}</span></KV><KV label="Driver">{d.driver}</KV><KV label="Driver phone"><span className="num">{d.phone}</span></KV><KV label="Departure"><span className="num">{d.departure ? fdt(d.departure) : "—"}</span></KV><KV label="Expected"><span className="num">{fdt(d.expected)}</span></KV></div></Card>
        <Card title="Connected records" pad={false}><ul className="divide-y divide-line text-[13px]"><li className="flex justify-between px-4 py-2.5"><span className="text-mute">Order</span><OrderLink id={d.orderId} /></li><li className="flex justify-between px-4 py-2.5"><span className="text-mute">Customer</span><CustLink id={d.custId} /></li><li className="flex justify-between px-4 py-2.5"><span className="text-mute">Invoice</span>{inv ? <InvLink id={inv.id} /> : "—"}</li><li className="flex justify-between px-4 py-2.5"><span className="text-mute">Shipment</span>{sh ? <ShpLink id={sh.id} /> : "—"}</li></ul></Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <Card title="Packing list" sub={`${d.packages} packages · ${num(d.qty)} of ${num(o.qty)} ordered units loaded`} pad={false}>
          <table className="w-full text-[13px]"><thead><tr className="border-b border-line bg-bg text-left text-[11px] uppercase tracking-[0.04em] text-mute"><th className="px-4 py-2 font-medium">Product</th><th className="px-3 text-right font-medium">Ordered</th><th className="px-3 text-right font-medium">Loaded</th><th className="px-4 text-right font-medium">Weight</th></tr></thead>
            <tbody>{o.lines.map((l, i) => { const loaded = i === o.lines.length - 1 ? Math.max(0, l.qty - (o.qty - d.qty)) : l.qty; const w = loaded * prodBySku(l.sku)!.weight; return <tr key={l.sku} className="border-b border-line"><td className="px-4 py-2.5">{prodBySku(l.sku)!.name}<div className="num text-[11.5px] text-faint">{l.sku}</div></td><td className="num px-3 text-right text-mute">{num(l.qty)}</td><td className={cn("num px-3 text-right font-medium", loaded < l.qty && "text-warn")}>{num(loaded)}</td><td className="num px-4 text-right text-mute">{num(w)} kg</td></tr>; })}</tbody>
          </table>
          {ratio < 1 && <div className="border-t border-line bg-warn-soft px-4 py-2 text-[12.5px] text-warn">{num(o.qty - d.qty)} units remain back-ordered and will ship in a follow-up dispatch.</div>}
        </Card>
        <Card title="Loading checklist" sub="Dispatch desk sign-off">
          {[["pack", "Packing completed & sealed"], ["inv", "Tax invoice attached"], ["ewb", "E-way bill generated"], ["lr", "Transporter LR copy received"], ["veh", "Vehicle & driver checked"]].map(([k, l]) => (
            <label key={k} className="flex cursor-pointer items-center gap-2.5 py-1.5 text-[13px]"><input type="checkbox" className="accent-[var(--accent)]" checked={chk[k]} onChange={() => setChk({ ...chk, [k]: !chk[k] })} /><span className={cn(chk[k] && "text-mute line-through")}>{l}</span></label>
          ))}
          <div className="mt-2 text-[12px] text-faint">{Object.values(chk).filter(Boolean).length} of 5 complete</div>
        </Card>
      </div>
    </div>
  );
}
