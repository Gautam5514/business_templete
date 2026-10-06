// Operational data: jobs/requests, AMC, parts, billing, feedback, alerts, series.
import { rng } from "@/lib/rng";
import { NOW, TECHS, CUSTOMERS, ASSETS, LOCALITIES, techById, custByName, assetsOf, localityPos, hhmm, dist } from "./core";

export const SLA_MIN = { Emergency: 120, High: 240, Normal: 1440, AMC: 480 };
export const PRIOS = ["Emergency", "High", "Normal", "AMC"];
export const SOURCES = ["Phone", "WhatsApp", "Website", "Mobile App", "Email", "Walk-In", "AMC Auto-Schedule"];
export const STATUS = {
  New: "b", "Awaiting Assignment": "r", Scheduled: "n", "Technician Assigned": "b", "Technician En Route": "a", Arrived: "b", Diagnosis: "b", "Estimate Pending": "a", "Approval Pending": "a", "In Progress": "b", "Parts Pending": "r", Completed: "g", Cancelled: "n", Escalated: "r",
};
export const STATUS_FLOW = ["New", "Awaiting Assignment", "Scheduled", "Technician Assigned", "Technician En Route", "Arrived", "Diagnosis", "Estimate Pending", "Approval Pending", "In Progress", "Parts Pending", "Completed"];

const SERVICES = {
  AC: [["AC Repair", ["Cooling failure", "Gas leakage", "Water leakage from indoor unit", "Compressor tripping", "PCB fault"]], ["AC Installation", ["New split AC installation"]], ["AC Gas Refill", ["Low cooling – gas top-up"]], ["AC Deep Cleaning", ["Seasonal deep cleaning"]]],
  CCTV: [["CCTV Repair", ["Camera offline", "DVR not recording", "Night vision failure"]], ["CCTV Installation", ["4-camera installation", "Camera relocation"]]],
  RO: [["RO Service", ["Low flow rate", "Bad taste in water"]], ["RO Filter Replacement", ["Filter change due"]], ["RO Membrane Replacement", ["Membrane choke"]]],
  Electrical: [["Electrical Maintenance", ["MCB tripping", "Panel overheating", "Wiring fault"]], ["Emergency Electrical", ["Power failure in section"]]],
  Appliance: [["Refrigerator Repair", ["Not cooling", "Compressor noise"]], ["Washing Machine Repair", ["Drain issue"]], ["Geyser Repair", ["Heating element failure"]], ["Microwave Repair", ["Not heating"]]],
  Facility: [["Facility Maintenance", ["Routine maintenance round", "HVAC balancing"]]],
};
const CAT_SKILL = { AC: "Commercial AC", CCTV: "CCTV", RO: "RO / Water", Electrical: "Electrical", Appliance: "Appliance", Facility: "Facility" };

const r = rng(909);
const featured = [
  { id: "JOB-2841", sr: "SR-5842", customer: "Apex Mall", cat: "AC", service: "Commercial AC Breakdown", issue: "AC breakdown — Food Court, Floor 2", loc: "Lalpur", prio: "Emergency", req: NOW - 82, tech: null, status: "Awaiting Assignment", source: "Phone", pay: "AMC Included", asset: "AC-28941", value: 29854, skill: "Commercial AC" },
  { id: "JOB-2818", sr: "SR-5819", customer: "Sharma Residence", cat: "AC", service: "AC Repair", issue: "Cooling failure — master bedroom", loc: "Morabadi", prio: "High", req: NOW - 255, tech: "T01", status: "In Progress", source: "WhatsApp", pay: "Cash", delay: 28, value: 6800, skill: "Residential AC" },
  { id: "JOB-2794", sr: "SR-5791", customer: "City Hospital", cat: "AC", service: "Compressor Replacement", issue: "Compressor failure — Ward 3 AC", loc: "Harmu", prio: "High", req: NOW - 330, tech: "T05", status: "Parts Pending", source: "Phone", pay: "AMC Included", value: 38400, delay: 45, skill: "Commercial AC", part: "AC Compressor 1.5 Ton" },
  { id: "JOB-2776", sr: "SR-5770", customer: "Gupta Office", cat: "AC", service: "AC Repair", issue: "Gas leakage — 2 split units", loc: "Doranda", prio: "Normal", req: NOW - 460, tech: "T06", status: "Approval Pending", source: "Website", pay: "Credit", value: 22400, skill: "Residential AC" },
];
const unassignedPlan = ["Hotel Capital Residency", "Maa Ganga Clinic", "Orchid Diagnostics", "Radhey Showroom", "Sai Nursing Home"]; let uCount = 0;

