import type { Customer, Employee, Product, Segment, Behaviour, Warehouse } from "@/types";

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)];
export const between = (r: () => number, lo: number, hi: number) => Math.round(lo + r() * (hi - lo));

export const WAREHOUSES: Warehouse[] = [
  { id: "RNC", name: "Ranchi Central Warehouse", city: "Ranchi", manager: "Manoj Prasad" },
  { id: "DHN", name: "Dhanbad Warehouse", city: "Dhanbad", manager: "Deepak Mahto" },
  { id: "PAT", name: "Patna Warehouse", city: "Patna", manager: "Suresh Thakur" },
];
export const whName = (id: string) => WAREHOUSES.find((w) => w.id === id)?.name ?? id;

export const SALES_REPS = ["Amit Kumar", "Rohit Singh", "Vikash Sharma"];

export const CITIES: Record<string, { state: string; territory: string; wh: "RNC" | "DHN" | "PAT" }> = {
  Ranchi: { state: "Jharkhand", territory: "Jharkhand Central", wh: "RNC" },
  Ramgarh: { state: "Jharkhand", territory: "Jharkhand Central", wh: "RNC" },
  Hazaribagh: { state: "Jharkhand", territory: "Jharkhand Central", wh: "RNC" },
  Jamshedpur: { state: "Jharkhand", territory: "Jharkhand South", wh: "RNC" },
  Dhanbad: { state: "Jharkhand", territory: "Jharkhand East", wh: "DHN" },
  Bokaro: { state: "Jharkhand", territory: "Jharkhand East", wh: "DHN" },
  Giridih: { state: "Jharkhand", territory: "Jharkhand East", wh: "DHN" },
  Deoghar: { state: "Jharkhand", territory: "Santhal Pargana", wh: "DHN" },
  Dumka: { state: "Jharkhand", territory: "Santhal Pargana", wh: "DHN" },
  Patna: { state: "Bihar", territory: "Bihar Central", wh: "PAT" },
  Gaya: { state: "Bihar", territory: "Bihar South", wh: "PAT" },
  Muzaffarpur: { state: "Bihar", territory: "Bihar North", wh: "PAT" },
  Bhagalpur: { state: "Bihar", territory: "Bihar East", wh: "PAT" },
  Purnia: { state: "Bihar", territory: "Bihar East", wh: "PAT" },
  Kolkata: { state: "West Bengal", territory: "Bengal South", wh: "DHN" },
  Howrah: { state: "West Bengal", territory: "Bengal South", wh: "DHN" },
  Asansol: { state: "West Bengal", territory: "Bengal West", wh: "DHN" },
  Durgapur: { state: "West Bengal", territory: "Bengal West", wh: "DHN" },
  Siliguri: { state: "West Bengal", territory: "Bengal North", wh: "PAT" },
};
const CITY_NAMES = Object.keys(CITIES);

