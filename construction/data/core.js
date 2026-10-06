import { daysLeft } from "@/lib/format";

export const COMPANY = {
  name: "Vertex Buildcon Pvt. Ltd.", hq: "Ranchi, Jharkhand", turnover: 42, active: 7, upcoming: 3, employees: 286, subcontractors: 64, suppliers: 118,
  value: 86.9, completed: 47.8, billed: 39.4, certified: 36.7, collected: 31.8, spend: 42.2, receivable: 7.6, payable: 4.3, outstanding: 4.9, unbilled: 8.4, completion: 55,
};

export const PEOPLE = {
  arjun: { name: "Arjun Mehta", role: "Managing Director" },
  rahul: { name: "Rahul Sinha", role: "Project Manager" },
  manish: { name: "Manish Verma", role: "Project Manager" },
  prakash: { name: "Prakash Yadav", role: "Project Manager" },
  vikas: { name: "Vikas Singh", role: "Project Manager" },
  priya: { name: "Priya Sharma", role: "Project Manager" },
  neha: { name: "Neha Gupta", role: "Project Manager" },
  amit: { name: "Amit Kumar", role: "Project Manager" },
};

export const CLIENTS = ["Urban Living Developers", "Eastern Business Group", "Orion Realty", "Ranchi Industrial Corporation", "Metro Retail Ventures", "Royal Estate Developers"];

// value / spent / earned / billed / collected in ₹ Cr
export const PROJECTS = [
  { id: "skyline", name: "Skyline Residency", city: "Ranchi", state: "Jharkhand", type: "Residential", kind: "tower", client: "Urban Living Developers", value: 18.4, pct: 62, planned: 65, budget: 58, status: "On Track", pm: "Rahul Sinha", start: "2026-01-15", end: "2027-02-28", spent: 10.6, billed: 9.8, collected: 8.4, margin: 17.9, lat: 23.34, lon: 85.31, workers: 146, health: 86, scope: "3 residential towers, club house & external development", weather: "Clear · 29°C", issues: 3, update: "6:02 PM", seed: 1 },
  { id: "orion", name: "Orion Business Park", city: "Dhanbad", state: "Jharkhand", type: "Commercial", kind: "commercial", client: "Orion Realty", value: 26.7, pct: 41, planned: 46, budget: 46, status: "Attention Required", pm: "Manish Verma", start: "2026-02-10", end: "2027-06-30", spent: 12.3, billed: 8.4, collected: 6.3, margin: 11.2, lat: 23.8, lon: 86.43, workers: 118, health: 71, scope: "2 commercial blocks with basement parking", weather: "Haze · 31°C", issues: 6, update: "5:40 PM", seed: 2 },
  { id: "greenfield", name: "Greenfield Industrial Plant", city: "Jamshedpur", state: "Jharkhand", type: "Industrial", kind: "industrial", client: "Ranchi Industrial Corporation", value: 14.8, pct: 77, planned: 78, budget: 74, status: "On Track", pm: "Prakash Yadav", start: "2025-09-01", end: "2027-01-15", spent: 10.9, billed: 10.4, collected: 9.0, margin: 15.6, lat: 22.8, lon: 86.2, workers: 96, health: 90, scope: "PEB plant shed, utilities & boundary", weather: "Clear · 30°C", issues: 2, update: "5:55 PM", seed: 3 },
  { id: "royal", name: "Royal Heights", city: "Patna", state: "Bihar", type: "Residential", kind: "tower", client: "Royal Estate Developers", value: 9.8, pct: 29, planned: 29, budget: 26, status: "On Track", pm: "Vikas Singh", start: "2026-05-04", end: "2027-11-30", spent: 2.5, billed: 2.4, collected: 1.8, margin: 16.8, lat: 25.59, lon: 85.14, workers: 74, health: 88, scope: "2 residential towers, 96 apartments", weather: "Cloudy · 28°C", issues: 1, update: "5:12 PM", seed: 4 },
  { id: "metro", name: "Metro Mall Interiors", city: "Kolkata", state: "West Bengal", type: "Interior Fit-Out", kind: "interior", client: "Metro Retail Ventures", value: 4.2, pct: 83, planned: 85, budget: 89, status: "Cost Risk", pm: "Priya Sharma", start: "2026-06-01", end: "2026-12-18", spent: 3.7, billed: 3.1, collected: 2.6, margin: 6.1, lat: 22.57, lon: 88.36, workers: 64, health: 64, scope: "3-level mall fit-out, food court & lobbies", weather: "Rain · 27°C", issues: 7, update: "6:20 PM", seed: 5 },
  { id: "eastern", name: "Eastern Logistics Warehouse", city: "Bokaro", state: "Jharkhand", type: "Warehouse", kind: "warehouse", client: "Eastern Business Group", value: 7.6, pct: 54, planned: 55, budget: 51, status: "On Track", pm: "Neha Gupta", start: "2026-03-02", end: "2027-03-31", spent: 3.9, billed: 3.6, collected: 2.7, margin: 14.4, lat: 23.67, lon: 86.15, workers: 60, health: 84, scope: "40,000 sq ft warehouse with dock levellers", weather: "Clear · 30°C", issues: 2, update: "4:48 PM", seed: 6 },
  { id: "riverside", name: "Riverside Villas", city: "Ranchi", state: "Jharkhand", type: "Villas", kind: "villa", client: "Urban Living Developers", value: 5.4, pct: 36, planned: 47, budget: 39, status: "Delayed", pm: "Amit Kumar", start: "2026-04-15", end: "2027-05-20", spent: 2.1, billed: 1.7, collected: 1.0, margin: 9.4, lat: 23.39, lon: 85.36, workers: 48, health: 58, scope: "24 premium villas in 2 blocks", weather: "Overcast · 28°C", issues: 8, update: "3:30 PM", seed: 7 },
];
PROJECTS.forEach((p) => {
  p.days = daysLeft(p.end);
  p.earned = +(p.value * p.pct / 100).toFixed(1);
  p.nearDone = p.pct >= 75 && p.status === "On Track";
  p.mapTone = p.status === "Delayed" ? "bad" : p.status === "Attention Required" ? "warn" : p.status === "Cost Risk" ? "risk" : p.nearDone ? "info" : "good";
});
export const getProject = (id) => PROJECTS.find((p) => p.id === id);
export const projName = (id) => getProject(id)?.name ?? id;

