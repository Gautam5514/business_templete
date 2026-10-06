"use client";
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { Btn, Card, PageHeader, Pill } from "@/components/ui/ui";
import { DataTable, type Col, type Filter } from "@/components/ui/table";
import { CustLink, OrderLink } from "@/components/ui/links";
import { custName, prodBySku, SALES_REPS, WAREHOUSES } from "@/data/core";
import { fdate, inr, num, NOW } from "@/lib/format";
import { NEXT_LABEL } from "@/lib/journey";
import type { Order, OrderStatus } from "@/types";
import { lineTotal } from "@/data/ops";
import { cn } from "@/components/ui/ui";

const STATUSES: OrderStatus[] = ["Draft", "Pending Approval", "Approved", "Stock Allocated", "Packing", "Ready", "Dispatched", "In Transit", "Delivered", "Partially Delivered", "Cancelled"];
const GROUPS: Record<string, OrderStatus[]> = {
  Open: ["Draft", "Pending Approval", "Approved", "Stock Allocated", "Packing", "Ready", "Dispatched", "In Transit", "Partially Delivered"],
  Processing: ["Approved", "Stock Allocated", "Packing", "Ready"],
  Dispatched: ["Dispatched", "In Transit"],
  Delivered: ["Delivered", "Partially Delivered"],
  Cancelled: ["Cancelled"],
};

