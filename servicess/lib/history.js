import { rng } from "@/lib/rng";
import { JOBS } from "@/data/ops";

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TYPES = ["AC Breakdown", "Preventive Maintenance", "AMC Visit", "Compressor Replacement", "Water Leakage Issue", "Gas Refill", "CCTV Camera Offline", "RO Filter Replacement", "Electrical Fault", "Deep Cleaning"];
const APEX = [["06 Oct", "AC Breakdown", "In Progress", "JOB-2841"], ["18 Sep", "Preventive Maintenance", "Completed", "JOB-2602"], ["02 Aug", "Compressor Replacement", "Completed", "JOB-2531"], ["14 Jul", "AMC Visit", "Completed", "JOB-2478"], ["12 May", "Water Leakage Issue", "Completed", "JOB-2290"]];
export function historyOf(c) {
  if (c.id === "C001") return APEX.map(([d, t, s, j]) => ({ d, t, s, j }));
  const live = JOBS.filter((j) => j.customer === c.name).slice(0, 2).map((j) => ({ d: "06 Oct", t: j.service, s: j.status === "Completed" ? "Completed" : j.status, j: j.id }));
  const r = rng(c.id.charCodeAt(3) * 17 + c.id.charCodeAt(2)), out = [...live];
  let m = 8, d = 28;
  for (let i = 0; i < 5; i++) { d -= r.int(6, 20); while (d < 1) { d += 28; m--; } out.push({ d: `${String(d).padStart(2, "0")} ${MON[Math.max(0, m)]}`, t: r.pick(TYPES), s: "Completed", j: `JOB-${2200 + r.int(0, 380)}` }); }
  return out;
}
