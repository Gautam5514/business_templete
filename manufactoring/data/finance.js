import { PRODUCTS, CUSTOMERS } from "./masters";
const P = (id) => PRODUCTS.find((p) => p.id === id);

export const INVOICES = [
  ["INV-2681", "Gupta Hardware", "ORD-5071", 555000, "2026-10-03", "2026-11-02", 0, "Unpaid"],
  ["INV-2680", "Bihar Home Solutions", "ORD-5082", 525000, "2026-10-05", "2026-11-19", 0, "Unpaid"],
  ["INV-2672", "Patna Bath Studio", "ORD-5068", 450000, "2026-09-30", "2026-10-30", 450000, "Paid"],
  ["INV-2668", "Bihar Home Solutions", "ORD-5066", 520000, "2026-09-28", "2026-11-12", 260000, "Partially Paid"],
  ["INV-2655", "Gupta Hardware", "ORD-5055", 490000, "2026-09-17", "2026-09-24", 0, "Overdue"],
  ["INV-2649", "Eastern Kitchen World", "ORD-5058", 740000, "2026-09-20", "2026-10-05", 0, "Overdue"],
  ["INV-2641", "Sharma Sanitary House", "ORD-5062", 1020000, "2026-09-22", "2026-10-22", 1020000, "Paid"],
  ["INV-2630", "Sharma Sanitary House", "ORD-5050", 1825000, "2026-09-12", "2026-10-12", 0, "Unpaid"],
  ["INV-2622", "Agarwal Buildmart", "ORD-5047", 1240000, "2026-09-08", "2026-10-08", 0, "Unpaid"],
  ["INV-2610", "Maa Durga Enterprises", "ORD-5044", 520000, "2026-09-04", "2026-10-04", 0, "Overdue"],
  ["INV-2604", "Eastern Kitchen World", "ORD-5040", 1570000, "2026-08-30", "2026-09-29", 0, "Overdue"],
  ["INV-2598", "Patna Bath Studio", "ORD-5038", 640000, "2026-08-26", "2026-09-25", 0, "Unpaid"],
].map(([id, customer, so, amount, date, due, paid, status]) => ({ id, customer, so, amount, date, due, paid, balance: amount - paid, status }));

export const PAYMENTS = [
  ["PAY-6120", "Patna Bath Studio", "INV-2672", 450000, "2026-10-05", "RTGS", "Cleared"],
  ["PAY-6119", "Sharma Sanitary House", "INV-2641", 1020000, "2026-10-03", "NEFT", "Cleared"],
  ["PAY-6118", "Bihar Home Solutions", "INV-2668", 260000, "2026-10-02", "UPI", "Cleared"],
  ["PAY-6117", "Agarwal Buildmart", "INV-2601", 880000, "2026-09-30", "Cheque", "Cleared"],
  ["PAY-6116", "Maa Durga Enterprises", "INV-2588", 360000, "2026-09-28", "NEFT", "Cleared"],
  ["PAY-6115", "Gupta Hardware", "INV-2570", 410000, "2026-09-25", "Cheque", "Pending"],
  ["PAY-6114", "Eastern Kitchen World", "INV-2561", 620000, "2026-09-22", "RTGS", "Cleared"],
].map(([id, customer, invoice, amount, date, mode, status]) => ({ id, customer, invoice, amount, date, mode, status }));

export const EXPENSES = [
  ["EXP-3301", "2026-10-05", "Power & Fuel", "Jharkhand State Electricity — Ranchi plant", 412000, "Priya Gupta", "Approved"],
  ["EXP-3300", "2026-10-05", "Freight", "Patna Express Cargo — DSP-8819", 38500, "Deepak Oraon", "Approved"],
  ["EXP-3299", "2026-10-04", "Maintenance", "Hydraulic oil & seal kit — HP-05", 46800, "Manoj Kumar", "Approved"],
  ["EXP-3298", "2026-10-04", "Labour", "Contract labour — packing (Sep)", 186000, "Priya Gupta", "Approved"],
  ["EXP-3297", "2026-10-03", "Power & Fuel", "Diesel — DG set, Ramgarh", 28400, "Sanjay Prasad", "Approved"],
  ["EXP-3296", "2026-10-03", "Consumables", "Polishing compound & abrasive belts", 52200, "Sunil Yadav", "Approved"],
  ["EXP-3295", "2026-10-02", "Freight", "Ranchi Roadlines — DSP-8821/8820", 32000, "Deepak Oraon", "Pending Approval"],
  ["EXP-3294", "2026-10-01", "Admin", "Plant canteen & housekeeping", 64000, "Priya Gupta", "Approved"],
  ["EXP-3293", "2026-10-01", "Maintenance", "AMC — hydraulic press service", 96000, "Manoj Kumar", "Approved"],
].map(([id, date, cat, desc, amount, by, status]) => ({ id, date, cat, desc, amount, by, status }));