export const HEALTH = {
  skyline: { Schedule: 82, Budget: 91, Quality: 94, Safety: 88, Material: 78, "Cash Flow": 76 },
  orion: { Schedule: 68, Budget: 74, Quality: 82, Safety: 79, Material: 61, "Cash Flow": 58 },
  greenfield: { Schedule: 91, Budget: 90, Quality: 92, Safety: 93, Material: 88, "Cash Flow": 86 },
  royal: { Schedule: 90, Budget: 92, Quality: 86, Safety: 87, Material: 85, "Cash Flow": 82 },
  metro: { Schedule: 72, Budget: 48, Quality: 66, Safety: 78, Material: 64, "Cash Flow": 70 },
  eastern: { Schedule: 86, Budget: 88, Quality: 85, Safety: 84, Material: 80, "Cash Flow": 78 },
  riverside: { Schedule: 42, Budget: 63, Quality: 74, Safety: 70, Material: 44, "Cash Flow": 55 },
};
export const HEALTH_NOTE = {
  skyline: "Schedule health dropped due to delayed structural work in Block B and pending reinforcement steel delivery.",
  orion: "Cash flow health is weak: RA Bill #08 (₹72.4L) is 18 days overdue and steel is short for Block A columns.",
  greenfield: "All indicators healthy. Final PEB erection is on plan; only utilities commissioning needs watching.",
  royal: "Healthy start. Material buffers are adequate; watch monsoon exposure on Tower 1 podium slab.",
  metro: "Budget health is red: 89% of budget used for 83% of work. Rework and tile rate escalation are the main drivers.",
  eastern: "Stable. Dock leveller supply is the only item trending late; no impact on handover yet.",
  riverside: "Steel delay, contractor manpower shortage and rain have pushed Block B slab 11 days behind plan.",
};