export const JOBS = (() => {
  const out = [...featured];
  const techsBy = (b) => TECHS.filter((t) => t.branch === b && t.status !== "offline");
  const busyBy = (b) => { const p = TECHS.filter((t) => t.branch === b && ["onjob", "travelling", "delayed"].includes(t.status)); return p.length ? p : techsBy(b); };
  const mk = (i, bucket) => {
    const c = r.pick(CUSTOMERS), cat = r.pick(["AC", "AC", "AC", "CCTV", "RO", "RO", "Electrical", "Appliance", "Appliance", "Facility"]), [service, issues] = r.pick(SERVICES[cat]);
    const prio = r.pick(["Normal", "Normal", "Normal", "High", "High", "Emergency", "AMC", "AMC"]);
    const loc = r.chance(0.7) ? c.loc : r.pick(Object.keys(LOCALITIES[c.branch]));
    const src = r.pick(SOURCES), req = r.int(7 * 60 + 5, NOW - 20), as = assetsOf(c.id).filter((a) => a.cat === (cat === "Facility" ? "AC" : cat));
    const base = { id: `JOB-${2756 + i}`, sr: `SR-${5740 + i}`, customer: c.name, cat, service, issue: r.pick(issues), loc, prio, req, source: src, pay: prio === "AMC" || c.amcs ? r.pick(["AMC Included", "Cash", "UPI"]) : r.pick(["Cash", "UPI", "Card", "Credit", "Bank Transfer"]), asset: as[0]?.id || null, value: r.int(6, 62) * 100 + (cat === "Facility" ? 8000 : 0), skill: CAT_SKILL[cat] };
    const pool = techsBy(c.branch);
    if (bucket === "completed") return { ...base, tech: r.pick(pool).id, status: "Completed", done: Math.min(NOW - 5, req + r.int(60, 240)) };
    if (bucket === "unassigned") { const first = uCount === 0; return { ...base, prio: first ? "High" : base.prio === "Emergency" ? "High" : base.prio, req: NOW - (first ? 198 : r.int(5, 50)), tech: null, status: r.pick(["New", "Awaiting Assignment"]), customer: unassignedPlan[uCount++ % 5] }; }
    if (bucket === "delayed") return { ...base, tech: r.pick(busyBy(c.branch)).id, status: r.pick(["Technician En Route", "Parts Pending", "Escalated", "In Progress"]), delay: r.int(20, 70) };
    return { ...base, tech: r.pick(busyBy(c.branch)).id, status: r.pick(["Technician En Route", "Arrived", "Diagnosis", "Estimate Pending", "Approval Pending", "In Progress", "In Progress", "Scheduled"]) };
  };
  const plan = [...Array(55).fill("completed"), ...Array(5).fill("unassigned"), ...Array(6).fill("delayed"), ...Array(13).fill("progress")]; // + featured (1 unassigned, 2 delayed, 1 progress) + 3 featured completed fill below
  plan.forEach((b, i) => out.push(mk(i + 10, b)));
  // 3 extra completed to reach 58
  for (let i = 0; i < 3; i++) out.push(mk(i + 90, "completed"));
  // fix customers for unassigned
  out.forEach((j) => { j.cust = custByName(j.customer); if (!j.cust) j.cust = CUSTOMERS[j.id.length]; j.branch = j.cust?.branch || "ranchi"; });
  // ensure unassigned fakes belong to ranchi
  out.filter((j) => unassignedPlan.includes(j.customer)).forEach((j) => { j.branch = "ranchi"; j.loc = r.pick(Object.keys(LOCALITIES.ranchi)); });
  // assign ids sequentially by req time (featured keep ids)
  const gen = out.filter((j) => !featured.some((f) => f.id === j.id)).sort((a, b) => a.req - b.req);
  gen.forEach((j, k) => { j.id = `JOB-${2750 + k}`; j.sr = `SR-${5740 + k}`; });
  out.forEach((j) => { j.sla = SLA_MIN[j.prio]; j.slaLeft = j.req + j.sla - NOW; j.pos = localityPos(j.branch, j.loc, 3); j.bucket = j.status === "Completed" ? "completed" : !j.tech ? "unassigned" : j.delay ? "delayed" : "progress"; });
  return out.sort((a, b) => b.req - a.req);
})();
export const jobById = (id) => JOBS.find((j) => j.id === id);
export const jobsOf = (custName) => JOBS.filter((j) => j.customer === custName);
export const TODAY = {
  total: JOBS.length, completed: JOBS.filter((j) => j.bucket === "completed").length, progress: JOBS.filter((j) => j.bucket === "progress").length,
  delayed: JOBS.filter((j) => j.bucket === "delayed").length, unassigned: JOBS.filter((j) => j.bucket === "unassigned").length,
};
// attach current job to each active technician
export const CURRENT = (() => {
  const m = {};
  JOBS.filter((j) => j.tech && j.status !== "Completed" && ["onjob", "travelling", "delayed"].includes(techById(j.tech).status)).forEach((j) => { m[j.tech] = j; });
  const r2 = rng(55);
  TECHS.filter((t) => ["onjob", "travelling", "delayed"].includes(t.status) && !m[t.id]).forEach((t) => {
    const c = r2.pick(CUSTOMERS.filter((c) => c.branch === t.branch));
    m[t.id] = { id: null, customer: c.name, service: r2.pick(["Preventive visit (AMC)", "Installation project", "Scheduled maintenance", "Filter replacement"]), loc: c.loc, pos: localityPos(t.branch, c.loc, 5), status: "In Progress" };
  });
  return m;
})();
export const etaOf = (t) => { const j = CURRENT[t.id]; if (!j) return null; if (t.id === "T01") return 18; return t.status === "travelling" ? 8 + (t.id.charCodeAt(2) % 17) : t.status === "delayed" ? 12 + (t.id.charCodeAt(2) % 20) : 20 + (t.id.charCodeAt(2) % 50); };