type Seed = {
  name: string; city: string; rep: string; seg: Segment; limit: number; out: number; overdue: number;
  oldest: number; total: number; orders: number; beh: Behaviour; since: number; delay: number; last: string;
};
const SEEDS: Seed[] = [
  { name: "Sharma Hardware", city: "Dhanbad", rep: "Amit Kumar", seg: "Platinum", limit: 1500000, out: 1006200, overdue: 475000, oldest: 31, total: 8240000, orders: 64, beh: "Delayed", since: 2019, delay: 13, last: "2026-10-04" },
  { name: "Agarwal Traders", city: "Patna", rep: "Rohit Singh", seg: "Platinum", limit: 1200000, out: 455800, overdue: 0, oldest: 0, total: 7120000, orders: 58, beh: "Good", since: 2018, delay: 6, last: "2026-10-06" },
  { name: "Gupta Sanitary House", city: "Ranchi", rep: "Vikash Sharma", seg: "Platinum", limit: 1000000, out: 216000, overdue: 0, oldest: 0, total: 6480000, orders: 71, beh: "Excellent", since: 2017, delay: 2, last: "2026-10-03" },
  { name: "Gupta Enterprises", city: "Hazaribagh", rep: "Amit Kumar", seg: "At Risk", limit: 600000, out: 462000, overdue: 282000, oldest: 44, total: 2860000, orders: 29, beh: "Risky", since: 2021, delay: 27, last: "2026-09-12" },
  { name: "Maa Traders", city: "Deoghar", rep: "Rohit Singh", seg: "At Risk", limit: 400000, out: 296000, overdue: 196000, oldest: 38, total: 1740000, orders: 22, beh: "Risky", since: 2022, delay: 24, last: "2026-09-18" },
  { name: "Maa Durga Enterprises", city: "Bokaro", rep: "Amit Kumar", seg: "Gold", limit: 800000, out: 152000, overdue: 62000, oldest: 19, total: 4380000, orders: 44, beh: "Good", since: 2020, delay: 9, last: "2026-10-02" },
  { name: "Ranchi Buildmart", city: "Ranchi", rep: "Vikash Sharma", seg: "Gold", limit: 900000, out: 118000, overdue: 48000, oldest: 12, total: 5210000, orders: 49, beh: "Good", since: 2019, delay: 8, last: "2026-10-05" },
  { name: "Patna Hardware Agency", city: "Patna", rep: "Rohit Singh", seg: "Gold", limit: 750000, out: 140000, overdue: 0, oldest: 0, total: 4120000, orders: 41, beh: "Excellent", since: 2020, delay: 3, last: "2026-10-01" },
  { name: "Singh Electricals", city: "Gaya", rep: "Rohit Singh", seg: "Gold", limit: 700000, out: 142000, overdue: 82000, oldest: 22, total: 3680000, orders: 38, beh: "Delayed", since: 2020, delay: 15, last: "2026-09-29" },
  { name: "Bihar Home Solutions", city: "Muzaffarpur", rep: "Rohit Singh", seg: "Silver", limit: 500000, out: 90000, overdue: 0, oldest: 0, total: 2340000, orders: 27, beh: "Good", since: 2022, delay: 7, last: "2026-09-27" },
  { name: "Kolkata Bath Studio", city: "Kolkata", rep: "Vikash Sharma", seg: "Gold", limit: 1100000, out: 208000, overdue: 98000, oldest: 17, total: 4960000, orders: 36, beh: "Good", since: 2021, delay: 10, last: "2026-10-04" },
  { name: "Jaiswal Enterprises", city: "Jamshedpur", rep: "Vikash Sharma", seg: "Gold", limit: 800000, out: 150000, overdue: 0, oldest: 0, total: 3910000, orders: 40, beh: "Excellent", since: 2019, delay: 4, last: "2026-10-05" },
  { name: "Shree Balaji Hardware", city: "Siliguri", rep: "Vikash Sharma", seg: "Silver", limit: 450000, out: 71000, overdue: 31000, oldest: 9, total: 1980000, orders: 24, beh: "Good", since: 2022, delay: 8, last: "2026-09-30" },
  { name: "Om Sai Electricals", city: "Asansol", rep: "Amit Kumar", seg: "Silver", limit: 400000, out: 60000, overdue: 0, oldest: 0, total: 1620000, orders: 21, beh: "Good", since: 2023, delay: 5, last: "2026-09-26" },
  { name: "Radhey Sanitary Store", city: "Bhagalpur", rep: "Rohit Singh", seg: "Silver", limit: 350000, out: 110000, overdue: 66000, oldest: 33, total: 1480000, orders: 18, beh: "Delayed", since: 2022, delay: 19, last: "2026-09-08" },
  { name: "Kumar Tiles & Sanitary", city: "Ranchi", rep: "Vikash Sharma", seg: "Gold", limit: 650000, out: 100000, overdue: 0, oldest: 0, total: 3320000, orders: 35, beh: "Excellent", since: 2020, delay: 3, last: "2026-10-03" },
  { name: "Laxmi Hardware Mart", city: "Giridih", rep: "Amit Kumar", seg: "Silver", limit: 300000, out: 56000, overdue: 26000, oldest: 14, total: 1260000, orders: 17, beh: "Good", since: 2023, delay: 9, last: "2026-09-22" },
  { name: "Durgapur Electric House", city: "Durgapur", rep: "Vikash Sharma", seg: "Silver", limit: 500000, out: 88000, overdue: 38000, oldest: 11, total: 2140000, orders: 26, beh: "Good", since: 2021, delay: 8, last: "2026-10-01" },
  { name: "Mahavir Traders", city: "Dumka", rep: "Amit Kumar", seg: "At Risk", limit: 300000, out: 102000, overdue: 62000, oldest: 52, total: 1090000, orders: 14, beh: "Risky", since: 2022, delay: 31, last: "2026-08-29" },
  { name: "Jharkhand Pipe Centre", city: "Ramgarh", rep: "Amit Kumar", seg: "Gold", limit: 700000, out: 120000, overdue: 0, oldest: 0, total: 3570000, orders: 37, beh: "Excellent", since: 2019, delay: 2, last: "2026-10-05" },
  { name: "Anand Building Solutions", city: "Purnia", rep: "Rohit Singh", seg: "New", limit: 250000, out: 40000, overdue: 0, oldest: 0, total: 420000, orders: 4, beh: "Good", since: 2026, delay: 0, last: "2026-10-02" },
  { name: "New Bengal Sanitary", city: "Howrah", rep: "Vikash Sharma", seg: "New", limit: 300000, out: 55000, overdue: 0, oldest: 0, total: 560000, orders: 5, beh: "Good", since: 2026, delay: 0, last: "2026-10-04" },
];

