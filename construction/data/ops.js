import { PROJECTS } from "./core";

/* ───────── BOQ (Skyline) — hierarchical ───────── */
export const BOQ = [
  { code: "1", cat: "Civil", items: [
    { code: "1.1", desc: "Excavation in ordinary soil", unit: "CUM", qty: 18500, rate: 285, exec: 18500, billed: 18500 },
    { code: "1.2", desc: "PCC M10 (1:3:6)", unit: "CUM", qty: 640, rate: 5400, exec: 640, billed: 640 },
    { code: "1.3", desc: "RCC M30 — raft, columns, slabs", unit: "CUM", qty: 4200, rate: 7800, exec: 2740, billed: 2400, hl: true },
    { code: "1.4", desc: "Brick masonry 230mm", unit: "CUM", qty: 3100, rate: 6200, exec: 1610, billed: 1380 },
  ] },
  { code: "2", cat: "Structural", items: [
    { code: "2.1", desc: "TMT Fe500D reinforcement", unit: "MT", qty: 1450, rate: 68500, exec: 902, billed: 840 },
    { code: "2.2", desc: "Structural steel — canopy & club house", unit: "MT", qty: 96, rate: 92000, exec: 60, billed: 52 },
    { code: "2.3", desc: "Shuttering & formwork", unit: "SQM", qty: 64000, rate: 540, exec: 41200, billed: 38800 },
  ] },
  { code: "3", cat: "Electrical", items: [
    { code: "3.1", desc: "Conduit & wiring — apartments", unit: "RMT", qty: 186000, rate: 142, exec: 41000, billed: 30000 },
    { code: "3.2", desc: "DB, MCB & distribution panels", unit: "NOS", qty: 360, rate: 18500, exec: 70, billed: 40 },
    { code: "3.3", desc: "Street & landscape lighting", unit: "NOS", qty: 220, rate: 12800, exec: 0, billed: 0 },
  ] },
  { code: "4", cat: "Plumbing", items: [
    { code: "4.1", desc: "CPVC/UPVC water supply lines", unit: "RMT", qty: 42000, rate: 310, exec: 21300, billed: 17000 },
    { code: "4.2", desc: "Drainage & soil pipes", unit: "RMT", qty: 28000, rate: 395, exec: 14400, billed: 11800 },
    { code: "4.3", desc: "Sanitary fixtures", unit: "SET", qty: 360, rate: 24800, exec: 36, billed: 0 },
  ] },
  { code: "5", cat: "Fire Fighting", items: [
    { code: "5.1", desc: "Wet riser & hydrant network", unit: "RMT", qty: 6200, rate: 1860, exec: 1700, billed: 1200 },
    { code: "5.2", desc: "Sprinklers & detection", unit: "NOS", qty: 1800, rate: 2400, exec: 120, billed: 0 },
  ] },
  { code: "6", cat: "HVAC", items: [
    { code: "6.1", desc: "Club house VRF system", unit: "LS", qty: 1, rate: 4200000, exec: 0.1, billed: 0 },
    { code: "6.2", desc: "Ventilation — basement & stair", unit: "SQM", qty: 5400, rate: 960, exec: 700, billed: 400 },
  ] },
  { code: "7", cat: "Finishes", items: [
    { code: "7.1", desc: "Internal plaster 12mm", unit: "SQM", qty: 168000, rate: 168, exec: 82000, billed: 70000 },
    { code: "7.2", desc: "Vitrified tile flooring 800x800", unit: "SQM", qty: 54000, rate: 740, exec: 12800, billed: 9000 },
    { code: "7.3", desc: "Interior emulsion paint", unit: "SQM", qty: 310000, rate: 52, exec: 28000, billed: 0 },
  ] },
  { code: "8", cat: "External Development", items: [
    { code: "8.1", desc: "Storm water drain", unit: "RMT", qty: 2600, rate: 3400, exec: 1770, billed: 1500 },
    { code: "8.2", desc: "Internal roads — WBM + paver", unit: "SQM", qty: 14200, rate: 1320, exec: 5900, billed: 4200 },
    { code: "8.3", desc: "Landscape & hardscape", unit: "LS", qty: 1, rate: 8600000, exec: 0.18, billed: 0 },
  ] },
];
BOQ.forEach((g) => g.items.forEach((i) => { i.budget = i.qty * i.rate; i.execVal = i.exec * i.rate; i.balance = i.qty - i.exec; i.variance = i.hl ? 0.9e5 : Math.round((Math.sin(i.qty) * 0.03 * i.execVal)); }));

/* ───────── Budget (Skyline control, ₹ Cr) ───────── */
export const BUDGET_TOTALS = { budget: 15.8, committed: 10.2, actual: 9.6, remaining: 6.2, forecast: 16.4, variance: 0.6 };
export const COST_CATS = [
  { cat: "Material", budget: 7.9, committed: 5.4, actual: 5.0, forecast: 8.3 },
  { cat: "Labour", budget: 1.8, committed: 1.1, actual: 1.05, forecast: 1.9 },
  { cat: "Contractor", budget: 3.4, committed: 2.3, actual: 2.1, forecast: 3.5 },
  { cat: "Plant & Machinery", budget: 0.62, committed: 0.4, actual: 0.38, forecast: 0.66 },
  { cat: "Fuel", budget: 0.26, committed: 0.15, actual: 0.15, forecast: 0.27 },
  { cat: "Equipment Rental", budget: 0.38, committed: 0.26, actual: 0.24, forecast: 0.4 },
  { cat: "Transport", budget: 0.32, committed: 0.2, actual: 0.19, forecast: 0.35 },
  { cat: "Site Office", budget: 0.28, committed: 0.18, actual: 0.17, forecast: 0.29 },
  { cat: "Professional Fees", budget: 0.5, committed: 0.15, actual: 0.14, forecast: 0.5 },
  { cat: "Miscellaneous", budget: 0.34, committed: 0.06, actual: 0.18, forecast: 0.35 },
];
export const PROFIT = PROJECTS.map((p) => {
  const fc = +(p.value * (1 - p.margin / 100)).toFixed(2);
  return { id: p.id, name: p.name, contract: p.value, estimated: +(p.value * 0.84).toFixed(2), actual: p.spent, forecast: fc, revenue: p.earned, gp: +(p.value - fc).toFixed(2), margin: p.margin };
});
export const LEAKS = {
  metro: { total: 11.4, items: [["Material rate escalation", 4.2], ["Rework (tile alignment, ceiling)", 2.8], ["Labour productivity", 2.1], ["Additional client changes", 2.3]] },
  orion: { total: 18.6, items: [["Steel rate escalation", 7.4], ["Delay-related site overheads", 6.1], ["Dewatering extra", 5.1]] },
  riverside: { total: 14.8, items: [["Steel delay — idle crew", 6.3], ["Crane breakdown & hire", 3.2], ["Rain downtime", 2.9], ["Expedited freight", 2.4]] },
};

