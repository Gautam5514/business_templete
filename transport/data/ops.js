// Operations + finance data connected to fleet.js
import { VEHICLES, TRIPS, CUSTOMERS, DRIVERS, VENDOR_LIST, tripById, vehicleById, driverById, customerById, fmtMin } from "./fleet";
import { ROUTES } from "./geo";

function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const r = rng(77);
const pick = (a) => a[Math.floor(r() * a.length)];
const between = (a, b) => a + r() * (b - a);
const int = (a, b) => Math.round(between(a, b));
const date = (daysAgo) => { const d = new Date(2026, 9, 6 - daysAgo); return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }); };

/* ---- company headline numbers (spec) ---- */
export const COMPANY = {
  name: "Eastern Freight & Logistics Pvt. Ltd.", turnover: "₹34.8 Crore", vehicles: 128, owned: 86, attached: 42, drivers: 128, customers: 64, hubs: 14,
  kpi: { activeTrips: 64, running: 72, idle: 31, maint: 11, transit: 1.84e7, revenue: 2.92e7, collections: 2.34e7, outstanding: 8.64e6, fuel: 5.47e6, util: 78 },
  health: { score: 84, parts: [["Utilization", 88], ["Delivery Performance", 82], ["Fuel Efficiency", 79], ["Maintenance", 87], ["Collections", 76], ["Driver Compliance", 92]] },
};
export const FLEET_STRIP = [
  { k: "running", label: "Running", v: 72, tone: "g" }, { k: "loading", label: "Loading", v: 8, tone: "b" }, { k: "unloading", label: "Unloading", v: 6, tone: "b" },
  { k: "idle", label: "Idle", v: 31, tone: "n" }, { k: "maintenance", label: "Maintenance", v: 11, tone: "a" }, { k: "breakdown", label: "Breakdown", v: 3, tone: "r" },
  { k: "delayed", label: "Delayed", v: 7, tone: "r" }, { k: "ontime", label: "On-Time", v: 57, tone: "g" },
];
export function matchFleet(v, k) {
  if (k === "running") return v.status === "running" || v.status === "breakdown";
  if (k === "delayed") return v.sub === "delayed";
  if (k === "ontime") return v.sub === "ontime";
  if (k === "risk") return v.sub === "risk";
  return v.status === k;
}
export const VSTATUS = {
  running: ["Running", "g"], loading: ["Loading", "b"], unloading: ["Unloading", "b"], idle: ["Idle", "n"], maintenance: ["Maintenance", "a"], breakdown: ["Breakdown", "r"],
};
export const markerTone = (v) => (v.status === "breakdown" || v.sub === "delayed" ? "r" : v.sub === "risk" ? "a" : v.status === "loading" || v.status === "unloading" ? "b" : v.status === "idle" || v.status === "maintenance" ? "n" : "g");

/* ---- alerts ---- */
export const ALERTS = [
  { id: "A1", tone: "r", kind: "Delivery Delayed", title: "TRP-9824 · Ranchi → Patna", href: "/trips/TRP-9824", rows: [["Vehicle", "JH01DK4821"], ["Delay", "3h 18m"], ["Reason", "Traffic near Bihar Sharif"], ["Customer", "Sharma Distribution"], ["Freight", "₹82,000"]], impact: "₹82,000 freight at risk of detention penalty.", time: "4 min ago" },
  { id: "A2", tone: "a", kind: "POD Pending", title: "TRP-9796 · delivered 2 days ago", href: "/pod", rows: [["POD", "Not uploaded"], ["Invoice blocked", "₹1.24L"], ["Driver", "Sunil Yadav"]], impact: "Invoice cannot be raised until the POD arrives.", time: "2d" },
  { id: "A3", tone: "r", kind: "Fuel Anomaly", title: "JH05CZ1182 · mileage 29% low", href: "/fuel", rows: [["Expected", "4.4 km/L"], ["Actual", "3.1 km/L"], ["Excess fuel cost", "₹8,420"]], impact: "Possible leakage or injector fault — inspect before next trip.", time: "1h" },
  { id: "A4", tone: "a", kind: "Maintenance Due", title: "JH01AB2245 · service overdue 620 km", href: "/maintenance", rows: [["Current trip", "None"], ["Recommendation", "Schedule today"]], impact: "Idle now — cheapest window to service.", time: "3h" },
  { id: "A5", tone: "r", kind: "Breakdown", title: "BD-1184 · JH01AS4182 at Barhi", href: "/breakdowns", rows: [["Issue", "Clutch failure"], ["Trip", "TRP-9812"], ["Customer impact", "Potential delay 3.2 h"]], impact: "Replacement vehicle JH01CZ6212 is 24 km away.", time: "52 min ago" },
  { id: "A6", tone: "a", kind: "Driver silent", title: "4 drivers have not updated status", href: "/drivers", rows: [["Longest silence", "2h 40m"], ["Trips", "4 active"]], impact: "Call or ping before ETA slips.", time: "now" },
];

