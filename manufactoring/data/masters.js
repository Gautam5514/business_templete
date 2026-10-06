// Master data — Bharat MetalWorks Pvt. Ltd. (fictional)
export const COMPANY = {
  name: "Bharat MetalWorks Pvt. Ltd.",
  short: "Bharat MetalWorks",
  hq: "Ranchi, Jharkhand",
  turnover: "₹26.8 Crore",
  stats: [
    ["Plants", "2"], ["Production lines", "4"], ["Warehouses", "3"], ["Employees", "118"],
    ["Raw material SKUs", "420"], ["Finished SKUs", "180"], ["Active suppliers", "68"], ["Dealers", "126"],
  ],
  states: ["Jharkhand", "Bihar", "West Bengal", "Odisha", "Uttar Pradesh"],
};

export const PLANTS = [
  { id: "RNC", name: "Ranchi Manufacturing Unit", short: "Ranchi", note: "Main production facility", lines: ["Line 1", "Line 2"] },
  { id: "RMG", name: "Ramgarh Fabrication Unit", short: "Ramgarh", note: "Secondary production & fabrication", lines: ["Line 3", "Line 4"] },
];
export const WAREHOUSES = [
  { id: "RMW", name: "Raw Material Warehouse", plant: "Ranchi", value: 34200000, util: 78 },
  { id: "FGW", name: "Finished Goods Warehouse", plant: "Ranchi", value: 21600000, util: 64 },
  { id: "DSW", name: "Dispatch Warehouse", plant: "Ranchi", value: 4120000, util: 52 },
];

