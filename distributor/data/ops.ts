import type { Dispatch, DispatchStatus, Invoice, InvStatus, Line, Order, OrderStatus, PayMethod, Payment, Shipment, ShipStatus, StockRow, WhId } from "@/types";
import { CITIES, CUSTOMERS, PRODUCTS, between, custById, pick, prodBySku, rng } from "./core";
import { NOW, addDays, iso } from "@/lib/format";

export const lineTotal = (l: Line) => Math.round(l.qty * l.price * (1 - l.disc / 100) * (1 + l.gst / 100));
export const lineTaxable = (l: Line) => l.qty * l.price * (1 - l.disc / 100);
export const lineDiscount = (l: Line) => l.qty * l.price * (l.disc / 100);
export const sumLines = (ls: Line[]) => ls.reduce((a, l) => a + lineTotal(l), 0);

/* ---------------- Stock ---------------- */
export const STOCK: StockRow[] = (() => {
  const r = rng(9001);
  const rows: StockRow[] = [];
  for (const p of PRODUCTS) {
    for (const wh of ["RNC", "DHN", "PAT"] as WhId[]) {
      if (p.sku === "KS-2418-P") continue;
      const base = p.price > 6000 ? 90 : p.price > 2000 ? 220 : p.price > 700 ? 520 : p.price > 200 ? 1400 : 3600;
      const share = wh === "RNC" ? 1.25 : wh === "DHN" ? 0.85 : 0.9;
      const physical = Math.round(base * share * (0.4 + r() * 1.3));
      const reserved = Math.round(physical * (0.08 + r() * 0.3));
      const packed = Math.round(physical * (0.02 + r() * 0.08));
      const transit = Math.round(physical * (0.04 + r() * 0.2));
      const damaged = r() < 0.55 ? Math.round(physical * r() * 0.012) : 0;
      let reorder = Math.round(physical * (0.14 + r() * 0.14));
      if (r() < 0.14) reorder = Math.round(physical * 0.9);
      rows.push({ sku: p.sku, wh, physical, reserved, packed, transit, damaged, reorder });
    }
  }
  const total = rows.reduce((a, s) => a + s.physical * (PRODUCTS.find((p) => p.sku === s.sku)!.cost), 0);
  const k = (2.18e7 - 1420 * 0.78 * 1185) / total; // aim ~2.18 Cr overall
  rows.forEach((s) => {
    for (const f of ["physical", "reserved", "packed", "transit", "damaged", "reorder"] as const) s[f] = Math.round(s[f] * k);
  });
  const ks: [WhId, number, number, number, number, number][] = [
    ["RNC", 640, 180, 90, 390, 6], ["DHN", 380, 196, 50, 260, 5], ["PAT", 400, 44, 40, 130, 3],
  ];
  [...ks].reverse().forEach(([wh, physical, reserved, packed, transit, damaged]) =>
    rows.unshift({ sku: "KS-2418-P", wh, physical, reserved, packed, transit, damaged, reorder: 300 }),
  );
  return rows;
})();
export const available = (s: StockRow) => Math.max(0, s.physical - s.reserved);
export type StockStatus = "Out of Stock" | "Low Stock" | "Healthy" | "Overstock";
export const stockStatus = (s: StockRow): StockStatus => {
  const a = available(s);
  return a <= 0 ? "Out of Stock" : a < s.reorder ? "Low Stock" : a > s.reorder * 4 ? "Overstock" : "Healthy";
};
export const stockOf = (sku: string) => STOCK.filter((s) => s.sku === sku);

/* ---------------- Orders ---------------- */
function fit(fixed: [string, number][], vars: [string, string], units: number, target: number, baseFreight: number, disc = 0) {
  const mk = (sku: string, qty: number): Line => {
    const p = prodBySku(sku)!;
    return { sku, qty, price: p.price, disc, gst: p.gst };
  };
  const unitTotal = (sku: string) => {
    const p = prodBySku(sku)!;
    return p.price * (1 - disc / 100) * (1 + p.gst / 100);
  };
  const fl = fixed.map(([s, q]) => mk(s, q));
  const fixedUnits = fixed.reduce((a, [, q]) => a + q, 0);
  const U = units - fixedUnits;
  const V = target - baseFreight - sumLines(fl);
  const ua = unitTotal(vars[0]);
  const ub = unitTotal(vars[1]);
  const qa = Math.max(1, Math.round((V - ub * U) / (ua - ub)));
  const lines = [...fl, mk(vars[0], qa), mk(vars[1], U - qa)];
  return { lines, freight: target - sumLines(lines) };
}