/* ───────── Materials ───────── */
const mk = (p, name, unit, ordered, received, consumed, wastage, min, extra = {}) => ({ id: `${p}-${name}`, p, name, unit, ordered, received, consumed, wastage, stock: +(received - consumed - wastage).toFixed(1), min, transit: +(ordered - received).toFixed(1) > 0 ? +(Math.min(ordered - received, ordered * 0.1)).toFixed(1) : 0, ...extra });
export const MATERIALS = [
  mk("skyline", "TMT Steel (all dia.)", "MT", 62, 48, 39.2, 0.8, 6, { rate: 4.8 }),
  mk("skyline", "TMT Steel 12mm", "MT", 24, 14, 8.6, 0, 6, { rate: 4.8, critical: true, required: 18, stock: 5.4 }),
  mk("skyline", "Cement OPC 53", "Bags", 52000, 41000, 36200, 600, 4000, { rate: 880 }),
  mk("skyline", "Ready-mix M30", "CUM", 3000, 2740, 2740, 0, 0, { rate: 96 }),
  mk("skyline", "Bricks (AAC blocks)", "Nos", 1800000, 1220000, 986000, 12400, 150000, { rate: 24000 }),
  mk("skyline", "River sand", "MT", 5200, 4400, 3720, 110, 400, { rate: 120 }),
  mk("skyline", "20mm aggregate", "MT", 6800, 5900, 5100, 120, 600, { rate: 160 }),
  mk("skyline", "Vitrified tiles", "SQM", 54000, 14000, 12800, 180, 1500, { rate: 0 }),
  mk("skyline", "CPVC/UPVC pipes", "RMT", 42000, 29000, 21300, 300, 4000, { rate: 0 }),
  mk("orion", "TMT Steel (all dia.)", "MT", 140, 96, 90.5, 1.4, 12, { critical: true, rate: 7 }),
  mk("orion", "Cement OPC 53", "Bags", 88000, 60000, 52200, 800, 5000),
  mk("orion", "Ready-mix M35", "CUM", 6400, 3100, 3100, 0, 0),
  mk("orion", "Structural steel", "MT", 210, 90, 84, 1.2, 10),
  mk("greenfield", "PEB steel sections", "MT", 360, 352, 340, 2, 10),
  mk("greenfield", "Cement OPC 53", "Bags", 34000, 33000, 31800, 300, 1000),
  mk("greenfield", "Roof sheeting", "SQM", 18000, 17400, 17000, 100, 500),
  mk("royal", "TMT Steel (all dia.)", "MT", 120, 70, 52, 0.7, 10),
  mk("royal", "Cement OPC 53", "Bags", 26000, 14000, 9800, 120, 2000),
  mk("royal", "Ready-mix M30", "CUM", 1500, 620, 620, 0, 0),
  mk("metro", "Vitrified tiles", "SQM", 9800, 9100, 8600, 260, 400, { rate: 0 }),
  mk("metro", "False ceiling grid", "SQM", 7200, 6100, 5900, 40, 300),
  mk("metro", "Paint — emulsion", "Ltr", 14000, 9000, 7400, 60, 800),
  mk("eastern", "PEB steel sections", "MT", 310, 190, 170, 1.8, 15),
  mk("eastern", "Cement OPC 53", "Bags", 21000, 14200, 11800, 160, 1500),
  mk("riverside", "TMT Steel (all dia.)", "MT", 96, 38, 34.6, 0.6, 8, { critical: true }),
  mk("riverside", "Cement OPC 53", "Bags", 20000, 8800, 7000, 90, 1000),
  mk("riverside", "Bricks", "Nos", 600000, 240000, 190000, 3000, 30000),
].map((m) => ({ ...m, stock: m.stock, status: m.stock <= 0 ? "Out" : m.stock < m.min ? "Low_" : "Healthy" }));
export const MAT_STATUS = { Out: ["Out of stock", "bad"], Low_: ["Below minimum", "warn"], Healthy: ["Healthy", "good"] };

export const MR = {
  id: "MR-2841", project: "skyline", material: "TMT Steel 12mm", required: 18, by: "09 Oct", stock: 5.4, rate: 4.8, stockout: 1.1, priority: "Critical", requester: "Site Engineer — Rahul Sinha",
  flow: ["Material Request", "Approval", "RFQ", "Supplier Comparison", "Purchase Order", "Dispatch", "In Transit", "Site Receipt", "Quality Check", "Site Store", "Consumption"],
  step: 4,
};
export const MOVE = [
  { s: "Supplier Dispatch", who: "JSW Distributor, Ranchi", t: "06 Oct, 06:10 AM", done: true },
  { s: "Vehicle Departed", who: "JH-01-CF-4410 · Driver Ramesh", t: "06 Oct, 06:48 AM", done: true },
  { s: "Site Gate Entry", who: "Security — Gate 2", t: "06 Oct, 10:42 AM", done: true },
  { s: "Quantity Verified", who: "Store Manager — Vikas Singh", t: "06 Oct, 10:58 AM", done: true },
  { s: "QC Approved", who: "Quality Engineer", t: "06 Oct, 11:20 AM", done: true },
  { s: "Store Entry", who: "Store Manager — Vikas Singh", t: "06 Oct, 11:35 AM", done: true },
  { s: "Issued to Contractor", who: "Eastern Structural Works", t: "06 Oct, 12:05 PM", done: true },
  { s: "Consumed", who: "Tower B reinforcement — 1.8 MT fixed", t: "In progress", done: false },
];
export const GATE = [
  { id: "GE-7731", p: "skyline", vehicle: "JH-01-CF-4410", supplier: "JSW Authorized Distributor", po: "PO-1831", material: "TMT Steel 16mm", challan: "CH/2201", qty: "18 MT", driver: "Ramesh Oraon", entry: "10:42 AM", weight: "18.12 MT", by: "Vikas Singh" },
  { id: "GE-7730", p: "skyline", vehicle: "JH-10-AB-2275", supplier: "UltraTech Cement Dealer", po: "PO-1826", material: "Cement OPC 53", challan: "UT/8841", qty: "1,600 bags", driver: "Sunil Mahto", entry: "09:15 AM", weight: "80.0 MT", by: "Vikas Singh" },
  { id: "GE-7729", p: "skyline", vehicle: "JH-01-DD-9012", supplier: "Ready-mix — Ranchi Plant", po: "PO-1819", material: "RMC M30", challan: "RM/4410", qty: "36 CUM", driver: "Deepak Kumar", entry: "08:10 AM", weight: "86.4 MT", by: "Vikas Singh" },
  { id: "GE-7728", p: "orion", vehicle: "JH-10-BX-5512", supplier: "Tata Steel Partner", po: "PO-1822", material: "TMT Steel 20mm", challan: "TS/3009", qty: "22 MT", driver: "Rakesh Ram", entry: "07:50 AM", weight: "22.3 MT", by: "Store — Dhanbad" },
  { id: "GE-7727", p: "metro", vehicle: "WB-26-DC-1180", supplier: "Kajaria Distribution", po: "PO-1829", material: "Vitrified tiles", challan: "KJ/771", qty: "1,200 SQM", driver: "Imran Sheikh", entry: "Yesterday 4:30 PM", weight: "30.2 MT", by: "Store — Kolkata" },
];