// recommendation engine for dispatch
export function recommend(job, branchTechs = TECHS) {
  const T = branchTechs.filter((t) => t.status !== "offline" && t.branch === job.branch);
  return T.map((t) => {
    const skillMatch = t.skills.includes(job.skill) ? 100 : t.skills.some((s) => s.includes(job.skill.split(" ")[0])) ? 78 : t.skills.includes("Electrical") && job.cat === "Facility" ? 70 : 40;
    let d = +dist(t.pos, job.pos).toFixed(1), avail = t.status === "available" ? 0 : etaOf(t) ?? 30;
    if (t.id === "T01" && job.id === "JOB-2841") d = 4.8; if (t.id === "T02" && job.id === "JOB-2841") d = 2.9;
    const skillM = t.id === "T02" && job.id === "JOB-2841" ? 78 : skillMatch;
    const score = skillM * 0.42 + Math.max(0, 100 - d * 7) * 0.2 + Math.max(0, 100 - avail * 1.4) * 0.14 + t.ftf * 0.14 + t.rating * 20 * 0.1;
    return { t, skill: skillM, d, avail, score: +score.toFixed(1), load: t.jobsToday >= 5 ? "High" : t.jobsToday >= 3 ? "Moderate" : "Light" };
  }).sort((a, b) => b.score - a.score);
}

// ---------- AMC ----------
export const AMCS = (() => {
  const rr = rng(1212);
  const out = [
    { id: "AMC-1824", cust: "City Hospital", scope: "42 AC units — Comprehensive", assets: 42, start: "01 Jan 2026", expiry: "31 Dec 2026", days: 86, incl: 4, used: 3, next: "18 Oct 2026", value: 480000, prob: 92, status: "Active", sla: "4 hours", cost: 301000 },
    { id: "AMC-1790", cust: "City Hospital", scope: "Electrical & UPS — Comprehensive", assets: 18, start: "19 Oct 2025", expiry: "18 Oct 2026", days: 12, incl: 6, used: 5, next: "12 Oct 2026", value: 480000, prob: 58, status: "Expiring", sla: "2 hours", cost: 342000, renewal: "Not initiated" },
    { id: "AMC-1802", cust: "Apex Mall", scope: "Cassette & split AC — Comprehensive", assets: 34, start: "01 Apr 2026", expiry: "31 Mar 2027", days: 176, incl: 4, used: 2, next: "18 Dec 2026", value: 560000, prob: 88, status: "Active", sla: "2 hours", cost: 436000 },
    { id: "AMC-1811", cust: "Apex Mall", scope: "CCTV — Non-comprehensive", assets: 28, start: "01 Jul 2026", expiry: "30 Jun 2027", days: 267, incl: 4, used: 1, next: "10 Nov 2026", value: 190000, prob: 84, status: "Active", sla: "8 hours", cost: 121000 },
    { id: "AMC-1768", cust: "Eastern Public School", scope: "AC & RO — Comprehensive", assets: 74, start: "01 Jun 2025", expiry: "31 Oct 2026", days: 25, incl: 4, used: 4, next: "—", value: 360000, prob: 64, status: "Expiring", sla: "24 hours", cost: 352000, renewal: "Quote sent" },
    { id: "AMC-1744", cust: "Metro Office Park", scope: "HVAC & Electrical", assets: 56, start: "15 Nov 2025", expiry: "14 Nov 2026", days: 39, incl: 4, used: 3, next: "22 Oct 2026", value: 420000, prob: 81, status: "Expiring", sla: "4 hours", cost: 296000, renewal: "In discussion" },
    { id: "AMC-1821", cust: "Bihar Retail Group", scope: "Store HVAC — 9 locations", assets: 120, start: "01 Feb 2026", expiry: "31 Jan 2027", days: 117, incl: 6, used: 3, next: "14 Oct 2026", value: 920000, prob: 77, status: "Active", sla: "4 hours", cost: 782000 },
    { id: "AMC-1733", cust: "Royal Residency", scope: "Lift lobby AC & RO", assets: 48, start: "01 Dec 2025", expiry: "30 Nov 2026", days: 55, incl: 4, used: 3, next: "26 Oct 2026", value: 210000, prob: 52, status: "Overdue visit", sla: "24 hours", cost: 226000, renewal: "Not initiated" },
  ];
  CUSTOMERS.filter((c) => c.amcs && !out.some((o) => o.cust === c.name)).slice(0, 34).forEach((c, i) => {
    const days = rr.int(-5, 330), val = rr.int(40, 340) * 1000, used = rr.int(0, 4), cost = Math.round(val * rr.range(0.55, 1.04));
    out.push({ id: `AMC-${1600 + i * 3}`, cust: c.name, scope: rr.pick(["Split AC — Comprehensive", "CCTV & DVR", "RO — Non-comprehensive", "Electrical maintenance", "Facility maintenance"]), assets: rr.int(4, 60), start: "01 Jan 2026", expiry: `${days < 30 ? "18 Oct" : "31 Dec"} 2026`, days, incl: 4, used, next: `${rr.int(8, 28)} Oct 2026`, value: val, prob: rr.int(48, 96), status: days < 0 ? "Expired" : days < 30 ? "Expiring" : used < 2 && days < 120 ? "Overdue visit" : "Active", sla: rr.pick(["4 hours", "8 hours", "24 hours"]), cost, renewal: days < 30 ? "Not initiated" : null });
  });
  return out;
})();
export const amcById = (id) => AMCS.find((a) => a.id === id);