const PRE = ["Shree", "Jai", "Maa", "Sri", "Om", "Balaji", "Hanuman", "New", "Ganesh", "Laxmi", "Radha", "Sai", "Mahalaxmi", "Krishna", "Bharat", "Eastern", "Star", "Royal", "Vijay", "Annapurna", "Satyam", "Goyal", "Jain", "Mishra", "Prasad", "Mandal", "Thakur", "Verma", "Roy", "Das"];
const TYPE = ["Hardware", "Traders", "Sanitary House", "Electricals", "Enterprises", "Agency", "Buildmart", "Hardware Store", "Electric & Sanitary", "Building Solutions", "Pipe Centre", "Bath Mart"];

function mkCustomer(i: number, s: Seed): Customer {
  const c = CITIES[s.city];
  const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const d = String(10 + ((i * 37) % 89));
  return {
    id: slug, code: `DLR-${1001 + i}`, name: s.name, city: s.city, state: c.state, territory: c.territory,
    rep: s.rep, segment: s.seg, creditLimit: s.limit, outstanding: s.out, overdue: s.overdue,
    oldestDays: s.oldest, lastOrder: s.last, totalSales: s.total, orders: s.orders, behaviour: s.beh,
    since: s.since, avgDelay: s.delay, phone: `${97 + (i % 3)}XXXXXX${d}`,
    gstin: `${c.state === "Bihar" ? "10" : c.state === "Jharkhand" ? "20" : "19"}AAB${String.fromCharCode(65 + (i % 26))}${1000 + i * 37}K1Z${i % 9}`,
    contact: ["Mr. Sharma", "Mr. Agarwal", "Mrs. Gupta", "Mr. Singh", "Mr. Jaiswal", "Mr. Prasad", "Mr. Mandal"][i % 7],
  };
}