/* ───────── Procurement ───────── */
export const PROC_STATS = { openMR: 14, pending: 7, rfq: 5, po: 22, transit: 9, delayed: 3, purchase: "₹4.62 Cr", savings: "₹18.4L" };
export const SUPPLIERS_CMP = [
  { s: "Tata Steel Partner", rate: 66800, transport: 1800, gst: 12, days: 6, credit: 30, rating: 4.4, past: "92% on-time", landed: 78290 + 0, note: "Lowest landed cost" },
  { s: "JSW Authorized Distributor", rate: 67722, transport: 1500, gst: 12, days: 3, credit: 21, rating: 4.7, past: "96% on-time", landed: 77280 + 0, note: "Fastest delivery" },
  { s: "Shree Balaji Steel", rate: 65900, transport: 2400, gst: 12, days: 8, credit: 45, rating: 3.9, past: "81% on-time", landed: 76440, note: "Lowest rate, slowest" },
].map((x) => ({ ...x, landed: Math.round((x.rate + x.transport) * (1 + x.gst / 100)) }));
export const POS = [
  { id: "PO-1844", p: "skyline", supplier: "JSW Authorized Distributor", material: "TMT Steel 12mm", qty: 18, unit: "MT", rate: 67722, delivery: "09 Oct", terms: "21 days credit", delivered: 0, status: "In Transit" },
  { id: "PO-1831", p: "skyline", supplier: "JSW Authorized Distributor", material: "TMT Steel 16mm", qty: 18, unit: "MT", rate: 67200, delivery: "06 Oct", terms: "21 days credit", delivered: 18, status: "Received" },
  { id: "PO-1826", p: "skyline", supplier: "UltraTech Cement Dealer", material: "Cement OPC 53", qty: 8000, unit: "Bags", rate: 372, delivery: "06 Oct", terms: "15 days credit", delivered: 6400, status: "Partial" },
  { id: "PO-1822", p: "orion", supplier: "Tata Steel Partner", material: "TMT Steel 20mm", qty: 40, unit: "MT", rate: 66800, delivery: "06 Oct", terms: "30 days credit", delivered: 22, status: "Partial" },
  { id: "PO-1829", p: "metro", supplier: "Kajaria Distribution", material: "Vitrified tiles", qty: 2400, unit: "SQM", rate: 612, delivery: "10 Oct", terms: "30 days credit", delivered: 1200, status: "Delayed" },
  { id: "PO-1818", p: "metro", supplier: "Asian Paints Dealer", material: "Emulsion paint", qty: 4000, unit: "Ltr", rate: 286, delivery: "12 Oct", terms: "Advance 20%", delivered: 0, status: "In Transit" },
  { id: "PO-1811", p: "greenfield", supplier: "Tata Steel Partner", material: "PEB sections", qty: 24, unit: "MT", rate: 81400, delivery: "04 Oct", terms: "45 days credit", delivered: 24, status: "Received" },
  { id: "PO-1809", p: "royal", supplier: "UltraTech Cement Dealer", material: "Cement OPC 53", qty: 6000, unit: "Bags", rate: 380, delivery: "11 Oct", terms: "15 days credit", delivered: 0, status: "In Transit" },
  { id: "PO-1802", p: "riverside", supplier: "Tata Steel Partner", material: "TMT Steel 12mm", qty: 18, unit: "MT", rate: 66800, delivery: "08 Oct", terms: "30 days credit", delivered: 0, status: "Delayed" },
  { id: "PO-1797", p: "eastern", supplier: "Astral Pipes Distributor", material: "Drainage pipes", qty: 3200, unit: "RMT", rate: 410, delivery: "13 Oct", terms: "30 days credit", delivered: 0, status: "In Transit" },
];
export const MRS = [
  { id: "MR-2841", p: "skyline", material: "TMT Steel 12mm", qty: "18 MT", by: "Rahul Sinha", date: "06 Oct", priority: "Critical", status: "Pending" },
  { id: "MR-2840", p: "riverside", material: "TMT Steel 12mm", qty: "18 MT", by: "Amit Kumar", date: "05 Oct", priority: "Critical", status: "Approved" },
  { id: "MR-2838", p: "orion", material: "Binding wire", qty: "1.2 MT", by: "Manish Verma", date: "05 Oct", priority: "Medium", status: "Approved" },
  { id: "MR-2836", p: "metro", material: "Grout & adhesive", qty: "420 bags", by: "Priya Sharma", date: "04 Oct", priority: "High", status: "Pending" },
  { id: "MR-2833", p: "royal", material: "Shuttering plywood", qty: "280 sheets", by: "Vikas Singh", date: "04 Oct", priority: "Low", status: "Approved" },
];