export function OrdersList() {
  const { orders, invoices, advanceOrder, setOrderStatus, warehouse, toast } = useStore();
  const router = useRouter();
  const sp = useSearchParams();
  const group = sp.get("group") ?? "";
  const status = sp.get("status") ?? "";
  const invOf = useMemo(() => new Map(invoices.map((i) => [i.orderId, i])), [invoices]);

  const base = orders.filter((o) => warehouse === "ALL" || o.wh === warehouse);
  const scoped = group && GROUPS[group] ? base.filter((o) => GROUPS[group].includes(o.status)) : base;
  const rows = status ? scoped.filter((o) => o.status === status) : scoped;
  const count = (g: string) => base.filter((o) => GROUPS[g].includes(o.status)).length;
  const setQ = (k: string, v: string) => router.replace(v ? `/orders?${k}=${encodeURIComponent(v)}` : "/orders");

  const payStatus = (o: Order) => { const i = invOf.get(o.id); return i ? i.status : "Not invoiced"; };
  const stats: [string, number, string][] = [["Total Orders", base.length, ""], ["Open", count("Open"), "Open"], ["Processing", count("Processing"), "Processing"], ["Dispatched", count("Dispatched"), "Dispatched"], ["Delivered", count("Delivered"), "Delivered"], ["Cancelled", count("Cancelled"), "Cancelled"]];

  const cols: Col<Order>[] = [
    { key: "id", header: "Order ID", render: (o) => <OrderLink id={o.id} /> },
    { key: "cust", header: "Customer", get: (o) => custName(o.custId), render: (o) => <CustLink id={o.custId} /> },
    { key: "city", header: "City" },
    { key: "rep", header: "Salesperson", muted: true },
    { key: "items", header: "Items", align: "right" },
    { key: "qty", header: "Quantity", align: "right", render: (o) => num(o.qty) },
    { key: "value", header: "Order Value", align: "right", render: (o) => <b className="font-semibold">{inr(o.value)}</b> },
    { key: "stock", header: "Stock Status", render: (o) => <Pill>{o.stock}</Pill> },
    { key: "terms", header: "Payment Terms", muted: true, defaultHidden: true },
    { key: "date", header: "Order Date", get: (o) => o.date, render: (o) => <span className="num text-mute">{fdate(o.date)}</span> },
    { key: "exp", header: "Expected Dispatch", get: (o) => o.expDispatch, render: (o) => { const late = new Date(o.expDispatch) < NOW && ["Draft", "Pending Approval", "Approved", "Stock Allocated", "Packing"].includes(o.status); return <span className={cn("num", late ? "font-medium text-bad" : "text-mute")}>{fdate(o.expDispatch)}{late && " · late"}</span>; } },
    { key: "status", header: "Status", render: (o) => <Pill>{o.status}</Pill> },
    {
      key: "actions", header: "Actions", sortable: false, align: "right",
      render: (o) => (
        <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {NEXT_LABEL[o.status] && <Btn size="xs" variant="secondary" onClick={() => advanceOrder(o.id)} title={NEXT_LABEL[o.status]}>{NEXT_LABEL[o.status].split(" (")[0]}</Btn>}
          <Btn size="xs" variant="ghost" href={`/orders/${o.id}`} icon={<ChevronRight size={14} />} title="Open" />
        </div>
      ),
    },
  ];
  const filters: Filter<Order>[] = [
    { key: "status", label: "Status", options: STATUSES, match: (o, v) => o.status === v },
    { key: "cust", label: "Customer", options: Array.from(new Set(orders.map((o) => custName(o.custId)))).sort(), match: (o, v) => custName(o.custId) === v },
    { key: "city", label: "City", options: Array.from(new Set(orders.map((o) => o.city))).sort(), match: (o, v) => o.city === v },
    { key: "rep", label: "Salesperson", options: SALES_REPS, match: (o, v) => o.rep === v },
    { key: "wh", label: "Warehouse", options: WAREHOUSES.map((w) => w.name), match: (o, v) => WAREHOUSES.find((w) => w.name === v)?.id === o.wh },
    { key: "pay", label: "Payment", options: ["Paid", "Partially Paid", "Unpaid", "Overdue", "Not invoiced"], match: (o, v) => payStatus(o) === v },
    { key: "date", label: "Date", options: ["Today", "Last 7 days", "Last 30 days", "Older"], match: (o, v) => { const d = (NOW.getTime() - new Date(o.date).getTime()) / 864e5; return v === "Today" ? d < 1 : v === "Last 7 days" ? d < 7 : v === "Last 30 days" ? d < 30 : d >= 30; } },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Sales Orders" sub="From dealer order to delivery — every order, every status, one list." actions={<Btn variant="primary" icon={<Plus size={15} />} href="/orders/new">Create Sales Order</Btn>} />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map(([l, v, g]) => {
          const on = (g || "") === group && !status;
          return (
            <button key={l} onClick={() => setQ("group", g)} className={cn("rounded-[8px] border bg-surface p-3 text-left transition-colors hover:border-line-strong", on ? "border-accent ring-1 ring-accent/30" : "border-line")}>
              <div className="label">{l}</div><div className="num mt-1 text-[22px] font-semibold tracking-tight">{v}</div>
            </button>
          );
        })}
      </div>
      {(group || status) && (
        <div className="flex items-center gap-2 text-[12.5px] text-mute">Showing <Pill tone="accent" dot={false}>{status || group}</Pill> orders<button className="text-accent hover:underline" onClick={() => router.replace("/orders")}>Reset</button></div>
      )}
      <DataTable
        key={`${group}-${status}`}
        rows={rows} cols={cols} rowKey={(o) => o.id} searchPlaceholder="Search order, customer, city…" filters={filters} selectable pageSize={12} defaultSort={{ key: "date", dir: "desc" }}
        onRowClick={(o) => router.push(`/orders/${o.id}`)} exportName="sales-orders"
        searchText={(o) => `${o.id} ${custName(o.custId)} ${o.city} ${o.rep} ${o.status}`}
        bulkActions={(sel, clear) => (
          <Btn size="xs" variant="primary" onClick={() => { const p = sel.filter((o) => o.status === "Pending Approval"); p.forEach((o) => setOrderStatus(o.id, "Approved")); if (!p.length) toast("No selected orders are pending approval", "info"); clear(); }}>Approve selected</Btn>
        )}
        expand={(o) => (
          <div className="grid gap-x-8 gap-y-1 text-[12.5px] sm:grid-cols-2 lg:grid-cols-3">
            {o.lines.map((l) => <div key={l.sku} className="flex justify-between gap-3 border-b border-line py-1"><span className="truncate">{prodBySku(l.sku)?.name}</span><span className="num shrink-0 text-mute">{num(l.qty)} × {inr(l.price)} = <b className="text-ink">{inr(lineTotal(l))}</b></span></div>)}
          </div>
        )}
      />
      <Card pad className="hidden"><span /></Card>
    </div>
  );
}