function genCustomers(): Customer[] {
  const r = rng(77);
  const out = SEEDS.map((s, i) => mkCustomer(i, s));
  const used = new Set(out.map((c) => c.name));
  let i = SEEDS.length;
  while (out.length < 148) {
    const name = `${pick(r, PRE)} ${pick(r, TYPE)}`;
    if (used.has(name)) continue;
    used.add(name);
    const city = pick(r, CITY_NAMES);
    const roll = r();
    const seg: Segment = roll < 0.06 ? "Platinum" : roll < 0.25 ? "Gold" : roll < 0.62 ? "Silver" : roll < 0.8 ? "New" : "At Risk";
    const limit = seg === "Platinum" ? 1000000 : seg === "Gold" ? 700000 : seg === "Silver" ? 400000 : seg === "New" ? 200000 : 300000;
    const total = Math.round(((seg === "Platinum" ? 5.5e6 : seg === "Gold" ? 3e6 : seg === "Silver" ? 1.4e6 : seg === "New" ? 3.2e5 : 1.1e6) * (0.6 + r() * 0.8)) / 1000) * 1000;
    const risky = seg === "At Risk";
    const o = r() < 0.28 ? between(r, 5, 30) * 1000 : 0;
    const overdue = 0; // only the 12 curated dealers carry overdue invoices (ties to ₹14.7L overdue)
    const dd = between(r, 1, 28);
    out.push(
      mkCustomer(i, {
        name, city, rep: pick(r, SALES_REPS), seg, limit, out: o, overdue, oldest: 0,
        total, orders: Math.max(2, Math.round(total / 85000)), beh: risky ? "Delayed" : r() < 0.5 ? "Excellent" : "Good",
        since: seg === "New" ? 2026 : 2018 + between(r, 0, 7), delay: risky ? between(r, 9, 16) : between(r, 1, 9),
        last: dd > 6 ? `2026-09-${String(dd + 1).padStart(2, "0")}` : `2026-10-${String(dd).padStart(2, "0")}`,
      }),
    );
    i++;
  }
  return out;
}
export const CUSTOMERS: Customer[] = genCustomers();
export const custById = (id: string) => CUSTOMERS.find((c) => c.id === id);
export const custName = (id: string) => custById(id)?.name ?? id;