export const ALERTS = [
  { id: "a1", tone: "bad", kind: "Project Delay", project: "riverside", title: "Riverside Villas", lines: ["11 days behind schedule", "Affected milestone: Structure — Block B", "Reason: Steel procurement delay"], impact: "₹14.8L estimated impact", cta: "Why is it delayed?", ask: "Why is Riverside Villas delayed?" },
  { id: "a2", tone: "risk", kind: "Budget Risk", project: "metro", title: "Metro Mall Interiors", lines: ["89% budget consumed", "83% work complete", "Projected overrun: ₹11.4L"], impact: "Margin falling to 6.1%", cta: "See profit leaks", href: "/reports?tab=leaks" },
  { id: "a3", tone: "bad", kind: "Client Payment", project: "orion", title: "Orion Business Park", lines: ["RA Bill #08", "₹72.4L overdue", "18 days outstanding"], impact: "Send reminder to Orion Realty", cta: "Open RA Bill", href: "/billing?bill=RA-08" },
  { id: "a4", tone: "warn", kind: "Material Shortage", project: "skyline", title: "Skyline Residency", lines: ["TMT Steel 12mm", "Required 18 MT · Available 5.4 MT", "Production affected in 2 days"], impact: "Stock lasts only 1.1 days", cta: "Open material request", href: "/materials?mr=MR-2841" },
];

export const CASH_CHAIN = [
  { k: "Contract Value", v: 86.9, note: "Total awarded work", tone: "mute" },
  { k: "Work Completed", v: 47.8, note: "55% of contract executed on site", tone: "accent" },
  { k: "Billed", v: 39.4, note: "₹8.4 Cr of completed work is not yet billed", tone: "info" },
  { k: "Certified", v: 36.7, note: "₹2.7 Cr under client query / deduction", tone: "warn" },
  { k: "Collected", v: 31.8, note: "Cash actually received", tone: "good" },
  { k: "Outstanding", v: 4.9, note: "Certified but not yet paid by clients", tone: "bad" },
];

export const MILESTONES = [
  { name: "Excavation", state: "Completed", pctDone: 100, ps: "2026-01-15", pe: "2026-02-28", as: "2026-01-15", ae: "2026-03-01", var: 1, owner: "Rahul Sinha" },
  { name: "Foundation", state: "Completed", pctDone: 100, ps: "2026-03-01", pe: "2026-05-15", as: "2026-03-02", ae: "2026-05-19", var: 4, owner: "Shivam Civil" },
  { name: "Structure", state: "In Progress", pctDone: 78, ps: "2026-05-16", pe: "2026-11-30", as: "2026-05-20", ae: null, var: 3, owner: "Eastern Structural" },
  { name: "Masonry", state: "In Progress", pctDone: 52, ps: "2026-08-01", pe: "2026-12-31", as: "2026-08-04", ae: null, var: 2, owner: "Shivam Civil" },
  { name: "MEP", state: "Upcoming", pctDone: 22, ps: "2026-09-15", pe: "2027-01-20", as: "2026-09-22", ae: null, var: 4, owner: "Apex MEP Solutions" },
  { name: "Finishes", state: "Upcoming", pctDone: 6, ps: "2026-11-01", pe: "2027-02-10", as: null, ae: null, var: 0, owner: "Shree Interiors" },
  { name: "Handover", state: "Upcoming", pctDone: 0, ps: "2027-02-11", pe: "2027-02-28", as: null, ae: null, var: 0, owner: "Rahul Sinha" },
];

