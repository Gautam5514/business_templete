import { CUSTOMERS, PRODUCTS, SUPERVISORS, LINES, bomCost, BOM, MATERIALS, mat } from "./masters";

export const rng = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const R = rng(42);
const ri = (a, b) => Math.round(a + R() * (b - a));
const P = (id) => PRODUCTS.find((p) => p.id === id);

/* ---------------- Sales orders ---------------- */
// id, customer, product, qty, stock, prodReq, dispatch, priority, status
const SO = [
  ["ORD-5084", "Sharma Sanitary House", "P-01", 2500, 640, 1860, "2026-10-10", "High", "In Production", "WO-2841"],
  ["ORD-5091", "Agarwal Buildmart", "P-01", 1200, 400, 800, "2026-10-12", "Medium", "Production Required", "WO-2849"],
  ["ORD-5097", "Patna Bath Studio", "P-01", 900, 180, 720, "2026-10-14", "Medium", "Production Required", "WO-2849"],
  ["ORD-5079", "Gupta Hardware", "P-02", 1500, 0, 1500, "2026-10-08", "High", "In Production", "WO-2838"],
  ["ORD-5088", "Bihar Home Solutions", "P-04", 3000, 0, 3000, "2026-10-12", "High", "In Production", "WO-2845"],
  ["ORD-5090", "Eastern Kitchen World", "P-03", 600, 0, 600, "2026-10-15", "Medium", "Production Required", "WO-2850"],
  ["ORD-5093", "Maa Durga Enterprises", "P-06", 800, 0, 800, "2026-10-09", "High", "In Production", "WO-2848"],
  ["ORD-5086", "Sharma Sanitary House", "P-05", 4000, 3200, 800, "2026-10-13", "Low", "Partially Ready", "WO-2852"],
  ["ORD-5075", "Agarwal Buildmart", "P-02", 800, 800, 0, "2026-10-07", "Medium", "Ready", null],
  ["ORD-5096", "Agarwal Buildmart", "P-05", 2000, 2000, 0, "2026-10-08", "Low", "Ready", null],
  ["ORD-5099", "Eastern Kitchen World", "P-01", 500, 0, 500, "2026-10-18", "Low", "New", "WO-2855"],
  ["ORD-5100", "Maa Durga Enterprises", "P-04", 1200, 0, 1200, "2026-10-20", "Medium", "New", null],
  ["ORD-5101", "Sharma Sanitary House", "P-06", 400, 0, 400, "2026-10-17", "Medium", "Approved", "WO-2856"],
  ["ORD-5082", "Bihar Home Solutions", "P-01", 700, 700, 0, "2026-10-05", "Medium", "Dispatched", null],
  ["ORD-5071", "Gupta Hardware", "P-03", 300, 300, 0, "2026-10-03", "Medium", "Dispatched", null],
  ["ORD-5068", "Patna Bath Studio", "P-01", 600, 600, 0, "2026-09-28", "Low", "Delivered", null],
  ["ORD-5066", "Bihar Home Solutions", "P-02", 1000, 1000, 0, "2026-09-26", "Low", "Delivered", null],
  ["ORD-5062", "Sharma Sanitary House", "P-04", 1500, 1500, 0, "2026-09-22", "Medium", "Delivered", null],
  ["ORD-5058", "Eastern Kitchen World", "P-03", 400, 400, 0, "2026-09-20", "Low", "Delivered", null],
  ["ORD-5055", "Gupta Hardware", "P-02", 1200, 1200, 0, "2026-09-17", "Low", "Delivered", null],
];
export const SALES_ORDERS = SO.map(([id, customer, pid, qty, stock, prodReq, dispatch, priority, status, wo]) => {
  const p = P(pid);
  const d = new Date(dispatch);
  const odate = new Date(d); odate.setDate(odate.getDate() - ri(7, 12));
  return { id, customer, pid, product: p.name, qty, value: qty * p.price, stock, prodReq, dispatch, priority, status, wo, date: odate.toISOString().slice(0, 10) };
});
export const so = (id) => SALES_ORDERS.find((s) => s.id === id);