type PS = [string, string, string, number, number, string, number];
const P = (sku: string, name: string, category: string, price: number, gst: number, unit: string, weight: number): PS => [sku, name, category, price, gst, unit, weight];
const PRODUCT_SEEDS: PS[] = [
  P("KS-2418-P", "Premium Kitchen Sink 24×18", "Kitchen Sinks", 1185, 18, "pc", 4.2),
  P("KS-1816-S", "Single Bowl Sink 18×16", "Kitchen Sinks", 640, 18, "pc", 2.8),
  P("KS-3718-D", "Double Bowl Sink 37×18", "Kitchen Sinks", 2450, 18, "pc", 7.5),
  P("KS-2016-C", "Compact Sink 20×16", "Kitchen Sinks", 790, 18, "pc", 3.1),
  P("KS-3618-DB", "Double Bowl Drainboard Sink", "Kitchen Sinks", 3290, 18, "pc", 9.2),
  P("BF-BM-CH", "Chrome Basin Mixer", "Bathroom Fittings", 865, 18, "pc", 0.9),
  P("BF-SH-RN", "Rain Shower Set 8 inch", "Bathroom Fittings", 1980, 18, "set", 3.4),
  P("BF-HF-AB", "ABS Health Faucet", "Bathroom Fittings", 310, 18, "pc", 0.4),
  P("BF-AV-CH", "Angle Valve Chrome", "Bathroom Fittings", 185, 18, "pc", 0.3),
  P("BF-PC-15", "Pillar Cock Chrome", "Bathroom Fittings", 420, 18, "pc", 0.5),
  P("BF-BT-BR", "Bib Tap Brass", "Bathroom Fittings", 360, 18, "pc", 0.6),
  P("PV-CP-1", "CPVC Pipe 1 Inch", "PVC Pipes", 165, 12, "3m", 1.1),
  P("PV-CP-075", "CPVC Pipe ¾ Inch", "PVC Pipes", 118, 12, "3m", 0.8),
  P("PV-UP-4", "uPVC Drainage Pipe 4 Inch", "PVC Pipes", 395, 12, "3m", 3.6),
  P("PV-SW-110", "SWR Pipe 110mm", "PVC Pipes", 360, 12, "3m", 3.2),
  P("PV-AG-2", "Agri PVC Pipe 2 Inch", "PVC Pipes", 255, 12, "3m", 2.4),
  P("ES-MS-6A", "Modular Switch 6A", "Electrical Switches", 68, 18, "pc", 0.08),
  P("ES-MS-16A", "Modular Switch 16A", "Electrical Switches", 96, 18, "pc", 0.1),
  P("ES-SK-5P", "Modular Socket 5-Pin", "Electrical Switches", 118, 18, "pc", 0.1),
  P("ES-MCB-32", "MCB 32A Single Pole", "Electrical Switches", 265, 18, "pc", 0.15),
  P("ES-FR-M", "Modular Fan Regulator", "Electrical Switches", 245, 18, "pc", 0.12),
  P("WR-CU-25", "Copper Wire 2.5mm", "Wires", 1850, 18, "90m coil", 2.9),
  P("WR-CU-15", "Copper Wire 1.5mm", "Wires", 1240, 18, "90m coil", 1.9),
  P("WR-CU-40", "Copper Wire 4mm", "Wires", 2980, 18, "90m coil", 4.6),
  P("WR-FR-6", "FR Cable 6 sq mm", "Wires", 4120, 18, "90m coil", 6.8),
  P("LD-PN-18", "Premium LED Panel 18W", "LED Lighting", 395, 12, "pc", 0.6),
  P("LD-PN-12", "LED Panel 12W", "LED Lighting", 285, 12, "pc", 0.45),
  P("LD-BL-9", "LED Bulb 9W", "LED Lighting", 72, 12, "pc", 0.08),
  P("LD-BT-20", "LED Batten 20W", "LED Lighting", 240, 12, "pc", 0.4),
  P("LD-FL-50", "LED Flood Light 50W", "LED Lighting", 780, 12, "pc", 1.2),
  P("HW-DL-4", "Mortise Door Lock", "Hardware", 540, 18, "pc", 0.9),
  P("HW-HG-4", "SS Door Hinge 4 Inch", "Hardware", 62, 18, "pc", 0.12),
  P("HW-TB-12", "Tower Bolt 12 Inch", "Hardware", 95, 18, "pc", 0.25),
  P("HW-SC-100", "Screw Assortment Box", "Hardware", 210, 18, "box", 0.7),
  P("HW-DC-18", "Drawer Channel 18 Inch", "Hardware", 180, 18, "pair", 0.6),
  P("WT-1000", "PVC Water Tank 1000L", "Water Tanks", 6850, 18, "pc", 24),
  P("WT-500", "PVC Water Tank 500L", "Water Tanks", 3650, 18, "pc", 14),
  P("WT-2000", "Triple Layer Tank 2000L", "Water Tanks", 13900, 18, "pc", 42),
  P("WT-300", "PVC Water Tank 300L", "Water Tanks", 2300, 18, "pc", 9),
  P("SW-WC-WM", "Wall Mounted WC", "Sanitaryware", 6450, 18, "pc", 18),
  P("SW-WC-FL", "Floor Mount Western Closet", "Sanitaryware", 3950, 18, "pc", 22),
  P("SW-WB-CT", "Countertop Wash Basin", "Sanitaryware", 2650, 18, "pc", 8),
  P("SW-WB-PD", "Pedestal Wash Basin", "Sanitaryware", 2150, 18, "pc", 14),
  P("SW-UR-W", "Wall Urinal", "Sanitaryware", 1450, 18, "pc", 6),
  P("AD-TA-20", "Tile Adhesive 20kg", "Adhesives", 445, 18, "bag", 20),
  P("AD-TA-5", "Tile Adhesive 5kg Pack", "Adhesives", 145, 18, "bag", 5),
  P("AD-PV-500", "PVC Solvent Cement 500ml", "Adhesives", 190, 18, "tin", 0.6),
  P("AD-WP-10", "Waterproofing Compound 10L", "Adhesives", 1650, 18, "can", 11),
];
export const CATEGORIES = Array.from(new Set(PRODUCT_SEEDS.map((p) => p[2])));
export const PRODUCTS: Product[] = (() => {
  const r = rng(404);
  return PRODUCT_SEEDS.map(([sku, name, category, price, gst, unit, weight]) => {
    const margin = sku === "KS-2418-P" ? 22 : between(r, 9, 34);
    const units = sku === "KS-2418-P" ? 3840 : Math.round((price > 3000 ? 300 : price > 800 ? 900 : 3200) * (0.3 + r() * 1.6));
    const sales = sku === "KS-2418-P" ? 1840000 : Math.round((units * price * (0.9 + r() * 0.2)) / 1000) * 1000;
    return {
      id: sku.toLowerCase(), sku, name, category, price, gst, unit, weight, cost: Math.round(price * (1 - margin / 100)),
      sales, units, margin, growth: sku === "KS-2418-P" ? 14.8 : Math.round((r() * 40 - 12) * 10) / 10,
    };
  });
})();
export const prodBySku = (sku: string) => PRODUCTS.find((p) => p.sku === sku);
export const prodById = (id: string) => PRODUCTS.find((p) => p.id === id);

