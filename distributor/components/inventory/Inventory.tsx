"use client";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Btn, PageHeader, Pill, Progress, cn } from "@/components/ui/ui";
import { DataTable, type Col } from "@/components/ui/table";
import { ProdLink } from "@/components/ui/links";
import { CATEGORIES, PRODUCTS, WAREHOUSES, prodBySku } from "@/data/core";
import { STOCK, available, stockStatus } from "@/data/ops";
import { lakh, num } from "@/lib/format";
import type { StockRow } from "@/types";

export function Inventory() {
  const router = useRouter();
  const { warehouse, openQuick } = useStore();
  const rows = STOCK.filter((s) => warehouse === "ALL" || s.wh === warehouse);
  const sum = (k: keyof StockRow) => rows.reduce((a, s) => a + (s[k] as number), 0);
  const value = rows.reduce((a, s) => a + s.physical * prodBySku(s.sku)!.cost, 0);
  const low = rows.filter((s) => stockStatus(s) === "Low Stock").length;
  const out = rows.filter((s) => stockStatus(s) === "Out of Stock").length;
  const whLabel = (id: string) => WAREHOUSES.find((w) => w.id === id)!.name.replace(" Warehouse", "").replace("Central ", "");
  const metrics: [string, string, string?][] = [["Total SKUs", warehouse === "ALL" ? "620" : "482"], ["Inventory Value", lakh(warehouse === "ALL" ? 2.18e7 : value)], ["Low Stock Products", String(low), "warn"], ["Out of Stock", String(out), out ? "bad" : ""], ["Reserved Stock", num(sum("reserved"))], ["In Transit Stock", num(sum("transit"))], ["Damaged Stock", num(sum("damaged")), "bad"]];
  const cols: Col<StockRow>[] = [
    { key: "name", header: "Product", get: (s) => prodBySku(s.sku)!.name, render: (s) => <ProdLink id={prodBySku(s.sku)!.id}>{prodBySku(s.sku)!.name}</ProdLink> },
    { key: "sku", header: "SKU", muted: true, render: (s) => <span className="num">{s.sku}</span> },
    { key: "cat", header: "Category", get: (s) => prodBySku(s.sku)!.category, muted: true },
    { key: "wh", header: "Warehouse", get: (s) => whLabel(s.wh) },
    { key: "physical", header: "Physical Stock", align: "right", render: (s) => num(s.physical) },
    { key: "avail", header: "Available", align: "right", get: (s) => available(s), render: (s) => <b>{num(available(s))}</b> },
    { key: "reserved", header: "Reserved", align: "right", render: (s) => num(s.reserved) },
    { key: "packed", header: "Packed", align: "right", render: (s) => num(s.packed) },
    { key: "transit", header: "In Transit", align: "right", render: (s) => num(s.transit) },
    { key: "damaged", header: "Damaged", align: "right", render: (s) => <span className={s.damaged ? "text-bad" : "text-faint"}>{num(s.damaged)}</span> },
    { key: "reorder", header: "Reorder Level", align: "right", render: (s) => num(s.reorder) },
    { key: "level", header: "Cover", sortable: false, get: (s) => available(s) / s.reorder, render: (s) => <div className="w-[70px]"><Progress value={available(s)} max={s.reorder * 2} tone={stockStatus(s) === "Healthy" || stockStatus(s) === "Overstock" ? "ok" : stockStatus(s) === "Low Stock" ? "warn" : "bad"} /></div> },
    { key: "status", header: "Stock Status", get: (s) => stockStatus(s), render: (s) => <Pill>{stockStatus(s)}</Pill> },
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Inventory" sub="Physical, reserved, packed and in-transit stock — by product and warehouse." actions={<><Btn onClick={() => openQuick("transfer")}>Stock transfer</Btn><Btn variant="primary" onClick={() => openQuick("po")}>Create purchase order</Btn></>} />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-7">
        {metrics.map(([l, v, t]) => <div key={l} className="rounded-[8px] border border-line bg-surface p-3"><div className="label !text-[10.5px]">{l}</div><div className={cn("num mt-1 text-[21px] font-semibold tracking-tight", t === "warn" && "text-warn", t === "bad" && "text-bad")}>{v}</div></div>)}
      </div>
      <DataTable rows={rows} cols={cols} rowKey={(s) => s.sku + s.wh} pageSize={12} searchPlaceholder="Search product or SKU…" exportName="inventory" defaultSort={{ key: "level", dir: "asc" }}
        onRowClick={(s) => router.push(`/products/${prodBySku(s.sku)!.id}`)}
        filters={[
          { key: "st", label: "Status", options: ["Healthy", "Low Stock", "Out of Stock", "Overstock"], match: (s, v) => stockStatus(s) === v },
          { key: "cat", label: "Category", options: CATEGORIES, match: (s, v) => prodBySku(s.sku)!.category === v },
          { key: "wh", label: "Warehouse", options: WAREHOUSES.map((w) => whLabel(w.id)), match: (s, v) => whLabel(s.wh) === v },
        ]} />
      <span className="hidden">{PRODUCTS.length}</span>
    </div>
  );
}
