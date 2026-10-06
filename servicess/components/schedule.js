import { rng } from "@/lib/rng";
import { NOW, CUSTOMERS } from "@/data/core";
import { CURRENT, etaOf } from "@/data/ops";

export const DAY0 = 8 * 60, DAY1 = 20 * 60;
// Deterministic day schedule for a technician: [{kind:'job'|'travel', s, e, label, state}]
export function scheduleOf(t) {
  const r = rng(t.id.charCodeAt(1) * 31 + t.id.charCodeAt(2) * 7);
  const pool = CUSTOMERS.filter((c) => c.branch === t.branch), cur = CURRENT[t.id];
  const out = [];
  let cursor = 9 * 60 + r.int(0, 30);
  const n = Math.max(t.jobsToday, t.status === "offline" ? 0 : 2);
  for (let i = 0; i < n + 1 && cursor < 18.5 * 60; i++) {
    const trav = r.int(12, 24), dur = r.int(55, 100), c = pool[r.int(0, pool.length - 1)];
    out.push({ kind: "travel", s: cursor, e: cursor + trav }, { kind: "job", s: cursor + trav, e: cursor + trav + dur, label: c.short });
    cursor += trav + dur + r.int(0, 14);
  }
  let blocks = out.filter((b) => !(t.status === "offline" && b.e > NOW));
  const eta = etaOf(t);
  if (t.status === "available") blocks = blocks.filter((b) => b.e <= NOW - 5 || b.s >= NOW + 40);
  if (["onjob", "delayed"].includes(t.status)) {
    blocks = blocks.filter((b) => b.e <= NOW - 40 || b.s >= NOW + (eta ?? 30) + 22);
    blocks.push({ kind: "job", s: NOW - 38, e: NOW + (eta ?? 30), label: cur?.customer?.split(" ").slice(0, 2).join(" ") || "On job", cur: true, late: t.status === "delayed" });
  }
  if (t.status === "travelling") {
    blocks = blocks.filter((b) => b.e <= NOW - 20 || b.s >= NOW + (eta ?? 12) + 70);
    blocks.push({ kind: "travel", s: NOW - 10, e: NOW + (eta ?? 12), cur: true }, { kind: "job", s: NOW + (eta ?? 12), e: NOW + (eta ?? 12) + 70, label: cur?.customer?.split(" ").slice(0, 2).join(" ") || "Next job", next: true });
  }
  return blocks.sort((a, b) => a.s - b.s).map((b) => ({ ...b, state: b.cur ? (b.late ? "late" : "cur") : b.next || b.s >= NOW ? "next" : "done" }));
}
// first free minute after NOW for a technician
export function freeFrom(t) { const eta = etaOf(t); return t.status === "available" ? NOW : t.status === "offline" ? 24 * 60 : NOW + (eta ?? 20); }
