import { CUSTOMERS, PRODUCTS, WAREHOUSES, between, pick, rng } from "./core";
import { ORDERS } from "./ops";
import { NOW, addDays, iso } from "@/lib/format";

/* ---------- time series ---------- */
const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const S12 = [1.31, 1.42, 1.38, 1.47, 1.86, 1.52, 1.58, 1.49, 1.57, 1.61, 1.63, 1.84];
const C12 = [1.18, 1.29, 1.31, 1.36, 1.62, 1.49, 1.44, 1.41, 1.38, 1.33, 1.31, 1.42];
const O12 = [0.31, 0.33, 0.34, 0.36, 0.41, 0.38, 0.4, 0.43, 0.45, 0.44, 0.43, 0.4672];
export type Pt = { label: string; sales: number; collections: number; outstanding: number };
export const MONTHLY: Pt[] = MONTHS.map((m, i) => ({ label: m, sales: S12[i] * 1e7, collections: C12[i] * 1e7, outstanding: O12[i] * 1e7 }));
export function series(range: "7D" | "30D" | "3M" | "6M" | "12M"): Pt[] {
  if (range === "12M") return MONTHLY;
  if (range === "6M") return MONTHLY.slice(6);
  const r = rng(11);
  const days: Pt[] = [];
  let out = 4.2e6;
  for (let i = 29; i >= 0; i--) {
    const d = addDays(NOW, -i);
    const dow = d.getDay();
    const base = dow === 0 ? 2.2e5 : 5.8e5;
    const sales = Math.round(base * (0.7 + r() * 0.7));
    const col = Math.round(base * 0.8 * (0.5 + r() * 0.9));
    out = out + (sales - col) * 0.55;
    days.push({ label: `${d.getDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]}`, sales, collections: col, outstanding: Math.round(out) });
  }
  if (range === "7D") return days.slice(-7);
  if (range === "30D") return days;
  const weeks: Pt[] = [];
  const wr = rng(5);
  for (let w = 12; w >= 0; w--) {
    const d = addDays(NOW, -w * 7);
    const s = Math.round(3.9e6 * (0.85 + wr() * 0.35));
    weeks.push({ label: `${d.getDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]}`, sales: s, collections: Math.round(s * (0.78 + wr() * 0.18)), outstanding: Math.round(4.3e6 + wr() * 4e5 + (12 - w) * 2.2e4) });
  }
  return weeks;
}
export const spark = (seed: number, up = true, n = 14) => {
  const r = rng(seed);
  let v = 50;
  return Array.from({ length: n }, (_, i) => ({ i, v: (v += (up ? 1.6 : -0.8) + (r() - 0.5) * 9) }));
};

/* ---------- stock movements ---------- */
export type Movement = { id: string; ts: string; type: string; ref: string; qty: number; wh: string; user: string; note: string; balance: number };
export function movementsFor(sku: string): Movement[] {
  const r = rng(sku.length * 991 + sku.charCodeAt(0) * 17 + sku.charCodeAt(sku.length - 1));
  const orders = ORDERS.filter((o) => o.lines.some((l) => l.sku === sku));
  const who = ["Manoj Prasad", "Rahul Verma", "Ravi Oraon", "Deepak Mahto", "Imran Ansari", "Suresh Thakur", "Nitin Jha"];
  const types: [string, number, string][] = [
    ["Purchase Received", 1, "PO"], ["Order Reserved", -1, "ORD"], ["Packing", 0, "ORD"], ["Dispatch", -1, "ORD"],
    ["Warehouse Transfer", 0, "TRF"], ["Order Released", 1, "ORD"], ["Return", 1, "RTN"], ["Damage", -1, "DMG"], ["Adjustment", 0, "ADJ"],
  ];
  const out: Movement[] = [];
  let bal = between(r, 400, 1500);
  for (let i = 0; i < 16; i++) {
    const t = i === 0 ? types[0] : i % 5 === 2 ? pick(r, types.slice(4)) : types[1 + (i % 3)];
    const ts = addDays(NOW, -Math.round(i * 2.1 + r() * 1.5));
    ts.setHours(9 + between(r, 0, 8), between(r, 0, 59));
    const base = between(r, 20, 220);
    const qty = t[1] === 0 ? (t[0] === "Adjustment" ? (r() < 0.5 ? -between(r, 1, 8) : between(r, 1, 8)) : base) : t[1] * base;
    const o = orders.length ? orders[i % orders.length] : ORDERS[i];
    const ref = t[2] === "ORD" ? o.id : t[2] === "PO" ? `PO-${5120 - i * 3}` : t[2] === "TRF" ? `TRF-${210 - i}` : t[2] === "RTN" ? `RTN-${410 - i}` : t[2] === "DMG" ? `DMG-${88 - i}` : `ADJ-${33 - i}`;
    out.push({ id: `MV-${9000 - i}`, ts: iso(ts), type: t[0], ref, qty, wh: pick(r, WAREHOUSES).name.replace(" Warehouse", "").replace("Central ", ""), user: pick(r, who), note: t[0] === "Damage" ? "Found broken during handling" : t[0] === "Adjustment" ? "Cycle count correction" : t[0] === "Warehouse Transfer" ? "Inter-warehouse replenishment" : "", balance: 0 });
  }
  out.sort((a, b) => b.ts.localeCompare(a.ts));
  for (let i = out.length - 1; i >= 0; i--) { bal += out[i].qty; out[i].balance = Math.max(0, bal); }
  return out;
}

