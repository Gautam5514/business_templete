import { PRODUCTS, MATERIALS, SUPPLIERS, CUSTOMERS } from "./masters";
import { SALES_ORDERS, rng } from "./orders";
const R = rng(99);
const ri = (a, b) => Math.round(a + R() * (b - a));
const P = (id) => PRODUCTS.find((p) => p.id === id);

/* ---------------- Purchase ---------------- */
export const PURCHASE_FLOW = ["Requirement", "Requisition", "RFQ", "Quote", "Purchase Order", "In Transit", "Goods Receipt", "QC", "Stock Updated", "Supplier Invoice", "Payment"];
export const PURCHASE_FLOW_COUNTS = [6, 4, 3, 3, 9, 5, 2, 2, 14, 7, 5];

export const PRS = [
  ["PR-1838", "SS 304 Coil 1.2mm", 9700, "kg", "2026-10-09", "Production plan shortage (WO-2841, WO-2849, WO-2855)", "Production Planning", "Urgent", "Quote Received", ["Tata Steel Processing Partner", "Jindal Stainless Supply Co.", "Eastern Metals Pvt. Ltd."], "2026-10-05"],
  ["PR-1839", "Brass Cartridge (35mm)", 1800, "pcs", "2026-10-08", "WO-2845 on hold — cartridge batch BRS-CART-0310 rejected", "Production Planning", "Urgent", "RFQ Sent", ["Bharat Hardware Components"], "2026-10-05"],
  ["PR-1840", "Drain Coupling", 3000, "pcs", "2026-10-14", "Below minimum stock (reserved 5,800 of 7,200)", "Store — Sunil Yadav", "High", "Pending Approval", ["Bharat Hardware Components"], "2026-10-06"],
  ["PR-1841", "Carton (master, 6 pcs)", 1500, "pcs", "2026-10-12", "Reorder level reached", "Store — Sunil Yadav", "Medium", "Approved", ["Shree Packaging Industries"], "2026-10-04"],
  ["PR-1837", "SS 202 Sheet 1.0mm", 6000, "kg", "2026-10-15", "Monthly replenishment", "Production Planning", "Medium", "Ordered", ["Eastern Metals Pvt. Ltd."], "2026-10-02"],
  ["PR-1836", "Polishing Compound", 200, "kg", "2026-10-20", "Consumable reorder", "Store — Sunil Yadav", "Low", "Ordered", ["Ranchi Industrial Supplies"], "2026-10-01"],
].map(([id, material, qty, unit, by, reason, by2, priority, status, suppliers, date]) => ({ id, material, qty, unit, by, reason, requestedBy: by2, priority, status, suppliers, date }));

