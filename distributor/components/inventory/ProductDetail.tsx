"use client";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, PackageMinus, ShoppingCart } from "lucide-react";
import { useStore } from "@/lib/store";
import { Btn, Card, Delta, Empty, KV, PageHeader, Pill, Progress, Tabs, Timeline, cn } from "@/components/ui/ui";
import { CustLink, OrderLink } from "@/components/ui/links";
import { WAREHOUSES, prodById } from "@/data/core";
import { STOCK, available, stockStatus } from "@/data/ops";
import { movementsFor, POS } from "@/data/misc";
import { fdate, fdt, inr, lakh, num } from "@/lib/format";
import type { Step } from "@/components/ui/ui";

const TABS = ["Inventory", "Stock Movement", "Orders", "Purchases"] as const;
const MV_TONE: Record<string, string> = { "Purchase Received": "text-ok", Return: "text-ok", "Order Released": "text-ok", Damage: "text-bad", Dispatch: "text-info" };

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  const p = prodById(id);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Inventory");
  const rows = useMemo(() => STOCK.filter((x) => x.sku === p?.sku), [p]);
  const mv = useMemo(() => (p ? movementsFor(p.sku) : []), [p]);
  if (!p) return <Empty title="Product not found" action={<Btn href="/products">Back to products</Btn>} />;
  const t = (k: "physical" | "reserved" | "packed" | "transit" | "damaged") => rows.reduce((a, r) => a + r[k], 0);
  const avail = rows.reduce((a, r) => a + available(r), 0);
  const min = p.sku === "KS-2418-P" ? 300 : Math.round(rows.reduce((a, r) => a + r.reorder, 0) / rows.length);
  const dealer = p.sku === "KS-2418-P" ? 1860 : Math.round(t("physical") * 1.3);
  const orders = s.orders.filter((o) => o.lines.some((l) => l.sku === p.sku));
  const pos = POS.filter((po) => po.items.toLowerCase().includes(p.name.toLowerCase().split(" ").slice(0, 2).join(" ")));
  const wname = (x: string) => WAREHOUSES.find((w) => w.id === x)!.name;
  const kpis: [string, string, string?][] = [["Physical", num(t("physical"))], ["Reserved", num(t("reserved"))], ["Available", num(avail), "ok"], ["Packing", num(t("packed"))], ["In Transit", num(t("transit"))], ["Damaged", num(t("damaged")), "bad"], ["Minimum", num(min)], ["Dealer Stock", num(dealer)]];
  const steps: Step[] = mv.slice(0, 12).map((m) => ({ label: `${m.type} · ${m.ref}`, done: true, ts: fdt(m.ts), who: m.user, where: `${m.wh} · balance ${num(m.balance)}`, note: m.note || undefined }));

  return (
    <div className="space-y-4">
      <PageHeader crumbs={[{ label: "Products", href: "/products" }, { label: p.name }]}
        title={<span className="flex flex-wrap items-center gap-3">{p.name}<Pill tone={rows.some((r) => stockStatus(r) === "Low Stock") ? "warn" : "ok"}>{rows.some((r) => stockStatus(r) === "Low Stock") ? "Low at 1+ location" : "Healthy"}</Pill></span>}
        sub={<><span className="num">{p.sku}</span> · {p.category} · {inr(p.price)} / {p.unit} + {p.gst}% GST</>}
        actions={<><Btn icon={<PackageMinus size={14} />} onClick={() => s.openQuick("transfer")}>Transfer stock</Btn><Btn variant="primary" icon={<ShoppingCart size={14} />} onClick={() => s.openQuick("po")}>Reorder</Btn></>} />

      <div className="grid grid-cols-2 divide-x divide-y divide-line overflow-hidden rounded-[8px] border border-line bg-surface sm:grid-cols-4 lg:grid-cols-8 lg:divide-y-0">
        {kpis.map(([l, v, tone]) => <div key={l} className="p-3.5"><div className="label !text-[10.5px]">{l}</div><div className={cn("num mt-1 text-[19px] font-semibold tracking-tight", tone === "ok" && "text-ok", tone === "bad" && "text-bad")}>{v}</div></div>)}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {rows.map((r) => {
          const a = available(r); const st = stockStatus(r);
          return (
            <Card key={r.wh} title={wname(r.wh)} action={<Pill>{st}</Pill>}>
              <div className="flex items-baseline justify-between"><span className="num text-[26px] font-semibold tracking-tight">{num(r.physical)}</span><span className="text-[12px] text-mute">physical units</span></div>
              <Progress className="mt-2" value={a} max={Math.max(r.physical, r.reorder * 1.5)} tone={st === "Healthy" || st === "Overstock" ? "ok" : st === "Low Stock" ? "warn" : "bad"} />
              <div className="mt-3 grid grid-cols-3 gap-2 text-[12.5px]">
                <KV label="Available"><span className={cn("num font-semibold", st === "Low Stock" && "text-warn")}>{num(a)}</span></KV><KV label="Reserved"><span className="num">{num(r.reserved)}</span></KV><KV label="Min level"><span className="num">{num(r.reorder)}</span></KV>
              </div>
              {st === "Low Stock" && <div className="mt-3 rounded-[6px] bg-warn-soft px-2.5 py-1.5 text-[12px] text-warn">{num(a)} available vs {num(r.reorder)} minimum — {p.sku === "KS-2418-P" ? "estimated stock-out in 6 days" : "replenish soon"}.</div>}
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Tabs tabs={TABS.map((x) => ({ id: x, label: x, count: x === "Orders" ? orders.length : x === "Purchases" ? pos.length : undefined }))} value={tab} onChange={setTab} />
          {tab === "Inventory" && (
            <Card pad={false} title="Stock by location">
              <table className="w-full text-[13px]"><thead><tr className="border-b border-line bg-bg text-left text-[11px] uppercase tracking-[0.04em] text-mute"><th className="px-4 py-2 font-medium">Location</th>{["Physical", "Reserved", "Available", "Packing", "In Transit", "Damaged"].map((h) => <th key={h} className="px-3 text-right font-medium">{h}</th>)}</tr></thead>
                <tbody>
                  {rows.map((r) => <tr key={r.wh} className="border-b border-line"><td className="px-4 py-2.5 font-medium">{wname(r.wh)}</td><td className="num px-3 text-right">{num(r.physical)}</td><td className="num px-3 text-right">{num(r.reserved)}</td><td className="num px-3 text-right font-semibold">{num(available(r))}</td><td className="num px-3 text-right">{num(r.packed)}</td><td className="num px-3 text-right">{num(r.transit)}</td><td className="num px-3 text-right text-bad">{num(r.damaged)}</td></tr>)}
                  <tr className="bg-bg font-semibold"><td className="px-4 py-2.5">All warehouses</td><td className="num px-3 text-right">{num(t("physical"))}</td><td className="num px-3 text-right">{num(t("reserved"))}</td><td className="num px-3 text-right">{num(avail)}</td><td className="num px-3 text-right">{num(t("packed"))}</td><td className="num px-3 text-right">{num(t("transit"))}</td><td className="num px-3 text-right text-bad">{num(t("damaged"))}</td></tr>
                  <tr><td className="px-4 py-2.5 text-mute">Dealer stock (sold, not yet sold-through)</td><td colSpan={6} className="num px-3 text-right text-mute">{num(dealer)}</td></tr>
                </tbody>
              </table>
            </Card>
          )}
          {tab === "Stock Movement" && (
            <Card title="Stock movement ledger" sub="Every unit in and out is traceable to a document" pad={false}>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-[13px]"><thead><tr className="border-b border-line bg-bg text-left text-[11px] uppercase tracking-[0.04em] text-mute"><th className="px-4 py-2 font-medium">When</th><th className="px-3 font-medium">Movement</th><th className="px-3 font-medium">Reference</th><th className="px-3 font-medium">Location</th><th className="px-3 font-medium">By</th><th className="px-3 text-right font-medium">Qty</th><th className="px-4 text-right font-medium">Balance</th></tr></thead>
                  <tbody>{mv.map((m) => <tr key={m.id} className="border-b border-line"><td className="num px-4 py-2 text-mute">{fdt(m.ts)}</td><td className={cn("px-3 font-medium", MV_TONE[m.type])}>{m.type}</td><td className="num px-3">{m.ref.startsWith("ORD") ? <OrderLink id={m.ref} /> : m.ref}</td><td className="px-3 text-mute">{m.wh}</td><td className="px-3 text-mute">{m.user}</td><td className={cn("num px-3 text-right font-medium", m.qty < 0 ? "text-bad" : "text-ok")}>{m.qty > 0 ? "+" : ""}{num(m.qty)}</td><td className="num px-4 text-right">{num(m.balance)}</td></tr>)}</tbody>
                </table>
              </div>
              <div className="p-4 md:hidden"><Timeline steps={steps} /></div>
            </Card>
          )}
          {tab === "Orders" && (
            <Card pad={false} title={`${orders.length} orders include this product`}>
              <ul className="divide-y divide-line text-[13px]">{orders.slice(0, 12).map((o) => <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-2.5"><span><OrderLink id={o.id} /> · <CustLink id={o.custId} /></span><span className="flex items-center gap-3"><span className="num text-mute">{num(o.lines.find((l) => l.sku === p.sku)!.qty)} units · {fdate(o.date)}</span><Pill>{o.status}</Pill></span></li>)}{orders.length === 0 && <li><Empty title="No orders yet" /></li>}</ul>
            </Card>
          )}
          {tab === "Purchases" && (
            <Card pad={false} title="Purchase orders">
              <ul className="divide-y divide-line text-[13px]">{pos.map((po) => <li key={po.id} className="flex items-center justify-between gap-3 px-4 py-2.5"><span><b className="num">{po.id}</b> · {po.supplier}<div className="text-[12px] text-mute">{po.items}</div></span><span className="text-right"><span className="num font-medium">{inr(po.value)}</span><div className="text-[12px] text-mute">ETA {fdate(po.eta)}</div></span></li>)}{pos.length === 0 && <li><Empty title="No open purchase orders" action={<Btn size="sm" variant="primary" onClick={() => s.openQuick("po")}>Create PO</Btn>} /></li>}</ul>
            </Card>
          )}
        </div>
        <div className="space-y-4">
          <Card title="Sales performance" sub="Financial year to date">
            <div className="grid grid-cols-2 gap-4"><KV label="Sales"><span className="num text-[18px] font-semibold">{lakh(p.sales)}</span></KV><KV label="Units"><span className="num text-[18px] font-semibold">{num(p.units)}</span></KV><KV label="Growth"><Delta v={p.growth} /></KV><KV label="Margin"><span className="num font-semibold">{p.margin}%</span></KV><KV label="Cost / unit"><span className="num">{inr(p.cost)}</span></KV><KV label="Selling price"><span className="num">{inr(p.price)}</span></KV></div>
          </Card>
          <Card title="Connected" pad={false}><ul className="divide-y divide-line text-[13px]"><li><a href="/inventory" className="flex items-center justify-between px-4 py-2.5 hover:bg-bg">Inventory by warehouse<ArrowRight size={13} className="text-faint" /></a></li><li><a href="/purchase" className="flex items-center justify-between px-4 py-2.5 hover:bg-bg">Purchases & suppliers<ArrowRight size={13} className="text-faint" /></a></li><li><a href="/reports?r=products" className="flex items-center justify-between px-4 py-2.5 hover:bg-bg">Product performance report<ArrowRight size={13} className="text-faint" /></a></li></ul></Card>
        </div>
      </div>
    </div>
  );
}