/* ---- money ---- */
export const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
export const SERIES = {
  revenue: [2.31, 2.48, 2.52, 2.4, 2.66, 2.71, 2.78, 2.69, 2.84, 2.9, 2.95, 2.92],
  cost: [1.78, 1.9, 1.93, 1.85, 2.01, 2.08, 2.1, 2.05, 2.15, 2.18, 2.21, 2.16],
  util: [72, 73, 74, 71, 75, 76, 77, 75, 78, 79, 78, 78],
  fuelCost: [44, 47, 48, 46, 50, 52, 53, 51, 53.5, 55, 54, 54.7],
  mileage: [4.12, 4.1, 4.09, 4.14, 4.11, 4.08, 4.06, 4.05, 4.02, 4.0, 3.96, 3.94],
  ontime: [88, 89, 88, 90, 91, 90, 91, 92, 91, 91, 90, 91],
  empty: [21.4, 21.0, 20.8, 20.1, 19.8, 19.9, 19.2, 18.9, 18.6, 18.8, 18.4, 18.1],
  maint: [4.1, 3.6, 5.2, 4.4, 4.9, 5.8, 4.7, 5.1, 6.2, 5.4, 6.1, 5.7],
};
export const AGING = [
  { k: "Not due", v: 53.6e5 }, { k: "0–15", v: 11.2e5 }, { k: "16–30", v: 9.6e5 }, { k: "31–60", v: 7.4e5 }, { k: "61–90", v: 3.2e5 }, { k: "90+", v: 1.4e5 },
];
export const RECEIVABLE = { total: 86.4e5, overdue: 32.8e5 };

export const INVOICES = [];
const invTrips = TRIPS.filter((t) => ["completed", "podpending"].includes(t.status) || t.id === "TRP-9796").slice(0, 70);
invTrips.forEach((t, i) => {
  const blocked = t.status === "podpending";
  const freight = t.freight, det = pick([0, 0, 0, 1800, 3600]), load = pick([0, 0, 1200]), unl = pick([0, 0, 900]), other = t.other || 0;
  const sub = freight + det + load + unl + other, tax = Math.round(sub * 0.05), total = sub + tax;
  const age = (t.deliveredAgo ?? 5) + int(1, 6);
  const terms = t.customer.terms === "45 days" ? 45 : t.customer.terms === "15 days" ? 15 : 30;
  const dueIn = terms - age;
  const paidFrac = blocked ? 0 : dueIn < -30 ? pick([0, 0, 0.4]) : dueIn < 0 ? pick([0, 0.5, 1]) : pick([0, 0, 1, 1]);
  const paid = Math.round(total * paidFrac);
  INVOICES.push({
    id: blocked ? `DRAFT-${t.id.slice(4)}` : `EFL/25-26/${String(4180 + i).padStart(5, "0")}`, customerId: t.customerId, tripId: t.id, route: `${t.from} → ${t.to}`,
    freight, detention: det, loading: load, unloading: unl, other, tax, total, due: date(-dueIn), dueIn, paid, balance: total - paid,
    status: blocked ? "Blocked · POD" : paid >= total ? "Paid" : dueIn < 0 ? "Overdue" : paid > 0 ? "Part Paid" : "Sent",
  });
});
export const PAYMENTS = Array.from({ length: 34 }, (_, i) => {
  const inv = INVOICES.filter((x) => x.paid > 0)[i % 20];
  const amt = inv ? inv.paid : 50000;
  return { id: `PAY-${5120 + i}`, customerId: inv?.customerId ?? "C001", invoice: inv?.id ?? "—", amount: amt, mode: pick(["NEFT", "RTGS", "UPI", "Cheque", "NEFT"]), date: date(int(0, 25)), ref: `UTR${int(100000, 999999)}${int(1000, 9999)}`, status: pick(["Reconciled", "Reconciled", "Reconciled", "Unmatched"]) };
});

