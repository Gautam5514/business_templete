import { PRODUCTS, BOM, bomCost, mat } from "./masters";
import { COSTS } from "./finance";
import { ISSUES } from "./orders";
import { fdt } from "../lib/format";

const P = (id) => PRODUCTS.find((p) => p.id === id);

export function woDetail(w) {
  const p = P(w.pid);
  const b = BOM[w.pid];
  const c = bomCost(w.pid);
  const started = w.produced > 0 || ["Running", "Paused", "QC Pending", "Completed"].includes(w.status);
  const is41 = w.id === "WO-2841";

  // material consumption
  const material = b.items.map(([name, perUnit, unit]) => {
    const std = +(perUnit * Math.max(w.produced, 0)).toFixed(1);
    const factor = name.startsWith("SS") || name.startsWith("Brass") ? 1.034 : name.includes("Adhesive") ? 1.05 : 1.0;
    const actual = +(std * factor).toFixed(1);
    const planned = +(perUnit * w.planned).toFixed(1);
    const issued = started ? +Math.min(planned, Math.max(actual * 1.12, planned * 0.35)).toFixed(1) : 0;
    return { name, unit, perUnit, planned, std, actual, issued, variance: +(actual - std).toFixed(1), vpct: std ? ((actual - std) / std) * 100 : 0, onFloor: +(issued - actual).toFixed(1) };
  });
  if (is41) { const m = material[0]; m.std = 4712; m.actual = 4872; m.issued = 5760; m.variance = 160; m.vpct = (160 / 4712) * 100; m.onFloor = 888; }

  // journey
  const f = w.produced;
  const rej = w.rejected;
  const split = [Math.round(rej * 0.43), Math.round(rej * 0.2), Math.round(rej * 0.15), Math.round(rej * 0.08)];
  split.push(rej - split.reduce((a, b2) => a + b2, 0));
  const stage = (label, startAt, endAt, dur, output, rejected, who, state) => ({ label, start: startAt, end: endAt, dur, output, rejected, who, state });
  const T0 = w.start;
  const journey = started ? [
    stage("Work Order Created", "05 Oct 05:15 PM", "05 Oct 05:15 PM", "—", w.planned, 0, "Rohit Sharma", "done"),
    stage("Material Reserved", "05 Oct 05:30 PM", "05 Oct 05:31 PM", "1 min", w.planned, 0, "System (MRP)", "done"),
    stage("Material Issued", "06 Oct 07:42 AM", "06 Oct 08:05 AM", "23 min", is41 ? "5,760 kg" : "—", 0, "Sunil Yadav → Vijay Kumar", "done"),
    stage("Production Started", fdt(T0), fdt(T0), "—", "—", 0, w.supervisor, "done"),
    stage("Forming", "08:00 AM", "ongoing", "3 h 20 m", Math.round(f * 1.22), split[0], is41 ? "HP-03 · P-04 — Kailash Mahto, Ramesh Oraon" : "Press line", "current"),
    stage("Welding", "08:40 AM", "ongoing", "2 h 40 m", Math.round(f * 1.1), split[1], is41 ? "WS-04 — Suresh Munda" : "Welding station", "current"),
    stage("Polishing", "09:10 AM", "ongoing", "2 h 10 m", Math.round(f * 1.04), split[2], is41 ? "PL-02 — Dinesh Lohra" : "Polishing line", "current"),
    stage("Finishing", "09:35 AM", "ongoing", "1 h 45 m", Math.round(f * 1.0), split[3], is41 ? "FIN-01" : "Buffing", "current"),
    stage("Quality Inspection", "10:05 AM", "ongoing", "1 h 15 m", w.accepted + w.rejected - 0, split[4], "Neha Verma · Anita Kumari", "current"),
    stage("Accepted", "10:20 AM", "ongoing", "—", w.accepted, 0, "QC-1182", "current"),
    stage("Packing", "—", "—", "—", 0, 0, "Packing Team B", "todo"),
    stage("Finished Goods Added", "—", "—", "—", 0, 0, "Sunil Yadav", "todo"),
  ] : [
    stage("Work Order Created", "—", "—", "—", w.planned, 0, "Rohit Sharma", "done"),
    stage("Material Reserved", "—", "—", "—", w.status === "Material Pending" ? 0 : w.planned, 0, "System (MRP)", w.status === "Material Pending" ? "todo" : "done"),
    ...["Material Issued", "Production Started", "Forming", "Welding", "Polishing", "Finishing", "Quality Inspection", "Accepted", "Packing", "Finished Goods Added"].map((l) => stage(l, "—", "—", "—", 0, 0, "—", "todo")),
  ];
  if (w.status === "Completed") journey.forEach((j) => { j.state = "done"; j.end = j.end === "ongoing" ? "completed" : j.end; });

  const wipStages = [["Cutting", 0], ["Forming", w.wip ? Math.round(w.wip * 0.31) : 0], ["Welding", w.wip ? Math.round(w.wip * 0.21) : 0], ["Polishing", w.wip ? Math.round(w.wip * 0.14) : 0], ["Finishing", w.wip ? Math.round(w.wip * 0.14) : 0], ["QC", w.wip ? w.wip - Math.round(w.wip * 0.31) - Math.round(w.wip * 0.21) - 2 * Math.round(w.wip * 0.14) : 0]].map(([stg, n]) => ({ stage: stg, n }));
  if (is41) { wipStages[1].n = 420; wipStages[2].n = 280; wipStages[3].n = 190; wipStages[4].n = 0; wipStages[5].n = 136; }

  const entries = is41 ? [
    ["08:00 – 09:00", "HP-03", "Kailash Mahto", 330, 318, 12, "Morning", "Vijay Kumar", ""],
    ["09:00 – 10:00", "P-04", "Ramesh Oraon", 280, 262, 18, "Morning", "Vijay Kumar", "Die jam 08:50 — press stopped 1 h 52 m"],
    ["10:00 – 11:00", "HP-03", "Kailash Mahto", 350, 340, 10, "Morning", "Vijay Kumar", ""],
    ["11:00 – 11:20", "P-04", "Ramesh Oraon", 280, 266, 14, "Morning", "Vijay Kumar", "Restarted after guide-bush replacement"],
  ] : started ? [
    ["08:00 – 12:00", "Press", "Operator", Math.round(f * 0.45), Math.round(w.accepted * 0.45), Math.round(rej * 0.45), "Morning", w.supervisor, ""],
    ["12:00 – 16:00", "Press", "Operator", Math.round(f * 0.55), Math.round(w.accepted * 0.55), Math.round(rej * 0.55), "Evening", w.supervisor, ""],
  ] : [];

  const machines = is41 ? [
    { id: "HP-03", role: "Forming", run: "6h 48m", idle: "0h 32m", down: "0h 32m", out: 820, eff: 87 },
    { id: "P-04", role: "Deep drawing", run: "4h 56m", idle: "0h 12m", down: "1h 52m", out: 660, eff: 74 },
    { id: "WS-04", role: "Welding", run: "6h 20m", idle: "0h 20m", down: "0h 36m", out: 655, eff: 82 },
    { id: "PL-02", role: "Polishing", run: "6h 30m", idle: "0h 12m", down: "0h 44m", out: 604, eff: 80 },
    { id: "FIN-01", role: "Finishing", run: "6h 12m", idle: "0h 30m", down: "0h 26m", out: 580, eff: 83 },
  ] : started ? [{ id: "—", role: "Line machines", run: "6h 10m", idle: "0h 20m", down: "0h 30m", out: w.produced, eff: 86 }] : [];

  const employees = is41 ? [
    ["Vijay Kumar", "Production Supervisor", "HP-03 / P-04", "Morning + Evening", 1240, 1186, 4.4, "90.5%"],
    ["Kailash Mahto", "Press Operator", "HP-03", "Morning", 820, 806, 1.8, "92%"],
    ["Ramesh Oraon", "Press Operator", "P-04", "Morning", 420, 406, 3.4, "76%"],
    ["Suresh Munda", "Welder", "WS-04", "Morning", 655, 639, 2.4, "88%"],
    ["Dinesh Lohra", "Polisher", "PL-02", "Morning", 604, 594, 1.6, "91%"],
    ["Anita Kumari", "QC Inspector", "QC Lab", "Morning", 680, 638, 6.2, "—"],
  ] : [];

  const downtime = is41 ? [
    ["08:50 – 10:42", "P-04", "Machine Breakdown", 112, "Die jam — worn guide bush (BD-0412)", 346],
    ["09:55 – 10:10", "WS-04", "Setup / Changeover", 15, "Wire spool change", 46],
    ["10:50 – 11:10", "PL-02", "Tool Change", 20, "Abrasive belt change", 62],
  ] : [];

  const cost = COSTS.find((x) => x.wo === w.id) ?? null;
  const docs = [["Work order — " + w.id + ".pdf", "Rohit Sharma", "05 Oct"], ["Material requisition — MR-" + w.id.slice(3) + ".pdf", "Sunil Yadav", "06 Oct"], ["Process route card.pdf", "Production Planning", "05 Oct"], ["Drawing — " + p.model + " rev C.pdf", "Engineering", "12 Aug"], ["QC plan — " + p.short + ".pdf", "Neha Verma", "01 Sep"]];
  void ISSUES; void mat;
  return { p, c, material, journey, wipStages, entries, machines, employees, downtime, cost, docs };
}
