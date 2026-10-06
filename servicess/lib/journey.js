import { NOW, hhmm } from "@/data/core";

export const STEPS = ["Request Created", "Scheduled", "Technician Assigned", "Started Travel", "Arrived", "Diagnosis", "Estimate Created", "Customer Approved", "Service Started", "Parts Used", "Completed", "Customer Sign-Off", "Invoice", "Payment"];
const OFF = [0, 3, 14, 20, 38, 45, 58, 64, 70, 75, 95, 112, 118, 123];
const DETAIL = [
  (j) => `Logged via ${j.source}. Classified as ${j.service}, priority ${j.prio}.`,
  (j) => `Slot reserved in ${j.loc} zone. SLA clock started (${j.sla >= 1440 ? "24h" : j.sla / 60 + "h"}).`,
  (j, t) => t ? `${t.name} assigned — skill match, ${t.rating}★ rating.` : "Dispatcher assigns best-fit technician.",
  (j, t) => `${t?.name ?? "Technician"} left for ${j.loc}. Customer notified on WhatsApp.`,
  () => "Geo-fence check-in at site. Customer contact met on arrival.",
  (j) => `Diagnosis recorded: ${j.cat === "AC" ? "compressor not starting; capacitor and windings tested" : "fault isolated and photographed"}.`,
  (j) => `Estimate created — ₹${j.value.toLocaleString("en-IN")} incl. GST. Sent on WhatsApp.`,
  () => "Customer approved digitally. Signature, device and time stored.",
  () => "Repair started with approved scope.",
  (j) => j.cat === "AC" ? "Compressor ×1, capacitor ×1, 2.4 kg R410A used. Van stock auto-reduced." : "Consumables used from van stock. Inventory auto-adjusted.",
  () => "Work completed, test run passed. After photos uploaded.",
  () => "Customer signed off on the service report.",
  () => "Invoice generated and sent to the customer.",
  (j) => `Payment received (${j.pay === "AMC Included" ? "covered under AMC" : j.pay}). Digital receipt shared.`,
];
export const STAGE_OF = { New: 1, "Awaiting Assignment": 2, Scheduled: 2, "Technician Assigned": 3, "Technician En Route": 4, Arrived: 5, Diagnosis: 6, "Estimate Pending": 7, "Approval Pending": 7, "In Progress": 9, "Parts Pending": 9, Completed: 14, Escalated: 6 };

// Event time (minutes since midnight) for step i. Jobs awaiting assignment count forward from now.
export function stepTimes(j, assignedNow) {
  const later = j.status === "Awaiting Assignment" || j.status === "New" || assignedNow;
  return STEPS.map((_, i) => (later && i >= 2 ? NOW + OFF[i] - OFF[2] : j.req + OFF[i]));
}
export const stepDetail = (i, j, t) => DETAIL[i](j, t);
export const stepClock = (m) => hhmm(m);

// Costing model for a job
export function costing(j) {
  const total = j.value, tax = Math.round(total - total / 1.18), rev = total - tax;
  const visit = 800, labour = Math.round(rev * 0.14), parts = Math.round(rev * 0.62), other = rev - visit - labour - parts;
  const techCost = Math.round(rev * 0.045 + 400), partsCost = Math.round(parts * 0.77), travel = 260, discount = j.prio === "AMC" ? 0 : Math.round(rev * 0.02);
  const cost = techCost + partsCost + travel;
  const profit = rev - discount - cost;
  return { total, tax, rev, visit, labour, parts, other, techCost, partsCost, travel, discount, cost, profit, margin: (profit / rev) * 100 };
}