const FIX_1047: [string, number][] = [["PV-CP-1", 400], ["LD-PN-18", 150], ["AD-TA-5", 300]];
const VAR_1047: [string, string] = ["ES-MS-6A", "BF-BM-CH"];
const TERMS = ["Net 15", "Net 30", "Net 30", "Net 45", "50% Advance", "Cash on Delivery"];
const termDays = (t: string) => (t === "Net 15" ? 15 : t === "Net 30" ? 30 : t === "Net 45" ? 45 : t === "50% Advance" ? 7 : 0);
const OPEN: OrderStatus[][] = [
  ["Draft", "Pending Approval", "Pending Approval"],
  ["Approved", "Stock Allocated", "Stock Allocated"],
  ["Packing", "Ready", "Packing"],
  ["Dispatched", "In Transit", "In Transit"],
  ["In Transit", "Partially Delivered", "Approved"],
];

export const ORDERS: Order[] = (() => {
  const r = rng(2024);
  const N = 140;
  // choose which of indices 3..N-1 stay open (60 more -> 63 total with the first two)
  const idx = Array.from({ length: 95 }, (_, i) => i + 3).filter((i) => ![68, 75, 82, 7].includes(i));
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const openSet = new Set(idx.slice(0, 60).sort((a, b) => a - b));
  const openRank = new Map<number, number>();
  [0, 1, ...Array.from(openSet)].forEach((v, k) => openRank.set(v, k));
  const weights = CUSTOMERS.map((c) => Math.max(0.4, c.totalSales / 1e6));
  const wsum = weights.reduce((a, b) => a + b, 0);
  const pickCust = () => {
    let x = r() * wsum;
    for (let i = 0; i < CUSTOMERS.length; i++) if ((x -= weights[i]) <= 0) return CUSTOMERS[i];
    return CUSTOMERS[0];
  };
  const out: Order[] = [];
  for (let i = 0; i < N; i++) {
    const n = 1048 - i;
    const date = addDays(NOW, -Math.round(i * 0.9));
    date.setHours(9 + (i % 8), (i * 17) % 60, 0, 0);
    let cust = pickCust();
    let status: OrderStatus;
    if (i === 0) status = "Stock Allocated";
    else if (i === 1) status = "In Transit";
    else if (i === 2) status = "Delivered";
    else if (openSet.has(i)) {
      const rank = (openRank.get(i) ?? 0) / 63;
      const bucket = OPEN[Math.min(4, Math.floor(rank * 5))];
      status = bucket[Math.floor(r() * bucket.length)];
    } else status = i % 13 === 0 ? "Cancelled" : "Delivered";
    if (i === 7) status = "Partially Delivered";
    if ([68, 75, 82].includes(i)) status = "Delivered";

    let lines: Line[];
    let freight: number;
    let ovr: { cust?: string; wh?: WhId } = {};
    const terms = pick(r, TERMS);
    if (n === 1048) {
      cust = custById("agarwal-traders")!;
      ({ lines, freight } = fit([["ES-MS-6A", 420], ["LD-PN-12", 160]], ["AD-TA-5", "BF-BM-CH"], 1240, 384500, 5200, 2));
    } else if (n === 1047) {
      cust = custById("sharma-hardware")!;
      ovr.wh = "RNC";
      ({ lines, freight } = fit(FIX_1047, VAR_1047, 2180, 742800, 6400, 0));
    } else if (n === 1046) {
      cust = custById("gupta-sanitary-house")!;
      ({ lines, freight } = fit([["HW-HG-4", 200]], ["PV-CP-075", "BF-PC-15"], 620, 216400, 3200, 0));
    } else if (n === 1041) {
      cust = custById("jaiswal-enterprises")!;
      ({ lines, freight } = fit([["WT-300", 6]], ["KS-1816-S", "SW-WB-PD"], 140, 186500, 4100, 0));
    } else if (n === 980) {
      cust = custById("sharma-hardware")!;
      ({ lines, freight } = fit([], ["WR-CU-25", "ES-MCB-32"], 210, 475000, 6000, 0));
    } else if (n === 973) {
      cust = custById("maa-traders")!;
      ({ lines, freight } = fit([], ["AD-TA-20", "PV-SW-110"], 300, 196000, 3500, 0));
    } else if (n === 966) {
      cust = custById("gupta-enterprises")!;
      ({ lines, freight } = fit([], ["WT-500", "LD-PN-18"], 190, 282000, 4500, 0));
    } else {
      const k = between(r, 2, 6);
      const skus = new Set<string>();
      while (skus.size < k) skus.add(pick(r, PRODUCTS).sku);
      lines = Array.from(skus).map((sku) => {
        const p = prodBySku(sku)!;
        const qty = p.price > 6000 ? between(r, 4, 24) : p.price > 2000 ? between(r, 10, 60) : p.price > 700 ? between(r, 20, 160) : p.price > 200 ? between(r, 40, 400) : between(r, 100, 900);
        return { sku, qty, price: p.price, disc: pick(r, [0, 0, 1, 2, 2.5, 3, 5]), gst: p.gst };
      });
      freight = Math.round((between(r, 25, 70) * lines.reduce((a, l) => a + l.qty, 0)) / 10) * 10;
    }
    const qty = lines.reduce((a, l) => a + l.qty, 0);
    const value = sumLines(lines) + freight;
    const wh = ovr.wh ?? CITIES[cust.city].wh;
    const stage = ["Draft", "Pending Approval", "Approved", "Stock Allocated", "Packing", "Ready", "Dispatched", "In Transit", "Delivered", "Partially Delivered"].indexOf(status);
    const allocated = status === "Cancelled" ? 0 : stage >= 3 ? qty : 0;
    let packed = stage >= 5 || stage >= 8 ? qty : status === "Packing" ? Math.round(qty * 0.55) : 0;
    let dispatched = stage >= 6 ? qty : 0;
    let delivered = status === "Delivered" ? qty : status === "Partially Delivered" ? Math.round(qty * 0.82) : 0;
    let alloc = allocated;
    if (n === 1047) { packed = 2150; dispatched = 2150; delivered = 0; alloc = 2180; }
    if (n === 1048) { alloc = 760; }
    if (n === 1041) delivered = qty - 20;
    const stockSt: Order["stock"] = n === 1048 ? "Partial Stock" : stage < 3 && r() < 0.3 ? (r() < 0.3 ? "Out of Stock" : "Partial Stock") : "Available";
    const exp = addDays(date, 2 + (i % 3));
    const fixed: Record<number, string> = { 1048: "2026-10-06T10:42:00", 1047: "2026-10-04T10:50:00", 1046: "2026-10-04T09:15:00" };
    const dateIso = fixed[n] ?? iso(date);
    out.push({
      id: `ORD-${String(n).padStart(4, "0")}`, custId: cust.id, city: cust.city, rep: cust.rep, lines, freight, items: lines.length, qty,
      value, stock: stockSt, terms: n === 1047 || n === 1048 ? "Net 30" : terms, date: dateIso, expDispatch: iso(exp),
      status, wh, allocated: alloc, packed, dispatched, delivered,
      invoiceId: stage >= 5 || status === "Partially Delivered" ? `INV-${n + 1894}` : undefined,
      dispatchId: stage >= 3 && status !== "Cancelled" ? `DSP-${n + 1787}` : undefined,
    });
  }
  return out;
})();
export const orderById = (id: string) => ORDERS.find((o) => o.id === id);