const pick = (a) => a.map(([id, name, role, dept, plant, shift, extra]) => ({ id, name, role, dept, plant, shift, ...extra }));
export const EMPLOYEES = pick([
  ["E-001", "Rakesh Agarwal", "Managing Director", "Management", "Ranchi", "General", { machine: "—", target: 0, actual: 0, rej: 0, ot: 0, att: "Present" }],
  ["E-002", "Ajay Singh", "Plant Head", "Production", "Ranchi", "General", { machine: "—", target: 0, actual: 0, rej: 0, ot: 0, att: "Present" }],
  ["E-003", "Rohit Sharma", "Production Manager", "Production", "Ranchi", "General", { machine: "—", target: 0, actual: 0, rej: 0, ot: 1.5, att: "Present" }],
  ["E-004", "Vijay Kumar", "Production Supervisor", "Production", "Ranchi", "Morning + Evening", { machine: "HP-03 / P-04", target: 4000, actual: 3620, rej: 2.1, ot: 2.0, att: "Present" }],
  ["E-005", "Rajesh Yadav", "Production Supervisor", "Production", "Ranchi", "Morning", { machine: "HP-01 / HP-02", target: 2500, actual: 2280, rej: 1.9, ot: 0.5, att: "Present" }],
  ["E-006", "Sanjay Prasad", "Production Supervisor", "Production", "Ramgarh", "Morning", { machine: "AS-01 / CNC-02", target: 1400, actual: 940, rej: 3.6, ot: 0, att: "Present" }],
  ["E-007", "Imran Ansari", "Production Supervisor", "Production", "Ramgarh", "Evening", { machine: "HP-05", target: 1000, actual: 300, rej: 5.2, ot: 0, att: "Present" }],
  ["E-008", "Priya Gupta", "Accounts Manager", "Accounts", "Ranchi", "General", { machine: "—", target: 0, actual: 0, rej: 0, ot: 0, att: "Present" }],
  ["E-009", "Neha Verma", "Quality Manager", "Quality", "Ranchi", "General", { machine: "QC Lab", target: 0, actual: 0, rej: 0, ot: 1.0, att: "Present" }],
  ["E-010", "Sunil Yadav", "Store Manager", "Stores", "Ranchi", "General", { machine: "—", target: 0, actual: 0, rej: 0, ot: 0, att: "Present" }],
  ["E-011", "Manoj Kumar", "Maintenance Manager", "Maintenance", "Ranchi", "General", { machine: "—", target: 0, actual: 0, rej: 0, ot: 2.5, att: "Present" }],
  ["E-012", "Anil Mahto", "Purchase Manager", "Purchase", "Ranchi", "General", { machine: "—", target: 0, actual: 0, rej: 0, ot: 0, att: "Present" }],
  ["E-013", "Deepak Oraon", "Dispatch Manager", "Dispatch", "Ranchi", "General", { machine: "—", target: 0, actual: 0, rej: 0, ot: 1.0, att: "Present" }],
  ["E-014", "Kailash Mahto", "Press Operator", "Production", "Ranchi", "Morning", { machine: "HP-03", target: 900, actual: 820, rej: 1.8, ot: 1.0, att: "Present" }],
  ["E-015", "Ramesh Oraon", "Press Operator", "Production", "Ranchi", "Morning", { machine: "P-04", target: 900, actual: 760, rej: 3.4, ot: 0, att: "Present" }],
  ["E-016", "Suresh Munda", "Welder", "Production", "Ranchi", "Morning", { machine: "WS-04", target: 700, actual: 655, rej: 2.4, ot: 1.5, att: "Present" }],
  ["E-017", "Dinesh Lohra", "Polisher", "Production", "Ranchi", "Morning", { machine: "PL-02", target: 650, actual: 604, rej: 1.6, ot: 0.5, att: "Present" }],
  ["E-018", "Pappu Kumar", "Press Operator", "Production", "Ranchi", "Evening", { machine: "HP-01", target: 900, actual: 842, rej: 2.0, ot: 0, att: "Present" }],
  ["E-019", "Mohan Besra", "CNC Operator", "Production", "Ramgarh", "Morning", { machine: "CNC-02", target: 600, actual: 480, rej: 3.1, ot: 0, att: "Present" }],
  ["E-020", "Birsa Tirkey", "Assembly Operator", "Production", "Ramgarh", "Morning", { machine: "AS-01", target: 800, actual: 460, rej: 4.2, ot: 0, att: "Waiting" }],
  ["E-021", "Anita Kumari", "QC Inspector", "Quality", "Ranchi", "Morning", { machine: "QC Lab", target: 0, actual: 0, rej: 0, ot: 0, att: "Present" }],
  ["E-022", "Rahul Prasad", "QC Inspector", "Quality", "Ranchi", "Evening", { machine: "QC Lab", target: 0, actual: 0, rej: 0, ot: 0, att: "Absent" }],
  ["E-023", "Santosh Mahto", "Maintenance Technician", "Maintenance", "Ranchi", "Morning", { machine: "—", target: 0, actual: 0, rej: 0, ot: 3.0, att: "Present" }],
  ["E-024", "Gopal Singh", "Maintenance Technician", "Maintenance", "Ramgarh", "Morning", { machine: "HP-05", target: 0, actual: 0, rej: 0, ot: 2.0, att: "Present" }],
  ["E-025", "Nitu Devi", "Packing Lead", "Dispatch", "Ranchi", "Morning", { machine: "PK-01", target: 1200, actual: 1090, rej: 0.4, ot: 0, att: "Present" }],
  ["E-026", "Arjun Munda", "Forklift Operator", "Stores", "Ranchi", "Morning", { machine: "—", target: 0, actual: 0, rej: 0, ot: 1.0, att: "Present" }],
  ["E-027", "Pooja Kumari", "Accounts Executive", "Accounts", "Ranchi", "General", { machine: "—", target: 0, actual: 0, rej: 0, ot: 0, att: "Present" }],
  ["E-028", "Vikram Sinha", "Night Supervisor", "Production", "Ranchi", "Night", { machine: "HP-02 / P-04", target: 1800, actual: 1610, rej: 2.6, ot: 0, att: "Off shift" }],
]);

