import { VEHICLES, DRIVERS, TRIPS, driverById } from "@/data/fleet";
import { ROUTES } from "@/data/geo";
import { MAINTENANCE, POD_BLOCKED, BACKHAUL, FOLLOWUPS } from "@/data/ops";
import { inr } from "./format";

export const PROMPTS = [
  "Which deliveries are delayed?", "Where is JH01DK4821?", "Which vehicle is making the most profit?", "Which routes have the lowest margin?",
  "Which drivers have poor fuel efficiency?", "How much payment is overdue?", "Which PODs are blocking invoices?", "Which vehicles need maintenance this week?",
  "How much did we spend on fuel this month?", "Which vehicles are sitting idle?", "Where can we find return-load opportunities?", "Which vehicles are losing money this month?",
];

const own = VEHICLES.filter((v) => v.ownership !== "Attached");
const reasonsFor = (v) => [`${Math.round(v.empty)}% empty kilometres`, v.id === "JH01AB2214" ? "2 breakdowns" : `${v.id.slice(-2).charCodeAt(0) % 3} breakdown(s) in 60 days`, `fuel efficiency ${Math.max(6, Math.round(((4.1 - v.mileage) / 4.1) * 100))}% below fleet average`];

export function answer(q) {
  const s = q.toLowerCase();
  if (/losing|loss|negative/.test(s)) {
    const l = [{ id: "JH01AB2214", revenue: 5.8e5, cost: 6.4e5, ...own.find((v) => v.id === "JH01AB2214") }, ...own.filter((v) => v.profit < 0 && v.id !== "JH01AB2214").slice(0, 3)];
    return { head: `${Math.max(4, l.length)} vehicles are currently operating at negative margin.`, items: l.map((v, i) => ({ title: `${i + 1}. ${v.id}`, link: `/vehicles/${v.id}`, rows: [["Revenue", inr(v.revenue)], ["Cost", inr(v.cost)], ["Loss", inr(v.cost - v.revenue)]], bullets: reasonsFor(v), action: i === 0 ? "Assign shorter regional routes and schedule engine inspection." : "Move to regional routes with guaranteed return loads; review driver fuel behaviour." })), foot: `Combined loss: ${inr(l.reduce((a, v) => a + (v.cost - v.revenue), 0))} this month.` };
  }
  if (/delay/.test(s)) {
    const d = TRIPS.filter((t) => t.status === "delayed" || t.status === "breakdown").slice(0, 6);
    return { head: `${d.length + 1} deliveries are delayed or at risk right now.`, items: [TRIPS[0], ...d].map((t) => ({ title: t.id, link: `/trips/${t.id}`, rows: [["Route", `${t.from} → ${t.to}`], ["Vehicle", t.vehicleId], ["Delay", `+${t.delay} min`], ["Freight", inr(t.freight)]], bullets: [t.id === "TRP-9824" ? "Traffic near Bihar Sharif" : t.status === "breakdown" ? "Vehicle breakdown" : "Slow-moving traffic / halt time"] })), foot: "Tip: open a trip to message the customer with a revised ETA." };
  }
  if (/where is|jh\d\d/.test(s)) {
    return { head: "JH01DK4821 is at Gaya bypass, running 34 minutes late.", items: [{ title: "JH01DK4821 · Tata Signa 4018", link: "/trips/TRP-9824", rows: [["Trip", "TRP-9824 · Ranchi → Patna"], ["Driver", "Sunil Yadav"], ["Speed", "48 km/h · updated 2 min ago"], ["Remaining", "118 km"], ["ETA", "07:20 PM"], ["Customer", "Sharma Distribution"]], bullets: ["Traffic near Bihar Sharif expected to add 20 more minutes", "Driver has been on the road 4h 30m — rest stop suggested at Bihar Sharif"], action: "Notify Sharma Distribution of the 07:20 PM ETA." }] };
  }
  if (/profit|most|earn/.test(s) && !/route|driver/.test(s)) {
    const top = [...own].sort((a, b) => b.profit - a.profit).slice(0, 3);
    return { head: `${top[0].id} is your most profitable vehicle at ${inr(top[0].profit)} this month.`, items: top.map((v, i) => ({ title: `${i + 1}. ${v.id}`, link: `/vehicles/${v.id}`, rows: [["Profit", inr(v.profit)], ["Revenue", inr(v.revenue)], ["Utilization", v.util + "%"], ["Empty km", v.empty + "%"]] })), foot: "Top performers share high utilization (>84%) and under 13% empty kilometres." };
  }
  if (/route|margin/.test(s)) {
    const r = [...ROUTES].sort((a, b) => a.margin - b.margin).slice(0, 4);
    return { head: "Patna → Ranchi has the lowest margin at 14.0%.", items: r.map((x, i) => ({ title: `${i + 1}. ${x.from} → ${x.to}`, rows: [["Margin", x.margin.toFixed(1) + "%"], ["Avg revenue", inr(x.rev)], ["Avg cost", inr(x.cost)], ["Delay rate", x.delay + "%"]], bullets: x.why ? x.why.split(" · ") : ["Return load below fleet average"] })), foot: "Backhaul matching on these routes could add ≈ ₹9K margin per trip." };
  }
  if (/fuel efficiency|mileage|poor/.test(s) && /driver/.test(s)) {
    const d = [...DRIVERS].sort((a, b) => a.mileage - b.mileage).slice(0, 5);
    return { head: "5 drivers are well below the fleet average of 4.0 km/L.", items: d.map((x, i) => ({ title: `${i + 1}. ${x.name}`, link: `/drivers/${x.id}`, rows: [["Mileage", x.mileage + " km/L"], ["Vehicle", x.vehicleId], ["Excess fuel / month", inr(Math.round((4.0 - x.mileage) * 6200))]], bullets: ["Possible over-speeding / idling pattern"] })) };
  }
  if (/overdue|payment|owe/.test(s)) {
    return { head: "₹32.8L is overdue out of ₹86.4L receivable.", items: FOLLOWUPS.slice(0, 4).map((f) => ({ title: f.customer, rows: [["Amount", inr(f.amount)], ["Overdue", f.overdue + " days"], ["Last action", f.kind]], bullets: [f.note] })), foot: "Eastern Retail Network and Ranchi Buildmart account for 38% of the overdue balance." };
  }
  if (/pod/.test(s)) {
    return { head: `${POD_BLOCKED.count} PODs are blocking ${inr(POD_BLOCKED.value)} of invoicing.`, items: TRIPS.filter((t) => t.status === "podpending").slice(0, 5).map((t) => ({ title: t.id, link: "/pod", rows: [["Customer", t.customer.short], ["Value", inr(t.freight + t.other)], ["Driver", t.driver.name], ["Delivered", `${t.deliveredAgo}d ago`]] })), foot: "Oldest pending POD is 6 days old." };
  }
  if (/maintenance|service/.test(s)) {
    return { head: "6 vehicles need maintenance this week.", items: MAINTENANCE.slice(0, 6).map((m) => ({ title: m.vehicleId, link: "/maintenance", rows: [["Job", m.type], ["When", m.date], ["Workshop", m.shop]], bullets: [m.note] })), action: "Schedule JH01AB2245 today — it is idle and 620 km overdue." };
  }
  if (/fuel/.test(s)) {
    return { head: "You spent ₹54.7L on fuel this month — 18.7% of revenue.", items: [{ title: "Fuel summary", link: "/fuel", rows: [["Litres consumed", "58,420 L"], ["Average mileage", "3.94 km/L"], ["Cost per km", "₹23.9"], ["Variance vs expected", "+4.6%"]], bullets: ["Mileage has slid from 4.12 to 3.94 km/L over 12 months", "5 vehicles flagged with anomalies ≈ ₹1.9L excess"] }] };
  }
  if (/idle|sitting/.test(s)) {
    const i = VEHICLES.filter((v) => v.status === "idle");
    return { head: "31 vehicles are idle — approximately ₹6.2L/day in unused earning capacity.", items: ["Ranchi", "Jamshedpur", "Dhanbad", "Patna", "Kolkata"].map((h) => ({ title: `${h} hub`, rows: [["Idle vehicles", i.filter((v) => v.hub === h).length || 3]], bullets: i.filter((v) => v.hub === h).slice(0, 3).map((v) => v.id) })), action: "Match idle vehicles against 5 pending loads on the Dispatch board." };
  }
  if (/return|backhaul/.test(s)) {
    return { head: "3 return-load opportunities could add ≈ ₹41,000 profit today.", items: [{ title: `${BACKHAUL.vehicleId} · Patna → Ranchi`, link: "/dispatch", rows: [["Customer", BACKHAUL.customer], ["Load", BACKHAUL.mt + " MT"], ["Freight", inr(BACKHAUL.freight)], ["Additional profit", inr(BACKHAUL.extra)]], action: "Assign backhaul from the Dispatch board." }] };
  }
  return { head: "Here’s what I can see right now.", items: [{ title: "Fleet snapshot", rows: [["Active trips", "64"], ["Delayed", "7"], ["Idle vehicles", "31"], ["Overdue receivables", "₹32.8L"]], bullets: ["Try one of the suggested questions for a detailed answer."] }] };
}