/* ---------------- Invoices + payments ---------------- */
function buildInvoice(o: Order, r: () => number): Invoice {
  const n = Number(o.id.slice(4));
  let lines = o.lines;
  let freight = o.freight;
  let total = o.value;
  if (n === 1047) {
    const f = fit(FIX_1047, VAR_1047, 2150, 731200, 4800, 0);
    lines = f.lines; freight = f.freight; total = 731200;
  }
  const date = new Date(o.date);
  if (n === 1047) { date.setDate(6); date.setMonth(9); date.setHours(16, 5); }
  else date.setDate(date.getDate() + 1);
  const days = n === 980 ? 30 : termDays(o.terms);
  const due = addDays(date, days);
  const age = Math.round((NOW.getTime() - date.getTime()) / 864e5);
  let paid = 0;
  if (n === 1047) paid = 200000;
  else if (n === 980 || n === 973 || n === 966) paid = 0;
  else if (o.status === "Delivered" || o.status === "Partially Delivered" || o.status === "In Transit" || o.status === "Dispatched" || o.status === "Ready") {
    const x = r();
    if (age > 45) paid = x < 0.9 ? total : x < 0.96 ? Math.round((total * 0.5) / 1000) * 1000 : 0;
    else if (age > 15) paid = x < 0.6 ? total : x < 0.8 ? Math.round((total * 0.4) / 1000) * 1000 : 0;
    else paid = x < 0.25 ? total : x < 0.4 ? Math.round((total * 0.5) / 1000) * 1000 : 0;
  }
  const balance = total - paid;
  const status: InvStatus = balance === 0 ? "Paid" : due < NOW ? "Overdue" : paid > 0 ? "Partially Paid" : "Unpaid";
  const taxable = Math.round(lines.reduce((a, l) => a + lineTaxable(l), 0));
  const discount = Math.round(lines.reduce((a, l) => a + lineDiscount(l), 0));
  const gst = total - freight - taxable;
  return {
    id: o.invoiceId!, orderId: o.id, custId: o.custId, date: iso(date), due: iso(due), lines, freight, taxable, gst, discount, total,
    paid, balance, status, shipmentId: `SHP-${n - 649}`,
  };
}
export const INVOICES: Invoice[] = (() => {
  const r = rng(515);
  const inv = ORDERS.filter((o) => o.invoiceId).map((o) => buildInvoice(o, r));
  // Sharma's 31-day overdue invoice relates to ORD-0980 (due 05 Sep)
  const s = inv.find((i) => i.orderId === "ORD-0980");
  if (s) { s.date = "2026-08-06T11:20:00"; s.due = "2026-09-05T00:00:00"; s.status = "Overdue"; }
  const fixDue = (order: string, d: string, due: string) => { const v = inv.find((i) => i.orderId === order); if (v) { v.date = d; v.due = due; v.status = "Overdue"; } };
  fixDue("ORD-0973", "2026-07-30T10:40:00", "2026-08-29T00:00:00");
  fixDue("ORD-0966", "2026-07-24T12:10:00", "2026-08-23T00:00:00");
  return inv;
})();
export const invById = (id: string) => INVOICES.find((i) => i.id === id);