export const POS = [
  // id, supplier, material, qty, unit, rate, expected, received, status, payStatus
  ["PO-3321", "Tata Steel Processing Partner", "SS 304 Coil 1.2mm", 2000, "kg", 72, "2026-10-08", 0, "In Transit", "Unpaid"],
  ["PO-3320", "Jindal Stainless Supply Co.", "SS 304 Sheet 1.2mm", 2000, "kg", 74, "2026-10-07", 0, "In Transit", "Unpaid"],
  ["PO-3319", "Bharat Hardware Components", "Brass Cartridge (35mm)", 4000, "pcs", 92, "2026-10-04", 0, "Delayed", "Unpaid"],
  ["PO-3318", "Bharat Hardware Components", "Drain Coupling", 6000, "pcs", 22, "2026-10-09", 0, "Ordered", "Unpaid"],
  ["PO-3317", "Shree Packaging Industries", "Carton (master, 6 pcs)", 1200, "pcs", 38, "2026-10-08", 0, "In Transit", "Unpaid"],
  ["PO-3316", "Jindal Stainless Supply Co.", "SS Coil 0.8mm", 3000, "kg", 68, "2026-10-10", 0, "Ordered", "Unpaid"],
  ["PO-3315", "Tata Steel Processing Partner", "SS 304 Coil 1.2mm", 6420, "kg", 72, "2026-09-22", 6420, "Completed", "Paid"],
  ["PO-3314", "Eastern Metals Pvt. Ltd.", "SS 202 Sheet 1.0mm", 9640, "kg", 50, "2026-09-29", 9640, "Completed", "Partially Paid"],
  ["PO-3313", "Shree Packaging Industries", "Packaging Box", 12000, "pcs", 14, "2026-09-30", 12000, "Completed", "Paid"],
  ["PO-3312", "Jindal Stainless Supply Co.", "SS 304 Sheet 1.2mm", 5000, "kg", 74, "2026-09-30", 5000, "Completed", "Unpaid"],
  ["PO-3311", "Bharat Hardware Components", "Brass Cartridge (35mm)", 1200, "pcs", 92, "2026-10-03", 1200, "Partially Received", "Unpaid"],
  ["PO-3310", "Ranchi Industrial Supplies", "Welding Wire ER308", 300, "kg", 380, "2026-09-28", 300, "Completed", "Paid"],
  ["PO-3309", "Bharat Hardware Components", "Drain Coupling", 6000, "pcs", 22, "2026-09-27", 6000, "Completed", "Overdue"],
  ["PO-3308", "Tata Steel Processing Partner", "SS 304 Coil 1.2mm", 8400, "kg", 72, "2026-09-09", 8400, "Completed", "Paid"],
].map(([id, supplier, material, qty, unit, rate, expected, received, status, pay]) => ({ id, supplier, material, qty, unit, rate, value: qty * rate, expected, received, pending: qty - received, status, pay }));

export const GRNS = [
  ["GRN-4413", "PO-3315", "Tata Steel Processing Partner", "SS 304 Coil 1.2mm", 6420, 6420, 0, "SS304-091026-B", "JH-01-AB-4421", "TSP/INV/8890", "Raw Material Warehouse", "Sunil Yadav", "2026-09-22", "Passed"],
  ["GRN-4412", "PO-3311", "Bharat Hardware Components", "Brass Cartridge (35mm)", 1200, 1200, 1200, "BRS-CART-0310", "GJ-03-XY-7712", "BHC/2026/3318", "Raw Material Warehouse", "Sunil Yadav", "2026-10-03", "Rejected"],
  ["GRN-4411", "PO-3314", "Eastern Metals Pvt. Ltd.", "SS 202 Sheet 1.0mm", 9640, 9640, 0, "SS202-290926-B", "WB-26-C-3390", "EMP/9921", "Raw Material Warehouse", "Sunil Yadav", "2026-09-29", "Passed"],
  ["GRN-4410", "PO-3313", "Shree Packaging Industries", "Packaging Box", 12000, 11760, 240, "PKG-BOX-3009", "JH-01-CD-1180", "SPI/4418", "Raw Material Warehouse", "Sunil Yadav", "2026-09-30", "Passed"],
  ["GRN-4409", "PO-3312", "Jindal Stainless Supply Co.", "SS 304 Sheet 1.2mm", 5000, 5000, 0, "SS304S-250926-C", "HR-55-K-9021", "JSS/0930/17", "Raw Material Warehouse", "Sunil Yadav", "2026-09-30", "Passed"],
  ["GRN-4408", "PO-3309", "Bharat Hardware Components", "Drain Coupling", 6000, 5880, 120, "DRN-CPL-0910", "GJ-03-XY-6602", "BHC/2026/3290", "Raw Material Warehouse", "Sunil Yadav", "2026-09-27", "Passed"],
].map(([id, po, supplier, material, ordered, received, rejected, batch, vehicle, invoice, wh, by, date, qc]) => ({ id, po, supplier, material, ordered, received, rejected, accepted: received - rejected, batch, vehicle, invoice, wh, by, date, qc }));