export const CUSTOMERS = [
  { id: "C-101", name: "Sharma Sanitary House", city: "Patna", state: "Bihar", credit: 2500000, outstanding: 1825000, lifetime: 48200000, orders: 3, pendingProd: 1860, ready: 3200, returns: 0.6, pay: "Pays in 31 days (avg)", behaviour: "Good", mix: [["Kitchen Sink 24×18", 46], ["Floor Drain SS304", 24], ["Utility Sink 21×18", 18], ["Others", 12]] },
  { id: "C-102", name: "Agarwal Buildmart", city: "Ranchi", state: "Jharkhand", credit: 2000000, outstanding: 1240000, lifetime: 36400000, orders: 3, pendingProd: 800, ready: 2800, returns: 0.9, pay: "Pays in 24 days (avg)", behaviour: "Excellent", mix: [["Kitchen Sink 24×18", 38], ["Single Bowl Sink 18×16", 30], ["Floor Drain SS304", 22], ["Others", 10]] },
  { id: "C-103", name: "Gupta Hardware", city: "Dhanbad", state: "Jharkhand", credit: 1500000, outstanding: 1480000, lifetime: 24800000, orders: 2, pendingProd: 1500, ready: 0, returns: 1.4, pay: "Pays in 47 days (avg)", behaviour: "Watch", mix: [["Single Bowl Sink 18×16", 52], ["Double Bowl Sink 37×18", 30], ["Others", 18]] },
  { id: "C-104", name: "Patna Bath Studio", city: "Patna", state: "Bihar", credit: 1200000, outstanding: 640000, lifetime: 18600000, orders: 2, pendingProd: 720, ready: 0, returns: 0.5, pay: "Pays in 29 days (avg)", behaviour: "Good", mix: [["Kitchen Sink 24×18", 55], ["Basin Mixer Chrome", 30], ["Others", 15]] },
  { id: "C-105", name: "Bihar Home Solutions", city: "Muzaffarpur", state: "Bihar", credit: 3000000, outstanding: 2140000, lifetime: 41200000, orders: 3, pendingProd: 3000, ready: 0, returns: 0.8, pay: "Pays in 38 days (avg)", behaviour: "Good", mix: [["Basin Mixer Chrome", 48], ["Single Bowl Sink 18×16", 26], ["Kitchen Sink 24×18", 16], ["Others", 10]] },
  { id: "C-106", name: "Eastern Kitchen World", city: "Kolkata", state: "West Bengal", credit: 2200000, outstanding: 2310000, lifetime: 29400000, orders: 2, pendingProd: 600, ready: 0, returns: 1.1, pay: "Pays in 52 days (avg)", behaviour: "At Risk", mix: [["Double Bowl Sink 37×18", 44], ["Kitchen Sink 24×18", 34], ["Others", 22]] },
  { id: "C-107", name: "Maa Durga Enterprises", city: "Bhubaneswar", state: "Odisha", credit: 1000000, outstanding: 520000, lifetime: 12800000, orders: 2, pendingProd: 800, ready: 0, returns: 0.7, pay: "Pays in 33 days (avg)", behaviour: "Good", mix: [["Utility Sink 21×18", 50], ["Basin Mixer Chrome", 32], ["Others", 18]] },
];
export const cust = (name) => CUSTOMERS.find((c) => c.name === name);

export const PRODUCTS = [
  { id: "P-01", name: "Premium Kitchen Sink 24×18", short: "Sink 24×18", sku: "FG-SNK-2418P", model: "GLZY202-2418SB", price: 750, std: 428, unit: "pcs", line: "Line 2", material: "SS 304", cycleMin: 0.55 },
  { id: "P-02", name: "Single Bowl Sink 18×16", short: "Sink 18×16", sku: "FG-SNK-1816S", model: "GLZY202-1816SB", price: 520, std: 301, unit: "pcs", line: "Line 1", material: "SS 202", cycleMin: 0.42 },
  { id: "P-03", name: "Double Bowl Sink 37×18", short: "Sink 37×18", sku: "FG-SNK-3718D", model: "GLZY304-3718DB", price: 1850, std: 1120, unit: "pcs", line: "Line 1", material: "SS 304", cycleMin: 1.1 },
  { id: "P-04", name: "Basin Mixer Chrome", short: "Basin Mixer", sku: "FG-MXR-BMC01", model: "BMC-CHR-01", price: 680, std: 402, unit: "pcs", line: "Line 3", material: "Brass", cycleMin: 0.5 },
  { id: "P-05", name: "Floor Drain SS304", short: "Floor Drain", sku: "FG-DRN-FD304", model: "FD-304-5X5", price: 240, std: 138, unit: "pcs", line: "Line 3", material: "SS 304", cycleMin: 0.22 },
  { id: "P-06", name: "Utility Sink 21×18", short: "Utility Sink", sku: "FG-SNK-2118U", model: "UTL-2118-SS", price: 980, std: 590, unit: "pcs", line: "Line 4", material: "SS 304", cycleMin: 0.8 },
];
export const prod = (name) => PRODUCTS.find((p) => p.name === name || p.short === name);

