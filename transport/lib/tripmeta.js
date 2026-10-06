import { pathPoints, CITIES } from "@/data/geo";
import { fmtMin, NOW } from "@/data/fleet";

// cumulative km marks for each waypoint on a route
export function waypoints(trip) {
  const rt = trip.route;
  if (rt.id === "R01") return rt.via.map((n, i) => ({ name: n, km: [0, 38, 92, 150, 216, 292, 334][i] }));
  const pts = pathPoints(rt);
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const tot = seg.reduce((a, b) => a + b, 0);
  let acc = 0;
  return rt.via.map((n, i) => { if (i) acc += seg[i - 1]; return { name: n, km: Math.round((acc / tot) * rt.km) }; });
}

export function metrics(t) {
  const covered = Math.round(t.km * Math.min(1, t.progress));
  const remaining = t.km - covered;
  const hrs = Math.max(0.2, covered / 48);
  const mileage = t.id === "TRP-9824" ? 4.15 : +(t.vehicle.mileage - 0.1).toFixed(2);
  const fuelL = t.id === "TRP-9824" ? 52 : Math.round(covered / mileage);
  const sofar = t.id === "TRP-9824" ? 18420 : Math.round(t.profit * Math.min(1, t.progress) * 0.62);
  return { covered, remaining, avg: covered ? 48 : 0, fuelL, mileage, sofar, delay: t.delay || 0, hrs };
}

export function pnl(t) {
  const hero = { Fuel: 31420, Toll: 4860, "Driver allowance": 2400, Loading: 1200, Unloading: 900, Misc: 780, "Vehicle cost allocation": 13200 };
  const heroTotal = 54760;
  const cost = {};
  Object.entries(hero).forEach(([k, v]) => (cost[k] = t.id === "TRP-9824" ? v : Math.round(((v / heroTotal) * t.cost) / 10) * 10));
  return { freight: t.freight, other: t.other, revenue: t.freight + t.other, cost, totalCost: Object.values(cost).reduce((a, b) => a + b, 0) };
}

const STEPS = ["Booking created", "Vehicle assigned", "Driver assigned", "Vehicle reached loading point", "Loading started", "Loading completed", "Trip started", "Checkpoint 1", "Checkpoint 2", "Destination arrived", "Unloading", "POD uploaded", "Trip closed"];
export function timeline(t) {
  const wp = waypoints(t);
  const mid = wp.slice(1, -1);
  const cp1 = mid[Math.floor(mid.length * 0.34)] || wp[0], cp2 = mid[Math.floor(mid.length * 0.7)] || wp[0];
  const who = t.driver?.name || "Driver";
  const s = t.startMin;
  const day = t.startMin < 0 ? "" : "";
  const T = (m) => fmtMin(m);
  const ev = [
    [T(s - 1380), "Ranchi HQ", "Neha Verma (CRM)", `Booking ${t.id.replace("TRP", "BK")} from ${t.customer.short} · ₹${(t.freight / 1000).toFixed(0)}K freight`, "Booking confirmation"],
    [T(s - 1200), "Dispatch desk", "Rakesh Jha", `Vehicle ${t.vehicleId} matched · best margin option`, null],
    [T(s - 1190), "Dispatch desk", "Rakesh Jha", `${who} assigned · duty hours verified`, null],
    [T(s - 100), `${t.from} loading yard`, who, "Reached loading point · gate entry logged", "Gate pass"],
    [T(s - 85), `${t.from} loading yard`, "Hub supervisor", "Loading started", "Loading photo"],
    [T(s - 15), `${t.from} loading yard`, "Hub supervisor", `Loaded ${t.load} MT · weighbridge verified`, "Weighbridge slip · LR"],
    [T(s), t.from, who, "Trip started · GPS tracking active", null],
    [T(s + Math.round(((cp1.km || 40) / 48) * 60)), cp1.name, "System", `Checkpoint 1 crossed · speed 52 km/h`, null],
    [T(s + Math.round(((cp2.km || 120) / 48) * 60)), cp2.name, "System", t.id === "TRP-9824" ? "Checkpoint 2 · now holding at Gaya bypass, slow traffic" : "Checkpoint 2 crossed", null],
    [T(t.etaMin), t.to, "System", "Destination geofence entered", null],
    [T(t.etaMin + 25), `${t.to} consignee`, who, "Unloading started", "Unloading photo"],
    [T(t.etaMin + 120), t.to, who, "POD uploaded with signature & stamp", "POD scan"],
    [T(t.etaMin + 240), "Accounts", "Meena Shah", "Trip closed · invoice generated", "Invoice"],
  ];
  const doneN = { planned: 1, assigned: 3, loading: 5, dispatched: 7, transit: t.id === "TRP-9824" ? 9 : t.progress > 0.55 ? 9 : 8, delayed: 8, breakdown: 8, athub: 10, ofd: 9, delivered: 11, podpending: 11, completed: 13, cancelled: 2 }[t.status] ?? 9;
  return ev.map((e, i) => ({ time: e[0], loc: e[1], who: e[2], note: e[3], doc: e[4], state: i < doneN - 1 ? "done" : i === doneN - 1 ? (doneN === 13 ? "done" : "now") : "todo", label: STEPS[i] }));
}

export function riskFor(t) {
  const m = metrics(t);
  const reasons = [];
  if (t.delay > 20) reasons.push(`Traffic delay +${t.delay} min near ${t.id === "TRP-9824" ? "Bihar Sharif" : t.route.via[Math.max(1, Math.floor(t.route.via.length / 2))]}`);
  if (m.hrs > 4) reasons.push(`Driver continuous driving ${Math.floor(m.hrs)}h ${Math.round((m.hrs % 1) * 60)}m — rest break due`);
  reasons.push(`Customer unloading window closes ${t.id === "TRP-9824" ? "9 PM" : "8 PM"}`);
  if (t.status === "breakdown") reasons.unshift("Vehicle breakdown — recovery in progress");
  return { level: t.risk || "Low", reasons, buffer: t.id === "TRP-9824" ? "42 min" : t.risk === "High" ? "—" : "1h 40m" };
}