const METHODS: PayMethod[] = ["NEFT", "UPI", "Bank Transfer", "Cheque", "RTGS", "Cash", "NEFT", "UPI"];
const COLLECTORS = ["Priya Sharma", "Anjali Kumari", "Amit Kumar", "Rohit Singh", "Vikash Sharma", "Meena Kumari"];
export const PAYMENTS: Payment[] = (() => {
  const r = rng(808);
  const list: Payment[] = [];
  for (const iv of INVOICES) {
    if (iv.paid <= 0) continue;
    const base = new Date(iv.date);
    const parts = iv.paid === iv.total && iv.total > 300000 && r() < 0.4 ? 2 : 1;
    let left = iv.paid;
    for (let k = 0; k < parts; k++) {
      const amt = k === parts - 1 ? left : Math.round((left * 0.5) / 1000) * 1000;
      left -= amt;
      const d = addDays(base, between(r, 1, 16) + k * 9);
      let date = d > NOW ? addDays(NOW, -between(r, 0, 2)) : d;
      date = new Date(date); date.setHours(10 + between(r, 0, 6), between(r, 0, 59));
      const method = iv.id === "INV-2941" ? "NEFT" : pick(r, METHODS);
      list.push({
        id: "", custId: iv.custId, invoiceId: iv.id, amount: amt, method, by: iv.id === "INV-2941" ? "Priya Sharma" : pick(r, COLLECTORS),
        date: iv.id === "INV-2941" ? "2026-10-04T16:30:00" : iso(date),
        ref: method === "Cash" ? "CASH-RCPT" : method === "Cheque" ? `CHQ ${between(r, 100200, 899999)}` : method === "UPI" ? `UPI/${between(r, 600000000, 699999999)}` : `${method === "RTGS" ? "RTGS" : "NEFT"}-${pick(r, ["HDFC", "SBIN", "ICIC", "UBIN"])}${between(r, 26100000, 26109999)}`,
        notes: iv.id === "INV-2941" ? "Advance against ORD-1047 — balance on delivery" : pick(r, ["", "", "Against invoice", "Part payment as promised", "Received at counter", "Cheque cleared"]),
      });
    }
  }
  list.sort((a, b) => b.date.localeCompare(a.date));
  let id = 1860;
  list.forEach((p) => { if (id === 1828 && p.invoiceId !== "INV-2941") id--; p.id = p.invoiceId === "INV-2941" ? "PAY-1828" : `PAY-${id--}`; });
  // push INV-2941's payment so its PAY id is 1828 regardless of ordering (ids elsewhere never collide)
  const seen = new Set<string>();
  list.forEach((p) => { if (seen.has(p.id)) p.id = `PAY-${1700 + seen.size}`; seen.add(p.id); });
  return list;
})();