/* ---------------- Work orders ---------------- */
const T = (d, h = 8, m = 0) => `2026-10-${String(d).padStart(2, "0")}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
// id, so, pid, planned, produced, accepted, rejected, wip, start, due, line, supervisor, status
const WO = [
  ["WO-2841", "ORD-5084", "P-01", 2000, 1240, 1186, 54, 136, T(6, 8), T(7, 16), "Line 2", "Vijay Kumar", "Running"],
  ["WO-2838", "ORD-5079", "P-02", 1500, 1260, 1226, 34, 62, T(4, 8), T(7, 20), "Line 1", "Rajesh Yadav", "Running"],
  ["WO-2845", "ORD-5088", "P-04", 3000, 940, 910, 30, 210, T(5, 8), T(10, 18), "Line 3", "Sanjay Prasad", "Material Pending"],
  ["WO-2848", "ORD-5093", "P-06", 800, 300, 284, 16, 96, T(6, 14), T(9, 18), "Line 4", "Imran Ansari", "Paused"],
  ["WO-2849", "ORD-5091", "P-01", 1500, 0, 0, 0, 0, T(7, 16, 30), T(9, 20), "Line 2", "Vijay Kumar", "Ready"],
  ["WO-2850", "ORD-5090", "P-03", 800, 0, 0, 0, 0, T(8, 12), T(12, 18), "Line 1", "Rajesh Yadav", "Planned"],
  ["WO-2852", "ORD-5086", "P-05", 1000, 0, 0, 0, 0, T(13, 8), T(14, 18), "Line 3", "Sanjay Prasad", "Planned"],
  ["WO-2855", "ORD-5099", "P-01", 500, 0, 0, 0, 0, T(10, 8), T(11, 16), "Line 2", "Vijay Kumar", "Planned"],
  ["WO-2856", "ORD-5101", "P-06", 300, 0, 0, 0, 0, T(9, 20), T(11, 12), "Line 4", "Imran Ansari", "Material Pending"],
  ["WO-2837", "ORD-5082", "P-01", 1800, 1800, 1752, 48, 0, T(2, 8), T(5, 16), "Line 2", "Vijay Kumar", "Completed"],
  ["WO-2836", "ORD-5075", "P-02", 1200, 1200, 1178, 22, 0, T(1, 8), T(4, 16), "Line 1", "Rajesh Yadav", "Completed"],
  ["WO-2835", "ORD-5062", "P-04", 2000, 2000, 1962, 38, 0, T(1, 8), T(5, 12), "Line 3", "Sanjay Prasad", "Completed"],
  ["WO-2834", "ORD-5071", "P-03", 600, 600, 584, 16, 0, "2026-09-28T08:00:00", T(2, 18), "Line 1", "Rajesh Yadav", "Completed"],
  ["WO-2833", "ORD-5096", "P-05", 3000, 3000, 2948, 52, 0, "2026-09-27T08:00:00", T(1, 18), "Line 3", "Sanjay Prasad", "Completed"],
  ["WO-2832", "ORD-5093", "P-06", 700, 700, 684, 16, 0, "2026-09-25T08:00:00", "2026-09-30T18:00:00", "Line 4", "Imran Ansari", "Completed"],
  ["WO-2840", "—", "P-05", 1500, 0, 0, 0, 0, T(3, 8), T(4, 18), "Line 3", "Sanjay Prasad", "Cancelled"],
];
const fill = [];
{
  const lines = ["Line 1", "Line 2", "Line 3", "Line 4"];
  const lineOf = { "P-01": "Line 2", "P-02": "Line 1", "P-03": "Line 1", "P-04": "Line 3", "P-05": "Line 3", "P-06": "Line 4" };
  const sups = { "Line 1": "Rajesh Yadav", "Line 2": "Vijay Kumar", "Line 3": "Sanjay Prasad", "Line 4": "Imran Ansari" };
  for (let i = 0; i < 28; i++) {
    const pid = PRODUCTS[Math.floor(R() * 6)].id;
    const planned = ri(5, 30) * 100;
    const day = 14 + Math.floor(i * 0.9);
    const startDay = Math.min(day, 31);
    const line = lineOf[pid];
    const st = i % 7 === 3 ? "Material Pending" : i < 8 ? "Ready" : "Planned";
    fill.push([`WO-${2857 + i}`, i % 3 === 0 ? "MTS" : `ORD-${5102 + (i % 10)}`, pid, planned, 0, 0, 0, 0, T(startDay, 8), T(Math.min(startDay + 2, 31), 18), line, sups[line], st]);
  }
  void lines;
}
export const WORK_ORDERS = [...WO, ...fill].map(([id, soId, pid, planned, produced, accepted, rejected, wip, start, due, line, supervisor, status]) => {
  const p = P(pid);
  return { id, so: soId, pid, product: p.name, short: p.short, planned, produced, accepted, rejected, wip, remaining: planned - produced, start, due, line, supervisor, status, progress: planned ? Math.round((produced / planned) * 100) : 0, customer: so(soId)?.customer ?? "Stock replenishment" };
});
export const wo = (id) => WORK_ORDERS.find((w) => w.id === id);
export const PENDING_WOS = WORK_ORDERS.filter((w) => !["Completed", "Cancelled"].includes(w.status));

/* ---------------- Production planning ---------------- */
// pid, demand, stock, shortage, plan, line, start, end, priority, status, capacity %
const PLAN = [
  ["P-01", 4600, 1220, 3380, 3500, "Line 2", "2026-10-06", "2026-10-09", "High", "In Production", 88, "ORD-5084 · ORD-5091 · ORD-5097"],
  ["P-02", 2300, 1040, 1260, 1500, "Line 1", "2026-10-04", "2026-10-08", "High", "In Production", 74, "ORD-5079 · ORD-5075"],
  ["P-03", 900, 120, 780, 800, "Line 1", "2026-10-08", "2026-10-12", "Medium", "Planned", 52, "ORD-5090 · MTS"],
  ["P-04", 4200, 640, 3560, 3600, "Line 3", "2026-10-05", "2026-10-14", "High", "Material Pending", 96, "ORD-5088 · ORD-5100"],
  ["P-05", 6000, 5200, 800, 1000, "Line 3", "2026-10-13", "2026-10-14", "Low", "Planned", 28, "ORD-5086 · ORD-5096"],
  ["P-06", 1200, 120, 1080, 1100, "Line 4", "2026-10-06", "2026-10-11", "High", "Delayed", 91, "ORD-5093 · ORD-5101"],
];
export const PLANNING = PLAN.map(([pid, demand, stock, shortage, plan, line, start, end, priority, status, cap, orders]) => {
  const p = P(pid);
  const b = BOM[pid].items[0];
  return { pid, product: p.name, short: p.short, demand, stock, shortage, plan, material: b[0], materialQty: Math.round(plan * b[1]), unit: b[2], line, start, end, priority, status, cap, orders };
});

/* ---------------- Calendar (Gantt) ---------------- */
// day numbers are Oct 2026 (float). window 4..14
export const CAL_DAYS = Array.from({ length: 11 }, (_, i) => 4 + i);
export const CAL_ROWS = [
  { line: "Line 1", plant: "Ranchi", blocks: [
    { wo: "WO-2836", product: "Sink 18×16", qty: 1200, s: 4.0, e: 4.6, tone: "done" },
    { wo: "WO-2838", product: "Sink 18×16", qty: 1500, s: 4.6, e: 8.0, tone: "run" },
    { wo: "WO-2850", product: "Sink 37×18", qty: 800, s: 8.5, e: 12.8, tone: "plan" },
  ] },
  { line: "Line 2", plant: "Ranchi", blocks: [
    { wo: "WO-2837", product: "Sink 24×18", qty: 1800, s: 4.0, e: 6.33, tone: "done" },
    { wo: "WO-2841", product: "Sink 24×18", qty: 2000, s: 6.33, e: 7.67, tone: "run" },
    { wo: "WO-2849", product: "Sink 24×18", qty: 1500, s: 7.7, e: 9.9, tone: "plan" },
    { wo: "WO-2855", product: "Sink 24×18", qty: 500, s: 10.33, e: 11.67, tone: "plan" },
  ] },
  { line: "Line 3", plant: "Ramgarh", blocks: [
    { wo: "WO-2845", product: "Basin Mixer", qty: 3000, s: 5.33, e: 10.75, tone: "late" },
    { wo: "WO-2852", product: "Floor Drain", qty: 1000, s: 13.33, e: 14.75, tone: "plan" },
  ] },
  { line: "Line 4", plant: "Ramgarh", blocks: [
    { wo: "WO-2832", product: "Utility Sink", qty: 700, s: 4.0, e: 5.7, tone: "done" },
    { wo: "WO-2848", product: "Utility Sink", qty: 800, s: 6.6, e: 9.75, tone: "late" },
    { wo: "WO-2856", product: "Utility Sink", qty: 300, s: 9.85, e: 11.5, tone: "plan" },
  ] },
];

/* ---------------- MRP ---------------- */
// material, code, required, onhand, reserved, incoming, unit
export const MRP = [
  ["SS 304 Sheet 1.2mm", "RM-SS304-S12", 18600, 11200, 4300, 2000, "kg", "Tata Steel Processing Partner"],
  ["SS 202 Sheet 1.0mm", "RM-SS202-10", 6900, 18640, 6200, 0, "kg", "Eastern Metals Pvt. Ltd."],
  ["Brass Cartridge (35mm)", "RM-BRS-CART", 3600, 1480, 3000, 4000, "pcs", "Bharat Hardware Components"],
  ["Drain Coupling", "RM-DRN-01", 6400, 7200, 5800, 6000, "pcs", "Bharat Hardware Components"],
  ["Rubber Sound Pad", "RM-RUB-01", 6200, 24800, 9600, 0, "pcs", "Bharat Hardware Components"],
  ["Packaging Box", "RM-PKG-BOX", 9800, 18400, 6400, 0, "pcs", "Shree Packaging Industries"],
  ["Carton (master, 6 pcs)", "RM-CTN-01", 1800, 2100, 1400, 1200, "pcs", "Shree Packaging Industries"],
  ["SS Coil 0.8mm", "RM-SSCOIL-08", 1400, 6420, 2800, 3000, "kg", "Jindal Stainless Supply Co."],
  ["Polishing Compound", "RM-POL-01", 180, 640, 120, 0, "kg", "Ranchi Industrial Supplies"],
].map(([name, code, required, onhand, reserved, incoming, unit, supplier]) => {
  const avail = onhand - reserved;
  const shortage = Math.max(0, required - avail - incoming);
  return { name, code, required, onhand, reserved, avail, incoming, shortage, recommend: shortage ? Math.ceil((shortage * 1.05) / 100) * 100 : 0, unit, supplier };
});

/* ---------------- RM batches / lots ---------------- */
export const BATCHES = [
  ["SS304-091026-A", "SS 304 Coil 1.2mm", "Tata Steel Processing Partner", "2026-09-09", 8400, 3240, "kg", ["WO-2784", "WO-2802", "WO-2841"], "Passed", "HT-88213"],
  ["SS304-091026-B", "SS 304 Coil 1.2mm", "Tata Steel Processing Partner", "2026-09-22", 6420, 6420, "kg", ["—"], "Passed", "HT-88540"],
  ["SS304S-251126-A", "SS 304 Sheet 1.2mm", "Jindal Stainless Supply Co.", "2026-09-18", 6000, 2480, "kg", ["WO-2802", "WO-2838", "WO-2841"], "Passed", "JS-40012"],
  ["SS304S-250926-C", "SS 304 Sheet 1.2mm", "Jindal Stainless Supply Co.", "2026-09-30", 5000, 4720, "kg", ["WO-2841"], "Passed", "JS-40377"],
  ["SS202-150926-A", "SS 202 Sheet 1.0mm", "Eastern Metals Pvt. Ltd.", "2026-09-15", 9000, 4100, "kg", ["WO-2836", "WO-2838"], "Passed", "EM-2291"],
  ["SS202-290926-B", "SS 202 Sheet 1.0mm", "Eastern Metals Pvt. Ltd.", "2026-09-29", 9640, 9640, "kg", ["—"], "Passed", "EM-2340"],
  ["BRS-CART-0210", "Brass Cartridge (35mm)", "Bharat Hardware Components", "2026-09-26", 3000, 1480, "pcs", ["WO-2835", "WO-2845"], "Passed", "BH-7788"],
  ["DRN-CPL-0910", "Drain Coupling", "Bharat Hardware Components", "2026-09-27", 6000, 3100, "pcs", ["WO-2841", "WO-2848"], "Passed", "BH-7791"],
  ["PKG-BOX-3009", "Packaging Box", "Shree Packaging Industries", "2026-09-30", 12000, 8200, "pcs", ["WO-2837", "WO-2841"], "Passed", "SP-1190"],
  ["BRS-CART-0310", "Brass Cartridge (35mm)", "Bharat Hardware Components", "2026-10-03", 1200, 0, "pcs", ["WO-2845"], "Rejected", "BH-7810"],
].map(([id, material, supplier, received, qty, remaining, unit, usedIn, qc, lot]) => ({ id, material, supplier, received, qty, remaining, unit, usedIn, qc, lot }));

/* ---------------- Material issues ---------------- */
export const ISSUES = [
  ["ISS-7712", "WO-2841", "SS 304 Sheet 1.2mm", 4200, 4360, "kg", "SS304S-250926-C", "Raw Material Warehouse", "Sunil Yadav", "Vijay Kumar", "2026-10-06T07:42:00"],
  ["ISS-7711", "WO-2841", "Drain Coupling", 2000, 2000, "pcs", "DRN-CPL-0910", "Raw Material Warehouse", "Sunil Yadav", "Vijay Kumar", "2026-10-06T07:44:00"],
  ["ISS-7710", "WO-2838", "SS 202 Sheet 1.0mm", 3000, 3040, "kg", "SS202-150926-A", "Raw Material Warehouse", "Sunil Yadav", "Rajesh Yadav", "2026-10-05T14:10:00"],
  ["ISS-7709", "WO-2845", "Brass Cartridge (35mm)", 1500, 1480, "pcs", "BRS-CART-0210", "Raw Material Warehouse", "Sunil Yadav", "Sanjay Prasad", "2026-10-05T09:20:00"],
  ["ISS-7708", "WO-2841", "SS 304 Sheet 1.2mm", 1400, 1400, "kg", "SS304S-251126-A", "Raw Material Warehouse", "Sunil Yadav", "Vijay Kumar", "2026-10-06T08:05:00"],
  ["ISS-7707", "WO-2848", "SS 304 Sheet 1.2mm", 1200, 1230, "kg", "SS304S-251126-A", "Raw Material Warehouse", "Sunil Yadav", "Imran Ansari", "2026-10-06T14:15:00"],
  ["ISS-7706", "WO-2838", "Packaging Box", 1500, 1500, "pcs", "PKG-BOX-3009", "Raw Material Warehouse", "Sunil Yadav", "Rajesh Yadav", "2026-10-04T10:30:00"],
  ["ISS-7705", "WO-2837", "SS 304 Sheet 1.2mm", 6840, 6990, "kg", "SS304-091026-A", "Raw Material Warehouse", "Sunil Yadav", "Vijay Kumar", "2026-10-02T07:50:00"],
].map(([id, wo, material, std, actual, unit, batch, wh, by, to, ts]) => ({ id, wo, material, std, actual, unit, batch, wh, by, to, ts, variance: actual - std, vpct: ((actual - std) / std) * 100 }));

/* ---------------- WIP ---------------- */
export const WIP_STAGES = ["Cutting", "Forming", "Welding", "Polishing", "Finishing", "QC"];
// wo, product, cutting, forming, welding, polishing, finishing, qc, ageDays, value
export const WIP = [
  ["WO-2841", "Sink 24×18", 0, 420, 280, 190, 0, 136, 0.6, 2850000],
  ["WO-2838", "Sink 18×16", 0, 120, 160, 140, 90, 62, 1.8, 1400000],
  ["WO-2845", "Basin Mixer", 380, 520, 0, 0, 210, 210, 3.4, 1580000],
  ["WO-2848", "Utility Sink", 0, 110, 180, 140, 40, 96, 3.9, 590000],
  ["WO-2837", "Sink 24×18", 0, 0, 0, 0, 0, 38, 3.1, 120000],
  ["WO-2834", "Sink 37×18", 0, 0, 40, 60, 30, 20, 4.2, 280000],
  ["WO-2833", "Floor Drain", 0, 0, 0, 0, 60, 80, 3.6, 20000],
].map(([wo, product, cutting, forming, welding, polishing, finishing, qc, age, value]) => ({ wo, product, Cutting: cutting, Forming: forming, Welding: welding, Polishing: polishing, Finishing: finishing, QC: qc, total: cutting + forming + welding + polishing + finishing + qc, age, value }));

/* ---------------- Quality ---------------- */
export const QC = [
  ["QC-1182", "WO-2841", "P-01", "FG-061026-02", 680, 638, 42, 18, "Neha Verma", "Completed", "2026-10-06T10:20:00"],
  ["QC-1183", "WO-2848", "P-06", "FG-061026-05", 300, 284, 16, 6, "Anita Kumari", "Completed", "2026-10-06T10:45:00"],
  ["QC-1184", "WO-2838", "P-02", "FG-061026-03", 520, 506, 14, 4, "Anita Kumari", "Completed", "2026-10-06T09:40:00"],
  ["QC-1185", "WO-2845", "P-04", "FG-061026-04", 400, 388, 12, 5, "Neha Verma", "Completed", "2026-10-06T09:05:00"],
  ["QC-1186", "WO-2841", "P-01", "FG-061026-06", 136, 0, 0, 0, "Neha Verma", "In Progress", "2026-10-06T11:05:00"],
  ["QC-1181", "WO-2838", "P-02", "FG-051026-07", 740, 722, 18, 6, "Rahul Prasad", "Completed", "2026-10-05T19:20:00"],
  ["QC-1180", "WO-2837", "P-01", "FG-051026-06", 900, 876, 24, 10, "Anita Kumari", "Completed", "2026-10-05T16:10:00"],
  ["QC-1179", "WO-2845", "P-04", "FG-051026-05", 540, 522, 18, 7, "Neha Verma", "Completed", "2026-10-05T14:30:00"],
  ["QC-1178", "GRN-4412", "—", "BRS-CART-0310", 1200, 0, 1200, 0, "Neha Verma", "Rejected", "2026-10-04T11:10:00"],
  ["QC-1177", "WO-2837", "P-01", "FG-041026-04", 900, 874, 26, 12, "Rahul Prasad", "Completed", "2026-10-04T17:45:00"],
].map(([id, ref, pid, batch, inspected, accepted, rejected, rework, inspector, status, ts]) => ({ id, ref, pid, product: pid === "—" ? "Brass Cartridge (incoming)" : P(pid).name, batch, inspected, accepted, rejected, rework, inspector, status, ts, rate: inspected ? (rejected / inspected) * 100 : 0 }));
export const qc = (id) => QC.find((q) => q.id === id);

export const DEFECTS_1182 = [["Surface Dent", 19, "Press P-04 — die alignment"], ["Welding Issue", 11, "Welding Station WS-04 — current drift"], ["Scratch", 8, "Handling after polishing"], ["Dimension Failure", 4, "Blank size variation"]];
export const CHECKLIST = [
  ["Dimensions", "Pass", "Within ±0.5 mm on 20 sampled units"],
  ["Thickness", "Pass", "1.18–1.22 mm, gauge verified"],
  ["Welding quality", "Fail", "11 units with pinholes at drain-weld"],
  ["Polish finish", "Pass", "Satin finish uniform"],
  ["Scratch inspection", "Fail", "8 units with light scratches"],
  ["Drain fitting", "Pass", ""],
  ["Leak test", "Pass", "LT-01 — 0 leaks on 680 units"],
  ["Packaging condition", "N/A", "Checked at packing stage"],
].map(([item, result, note]) => ({ item, result, note }));

export const REJECTIONS = [
  // date, wo, product, defect, rejected, rework, scrap, scrapKg, process, machine, shift
  ["06 Oct", "WO-2841", "Sink 24×18", "Surface Dent", 19, 8, 11, 41.8, "Forming", "P-04", "Morning"],
  ["06 Oct", "WO-2841", "Sink 24×18", "Welding Issue", 11, 10, 1, 3.8, "Welding", "WS-04", "Morning"],
  ["06 Oct", "WO-2841", "Sink 24×18", "Scratch", 8, 0, 8, 30.4, "Polishing", "PL-02", "Morning"],
  ["06 Oct", "WO-2848", "Utility Sink", "Dimension Failure", 9, 3, 6, 33.6, "Forming", "HP-05", "Evening"],
  ["06 Oct", "WO-2845", "Basin Mixer", "Thread Defect", 12, 5, 7, 2.1, "Machining", "CNC-02", "Morning"],
  ["05 Oct", "WO-2838", "Sink 18×16", "Surface Dent", 18, 6, 12, 31.2, "Forming", "HP-01", "Evening"],
  ["05 Oct", "WO-2837", "Sink 24×18", "Welding Issue", 14, 8, 6, 22.8, "Welding", "WS-04", "Night"],
  ["05 Oct", "WO-2845", "Basin Mixer", "Plating Pit", 6, 0, 6, 1.8, "Finishing", "FIN-01", "Night"],
  ["04 Oct", "WO-2837", "Sink 24×18", "Surface Dent", 16, 4, 12, 45.6, "Forming", "P-04", "Night"],
  ["04 Oct", "WO-2838", "Sink 18×16", "Scratch", 10, 0, 10, 26, "Polishing", "PL-01", "Morning"],
].map(([date, wo, product, defect, rejected, rework, scrap, scrapKg, process, machine, shift]) => ({ date, wo, product, defect, rejected, rework, scrap, scrapKg, scrapValue: Math.round(scrapKg * 38), process, machine, shift }));
