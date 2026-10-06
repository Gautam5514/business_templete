"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, FileCheck2, MapPin, Phone, Truck } from "lucide-react";
import { useStore } from "@/lib/store";
import { Btn, Card, Empty, KV, PageHeader, Pill, Timeline, cn, type Step } from "@/components/ui/ui";
import { DataTable, type Col } from "@/components/ui/table";
import { CustLink, DspLink, InvLink, OrderLink, ShpLink } from "@/components/ui/links";
import { custName } from "@/data/core";
import { fdt, inr, lakh, num } from "@/lib/format";
import { RouteMap } from "./RouteMap";
import type { Shipment, ShipStatus } from "@/types";

const STATUSES: ShipStatus[] = ["Scheduled", "Loading", "Dispatched", "In Transit", "Reached Hub", "Out For Delivery", "Delivered", "Delayed", "Issue"];

export function ShipmentsList() {
  const { shipments } = useStore();
  const router = useRouter();
  const st = useSearchParams().get("status") ?? "";
  const rows = st ? shipments.filter((s) => s.status === st) : shipments;
  const live = shipments.filter((s) => s.status !== "Delivered");
  const cols: Col<Shipment>[] = [
    { key: "id", header: "Shipment", render: (s) => <ShpLink id={s.id} /> },
    { key: "order", header: "Order", get: (s) => s.orderId, render: (s) => <OrderLink id={s.orderId} /> },
    { key: "cust", header: "Customer", get: (s) => custName(s.custId), render: (s) => <CustLink id={s.custId} /> },
    { key: "route", header: "Route", get: (s) => s.route.join(" → "), render: (s) => <span className="text-mute">{s.route[0]} → {s.route[s.route.length - 1].replace(" Dealer", "")}</span> },
    { key: "loc", header: "Current Location", get: (s) => s.route[Math.min(s.at, s.route.length - 1)], render: (s) => <span className="flex items-center gap-1"><MapPin size={12} className="text-faint" />{s.route[Math.min(s.at, s.route.length - 1)]}</span> },
    { key: "vehicle", header: "Vehicle", render: (s) => <span className="num">{s.vehicle}</span> },
    { key: "transporter", header: "Transporter", muted: true },
    { key: "qty", header: "Units", align: "right", render: (s) => num(s.qty) },
    { key: "value", header: "Goods Value", align: "right", render: (s) => inr(s.value) },
    { key: "eta", header: "ETA", render: (s) => <span className="num">{s.eta}</span> },
    { key: "status", header: "Status", render: (s) => <Pill>{s.status}</Pill> },
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Shipments" sub={`${live.length} shipments live · ${lakh(live.reduce((a, s) => a + s.value, 0))} of goods on the move`} />
      <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <RouteMap shipments={live.slice(0, 14)} />
        <Card title="Needs attention" pad={false}>
          <ul className="divide-y divide-line text-[13px]">{shipments.filter((s) => s.status === "Issue" || s.status === "Delayed").map((s) => <li key={s.id}><a href={`/shipments/${s.id}`} className="block px-4 py-2.5 hover:bg-bg"><div className="flex items-center justify-between"><b className="num">{s.id}</b><Pill>{s.status}</Pill></div><div className="text-mute">{custName(s.custId)}</div><div className="mt-0.5 text-[12px] text-faint">{s.note}</div></a></li>)}</ul>
        </Card>
      </div>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => <button key={s} onClick={() => router.replace(st === s ? "/shipments" : `/shipments?status=${encodeURIComponent(s)}`)} className={cn("flex items-center gap-2 rounded-[6px] border bg-surface px-2.5 py-1.5 text-[12.5px] hover:border-line-strong", st === s ? "border-accent bg-accent-soft text-accent-ink" : "border-line")}>{s}<span className="num rounded bg-panel px-1.5 text-[11px] text-mute">{shipments.filter((x) => x.status === s).length}</span></button>)}
      </div>
      <DataTable key={st} rows={rows} cols={cols} rowKey={(s) => s.id} pageSize={10} exportName="shipments" defaultSort={{ key: "id", dir: "desc" }} searchPlaceholder="Search shipment, customer, vehicle…" onRowClick={(s) => router.push(`/shipments/${s.id}`)} />
    </div>
  );
}