export const FOLLOWUPS = [
  { customer: "Eastern Retail Network", amount: 7.8e5, overdue: 38, kind: "Promise to Pay", note: "Promised ₹4.0L by 09 Oct", owner: "Amit Dutta", tone: "a" },
  { customer: "Ranchi Buildmart", amount: 4.7e5, overdue: 41, kind: "Dispute", note: "Detention charge disputed — ₹1,800 × 3 days", owner: "Rohit Jha", tone: "r" },
  { customer: "Sharma Distribution Pvt. Ltd.", amount: 8.2e5, overdue: 12, kind: "WhatsApp", note: "Statement sent · awaiting reply", owner: "Neha Verma", tone: "b" },
  { customer: "Eastern Steel Traders", amount: 6.4e5, overdue: 19, kind: "Call", note: "Called accounts — payment run on Friday", owner: "Rohit Jha", tone: "b" },
  { customer: "Bihar FMCG Distribution", amount: 5.1e5, overdue: 24, kind: "Email", note: "Reminder #2 sent", owner: "Neha Verma", tone: "n" },
  { customer: "Patna Hardware Agency", amount: 2.2e5, overdue: 63, kind: "Escalation", note: "Escalated to MD — credit hold recommended", owner: "Pooja Singh", tone: "r" },
];

/* ---- expenses ---- */
export const EXPENSE_CATS = ["Fuel", "Toll", "Driver Advance", "Driver Allowance", "Loading", "Unloading", "Repair", "Parking", "Brokerage", "Permit", "Penalty", "Tyres", "Maintenance", "Insurance", "Miscellaneous"];
export const EXPENSE_MIX = [["Fuel", 54.7], ["Vendor freight", 38.2], ["Driver cost", 21.4], ["Toll", 14.8], ["Maintenance", 11.2], ["Tyres", 6.1], ["Insurance & EMI", 18.6], ["Other", 9.3]];
export const EXPENSES = Array.from({ length: 60 }, (_, i) => {
  const cat = pick(EXPENSE_CATS), t = pick(TRIPS.slice(0, 60));
  const amt = { Fuel: int(8, 36) * 1000, Toll: int(6, 48) * 100, "Driver Advance": int(5, 20) * 1000, "Driver Allowance": int(12, 30) * 100, Loading: int(8, 14) * 100, Unloading: int(6, 10) * 100, Repair: int(8, 60) * 100, Parking: int(1, 4) * 100, Brokerage: int(10, 40) * 100, Permit: int(6, 20) * 100, Penalty: int(5, 25) * 100, Tyres: int(18, 90) * 100, Maintenance: int(20, 140) * 100, Insurance: int(20, 90) * 100, Miscellaneous: int(1, 8) * 100 }[cat];
  const by = pick(["Driver app", "Driver app", "Hub manager", "Accounts"]);
  return { id: `EXP-${7400 + i}`, date: date(int(0, 12)), cat, amount: amt, tripId: t.id, vehicleId: t.vehicleId, driverId: t.driverId, by, receipt: r() > 0.12, status: r() > 0.2 ? "Approved" : "Pending" };
});

/* ---- fuel ---- */
const STATIONS = ["HP Ramgarh", "IOCL Hazaribagh NH-20", "BPCL Barhi", "Reliance Gaya", "IOCL Bihar Sharif", "Nayara Dhanbad", "HP Jamshedpur", "IOCL Kolkata Dankuni"];
export const FUEL = Array.from({ length: 44 }, (_, i) => {
  const v = VEHICLES[i % 60]; const l = int(60, 220), rate = +between(90, 96).toFixed(2);
  return { id: `F-${3320 + i}`, date: date(int(0, 9)), vehicleId: v.id, driverId: v.driverId, tripId: v.tripId || "—", station: pick(STATIONS), litres: l, rate, total: Math.round(l * rate), odo: v.odo - int(0, 900), payment: pick(["Fuel card", "Fuel card", "Cash", "Credit"]), receipt: r() > 0.1 };
});
export const FUEL_ANOMALIES = [
  { vehicleId: "JH05CZ1182", expected: 78, actual: 102, note: "Mileage 3.1 vs 4.4 km/L baseline", flag: "Review", rate: 105 },
  { vehicleId: "JH01DK4821", expected: 74, actual: 88, note: "Last 3 fills avg 3.54 km/L · −18% vs 90-day baseline", flag: "Investigate", rate: 105 },
  { vehicleId: "JH01AB2214", expected: 64, actual: 79, note: "28% empty kms inflating consumption", flag: "Review", rate: 105 },
  { vehicleId: "JH10KR3381", expected: 91, actual: 104, note: "Two fills <4h apart at different pumps", flag: "Possible theft", rate: 105 },
  { vehicleId: "BR06MN7412", expected: 58, actual: 66, note: "Idling 3.2h at Gaya plaza", flag: "Watch", rate: 105 },
].map((a) => ({ ...a, variance: a.actual - a.expected, loss: (a.actual - a.expected) * a.rate }));