export const SUPPLIER_INVOICES = [
  ["SINV-8890", "Tata Steel Processing Partner", "PO-3315", 462240, "2026-10-22", "Unpaid"],
  ["SINV-8871", "Eastern Metals Pvt. Ltd.", "PO-3314", 482000, "2026-10-14", "Partially Paid"],
  ["SINV-8852", "Shree Packaging Industries", "PO-3313", 168000, "2026-10-10", "Paid"],
  ["SINV-8840", "Jindal Stainless Supply Co.", "PO-3312", 370000, "2026-10-12", "Unpaid"],
  ["SINV-8801", "Bharat Hardware Components", "PO-3309", 132000, "2026-09-27", "Overdue"],
].map(([id, supplier, po, amount, due, status]) => ({ id, supplier, po, amount, due, status }));

/* ---------------- Maintenance ---------------- */
export const MAINT = [
  ["MT-901", "HP-03", "Hydraulic oil change + seal inspection", "Preventive", "2026-10-06", "Santosh Mahto", 90, "Due Today", "Runtime 482 h since last service (limit 480 h)"],
  ["MT-902", "HP-05", "Hydraulic seal replacement", "Breakdown", "2026-10-06", "Gopal Singh", 270, "In Progress", "Ramgarh Line 4 — expected restart 2:30 PM"],
  ["MT-903", "WS-04", "Torch + contact tip replacement", "Preventive", "2026-10-12", "Santosh Mahto", 45, "Scheduled", ""],
  ["MT-904", "CNC-02", "Spindle bearing check", "Scheduled Service", "2026-10-11", "Gopal Singh", 120, "Scheduled", ""],
  ["MT-905", "P-04", "Die alignment & ram guide correction", "Corrective", "2026-10-07", "Santosh Mahto", 120, "Pending", "Linked to surface-dent rejections"],
  ["MT-906", "PL-02", "Belt + abrasive change", "Preventive", "2026-10-16", "Santosh Mahto", 60, "Scheduled", ""],
  ["MT-907", "AS-01", "Torque driver calibration", "Scheduled Service", "2026-10-08", "Gopal Singh", 40, "Scheduled", ""],
  ["MT-908", "HP-01", "Lubrication system service", "Preventive", "2026-10-20", "Santosh Mahto", 80, "Scheduled", ""],
  ["MT-909", "FIN-01", "Buff wheel replacement", "Preventive", "2026-10-24", "Santosh Mahto", 30, "Scheduled", ""],
  ["MT-896", "HP-02", "Pressure valve calibration", "Preventive", "2026-09-25", "Santosh Mahto", 75, "Completed", ""],
].map(([id, machine, task, type, due, tech, down, status, note]) => ({ id, machine, task, type, due, tech, down, status, note }));

export const BREAKDOWNS = [
  ["BD-0412", "P-04", "2026-10-06T08:50:00", "Die jam — ram stuck mid-stroke", "Vikram Sinha → Vijay Kumar", "High", "WO-2841 (Line 2)", "Santosh Mahto", "Worn die guide bush", "Replaced bush, re-aligned die", "Guide bush ×2, hydraulic oil 6 L", 112, "2026-10-06T10:42:00", "Closed"],
  ["BD-0413", "HP-05", "2026-10-06T10:05:00", "Hydraulic oil leak at main cylinder seal", "Imran Ansari", "Critical", "WO-2848 (Line 4)", "Gopal Singh", "Seal degraded — 540 h since service", "Seal kit replacement in progress", "Seal kit (ordered from Ranchi Industrial Supplies)", 224, null, "In Progress"],
  ["BD-0411", "AS-01", "2026-10-06T09:10:00", "Torque driver error — cartridge fitting out of spec", "Birsa Tirkey", "Medium", "WO-2845 (Line 3)", "Gopal Singh", "Pending — material also waiting", "—", "—", 76, null, "Open"],
  ["BD-0409", "WS-04", "2026-10-03T16:20:00", "Welding arc unstable", "Suresh Munda", "Medium", "WO-2837 (Line 2)", "Santosh Mahto", "Loose earth clamp", "Re-terminated earth cable", "Cable lug", 38, "2026-10-03T17:05:00", "Closed"],
  ["BD-0407", "PL-01", "2026-10-01T11:00:00", "Polishing belt snapped", "Dinesh Lohra", "Low", "WO-2836 (Line 1)", "Santosh Mahto", "Belt end of life", "Belt replaced", "Abrasive belt ×1", 22, "2026-10-01T11:30:00", "Closed"],
].map(([id, machine, reported, issue, by, severity, affected, tech, root, action, parts, down, closed, status]) => ({ id, machine, reported, issue, by, severity, affected, tech, root, action, parts, down, closed, status }));