export const MATERIALS = [
  // code, name, cat, unit, cur, reserved, min, reorder, incoming, status, rate(₹/unit), supplier
  ["RM-SS304-12", "SS 304 Coil 1.2mm", "Steel", "kg", 14820, 7600, 8000, 10000, 2000, "Low Stock", 72, "Tata Steel Processing Partner"],
  ["RM-SS304-S12", "SS 304 Sheet 1.2mm", "Steel", "kg", 11200, 4300, 6000, 9000, 2000, "Low Stock", 74, "Jindal Stainless Supply Co."],
  ["RM-SS202-10", "SS 202 Sheet 1.0mm", "Steel", "kg", 18640, 6200, 7000, 9000, 0, "In Stock", 50, "Eastern Metals Pvt. Ltd."],
  ["RM-SSCOIL-08", "SS Coil 0.8mm", "Steel", "kg", 6420, 2800, 3500, 5000, 3000, "In Stock", 68, "Jindal Stainless Supply Co."],
  ["RM-RUB-01", "Rubber Sound Pad", "Fittings", "pcs", 24800, 9600, 8000, 12000, 0, "In Stock", 6, "Bharat Hardware Components"],
  ["RM-DRN-01", "Drain Coupling", "Fittings", "pcs", 7200, 5800, 6000, 9000, 6000, "Critical", 22, "Bharat Hardware Components"],
  ["RM-PKG-BOX", "Packaging Box", "Packaging", "pcs", 18400, 6400, 5000, 8000, 0, "In Stock", 14, "Shree Packaging Industries"],
  ["RM-FILM-01", "Protective Film", "Packaging", "m", 42600, 14800, 12000, 18000, 0, "In Stock", 3, "Shree Packaging Industries"],
  ["RM-ADH-01", "Adhesive", "Consumable", "kg", 380, 180, 150, 250, 0, "In Stock", 250, "Ranchi Industrial Supplies"],
  ["RM-CTN-01", "Carton (master, 6 pcs)", "Packaging", "pcs", 2100, 1400, 1500, 2500, 1200, "Low Stock", 38, "Shree Packaging Industries"],
  ["RM-POL-01", "Polishing Compound", "Consumable", "kg", 640, 120, 200, 320, 0, "In Stock", 160, "Ranchi Industrial Supplies"],
  ["RM-BRS-CART", "Brass Cartridge (35mm)", "Fittings", "pcs", 1480, 3000, 2000, 3500, 4000, "Critical", 92, "Bharat Hardware Components"],
  ["RM-WLD-01", "Welding Wire ER308", "Consumable", "kg", 520, 140, 200, 300, 0, "In Stock", 380, "Ranchi Industrial Supplies"],
  ["RM-HNDL-ZN", "Mixer Handle (Zinc, chrome)", "Fittings", "pcs", 5200, 3000, 2500, 4000, 0, "In Stock", 38, "Bharat Hardware Components"],
  ["RM-BRS-BODY", "Brass Mixer Body Casting", "Fittings", "pcs", 4100, 3000, 2500, 4000, 0, "In Stock", 168, "Bharat Hardware Components"],
].map(([code, name, cat, unit, cur, reserved, min, reorder, incoming, status, rate, supplier]) => ({
  code, name, cat, unit, cur, reserved, avail: cur - reserved, min, reorder, incoming, status, rate, supplier, value: cur * rate,
}));
export const mat = (nameOrCode) => MATERIALS.find((m) => m.name === nameOrCode || m.code === nameOrCode);

