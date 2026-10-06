// Core connected data model: customers, drivers, vehicles, trips (deterministic seed).
import { ROUTES, routeBy, pointAt, nearestCity, HUBS } from "./geo";

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(20261006);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (a, b) => a + rand() * (b - a);
const int = (a, b) => Math.round(between(a, b));

export const NOW = { label: "Tue, 06 Oct 2026", time: "03:12 PM", min: 15 * 60 + 12 };
export const fmtMin = (m) => {
  m = ((Math.round(m) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60), mm = m % 60;
  return `${String(h % 12 || 12).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

/* ---------------- customers ---------------- */
const CUST_HAND = [
  ["C001", "Sharma Distribution Pvt. Ltd.", "FMCG", 38.4, 8.2, 28, "Annual", "Neha Verma"],
  ["C002", "Eastern Steel Traders", "Steel", 31.2, 6.4, 34, "Annual", "Rohit Jha"],
  ["C003", "Bihar FMCG Distribution", "FMCG", 26.8, 5.1, 31, "Annual", "Neha Verma"],
  ["C004", "JSW Authorized Distributor", "Steel", 24.5, 3.9, 22, "Annual", "Amit Dutta"],
  ["C005", "Ranchi Buildmart", "Building Material", 18.9, 4.7, 41, "Spot + Rate Card", "Rohit Jha"],
  ["C006", "Patna Hardware Agency", "Building Material", 15.2, 2.2, 26, "Annual", "Pooja Singh"],
  ["C007", "Maa Durga Enterprises", "General Cargo", 12.4, 1.6, 19, "Spot", "Pooja Singh"],
  ["C008", "Eastern Retail Network", "Retail", 21.7, 7.8, 46, "Annual", "Amit Dutta"],
];
const CPRE = ["Ranchi", "Patna", "Dhanbad", "Bokaro", "Kolkata", "Bihar", "Jharkhand", "Shree", "Jamshedpur", "Gaya", "Hazaribagh", "Durgapur"];
const CSUF = [["Cement Depot", "Building Material"], ["Pharma Distributors", "Pharma"], ["Agro Foods", "Agri / FMCG"], ["Electricals", "Electricals"], ["Steel Agency", "Steel"], ["Paints & Hardware", "Building Material"], ["Beverages", "FMCG"], ["Auto Components", "Auto"], ["Packaging Co.", "Industrial"], ["Coal Logistics", "Industrial"]];
const MGR = ["Neha Verma", "Rohit Jha", "Amit Dutta", "Pooja Singh"];
export const CUSTOMERS = [
  ...CUST_HAND.map(([id, name, industry, freight, out, pay, contract, mgr]) => ({
    id, name, short: name.replace(/ (Pvt\. Ltd\.)$/, ""), industry, monthly: freight * 1e5, outstanding: out * 1e5, payDays: pay, contract, manager: mgr,
    onTimePay: Math.max(38, Math.round(100 - pay * 1.4)), trips: Math.round(freight * 1.2), active: Math.max(1, Math.round(freight / 5.4)),
    margin: id === "C001" ? 24 : int(15, 29), terms: pay > 30 ? "45 days" : "30 days", routes: ["R01", "R03", "R06", "R07"].slice(0, 2 + (freight > 20 ? 2 : 0)),
  })),
  ...Array.from({ length: 56 }, (_, i) => {
    const [s, ind] = pick(CSUF); const nm = `${pick(CPRE)} ${s}`;
    const freight = +between(1.2, 14).toFixed(1); const pay = int(14, 52);
    return { id: `C${String(i + 9).padStart(3, "0")}`, name: nm + (i % 3 ? "" : " Pvt. Ltd."), short: nm, industry: ind, monthly: freight * 1e5, outstanding: Math.round(freight * between(0.05, 0.4)) * 1e5, payDays: pay, contract: pick(["Annual", "Spot", "Spot + Rate Card", "Quarterly"]), manager: pick(MGR), onTimePay: Math.max(30, Math.round(100 - pay * 1.3)), trips: Math.round(freight * 1.3), active: int(0, 4), margin: int(14, 30), terms: pick(["15 days", "30 days", "45 days"]), routes: [pick(ROUTES).id] };
  }),
];
export const customerById = (id) => CUSTOMERS.find((c) => c.id === id);

/* ---------------- drivers ---------------- */
const DHAND = ["Sunil Yadav", "Ravi Kumar", "Manoj Singh", "Ajay Mahto", "Vijay Sharma", "Rakesh Kumar", "Pankaj Yadav", "Suresh Singh"];
const DF = ["Deepak", "Imran", "Santosh", "Dinesh", "Amit", "Rajesh", "Mukesh", "Kamal", "Naresh", "Bablu", "Gopal", "Sanjeev", "Anil", "Prakash", "Sudhir", "Raju", "Mahesh", "Birendra", "Lalan", "Tarkeshwar"];
const DL = ["Oraon", "Ansari", "Pandey", "Prasad", "Tiwari", "Munda", "Gupta", "Hussain", "Soren", "Rajak", "Verma", "Mahto", "Pathak", "Khan", "Mishra", "Kumar", "Singh", "Yadav", "Das", "Sahu"];
const seen = new Set(DHAND);
export const DRIVERS = Array.from({ length: 128 }, (_, i) => {
  let name = DHAND[i];
  while (!name || (i >= 8 && seen.has(name))) name = `${pick(DF)} ${pick(DL)}`;
  seen.add(name);
  const hero = i === 0;
  const score = hero ? 91 : int(62, 96);
  const exp = hero ? 9 : int(2, 22);
  return {
    id: `D${String(i + 1).padStart(3, "0")}`, name, phone: `+91 9${int(100, 999)}${int(10, 99)} ${int(10000, 99999)}`,
    exp, trips: hero ? 326 : exp * int(18, 34), month: hero ? 18 : int(6, 24),
    ontime: hero ? 94 : int(78, 99), mileage: hero ? 4.4 : +between(3.2, 4.8).toFixed(2), incidents: hero ? 1 : int(0, 4),
    rating: hero ? 4.7 : +between(3.6, 4.9).toFixed(1), score,
    licenseExpiry: i === 3 ? "18 Oct 2026" : i === 9 ? "30 Oct 2026" : `${String(int(1, 28)).padStart(2, "0")} ${pick(["Mar", "May", "Aug", "Nov", "Jan", "Feb"])} ${pick([2027, 2028, 2029, 2030])}`,
    licenseDays: i === 3 ? 12 : i === 9 ? 24 : int(90, 1400),
    attendance: hero ? 96 : int(82, 100), vehicleId: null, tripId: null,
    parts: hero ? { ontime: 94, fuel: 88, safety: 96, docs: 100, feedback: 87 } : { ontime: int(70, 99), fuel: int(60, 96), safety: int(65, 99), docs: int(75, 100), feedback: int(65, 98) },
  };
});
export const driverById = (id) => DRIVERS.find((d) => d.id === id);
export const driverByName = (n) => DRIVERS.find((d) => d.name === n);

/* ---------------- vehicles ---------------- */
const MODELS = [["Tata Signa 4018", "32 FT Multi Axle"], ["Ashok Leyland 3520", "32 FT Multi Axle"], ["BharatBenz 3528", "32 FT Single Axle"], ["Eicher Pro 6048", "32 FT Single Axle"], ["Tata Ultra", "20 FT"], ["BharatBenz 4228", "Container"], ["Ashok Leyland 4825", "Trailer"], ["Tata Signa 3530 Tipper", "Tipper"], ["Eicher Pro 2049", "LCV"], ["Tata Intra V30", "Pickup"]];
const HERO_V = [
  { id: "JH01DK4821", mi: 0, own: "Owned", status: "running", sub: "risk", d: 0, hub: "Ranchi", rev: 14.8e5, cost: 10.6e5, util: 86, mileage: 4.32, empty: 19.3, odo: 218440, year: 2024 },
  { id: "JH05BX1188", mi: 0, own: "Owned", status: "idle", d: 1, hub: "Jamshedpur", rev: 15.9e5, cost: 11.1e5, util: 91, mileage: 4.51, empty: 11.2, odo: 187210, year: 2023 },
  { id: "JH01CZ6212", mi: 1, own: "Owned", status: "idle", d: 2, hub: "Jamshedpur", rev: 11.2e5, cost: 8.4e5, util: 79, mileage: 4.18, empty: 15.4, odo: 154080, year: 2023 },
  { id: "JH05CZ1182", mi: 2, own: "Owned", status: "running", sub: "ontime", d: 3, hub: "Dhanbad", rev: 8.9e5, cost: 7.6e5, util: 74, mileage: 3.1, empty: 22.5, odo: 261300, year: 2021 },
  { id: "JH01AB2245", mi: 1, own: "Owned", status: "idle", d: 4, hub: "Ranchi", rev: 7.8e5, cost: 6.7e5, util: 61, mileage: 3.9, empty: 17.1, odo: 302620, year: 2020 },
  { id: "JH01AS4182", mi: 3, own: "Owned", status: "breakdown", d: 5, hub: "Ranchi", rev: 6.2e5, cost: 6.1e5, util: 55, mileage: 3.8, empty: 20.2, odo: 241900, year: 2022 },
  { id: "JH01AB2214", mi: 2, own: "Owned", status: "running", sub: "ontime", d: 6, hub: "Ranchi", rev: 5.8e5, cost: 6.4e5, util: 49, mileage: 3.5, empty: 28, odo: 276800, year: 2020 },
  { id: "JH05CZ1284", mi: 0, own: "Owned", status: "running", sub: "ontime", d: 7, hub: "Bokaro", rev: 14.1e5, cost: 10.2e5, util: 84, mileage: 4.4, empty: 12.8, odo: 169900, year: 2024 },
];
const PLATE = ["JH01", "JH05", "JH10", "JH09", "BR01", "BR06", "WB24", "WB74", "JH02"];
const A = "ABCDEFGHJKLMNPRSTUVXZ";
const usedPlates = new Set(HERO_V.map((h) => h.id));
const mkPlate = () => { let p; do { p = `${pick(PLATE)}${pick([...A])}${pick([...A])}${int(1000, 9999)}`; } while (usedPlates.has(p)); usedPlates.add(p); return p; };
const HOME = ["Ranchi", "Ranchi", "Jamshedpur", "Dhanbad", "Patna", "Kolkata", "Bokaro"];

// 128 vehicles: 72 running (57 on-time, 5 risk, 7 delayed, 3 breakdown), 8 loading, 6 unloading, 31 idle, 11 maintenance
const statusPlan = [];
const plan = (s, sub, n) => { for (let i = 0; i < n; i++) statusPlan.push({ status: s, sub }); };
plan("running", "ontime", 57); plan("running", "risk", 5); plan("running", "delayed", 7); plan("breakdown", null, 3);
plan("loading", null, 8); plan("unloading", null, 6); plan("idle", null, 31); plan("maintenance", null, 11);
// hero vehicles consume: DK4821 risk, BX1188 idle, CZ6212 idle, CZ1182 ontime, AB2245 idle, AS4182 breakdown, AB2214 ontime, CZ1284 ontime
const remaining = [...statusPlan];
const take = (st, sub) => { const i = remaining.findIndex((x) => x.status === st && x.sub === sub); if (i >= 0) remaining.splice(i, 1); };
HERO_V.forEach((h) => take(h.status, h.sub ?? null));
// shuffle remaining deterministically
for (let i = remaining.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [remaining[i], remaining[j]] = [remaining[j], remaining[i]]; }

const VENDORS = ["Shree Roadways", "National Freight Carrier", "Bharat Transport Co.", "Eastern Trucking Services", "Highway Logistics"];
export const VENDOR_LIST = VENDORS;
const mi = (i) => MODELS[i % MODELS.length];

export const VEHICLES = Array.from({ length: 128 }, (_, i) => {
  const h = HERO_V[i];
  const st = h ? { status: h.status, sub: h.sub ?? null } : remaining[i - HERO_V.length];
  const m = h ? MODELS[h.mi] : mi(Math.floor(rand() * 8));
  const own = h ? h.own : i < 80 ? "Owned" : i < 86 ? "Leased" : "Attached";
  const rev = h ? h.rev : own === "Attached" ? between(2.5e5, 6e5) : between(4.2e5, 11.5e5);
  let cost = h ? h.cost : rev * between(0.64, 0.9);
  if (!h && own !== "Attached" && i % 23 === 0) cost = rev * between(1.04, 1.12);
  const nextKm = h ? ({ "JH01AB2245": -620, "JH05BX1188": 1420, "JH01DK4821": 2860 }[h.id] ?? int(300, 6500)) : int(-200, 7200);
  return {
    id: h ? h.id : mkPlate(), model: m[0], type: m[1], year: h ? h.year : int(2018, 2025), ownership: own,
    status: st.status, sub: st.sub, hub: h ? h.hub : pick(HOME), driverId: null, tripId: null, vendor: own === "Attached" ? VENDORS[i % 5] : null,
    odo: h ? h.odo : int(90000, 410000), mileage: h ? h.mileage : +between(3.2, 4.7).toFixed(2),
    revenue: Math.round(rev), cost: Math.round(cost), util: h ? h.util : int(44, 94), empty: h ? h.empty : +between(8, 30).toFixed(1),
    nextKm, lastService: `${String(int(1, 28)).padStart(2, "0")} ${pick(["Jun", "Jul", "Aug", "Sep"])} 2026`,
    fuelPct: h?.id === "JH05BX1188" ? 68 : int(15, 95), pos: [0, 0], speed: 0, loc: "", route: null, progress: 0,
    trips30: h ? ({ "JH01DK4821": 18 }[h.id] ?? int(10, 20)) : int(5, 20), mileageDelta: h?.id === "JH05CZ1182" ? -29 : int(-12, 8),
  };
});
export const vehicleById = (id) => VEHICLES.find((v) => v.id === id);
// named demo vehicles referenced across fuel / breakdown stories
["JH10KR3381", "BR06MN7412"].forEach((id, k) => { const v = VEHICLES.find((x, i) => i > 20 && x.status === "running" && x.sub === "ontime" && !usedPlates.has("x" + x.id) && i > 20 + k * 3); v.id = id; usedPlates.add("x" + id); });
VEHICLES.filter((v) => v.status === "breakdown" && v.id !== "JH01AS4182").forEach((v, k) => { v.id = ["WB24LM5512", "BR01TR2290"][k]; });
VEHICLES.forEach((v) => { v.profit = v.revenue - v.cost; });

/* ---------------- trips ---------------- */
export const TRIP_STATUS = {
  planned: ["Planned", "n"], assigned: ["Vehicle Assigned", "b"], loading: ["Loading", "b"], dispatched: ["Dispatched", "b"],
  transit: ["In Transit", "g"], athub: ["At Hub", "n"], ofd: ["Out For Delivery", "g"], delivered: ["Delivered", "g"],
  podpending: ["POD Pending", "a"], completed: ["Completed", "n"], delayed: ["Delayed", "r"], breakdown: ["Breakdown", "r"], cancelled: ["Cancelled", "n"],
};
export const ACTIVE = ["dispatched", "transit", "ofd", "delayed", "breakdown"];
const MATERIAL = ["FMCG cartons", "Steel coils", "TMT bars", "Cement bags", "Paints & hardware", "Packaged foods", "Electrical goods", "Tiles", "Industrial parts", "Beverages"];
const LOCS = ["Ramgarh bypass", "Hazaribagh ring road", "Barhi toll plaza", "Gaya bypass", "Bihar Sharif", "Chas", "Nimiaghat", "Aurangabad crossing", "Dobhi", "Sherghati", "Tundi", "Baharagora"];

function mkTrip(n, v, driver, kind) {
  const cust = pick(CUSTOMERS.slice(0, 20));
  const rt = pick(ROUTES);
  const freight = Math.round((rt.rev * between(0.88, 1.14)) / 100) * 100;
  const load = +between(12, 24).toFixed(1);
  const costAll = Math.round(rt.cost * between(0.9, 1.1));
  return { id: `TRP-${n}`, vehicleId: v?.id ?? null, driverId: driver?.id ?? null, customerId: cust.id, routeId: rt.id, from: rt.from, to: rt.to, km: rt.km, load, material: pick(MATERIAL), freight, other: pick([0, 0, 1500, 2000, 3500]), cost: costAll, kind };
}

export const TRIPS = [];
const assignDriver = (v, i) => { const d = DRIVERS[i]; v.driverId = d.id; d.vehicleId = v.id; return d; };
VEHICLES.forEach((v, i) => { if (i < 128) assignDriver(v, i); });

// ---- hero trips ----
const hero = (o) => { const t = { other: 3500, load: 18.4, km: 334, ...o }; TRIPS.push(t); return t; };
const DK = vehicleById("JH01DK4821");
const t9824 = hero({ id: "TRP-9824", vehicleId: "JH01DK4821", driverId: "D001", customerId: "C001", routeId: "R01", from: "Ranchi", to: "Patna", freight: 82000, cost: 54760, status: "transit", progress: 216 / 334, startMin: 10 * 60 + 42, etaMin: 19 * 60 + 20, delay: 34, material: "FMCG cartons", risk: "Medium", pod: "—" });
DK.tripId = "TRP-9824"; DK.route = "R01"; DK.progress = 216 / 334; DK.speed = 48;
const t9796 = hero({ id: "TRP-9796", vehicleId: "JH05CZ1284", driverId: "D001", driverOverride: "Sunil Yadav", customerId: "C002", routeId: "R03", from: "Jamshedpur", to: "Kolkata", km: 276, load: 21, freight: 118000, other: 6000, cost: 78000, status: "podpending", progress: 1, startMin: -2 * 1440 + 480, etaMin: -2 * 1440 + 840, delay: 0, material: "Steel coils", pod: "Pending", deliveredAgo: 2 });
const t9812 = hero({ id: "TRP-9812", vehicleId: "JH01AS4182", driverId: "D006", customerId: "C003", routeId: "R05", from: "Jamshedpur", to: "Patna", km: 495, load: 20, freight: 96000, cost: 68000, status: "breakdown", progress: 0.56, startMin: 8 * 60 + 5, etaMin: 21 * 60 + 40, delay: 192, material: "Packaged foods", pod: "—", risk: "High" });
vehicleById("JH01AS4182").tripId = "TRP-9812"; vehicleById("JH01AS4182").route = "R05"; vehicleById("JH01AS4182").progress = 0.56;
const t9810 = hero({ id: "TRP-9810", vehicleId: "JH05CZ1284", driverId: "D008", customerId: "C004", routeId: "R07", from: "Bokaro", to: "Patna", km: 372, load: 22, freight: 74000, cost: 52500, status: "transit", progress: 0.38, startMin: 11 * 60 + 20, etaMin: 20 * 60 + 5, delay: 0, material: "TMT bars", pod: "—", risk: "Low" });
vehicleById("JH05CZ1284").tripId = "TRP-9810"; vehicleById("JH05CZ1284").route = "R07"; vehicleById("JH05CZ1284").progress = 0.38;
// dispatcher's anomaly vehicle
const t9818 = hero({ id: "TRP-9818", vehicleId: "JH05CZ1182", driverId: "D004", customerId: "C005", routeId: "R11", from: "Ranchi", to: "Dhanbad", km: 168, load: 17, freight: 33000, cost: 26800, status: "transit", progress: 0.7, startMin: 12 * 60 + 40, etaMin: 17 * 60 + 5, delay: 0, material: "Cement bags", pod: "—", risk: "Low" });
vehicleById("JH05CZ1182").tripId = "TRP-9818"; vehicleById("JH05CZ1182").route = "R11"; vehicleById("JH05CZ1182").progress = 0.7;
const t9820 = hero({ id: "TRP-9820", vehicleId: "JH01AB2214", driverId: "D007", customerId: "C007", routeId: "R13", from: "Patna", to: "Muzaffarpur", km: 74, load: 9, freight: 18500, cost: 13700, status: "transit", progress: 0.5, startMin: 14 * 60 + 20, etaMin: 16 * 60 + 40, delay: 0, material: "General cargo", pod: "—", risk: "Low" });
vehicleById("JH01AB2214").tripId = "TRP-9820"; vehicleById("JH01AB2214").route = "R13"; vehicleById("JH01AB2214").progress = 0.5;

// ---- generated trips for remaining vehicles in motion ----
let tn = 9825;
const usedHeroV = new Set(TRIPS.map((t) => t.vehicleId));
const SUBSTAT = { ontime: "transit", risk: "transit", delayed: "delayed" };
let emptyRuns = 0;
VEHICLES.forEach((v, i) => {
  if (usedHeroV.has(v.id)) return;
  if (!["running", "loading", "unloading", "breakdown"].includes(v.status)) return;
  // 8 running vehicles are repositioning empty (no load) — keeps active trips at 64 of 72 running vehicles
  if (v.status === "running" && v.sub === "ontime" && emptyRuns < 8 && i % 5 === 0) {
    emptyRuns++; const rt = pick(ROUTES); v.emptyRun = true; v.route = rt.id; v.progress = +between(0.2, 0.85).toFixed(2); v.speed = int(44, 60); return;
  }
  const d = driverById(v.driverId);
  const t = mkTrip(tn++, v, d, "live");
  const rt = routeBy(t.from, t.to);
  t.routeId = rt.id;
  if (v.status === "running") {
    t.status = SUBSTAT[v.sub] || "transit"; t.progress = +between(0.12, 0.92).toFixed(2);
    t.delay = v.sub === "delayed" ? int(55, 210) : v.sub === "risk" ? int(15, 45) : 0;
    t.risk = v.sub === "delayed" ? "High" : v.sub === "risk" ? "Medium" : "Low";
    if (i % 9 === 0 && v.sub === "ontime") t.status = "ofd";
  } else if (v.status === "loading") { t.status = "loading"; t.progress = 0; t.delay = 0; t.risk = "Low"; }
  else if (v.status === "unloading") { t.status = "athub"; t.progress = 1; t.delay = 0; t.risk = "Low"; }
  else { t.status = "breakdown"; t.progress = +between(0.2, 0.7).toFixed(2); t.delay = int(120, 240); t.risk = "High"; }
  t.startMin = NOW.min - Math.round(t.progress * t.km / 48 * 60);
  t.etaMin = NOW.min + Math.round((1 - t.progress) * t.km / 45 * 60) + t.delay;
  t.pod = "—";
  TRIPS.push(t);
  v.tripId = t.id; v.route = t.routeId; v.progress = t.progress;
  v.speed = v.status === "running" ? int(38, 62) : 0;
});
// 8 trips without a load: empty repositioning → no trip ids (keeps "active trips" realistic)

// ---- historical trips ----
for (let k = 0; k < 150; k++) {
  const v = pick(VEHICLES);
  const d = driverById(v.driverId);
  const t = mkTrip(9795 - k - (k > 0 ? 0 : 1), v, d, "past");
  if (TRIPS.some((x) => x.id === t.id)) continue;
  const r = rand();
  t.status = r < 0.22 ? "podpending" : r < 0.97 ? "completed" : "cancelled";
  t.pod = t.status === "podpending" ? pick(["Pending", "Pending", "Under Verification", "Original Required"]) : t.status === "cancelled" ? "—" : "Approved";
  t.progress = 1; t.delay = rand() < 0.1 ? int(20, 140) : 0; t.deliveredAgo = t.status === "podpending" ? int(1, 6) : int(2, 28);
  t.startMin = -t.deliveredAgo * 1440 + 420; t.etaMin = t.startMin + Math.round(t.km / 45 * 60);
  TRIPS.push(t);
}
TRIPS.forEach((t) => {
  const revenue = t.freight + t.other;
  t.revenue = revenue;
  t.profit = t.id === "TRP-9824" ? 30740 : revenue - t.cost;
  t.margin = (t.profit / revenue) * 100;
  const rt = routeBy(t.from, t.to);
  t.route = rt;
  t.customer = customerById(t.customerId);
  const d = driverById(t.driverId); t.driver = t.driverOverride ? { ...d, name: t.driverOverride } : d;
  t.vehicle = vehicleById(t.vehicleId);
});
export const tripById = (id) => TRIPS.find((t) => t.id === id);
export const activeTrips = () => TRIPS.filter((t) => ACTIVE.includes(t.status));

// ---- live positions (map) ----
const idleHub = { Ranchi: [85.33, 23.34], Jamshedpur: [86.2, 22.8], Dhanbad: [86.43, 23.8], Patna: [85.14, 25.59], Kolkata: [88.36, 22.57], Bokaro: [86.15, 23.67] };
VEHICLES.forEach((v, i) => {
  if (v.tripId) {
    const t = tripById(v.tripId);
    const [x, y, seg] = pointAt(t.route, t.progress);
    const jx = ((i * 37) % 9 - 4) * 0.8, jy = ((i * 53) % 9 - 4) * 0.8;
    v.pos = [x + (v.status === "running" ? jx : 0), y + (v.status === "running" ? jy : 0)];
    v.loc = nearestCity(...v.pos).name;
    if (t.progress >= 1) v.loc = `${t.to} hub`;
    v.last = v.status === "running" ? `${int(0, 3)} min ago` : "2 min ago";
    if (i === 0) { v.loc = "Gaya bypass"; v.pos = pointAt(t.route, 0.648).slice(0, 2); }
  } else if (v.emptyRun) {
    const rt = ROUTES.find((r) => r.id === v.route);
    v.pos = pointAt(rt, v.progress).slice(0, 2);
    v.loc = `${nearestCity(...v.pos).name} · empty, returning to ${v.hub}`; v.last = `${int(0, 3)} min ago`;
  } else {
    const [lon, lat] = idleHub[v.hub];
    v.pos = [(lon - 80) * 100 + ((i * 29) % 13 - 6) * 1.6, (27 - lat) * 100 + ((i * 41) % 13 - 6) * 1.6];
    v.loc = `${v.hub} hub`; v.last = `${int(1, 14)} min ago`;
    if (v.status === "maintenance") v.loc = `${v.hub} workshop`;
  }
});
// drivers who haven't updated
export const SILENT_DRIVERS = ["D014", "D027", "D033", "D058"];