/* ───────── Contractors ───────── */
export const CONTRACTORS = [
  { id: "ct1", name: "Shivam Civil Contractors", trade: "Civil Structure", p: "skyline", wo: 2.84, exec: 1.72, cert: 1.64, paid: 1.38, retention: 0.082, pending: 0.18, score: 86, workers: 62, quality: 88, safety: 84 },
  { id: "ct2", name: "Eastern Structural Works", trade: "RCC & Shuttering", p: "orion", wo: 4.2, exec: 1.9, cert: 1.78, paid: 1.52, retention: 0.09, pending: 0.184, score: 71, workers: 74, quality: 74, safety: 70 },
  { id: "ct3", name: "Apex MEP Solutions", trade: "MEP", p: "skyline", wo: 1.96, exec: 0.52, cert: 0.48, paid: 0.4, retention: 0.024, pending: 0.08, score: 90, workers: 31, quality: 92, safety: 91 },
  { id: "ct4", name: "Shree Interiors", trade: "Interiors & Finishes", p: "metro", wo: 1.84, exec: 1.62, cert: 1.5, paid: 1.28, retention: 0.075, pending: 0.22, score: 58, workers: 34, quality: 52, safety: 72 },
  { id: "ct5", name: "Ranchi Electrical Projects", trade: "Electrical", p: "greenfield", wo: 1.12, exec: 0.96, cert: 0.94, paid: 0.88, retention: 0.047, pending: 0.06, score: 91, workers: 22, quality: 93, safety: 90 },
  { id: "ct6", name: "Om Sai Plumbing", trade: "Plumbing", p: "royal", wo: 0.68, exec: 0.14, cert: 0.12, paid: 0.1, retention: 0.006, pending: 0.02, score: 79, workers: 16, quality: 80, safety: 78 },
  { id: "ct7", name: "Eastern Structural Works", trade: "RCC & Shuttering", p: "riverside", wo: 1.5, exec: 0.52, cert: 0.46, paid: 0.4, retention: 0.023, pending: 0.06, score: 52, workers: 18, quality: 70, safety: 66, note: "Manpower shortage" },
];
export const WORK_ORDER = {
  id: "WO-0412", contractor: "Shivam Civil Contractors", project: "skyline", scope: "RCC structure — Towers A, B, C (labour + shuttering supply)", boq: "1.3, 2.1, 2.3", qty: "4,200 CUM RCC", rate: "₹6,760 / CUM (labour+formwork)", value: "₹2.84 Cr", start: "20 Mar 2026", end: "30 Nov 2026", retention: "5% until DLP", terms: "Fortnightly RA bill, 15 days credit",
  milestones: [["Tower A structure", "100% — paid"], ["Tower B structure", "78% — in progress"], ["Tower C structure", "62% — in progress"], ["Club house roof slab", "Completed"]],
};
export const CBILL_FLOW = ["Contractor Submission", "Engineer Verification", "Quantity Verification", "QS Approval", "Project Manager Approval", "Accounts Approval", "Payment"];
export const CBILLS = [
  { id: "CB-0932", p: "orion", contractor: "Eastern Structural Works", desc: "RA Bill 06", amount: 18.4e5, step: 5, due: "10 Oct", status: "Pending" },
  { id: "CB-0931", p: "skyline", contractor: "Shivam Civil Contractors", desc: "RA Bill 11", amount: 31.2e5, step: 4, due: "12 Oct", status: "Pending" },
  { id: "CB-0929", p: "skyline", contractor: "Apex MEP Solutions", desc: "RA Bill 03", amount: 8.4e5, step: 3, due: "14 Oct", status: "Pending" },
  { id: "CB-0927", p: "metro", contractor: "Shree Interiors", desc: "RA Bill 07", amount: 22e5, step: 2, due: "11 Oct", status: "Pending" },
  { id: "CB-0925", p: "greenfield", contractor: "Ranchi Electrical Projects", desc: "RA Bill 05", amount: 6.0e5, step: 7, due: "03 Oct", status: "Paid" },
  { id: "CB-0922", p: "riverside", contractor: "Eastern Structural Works", desc: "RA Bill 02", amount: 6.2e5, step: 6, due: "08 Oct", status: "Approved" },
  { id: "CB-0919", p: "royal", contractor: "Om Sai Plumbing", desc: "RA Bill 01", amount: 2.1e5, step: 7, due: "28 Sep", status: "Paid" },
];

/* ───────── Labour ───────── */
export const LABOUR_TODAY = { total: 286, present: 263, absent: 23, skilled: 118, unskilled: 145, overtime: 41 };
export const DEPLOY = [{ k: "Tower A", v: 42 }, { k: "Tower B", v: 36 }, { k: "Tower C", v: 28 }, { k: "MEP", v: 31 }, { k: "Finishes", v: 48 }, { k: "External", v: 22 }, { k: "Other", v: 56 }];
export const WORKERS = [
  { id: "w1", name: "Ramu Oraon", contractor: "Shivam Civil Contractors", skill: "Mason", p: "skyline", shift: "Day", att: "Present", ot: 2, rate: 780 },
  { id: "w2", name: "Birsa Munda", contractor: "Shivam Civil Contractors", skill: "Bar Bender", p: "skyline", shift: "Day", att: "Present", ot: 0, rate: 820 },
  { id: "w3", name: "Salim Ansari", contractor: "Apex MEP Solutions", skill: "Electrician", p: "skyline", shift: "Day", att: "Present", ot: 1, rate: 900 },
  { id: "w4", name: "Kamal Hassan", contractor: "Om Sai Plumbing", skill: "Plumber", p: "royal", shift: "Day", att: "Absent", ot: 0, rate: 860 },
  { id: "w5", name: "Pintu Das", contractor: "Shree Interiors", skill: "Tile Fitter", p: "metro", shift: "Day", att: "Present", ot: 3, rate: 950 },
  { id: "w6", name: "Raju Tudu", contractor: "Eastern Structural Works", skill: "Carpenter", p: "orion", shift: "Night", att: "Present", ot: 4, rate: 840 },
  { id: "w7", name: "Mohan Lal", contractor: "Shivam Civil Contractors", skill: "Helper", p: "skyline", shift: "Day", att: "Present", ot: 0, rate: 520 },
  { id: "w8", name: "Sanjay Kisku", contractor: "Eastern Structural Works", skill: "Helper", p: "riverside", shift: "Day", att: "Absent", ot: 0, rate: 520 },
  { id: "w9", name: "Dilip Soren", contractor: "Ranchi Electrical Projects", skill: "Electrician", p: "greenfield", shift: "Day", att: "Present", ot: 2, rate: 900 },
  { id: "w10", name: "Anwar Khan", contractor: "Shree Interiors", skill: "Painter", p: "metro", shift: "Day", att: "Present", ot: 0, rate: 700 },
];
export const PRODUCTIVITY = [
  { team: "Masonry Team", p: "skyline", workers: 22, target: 180, actual: 154, unit: "sqm", cost: 284 },
  { team: "Shuttering Gang", p: "skyline", workers: 28, target: 420, actual: 441, unit: "sqm", cost: 188 },
  { team: "Bar Bending Crew", p: "skyline", workers: 18, target: 3.4, actual: 3.1, unit: "MT", cost: 4200 },
  { team: "Tile Fixing", p: "metro", workers: 14, target: 120, actual: 88, unit: "sqm", cost: 520 },
  { team: "Plastering", p: "royal", workers: 16, target: 210, actual: 196, unit: "sqm", cost: 158 },
];