// ---------- Parts ----------
const PART_DEFS = [
  ["AC Compressor 1.5 Ton", "AC", 14200, 18500], ["AC Compressor 2 Ton", "AC", 17800, 23000], ["AC Compressor 5 Ton", "AC", 36500, 46500], ["AC Capacitor 35µF", "AC", 180, 420], ["R410A Gas (kg)", "AC", 780, 1150], ["R32 Gas (kg)", "AC", 720, 1050], ["Copper Pipe 1/4\" (m)", "AC", 340, 520], ["AC PCB Universal", "AC", 1400, 2600], ["Indoor Fan Motor", "AC", 1250, 2200], ["Drain Pump", "AC", 1100, 1900], ["Air Filter Pack", "AC", 90, 260],
  ["Hikvision 4MP Dome Camera", "CCTV", 2200, 3400], ["CP Plus 5MP Bullet Camera", "CCTV", 2600, 3900], ["CP Plus 32-Ch DVR", "CCTV", 9800, 14500], ["SMPS 12V 10A", "CCTV", 520, 950], ["CCTV Cable 90m", "CCTV", 1450, 2200], ["BNC Connector (10)", "CCTV", 90, 220], ["2TB Surveillance HDD", "CCTV", 3600, 4900],
  ["Kent Sediment Filter", "RO", 140, 380], ["RO Membrane 75 GPD", "RO", 1100, 1850], ["Carbon Filter", "RO", 220, 520], ["UV Lamp", "RO", 420, 780], ["Booster Pump 24V", "RO", 1250, 2000], ["RO SMPS Adapter", "RO", 380, 720], ["Solenoid Valve", "RO", 210, 450],
  ["MCB 32A DP", "Electrical", 380, 640], ["MCCB 100A", "Electrical", 2900, 4400], ["Contactor 40A", "Electrical", 1050, 1750], ["Copper Cable 4 sq mm (m)", "Electrical", 62, 98], ["Digital Meter", "Electrical", 780, 1300], ["UPS Battery 12V 150Ah", "Electrical", 9800, 12800],
  ["Geyser Heating Element", "Appliance", 340, 780], ["Geyser Thermostat", "Appliance", 180, 450], ["Washing Machine Drain Pump", "Appliance", 560, 1100], ["Refrigerator Compressor 165L", "Appliance", 4300, 6200], ["Microwave Magnetron", "Appliance", 1500, 2600], ["Fridge Thermostat", "Appliance", 210, 520],
];
export const PARTS = (() => {
  const pr = rng(2121), out = [];
  PART_DEFS.forEach(([name, cat, buy, sell], i) => {
    ["Ranchi", "Dhanbad", "Jamshedpur", "Patna"].forEach((br, bi) => {
      const reorder = pr.int(3, 14), avail = pr.chance(0.1) ? 0 : pr.int(0, reorder * 3), res = Math.min(avail, pr.int(0, 3)), withT = pr.int(0, 6);
      out.push({ key: `${i}-${br}`, name, sku: `PC-${cat.slice(0, 2).toUpperCase()}-${String(100 + i)}`, cat, branch: br, avail, res, withT, reorder, buy, sell });
    });
  });
  const comp = out.find((p) => p.name === "AC Compressor 1.5 Ton" && p.branch === "Ranchi"); Object.assign(comp, { avail: 0, res: 0, withT: 1, reorder: 4 });
  Object.assign(out.find((p) => p.name === "AC Compressor 1.5 Ton" && p.branch === "Dhanbad"), { avail: 2, res: 0, reorder: 3 });
  out.forEach((p) => { p.status = p.avail === 0 ? "Out of stock" : p.avail <= p.reorder ? "Low" : "OK"; });
  return out;
})();
export const PART_KPI = { value: 4620000, low: 38, out: 11, withTech: 612, reserved: 74 };
export const TRANSFERS = [
  { id: "TR-3318", kind: "Branch → Branch", item: "AC Compressor 1.5 Ton × 2", from: "Dhanbad", to: "Ranchi", status: "In transit", eta: "3:40 PM", note: "Unblocks JOB-2794 and 2 more" },
  { id: "TR-3317", kind: "Warehouse → Technician", item: "R410A Gas × 12 kg", from: "Ranchi WH", to: "Amit Singh", status: "Delivered", eta: "11:05 AM" },
  { id: "TR-3315", kind: "Technician → Technician", item: "Capacitor 35µF × 4", from: "Rohit Kumar", to: "Arun Verma", status: "Delivered", eta: "10:20 AM" },
  { id: "TR-3312", kind: "Return → Warehouse", item: "Unused Camera 4MP × 2", from: "Vikas Yadav", to: "Ranchi WH", status: "Received", eta: "Yesterday" },
  { id: "TR-3309", kind: "Damaged", item: "RO Membrane 75 GPD × 1", from: "Manoj Sharma", to: "Quarantine", status: "Written off", eta: "Yesterday" },
  { id: "TR-3322", kind: "Branch → Branch", item: "Contactor 40A × 6", from: "Jamshedpur", to: "Patna", status: "Approved", eta: "Tomorrow" },
];
export const PART_REQ = [
  { id: "PR-912", job: "JOB-2794", part: "AC Compressor 1.5 Ton", tech: "Pankaj Kumar", stage: 3, impact: "SLA breached by 45 min · ₹38,400 at risk", cust: "City Hospital" },
  { id: "PR-914", job: "JOB-2802", part: "RO Membrane 75 GPD", tech: "Manoj Sharma", stage: 1, impact: "SLA at risk in 2h 10m", cust: "Eastern Public School" },
  { id: "PR-915", job: "JOB-2809", part: "CP Plus 32-Ch DVR", tech: "Vikas Yadav", stage: 0, impact: "Within SLA · 1 day buffer", cust: "Bihar Retail Group" },
];
export const WARRANTY = [
  { part: "AC Compressor 5 Ton", job: "JOB-2531", cust: "Apex Mall", start: "02 Aug 2026", end: "02 Aug 2027", supplier: "Blue Star Parts", claim: "None" },
  { part: "Hikvision 4MP Camera", job: "JOB-2604", cust: "Metro Office Park", start: "11 Aug 2026", end: "11 Aug 2027", supplier: "Hikvision India", claim: "Claim raised" },
  { part: "RO Membrane 75 GPD", job: "JOB-2688", cust: "Sharma Residence", start: "28 Aug 2026", end: "28 Feb 2027", supplier: "Kent RO", claim: "None" },
  { part: "AC PCB Universal", job: "JOB-2714", cust: "Royal Residency", start: "14 Sep 2026", end: "14 Mar 2027", supplier: "Daikin Spares", claim: "Replaced by supplier" },
  { part: "UPS Battery 150Ah", job: "JOB-2399", cust: "City Hospital", start: "20 Jun 2026", end: "20 Jun 2028", supplier: "Luminous", claim: "None" },
  { part: "Geyser Element", job: "JOB-2740", cust: "Gupta Office", start: "30 Sep 2026", end: "30 Mar 2027", supplier: "AO Smith", claim: "Claim rejected" },
];