/* ---------- purchases ---------- */
export const PO_STAGES = ["Purchase Request", "Purchase Order", "Supplier Confirmation", "Goods In Transit", "Goods Received", "QC", "Inventory Updated", "Supplier Invoice", "Payment"];
export type Supplier = { name: string; city: string; value: number; pending: number; payable: number; lead: number; last: string; rating: number; category: string };
export const SUPPLIERS: Supplier[] = [
  { name: "SteelCraft Sinks Pvt Ltd", city: "Rajkot", value: 4820000, pending: 2, payable: 684000, lead: 9, last: "2026-10-01", rating: 4.6, category: "Kitchen Sinks" },
  { name: "Polyflow Pipes & Fittings", city: "Ahmedabad", value: 3960000, pending: 3, payable: 512000, lead: 7, last: "2026-10-03", rating: 4.4, category: "PVC Pipes" },
  { name: "Sunrise Wires & Cables", city: "Delhi", value: 4210000, pending: 1, payable: 835000, lead: 6, last: "2026-09-28", rating: 4.7, category: "Wires" },
  { name: "Apex Sanitaryware Co.", city: "Morbi", value: 3540000, pending: 2, payable: 420000, lead: 12, last: "2026-09-26", rating: 4.2, category: "Sanitaryware" },
  { name: "LumiTech LED India", city: "Noida", value: 2380000, pending: 1, payable: 218000, lead: 8, last: "2026-10-02", rating: 4.5, category: "LED Lighting" },
  { name: "Switchline Electricals", city: "Faridabad", value: 2910000, pending: 2, payable: 346000, lead: 7, last: "2026-09-30", rating: 4.3, category: "Electrical Switches" },
  { name: "Aqua Store Tanks Ltd", city: "Kolkata", value: 1860000, pending: 1, payable: 292000, lead: 5, last: "2026-10-04", rating: 4.1, category: "Water Tanks" },
  { name: "Hindustan Adhesives", city: "Vapi", value: 1240000, pending: 1, payable: 96000, lead: 10, last: "2026-09-22", rating: 4.0, category: "Adhesives" },
  { name: "Bharat Brass Works", city: "Jagadhri", value: 1480000, pending: 0, payable: 0, lead: 11, last: "2026-09-14", rating: 3.8, category: "Bathroom Fittings" },
  { name: "Ludhiana Hardware Mills", city: "Ludhiana", value: 920000, pending: 1, payable: 118000, lead: 9, last: "2026-09-19", rating: 4.2, category: "Hardware" },
];
export type PO = { id: string; supplier: string; items: string; value: number; stage: number; wh: string; date: string; eta: string; by: string };
export const POS: PO[] = [
  { id: "PO-5121", supplier: "SteelCraft Sinks Pvt Ltd", items: "Premium Kitchen Sink 24×18 · 600 pcs", value: 648000, stage: 3, wh: "Dhanbad", date: "2026-09-30", eta: "2026-10-09", by: "Ashish Tiwari" },
  { id: "PO-5120", supplier: "Polyflow Pipes & Fittings", items: "CPVC Pipe 1 Inch · 4,000 pcs", value: 724000, stage: 2, wh: "Ranchi", date: "2026-10-01", eta: "2026-10-10", by: "Ashish Tiwari" },
  { id: "PO-5119", supplier: "Sunrise Wires & Cables", items: "Copper Wire 2.5mm · 380 coils", value: 702000, stage: 4, wh: "Ranchi", date: "2026-09-26", eta: "2026-10-05", by: "Ashish Tiwari" },
  { id: "PO-5118", supplier: "LumiTech LED India", items: "Premium LED Panel 18W · 3,000 pcs", value: 1062000, stage: 5, wh: "Patna", date: "2026-09-24", eta: "2026-10-04", by: "Rajesh Agarwal" },
  { id: "PO-5117", supplier: "Apex Sanitaryware Co.", items: "Wall Mounted WC · 180 pcs", value: 1161000, stage: 3, wh: "Patna", date: "2026-09-27", eta: "2026-10-12", by: "Ashish Tiwari" },
  { id: "PO-5116", supplier: "Switchline Electricals", items: "Modular Switch 6A · 20,000 pcs", value: 1360000, stage: 1, wh: "Ranchi", date: "2026-10-04", eta: "2026-10-14", by: "Ashish Tiwari" },
  { id: "PO-5115", supplier: "Aqua Store Tanks Ltd", items: "PVC Water Tank 1000L · 120 pcs", value: 822000, stage: 6, wh: "Dhanbad", date: "2026-09-20", eta: "2026-09-30", by: "Ashish Tiwari" },
  { id: "PO-5114", supplier: "Hindustan Adhesives", items: "Tile Adhesive 20kg · 1,800 bags", value: 801000, stage: 7, wh: "Ranchi", date: "2026-09-12", eta: "2026-09-22", by: "Ashish Tiwari" },
  { id: "PO-5113", supplier: "SteelCraft Sinks Pvt Ltd", items: "Single Bowl Sink 18×16 · 900 pcs", value: 576000, stage: 8, wh: "Ranchi", date: "2026-09-05", eta: "2026-09-15", by: "Ashish Tiwari" },
  { id: "PO-5112", supplier: "Polyflow Pipes & Fittings", items: "uPVC Drainage Pipe 4 Inch · 1,500 pcs", value: 592500, stage: 8, wh: "Patna", date: "2026-09-02", eta: "2026-09-12", by: "Ashish Tiwari" },
  { id: "PO-5111", supplier: "Ludhiana Hardware Mills", items: "Mortise Door Lock · 1,200 pcs", value: 648000, stage: 0, wh: "Ranchi", date: "2026-10-05", eta: "2026-10-18", by: "Rahul Singh" },
  { id: "PO-5110", supplier: "Bharat Brass Works", items: "Chrome Basin Mixer · 1,400 pcs", value: 1211000, stage: 2, wh: "Dhanbad", date: "2026-10-02", eta: "2026-10-13", by: "Ashish Tiwari" },
];

