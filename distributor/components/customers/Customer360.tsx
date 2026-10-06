"use client";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, CreditCard, FileText, FileMinus, MessageSquare, Phone, ShoppingCart, StickyNote, Truck } from "lucide-react";
import { useStore } from "@/lib/store";
import { Btn, Card, Empty, Field, KV, Modal, PageHeader, Pill, Progress, Select, Tabs, Textarea, cn, Input } from "@/components/ui/ui";
import { DataTable, type Col } from "@/components/ui/table";
import { InvLink, OrderLink, ProdLink } from "@/components/ui/links";
import { prodBySku } from "@/data/core";
import { fdate, fdt, inr, lakh, num, NOW } from "@/lib/format";
import { RecordPaymentModal } from "@/components/shell/QuickModals";
import type { Invoice, Order, Payment } from "@/types";
import { BarsChart } from "@/components/ui/charts";
import { CHART_COLORS } from "@/components/ui/charts";

const TABS = ["Overview", "Orders", "Invoices", "Payments", "Outstanding", "Products Purchased", "Returns", "Documents", "Notes", "Activity"] as const;
type Tab = (typeof TABS)[number];
const EXTRA_CREDIT: Record<string, number> = { "sharma-hardware": 156200 };

type Ev = { ts: string; kind: "Order" | "Dispatch" | "Invoice" | "Payment" | "Return" | "Credit Note" | "Call / Note"; title: string; sub: string; amt?: string; href?: string };
const KIND_ICON: Record<Ev["kind"], React.ReactNode> = {
  Order: <ShoppingCart size={13} />, Dispatch: <Truck size={13} />, Invoice: <FileText size={13} />, Payment: <ArrowDownLeft size={13} />, Return: <ArrowUpRight size={13} />, "Credit Note": <FileMinus size={13} />, "Call / Note": <Phone size={13} />,
};
const KIND_TONE: Record<Ev["kind"], string> = { Order: "bg-accent-soft text-accent-ink", Dispatch: "bg-info-soft text-info", Invoice: "bg-panel text-mute", Payment: "bg-ok-soft text-ok", Return: "bg-bad-soft text-bad", "Credit Note": "bg-warn-soft text-warn", "Call / Note": "bg-panel text-mute" };