export const TOWERS = [
  { id: "A", name: "Tower A", floors: 14, overall: 71, stages: { Structure: 100, Brickwork: 86, Plaster: 72, MEP: 58, Flooring: 32, Painting: 14 }, note: "Slab 14 cast today. Finishing crews moved to floor 8." },
  { id: "B", name: "Tower B", floors: 11, overall: 54, stages: { Structure: 78, Brickwork: 61, Plaster: 44, MEP: 31, Flooring: 12, Painting: 0 }, note: "Block B slab reinforcement is the critical path item." },
  { id: "C", name: "Tower C", floors: 9, overall: 38, stages: { Structure: 62, Brickwork: 38, Plaster: 21, MEP: 10, Flooring: 0, Painting: 0 }, note: "On plan. Waiting on 12mm steel for floor 6 columns." },
  { id: "CH", name: "Club House", floors: 3, overall: 66, stages: { Structure: 100, Brickwork: 92, Plaster: 70, MEP: 52, Flooring: 24, Painting: 8 }, note: "Swimming pool waterproofing test scheduled." },
  { id: "EX", name: "External Development", floors: 1, overall: 47, stages: { Drainage: 68, Roads: 42, Landscape: 18, "Boundary Wall": 80, "Water Tanks": 55, "STP Plant": 30 }, note: "42 m of storm drain laid today." },
];

export const APPROVALS = [
  { id: "ap1", type: "Material Request", ref: "MR-2841", project: "skyline", title: "TMT Steel 12mm — 18 MT", by: "Site Engineer · Rahul Sinha", amount: 1.24e6, age: "2h", priority: "Critical", note: "Stock out in 1.1 days at 4.8 MT/day" },
  { id: "ap2", type: "Purchase Order", ref: "PO-1844", project: "skyline", title: "JSW Authorized Distributor — TMT 12mm", by: "Purchase Manager", amount: 1.22e6, age: "3h", priority: "Critical", note: "₹18,600 above lowest quote, 3 days faster" },
  { id: "ap3", type: "Contractor Bill", ref: "CB-0932", project: "orion", title: "Eastern Structural Works — RA 06", by: "QS · Manish Verma", amount: 1.84e6, age: "1d", priority: "High", note: "Quantity verified against MB-212" },
  { id: "ap4", type: "RA Bill", ref: "RA-09", project: "greenfield", title: "RA Bill #09 to Ranchi Industrial Corp.", by: "QS · Prakash Yadav", amount: 2.36e7, age: "1d", priority: "High", note: "Measurement certified by consultant" },
  { id: "ap5", type: "Change Order", ref: "CO-044", project: "metro", title: "Additional false ceiling — Level 2", by: "Priya Sharma", amount: 8.4e5, age: "2d", priority: "Medium", note: "+6 days timeline impact" },
  { id: "ap6", type: "Site Expense", ref: "EX-5521", project: "riverside", title: "Emergency crane hire (hydraulic failure)", by: "Amit Kumar", amount: 4.2e4, age: "5h", priority: "Medium", note: "Receipt attached" },
  { id: "ap7", type: "Material Transfer", ref: "MT-218", project: "royal", title: "Cement 120 bags — Royal Heights → Skyline", by: "Store Manager", amount: 4.5e4, age: "6h", priority: "Low", note: "Inter-site transfer" },
];

export const ACTIVITY = [
  { t: "09:14 AM", icon: "pkg", text: "Steel Material Request MR-2841 submitted.", who: "Rahul Sinha", project: "skyline" },
  { t: "09:38 AM", icon: "ok", text: "Purchase Manager approved MR-2841.", who: "Purchase Manager", project: "skyline" },
  { t: "10:04 AM", icon: "po", text: "PO-1844 sent to JSW Distributor.", who: "Purchase Manager", project: "skyline" },
  { t: "10:48 AM", icon: "bill", text: "₹18.4L contractor bill approved.", who: "Accounts Manager", project: "orion" },
  { t: "11:16 AM", icon: "qa", text: "Quality inspection QI-2482 passed.", who: "Quality Engineer", project: "skyline" },
  { t: "11:52 AM", icon: "warn", text: "Crane CR-01 breakdown reported at Riverside Villas.", who: "Amit Kumar", project: "riverside" },
  { t: "12:30 PM", icon: "bill", text: "RA Bill #08 reminder sent to Orion Realty.", who: "Accounts Manager", project: "orion" },
  { t: "01:05 PM", icon: "cash", text: "₹28L received from Ranchi Industrial Corporation.", who: "Accounts Manager", project: "greenfield" },
  { t: "02:10 PM", icon: "drw", text: "Drawing STR-104 revised to R4 — issued for construction.", who: "Planning Engineer", project: "skyline" },
  { t: "02:40 PM", icon: "warn", text: "Tower crane TC-02 stopped — hydraulic issue.", who: "Site Engineer", project: "skyline" },
];

