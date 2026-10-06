"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Plus, Trash2, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { Btn, Card, Confirm, Field, Input, PageHeader, Pill, Progress, Select, cn } from "@/components/ui/ui";
import { CITIES, PRODUCTS, SALES_REPS, WAREHOUSES, custById, prodBySku } from "@/data/core";
import { STOCK, available, lineTotal, sumLines } from "@/data/ops";
import { inr, num } from "@/lib/format";
import type { Line, OrderStatus, WhId } from "@/types";

type L = { sku: string; qty: number; price: number; disc: number };
const DEFAULT_LINES: L[] = [
  { sku: "WT-1000", qty: 40, price: 6850, disc: 0 },
  { sku: "BF-BM-CH", qty: 100, price: 865, disc: 0 },
  { sku: "ES-MCB-32", qty: 101, price: 265, disc: 0 },
];
// tuned so the default Sharma Hardware order exceeds the available credit by exactly ₹1,24,000
const DEFAULT_FREIGHT = 461600 - sumLines(DEFAULT_LINES.map((l) => ({ ...l, gst: prodBySku(l.sku)!.gst })));
const EXTRA_CREDIT: Record<string, number> = { "sharma-hardware": 156200 }; // open orders not yet invoiced

export function NewOrder() {
  const { customers, createOrder, toast, role, orders } = useStore();
  const router = useRouter();
  const [custId, setCustId] = useState("sharma-hardware");
  const cust = customers.find((c) => c.id === custId)!;
  const [rep, setRep] = useState(cust.rep);
  const [wh, setWh] = useState<WhId>("RNC");
  const [terms, setTerms] = useState("Net 30");
  const [expected, setExpected] = useState("2026-10-10");
  const [billing, setBilling] = useState("");
  const [shipping, setShipping] = useState("");
  const [lines, setLines] = useState<L[]>(DEFAULT_LINES);
  const [freight, setFreight] = useState<number | null>(DEFAULT_FREIGHT);
  const [override, setOverride] = useState(false);

  const full: Line[] = lines.map((l) => ({ ...l, gst: prodBySku(l.sku)!.gst }));
  const sub = full.reduce((a, l) => a + l.qty * l.price, 0);
  const disc = full.reduce((a, l) => a + (l.qty * l.price * l.disc) / 100, 0);
  const gst = full.reduce((a, l) => a + l.qty * l.price * (1 - l.disc / 100) * (l.gst / 100), 0);
  const lineSum = sumLines(full);
  const fr = freight ?? Math.round((lineSum * 0.008) / 10) * 10;
  const grand = lineSum + fr;
  const used = cust.outstanding + (EXTRA_CREDIT[cust.id] ?? 0);
  const availCredit = cust.creditLimit - used;
  const exceed = grand - availCredit;
  const qty = lines.reduce((a, l) => a + l.qty, 0);

  const stockFor = (sku: string) => STOCK.filter((s) => s.sku === sku && s.wh === wh).reduce((a, s) => a + available(s), 0);
  const short = useMemo(() => lines.filter((l) => l.qty > stockFor(l.sku)), [lines, wh]); // eslint-disable-line react-hooks/exhaustive-deps
  const upd = (i: number, p: Partial<L>) => setLines(lines.map((l, k) => (k === i ? { ...l, ...p } : l)));
  const pickCust = (id: string) => { setCustId(id); const c = custById(id)!; setRep(c.rep); setWh(CITIES[c.city].wh); setFreight(null); };

  const save = (status: OrderStatus) => {
    if (!lines.length) return toast("Add at least one product", "bad");
    if (lines.some((l) => l.qty <= 0)) return toast("Quantities must be greater than zero", "bad");
    const allShort = lines.every((l) => stockFor(l.sku) === 0);
    const id = createOrder({
      custId, city: cust.city, rep, lines: full, freight: fr, items: lines.length, qty, value: grand, terms, expDispatch: expected + "T10:00:00",
      status, wh, allocated: status === "Stock Allocated" ? qty : 0, packed: 0, dispatched: 0, delivered: 0,
      stock: allShort ? "Out of Stock" : short.length ? "Partial Stock" : "Available",
    });
    toast(`${id} ${status === "Draft" ? "saved as draft" : status === "Pending Approval" ? "sent for approval" : "approved & stock allocated"}`, "ok", `${cust.name} · ${inr(grand)}`);
    router.push(`/orders/${id}`);
  };
  const approve = () => (exceed > 0 && role !== "owner" ? toast("Credit limit exceeded — only the Owner can override", "bad", "Send for approval instead") : exceed > 0 ? setOverride(true) : save("Stock Allocated"));

  return (
    <div className="space-y-4">
      <PageHeader title="Create Sales Order" crumbs={[{ label: "Sales Orders", href: "/orders" }, { label: "New order" }]} sub="Live stock and credit checks as you build the order." />
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-4">
          <Card title="Customer & delivery">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Customer" className="lg:col-span-2"><Select value={custId} onChange={(e) => pickCust(e.target.value)}>{[...customers].sort((a, b) => a.name.localeCompare(b.name)).map((c) => <option key={c.id} value={c.id}>{c.name} — {c.city}</option>)}</Select></Field>
              <Field label="Salesperson"><Select value={rep} onChange={(e) => setRep(e.target.value)}>{SALES_REPS.map((r) => <option key={r}>{r}</option>)}</Select></Field>
              <Field label="Billing address"><Input value={billing || `${cust.name}, Main Road, ${cust.city}, ${cust.state}`} onChange={(e) => setBilling(e.target.value)} /></Field>
              <Field label="Shipping address"><Input value={shipping || `${cust.name} Godown, Industrial Area, ${cust.city}`} onChange={(e) => setShipping(e.target.value)} /></Field>
              <Field label="Fulfilment warehouse"><Select value={wh} onChange={(e) => setWh(e.target.value as WhId)}>{WAREHOUSES.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</Select></Field>
              <Field label="Order date"><Input value="06 Oct 2026" readOnly disabled /></Field>
              <Field label="Expected delivery"><Input type="date" value={expected} onChange={(e) => setExpected(e.target.value)} /></Field>
              <Field label="Payment terms"><Select value={terms} onChange={(e) => setTerms(e.target.value)}>{["Net 15", "Net 30", "Net 45", "50% Advance", "Cash on Delivery"].map((t) => <option key={t}>{t}</option>)}</Select></Field>
            </div>
          </Card>

          <Card title="Products" sub={`${lines.length} line items · ${num(qty)} units`} action={<Btn size="sm" icon={<Plus size={13} />} onClick={() => setLines([...lines, { sku: PRODUCTS[0].sku, qty: 1, price: PRODUCTS[0].price, disc: 0 }])}>Add product</Btn>} pad={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-[13px]">
                <thead><tr className="border-b border-line bg-bg text-left text-[11px] uppercase tracking-[0.04em] text-mute">{["Product", "SKU", "Available", "Qty", "Unit price", "Disc %", "GST", "Total", ""].map((h, i) => <th key={i} className={cn("px-3 py-2 font-medium", i >= 2 && i <= 7 && "text-right")}>{h}</th>)}</tr></thead>
                <tbody>
                  {lines.map((l, i) => {
                    const p = prodBySku(l.sku)!;
                    const av = stockFor(l.sku);
                    return (
                      <tr key={i} className="border-b border-line align-middle">
                        <td className="px-3 py-2"><Select className="!w-[240px]" value={l.sku} onChange={(e) => { const np = prodBySku(e.target.value)!; upd(i, { sku: np.sku, price: np.price }); }}>{PRODUCTS.map((x) => <option key={x.sku} value={x.sku}>{x.name}</option>)}</Select></td>
                        <td className="num px-3 text-[12px] text-mute">{p.sku}</td>
                        <td className="px-3 text-right"><span className={cn("num", l.qty > av ? "font-semibold text-bad" : "text-mute")}>{num(av)}</span></td>
                        <td className="px-3"><Input type="number" min={1} className="!w-[84px] text-right" value={l.qty} onChange={(e) => upd(i, { qty: Number(e.target.value) })} /></td>
                        <td className="px-3"><Input type="number" className="!w-[92px] text-right" value={l.price} onChange={(e) => upd(i, { price: Number(e.target.value) })} /></td>
                        <td className="px-3"><Input type="number" min={0} max={30} className="!w-[64px] text-right" value={l.disc} onChange={(e) => upd(i, { disc: Number(e.target.value) })} /></td>
                        <td className="num px-3 text-right text-mute">{p.gst}%</td>
                        <td className="num px-3 text-right font-semibold">{inr(lineTotal({ ...l, gst: p.gst }))}</td>
                        <td className="px-2"><button onClick={() => setLines(lines.filter((_, k) => k !== i))} className="rounded p-1.5 text-faint hover:bg-bad-soft hover:text-bad" aria-label="Remove"><Trash2 size={14} /></button></td>
                      </tr>
                    );
                  })}
                  {!lines.length && <tr><td colSpan={9} className="px-3 py-10 text-center text-mute">No products added yet.</td></tr>}
                </tbody>
              </table>
            </div>
            {short.length > 0 && <div className="flex items-start gap-2 border-t border-line bg-warn-soft px-4 py-2.5 text-[12.5px] text-warn"><AlertTriangle size={14} className="mt-0.5 shrink-0" /><span>{short.length} line(s) exceed stock at {WAREHOUSES.find((w) => w.id === wh)?.name}: {short.map((l) => `${prodBySku(l.sku)!.name} (${num(stockFor(l.sku))} available)`).join(", ")}. The balance will be back-ordered or sourced from another warehouse.</span></div>}
          </Card>
        </div>

        <div className="space-y-4 xl:sticky xl:top-[68px] xl:self-start">
          <Card title="Order summary">
            <dl className="space-y-1.5 text-[13px]">
              {[["Subtotal", inr(sub)], ["Discount", `− ${inr(disc)}`], ["GST", inr(gst)]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-mute">{k}</dt><dd className="num">{v}</dd></div>)}
              <div className="flex items-center justify-between"><dt className="text-mute">Freight</dt><dd><Input type="number" className="!h-7 !w-[96px] text-right" value={Math.round(fr)} onChange={(e) => setFreight(Number(e.target.value))} /></dd></div>
              <div className="mt-2 flex items-baseline justify-between border-t border-line pt-2.5"><dt className="font-semibold">Grand total</dt><dd className="num text-[22px] font-semibold tracking-tight">{inr(grand)}</dd></div>
            </dl>
          </Card>
          <Card title="Credit check" action={<Pill tone={exceed > 0 ? "bad" : "ok"}>{exceed > 0 ? "Limit exceeded" : "Within limit"}</Pill>}>
            <dl className="space-y-1.5 text-[13px]">
              <div className="flex justify-between"><dt className="text-mute">Credit limit</dt><dd className="num">{inr(cust.creditLimit)}</dd></div>
              <div className="flex justify-between"><dt className="text-mute">Outstanding amount</dt><dd className="num">{inr(cust.outstanding)}</dd></div>
              <div className="flex justify-between"><dt className="text-mute">Credit used (incl. open orders)</dt><dd className="num">{inr(used)}</dd></div>
              <div className="flex justify-between font-medium"><dt>Credit available</dt><dd className="num">{inr(availCredit)}</dd></div>
            </dl>
            <Progress className="mt-3" value={used + grand} max={cust.creditLimit} tone={exceed > 0 ? "bad" : "accent"} />
            <div className="mt-1 text-[11.5px] text-faint">{Math.round(((used + grand) / cust.creditLimit) * 100)}% of limit after this order</div>
            {exceed > 0 && (
              <div className="mt-3 flex gap-2 rounded-[6px] bg-bad-soft p-2.5 text-[12.5px] text-bad"><AlertTriangle size={15} className="mt-0.5 shrink-0" /><span>This order will exceed {cust.name}&apos;s approved credit limit by <b>{inr(exceed)}</b>.</span></div>
            )}
          </Card>
          <div className="grid gap-2">
            <Btn variant="primary" size="md" onClick={approve} icon={<ShieldCheck size={14} />}>Approve &amp; Allocate Stock</Btn>
            <Btn variant="secondary" onClick={() => save("Pending Approval")}>Send For Approval</Btn>
            <Btn variant="ghost" onClick={() => save("Draft")}>Save Draft</Btn>
          </div>
          <div className="text-[11.5px] text-faint">{orders.length} orders in system · Next order number is auto-assigned.</div>
        </div>
      </div>
      <Confirm open={override} onClose={() => setOverride(false)} onConfirm={() => save("Stock Allocated")} title="Override credit limit?" confirmLabel="Override & allocate" danger
        body={<>This will approve an order that exceeds <b>{cust.name}</b>&apos;s credit limit by <b>{inr(Math.max(0, exceed))}</b>. The override will be logged against your name.</>} />
    </div>
  );
}
