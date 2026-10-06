"use client";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Delta, PageHeader, Pill } from "@/components/ui/ui";
import { DataTable, type Col } from "@/components/ui/table";
import { ProdLink } from "@/components/ui/links";
import { CATEGORIES, PRODUCTS } from "@/data/core";
import { STOCK, available } from "@/data/ops";
import { inr, lakh, num } from "@/lib/format";
import type { Product } from "@/types";

export function Products() {
  const router = useRouter();
  const { warehouse } = useStore();
  const stock = (sku: string) => STOCK.filter((s) => s.sku === sku && (warehouse === "ALL" || s.wh === warehouse));
  const cols: Col<Product>[] = [
    { key: "name", header: "Product", render: (p) => <ProdLink id={p.id}>{p.name}</ProdLink> },
    { key: "sku", header: "SKU", muted: true, render: (p) => <span className="num">{p.sku}</span> },
    { key: "category", header: "Category", muted: true },
    { key: "price", header: "Price", align: "right", render: (p) => `${inr(p.price)} / ${p.unit}` },
    { key: "gst", header: "GST", align: "right", render: (p) => `${p.gst}%` },
    { key: "avail", header: "Available", align: "right", get: (p) => stock(p.sku).reduce((a, s) => a + available(s), 0), render: (p) => num(stock(p.sku).reduce((a, s) => a + available(s), 0)) },
    { key: "status", header: "Stock", get: (p) => (stock(p.sku).some((s) => available(s) < s.reorder) ? "Low Stock" : "Healthy"), render: (p) => <Pill>{stock(p.sku).some((s) => available(s) < s.reorder) ? "Low Stock" : "Healthy"}</Pill> },
    { key: "units", header: "Units sold", align: "right", render: (p) => num(p.units) },
    { key: "sales", header: "Sales", align: "right", render: (p) => lakh(p.sales) },
    { key: "margin", header: "Margin", align: "right", render: (p) => `${p.margin}%` },
    { key: "growth", header: "Growth", align: "right", get: (p) => p.growth, render: (p) => <Delta v={p.growth} /> },
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Products" sub={`620 active SKUs across ${CATEGORIES.length} categories · ${PRODUCTS.length} fast-moving lines shown`} />
      <DataTable rows={PRODUCTS} cols={cols} rowKey={(p) => p.id} pageSize={12} searchPlaceholder="Search product, SKU, category…" exportName="products" onRowClick={(p) => router.push(`/products/${p.id}`)}
        filters={[{ key: "cat", label: "Category", options: CATEGORIES, match: (p, v) => p.category === v }, { key: "st", label: "Stock", options: ["Low Stock", "Healthy"], match: (p, v) => (stock(p.sku).some((s) => available(s) < s.reorder) ? "Low Stock" : "Healthy") === v }]} />
    </div>
  );
}