export const SUPPLIERS = [
  { id: "S-01", name: "Jindal Stainless Supply Co.", city: "Hisar", mats: ["SS 304 Sheet 1.2mm", "SS Coil 0.8mm"], total: 18400000, pending: 3, payable: 1840000, lead: 7.8, quality: 96, price: 88, otd: 92, rej: 1.2, contact: "Sandeep Jindal" },
  { id: "S-02", name: "Eastern Metals Pvt. Ltd.", city: "Kolkata", mats: ["SS 202 Sheet 1.0mm"], total: 12600000, pending: 1, payable: 920000, lead: 6.2, quality: 91, price: 92, otd: 88, rej: 2.4, contact: "Subrata Dey" },
  { id: "S-03", name: "Shree Packaging Industries", city: "Ranchi", mats: ["Packaging Box", "Protective Film", "Carton (master, 6 pcs)"], total: 4200000, pending: 2, payable: 380000, lead: 3.1, quality: 94, price: 86, otd: 95, rej: 0.8, contact: "Mahesh Shree" },
  { id: "S-04", name: "Bharat Hardware Components", city: "Rajkot", mats: ["Drain Coupling", "Brass Cartridge (35mm)", "Rubber Sound Pad", "Mixer Handle (Zinc, chrome)"], total: 6800000, pending: 3, payable: 1240000, lead: 11.4, quality: 89, price: 84, otd: 71, rej: 3.6, contact: "Hitesh Patel" },
  { id: "S-05", name: "Tata Steel Processing Partner", city: "Jamshedpur", mats: ["SS 304 Coil 1.2mm"], total: 22600000, pending: 2, payable: 2680000, lead: 5.4, quality: 98, price: 80, otd: 96, rej: 0.6, contact: "R. K. Pandey" },
  { id: "S-06", name: "Ranchi Industrial Supplies", city: "Ranchi", mats: ["Adhesive", "Polishing Compound", "Welding Wire ER308"], total: 1800000, pending: 0, payable: 96000, lead: 1.8, quality: 92, price: 90, otd: 94, rej: 1.0, contact: "Amit Lakra" },
];
export const sup = (name) => SUPPLIERS.find((s) => s.name === name);

export const LINES = [
  { id: "L1", name: "Line 1", plant: "Ranchi", status: "Running", product: "Single Bowl Sink 18×16", wo: "WO-2838", target: 1500, produced: 1260, today: 2140, eff: 91, shift: "Morning", sup: "Rajesh Yadav", machines: ["HP-01", "HP-02", "WS-01", "PL-01"], note: "On schedule" },
  { id: "L2", name: "Line 2", plant: "Ranchi", status: "Running", product: "Premium Kitchen Sink 24×18", wo: "WO-2841", target: 2000, produced: 1240, today: 1480, eff: 84, shift: "Morning", sup: "Vijay Kumar", machines: ["HP-03", "P-04", "WS-04", "PL-02"], note: "6 h behind plan — P-04 downtime" },
  { id: "L3", name: "Line 3", plant: "Ramgarh", status: "Paused", product: "Basin Mixer Chrome", wo: "WO-2845", target: 3000, produced: 940, today: 940, eff: 62, shift: "Morning", sup: "Sanjay Prasad", machines: ["AS-01", "CNC-02"], note: "Material waiting — Brass Cartridge", reason: "Material Waiting", downMin: 42 },
  { id: "L4", name: "Line 4", plant: "Ramgarh", status: "Maintenance", product: "Utility Sink 21×18", wo: "WO-2848", target: 800, produced: 300, today: 300, eff: 0, shift: "Evening", sup: "Imran Ansari", machines: ["HP-05", "WS-05"], note: "Hydraulic seal replacement", restart: "2:30 PM" },
];