/* ───────── Equipment ───────── */
export const EQUIPMENT = [
  { id: "TC-02", name: "Tower Crane TC-02", type: "Tower Crane", p: "skyline", status: "Running", operator: "Ashok Rai", runtime: "6h 20m", util: 78, fuel: 8240, maint: "18 Oct", cost: 8240 },
  { id: "EX-04", name: "Excavator EX-04", type: "Excavator", p: "orion", status: "Running", operator: "Pappu Singh", runtime: "7h 05m", util: 84, fuel: 11200, maint: "22 Oct", cost: 14600 },
  { id: "CM-11", name: "Concrete Mixer CM-11", type: "Concrete Mixer", p: "royal", status: "Idle", operator: "—", runtime: "1h 10m", util: 34, fuel: 900, maint: "30 Oct", cost: 1800 },
  { id: "JC-03", name: "JCB JC-03", type: "JCB", p: "greenfield", status: "Running", operator: "Mukesh Kumar", runtime: "5h 40m", util: 71, fuel: 6800, maint: "15 Oct", cost: 9400 },
  { id: "DG-07", name: "DG Set 125kVA DG-07", type: "DG Set", p: "eastern", status: "Running", operator: "—", runtime: "8h 00m", util: 66, fuel: 12400, maint: "12 Oct", cost: 12400 },
  { id: "SC-A1", name: "Scaffolding Set A1", type: "Scaffolding", p: "skyline", status: "Running", operator: "—", runtime: "—", util: 92, fuel: 0, maint: "—", cost: 1200 },
  { id: "LF-01", name: "Material Lift LF-01", type: "Lift", p: "skyline", status: "Running", operator: "Rinku Devi", runtime: "7h 30m", util: 81, fuel: 2100, maint: "20 Oct", cost: 2100 },
  { id: "CR-01", name: "Mobile Crane CR-01", type: "Crane", p: "riverside", status: "Breakdown", operator: "Sohan Lal", runtime: "2h 00m", util: 22, fuel: 3000, maint: "Now", cost: 4200 },
  { id: "VH-09", name: "Transit Mixer VH-09", type: "Vehicle", p: "metro", status: "Maintenance", operator: "—", runtime: "—", util: 0, fuel: 0, maint: "07 Oct", cost: 0 },
];

/* ───────── Quality & Safety ───────── */
export const QUALITY_STATS = { inspections: 148, passed: 124, failed: 9, pending: 15, snags: 64, rework: 11 };
export const INSPECTIONS = [
  { id: "QI-2482", p: "skyline", activity: "Tower B Slab Reinforcement", by: "Quality Engineer", date: "06 Oct", status: "Passed" },
  { id: "QI-2481", p: "skyline", activity: "Tower A Brickwork — Level 9", by: "Quality Engineer", date: "06 Oct", status: "Pending" },
  { id: "QI-2479", p: "orion", activity: "Basement waterproofing", by: "Quality Engineer", date: "06 Oct", status: "Failed" },
  { id: "QI-2476", p: "greenfield", activity: "PEB anchor bolts", by: "Quality Engineer", date: "05 Oct", status: "Passed" },
  { id: "QI-2474", p: "metro", activity: "Level 3 floor tile levelling", by: "Quality Engineer", date: "05 Oct", status: "Failed" },
  { id: "QI-2470", p: "royal", activity: "Podium slab cover blocks", by: "Quality Engineer", date: "04 Oct", status: "Passed" },
];
export const CHECKLIST = [["Bar diameter", "Pass", "12mm & 16mm as per BBS", true], ["Spacing", "Pass", "150mm c/c verified at 12 spots", true], ["Cover block", "Pass", "25mm — all spots OK", true], ["Lap length", "Pass", "50d confirmed", false], ["Beam reinforcement", "Pass", "Stirrup spacing matches STR-104 R4", true], ["Drawing compliance", "Pass", "R4 (latest) used", false]];
export const SNAGS = [
  { id: "SNG-184", p: "metro", area: "Level 3 — Lobby", issue: "Uneven tile alignment", sev: "Medium", assigned: "Sharma Interiors", due: "08 Oct", status: "Open" },
  { id: "SNG-183", p: "metro", area: "Level 2 — Food court", issue: "Ceiling grid sag at gridline C4", sev: "High", assigned: "Shree Interiors", due: "09 Oct", status: "Open" },
  { id: "SNG-179", p: "skyline", area: "Tower A — Floor 7", issue: "Plaster cracks near window lintel", sev: "Low", assigned: "Shivam Civil", due: "12 Oct", status: "Open" },
  { id: "SNG-176", p: "orion", area: "Basement 1", issue: "Seepage at construction joint", sev: "High", assigned: "Eastern Structural", due: "07 Oct", status: "Open" },
  { id: "SNG-170", p: "royal", area: "Podium", issue: "Honeycombing on column C12", sev: "Medium", assigned: "Om Sai / Vikas", due: "03 Oct", status: "Closed" },
];
export const SAFETY_STATS = { daysClear: 47, inspections: 36, open: 9, nearMiss: 4, incidents: 0, ppe: 94 };
export const SAFETY_CHECK = [["Helmet", "Pass"], ["Safety shoes", "Pass"], ["Harness", "Pass"], ["Barricading", "Fail"], ["Electrical safety", "Pass"], ["Scaffolding", "Fail"], ["Fire extinguisher", "Pass"], ["Housekeeping", "Pass"], ["Emergency access", "Pass"]];
export const INCIDENTS = [
  { id: "SI-061", p: "orion", type: "Near miss", date: "04 Oct", loc: "Block A, Level 6", person: "Raju Tudu (Carpenter)", sev: "Medium", desc: "Unsecured shuttering plank fell from 6th floor edge. No injury.", action: "Area cordoned; toolbox talk done", root: "Edge protection not in place", corrective: "Install toe-boards & edge netting by 08 Oct", status: "Open" },
  { id: "SI-060", p: "skyline", type: "Unsafe act", date: "03 Oct", loc: "Tower B, Level 11", person: "Contractor crew", sev: "Low", desc: "Workers without harness near slab edge.", action: "Work stopped for 20 mins; PPE re-briefed", root: "Supervisor lapse", corrective: "Daily PPE audit at 8 AM", status: "Closed" },
  { id: "SI-058", p: "riverside", type: "Equipment", date: "02 Oct", loc: "Block B", person: "Sohan Lal (Operator)", sev: "Medium", desc: "Crane hydraulic hose burst under load; load grounded safely.", action: "Crane tagged out", root: "Hose past service life", corrective: "Replace all hoses; fleet check", status: "Open" },
];