// ---------- Billing ----------
export const INVOICES = (() => {
  const ir = rng(3131), out = [];
  const jobs = JOBS.filter((j) => j.status === "Completed");
  for (let i = 0; i < 64; i++) {
    const j = jobs[i % jobs.length], c = CUSTOMERS[(i * 7) % CUSTOMERS.length], labour = ir.int(5, 40) * 100, parts = ir.chance(0.55) ? ir.int(4, 220) * 100 : 0, tax = Math.round((labour + parts) * 0.18), total = labour + parts + tax;
    const age = ir.pick([-6, -2, 0, 2, 4, 6, 11, 14, 22, 28, 40, 52, 66, 80]), paid = age <= 0 && ir.chance(0.5) ? 0 : ir.chance(0.55) ? total : ir.chance(0.2) ? Math.round(total / 2) : 0;
    out.push({ id: `INV-26/${String(4180 - i).padStart(4, "0")}`, customer: c.name, cust: c, job: i < 20 ? j.id : `JOB-${2400 + i * 7}`, service: j.service, labour, parts, tax, total, paid, balance: total - paid, age, due: age > 0 ? `${age}d overdue` : age === 0 ? "Due today" : `In ${-age}d`, status: total === paid ? "Paid" : paid ? "Partial" : age > 0 ? "Overdue" : "Unpaid" });
  }
  return out;
})();
export const AGING = [["Not due", 5.6], ["0–7 days", 2.9], ["8–15 days", 2.1], ["16–30 days", 2.0], ["31–60 days", 2.5], ["60+ days", 1.7]].map(([k, v]) => ({ k, v: v * 1e5 }));
export const PAYMENTS = [
  ["PAY-9921", "Apex Mall", "UPI", 29854, "12:34 PM", "Rohit Kumar", "JOB-2790"], ["PAY-9920", "Orchid Diagnostics", "Bank Transfer", 184000, "12:10 PM", "Accounts", "INV-26/4101"], ["PAY-9919", "Sharma Residence", "Cash", 3540, "11:48 AM", "Manoj Sharma", "JOB-2796"],
  ["PAY-9918", "Metro Office Park", "Cheque", 68000, "11:20 AM", "Accounts", "INV-26/4088"], ["PAY-9917", "Maa Ganga Clinic", "Card", 9440, "10:52 AM", "Vikas Yadav", "JOB-2781"], ["PAY-9916", "Gupta Office", "Credit", 22400, "10:30 AM", "Pankaj Kumar", "JOB-2776"],
  ["PAY-9915", "Royal Residency", "AMC Included", 0, "10:05 AM", "Arun Verma", "JOB-2779"], ["PAY-9914", "Radhey Showroom", "UPI", 12980, "09:41 AM", "Amit Singh", "JOB-2773"], ["PAY-9913", "Eastern Public School", "Bank Transfer", 96000, "09:12 AM", "Accounts", "INV-26/4079"], ["PAY-9912", "Hotel Capital Residency", "Cash", 7080, "08:55 AM", "Suresh Mahto", "JOB-2768"],
].map(([id, customer, mode, amount, time, by, ref]) => ({ id, customer, mode, amount, time, by, ref }));
export const MODES = [["UPI", 31], ["Cash", 22], ["Bank Transfer", 24], ["Card", 6], ["Cheque", 7], ["Credit", 6], ["AMC Included", 4]];
export const ESTIMATES = [
  { id: "EST-4410", job: "JOB-2841", customer: "Apex Mall", title: "Compressor Replacement", total: 29854, status: "Draft", age: "—" },
  { id: "EST-4409", job: "JOB-2776", customer: "Gupta Office", title: "Gas refill + leak repair", total: 22400, status: "Awaiting approval", age: "3h 02m" },
  { id: "EST-4407", job: "JOB-2794", customer: "City Hospital", title: "Compressor replacement — Ward 3", total: 38400, status: "Approved", age: "5h" },
  { id: "EST-4404", job: "JOB-2790", customer: "Orchid Diagnostics", title: "PCB replacement", total: 9440, status: "Approved", age: "6h" },
  { id: "EST-4401", job: "JOB-2783", customer: "Radhey Showroom", title: "DVR + 2 cameras", total: 41200, status: "Awaiting approval", age: "1h 40m" },
  { id: "EST-4398", job: "JOB-2771", customer: "Hotel Capital Residency", title: "Wiring repair — Floor 3", total: 14800, status: "Rejected", age: "Yesterday" },
  { id: "EST-4396", job: "JOB-2765", customer: "Sharma Residence", title: "Geyser element", total: 2360, status: "Approved", age: "Yesterday" },
];