/* ---- toll ---- */
const PLAZAS = ["Ramgarh Toll Plaza", "Hazaribagh Toll Plaza", "Barhi Toll Plaza", "Dobhi Toll Plaza", "Gaya Toll Plaza", "Bihar Sharif Toll", "Dankuni Toll", "Durgapur Expressway"];
export const TOLL = Array.from({ length: 36 }, (_, i) => {
  const v = VEHICLES[(i * 3) % 80];
  const flag = i === 4 ? "Duplicate charge" : i === 9 ? "Amount mismatch" : i === 17 ? "Unusual route" : null;
  return { id: `TL-${8800 + i}`, date: date(int(0, 6)), time: fmtMin(int(240, 1380)), vehicleId: v.id, tripId: v.tripId || "—", plaza: pick(PLAZAS), amount: flag === "Duplicate charge" ? 780 : pick([420, 560, 780, 960, 1240]), balance: int(300, 9800), flag };
});

/* ---- maintenance ---- */
export const MAINT_TYPES = ["Preventive", "Scheduled Service", "Tyre", "Engine", "Brake", "Electrical", "Body", "Emergency Repair"];
const SHOPS = ["Ranchi Auto Care", "Tata Authorised — Namkum", "Jamshedpur Heavy Motors", "Bokaro Truck Works", "Patna Fleet Garage"];
export const MAINTENANCE = [
  { id: "M-2201", vehicleId: "JH01AB2245", type: "Scheduled Service", date: "Today", odo: 302620, priority: "Critical", shop: "Ranchi Auto Care", note: "Overdue by 620 km", est: 18500 },
  { id: "M-2202", vehicleId: "JH05CZ1182", type: "Engine", date: "Today", odo: 261300, priority: "High", shop: "Tata Authorised — Namkum", note: "Injector check — fuel anomaly", est: 24000 },
  { id: "M-2203", vehicleId: "JH01AB2214", type: "Engine", date: "Wed 07 Oct", odo: 276800, priority: "High", shop: "Ranchi Auto Care", note: "2 breakdowns in 30 days", est: 32000 },
  ...Array.from({ length: 22 }, (_, i) => { const v = VEHICLES[10 + i * 3]; return { id: `M-${2204 + i}`, vehicleId: v.id, type: pick(MAINT_TYPES), date: ["Thu 08 Oct", "Fri 09 Oct", "Sat 10 Oct", "Mon 12 Oct", "Tue 13 Oct"][i % 5], odo: v.odo, priority: pick(["Low", "Medium", "Medium", "High"]), shop: pick(SHOPS), note: "Preventive schedule", est: int(4, 40) * 1000 }; }),
];
export const BREAKDOWNS = [
  { id: "BD-1184", vehicleId: "JH01AS4182", loc: "Barhi", issue: "Clutch failure", severity: "Critical", tripId: "TRP-9812", downtime: "4 hours", impact: "Potential delay 3.2 hours", stage: 3, mech: "Mechanic Ravi (Barhi Highway Garage)", reported: "02:20 PM" },
  { id: "BD-1183", vehicleId: "BR01TR2290", loc: "Aurangabad", issue: "Tyre burst", severity: "Medium", tripId: "TRP-9806", downtime: "1.5 hours", impact: "Potential delay 1.2 hours", stage: 5, mech: "Local tyre shop", reported: "12:05 PM" },
  { id: "BD-1182", vehicleId: "WB24LM5512", loc: "Durgapur", issue: "Alternator fault", severity: "High", tripId: "TRP-9801", downtime: "3 hours", impact: "Replacement vehicle dispatched", stage: 4, mech: "Durgapur Auto Electric", reported: "10:40 AM" },
  { id: "BD-1176", vehicleId: "JH05CZ1182", loc: "Ramgarh", issue: "Brake pad wear", severity: "Low", tripId: "—", downtime: "2 hours", impact: "None", stage: 8, mech: "Ranchi Auto Care", reported: "28 Sep" },
  { id: "BD-1171", vehicleId: "JH01AB2214", loc: "Hazaribagh", issue: "Radiator leak", severity: "High", tripId: "—", downtime: "6 hours", impact: "Customer notified", stage: 8, mech: "Hazaribagh Fleet Care", reported: "24 Sep" },
];
BREAKDOWNS.forEach((b) => { const v = vehicleById(b.vehicleId); if (v?.tripId && b.stage < 8) b.tripId = v.tripId; });
export const BD_FLOW =["Reported", "Location Confirmed", "Diagnosed", "Mechanic Assigned", "Repair", "Vehicle Restarted", "Cost Recorded", "Trip Resumed / Replacement"];