/* ---------- returns ---------- */
export const RETURN_STAGES = ["Return Requested", "Approved", "Goods Pickup", "Received", "Inspection", "Restock / Scrap", "Credit Note"];
export const RETURN_TYPES = ["Sales Return", "Damaged Goods", "Wrong Product", "Short Delivery", "Quality Issue", "Replacement"];
export type Ret = { id: string; type: string; orderId: string; custId: string; product: string; qty: number; value: number; stage: number; date: string; reason: string; outcome: string };
export const RETURNS: Ret[] = [
  { id: "RTN-0412", type: "Damaged Goods", orderId: "ORD-1041", custId: "jaiswal-enterprises", product: "Single Bowl Sink 18×16", qty: 20, value: 15104, stage: 1, date: "2026-10-05", reason: "Dented / scratched on unloading", outcome: "Pending inspection" },
  { id: "RTN-0411", type: "Wrong Product", orderId: "ORD-1034", custId: "ranchi-buildmart", product: "Modular Switch 16A", qty: 150, value: 16992, stage: 2, date: "2026-10-03", reason: "6A delivered instead of 16A", outcome: "Replacement" },
  { id: "RTN-0410", type: "Short Delivery", orderId: "ORD-1029", custId: "maa-durga-enterprises", product: "CPVC Pipe 1 Inch", qty: 60, value: 11088, stage: 5, date: "2026-09-30", reason: "60 pcs short vs invoice", outcome: "Credit note" },
  { id: "RTN-0409", type: "Quality Issue", orderId: "ORD-1022", custId: "kolkata-bath-studio", product: "Chrome Basin Mixer", qty: 14, value: 14310, stage: 4, date: "2026-09-29", reason: "Cartridge leakage", outcome: "Under inspection" },
  { id: "RTN-0408", type: "Sales Return", orderId: "ORD-1015", custId: "patna-hardware-agency", product: "PVC Water Tank 500L", qty: 4, value: 17228, stage: 6, date: "2026-09-24", reason: "Dealer overstock (agreed return)", outcome: "Restocked · CN-0191" },
  { id: "RTN-0407", type: "Damaged Goods", orderId: "ORD-1011", custId: "singh-electricals", product: "Premium LED Panel 18W", qty: 40, value: 17696, stage: 6, date: "2026-09-21", reason: "Broken glass in transit", outcome: "Scrapped · CN-0190" },
  { id: "RTN-0406", type: "Replacement", orderId: "ORD-1008", custId: "agarwal-traders", product: "Wall Mounted WC", qty: 2, value: 15222, stage: 3, date: "2026-09-19", reason: "Hairline crack", outcome: "Replacement dispatched" },
  { id: "RTN-0405", type: "Quality Issue", orderId: "ORD-0998", custId: "bihar-home-solutions", product: "Rain Shower Set 8 inch", qty: 6, value: 14018, stage: 0, date: "2026-10-06", reason: "Chrome peeling", outcome: "Awaiting approval" },
  { id: "RTN-0404", type: "Sales Return", orderId: "ORD-0991", custId: "jaiswal-enterprises", product: "Tile Adhesive 20kg", qty: 80, value: 42000, stage: 6, date: "2026-09-12", reason: "Batch expiry near", outcome: "Restocked · CN-0187" },
];