// ---------- Feedback ----------
export const FEEDBACK = [
  ["Apex Mall", "Rohit Kumar", 5, 5, 5, 4, "Quick diagnosis, neat work.", 9], ["Sharma Residence", "Manoj Sharma", 4, 5, 4, 3, "Good work but arrived late.", 7], ["City Hospital", "Pankaj Kumar", 3, 4, 3, 2, "Waited long for the compressor.", 4],
  ["Eastern Public School", "Suresh Mahto", 5, 5, 5, 5, "Very professional.", 10], ["Gupta Office", "Pankaj Kumar", 2, 3, 2, 3, "Same issue again. Repeat visit.", 3], ["Metro Office Park", "Vikas Yadav", 5, 5, 5, 5, "CCTV set perfectly.", 10],
  ["Royal Residency", "Arun Verma", 4, 4, 4, 4, "Fine.", 8], ["Bihar Retail Group", "Amit Singh", 4, 4, 5, 4, "Fixed in one visit.", 9],
].map(([customer, tech, overall, behaviour, quality, timeliness, comment, nps]) => ({ customer, tech, overall, behaviour, quality, timeliness, comment, nps }));

// ---------- Series ----------
export const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
export const SERIES = {
  revenue: [78, 82, 74, 80, 96, 118, 124, 112, 102, 98, 104, 84.6], // ₹L
  collections: [70, 76, 70, 74, 88, 106, 112, 104, 96, 90, 96, 69.4],
  sla: [88, 89, 90, 91, 90, 89, 91, 92, 91, 92, 92, 92],
  ftf: [83, 84, 84, 85, 85, 86, 86, 87, 86, 87, 87, 87],
  csat: [4.3, 4.3, 4.4, 4.4, 4.5, 4.5, 4.5, 4.6, 4.6, 4.6, 4.6, 4.6],
};
export const HEALTH = { score: 89, parts: [["Response Time", 91], ["Completion Rate", 88], ["First-Time Fix", 87], ["Customer Satisfaction", 92], ["Technician Utilization", 84], ["Collections", 79], ["AMC Retention", 93]] };
export const KPI = { requests: 86, scheduled: 74, completed: 58, pending: 28, active: 52, ftf: 87, revenue: 8460000, collections: 6940000, outstanding: 1680000, amcs: 1204 };