export function ShipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  const sh = s.shipments.find((x) => x.id === id);
  const [up, setUp] = useState(false);
  if (!sh) return <Empty title="Shipment not found" action={<Btn href="/shipments">Back to shipments</Btn>} />;
  const o = s.orders.find((x) => x.id === sh.orderId);
  const inv = s.invoices.find((i) => i.orderId === sh.orderId);
  const d = s.dispatches.find((x) => x.id === sh.dispatchId);
  const cur = sh.route[Math.min(sh.at, sh.route.length - 1)];
  const delivered = sh.status === "Delivered" || sh.status === "Issue";
  const dep = d?.departure ? fdt(d.departure) : "—";
  const events: Step[] = [
    { label: "Consignment loaded", done: sh.status !== "Scheduled", ts: d?.departure ? fdt(new Date(new Date(d.departure).getTime() - 36e5)) : undefined, who: "Dispatch desk", where: sh.route[0] },
    { label: `Departed ${sh.route[0]}`, done: !["Scheduled", "Loading"].includes(sh.status), ts: dep, who: sh.driver, where: `${sh.vehicle} · ${sh.transporter}` },
    ...sh.route.slice(1, -1).map((r, i) => ({ label: `Crossed ${r}`, done: sh.at > i + 1 || delivered, current: sh.at === i + 1 && !delivered, ts: sh.at >= i + 1 && d?.departure ? fdt(new Date(new Date(d.departure).getTime() + (i + 1) * 1.5 * 36e5)) : undefined, who: sh.driver, where: "Checkpoint · GPS ping" })),
    { label: `Arrive ${sh.route[sh.route.length - 1].replace(" Dealer", "")}`, done: delivered, current: !delivered && sh.at >= sh.route.length - 2 && sh.status !== "Scheduled", ts: delivered ? undefined : `ETA ${sh.eta}`, who: sh.contact },
    { label: "Proof of delivery captured", done: sh.pod !== "Pending", ts: sh.pod !== "Pending" ? sh.pod : undefined, note: sh.note },
  ];
  return (
    <div className="space-y-4">
      <PageHeader crumbs={[{ label: "Shipments", href: "/shipments" }, { label: sh.id }]} title={<span className="flex flex-wrap items-center gap-3"><span className="num">{sh.id}</span><Pill>{sh.status}</Pill></span>} sub={<>{custName(sh.custId)} · Order <OrderLink id={sh.orderId} /></>}
        actions={<>
          {!delivered && <Btn onClick={() => s.setShipmentStatus(sh.id, "Reached Hub")}>Reached hub</Btn>}
          {!delivered && <Btn onClick={() => s.setShipmentStatus(sh.id, "Delayed", "Vehicle delayed — traffic / breakdown reported by driver.")} icon={<AlertTriangle size={14} />}>Report delay</Btn>}
          {!delivered && <Btn variant="primary" icon={<CheckCircle2 size={14} />} onClick={() => setUp(true)}>Mark delivered</Btn>}
        </>} />
      {sh.note && <div className="flex items-start gap-2.5 rounded-[8px] border border-bad/25 bg-bad-soft px-3.5 py-2.5 text-[13px] text-bad"><AlertTriangle size={16} className="mt-0.5 shrink-0" />{sh.note}{sh.status === "Issue" && <a className="ml-auto shrink-0 font-medium underline" href="/returns">View return</a>}</div>}
      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <RouteMap shipments={[sh]} focus={sh.id} height={300} />
          <Card title="Route" sub={sh.route.join(" → ")}>
            <div className="flex items-center gap-1 overflow-x-auto py-2">
              {sh.route.map((r, i) => (
                <div key={r} className="flex min-w-0 flex-1 items-center">
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <span className={cn("flex h-7 w-7 items-center justify-center rounded-full border-2", i < sh.at || delivered ? "border-ok bg-ok text-white" : i === sh.at ? "border-accent bg-surface text-accent" : "border-line-strong bg-surface text-faint")}>{i === sh.at && !delivered ? <Truck size={13} /> : <MapPin size={13} />}</span>
                    <span className={cn("max-w-[84px] text-[12px]", i === sh.at && !delivered ? "font-semibold" : i > sh.at ? "text-faint" : "text-mute")}>{r.replace(" Dealer", "")}</span>
                  </div>
                  {i < sh.route.length - 1 && <span className={cn("mx-1 mb-5 h-0.5 min-w-4 flex-1", i < sh.at || delivered ? "bg-ok" : "bg-line-strong")} />}
                </div>
              ))}
            </div>
            {!delivered && <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-[6px] bg-accent-soft px-3 py-2 text-[13px]"><span>Current location: <b>{cur}</b></span><span>ETA: <b className="num">{sh.eta}</b></span>{sh.id === "SHP-398" && <span className="text-mute">Dealer unloading slot: 07 Oct, 11:00 AM</span>}</div>}
          </Card>
          <Card title="Tracking history"><Timeline steps={events} /></Card>
        </div>
        <div className="space-y-4">
          <Card title="Vehicle & driver"><div className="grid grid-cols-2 gap-4"><KV label="Vehicle"><span className="num font-semibold">{sh.vehicle}</span></KV><KV label="Transporter">{sh.transporter}</KV><KV label="Driver">{sh.driver}</KV><KV label="Driver phone"><span className="num">{sh.phone}</span></KV></div><Btn className="mt-4 w-full" icon={<Phone size={14} />} onClick={() => s.toast(`Calling ${sh.driver}…`, "info", sh.phone)}>Call driver</Btn></Card>
          <Card title="Goods"><div className="grid grid-cols-2 gap-4"><KV label="Total units"><span className="num text-[18px] font-semibold">{num(sh.qty)}</span></KV><KV label="Goods value"><span className="num text-[18px] font-semibold">{inr(sh.value)}</span></KV><KV label="Delivery contact" className="col-span-2">{sh.contact}</KV></div></Card>
          <Card title="Proof of delivery (POD)">{sh.pod !== "Pending" ? <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-[13px]"><FileCheck2 size={16} className="text-ok" /><span className="num">{sh.pod}</span></span><Btn size="sm" onClick={() => s.toast("POD downloaded", "ok", sh.pod)}>Download</Btn></div> : <div className="text-[13px] text-mute">Pending — signed POD is captured by the driver on delivery.</div>}</Card>
          <Card title="Connected records" pad={false}><ul className="divide-y divide-line text-[13px]"><li className="flex justify-between px-4 py-2.5"><span className="text-mute">Order</span><OrderLink id={sh.orderId} /></li><li className="flex justify-between px-4 py-2.5"><span className="text-mute">Customer</span><CustLink id={sh.custId} /></li><li className="flex justify-between px-4 py-2.5"><span className="text-mute">Dispatch</span><DspLink id={sh.dispatchId} /></li><li className="flex justify-between px-4 py-2.5"><span className="text-mute">Invoice</span>{inv ? <InvLink id={inv.id} /> : "—"}</li>{o && <li className="flex justify-between px-4 py-2.5"><span className="text-mute">Order status</span><Pill>{o.status}</Pill></li>}</ul></Card>
        </div>
      </div>
      <ConfirmDelivered open={up} onClose={() => setUp(false)} onYes={() => s.setShipmentStatus(sh.id, "Delivered")} contact={sh.contact} />
    </div>
  );
}

import { Confirm } from "@/components/ui/ui";
function ConfirmDelivered({ open, onClose, onYes, contact }: { open: boolean; onClose: () => void; onYes: () => void; contact: string }) {
  return <Confirm open={open} onClose={onClose} onConfirm={onYes} title="Mark as delivered?" confirmLabel="Confirm delivery" body={<>Records POD received from <b>{contact}</b>, moves the order to <b>Delivered</b> and starts the payment-due clock on the invoice.</>} />;
}