/* ---- vehicle documents ---- */
export const DOC_TYPES = ["RC", "Insurance", "Fitness", "Permit", "Pollution", "National Permit", "State Permit", "Tax", "FASTag", "GPS device"];
export const docsFor = (v) => {
  const seed = [...v.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return DOC_TYPES.map((t, i) => {
    let days = 40 + ((seed * (i + 3) * 17) % 520);
    if (v.id === "JH01DK4821") days = { Insurance: 12, Fitness: 28, Permit: 42 }[t] ?? days;
    const tone = days < 15 ? "r" : days < 45 ? "a" : "g";
    return { type: t, no: `${t.slice(0, 3).toUpperCase()}-${(seed * (i + 7)) % 99999}`, days, tone };
  });
};

/* ---- POD ---- */
export const POD_STATUS = ["Pending", "Uploaded", "Under Verification", "Approved", "Rejected", "Original Required"];
const podTrips = TRIPS.filter((t) => t.status === "podpending");
const podAppr = TRIPS.filter((t) => t.status === "completed").slice(0, 28);
const mkPod = (t, status, i) => {
  const age = t.deliveredAgo ?? int(2, 20);
  return { tripId: t.id, customerId: t.customerId, delivered: date(age), status, uploaded: status !== "Pending", original: status === "Approved" && i % 3 !== 0, invoice: status === "Approved" ? "Invoiced" : status === "Pending" ? "Blocked" : "In review", value: t.freight + t.other, driverId: t.driverId, age };
};
const OTHER = ["Uploaded", "Under Verification", "Under Verification", "Original Required"];
const pend = podTrips.slice(0, 17).map((t, i) => mkPod(t, "Pending", i));
// blocked value is exactly ₹18.4L, with TRP-9796 at ₹1.24L
const rest = 18.4e5 - 1.24e5;
pend.forEach((p, i) => { p.value = i === 0 ? 124000 : i === 16 ? rest - 15 * Math.round(rest / 16 / 100) * 100 : Math.round(rest / 16 / 100) * 100 + ((i % 3) - 1) * 4000; });
const sum = pend.reduce((a, p) => a + p.value, 0); pend[16].value += 18.4e5 - sum;
pend.forEach((p, i) => { p.age = i === 0 ? 2 : (i * 5) % 6 + 1; p.delivered = date(p.age); });
pend[3].age = 6; pend[3].delivered = date(6);
export const PODS = [
  ...pend,
  ...podTrips.slice(17, 29).map((t, i) => mkPod(t, OTHER[i % OTHER.length], i)),
  ...podAppr.map((t, i) => mkPod(t, "Approved", i)),
];
export const POD_BLOCKED = { count: 17, value: 18.4e5, oldest: 6 };

/* ---- vendors ---- */
export const VENDORS = VENDOR_LIST.map((n, i) => {
  const trips = int(14, 46), payable = int(2, 9) * 1e5 + int(0, 9) * 1e4;
  return { id: `V${i + 1}`, name: n, owner: ["Rajendra Prasad", "Mohd. Arif", "Harish Bansal", "Sandeep Ojha", "Kailash Rai"][i], vehicles: VEHICLES.filter((v) => v.vendor === n).length, trips, payable, rate: ["₹52/km", "₹49/km", "₹51/km", "₹50/km", "₹53/km"][i], perf: int(78, 96), docs: pick(["Valid", "Valid", "1 expiring"]), margin: int(18, 30) };
});

/* ---- bookings ---- */
export const PIPE = ["New Booking", "Rate Approval", "Vehicle Planning", "Vehicle Assigned", "Dispatched", "Delivered", "POD", "Invoice"];
export const BOOKINGS = Array.from({ length: 36 }, (_, i) => {
  const c = CUSTOMERS[i % 14], rt = pick(ROUTES);
  const stage = i < 3 ? 0 : i < 6 ? 1 : i < 12 ? 2 : i < 18 ? 3 : i < 24 ? 4 : i < 28 ? 5 : i < 32 ? 6 : 7;
  return { id: `BK-${6120 + (36 - i)}`, customerId: c.id, from: rt.from, to: rt.to, vehicleType: pick(["32 FT Multi Axle", "32 FT Single Axle", "20 FT", "Container"]), material: pick(["FMCG cartons", "Steel coils", "TMT bars", "Cement bags"]), weight: int(12, 24), pickup: date(int(-2, 2)), rateType: pick(["Per Trip", "Per KM", "Per Ton", "Contract Rate"]), freight: Math.round((rt.rev * between(0.9, 1.1)) / 100) * 100, stage };
});

/* ---- dispatch ---- */
export const PENDING_LOADS = [
  { id: "L-4411", customer: "JSW Authorized Distributor", from: "Jamshedpur", to: "Patna", mt: 21, vtype: "32 FT Multi Axle", pickup: "Today 5:00 PM", freight: 68000, urgent: true },
  { id: "L-4412", customer: "Sharma Distribution Pvt. Ltd.", from: "Ranchi", to: "Dhanbad", mt: 17, vtype: "32 FT Single Axle", pickup: "Today 6:30 PM", freight: 33000 },
  { id: "L-4413", customer: "Eastern Steel Traders", from: "Dhanbad", to: "Kolkata", mt: 22, vtype: "32 FT Multi Axle", pickup: "Tomorrow 7:00 AM", freight: 52000 },
  { id: "L-4414", customer: "Ranchi Buildmart", from: "Ranchi", to: "Rourkela", mt: 14, vtype: "20 FT", pickup: "Tomorrow 9:00 AM", freight: 36000 },
  { id: "L-4415", customer: "Bihar FMCG Distribution", from: "Patna", to: "Varanasi", mt: 18, vtype: "32 FT Single Axle", pickup: "Today 8:00 PM", freight: 47000 },
];
export const DISPATCH_VEHICLES = [
  { id: "JH05BX1188", loc: "Jamshedpur", driver: "Ravi Kumar", avail: "4:30 PM", fuel: 68, nextMaint: 1420, type: "32 FT Multi Axle", dist: 6.2, fit: "Excellent", risk: "Low", margin: 28 },
  { id: "JH01CZ6212", loc: "Jamshedpur", driver: "Manoj Singh", avail: "5:10 PM", fuel: 54, nextMaint: 3180, type: "32 FT Multi Axle", dist: 24, fit: "Good", risk: "Low", margin: 24 },
  { id: "JH01AB2245", loc: "Ranchi", driver: "Ajay Mahto", avail: "Needs service", fuel: 41, nextMaint: -620, type: "32 FT Single Axle", dist: 118, fit: "Poor", risk: "High", margin: 11 },
  { id: "JH10KR3381", loc: "Dhanbad", driver: "Vijay Sharma", avail: "4:00 PM", fuel: 77, nextMaint: 2260, type: "32 FT Multi Axle", dist: 148, fit: "Fair", risk: "Medium", margin: 17 },
  { id: "BR06MN7412", loc: "Patna", driver: "Rakesh Kumar", avail: "6:00 PM", fuel: 62, nextMaint: 4100, type: "32 FT Single Axle", dist: 331, fit: "Fair", risk: "Low", margin: 19 },
];
export const BACKHAUL = { vehicleId: "JH05BX1188", unloadAt: "Patna at 5:30 PM", customer: "Maa Durga Trading", from: "Patna", to: "Ranchi", mt: 16, freight: 46000, extra: 18600 };

/* ---- activity ---- */
const ACT = [
  ["Sunil Yadav", "uploaded fuel receipt", "JH01DK4821 · 52 L · ₹5,460", "fuel"],
  ["Dispatch · Rakesh Jha", "assigned vehicle JH05BX1188", "to booking BK-6155", "dispatch"],
  ["Accounts · Meena Shah", "recorded payment ₹2.8L", "Bihar FMCG Distribution", "money"],
  ["System", "flagged fuel anomaly", "JH05CZ1182 · +24 L", "alert"],
  ["Hub · Ranchi", "gate entry", "JH01CZ6212 arrived", "hub"],
  ["Driver · Pankaj Yadav", "uploaded POD", "TRP-9791 · Patna Hardware Agency", "pod"],
  ["Maintenance · Imran Ansari", "closed job card", "JH01AB2214 radiator", "maint"],
  ["System", "raised delay alert", "TRP-9824 +34 min", "alert"],
  ["CRM · Neha Verma", "approved rate", "BK-6158 · ₹48/km", "rate"],
  ["Dispatch · Rakesh Jha", "created trip", "TRP-9833 Dhanbad → Kolkata", "dispatch"],
  ["Accounts · Meena Shah", "created invoice", "EFL/25-26/04201 · ₹1.18L", "money"],
  ["Driver · Ravi Kumar", "reached loading point", "Jamshedpur hub", "hub"],
  ["Fleet · Anil Dubey", "reported breakdown", "BD-1184 · Barhi · Clutch", "alert"],
  ["System", "toll duplicate detected", "WB24LM5512 · Dankuni · ₹780", "alert"],
];
export const ACTIVITY = Array.from({ length: 42 }, (_, i) => { const a = ACT[i % ACT.length]; return { who: a[0], what: a[1], detail: a[2], kind: a[3], when: `${Math.floor(i * 6.5)} min ago` }; });

export const NOTIFS = [
  { kind: "Trip delayed", tone: "r", text: "TRP-9824 is running 34 min late near Gaya", time: "4 min" },
  { kind: "Vehicle breakdown", tone: "r", text: "JH01AS4182 — clutch failure at Barhi (BD-1184)", time: "52 min" },
  { kind: "Fuel anomaly", tone: "r", text: "JH05CZ1182 consumed 24 L over expected", time: "1h" },
  { kind: "POD pending", tone: "a", text: "17 PODs pending · ₹18.4L invoicing blocked", time: "2h" },
  { kind: "Backhaul available", tone: "g", text: "Patna → Ranchi 16 MT for JH05BX1188 · +₹18,600", time: "2h" },
  { kind: "Vehicle document expiry", tone: "a", text: "JH01DK4821 insurance expires in 12 days", time: "5h" },
  { kind: "Driver document expiry", tone: "a", text: "Ajay Mahto — licence expires in 12 days", time: "5h" },
  { kind: "Payment overdue", tone: "r", text: "Patna Hardware Agency — ₹2.2L, 63 days overdue", time: "1d" },
  { kind: "Maintenance due", tone: "a", text: "JH01AB2245 overdue by 620 km", time: "1d" },
  { kind: "Idle vehicle", tone: "n", text: "31 vehicles idle · ≈ ₹6.2L/day unused capacity", time: "1d" },
  { kind: "Route risk", tone: "a", text: "Bihar Sharif congestion adds +35 min on Ranchi → Patna", time: "1d" },
];

export const VEHICLE_MONTHLY = (v) => {
  const rev = v.revenue, fuel = Math.round(rev * 0.35), toll = Math.round(rev * 0.07), sal = 36000, allow = Math.round(rev * 0.04);
  const maint = v.id === "JH01DK4821" ? 84000 : Math.round(rev * 0.06), ins = 14500, emi = v.ownership === "Owned" ? 62000 : 0, tyres = Math.round(rev * 0.03);
  const known = fuel + toll + sal + allow + maint + ins + emi + tyres;
  const other = Math.max(0, v.cost - known);
  return { rev, items: [["Fuel", v.id === "JH01DK4821" ? 520000 : fuel], ["Toll", toll], ["Driver salary", sal], ["Allowance", allow], ["Maintenance", maint], ["Insurance allocation", ins], ["EMI", emi], ["Tyres", tyres], ["Other cost", other]] };
};
export { tripById, vehicleById, driverById, customerById, DRIVERS, VEHICLES, TRIPS, CUSTOMERS };