/* ---------------- Dispatch + shipments ---------------- */
export const TRANSPORTERS = ["Eastern Roadways", "Bihar Carriers", "Maa Tara Logistics", "Shree Ganesh Transport", "Jharkhand Freight Lines"];
const DRIVERS = ["Sunil Yadav", "Mukesh Pandey", "Santosh Paswan", "Bablu Ansari", "Ramchandra Mahto", "Dilip Singh", "Pradeep Kumar", "Ajay Oraon"];
const HUBS: Record<string, string[]> = {
  "Ranchi>Dhanbad": ["Ramgarh", "Bokaro"], "Ranchi>Jamshedpur": ["Tatisilwai", "Chandil"], "Ranchi>Hazaribagh": ["Ramgarh"],
  "Ranchi>Ramgarh": [], "Dhanbad>Kolkata": ["Asansol", "Durgapur", "Bardhaman"], "Dhanbad>Howrah": ["Asansol", "Durgapur"],
  "Dhanbad>Bokaro": [], "Dhanbad>Giridih": ["Topchanchi"], "Dhanbad>Deoghar": ["Jamtara"], "Dhanbad>Dumka": ["Jamtara", "Deoghar"],
  "Dhanbad>Asansol": [], "Dhanbad>Durgapur": ["Asansol"], "Patna>Gaya": ["Jehanabad"], "Patna>Muzaffarpur": ["Hajipur"],
  "Patna>Bhagalpur": ["Barh", "Munger"], "Patna>Purnia": ["Hajipur", "Begusarai", "Katihar"], "Patna>Siliguri": ["Begusarai", "Purnia", "Kishanganj"],
};
const rto = (state: string, i: number) => `${state === "Bihar" ? "BR" : state === "West Bengal" ? "WB" : "JH"}0${1 + (i % 9)}${String.fromCharCode(65 + (i % 20))}${String.fromCharCode(70 + (i % 12))}${4000 + ((i * 313) % 5999)}`;

