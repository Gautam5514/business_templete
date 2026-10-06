"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Download, FileText, MapPin, Printer, Truck, Wallet, XCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { Btn, Card, Confirm, Empty, KV, PageHeader, Pill, Tabs, Timeline, cn } from "@/components/ui/ui";
import { CustLink, DspLink, InvLink, ProdLink, ShpLink } from "@/components/ui/links";
import { custById, prodBySku, whName } from "@/data/core";
import { fdate, fdt, inr, num } from "@/lib/format";
import { journey, NEXT_LABEL } from "@/lib/journey";
import { lineTotal } from "@/data/ops";
import { RecordPaymentModal } from "@/components/shell/QuickModals";

const TABS = ["Overview", "Items", "Dispatch", "Invoice", "Payments", "Returns", "Documents", "Activity"] as const;
type Tab = (typeof TABS)[number];

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  const o = s.orders.find((x) => x.id === id);
  const [tab, setTab] = useState<Tab>("Overview");
  const [pay, setPay] = useState(false);
  const [cancel, setCancel] = useState(false);
  const inv = s.invoices.find((i) => i.orderId === id);
  const d = s.dispatches.find((x) => x.orderId === id);
  const sh = s.shipments.find((x) => x.orderId === id);
  const pays = s.payments.filter((p) => p.invoiceId === inv?.id);
  const rets = s.returns.filter((r) => r.orderId === id);
  const steps = useMemo(() => (o ? journey(o, inv, d, sh) : []), [o, inv, d, sh]);

  if (!o) return <Empty title="Order not found" body={`No order with ID ${id}.`} action={<Btn href="/orders">Back to orders</Btn>} />;
  const c = s.customers.find((x) => x.id === o.custId) ?? custById(o.custId)!;
  const received = inv?.paid ?? 0;
  const outstanding = inv?.balance ?? 0;
  const pend = o.qty - o.dispatched;
  const next = NEXT_LABEL[o.status];
  const done = o.status === "Delivered" || o.status === "Cancelled";

  const summary: [string, string, string?][] = [
    ["Ordered Quantity", `${num(o.qty)} units`],
    ["Allocated", num(o.allocated), o.allocated < o.qty ? "warn" : undefined],
    ["Packed", num(o.packed)],
    ["Dispatched", num(o.dispatched)],
    ["Delivered", num(o.delivered)],
    ["Invoice Value", inv ? inr(inv.total) : "—"],
    ["Payment Received", inv ? inr(received) : "—", "ok"],
    ["Outstanding", inv ? inr(outstanding) : "—", outstanding > 0 ? "bad" : undefined],
  ];

  // proportional per-line fulfilment; any shortfall lands on the last line
  const lineF = (idx: number, key: "allocated" | "packed" | "dispatched" | "delivered") => {
    let deficit = o.qty - o[key];
    for (let j = o.lines.length - 1; j > idx; j--) deficit -= Math.min(deficit, o.lines[j].qty);
    return o.lines[idx].qty - Math.min(Math.max(deficit, 0), o.lines[idx].qty);
  };

  const docs = [
    ["Sales Order", `${o.id}.pdf`, true], ["Pro-forma Invoice", `PFI-${o.id.slice(4)}.pdf`, o.status !== "Draft"], ["Tax Invoice", `${inv?.id ?? "INV"}.pdf`, !!inv], ["Packing List", `PKL-${o.id.slice(4)}.pdf`, o.packed > 0],
    ["E-Way Bill", `EWB-${o.id.slice(4)}.pdf`, !!d && d.status === "Dispatched"], ["Transporter LR Copy", `LR-${d?.id ?? ""}.pdf`, !!d && d.status === "Dispatched"], ["Proof of Delivery", sh?.pod ?? "", !!sh && sh.pod !== "Pending"],
  ] as const;

  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "Sales Orders", href: "/orders" }, { label: o.id }]}
        title={<span className="flex flex-wrap items-center gap-3"><span className="num">{o.id}</span><Pill>{o.status}</Pill>{inv && <Pill>{inv.status}</Pill>}</span>}
        sub={<><CustLink id={o.custId} /> — {c.city} · <span className="num">{inr(o.value)}</span> · Salesperson {o.rep}</>}
        actions={<>
          <Btn icon={<Printer size={14} />} onClick={() => s.toast("Order PDF ready", "ok", `${o.id}.pdf`)}>Print</Btn>
          {inv && outstanding > 0 && <Btn icon={<Wallet size={14} />} onClick={() => setPay(true)}>Record payment</Btn>}
          {!done && <Btn variant="danger" icon={<XCircle size={14} />} onClick={() => setCancel(true)}>Cancel</Btn>}
          {next && <Btn variant="primary" icon={<ArrowRight size={14} className="order-last" />} onClick={() => s.advanceOrder(o.id)}>{next}</Btn>}
        </>}
      />

      <div className="grid grid-cols-2 divide-x divide-y divide-line overflow-hidden rounded-[8px] border border-line bg-surface sm:grid-cols-4 lg:grid-cols-8 lg:divide-y-0">
        {summary.map(([l, v, t]) => (
          <div key={l} className="p-3.5">
            <div className="label !text-[10.5px]">{l}</div>
            <div className={cn("num mt-1 text-[17px] font-semibold tracking-tight", t === "ok" && "text-ok", t === "bad" && "text-bad", t === "warn" && "text-warn")}>{v}</div>
          </div>
        ))}
      </div>

      <Card pad className="!py-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[12.5px]"><span className="font-medium">Fulfilment of {num(o.qty)} ordered units</span>{pend > 0 && o.dispatched > 0 && <span className="flex items-center gap-1.5 text-warn"><AlertTriangle size={13} />{num(pend)} units not dispatched — back-ordered</span>}</div>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-panel">
          <div className="bg-ok" style={{ width: `${(o.delivered / o.qty) * 100}%` }} title="Delivered" />
          <div className="bg-accent" style={{ width: `${((Math.max(o.dispatched, o.delivered) - o.delivered) / o.qty) * 100}%` }} title="In transit" />
          <div className="bg-accent/45" style={{ width: `${((Math.max(o.packed, o.dispatched) - o.dispatched) / o.qty) * 100}%` }} title="Packed" />
          <div className="bg-accent/20" style={{ width: `${((Math.max(o.allocated, o.packed) - o.packed) / o.qty) * 100}%` }} title="Allocated" />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-mute">{[["bg-ok", "Delivered"], ["bg-accent", "On the way"], ["bg-accent/45", "Packed"], ["bg-accent/20", "Allocated"], ["bg-panel border border-line", "Not yet allocated"]].map(([cl, l]) => <span key={l} className="flex items-center gap-1.5"><i className={cn("h-2 w-2 rounded-sm", cl)} />{l}</span>)}</div>
      </Card>

      <Tabs tabs={TABS.map((t) => ({ id: t, label: t, count: t === "Payments" ? pays.length : t === "Returns" ? rets.length : undefined }))} value={tab} onChange={setTab} />

      {tab === "Overview" && (
        <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
          <Card title="Order Journey" sub="Every step, who did it, where and when">
            <Timeline steps={steps} />
          </Card>
          <div className="space-y-4">
            <Card title="Connected records" pad={false}>
              <ul className="divide-y divide-line text-[13px]">
                <li className="flex items-center justify-between gap-3 px-4 py-2.5"><span className="text-mute">Customer</span><span className="text-right"><CustLink id={o.custId} /><div className="text-[11.5px] text-faint">Outstanding {inr(c.outstanding)}</div></span></li>
                <li className="flex items-center justify-between gap-3 px-4 py-2.5"><span className="text-mute">Dispatch</span>{d ? <span className="flex items-center gap-2"><DspLink id={d.id} /><Pill>{d.status}</Pill></span> : <span className="text-faint">Not created</span>}</li>
                <li className="flex items-center justify-between gap-3 px-4 py-2.5"><span className="text-mute">Shipment</span>{sh ? <span className="flex items-center gap-2"><ShpLink id={sh.id} /><Pill>{sh.status}</Pill></span> : <span className="text-faint">—</span>}</li>
                <li className="flex items-center justify-between gap-3 px-4 py-2.5"><span className="text-mute">Invoice</span>{inv ? <span className="flex items-center gap-2"><InvLink id={inv.id} /><Pill>{inv.status}</Pill></span> : <span className="text-faint">Not generated</span>}</li>
                <li className="flex items-center justify-between gap-3 px-4 py-2.5"><span className="text-mute">Payments</span>{pays.length ? <span className="num">{pays.map((p) => p.id).join(", ")}</span> : <span className="text-faint">None yet</span>}</li>
              </ul>
            </Card>
            {sh && sh.status !== "Delivered" && (
              <Card title="Live shipment" action={<Link href={`/shipments/${sh.id}`} className="text-[12.5px] text-accent hover:underline">Track</Link>}>
                <div className="flex items-center gap-2 text-[13px]"><Truck size={15} className="text-accent" /><b>{sh.vehicle}</b><span className="text-mute">· {sh.transporter}</span></div>
                <div className="mt-2 flex items-center gap-1.5 text-[12.5px] text-mute"><MapPin size={13} />Now near <b className="text-ink">{sh.route[Math.min(sh.at, sh.route.length - 1)]}</b> · ETA <b className="text-ink">{sh.eta}</b></div>
              </Card>
            )}
            <Card title="Order details">
              <div className="grid grid-cols-2 gap-3">
                <KV label="Warehouse">{whName(o.wh)}</KV><KV label="Payment terms">{o.terms}</KV><KV label="Order date"><span className="num">{fdt(o.date)}</span></KV><KV label="Expected dispatch"><span className="num">{fdate(o.expDispatch)}</span></KV>
                <KV label="Ship to" className="col-span-2">{c.name} Godown, Industrial Area, {c.city}, {c.state}</KV>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "Items" && (
        <Card pad={false} title={`${o.items} line items`} sub={`${num(o.qty)} units · ${inr(o.value)} incl. GST & freight`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-[13px]">
              <thead><tr className="border-b border-line bg-bg text-[11px] uppercase tracking-[0.04em] text-mute">{["Product", "SKU", "Ordered", "Allocated", "Packed", "Dispatched", "Delivered", "Unit price", "Disc", "GST", "Total"].map((h, i) => <th key={h} className={cn("px-3 py-2 text-left font-medium", i >= 2 && "text-right")}>{h}</th>)}</tr></thead>
              <tbody>
                {o.lines.map((l, i) => {
                  const p = prodBySku(l.sku)!;
                  const short = lineF(i, "packed") < l.qty && o.packed > 0;
                  return (
                    <tr key={l.sku} className="border-b border-line">
                      <td className="px-3 py-2.5"><ProdLink id={p.id}>{p.name}</ProdLink></td>
                      <td className="num px-3 text-[12px] text-mute">{l.sku}</td>
                      <td className="num px-3 text-right">{num(l.qty)}</td>
                      <td className="num px-3 text-right">{num(lineF(i, "allocated"))}</td>
                      <td className={cn("num px-3 text-right", short && "font-semibold text-warn")}>{num(lineF(i, "packed"))}{short && ` (−${l.qty - lineF(i, "packed")})`}</td>
                      <td className="num px-3 text-right">{num(lineF(i, "dispatched"))}</td>
                      <td className="num px-3 text-right">{num(lineF(i, "delivered"))}</td>
                      <td className="num px-3 text-right">{inr(l.price)}</td>
                      <td className="num px-3 text-right text-mute">{l.disc ? `${l.disc}%` : "—"}</td>
                      <td className="num px-3 text-right text-mute">{l.gst}%</td>
                      <td className="num px-3 text-right font-semibold">{inr(lineTotal(l))}</td>
                    </tr>
                  );
                })}
                <tr><td colSpan={10} className="px-3 py-2 text-right text-mute">Freight</td><td className="num px-3 text-right">{inr(o.freight)}</td></tr>
                <tr className="bg-bg"><td colSpan={10} className="px-3 py-2.5 text-right font-semibold">Order total</td><td className="num px-3 text-right text-[15px] font-semibold">{inr(o.value)}</td></tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "Dispatch" && (d ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title={<span className="flex items-center gap-2"><DspLink id={d.id} /><Pill>{d.status}</Pill></span>} action={<Btn size="sm" href={`/dispatch/${d.id}`}>Open dispatch</Btn>}>
            <div className="grid grid-cols-2 gap-4">
              <KV label="Packages"><span className="num">{d.packages}</span></KV><KV label="Units"><span className="num">{num(d.qty)}</span></KV><KV label="Weight"><span className="num">{num(d.weight)} kg</span></KV><KV label="Value"><span className="num">{inr(d.value)}</span></KV>
              <KV label="Transporter">{d.transporter}</KV><KV label="Vehicle"><span className="num">{d.vehicle}</span></KV><KV label="Driver">{d.driver}</KV><KV label="Expected delivery"><span className="num">{fdt(d.expected)}</span></KV>
            </div>
          </Card>
          {sh && <Card title={<span className="flex items-center gap-2"><ShpLink id={sh.id} /><Pill>{sh.status}</Pill></span>} action={<Btn size="sm" href={`/shipments/${sh.id}`}>Track shipment</Btn>}>
            <ol className="space-y-3">{sh.route.map((r, i) => <li key={r} className="flex items-center gap-3 text-[13px]"><span className={cn("h-2.5 w-2.5 rounded-full border", i < sh.at ? "border-ok bg-ok" : i === sh.at && sh.status !== "Delivered" ? "border-accent bg-accent live-dot" : i <= sh.at ? "border-ok bg-ok" : "border-line-strong bg-surface")} /><span className={cn(i > sh.at && "text-faint")}>{r}</span>{i === sh.at && sh.status !== "Delivered" && <Pill tone="info" dot={false}>Current · ETA {sh.eta}</Pill>}</li>)}</ol>
          </Card>}
        </div>
      ) : <Card><Empty title="No dispatch yet" body="A dispatch is created once stock is allocated and the order moves to packing." action={next ? <Btn variant="primary" onClick={() => s.advanceOrder(o.id)}>{next}</Btn> : undefined} /></Card>)}

      {tab === "Invoice" && (inv ? (
        <Card title={<span className="flex items-center gap-2"><InvLink id={inv.id} /><Pill>{inv.status}</Pill></span>} action={<><Btn size="sm" icon={<Download size={13} />} onClick={() => s.toast("Invoice downloaded", "ok", `${inv.id}.pdf`)}>Download</Btn><Btn size="sm" variant="primary" href={`/invoices/${inv.id}`}>Open invoice</Btn></>}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KV label="Invoice date"><span className="num">{fdate(inv.date, true)}</span></KV><KV label="Due date"><span className="num">{fdate(inv.due, true)}</span></KV><KV label="Taxable value"><span className="num">{inr(inv.taxable)}</span></KV><KV label="GST"><span className="num">{inr(inv.gst)}</span></KV>
            <KV label="Freight"><span className="num">{inr(inv.freight)}</span></KV><KV label="Grand total"><b className="num">{inr(inv.total)}</b></KV><KV label="Paid"><span className="num text-ok">{inr(inv.paid)}</span></KV><KV label="Balance"><b className={cn("num", inv.balance > 0 && "text-bad")}>{inr(inv.balance)}</b></KV>
          </div>
        </Card>
      ) : <Card><Empty title="Invoice not generated" body="Invoice is generated automatically when packing is completed." /></Card>)}

      {tab === "Payments" && (
        <Card title="Payments received" action={inv && outstanding > 0 ? <Btn size="sm" variant="primary" onClick={() => setPay(true)}>Record payment</Btn> : undefined} pad={false}>
          {pays.length ? (
            <table className="w-full text-[13px]"><thead><tr className="border-b border-line bg-bg text-left text-[11px] uppercase tracking-[0.04em] text-mute"><th className="px-4 py-2 font-medium">Receipt</th><th className="px-3 font-medium">Date</th><th className="px-3 font-medium">Method</th><th className="px-3 font-medium">Reference</th><th className="px-3 font-medium">Collected by</th><th className="px-4 text-right font-medium">Amount</th></tr></thead>
              <tbody>{pays.map((p) => <tr key={p.id} className="border-b border-line"><td className="num px-4 py-2.5 font-medium">{p.id}</td><td className="num px-3 text-mute">{fdt(p.date)}</td><td className="px-3">{p.method}</td><td className="num px-3 text-mute">{p.ref}</td><td className="px-3 text-mute">{p.by}</td><td className="num px-4 text-right font-semibold">{inr(p.amount)}</td></tr>)}</tbody>
              {inv && <tfoot><tr className="bg-bg"><td colSpan={5} className="px-4 py-2 text-right text-mute">Outstanding on {inv.id}</td><td className={cn("num px-4 text-right font-semibold", outstanding > 0 && "text-bad")}>{inr(outstanding)}</td></tr></tfoot>}
            </table>
          ) : <Empty title="No payments recorded" body="Payments will appear here once received against this order’s invoice." />}
        </Card>
      )}

      {tab === "Returns" && (
        <Card pad={false}>
          {rets.length ? <ul className="divide-y divide-line">{rets.map((r) => <li key={r.id} className="flex items-center justify-between px-4 py-3 text-[13px]"><div><div className="font-medium">{r.id} · {r.type}</div><div className="text-mute">{r.product} · {r.qty} units · {r.reason}</div></div><Link href="/returns" className="text-accent hover:underline">Open</Link></li>)}</ul> : <Empty title="No returns or damages" body="Nothing has been reported against this order." action={<Btn size="sm" onClick={() => s.toast("Return request created", "ok", `${o.id} · pending approval`)}>Raise return request</Btn>} />}
        </Card>
      )}

      {tab === "Documents" && (
        <Card pad={false}>
          <ul className="divide-y divide-line">
            {docs.map(([n, f, ok]) => (
              <li key={n} className="flex items-center justify-between gap-3 px-4 py-3 text-[13px]">
                <span className="flex items-center gap-3"><span className="rounded bg-panel p-1.5 text-mute"><FileText size={15} /></span><span><span className="block font-medium">{n}</span><span className="num text-[12px] text-faint">{ok ? f : "Not available yet"}</span></span></span>
                <Btn size="sm" disabled={!ok} icon={<Download size={13} />} onClick={() => s.toast(`${n} downloaded`, "ok", f)}>Download</Btn>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === "Activity" && (
        <Card title="Activity on this order" pad={false}>
          <ul className="divide-y divide-line">
            {[...s.logs.filter((l) => l.record === o.id || l.action.includes(o.id)).map((l) => ({ ts: l.ts, who: l.user, text: l.action, dev: l.device })),
              ...steps.filter((x) => x.done && x.ts && !/Expected|received/.test(x.ts)).map((x) => ({ ts: "", who: x.who ?? "", text: x.label + (x.note ? ` — ${x.note}` : ""), dev: x.ts ?? "" }))].slice(0, 30).map((a, i) => (
              <li key={i} className="flex items-start justify-between gap-3 px-4 py-2.5 text-[13px]"><span><b className="font-medium">{a.who}</b> <span className="text-mute">{a.text}</span></span><span className="num shrink-0 text-[12px] text-faint">{a.ts ? fdt(a.ts) : a.dev}</span></li>
            ))}
          </ul>
        </Card>
      )}

      <RecordPaymentModal key={pay ? "o" : "c"} open={pay} onClose={() => setPay(false)} custId={o.custId} invoiceId={inv?.id} />
      <Confirm open={cancel} onClose={() => setCancel(false)} danger title={`Cancel ${o.id}?`} confirmLabel="Cancel order" onConfirm={() => { s.setOrderStatus(o.id, "Cancelled"); }} body="Reserved stock will be released and the dealer will be notified. This can’t be undone." />
    </div>
  );
}