/* ───────── Client billing ───────── */
export const RA_FLOW = ["Work Executed", "Measurement", "Bill Preparation", "Client Submission", "Client Certification", "Invoice", "Payment"];
export const RA_BILLS = [
  { id: "RA-08", p: "orion", client: "Orion Realty", submitted: 82.6, certified: 76.4, deduction: 6.2, received: 4, outstanding: 72.4, days: 18, step: 6 },
  { id: "RA-09", p: "greenfield", client: "Ranchi Industrial Corporation", submitted: 236, certified: 0, deduction: 0, received: 0, outstanding: 0, days: 0, step: 3 },
  { id: "RA-11", p: "skyline", client: "Urban Living Developers", submitted: 148, certified: 139, deduction: 9, received: 139, outstanding: 0, days: 0, step: 7 },
  { id: "RA-12", p: "skyline", client: "Urban Living Developers", submitted: 126, certified: 118, deduction: 8, received: 52, outstanding: 66, days: 9, step: 6 },
  { id: "RA-05", p: "metro", client: "Metro Retail Ventures", submitted: 68, certified: 62, deduction: 6, received: 40, outstanding: 22, days: 12, step: 6 },
  { id: "RA-07", p: "eastern", client: "Eastern Business Group", submitted: 92, certified: 88, deduction: 4, received: 61, outstanding: 27, days: 7, step: 6 },
  { id: "RA-03", p: "royal", client: "Royal Estate Developers", submitted: 54, certified: 51, deduction: 3, received: 51, outstanding: 0, days: 0, step: 7 },
  { id: "RA-04", p: "riverside", client: "Urban Living Developers", submitted: 41, certified: 36, deduction: 5, received: 20, outstanding: 16, days: 14, step: 6 },
];
export const MEASUREMENTS = [
  { id: "MB-212-01", p: "skyline", boq: "1.3 RCC M30", loc: "Tower B — Slab L11", l: 38.4, w: 22.6, h: 0.15, unit: "CUM", measured: "Rahul Sinha", verified: "QS — Neha Gupta", client: "Approved" },
  { id: "MB-212-02", p: "skyline", boq: "1.4 Brick masonry", loc: "Tower A — L9 external wall", l: 62.0, w: 0.23, h: 3.0, unit: "CUM", measured: "Site Engineer", verified: "QS — Neha Gupta", client: "Pending" },
  { id: "MB-212-03", p: "skyline", boq: "7.1 Plaster", loc: "Tower A — L8 flat 801–804", l: 112.0, w: 1, h: 3.0, unit: "SQM", measured: "Site Engineer", verified: "QS — Neha Gupta", client: "Approved" },
  { id: "MB-188-07", p: "orion", boq: "1.3 RCC M35", loc: "Block A — Column C1–C14", l: 0.6, w: 0.6, h: 3.2, unit: "CUM", measured: "Manish Verma", verified: "QS", client: "Approved" },
];
export const CHANGE_ORDERS = [
  { id: "CO-044", p: "metro", scope: "Additional false ceiling — Level 2 corridor", value: 8.4, days: 6, approval: "Pending", exec: "Not started", billing: "—" },
  { id: "CO-041", p: "skyline", scope: "Upgrade lobby flooring to Italian marble", value: 14.2, days: 4, approval: "Approved", exec: "Planned", billing: "—" },
  { id: "CO-038", p: "orion", scope: "Additional basement dewatering sump", value: 5.1, days: 3, approval: "Approved", exec: "Completed", billing: "In RA-08" },
  { id: "CO-036", p: "royal", scope: "Relocate STP to north boundary", value: 11.6, days: 9, approval: "Pending", exec: "Not started", billing: "—" },
];
export const PAYABLE = { total: 4.3, week: 1.4, overdue: 0.6, retention: 0.52, supplier: 2.5, contractor: 1.8 };
export const VENDOR_BILLS = [
  { id: "VB-3318", vendor: "JSW Authorized Distributor", type: "Supplier", p: "skyline", amount: 12.2e5, due: "10 Oct", status: "Pending" },
  { id: "VB-3316", vendor: "UltraTech Cement Dealer", type: "Supplier", p: "skyline", amount: 8.9e5, due: "08 Oct", status: "Overdue" },
  { id: "VB-3312", vendor: "Tata Steel Partner", type: "Supplier", p: "orion", amount: 14.7e5, due: "12 Oct", status: "Pending" },
  { id: "VB-3309", vendor: "Kajaria Distribution", type: "Supplier", p: "metro", amount: 7.3e5, due: "05 Oct", status: "Overdue" },
  { id: "VB-3301", vendor: "Astral Pipes Distributor", type: "Supplier", p: "eastern", amount: 3.4e5, due: "15 Oct", status: "Pending" },
  { id: "VB-3298", vendor: "Asian Paints Dealer", type: "Supplier", p: "metro", amount: 5.2e5, due: "14 Oct", status: "Pending" },
  { id: "CB-0932", vendor: "Eastern Structural Works", type: "Contractor", p: "orion", amount: 18.4e5, due: "10 Oct", status: "Pending" },
  { id: "CB-0931", vendor: "Shivam Civil Contractors", type: "Contractor", p: "skyline", amount: 31.2e5, due: "12 Oct", status: "Pending" },
];
export const PAYMENTS = [
  { id: "PY-9921", dir: "In", party: "Ranchi Industrial Corporation", p: "greenfield", amount: 28e5, date: "06 Oct", mode: "RTGS", ref: "RA-08" },
  { id: "PY-9920", dir: "Out", party: "Ranchi Electrical Projects", p: "greenfield", amount: 6e5, date: "03 Oct", mode: "NEFT", ref: "CB-0925" },
  { id: "PY-9918", dir: "In", party: "Urban Living Developers", p: "skyline", amount: 52e5, date: "02 Oct", mode: "RTGS", ref: "RA-12" },
  { id: "PY-9915", dir: "Out", party: "JSW Authorized Distributor", p: "skyline", amount: 21.4e5, date: "01 Oct", mode: "RTGS", ref: "VB-3290" },
  { id: "PY-9910", dir: "In", party: "Eastern Business Group", p: "eastern", amount: 18e5, date: "30 Sep", mode: "NEFT", ref: "RA-07" },
  { id: "PY-9904", dir: "Out", party: "Om Sai Plumbing", p: "royal", amount: 2.1e5, date: "28 Sep", mode: "NEFT", ref: "CB-0919" },
  { id: "PY-9899", dir: "In", party: "Orion Realty", p: "orion", amount: 4e5, date: "26 Sep", mode: "Cheque", ref: "RA-08" },
];
export const CASHFLOW_PROJECT = [
  { m: "Jul", inflow: 1.2, material: 0.7, contractor: 0.4, labour: 0.15, overhead: 0.08 },
  { m: "Aug", inflow: 1.5, material: 0.8, contractor: 0.5, labour: 0.16, overhead: 0.08 },
  { m: "Sep", inflow: 1.1, material: 0.9, contractor: 0.55, labour: 0.17, overhead: 0.08 },
  { m: "Oct", inflow: 1.4, material: 0.85, contractor: 0.5, labour: 0.17, overhead: 0.08 },
  { m: "Nov", inflow: 1.7, material: 0.9, contractor: 0.55, labour: 0.17, overhead: 0.08, f: 1 },
  { m: "Dec", inflow: 1.9, material: 0.95, contractor: 0.6, labour: 0.18, overhead: 0.08, f: 1 },
  { m: "Jan", inflow: 1.6, material: 0.8, contractor: 0.55, labour: 0.17, overhead: 0.08, f: 1 },
].map((r) => ({ ...r, net: +(r.inflow - r.material - r.contractor - r.labour - r.overhead).toFixed(2) }));