/* ---------- expenses ---------- */
export const EXP_CATS = ["Transport", "Fuel", "Warehouse", "Staff", "Repair", "Office", "Loading / Unloading", "Miscellaneous"];
export type Expense = { id: string; date: string; cat: string; desc: string; amount: number; wh: string; by: string; mode: string };
export const EXPENSES: Expense[] = (() => {
  const r = rng(61);
  const descs: Record<string, string[]> = {
    Transport: ["Eastern Roadways freight — Dhanbad", "Bihar Carriers freight — Gaya", "Part-load freight — Kolkata", "Maa Tara Logistics — Muzaffarpur"],
    Fuel: ["Diesel — fleet truck JH01DK4821", "Diesel — Patna delivery van", "Fuel card top-up"],
    Warehouse: ["Warehouse rent — Dhanbad", "Electricity — Ranchi warehouse", "Pallet & racking purchase", "Packing material — cartons & tape"],
    Staff: ["Overtime — packing team", "Sales staff travel allowance", "Staff tea & meals"],
    Repair: ["Forklift servicing — Ranchi", "Truck tyre replacement", "Shutter repair — Patna warehouse"],
    Office: ["Internet & telephone", "Stationery & printing", "Office housekeeping"],
    "Loading / Unloading": ["Hamali — inbound PO-5119", "Loading charges — ORD-1047", "Unloading — SteelCraft consignment"],
    Miscellaneous: ["Dealer meet refreshments", "Courier charges", "Local permits & toll"],
  };
  const weights: [string, number][] = [["Transport", 36], ["Fuel", 11], ["Warehouse", 21], ["Staff", 12], ["Repair", 5], ["Office", 4], ["Loading / Unloading", 8], ["Miscellaneous", 3]];
  const total = 980000;
  const out: Expense[] = [];
  let n = 0;
  for (const [cat, w] of weights) {
    const cnt = Math.max(3, Math.round(w / 3.4));
    const catTotal = (total * w) / 100;
    let left = catTotal;
    for (let i = 0; i < cnt; i++) {
      const amt = i === cnt - 1 ? left : Math.round((catTotal / cnt) * (0.6 + r() * 0.8) / 100) * 100;
      left -= amt;
      const d = new Date("2026-10-01T10:00:00"); d.setDate(1 + between(r, 0, 5));
      const dsc = descs[cat];
      out.push({ id: `EXP-${3300 + ++n}`, date: iso(d), cat, desc: dsc[i % dsc.length], amount: Math.round(amt), wh: pick(r, WAREHOUSES).city, by: pick(r, ["Priya Sharma", "Manoj Prasad", "Vikash Kumar", "Deepak Mahto", "Suresh Thakur"]), mode: pick(r, ["Bank Transfer", "UPI", "Cash", "Company Card"]) });
    }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
})();

/* ---------- activity logs ---------- */
export type Log = { id: string; ts: string; user: string; action: string; module: string; record: string; device: string; ip: string; href?: string };
export const LOGS: Log[] = (() => {
  const t = (h: number, m: number, day = 6) => iso(new Date(`2026-10-${String(day).padStart(2, "0")}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`));
  const base: Omit<Log, "id">[] = [
    { ts: t(17, 12), user: "Priya Sharma", action: "followed up with Sharma Hardware — promise to pay ₹2,00,000 on 10 Oct", module: "Receivables", record: "Sharma Hardware", device: "Chrome · Windows", ip: "103.XX.12.41", href: "/customers/sharma-hardware" },
    { ts: t(16, 42), user: "Sunil Yadav", action: "dispatched vehicle JH01DK4821 (Eastern Roadways)", module: "Dispatch", record: "DSP-2834", device: "Driver App · Android", ip: "49.XX.201.7", href: "/dispatch/DSP-2834" },
    { ts: t(16, 5), user: "Kiran Devi", action: "generated invoice INV-2941 (₹7,31,200)", module: "Invoices", record: "INV-2941", device: "Chrome · Windows", ip: "103.XX.12.44", href: "/invoices/INV-2941" },
    { ts: t(14, 18), user: "Rahul Verma", action: "started packing", module: "Warehouse", record: "ORD-1047", device: "Warehouse Tablet", ip: "10.0.4.22", href: "/orders/ORD-1047" },
    { ts: t(12, 16), user: "System", action: "420 units reserved from Ranchi warehouse", module: "Inventory", record: "ORD-1047", device: "Auto", ip: "—", href: "/orders/ORD-1047" },
    { ts: t(11, 3), user: "Rahul Singh", action: "approved the order", module: "Sales Orders", record: "ORD-1048", device: "Chrome · macOS", ip: "103.XX.12.18", href: "/orders/ORD-1048" },
    { ts: t(10, 42), user: "Amit Kumar", action: "created order ORD-1048", module: "Sales Orders", record: "ORD-1048", device: "Mobile App · Android", ip: "157.XX.88.9", href: "/orders/ORD-1048" },
    { ts: t(10, 8), user: "Priya Sharma", action: "recorded payment ₹1,24,000 from Ranchi Buildmart (UPI)", module: "Payments", record: "PAY-1840", device: "Chrome · Windows", ip: "103.XX.12.41" },
    { ts: t(9, 36), user: "Manoj Prasad", action: "received PO-5119 goods — 380 coils Copper Wire 2.5mm", module: "Purchase", record: "PO-5119", device: "Warehouse Tablet", ip: "10.0.4.20" },
    { ts: t(9, 12), user: "Rajesh Agarwal", action: "viewed Owner Command Center", module: "Dashboard", record: "—", device: "Chrome · macOS", ip: "103.XX.12.2" },
    { ts: t(18, 40, 5), user: "Vikash Kumar", action: "marked shipment SHP-392 as Issue — 20 units damaged", module: "Shipments", record: "SHP-392", device: "Mobile App · Android", ip: "49.XX.114.3", href: "/shipments/SHP-392" },
    { ts: t(17, 22, 5), user: "Neha Gupta", action: "updated permissions for Warehouse Manager role", module: "Settings", record: "Roles", device: "Chrome · Windows", ip: "103.XX.12.9" },
    { ts: t(15, 5, 5), user: "Rohit Singh", action: "created quotation for Anand Building Solutions", module: "Sales Orders", record: "QTN-3381", device: "Mobile App · Android", ip: "157.XX.201.5" },
    { ts: t(11, 47, 5), user: "Deepak Mahto", action: "transferred 200 units Premium Kitchen Sink 24×18 Ranchi → Dhanbad", module: "Inventory", record: "TRF-210", device: "Warehouse Tablet", ip: "10.0.5.14", href: "/products/ks-2418-p" },
    { ts: t(10, 15, 5), user: "Ashish Tiwari", action: "created purchase order PO-5116", module: "Purchase", record: "PO-5116", device: "Chrome · Windows", ip: "103.XX.12.47" },
    { ts: t(16, 30, 4), user: "Priya Sharma", action: "recorded payment ₹2,00,000 from Sharma Hardware (NEFT)", module: "Payments", record: "PAY-1828", device: "Chrome · Windows", ip: "103.XX.12.41", href: "/payments" },
    { ts: t(10, 50, 4), user: "Amit Kumar", action: "created order ORD-1047", module: "Sales Orders", record: "ORD-1047", device: "Mobile App · Android", ip: "157.XX.88.9", href: "/orders/ORD-1047" },
    { ts: t(17, 55, 3), user: "Rahul Singh", action: "rejected credit-limit override for Mahavir Traders", module: "Customers", record: "Mahavir Traders", device: "Chrome · macOS", ip: "103.XX.12.18" },
  ];
  const r = rng(99);
  const users = ["Amit Kumar", "Rohit Singh", "Vikash Sharma", "Rahul Verma", "Ravi Oraon", "Imran Ansari", "Kiran Devi", "Anjali Kumari", "Pankaj Ranjan", "Meena Kumari"];
  const acts: [string, string, string][] = [
    ["created order", "Sales Orders", "ORD"], ["approved the order", "Sales Orders", "ORD"], ["completed packing", "Warehouse", "ORD"], ["generated invoice", "Invoices", "INV"],
    ["recorded payment", "Payments", "PAY"], ["created dispatch", "Dispatch", "DSP"], ["marked delivered with POD", "Shipments", "SHP"], ["adjusted stock after cycle count", "Inventory", "SKU"],
  ];
  for (let i = 0; i < 52; i++) {
    const a = pick(r, acts);
    const o = ORDERS[3 + (i % 60)];
    const rec = a[2] === "ORD" ? o.id : a[2] === "INV" ? `INV-${2800 + i}` : a[2] === "PAY" ? `PAY-${1790 + i}` : a[2] === "DSP" ? `DSP-${2790 + i}` : a[2] === "SHP" ? `SHP-${350 + i}` : pick(r, PRODUCTS).sku;
    base.push({ ts: t(9 + between(r, 0, 9), between(r, 0, 59), Math.max(1, 3 - Math.floor(i / 16))), user: pick(r, users), action: `${a[0]} ${a[2] === "ORD" ? o.id : rec}`, module: a[1], record: rec, device: pick(r, ["Chrome · Windows", "Mobile App · Android", "Warehouse Tablet", "Chrome · macOS"]), ip: `103.XX.${between(r, 1, 250)}.${between(r, 1, 250)}`, href: a[2] === "ORD" ? `/orders/${o.id}` : undefined });
  }
  base.sort((a, b) => b.ts.localeCompare(a.ts));
  return base.map((b, i) => ({ ...b, id: `LOG-${5000 - i}` }));
})();

/* ---------- notifications ---------- */
export type Notif = { id: string; kind: "overdue" | "approval" | "stock" | "delay" | "return" | "large" | "credit" | "po"; title: string; body: string; time: string; href: string; unread: boolean };
export const NOTIFS: Notif[] = [
  { id: "n1", kind: "overdue", title: "Payment overdue", body: "Sharma Hardware — ₹4,75,000 overdue by 31 days", time: "12 min ago", href: "/customers/sharma-hardware", unread: true },
  { id: "n2", kind: "approval", title: "Order approval required", body: "ORD-1049 · Ranchi Buildmart · ₹5,12,300 waiting for Sales Manager", time: "28 min ago", href: "/orders", unread: true },
  { id: "n3", kind: "credit", title: "Credit limit exceeded", body: "Mahavir Traders is at 81% of limit with 52-day overdue invoice", time: "1 hr ago", href: "/customers/mahavir-traders", unread: true },
  { id: "n4", kind: "delay", title: "Dispatch delayed", body: "ORD-1048 · Agarwal Traders delayed 2 days — stock shortage", time: "2 hr ago", href: "/orders/ORD-1048", unread: true },
  { id: "n5", kind: "stock", title: "Low stock", body: "Premium Kitchen Sink 24×18 — 184 available at Dhanbad (min 300)", time: "3 hr ago", href: "/products/ks-2418-p", unread: true },
  { id: "n6", kind: "return", title: "Return request", body: "RTN-0405 · Bihar Home Solutions · 6 Rain Shower Sets", time: "4 hr ago", href: "/returns", unread: false },
  { id: "n7", kind: "large", title: "Large order received", body: "ORD-1047 · Sharma Hardware · ₹7,42,800", time: "Yesterday", href: "/orders/ORD-1047", unread: false },
  { id: "n8", kind: "po", title: "Purchase order received", body: "PO-5119 Copper Wire 2.5mm — 380 coils received at Ranchi", time: "Yesterday", href: "/purchase", unread: false },
  { id: "n9", kind: "delay", title: "Shipment issue", body: "SHP-392 · 20 units reported damaged by Jaiswal Enterprises", time: "Yesterday", href: "/shipments/SHP-392", unread: false },
];

/* ---------- collection follow-ups ---------- */
export type Followup = { id: string; custId: string; kind: string; note: string; by: string; ts: string; promiseAmt?: number; promiseDate?: string };
export const FOLLOWUPS: Followup[] = [
  { id: "F9", custId: "sharma-hardware", kind: "Promise To Pay", note: "Mr. Sharma committed ₹2,00,000 by 10 Oct and balance ₹3,31,200 by 18 Oct after dispatch is received.", by: "Priya Sharma", ts: "2026-10-06T17:12:00", promiseAmt: 200000, promiseDate: "2026-10-10" },
  { id: "F8", custId: "sharma-hardware", kind: "Phone Call", note: "Called regarding 31-day overdue invoice INV-2874. Cash-flow tight due to festive stocking.", by: "Amit Kumar", ts: "2026-10-04T12:20:00" },
  { id: "F7", custId: "sharma-hardware", kind: "WhatsApp", note: "Sent statement of account and INV-2874 PDF.", by: "Priya Sharma", ts: "2026-09-29T10:05:00" },
  { id: "F6", custId: "gupta-enterprises", kind: "Visit", note: "Visited shop — owner out of town, accountant to share payment plan.", by: "Amit Kumar", ts: "2026-10-03T15:30:00" },
  { id: "F5", custId: "maa-traders", kind: "Payment Dispute", note: "Disputes 12 units short on INV-2867. Warehouse verifying POD.", by: "Rohit Singh", ts: "2026-10-02T11:15:00" },
  { id: "F4", custId: "mahavir-traders", kind: "Phone Call", note: "No response on 3 attempts. Escalated to Sales Manager.", by: "Amit Kumar", ts: "2026-09-30T16:40:00" },
  { id: "F3", custId: "singh-electricals", kind: "Promise To Pay", note: "Cheque of ₹1,42,000 promised by 12 Oct.", by: "Rohit Singh", ts: "2026-10-01T10:00:00", promiseAmt: 142000, promiseDate: "2026-10-12" },
  { id: "F2", custId: "radhey-sanitary-store", kind: "Email", note: "Sent reminder with ledger.", by: "Anjali Kumari", ts: "2026-09-26T09:30:00" },
];
export const CUSTOMER_ID_SET = new Set(CUSTOMERS.map((c) => c.id));
RETURNS.forEach((r) => {
  const o = ORDERS.find((x) => x.id === r.orderId);
  if (o) r.custId = o.custId;
});