export function Customer360() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  const c = s.customers.find((x) => x.id === id);
  const [tab, setTab] = useState<Tab>("Overview");
  const [pay, setPay] = useState(false);
  const [fu, setFu] = useState(false);
  const [note, setNote] = useState({ kind: "Phone Call", text: "", amt: "", date: "" });
  const orders = s.orders.filter((o) => o.custId === id);
  const invoices = s.invoices.filter((i) => i.custId === id);
  const pays = s.payments.filter((p) => p.custId === id);
  const rets = s.returns.filter((r) => r.custId === id);
  const fus = s.followups.filter((f) => f.custId === id);
  const dsp = s.dispatches.filter((d) => d.custId === id);

  const events = useMemo<Ev[]>(() => {
    const ev: Ev[] = [];
    orders.slice(0, 12).forEach((o) => ev.push({ ts: o.date, kind: "Order", title: `${o.id} created`, sub: `${o.items} items · ${num(o.qty)} units · ${o.status}`, amt: inr(o.value), href: `/orders/${o.id}` }));
    dsp.slice(0, 8).forEach((d) => d.departure && ev.push({ ts: d.departure, kind: "Dispatch", title: `${d.id} dispatched`, sub: `${d.vehicle} · ${d.transporter}`, href: `/dispatch/${d.id}` }));
    invoices.slice(0, 10).forEach((i) => ev.push({ ts: i.date, kind: "Invoice", title: `${i.id} raised`, sub: `Due ${fdate(i.due)} · ${i.status}`, amt: inr(i.total), href: `/invoices/${i.id}` }));
    pays.slice(0, 10).forEach((p) => ev.push({ ts: p.date, kind: "Payment", title: `${p.id} received via ${p.method}`, sub: `Against ${p.invoiceId} · ${p.by}`, amt: inr(p.amount) }));
    rets.forEach((r) => ev.push({ ts: r.date + "T10:00:00", kind: "Return", title: `${r.id} · ${r.type}`, sub: `${r.product} × ${r.qty}`, amt: inr(r.value), href: "/returns" }));
    rets.filter((r) => r.stage >= 6).forEach((r) => ev.push({ ts: r.date + "T16:00:00", kind: "Credit Note", title: `Credit note for ${r.id}`, sub: r.outcome, amt: inr(r.value) }));
    fus.forEach((f) => ev.push({ ts: f.ts, kind: "Call / Note", title: f.kind, sub: f.note }));
    return ev.sort((a, b) => b.ts.localeCompare(a.ts));
  }, [orders, dsp, invoices, pays, rets, fus]);

  const monthly = useMemo(() => !c ? [] : ["May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((m, i) => ({ label: m, Sales: Math.round((c.totalSales / c.orders) * (1.5 + ((i * 7 + c.name.length) % 5) * 0.5) * (i === 5 ? 1.25 : 1)), Collected: Math.round((c.totalSales / c.orders) * (1.2 + ((i * 5 + c.name.length) % 4) * 0.5)) })), [c]);

  if (!c) return <Empty title="Customer not found" action={<Btn href="/customers">Back to customers</Btn>} />;
  const used = c.outstanding + (EXTRA_CREDIT[c.id] ?? 0);
  const avail = c.creditLimit - used;
  const delivered = orders.filter((o) => o.status === "Delivered" || o.status === "Partially Delivered");
  const received = pays.reduce((a, p) => a + p.amount, 0);
    const retVal = rets.reduce((a, r) => a + r.value, 0);
  const open = invoices.filter((i) => i.balance > 0);

  // purchased products
  const bought = new Map<string, { qty: number; value: number; last: string }>();
  orders.forEach((o) => o.lines.forEach((l) => { const b = bought.get(l.sku) ?? { qty: 0, value: 0, last: o.date }; b.qty += l.qty; b.value += l.qty * l.price; if (o.date > b.last) b.last = o.date; bought.set(l.sku, b); }));
  const boughtRows = Array.from(bought, ([sku, v]) => ({ sku, ...v })).sort((a, b) => b.value - a.value);


  const orderCols: Col<Order>[] = [
    { key: "id", header: "Order", render: (o) => <OrderLink id={o.id} /> },
    { key: "date", header: "Date", get: (o) => o.date, render: (o) => <span className="num text-mute">{fdate(o.date)}</span> },
    { key: "qty", header: "Units", align: "right", render: (o) => num(o.qty) },
    { key: "value", header: "Value", align: "right", render: (o) => <b>{inr(o.value)}</b> },
    { key: "terms", header: "Terms", muted: true },
    { key: "status", header: "Status", render: (o) => <Pill>{o.status}</Pill> },
  ];
  const invCols: Col<Invoice>[] = [
    { key: "id", header: "Invoice", render: (i) => <InvLink id={i.id} /> },
    { key: "orderId", header: "Order", render: (i) => <OrderLink id={i.orderId} /> },
    { key: "date", header: "Date", get: (i) => i.date, render: (i) => <span className="num text-mute">{fdate(i.date)}</span> },
    { key: "due", header: "Due", get: (i) => i.due, render: (i) => <span className="num text-mute">{fdate(i.due)}</span> },
    { key: "total", header: "Total", align: "right", render: (i) => inr(i.total) },
    { key: "balance", header: "Balance", align: "right", render: (i) => <b className={i.balance > 0 ? "text-bad" : ""}>{inr(i.balance)}</b> },
    { key: "status", header: "Status", render: (i) => <Pill>{i.status}</Pill> },
  ];
  const payCols: Col<Payment>[] = [
    { key: "id", header: "Receipt", render: (p) => <span className="num font-medium">{p.id}</span> },
    { key: "date", header: "Date", get: (p) => p.date, render: (p) => <span className="num text-mute">{fdt(p.date)}</span> },
    { key: "invoiceId", header: "Invoice", render: (p) => <InvLink id={p.invoiceId} /> },
    { key: "method", header: "Method" },
    { key: "ref", header: "Reference", muted: true },
    { key: "amount", header: "Amount", align: "right", render: (p) => <b>{inr(p.amount)}</b> },
  ];

  const addNote = () => {
    if (!note.text.trim()) return s.toast("Add a note first", "bad");
    s.addFollowup({ custId: c.id, kind: note.kind, note: note.text, promiseAmt: note.amt ? Number(note.amt) : undefined, promiseDate: note.date || undefined });
    s.toast("Follow-up logged", "ok", `${note.kind} · ${c.name}`); setFu(false); setNote({ kind: "Phone Call", text: "", amt: "", date: "" });
  };
  const promise = fus.find((f) => f.kind === "Promise To Pay");

  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "Customers", href: "/customers" }, { label: c.name }]}
        title={<span className="flex flex-wrap items-center gap-3">{c.name}<Pill>{c.segment}</Pill>{c.overdue > 0 && <Pill tone="bad">{inr(c.overdue)} overdue</Pill>}</span>}
        sub={`${c.city}, ${c.state} · ${c.code} · GSTIN ${c.gstin}`}
        actions={<><Btn icon={<MessageSquare size={14} />} onClick={() => s.toast("WhatsApp statement sent", "ok", `${c.name} · ledger + open invoices`)}>Send statement</Btn><Btn icon={<StickyNote size={14} />} onClick={() => setFu(true)}>Log follow-up</Btn>{open.length > 0 && <Btn icon={<CreditCard size={14} />} onClick={() => setPay(true)}>Record payment</Btn>}<Btn variant="primary" href="/orders/new">New order</Btn></>}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <Card pad={false}>
          <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-4 [&>div]:bg-surface [&>div]:p-3.5">
            <KV label="Dealer since"><span className="num">{c.since}</span></KV>
            <KV label="Assigned salesperson">{c.rep}</KV>
            <KV label="Territory">{c.territory}</KV>
            <KV label="Primary contact">{c.contact} · <span className="num">{c.phone}</span></KV>
            <KV label="Credit limit"><span className="num font-semibold">{inr(c.creditLimit)}</span></KV>
            <KV label="Credit used"><span className="num font-semibold">{inr(used)}</span></KV>
            <KV label="Available credit"><span className={cn("num font-semibold", avail < 0 ? "text-bad" : "text-ok")}>{inr(avail)}</span></KV>
            <KV label="Outstanding"><span className="num font-semibold text-bad">{inr(c.outstanding)}</span><div className="num text-[11.5px] text-mute">{inr(c.outstanding - c.overdue)} current · {inr(c.overdue)} overdue</div></KV>
            <KV label="Avg. payment delay"><span className="num font-semibold">{c.avgDelay} days</span></KV>
            <KV label="Lifetime sales"><span className="num font-semibold">{lakh(c.totalSales)}</span></KV>
            <KV label="Payment behaviour"><Pill>{c.behaviour}</Pill></KV>
            <KV label="Last order"><span className="num">{fdate(c.lastOrder, true)}</span></KV>
          </div>
          <div className="border-t border-line p-4"><div className="mb-1.5 flex justify-between text-[12px] text-mute"><span>Credit utilisation</span><span className="num">{Math.round((used / c.creditLimit) * 100)}%</span></div><Progress value={used} max={c.creditLimit} tone={used / c.creditLimit > 0.85 ? "bad" : used / c.creditLimit > 0.65 ? "warn" : "accent"} /></div>
        </Card>
        <div className="space-y-4">
          {c.overdue > 0 && (
            <div className="flex gap-2.5 rounded-[8px] border border-bad/25 bg-bad-soft p-3.5 text-[13px] text-bad"><AlertTriangle size={16} className="mt-0.5 shrink-0" /><div><b>{inr(c.overdue)} overdue</b> — oldest invoice is {c.oldestDays} days past due.{promise && <div className="mt-1 text-bad/80">Promise: {inr(promise.promiseAmt ?? 0)} by {fdate(promise.promiseDate ?? "")}.</div>}</div></div>
          )}
          <Card title="Next follow-up" action={<Btn size="xs" onClick={() => setFu(true)}>Log</Btn>}>
            {fus[0] ? <div className="text-[13px]"><div className="flex items-center gap-2"><Pill>{fus[0].kind}</Pill><span className="num text-[12px] text-mute">{fdt(fus[0].ts)}</span></div><p className="mt-1.5 text-mute">{fus[0].note}</p><div className="mt-2 text-[12px] text-faint">By {fus[0].by}</div></div> : <div className="text-[13px] text-mute">No follow-ups logged yet.</div>}
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {[["Total Orders", num(c.orders)], ["Total Sales", lakh(c.totalSales)], ["Payments Received", lakh(c.totalSales - c.outstanding)], ["Outstanding", lakh(c.outstanding)], ["Returns", retVal ? inr(retVal) : "₹0"], ["Avg Order Value", inr(c.totalSales / Math.max(1, c.orders))]].map(([l, v]) => (
          <div key={l} className="rounded-[8px] border border-line bg-surface p-3"><div className="label">{l}</div><div className={cn("num mt-1 text-[19px] font-semibold tracking-tight", l === "Outstanding" && "text-bad")}>{v}</div></div>
        ))}
      </div>

      <Tabs tabs={TABS.map((t) => ({ id: t, label: t, count: t === "Orders" ? orders.length : t === "Invoices" ? invoices.length : t === "Payments" ? pays.length : t === "Returns" ? rets.length : t === "Notes" ? fus.length : undefined }))} value={tab} onChange={setTab} />

      {tab === "Overview" && (
        <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
          <Card title="Business relationship timeline" sub="Orders, dispatches, invoices, payments, returns and conversations">
            {events.length === 0 ? <Empty title="No activity yet" /> : (
              <ol className="relative space-y-0">
                {events.slice(0, 16).map((e, i) => (
                  <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < Math.min(events.length, 16) - 1 && <span className="absolute left-[11px] top-6 h-[calc(100%-14px)] w-px bg-line" />}
                    <span className={cn("relative z-10 flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full", KIND_TONE[e.kind])}>{KIND_ICON[e.kind]}</span>
                    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-x-3"><span className="text-[13px] font-medium">{e.href ? <a href={e.href} className="hover:text-accent hover:underline">{e.title}</a> : e.title}</span><span className="num text-[12px] text-faint">{fdt(e.ts)}</span></div><div className="flex justify-between gap-3 text-[12.5px] text-mute"><span className="truncate">{e.sub}</span>{e.amt && <span className="num shrink-0 font-medium text-ink">{e.amt}</span>}</div></div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
          <div className="space-y-4">
            <Card title="Purchases vs collections" sub="Last 6 months"><BarsChart data={monthly} keys={[{ k: "Sales", name: "Sales" }, { k: "Collected", name: "Collected" }]} colors={[CHART_COLORS.accent, CHART_COLORS.ok]} height={200} /></Card>
            <Card title="In flight now" pad={false}>
              <ul className="divide-y divide-line text-[13px]">
                {orders.filter((o) => !["Delivered", "Cancelled"].includes(o.status)).slice(0, 4).map((o) => <li key={o.id} className="flex items-center justify-between px-4 py-2.5"><span><OrderLink id={o.id} /><span className="ml-2 num text-mute">{inr(o.value)}</span></span><Pill>{o.status}</Pill></li>)}
                {orders.filter((o) => !["Delivered", "Cancelled"].includes(o.status)).length === 0 && <li className="px-4 py-4 text-mute">No open orders.</li>}
              </ul>
            </Card>
          </div>
        </div>
      )}
      {tab === "Orders" && <div className="text-[12px] text-mute">Showing the last 4 months on record · {num(c.orders)} lifetime orders (earlier history is archived).</div>}
      {tab === "Orders" && <DataTable rows={orders} cols={orderCols} rowKey={(o) => o.id} pageSize={10} exportName={`${c.id}-orders`} defaultSort={{ key: "date", dir: "desc" }} empty={{ title: "No orders yet", action: <Btn variant="primary" href="/orders/new">Create first order</Btn> }} />}
      {tab === "Invoices" && <DataTable rows={invoices} cols={invCols} rowKey={(i) => i.id} pageSize={10} exportName={`${c.id}-invoices`} defaultSort={{ key: "date", dir: "desc" }} empty={{ title: "No invoices yet" }} />}
      {tab === "Payments" && <DataTable rows={pays} cols={payCols} rowKey={(p) => p.id} pageSize={10} exportName={`${c.id}-payments`} defaultSort={{ key: "date", dir: "desc" }} empty={{ title: "No payments received yet" }} />}
      {tab === "Outstanding" && (
        <Card title="Open invoices" sub={`${open.length} invoices · ${inr(open.reduce((a, i) => a + i.balance, 0))} to collect`} action={open.length > 0 ? <Btn size="sm" variant="primary" onClick={() => setPay(true)}>Record payment</Btn> : undefined} pad={false}>
          {open.length === 0 ? <Empty title="Fully settled" body="This dealer has no open invoices." /> : (
            <table className="w-full text-[13px]"><thead><tr className="border-b border-line bg-bg text-left text-[11px] uppercase tracking-[0.04em] text-mute"><th className="px-4 py-2 font-medium">Invoice</th><th className="px-3 font-medium">Due</th><th className="px-3 font-medium">Age</th><th className="px-3 text-right font-medium">Total</th><th className="px-3 text-right font-medium">Balance</th><th className="px-4 font-medium">Status</th></tr></thead>
              <tbody>{open.map((i) => { const dd = Math.round((NOW.getTime() - new Date(i.due).getTime()) / 864e5); return <tr key={i.id} className="border-b border-line"><td className="px-4 py-2.5"><InvLink id={i.id} /></td><td className="num px-3 text-mute">{fdate(i.due)}</td><td className={cn("num px-3", dd > 0 ? "font-medium text-bad" : "text-mute")}>{dd > 0 ? `${dd} days overdue` : `in ${-dd} days`}</td><td className="num px-3 text-right">{inr(i.total)}</td><td className="num px-3 text-right font-semibold">{inr(i.balance)}</td><td className="px-4"><Pill>{i.status}</Pill></td></tr>; })}</tbody>
            </table>
          )}
        </Card>
      )}
      {tab === "Products Purchased" && (
        <Card pad={false} title="What this dealer buys" sub="Across all orders on record">
          <table className="w-full text-[13px]"><thead><tr className="border-b border-line bg-bg text-left text-[11px] uppercase tracking-[0.04em] text-mute"><th className="px-4 py-2 font-medium">Product</th><th className="px-3 font-medium">Category</th><th className="px-3 text-right font-medium">Units</th><th className="px-3 text-right font-medium">Value</th><th className="px-4 text-right font-medium">Last bought</th></tr></thead>
            <tbody>{boughtRows.map((b) => { const p = prodBySku(b.sku)!; return <tr key={b.sku} className="border-b border-line"><td className="px-4 py-2.5"><ProdLink id={p.id}>{p.name}</ProdLink></td><td className="px-3 text-mute">{p.category}</td><td className="num px-3 text-right">{num(b.qty)}</td><td className="num px-3 text-right font-medium">{inr(b.value)}</td><td className="num px-4 text-right text-mute">{fdate(b.last)}</td></tr>; })}{boughtRows.length === 0 && <tr><td colSpan={5}><Empty title="No purchases yet" /></td></tr>}</tbody>
          </table>
        </Card>
      )}
      {tab === "Returns" && <Card pad={false}>{rets.length ? <ul className="divide-y divide-line">{rets.map((r) => <li key={r.id} className="flex items-center justify-between px-4 py-3 text-[13px]"><div><div className="font-medium">{r.id} · {r.type}</div><div className="text-mute">{r.product} × {r.qty} · {r.reason}</div></div><div className="text-right"><div className="num font-medium">{inr(r.value)}</div><Pill tone={r.stage >= 6 ? "ok" : "warn"}>{r.outcome}</Pill></div></li>)}</ul> : <Empty title="No returns" body="This dealer has no returns or damage claims." />}</Card>}
      {tab === "Documents" && (
        <Card pad={false}><ul className="divide-y divide-line text-[13px]">{[["Dealer agreement 2026", "Signed · valid till Mar 2027"], ["GST certificate", `${c.gstin}`], ["Credit approval note", `Limit ${inr(c.creditLimit)} approved by Rajesh Agarwal`], ["Statement of account", "Generated 06 Oct 2026"], ["KYC — PAN & Aadhaar", "Verified"]].map(([n, d]) => <li key={n} className="flex items-center justify-between px-4 py-3"><span><span className="block font-medium">{n}</span><span className="text-[12px] text-faint">{d}</span></span><Btn size="sm" onClick={() => s.toast(`${n} opened`, "info")}>View</Btn></li>)}</ul></Card>
      )}
      {tab === "Notes" && (
        <Card title="Collection follow-ups & notes" action={<Btn size="sm" variant="primary" onClick={() => setFu(true)}>Add note</Btn>} pad={false}>
          {fus.length ? <ul className="divide-y divide-line">{fus.map((f) => <li key={f.id} className="px-4 py-3 text-[13px]"><div className="flex items-center justify-between"><span className="flex items-center gap-2"><Pill>{f.kind}</Pill><span className="text-mute">{f.by}</span></span><span className="num text-[12px] text-faint">{fdt(f.ts)}</span></div><p className="mt-1.5">{f.note}</p>{f.promiseAmt && <div className="mt-1.5 text-[12.5px] text-accent-ink">Promise: <b className="num">{inr(f.promiseAmt)}</b> by {fdate(f.promiseDate ?? "")}</div>}</li>)}</ul> : <Empty title="No notes yet" action={<Btn size="sm" onClick={() => setFu(true)}>Add first note</Btn>} />}
        </Card>
      )}
      {tab === "Activity" && (
        <Card pad={false}><ul className="divide-y divide-line">{s.logs.filter((l) => l.record === c.name || l.action.includes(c.name)).map((l) => <li key={l.id} className="flex justify-between gap-3 px-4 py-2.5 text-[13px]"><span><b className="font-medium">{l.user}</b> <span className="text-mute">{l.action}</span></span><span className="num shrink-0 text-[12px] text-faint">{fdt(l.ts)}</span></li>)}{!s.logs.some((l) => l.record === c.name || l.action.includes(c.name)) && <li><Empty title="No logged activity" /></li>}</ul></Card>
      )}

      <RecordPaymentModal key={pay ? "o" : "c"} open={pay} onClose={() => setPay(false)} custId={c.id} />
      <Modal open={fu} onClose={() => setFu(false)} title="Log follow-up" sub={c.name} footer={<><Btn onClick={() => setFu(false)}>Cancel</Btn><Btn variant="primary" onClick={addNote}>Save</Btn></>}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Type" className="sm:col-span-2"><Select value={note.kind} onChange={(e) => setNote({ ...note, kind: e.target.value })}>{["Phone Call", "WhatsApp", "Email", "Promise To Pay", "Visit", "Payment Dispute"].map((k) => <option key={k}>{k}</option>)}</Select></Field>
          <Field label="Notes" className="sm:col-span-2"><Textarea rows={3} value={note.text} onChange={(e) => setNote({ ...note, text: e.target.value })} placeholder="What was discussed?" /></Field>
          {note.kind === "Promise To Pay" && <><Field label="Promised amount (₹)"><Input type="number" value={note.amt} onChange={(e) => setNote({ ...note, amt: e.target.value })} /></Field><Field label="Promised date"><Input type="date" value={note.date} onChange={(e) => setNote({ ...note, date: e.target.value })} /></Field></>}
        </div>
      </Modal>
      
    </div>
  );
}