export const SHIFTS = [
  { id: "Morning", time: "06:00–14:00", target: 2700, actual: 2480, accepted: 2410, rejected: 70, down: 118, ops: 34, sup: "Vijay Kumar / Rajesh Yadav", eff: 91.9 },
  { id: "Evening", time: "14:00–22:00", target: 2700, actual: 0, accepted: 0, rejected: 0, down: 0, ops: 32, sup: "Vijay Kumar / Imran Ansari", eff: 0, upcoming: true },
  { id: "Night", time: "22:00–06:00", target: 2000, actual: 2380, accepted: 2318, rejected: 62, down: 104, ops: 21, sup: "Vikram Sinha", eff: 119, prev: true },
];

export const MACHINES = [
  // id, name, type, plant, line, status, wo, runMin, out, eff, lastM, nextM, downMin, operator, totalHrs, sinceService
  ["HP-01", "Hydraulic Press HP-01", "Hydraulic Press", "Ranchi", "Line 1", "Running", "WO-2838", 392, 1240, 91, "22 Sep", "20 Oct", 18, "Pappu Kumar", 7260, 214],
  ["HP-02", "Hydraulic Press HP-02", "Hydraulic Press", "Ranchi", "Line 1", "Running", "WO-2838", 401, 1180, 92, "25 Sep", "23 Oct", 12, "Pappu Kumar", 6910, 160],
  ["HP-03", "Hydraulic Press HP-03", "Hydraulic Press", "Ranchi", "Line 2", "Running", "WO-2841", 408, 820, 87, "18 Sep", "08 Oct", 32, "Kailash Mahto", 8420, 482],
  ["P-04", "Press P-04 (Deep Drawing)", "Deep Drawing Press", "Ranchi", "Line 2", "Running", "WO-2841", 296, 660, 74, "02 Sep", "02 Nov", 112, "Ramesh Oraon", 5330, 310],
  ["DP-03", "Deep Drawing Press DP-03", "Deep Drawing Press", "Ranchi", "Line 1", "Idle", "—", 120, 240, 66, "10 Sep", "10 Nov", 40, "—", 6120, 190],
  ["CNC-01", "CNC Cutting Machine CNC-01", "CNC Cutting", "Ranchi", "Cutting", "Running", "WO-2838", 420, 2800, 94, "29 Sep", "27 Oct", 8, "Mohan Besra", 4210, 96],
  ["WS-01", "Welding Station WS-01", "Welding", "Ranchi", "Line 1", "Running", "WO-2838", 388, 1210, 89, "15 Sep", "15 Oct", 22, "Suresh Munda", 5640, 240],
  ["WS-04", "Welding Station WS-04", "Welding", "Ranchi", "Line 2", "Running", "WO-2841", 380, 655, 82, "12 Sep", "12 Oct", 36, "Suresh Munda", 5810, 262],
  ["PL-01", "Polishing Line PL-01", "Polishing", "Ranchi", "Line 1", "Running", "WO-2838", 404, 1190, 90, "20 Sep", "20 Oct", 14, "Dinesh Lohra", 7040, 188],
  ["PL-02", "Polishing Line PL-02", "Polishing", "Ranchi", "Line 2", "Running", "WO-2841", 390, 604, 80, "16 Sep", "16 Oct", 44, "Dinesh Lohra", 7180, 224],
  ["FIN-01", "Buffing & Finishing FIN-01", "Finishing", "Ranchi", "Line 2", "Running", "WO-2841", 372, 580, 83, "24 Sep", "24 Oct", 26, "—", 3980, 120],
  ["LT-01", "Leak Test Rig LT-01", "Testing", "Ranchi", "QC", "Running", "—", 340, 1120, 96, "01 Oct", "01 Nov", 4, "Anita Kumari", 2210, 70],
  ["PK-01", "Packing Line PK-01", "Packing", "Ranchi", "Packing", "Running", "—", 388, 1090, 92, "26 Sep", "26 Oct", 10, "Nitu Devi", 3320, 112],
  ["AS-01", "Mixer Assembly Station AS-01", "Assembly", "Ramgarh", "Line 3", "Paused", "WO-2845", 214, 460, 58, "08 Sep", "08 Nov", 76, "Birsa Tirkey", 3640, 280],
  ["CNC-02", "CNC Machining CNC-02", "CNC Machining", "Ramgarh", "Line 3", "Running", "WO-2845", 330, 480, 79, "11 Sep", "11 Oct", 30, "Mohan Besra", 4890, 258],
  ["HP-05", "Hydraulic Press HP-05", "Hydraulic Press", "Ramgarh", "Line 4", "Maintenance", "WO-2848", 120, 300, 0, "28 Aug", "06 Oct", 224, "—", 8010, 540],
].map(([id, name, type, plant, line, status, wo, runMin, out, eff, lastM, nextM, downMin, operator, totalHrs, sinceService]) => ({
  id, name, type, plant, line, status, wo, runMin, out, eff, lastM, nextM, downMin, operator, totalHrs, sinceService,
}));
export const machine = (id) => MACHINES.find((m) => m.id === id);