/* ---------------- Costing ---------------- */
// per work order: material, matVar, labour, machine, power, packaging, rejLoss, overhead -> total
function costOf(woId, pid, units, f) {
  const p = P(pid);
  const std = p.std;
  const base = std * units;
  const material = Math.round(base * 0.7 * f.m);
  const labour = Math.round(base * 0.115 * f.l);
  const machine = Math.round(base * 0.035 * f.mc);
  const power = Math.round(base * 0.03 * f.p);
  const packaging = Math.round(base * 0.03);
  const rejLoss = Math.round(base * f.r);
  const overhead = Math.round(base * 0.065);
  const matStd = Math.round(base * 0.7);
  const total = material + labour + machine + power + packaging + rejLoss + overhead;
  return { wo: woId, pid, product: p.name, units, std, material, matVar: material - matStd, labour, machine, power, packaging, rejLoss, overhead, total, perUnit: Math.round(total / units) };
}
// WO-2841 is calibrated to ₹447 vs ₹428 standard
export const COSTS = [
  costOf("WO-2841", "P-01", 1240, { m: 1.034, l: 1.06, mc: 1.4, p: 1.08, r: 0.0124 }),
  costOf("WO-2838", "P-02", 1260, { m: 1.012, l: 1.02, mc: 1.05, p: 1.0, r: 0.007 }),
  costOf("WO-2845", "P-04", 940, { m: 1.045, l: 1.15, mc: 1.5, p: 1.1, r: 0.011 }),
  costOf("WO-2848", "P-06", 300, { m: 1.03, l: 1.2, mc: 1.8, p: 1.12, r: 0.02 }),
  costOf("WO-2837", "P-01", 1800, { m: 1.016, l: 1.03, mc: 1.1, p: 1.0, r: 0.0075 }),
  costOf("WO-2836", "P-02", 1200, { m: 1.004, l: 1.0, mc: 1.0, p: 0.98, r: 0.004 }),
  costOf("WO-2835", "P-04", 2000, { m: 1.01, l: 1.02, mc: 1.1, p: 1.02, r: 0.006 }),
  costOf("WO-2834", "P-03", 600, { m: 1.008, l: 0.99, mc: 1.0, p: 1.0, r: 0.005 }),
];
// calibrate WO-2841 per-unit to 447
{
  const c = COSTS[0];
  const target = 447 * c.units;
  c.overhead += target - c.total; c.total = target; c.perUnit = 447;
}
export const VARIANCE = {
  total: 19, // ₹/unit for WO-2841
  rows: [
    ["Material Variance", 8.2, "Higher steel usage — +160 kg over standard on ISS-7712 (blank nesting loss) and 54 rejected units"],
    ["Labour Variance", 2.9, "Overtime on morning shift to recover P-04 downtime"],
    ["Machine Variance", 3.1, "P-04 downtime 1 h 52 m — fixed machine cost spread over fewer units"],
    ["Energy Variance", 1.4, "Re-heat cycles and idle press power during die jam"],
    ["Rejection Loss", 3.4, "54 rejected (4.4%) vs 2.5% standard allowance — surface dent & welding"],
  ],
  trend: [["May", 6], ["Jun", 9], ["Jul", 7], ["Aug", 12], ["Sep", 14], ["Oct", 19]].map(([label, v]) => ({ label, v })),
};

export const FINANCE = {
  sales: 7420000, collections: 5180000, rmPurchases: 3860000, production: 5240000, labour: 842000, power: 612000, maintenance: 684000,
  packaging: 312000, freight: 286000, margin: 27.4, outstanding: 14480000 + 0, payable: 6356000,
  byMonth: [["Apr", 18.2, 14.6, 4.1], ["May", 20.4, 16.1, 4.6], ["Jun", 19.6, 15.9, 4.2], ["Jul", 22.1, 17.4, 5.0], ["Aug", 23.8, 18.6, 5.4], ["Sep", 24.6, 19.2, 5.6]].map(([label, sales, cost, margin]) => ({ label, sales, cost, margin })),
  costSplit: [["Raw material", 3860000, "#24384a"], ["Labour", 842000, "#8fa3b5"], ["Power", 612000, "#a15c07"], ["Maintenance", 684000, "#b42318"], ["Packaging", 312000, "#157347"], ["Freight", 286000, "#1d5fa8"]].map(([name, value, color]) => ({ name, value, color })),
};
export const profitability = PRODUCTS.map((p) => ({ product: p.name, price: p.price, cost: p.std, margin: Math.round(((p.price - p.std) / p.price) * 1000) / 10 }));
void CUSTOMERS;