/* ───────── Documents ───────── */
export const FOLDERS = [["Contracts", 24], ["Drawings", 312], ["BOQ", 18], ["Purchase Orders", 186], ["Bills", 241], ["Invoices", 96], ["Approvals", 74], ["Quality Reports", 148], ["Safety", 62], ["Photos", 4812], ["Minutes of Meeting", 53]];
export const DRAWINGS = [
  { no: "STR-104", title: "Tower B — Slab reinforcement L10–L14", rev: "R4", status: "Current", issued: "02 Oct", approved: "05 Oct", consultant: "Structura Consultants", p: "skyline", latest: "R4", used: "R2", warn: "Revision R2 is outdated. R4 is currently approved for construction." },
  { no: "STR-101", title: "Tower A — Typical floor framing", rev: "R3", status: "Current", issued: "14 Aug", approved: "20 Aug", consultant: "Structura Consultants", p: "skyline", latest: "R3" },
  { no: "ARC-210", title: "Tower C — Unit layouts", rev: "R2", status: "Current", issued: "01 Sep", approved: "08 Sep", consultant: "Studio Arth", p: "skyline", latest: "R2" },
  { no: "MEP-330", title: "Club house — HVAC layout", rev: "R1", status: "Draft", issued: "29 Sep", approved: "—", consultant: "Apex MEP Solutions", p: "skyline", latest: "R1" },
  { no: "STR-402", title: "Orion Block A — Basement raft", rev: "R5", status: "Current", issued: "22 Aug", approved: "30 Aug", consultant: "Structura Consultants", p: "orion", latest: "R5" },
  { no: "ARC-118", title: "Metro Mall — L2 false ceiling", rev: "R3", status: "Outdated", issued: "10 Aug", approved: "12 Aug", consultant: "Studio Arth", p: "metro", latest: "R4", warn: "Revision R3 is outdated. R4 is currently approved for construction." },
];

/* ───────── Expenses ───────── */
export const EXPENSES = [
  { id: "EX-5524", p: "skyline", cat: "Fuel", desc: "Diesel — DG set & crane", amt: 38400, by: "Vikas Singh", date: "06 Oct", receipt: true, status: "Approved" },
  { id: "EX-5523", p: "skyline", cat: "Transport", desc: "Material shuttle — Ranchi yard", amt: 12600, by: "Rahul Sinha", date: "06 Oct", receipt: true, status: "Pending" },
  { id: "EX-5521", p: "riverside", cat: "Repair", desc: "Emergency crane hire", amt: 42000, by: "Amit Kumar", date: "06 Oct", receipt: true, status: "Pending" },
  { id: "EX-5518", p: "orion", cat: "Food", desc: "Night shift meals", amt: 9200, by: "Manish Verma", date: "05 Oct", receipt: false, status: "Pending" },
  { id: "EX-5515", p: "metro", cat: "Tools", desc: "Tile cutters & levelling clips", amt: 18800, by: "Priya Sharma", date: "05 Oct", receipt: true, status: "Approved" },
  { id: "EX-5511", p: "eastern", cat: "Electricity", desc: "Temporary connection bill", amt: 24100, by: "Neha Gupta", date: "04 Oct", receipt: true, status: "Approved" },
  { id: "EX-5507", p: "royal", cat: "Security", desc: "Security agency — Sept", amt: 64000, by: "Vikas Singh", date: "03 Oct", receipt: true, status: "Approved" },
  { id: "EX-5503", p: "greenfield", cat: "Site Office", desc: "Stationery & printing", amt: 6400, by: "Prakash Yadav", date: "03 Oct", receipt: false, status: "Approved" },
];
export const PETTY = PROJECTS.map((p, i) => ({ p: p.id, opening: 50000 + i * 5000, received: 80000 + i * 10000, spent: 78000 + i * 8200, pending: [2, 4, 1, 0, 3, 1, 5][i] })).map((r) => ({ ...r, balance: r.opening + r.received - r.spent }));