export const NOTIFS = [
  { id: "n1", tone: "bad", kind: "Material low", text: "TMT Steel 12mm at Skyline — 1.1 days of stock left", t: "12m", href: "/materials" },
  { id: "n2", tone: "bad", kind: "Client payment overdue", text: "Orion RA Bill #08 — ₹72.4L, 18 days overdue", t: "1h", href: "/billing" },
  { id: "n3", tone: "warn", kind: "Milestone delayed", text: "Riverside — Structure Block B now 11 days late", t: "2h", href: "/projects/riverside" },
  { id: "n4", tone: "accent", kind: "Contractor bill approval", text: "CB-0932 Eastern Structural — ₹18.4L awaiting you", t: "3h", href: "/approvals" },
  { id: "n5", tone: "bad", kind: "Equipment breakdown", text: "Tower Crane TC-02 stopped at Skyline", t: "4h", href: "/equipment" },
  { id: "n6", tone: "warn", kind: "Budget threshold crossed", text: "Metro Mall Interiors passed 85% budget", t: "5h", href: "/projects/metro?tab=budget" },
  { id: "n7", tone: "warn", kind: "Quality failed", text: "QI-2479 Orion basement waterproofing failed", t: "6h", href: "/quality" },
  { id: "n8", tone: "info", kind: "Drawing revised", text: "STR-104 R4 issued — R2 is now outdated", t: "7h", href: "/documents" },
  { id: "n9", tone: "warn", kind: "PO delayed", text: "PO-1829 Kajaria tiles delayed by 4 days (Metro)", t: "1d", href: "/procurement" },
  { id: "n10", tone: "risk", kind: "Safety issue", text: "Open scaffolding gap at Orion Block A level 6", t: "1d", href: "/safety" },
];

// S-curve: cumulative % by month for Skyline
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
const planned = [1, 4, 9, 16, 25, 35, 45, 54, 61, 65, 70, 78, 91, 100];
const actual = [1, 3, 8, 14, 22, 31, 41, 51, 59, 62];
export const SCURVE = months.map((m, i) => {
  const fc = i >= 9 ? [62, 68, 75, 85, 95, 100][i - 9] : null;
  return { m: `${m}${i > 11 ? " '27" : ""}`, Planned: planned[i], Actual: actual[i] ?? null, Forecast: fc, Earned: actual[i] != null ? +(actual[i] * 0.158).toFixed(2) : null };
});
export const EVM = { PV: 10.27, EV: 9.8, AC: 10.17, CPI: 0.96, SPI: 0.95, BAC: 15.8, EAC: 16.4 };

export const AGEING = [
  { b: "0–30 days", v: 3.1 }, { b: "31–60 days", v: 2.4 }, { b: "61–90 days", v: 1.4 }, { b: "90+ days", v: 0.7 },
];
export const COMPANY_FLOW = [
  { m: "May", Inflow: 3.1, Outflow: 2.9 }, { m: "Jun", Inflow: 3.8, Outflow: 3.4 }, { m: "Jul", Inflow: 4.4, Outflow: 4.1 },
  { m: "Aug", Inflow: 5.2, Outflow: 4.6 }, { m: "Sep", Inflow: 4.1, Outflow: 4.9 }, { m: "Oct", Inflow: 4.6, Outflow: 4.4 },
  { m: "Nov", Inflow: 5.4, Outflow: 4.6, f: 1 }, { m: "Dec", Inflow: 6.1, Outflow: 5.0, f: 1 }, { m: "Jan", Inflow: 5.8, Outflow: 5.2, f: 1 },
];