export const MAINT_COST = {
  total: 684000, spare: 248000, labour: 142000, external: 96000, downtime: 198000,
  byMachine: [["HP-05", 168000], ["P-04", 124000], ["HP-03", 96000], ["WS-04", 62000], ["AS-01", 54000], ["CNC-02", 48000], ["Others", 132000]],
  trend: [["May", 52000], ["Jun", 61000], ["Jul", 58000], ["Aug", 72000], ["Sep", 64000], ["Oct (6d)", 41000]].map(([label, v]) => ({ label, v })),
};

/* ---------------- Downtime ---------------- */
export const DOWNTIME_CATS = [
  ["Machine Breakdown", 224, 4.8], ["Material Shortage", 120, 3.1], ["Setup / Changeover", 96, 1.4], ["Tool Change", 54, 0.7], ["Quality Issue", 48, 0.6],
  ["Maintenance", 90, 1.2], ["Operator Unavailable", 24, 0.3], ["Power Failure", 18, 0.25], ["Other", 12, 0.1],
].map(([cat, min, lakhs]) => ({ cat, min, lost: Math.round(min * 3.1), cost: Math.round(lakhs * 10000) }));

/* ---------------- Packing & Dispatch ---------------- */
export const PACKING = [
  ["PK-2201", "WO-2838", "ORD-5079", "P-02", 1226, 1226, 980, "Packaging Box ×1,226 · Film 736 m · Carton ×205", "Packing Team A", "Packing"],
  ["PK-2202", "WO-2841", "ORD-5084", "P-01", 1186, 1186, 640, "Packaging Box ×1,186 · Film 949 m · Carton ×198", "Packing Team B", "Packing"],
  ["PK-2203", "—", "ORD-5075", "P-02", 800, 800, 800, "Packaging Box ×800 · Film 480 m", "Packing Team A", "Completed"],
  ["PK-2204", "—", "ORD-5096", "P-05", 2000, 2000, 2000, "Packaging Box ×1,000 · Carton ×334", "Packing Team B", "Completed"],
  ["PK-2205", "WO-2845", "ORD-5088", "P-04", 910, 910, 0, "Packaging Box ×910 · Film 273 m", "Packing Team A", "Pending"],
  ["PK-2206", "WO-2848", "ORD-5093", "P-06", 284, 284, 0, "Packaging Box ×284 · Film 199 m", "Packing Team B", "Pending"],
  ["PK-2207", "—", "ORD-5086", "P-05", 3200, 3200, 1200, "Packaging Box ×1,600 · Carton ×534", "Packing Team B", "Packing"],
].map(([id, wo, so, pid, available, required, packed, material, team, status]) => ({ id, wo, so, pid, product: P(pid).name, available, required, packed, material, team, status }));