export const BOM = {
  "P-01": { items: [["SS 304 Sheet 1.2mm", 3.8, "kg", 74], ["Rubber Sound Pad", 1, "pcs", 6], ["Drain Coupling", 1, "pcs", 22], ["Packaging Box", 1, "pcs", 14], ["Protective Film", 0.8, "m", 3], ["Adhesive", 0.04, "kg", 250]], labour: 49, overhead: 28 },
  "P-02": { items: [["SS 202 Sheet 1.0mm", 4.6, "kg", 50], ["Rubber Sound Pad", 1, "pcs", 6], ["Drain Coupling", 1, "pcs", 22], ["Packaging Box", 1, "pcs", 12], ["Protective Film", 0.6, "m", 3], ["Adhesive", 0.03, "kg", 250]], labour: 34, overhead: 20 },
  "P-03": { items: [["SS 304 Sheet 1.2mm", 14, "kg", 74], ["Rubber Sound Pad", 2, "pcs", 6], ["Drain Coupling", 2, "pcs", 22], ["Packaging Box", 1, "pcs", 26], ["Protective Film", 1.6, "m", 3], ["Adhesive", 0.08, "kg", 250]], labour: 82, overhead: 46 },
  "P-04": { items: [["Brass Cartridge (35mm)", 1, "pcs", 92], ["Brass Mixer Body Casting", 1, "pcs", 168], ["Mixer Handle (Zinc, chrome)", 1, "pcs", 38], ["Packaging Box", 1, "pcs", 14], ["Protective Film", 0.3, "m", 3]], labour: 48, overhead: 26 },
  "P-05": { items: [["SS Coil 0.8mm", 1.4, "kg", 68], ["Packaging Box", 0.5, "pcs", 14], ["Protective Film", 0.2, "m", 3]], labour: 14, overhead: 9 },
  "P-06": { items: [["SS 304 Sheet 1.2mm", 5.6, "kg", 74], ["Rubber Sound Pad", 1, "pcs", 6], ["Drain Coupling", 1, "pcs", 22], ["Packaging Box", 1, "pcs", 14], ["Protective Film", 0.7, "m", 3]], labour: 38, overhead: 22 },
};
export function bomCost(pid) {
  const b = BOM[pid];
  const rows = b.items.map(([name, qty, unit, rate]) => ({ name, qty, unit, rate, cost: +(qty * rate).toFixed(2) }));
  const material = rows.filter((r) => !/Box|Film/.test(r.name)).reduce((s, r) => s + r.cost, 0);
  const packaging = rows.filter((r) => /Box|Film/.test(r.name)).reduce((s, r) => s + r.cost, 0);
  return { rows, material, packaging, labour: b.labour, overhead: b.overhead, machine: Math.round((material + packaging) * 0.045), total: material + packaging + b.labour + b.overhead + Math.round((material + packaging) * 0.045) };
}

export const INSPECTORS = ["Neha Verma", "Anita Kumari", "Rahul Prasad"];
export const SUPERVISORS = ["Vijay Kumar", "Rajesh Yadav", "Sanjay Prasad", "Imran Ansari", "Vikram Sinha"];

// standard cost per unit is derived from the BOM so costing screens stay consistent
PRODUCTS.forEach((p) => { p.std = Math.round(bomCost(p.id).total); });