// ---------- Alerts / notifications ----------
export const ALERTS = [
  { id: "a1", tone: "r", kind: "Customer waiting", title: "Apex Mall — AC breakdown", time: "now", href: "/dispatch", rows: [["Job", "JOB-2841"], ["Priority", "Emergency"], ["SLA", "2 hours"], ["Elapsed", "1h 22m"], ["Technician", "Not assigned"]], impact: "SLA breach in 38 min. Food Court tenants (14 outlets) are affected — ₹29,854 job, ₹1.2L/day footfall-linked exposure." },
  { id: "a2", tone: "a", kind: "Technician delayed", title: "Rohit Kumar — JOB-2818", time: "8m ago", href: "/jobs/JOB-2818", rows: [["Customer", "Sharma Residence"], ["ETA exceeded", "28 min"]], impact: "Rohit's next two jobs will start late. Re-sequencing saves 34 min of cumulative delay." },
  { id: "a3", tone: "a", kind: "Part required", title: "AC Compressor 1.5 Ton — JOB-2794", time: "22m ago", href: "/inventory", rows: [["Ranchi stock", "0"], ["Dhanbad stock", "2 units"], ["Transfer", "TR-3318 in transit"]], impact: "Compressor stock is unavailable at Ranchi branch and is blocking 3 jobs worth ₹84,000." },
  { id: "a4", tone: "r", kind: "AMC expiring", title: "City Hospital — AMC-1790", time: "today", href: "/amc/AMC-1790", rows: [["AMC value", "₹4.8L"], ["Expiry", "12 days"], ["Renewal", "Not initiated"]], impact: "City Hospital's ₹4.8L AMC expires in 12 days and renewal has not yet started." },
  { id: "a5", tone: "a", kind: "Approval pending", title: "Gupta Office — JOB-2776", time: "3h ago", href: "/estimates", rows: [["Estimate", "₹22,400"], ["Waiting", "3h 02m"]], impact: "Technician is idle on site; customer approval is blocking ₹22,400 and the SLA." },
  { id: "a6", tone: "r", kind: "Repeat complaint", title: "AC-28941 — Apex Mall", time: "1d ago", href: "/assets/AC-28941", rows: [["Cooling complaints", "4 in 90 days"], ["Spend", "₹28,400"]], impact: "Repairs on this AC have cost ₹28,400 in 90 days. Replacement may be more economical." },
];
export const NOTIFS = [
  { tone: "r", kind: "Emergency job", text: "JOB-2841 Apex Mall — Emergency AC breakdown created via phone.", time: "1h 22m" },
  { tone: "r", kind: "SLA risk", text: "JOB-2841 will breach SLA in 38 min with no technician assigned.", time: "now" },
  { tone: "a", kind: "Technician delayed", text: "Rohit Kumar is 28 min over ETA at Sharma Residence.", time: "8m" },
  { tone: "a", kind: "Part unavailable", text: "AC Compressor 1.5 Ton out of stock at Ranchi (3 jobs blocked).", time: "22m" },
  { tone: "a", kind: "Approval pending", text: "Gupta Office estimate ₹22,400 pending for 3 hours.", time: "3h" },
  { tone: "b", kind: "AMC visit due", text: "18 AMC visits due this week across 4 branches.", time: "6:00 AM" },
  { tone: "r", kind: "AMC expiry", text: "City Hospital AMC-1790 ₹4.8L expires in 12 days.", time: "6:00 AM" },
  { tone: "a", kind: "Payment overdue", text: "₹4.2L of invoices overdue by more than 30 days.", time: "6:00 AM" },
  { tone: "r", kind: "Negative feedback", text: "Gupta Office rated 2★ — repeat issue on gas leakage.", time: "11:10 AM" },
  { tone: "a", kind: "Repeat complaint", text: "Cooling issue complaints up 18% in Ranchi Central.", time: "Yesterday" },
  { tone: "a", kind: "Document expiry", text: "Working-at-height certificate: 3 technicians expire within 14 days.", time: "Yesterday" },
  { tone: "a", kind: "Low inventory", text: "3 critical parts below minimum level.", time: "Yesterday" },
];