export const DISPATCH_FLOW = ["Packing Complete", "Dispatch Created", "Vehicle Assigned", "Loading", "Gate Exit", "In Transit", "Delivered"];
export const DISPATCHES = [
  ["DSP-8821", "Agarwal Buildmart", "ORD-5075", "Single Bowl Sink 18×16", 800, 40, 416000, "Dispatch Warehouse", "Ranchi Roadlines", "JH-01-BT-2284", "Loading", "2026-10-07", 4],
  ["DSP-8820", "Agarwal Buildmart", "ORD-5096", "Floor Drain SS304", 2000, 28, 480000, "Dispatch Warehouse", "Ranchi Roadlines", "JH-01-BT-2284", "Loading", "2026-10-07", 4],
  ["DSP-8819", "Bihar Home Solutions", "ORD-5082", "Premium Kitchen Sink 24×18", 700, 118, 525000, "Dispatch Warehouse", "Patna Express Cargo", "BR-01-GA-5521", "In Transit", "2026-10-07", 5],
  ["DSP-8818", "Gupta Hardware", "ORD-5071", "Double Bowl Sink 37×18", 300, 300, 555000, "Dispatch Warehouse", "Dhanbad Transport Co.", "JH-10-CF-0912", "Delivered", "2026-10-05", 6],
  ["DSP-8822", "Sharma Sanitary House", "ORD-5086", "Floor Drain SS304", 1200, 16, 288000, "Dispatch Warehouse", "—", "—", "Dispatch Created", "2026-10-09", 3],
  ["DSP-8817", "Patna Bath Studio", "ORD-5068", "Premium Kitchen Sink 24×18", 600, 100, 450000, "Dispatch Warehouse", "Patna Express Cargo", "BR-01-GA-4410", "Delivered", "2026-09-30", 7],
  ["DSP-8816", "Bihar Home Solutions", "ORD-5066", "Single Bowl Sink 18×16", 1000, 167, 520000, "Dispatch Warehouse", "Patna Express Cargo", "BR-01-GA-3320", "Delivered", "2026-09-28", 6],
  ["DSP-8823", "Sharma Sanitary House", "ORD-5084", "Premium Kitchen Sink 24×18", 640, 107, 480000, "Dispatch Warehouse", "—", "—", "Packing Complete", "2026-10-10", 2],
].map(([id, customer, so, product, qty, packages, value, wh, transporter, vehicle, status, eta, stage]) => ({ id, customer, so, product, qty, packages, value, wh, transporter, vehicle, status, eta, stage }));

