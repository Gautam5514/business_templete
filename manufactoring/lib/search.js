import { MATERIALS, SUPPLIERS, MACHINES, EMPLOYEES, PRODUCTS, CUSTOMERS } from "@/data/masters";
import { BATCHES } from "@/data/orders";
import { POS, FG_BATCHES } from "@/data/ops";
import { INVOICES } from "@/data/finance";
import { fdate } from "./format";

const has = (q, ...f) => f.some((x) => String(x).toLowerCase().includes(q));

export function search(raw, s) {
  const q = raw.trim().toLowerCase();
  if (!q) return {};
  const out = {};
  const add = (g, item) => { (out[g] ||= []).push(item); };
  s.wos.forEach((w) => has(q, w.id, w.product, w.line, w.supervisor, w.so) && add("Work Orders", { title: `${w.id} · ${w.product}`, sub: `${w.status} · ${w.produced.toLocaleString("en-IN")}/${w.planned.toLocaleString("en-IN")} · ${w.line}`, href: `/production/${w.id}` }));
  s.sales.forEach((o) => has(q, o.id, o.customer, o.product) && add("Sales Orders", { title: `${o.id} · ${o.customer}`, sub: `${o.product} · ${o.qty.toLocaleString("en-IN")} units · ${o.status}`, href: "/orders" }));
  PRODUCTS.forEach((p) => has(q, p.name, p.sku, p.model) && add("Products", { title: p.name, sub: `${p.sku} · ${p.model}`, href: "/finished-goods" }));
  MATERIALS.forEach((m) => has(q, m.name, m.code) && add("Raw Materials", { title: `${m.name}`, sub: `${m.code} · ${m.cur.toLocaleString("en-IN")} ${m.unit} · ${m.status}`, href: "/raw-materials" }));
  SUPPLIERS.forEach((x) => has(q, x.name, x.id) && add("Suppliers", { title: x.name, sub: `${x.city} · quality ${x.quality}%`, href: `/suppliers/${x.id}` }));
  MACHINES.forEach((m) => has(q, m.id, m.name) && add("Machines", { title: m.name, sub: `${m.status} · ${m.plant} · ${m.line}`, href: `/machines/${m.id}` }));
  EMPLOYEES.forEach((e) => has(q, e.name, e.role) && add("Employees", { title: e.name, sub: `${e.role} · ${e.plant}`, href: "/employees" }));
  CUSTOMERS.forEach((c) => has(q, c.name, c.id) && add("Customers", { title: c.name, sub: `${c.city}, ${c.state}`, href: `/customers/${c.id}` }));
  INVOICES.forEach((i) => has(q, i.id, i.customer) && add("Invoices", { title: `${i.id} · ${i.customer}`, sub: `${i.status} · due ${fdate(i.due)}`, href: "/invoices" }));
  BATCHES.forEach((b) => has(q, b.id, b.material) && add("RM Batches", { title: b.id, sub: `${b.material} · ${b.supplier}`, href: "/raw-materials?tab=batches" }));
  FG_BATCHES.forEach((b) => has(q, b.id, b.product) && add("Finished Batches", { title: b.id, sub: `${b.product} · ${b.qty} units · ${b.wo}`, href: `/finished-goods/${b.id}` }));
  POS.forEach((p) => has(q, p.id, p.supplier, p.material) && add("Purchase Orders", { title: `${p.id} · ${p.supplier}`, sub: `${p.material} · ${p.status}`, href: "/purchase?tab=po" }));
  s.qcs.forEach((x) => has(q, x.id, x.batch, x.ref) && add("QC Inspections", { title: `${x.id} · ${x.product}`, sub: `${x.inspected} inspected · ${x.rejected} rejected`, href: `/quality/${x.id}` }));
  return out;
}

/** connected records for an exact work-order id */
export function connected(raw, s) {
  const w = s.wos.find((x) => x.id.toLowerCase() === raw.trim().toLowerCase());
  if (!w) return null;
  const q = s.qcs.find((x) => x.ref === w.id);
  const fg = FG_BATCHES.find((b) => b.wo === w.id);
  const rm = fg?.rmBatch ?? (w.id === "WO-2841" ? "SS304S-250926-C" : null);
  return [
    ["Work Order", `${w.id} · ${w.product}`, `/production/${w.id}`],
    ["Customer Order", `${w.so} · ${w.customer}`, "/orders"],
    ["Product", w.product, "/finished-goods"],
    rm && ["Raw Material Batch", rm, "/raw-materials?tab=batches"],
    fg && ["Machine", fg.machine, `/machines/${fg.machine}`],
    q && ["QC Inspection", `${q.id} · ${q.rejected} rejected`, `/quality/${q.id}`],
    fg && ["Finished Batch", `${fg.id} · ${fg.qty} units`, `/finished-goods/${fg.id}`],
  ].filter(Boolean);
}
