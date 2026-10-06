import type { Customer, Dispatch, Invoice, Order, Payment } from "@/types";
import { EMPLOYEES, PRODUCTS, custName } from "@/data/core";

export type Hit = { group: string; title: string; sub: string; href: string };
export function search(q: string, d: { customers: Customer[]; orders: Order[]; invoices: Invoice[]; payments: Payment[]; dispatches: Dispatch[] }): Record<string, Hit[]> {
  const s = q.trim().toLowerCase();
  const out: Record<string, Hit[]> = {};
  if (!s) return out;
  const add = (g: string, h: Hit, hay: string) => { if (hay.toLowerCase().includes(s)) (out[g] ??= []).push(h); };
  d.customers.forEach((c) => add("Customers", { group: "Customers", title: c.name, sub: `${c.code} · ${c.city} · ${c.segment}`, href: `/customers/${c.id}` }, `${c.name} ${c.code} ${c.city}`));
  d.orders.forEach((o) => add("Orders", { group: "Orders", title: o.id, sub: `${custName(o.custId)} · ${o.status}`, href: `/orders/${o.id}` }, `${o.id} ${custName(o.custId)}`));
  PRODUCTS.forEach((p) => add("Products", { group: "Products", title: p.name, sub: `${p.sku} · ${p.category}`, href: `/products/${p.id}` }, `${p.name} ${p.sku} ${p.category}`));
  d.invoices.forEach((i) => add("Invoices", { group: "Invoices", title: i.id, sub: `${custName(i.custId)} · ${i.status}`, href: `/invoices/${i.id}` }, `${i.id} ${custName(i.custId)}`));
  d.payments.forEach((p) => add("Payments", { group: "Payments", title: p.id, sub: `${custName(p.custId)} · ${p.method}`, href: `/payments` }, `${p.id} ${custName(p.custId)} ${p.ref}`));
  d.dispatches.forEach((x) => add("Dispatches", { group: "Dispatches", title: x.id, sub: `${custName(x.custId)} · ${x.status}`, href: `/dispatch/${x.id}` }, `${x.id} ${custName(x.custId)} ${x.vehicle}`));
  EMPLOYEES.forEach((e) => add("Employees", { group: "Employees", title: e.name, sub: `${e.role} · ${e.location}`, href: `/employees?q=${encodeURIComponent(e.name)}` }, `${e.name} ${e.role}`));
  return out;
}