/* ---------------- Finished goods ---------------- */
// pid, produced (month), available, reserved, packed, dispatched, min, wh, status
export const FG = [
  ["P-01", 44200, 1220, 1220, 640, 11800, 800, "Finished Goods Warehouse", "Low Stock"],
  ["P-02", 39800, 1840, 800, 980, 14600, 1200, "Finished Goods Warehouse", "In Stock"],
  ["P-03", 6200, 120, 0, 0, 2480, 400, "Finished Goods Warehouse", "Low Stock"],
  ["P-04", 18600, 1640, 1000, 0, 7200, 1000, "Finished Goods Warehouse", "In Stock"],
  ["P-05", 62400, 8400, 3000, 3200, 21600, 2500, "Finished Goods Warehouse", "Overstock"],
  ["P-06", 7800, 360, 0, 0, 3100, 400, "Finished Goods Warehouse", "Low Stock"],
].map(([pid, produced, available, reserved, packed, dispatched, min, wh, status]) => {
  const p = P(pid);
  return { pid, product: p.name, sku: p.sku, produced, available, reserved, packed, dispatched, min, wh, status, value: available * p.std, free: available - reserved };
});
export const FG_BATCHES = [
  ["FG-061026-02", "P-01", 638, "2026-10-06", "WO-2841", "SS304S-250926-C", "P-04", "Vijay Kumar", "Passed", ["ORD-5084"], ["Kailash Mahto", "Ramesh Oraon", "Suresh Munda", "Dinesh Lohra"], "QC-1182"],
  ["FG-061026-01", "P-01", 548, "2026-10-06", "WO-2841", "SS304S-251126-A", "HP-03", "Vijay Kumar", "Passed", ["ORD-5084"], ["Kailash Mahto", "Suresh Munda", "Dinesh Lohra"], "QC-1182"],
  ["FG-061026-03", "P-02", 506, "2026-10-06", "WO-2838", "SS202-150926-A", "HP-01", "Rajesh Yadav", "Passed", ["ORD-5079"], ["Pappu Kumar", "Dinesh Lohra"], "QC-1184"],
  ["FG-061026-04", "P-04", 388, "2026-10-06", "WO-2845", "BRS-CART-0210", "AS-01", "Sanjay Prasad", "Passed", ["ORD-5088"], ["Birsa Tirkey"], "QC-1185"],
  ["FG-061026-05", "P-06", 284, "2026-10-06", "WO-2848", "SS304S-251126-A", "HP-05", "Imran Ansari", "Passed", ["ORD-5093"], ["Imran Ansari"], "QC-1183"],
  ["FG-051026-07", "P-02", 722, "2026-10-05", "WO-2838", "SS202-150926-A", "HP-02", "Rajesh Yadav", "Passed", ["ORD-5079"], ["Pappu Kumar"], "QC-1181"],
  ["FG-051026-06", "P-01", 876, "2026-10-05", "WO-2837", "SS304-091026-A", "HP-03", "Vijay Kumar", "Passed", ["ORD-5082"], ["Kailash Mahto"], "QC-1180"],
].map(([id, pid, qty, date, wo, rmBatch, machine, sup, qc, orders, emps, qcId]) => ({ id, pid, product: P(pid).name, qty, date, wo, rmBatch, machine, sup, qc, orders, emps, qcId }));
export const fgBatch = (id) => FG_BATCHES.find((b) => b.id === id);

/* ---------------- Trends ---------------- */
const days = ["22 Sep", "23 Sep", "24 Sep", "25 Sep", "26 Sep", "27 Sep", "28 Sep", "29 Sep", "30 Sep", "01 Oct", "02 Oct", "03 Oct", "04 Oct", "05 Oct", "06 Oct"];
const prodSeries = [5120, 5240, 4980, 5360, 5410, 4720, 5180, 5290, 5330, 5080, 5440, 4900, 5210, 5380, 4860];
export const PROD_TREND = days.map((label, i) => ({ label, actual: prodSeries[i], target: i === 5 ? 4400 : 5400 }));
export const REJ_TREND = days.map((label, i) => ({ label, rate: [1.8, 1.9, 1.7, 1.9, 2.0, 1.8, 1.9, 2.1, 2.4, 2.6, 2.5, 2.9, 2.7, 3.0, 2.8][i] }));
export const MONTH_TREND = [["Apr", 98200], ["May", 103400], ["Jun", 101800], ["Jul", 106900], ["Aug", 109000], ["Sep", 109020], ["Oct*", 118420]].map(([label, v]) => ({ label, v }));
export const UTIL_TREND = days.map((label, i) => ({ label, util: [84, 85, 83, 86, 85, 76, 84, 84, 85, 83, 86, 81, 84, 85, 82][i] }));
export const MAT_CONSUMPTION = [["SS 304 (kg)", 298440, 307200], ["SS 202 (kg)", 183080, 186900], ["SS Coil 0.8 (kg)", 87360, 88200], ["Brass cartridge (pcs)", 18600, 19180], ["Drain coupling (pcs)", 76800, 77350]].map(([label, std, actual]) => ({ label, std, actual, varPct: +(((actual - std) / std) * 100).toFixed(2) }));
export const INV_VALUE_TREND = [["Apr", 3.1, 1.8, 0.58], ["May", 3.3, 1.9, 0.61], ["Jun", 3.0, 2.0, 0.66], ["Jul", 3.4, 2.1, 0.64], ["Aug", 3.6, 2.0, 0.7], ["Sep", 3.5, 2.1, 0.66], ["Oct", 3.42, 2.16, 0.68]].map(([label, rm, fg, wip]) => ({ label, rm, fg, wip }));
export const WEEKLY_REJ_BY_PRODUCT = [["Sink 24×18", 3.4, 2.4], ["Sink 18×16", 2.6, 1.9], ["Sink 37×18", 2.1, 2.2], ["Basin Mixer", 3.1, 2.8], ["Floor Drain", 1.2, 1.1], ["Utility Sink", 4.6, 3.0]].map(([label, thisWeek, lastWeek]) => ({ label, thisWeek, lastWeek }));