// ---------- Activity / comms / docs / compliance ----------
export const ACTIVITY = [
  ["10:18 AM", "Service request SR-5842 created.", "Customer Support · Neha Verma", "b"], ["10:24 AM", "Rohit Kumar assigned.", "Dispatcher · Rakesh Jha", "b"], ["10:29 AM", "Technician started travel.", "Rohit Kumar · app", "a"], ["10:47 AM", "Technician arrived.", "GPS geo-fence", "b"],
  ["11:06 AM", "Estimate ₹29,854 created.", "Rohit Kumar · app", "a"], ["11:12 AM", "Customer approved estimate.", "Apex Mall · digital signature", "g"], ["12:28 PM", "Job completed.", "Rohit Kumar · app", "g"], ["12:34 PM", "Payment ₹29,854 received (UPI).", "Rohit Kumar · app", "g"],
  ["12:41 PM", "Compressor 1.5 Ton reserved from Dhanbad branch.", "Inventory · Imran Ansari", "b"], ["12:52 PM", "JOB-2841 SLA risk raised to Critical.", "System", "r"], ["01:02 PM", "Invoice INV-26/4181 sent via WhatsApp.", "Accounts · Meena Shah", "n"], ["01:10 PM", "Negative feedback (2★) flagged — Gupta Office.", "System", "r"],
].map(([time, text, by, tone]) => ({ time, text, by, tone }));
export const COMMS = [
  ["12:52 PM", "WhatsApp", "Your technician Rohit Kumar has been assigned.", "Apex Mall", "Delivered"], ["12:36 PM", "SMS", "Your service has been completed.", "Sharma Residence", "Delivered"], ["12:31 PM", "WhatsApp", "Your invoice is ready.", "Orchid Diagnostics", "Read"],
  ["12:20 PM", "WhatsApp", "Your technician is 18 minutes away.", "Maa Ganga Clinic", "Read"], ["11:58 AM", "Call", "Outbound call · apology for delay (3m 12s)", "City Hospital", "Answered"], ["11:40 AM", "Email", "Your estimate is ready.", "Gupta Office", "Opened"],
  ["11:12 AM", "WhatsApp", "Estimate approved — thank you.", "Apex Mall", "Delivered"], ["10:30 AM", "SMS", "Payment reminder — INV-26/4012 overdue 22 days.", "Eastern Public School", "Delivered"], ["09:15 AM", "Email", "Your next AMC visit is due on 18 Dec.", "Apex Mall", "Opened"],
].map(([time, ch, text, customer, state]) => ({ time, ch, text, customer, state }));
export const DOCS = [
  ["AMC Agreement — City Hospital 2026", "AMC Agreement", "Contract", "04 Jan 2026"], ["INV-26/4181", "Invoice", "Apex Mall", "06 Oct 2026"], ["EST-4410", "Estimate", "Apex Mall", "06 Oct 2026"], ["Signature — JOB-2790", "Customer Signature", "Orchid Diagnostics", "06 Oct 2026"],
  ["Service Report — JOB-2790", "Service Report", "Orchid Diagnostics", "06 Oct 2026"], ["Rohit Kumar — Electrical Licence", "Technician Certification", "T01", "Valid · Mar 2028"], ["Warranty — Blue Star 5T Compressor", "Warranty Card", "AC-28941", "02 Aug 2026"], ["Daikin Split 1.5T — Service Manual", "Asset Manual", "AC-27102", "—"], ["Before/After — JOB-2790 (8 photos)", "Photos", "Orchid Diagnostics", "06 Oct 2026"],
].map(([name, type, ref, date]) => ({ name, type, ref, date }));
export const COMPLIANCE = TECHS.slice(0, 14).map((t, i) => ({ t, safety: i === 5 ? "Expires 11 Oct" : "Valid · Mar 2027", cert: "Valid", ppe: i === 3 ? "Missing helmet" : "Issued", elec: t.skills.includes("Electrical") ? (i === 8 ? "Expires 18 Oct" : "Valid · 2028") : "—", height: i === 1 ? "Expires 14 Oct" : i === 4 ? "Expired" : "Valid · 2027" }));
export const TERRITORIES = [
  { zone: "Ranchi Central", branch: "Ranchi", jobs: 21, techs: 12, resp: 34, rev: 1420000, sla: 94 }, { zone: "Ranchi East", branch: "Ranchi", jobs: 12, techs: 8, resp: 41, rev: 860000, sla: 92 }, { zone: "Ranchi West", branch: "Ranchi", jobs: 9, techs: 8, resp: 38, rev: 560000, sla: 93 },
  { zone: "Dhanbad", branch: "Dhanbad", jobs: 16, techs: 14, resp: 47, rev: 1180000, sla: 90 }, { zone: "Jamshedpur", branch: "Jamshedpur", jobs: 17, techs: 14, resp: 43, rev: 1260000, sla: 91 }, { zone: "Patna", branch: "Patna", jobs: 11, techs: 12, resp: 58, rev: 840000, sla: 86 },
];
export const PROFIT = { service: [["Commercial AC", 36], ["Residential AC", 39], ["RO / Water", 42], ["CCTV", 31], ["Electrical", 34], ["Appliance Repair", 37], ["Facility", 28]], rev: [["Service", 3820000], ["Parts", 2140000], ["AMC", 1720000], ["Installation", 780000]] };