const E = (name: string, role: string, dept: string, location: string, stats: [string, string][], joined = "2020-04-01"): Employee => ({
  id: name.toLowerCase().replace(/ /g, "-"), name, role, dept, location, phone: "98XXXXXX" + String(10 + ((name.length * 7) % 89)),
  joined, stats: stats.map(([label, value]) => ({ label, value })), status: "Active",
});
export const EMPLOYEES: Employee[] = [
  E("Rajesh Agarwal", "Managing Director", "Management", "Ranchi HO", [["Approvals this month", "48"], ["Business reviews", "Daily"]], "2008-04-01"),
  E("Rahul Singh", "Sales Manager", "Sales", "Ranchi HO", [["Orders approved", "186"], ["Team revenue", "₹84.3L"], ["Team size", "3"]], "2014-06-01"),
  E("Amit Kumar", "Sales Executive", "Sales", "Ranchi HO", [["Orders this month", "42"], ["Revenue", "₹31.4L"], ["Collections", "₹24.8L"], ["Outstanding", "₹8.2L"], ["Customers", "28"]], "2018-02-01"),
  E("Rohit Singh", "Sales Executive", "Sales", "Patna", [["Orders this month", "38"], ["Revenue", "₹28.7L"], ["Collections", "₹23.1L"], ["Outstanding", "₹7.4L"], ["Customers", "26"]], "2019-01-15"),
  E("Vikash Sharma", "Sales Executive", "Sales", "Kolkata", [["Orders this month", "34"], ["Revenue", "₹24.2L"], ["Collections", "₹20.6L"], ["Outstanding", "₹6.1L"], ["Customers", "24"]], "2020-07-01"),
  E("Priya Sharma", "Accounts Manager", "Accounts", "Ranchi HO", [["Invoices raised", "214"], ["Collections posted", "₹1.42 Cr"], ["Follow-ups logged", "96"]], "2016-09-01"),
  E("Anjali Kumari", "Accounts Executive", "Accounts", "Ranchi HO", [["Receipts posted", "168"], ["Reconciled", "98%"]], "2022-03-01"),
  E("Neha Gupta", "Admin & HR", "Admin", "Ranchi HO", [["Employees managed", "32"], ["Permissions updated", "6"]], "2017-11-01"),
  E("Manoj Prasad", "Warehouse Manager", "Warehouse", "Ranchi", [["Orders processed", "212"], ["Stock accuracy", "99.1%"]], "2015-05-01"),
  E("Rahul Verma", "Warehouse Executive", "Warehouse", "Ranchi", [["Orders packed", "116"], ["Units packed", "14,800"], ["Dispatch errors", "2"]], "2021-02-01"),
  E("Ravi Oraon", "Packing Supervisor", "Warehouse", "Ranchi", [["Orders packed", "98"], ["Units packed", "12,100"], ["Dispatch errors", "1"]], "2021-08-01"),
  E("Deepak Mahto", "Warehouse Manager", "Warehouse", "Dhanbad", [["Orders processed", "164"], ["Stock accuracy", "98.6%"]], "2016-01-01"),
  E("Imran Ansari", "Warehouse Executive", "Warehouse", "Dhanbad", [["Orders packed", "84"], ["Units packed", "9,300"], ["Dispatch errors", "3"]], "2022-01-01"),
  E("Suresh Thakur", "Warehouse Manager", "Warehouse", "Patna", [["Orders processed", "141"], ["Stock accuracy", "98.9%"]], "2017-04-01"),
  E("Pankaj Ranjan", "Warehouse Executive", "Warehouse", "Patna", [["Orders packed", "72"], ["Units packed", "8,400"], ["Dispatch errors", "1"]], "2022-09-01"),
  E("Vikash Kumar", "Logistics Manager", "Logistics", "Ranchi HO", [["Dispatches managed", "186"], ["On-time delivery", "93%"], ["Open issues", "3"]], "2016-06-01"),
  E("Sunil Yadav", "Fleet Driver", "Logistics", "Ranchi", [["Trips this month", "14"], ["On-time", "93%"]], "2019-10-01"),
  E("Mukesh Pandey", "Fleet Driver", "Logistics", "Patna", [["Trips this month", "12"], ["On-time", "91%"]], "2020-12-01"),
  E("Sanjay Mahto", "Loader Supervisor", "Warehouse", "Ranchi", [["Loads handled", "132"]], "2018-05-01"),
  E("Kiran Devi", "Billing Executive", "Accounts", "Ranchi HO", [["Invoices raised", "142"]], "2023-01-01"),
  E("Ashish Tiwari", "Purchase Executive", "Purchase", "Ranchi HO", [["POs raised", "28"], ["Suppliers", "14"]], "2019-03-01"),
  E("Nitin Jha", "Inventory Analyst", "Warehouse", "Ranchi", [["Cycle counts", "18"], ["Variance", "0.4%"]], "2023-06-01"),
  E("Pooja Kumari", "Customer Support", "Sales", "Ranchi HO", [["Tickets resolved", "88"]], "2023-08-01"),
  E("Abhishek Rai", "Sales Coordinator", "Sales", "Patna", [["Quotations", "64"]], "2022-02-01"),
  E("Dinesh Oraon", "Loader", "Warehouse", "Dhanbad", [["Loads handled", "96"]], "2020-02-01"),
  E("Raju Mandal", "Loader", "Warehouse", "Patna", [["Loads handled", "88"]], "2021-05-01"),
  E("Santosh Paswan", "Fleet Driver", "Logistics", "Dhanbad", [["Trips this month", "13"], ["On-time", "95%"]], "2019-07-01"),
  E("Meena Kumari", "Accounts Executive", "Accounts", "Patna", [["Receipts posted", "74"]], "2022-11-01"),
  E("Arvind Singh", "Dispatch Coordinator", "Logistics", "Dhanbad", [["Dispatch sheets", "122"]], "2021-10-01"),
  E("Gaurav Sinha", "IT & Systems", "Admin", "Ranchi HO", [["Tickets closed", "21"]], "2023-04-01"),
  E("Sweta Kumari", "Data Entry Operator", "Admin", "Ranchi HO", [["Entries", "640"]], "2024-01-01"),
  E("Ramesh Prasad", "Security & Gate", "Warehouse", "Ranchi", [["Gate entries", "412"]], "2018-01-01"),
];