/* ---------------- Alerts / notifications / logs ---------------- */
export const ALERTS = [
  { id: "A1", sev: "critical", icon: "🔴", kind: "Raw Material Shortage", title: "SS 304 Coil — 1.2mm", rows: [["Required", "8,400 kg"], ["Available", "5,750 kg"], ["Shortage", "2,650 kg"], ["Affected production", "3 work orders"]], href: "/raw-materials?tab=mrp", cta: "Open MRP" },
  { id: "A2", sev: "warn", icon: "🟠", kind: "Production Delay", title: "WO-2841 · Kitchen Sink 24×18", rows: [["Target", "2,000 units"], ["Produced", "1,240"], ["Delay", "6 hours"], ["Reason", "Press Machine P-04 downtime"]], href: "/production/WO-2841", cta: "Open work order" },
  { id: "A3", sev: "critical", icon: "🔴", kind: "Quality Alert", title: "Sink Model GLZY202-2418SB", rows: [["Inspected", "680 units"], ["Rejected", "42"], ["Rejection", "6.17%"], ["Primary defect", "Surface dent"]], href: "/quality/QC-1182", cta: "Open inspection" },
  { id: "A4", sev: "info", icon: "🟡", kind: "Machine Maintenance Due", title: "Hydraulic Press HP-03", rows: [["Maintenance due", "Today"], ["Runtime since last service", "482 hours"]], href: "/machines/HP-03", cta: "Open machine" },
];
export const NOTIFS = [
  ["n1", "shortage", "Raw material shortage", "SS 304 Coil 1.2mm short by 2,650 kg for 3 work orders", "/raw-materials?tab=mrp", "9 min ago", true],
  ["n2", "delay", "Production delay — WO-2841", "6 hours behind plan after P-04 downtime", "/production/WO-2841", "32 min ago", true],
  ["n3", "breakdown", "Machine breakdown — HP-05", "Hydraulic seal leak. Line 4 stopped, restart expected 2:30 PM", "/machines/HP-05", "1 h ago", true],
  ["n4", "qc", "QC rejection alert", "QC-1182 rejection 6.17% (limit 3%) — surface dent", "/quality/QC-1182", "58 min ago", true],
  ["n5", "maint", "Maintenance due today", "HP-03 crossed 480 h runtime limit (482 h)", "/machines/HP-03", "2 h ago", true],
  ["n6", "purchase", "Purchase delayed", "PO-3319 Brass Cartridge — 2 days overdue (Bharat Hardware)", "/purchase", "3 h ago", false],
  ["n7", "risk", "Order at risk", "ORD-5088 Bihar Home Solutions may miss 12 Oct dispatch", "/orders", "3 h ago", false],
  ["n8", "ready", "Finished goods ready", "ORD-5075 · 800 sinks packed and ready for dispatch", "/dispatch", "5 h ago", false],
  ["n9", "credit", "Credit limit exceeded", "Eastern Kitchen World — ₹23.1L against ₹22L limit", "/customers/C-106", "Yesterday", false],
  ["n10", "overdue", "Payment overdue", "Gupta Hardware — INV-2655 overdue by 12 days (₹4.9L)", "/invoices", "Yesterday", false],
].map(([id, kind, title, body, href, time, unread]) => ({ id, kind, title, body, href, time, unread }));