export const DISPATCHES: Dispatch[] = [];
export const SHIPMENTS: Shipment[] = [];
(() => {
  const r = rng(3030);
  for (const o of ORDERS) {
    if (!o.dispatchId) continue;
    const n = Number(o.id.slice(4));
    const c = custById(o.custId)!;
    const st = o.status;
    const ds: DispatchStatus = st === "Stock Allocated" || st === "Approved" ? "Pending Packing" : st === "Packing" ? "Packing" : st === "Ready" ? (n % 2 ? "Ready" : "Vehicle Assigned") : "Dispatched";
    const qty = o.dispatched || o.packed || o.qty;
    const weight = Math.round(o.lines.reduce((a, l) => a + l.qty * prodBySku(l.sku)!.weight, 0) * (qty / o.qty));
    const transporter = n === 1047 ? "Eastern Roadways" : TRANSPORTERS[n % TRANSPORTERS.length];
    const vehicle = n === 1047 ? "JH01DK4821" : rto(c.state === "Bihar" ? "Bihar" : c.state === "West Bengal" ? "West Bengal" : "Jharkhand", n);
    const driver = n === 1047 ? "Sunil Yadav" : DRIVERS[n % DRIVERS.length];
    const dep = new Date(o.date); dep.setDate(dep.getDate() + 2); dep.setHours(12 + (n % 5), (n * 7) % 60);
    if (n === 1047) { dep.setFullYear(2026, 9, 6); dep.setHours(16, 40); }
    const departure = ds === "Dispatched" ? iso(dep) : undefined;
    const expected = n === 1047 ? "2026-10-07T11:00:00" : iso(addDays(dep, 1 + (n % 2)));
    const value = n === 1047 ? 731200 : Math.round((o.value * qty) / o.qty);
    const d: Dispatch = {
      id: o.dispatchId, orderId: o.id, custId: o.custId, wh: o.wh, packages: Math.max(2, Math.round(qty / (n === 1047 ? 44.8 : 38))),
      qty, weight: n === 1047 ? 3420 : weight, value, transporter: ds === "Pending Packing" || ds === "Packing" ? "—" : transporter,
      vehicle: ds === "Pending Packing" || ds === "Packing" ? "—" : vehicle, driver: ds === "Pending Packing" || ds === "Packing" ? "—" : driver,
      phone: n === 1047 ? "98XXXXXX12" : "98XXXXXX" + String(10 + ((n * 3) % 89)), expected, departure, status: ds,
    };
    if (n === 1047) d.packages = 48;
    if (ds !== "Pending Packing" && ds !== "Packing") {
      const sid = `SHP-${n - 649}`;
      d.shipmentId = sid;
      const whCity = o.wh === "RNC" ? "Ranchi" : o.wh === "DHN" ? "Dhanbad" : "Patna";
      const hubs = HUBS[`${whCity}>${c.city}`] ?? (whCity === c.city ? [] : [c.state === "Bihar" ? "Hajipur" : "Ramgarh"]);
      const route = whCity === c.city ? [whCity, `${c.city} Dealer`] : [whCity, ...hubs, c.city];
      let status: ShipStatus; let at = 0;
      if (ds === "Ready") status = "Scheduled";
      else if (ds === "Vehicle Assigned") status = "Loading";
      else if (st === "Delivered") { status = "Delivered"; at = route.length - 1; }
      else if (st === "Partially Delivered") { status = "Delivered"; at = route.length - 1; }
      else if (st === "Dispatched") status = "Dispatched";
      else { status = pick(r, ["In Transit", "In Transit", "Reached Hub", "Out For Delivery", "Delayed"] as ShipStatus[]); at = Math.min(route.length - 2, Math.max(1, Math.floor(route.length / 2))); if (status === "Out For Delivery") at = route.length - 2; }
      let note: string | undefined;
      if (n === 1047) { status = "In Transit"; at = 2; }
      if (n === 1041) { status = "Issue"; at = route.length - 1; note = "20 units reported damaged by customer on unloading — return RTN-0412 raised."; }
      if (status === "Delayed") note = "Vehicle held up at toll plaza — approx. 3 hr delay.";
      const eta = status === "Delivered" ? "Delivered" : n === 1047 ? "2 hr 18 min" : `${between(r, 0, 5)} hr ${between(r, 5, 55)} min`;
      d.status = ds;
      SHIPMENTS.push({
        id: sid, dispatchId: d.id, orderId: o.id, custId: o.custId, route, at, eta, status, vehicle: d.vehicle, driver: d.driver, phone: d.phone,
        transporter: d.transporter, value, qty, contact: `${c.contact} · ${c.phone}`,
        pod: status === "Delivered" || status === "Issue" ? `POD-${n + 2100}.pdf` : "Pending", note,
      });
    }
    DISPATCHES.push(d);
  }
})();
export const dispatchById = (id: string) => DISPATCHES.find((d) => d.id === id);
export const shipmentById = (id: string) => SHIPMENTS.find((s) => s.id === id);