/* ───────── Tasks & Gantt ───────── */
export const TASKS = [
  { id: "T-901", p: "skyline", title: "Expedite 18 MT TMT 12mm delivery", owner: "Purchase Manager", due: "07 Oct", prio: "Critical", status: "In Progress" },
  { id: "T-899", p: "skyline", title: "Tower B L11 slab reinforcement inspection", owner: "Quality Engineer", due: "06 Oct", prio: "High", status: "Done" },
  { id: "T-897", p: "skyline", title: "Replace crane TC-02 hydraulic hose", owner: "Equipment In-charge", due: "08 Oct", prio: "High", status: "In Progress" },
  { id: "T-893", p: "skyline", title: "Update BBS to STR-104 R4", owner: "Planning Engineer", due: "07 Oct", prio: "Medium", status: "Open" },
  { id: "T-890", p: "riverside", title: "Add 8 workers on Block B reinforcement", owner: "Contractor Manager", due: "08 Oct", prio: "Critical", status: "Open" },
  { id: "T-886", p: "orion", title: "Follow up RA Bill #08 with client", owner: "Accounts Manager", due: "07 Oct", prio: "Critical", status: "In Progress" },
  { id: "T-880", p: "metro", title: "Rework Level 3 lobby tile alignment", owner: "Shree Interiors", due: "08 Oct", prio: "High", status: "Open" },
  { id: "T-874", p: "royal", title: "Podium slab pour — pour card sign-off", owner: "Vikas Singh", due: "10 Oct", prio: "Medium", status: "Open" },
  { id: "T-871", p: "greenfield", title: "Commission DG & transformer", owner: "Ranchi Electrical", due: "14 Oct", prio: "Medium", status: "In Progress" },
  { id: "T-860", p: "eastern", title: "Dock leveller delivery confirmation", owner: "Neha Gupta", due: "12 Oct", prio: "Low", status: "Open" },
];
// Gantt: day offsets from project start (Skyline, start 15 Jan 2026), durations in days
export const GANTT = [
  { id: "g1", lvl: 0, name: "Skyline Residency", type: "Project", s: 0, d: 409, prog: 62, resp: "Rahul Sinha" },
  { id: "g2", lvl: 1, name: "Substructure", type: "Phase", s: 0, d: 120, prog: 100, resp: "Shivam Civil" },
  { id: "g3", lvl: 2, name: "Foundation complete", type: "Milestone", s: 118, d: 2, prog: 100, resp: "Rahul Sinha" },
  { id: "g4", lvl: 1, name: "Structure", type: "Phase", s: 121, d: 198, prog: 78, resp: "Eastern Structural", crit: true },
  { id: "g5", lvl: 2, name: "Tower A", type: "Activity", s: 121, d: 150, prog: 100, resp: "Shivam Civil" },
  { id: "g6", lvl: 3, name: "Column Work", type: "Task", s: 121, d: 60, prog: 100, resp: "Shivam Civil" },
  { id: "g7", lvl: 3, name: "Slab Work", type: "Task", s: 160, d: 100, prog: 100, resp: "Shivam Civil" },
  { id: "g8", lvl: 3, name: "Staircase", type: "Task", s: 230, d: 40, prog: 100, resp: "Shivam Civil" },
  { id: "g9", lvl: 3, name: "Waterproofing", type: "Task", s: 262, d: 24, prog: 88, resp: "Apex MEP" },
  { id: "g10", lvl: 2, name: "Tower B", type: "Activity", s: 150, d: 169, prog: 78, resp: "Eastern Structural", crit: true },
  { id: "g11", lvl: 3, name: "Steel Procurement", type: "Task", s: 232, d: 12, prog: 60, resp: "Purchase Manager", crit: true, delay: 4 },
  { id: "g12", lvl: 3, name: "Block B Reinforcement", type: "Task", s: 246, d: 22, prog: 55, resp: "Eastern Structural", crit: true, delay: 3, dep: "g11" },
  { id: "g13", lvl: 3, name: "Slab Casting", type: "Task", s: 268, d: 8, prog: 0, resp: "Shivam Civil", crit: true, dep: "g12" },
  { id: "g14", lvl: 1, name: "Masonry", type: "Phase", s: 200, d: 150, prog: 52, resp: "Shivam Civil", crit: true, dep: "g13" },
  { id: "g15", lvl: 1, name: "MEP", type: "Phase", s: 243, d: 128, prog: 22, resp: "Apex MEP" },
  { id: "g16", lvl: 1, name: "Finishes", type: "Phase", s: 290, d: 102, prog: 6, resp: "Shree Interiors" },
  { id: "g17", lvl: 2, name: "Handover", type: "Milestone", s: 407, d: 2, prog: 0, resp: "Rahul Sinha" },
];
export const CRIT_PATH = [
  { s: "Steel Procurement", note: "4 days late", tone: "bad" },
  { s: "Block B Reinforcement", note: "waiting on steel", tone: "warn" },
  { s: "Slab Casting", note: "starts 4 days late", tone: "warn" },
  { s: "Masonry Start", note: "project impact: 3 days", tone: "warn" },
];

/* ───────── DPR & Photos ───────── */
export const DPR_ACTIVITIES = [
  { a: "Tower A slab shuttering", r: "85% completed", tone: "good" },
  { a: "Tower B reinforcement", r: "1.8 MT fixed", tone: "good" },
  { a: "Plumbing Block A", r: "12 units completed", tone: "good" },
  { a: "External drainage", r: "42 meters completed", tone: "good" },
];
export const DAILY_STORY = [
  { t: "07:45 AM", e: "146 workers checked in", ico: "users" },
  { t: "08:10 AM", e: "Concrete pouring started — Tower A", ico: "build" },
  { t: "10:42 AM", e: "18 MT steel delivery arrived", ico: "truck" },
  { t: "12:20 PM", e: "Quality inspection passed", ico: "check" },
  { t: "02:40 PM", e: "Crane stopped — hydraulic issue", ico: "warn", tone: "bad" },
  { t: "04:18 PM", e: "Tower A slab completed", ico: "flag", tone: "good" },
  { t: "06:02 PM", e: "Daily progress submitted", ico: "doc" },
];
export const PHOTOS = [
  { id: "ph1", p: "skyline", date: "06 Oct", loc: "Tower A", floor: "L14", act: "Slab casting", contractor: "Shivam Civil", tag: "Progress", prog: 71, tone: "day" },
  { id: "ph2", p: "skyline", date: "06 Oct", loc: "Tower B", floor: "L11", act: "Reinforcement", contractor: "Eastern Structural", tag: "Quality", prog: 54, tone: "day" },
  { id: "ph3", p: "skyline", date: "05 Oct", loc: "Club House", floor: "G+2", act: "Waterproofing", contractor: "Apex MEP", tag: "Progress", prog: 66, tone: "dusk" },
  { id: "ph4", p: "skyline", date: "05 Oct", loc: "External", floor: "—", act: "Storm drain", contractor: "Shivam Civil", tag: "Progress", prog: 47, tone: "day" },
  { id: "ph5", p: "skyline", date: "04 Oct", loc: "Tower C", floor: "L6", act: "Column shuttering", contractor: "Shivam Civil", tag: "Issue", prog: 38, tone: "day" },
  { id: "ph6", p: "skyline", date: "03 Oct", loc: "Tower A", floor: "L9", act: "Brickwork", contractor: "Shivam Civil", tag: "Progress", prog: 69, tone: "dusk" },
  { id: "ph7", p: "orion", date: "06 Oct", loc: "Block A", floor: "L6", act: "Column casting", contractor: "Eastern Structural", tag: "Safety", prog: 41, tone: "day" },
  { id: "ph8", p: "metro", date: "06 Oct", loc: "Level 3", floor: "Lobby", act: "Tile fixing", contractor: "Shree Interiors", tag: "Snag", prog: 83, tone: "day" },
];