export const LOGS = [
  ["2026-10-06T11:12:00", "Vijay Kumar", "Production entry", "WO-2841", "Added 280 produced · 268 accepted · 12 rejected (HP-03)"],
  ["2026-10-06T11:05:00", "Neha Verma", "QC started", "QC-1186", "Inspection started on FG-061026-06 (136 units)"],
  ["2026-10-06T10:42:00", "Santosh Mahto", "Breakdown closed", "BD-0412", "P-04 back in service after 1 h 52 m"],
  ["2026-10-06T10:20:00", "Neha Verma", "QC completed", "QC-1182", "680 inspected · 638 accepted · 42 rejected"],
  ["2026-10-06T10:05:00", "Imran Ansari", "Breakdown reported", "BD-0413", "HP-05 hydraulic leak — severity Critical"],
  ["2026-10-06T08:50:00", "Vikram Sinha", "Breakdown reported", "BD-0412", "P-04 die jam"],
  ["2026-10-06T08:05:00", "Sunil Yadav", "Material issued", "ISS-7708", "1,400 kg SS 304 Sheet → WO-2841"],
  ["2026-10-06T07:42:00", "Sunil Yadav", "Material issued", "ISS-7712", "4,360 kg SS 304 Sheet → WO-2841 (+160 kg variance)"],
  ["2026-10-06T07:30:00", "Rohit Sharma", "Work order started", "WO-2841", "Production started on Line 2"],
  ["2026-10-05T18:40:00", "Anil Mahto", "PR created", "PR-1839", "Brass Cartridge 1,800 pcs — urgent"],
  ["2026-10-05T17:15:00", "Ajay Singh", "Plan approved", "Plan 41", "Sink 24×18 — 3,500 units on Line 2"],
  ["2026-10-05T15:02:00", "Priya Gupta", "Payment received", "PAY-6120", "₹4,50,000 from Patna Bath Studio"],
  ["2026-10-05T12:30:00", "Deepak Oraon", "Dispatch created", "DSP-8819", "700 sinks → Bihar Home Solutions"],
  ["2026-10-05T10:10:00", "Neha Verma", "GRN QC rejected", "GRN-4412", "Brass cartridge batch BRS-CART-0310 rejected (1,200 pcs)"],
].map(([ts, user, action, ref, detail]) => ({ ts, user, action, ref, detail }));

/* ---------------- Today's KPI figures (as presented to the owner) ---------------- */
export const KPI = {
  prodToday: 4860, targetToday: 5400, prodMonth: 118420, monthDelta: 8.6,
  rmValue: 34200000, fgValue: 21600000, wipValue: 6840000, pending: 37, reject: 2.8, util: 82, downtime: "3 hr 42 min", awaiting: 4270000,
};
export const HEALTH = { score: 84, parts: [["Production Efficiency", 88], ["Quality", 76], ["Machine Utilization", 82], ["Material Availability", 91], ["Delivery Performance", 86], ["Cost Control", 79]] };
export const PIPELINE = [
  ["Planned", 12400, "/production-planning"], ["Material Ready", 10800, "/raw-materials"], ["In Production", 6420, "/production"], ["WIP", 3120, "/wip"],
  ["QC", 1880, "/quality"], ["Finished", 4860, "/finished-goods"], ["Packed", 3740, "/packing"], ["Ready For Dispatch", 2940, "/dispatch"],
];
export const PLANT_PERF = [
  { plant: "Ranchi Plant", today: 3620, target: 4000, eff: 90.5, util: 84, rej: 2.3, down: "1h 52m" },
  { plant: "Ramgarh Plant", today: 1240, target: 1400, eff: 88.6, util: 77, rej: 4.1, down: "1h 50m" },
];
void MATERIALS; void SUPPLIERS; void CUSTOMERS; void SALES_ORDERS; void ri;
