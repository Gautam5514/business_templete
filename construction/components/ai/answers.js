export const SUGGESTED = [
  "Which project needs my attention today?",
  "Which project is most delayed?",
  "How much money is stuck with clients?",
  "Which project may exceed its budget?",
  "Why is Riverside Villas delayed?",
  "How much steel is available at Skyline?",
  "What materials may run out this week?",
  "Which contractor is underperforming?",
  "What happened at Skyline today?",
  "How much unbilled work do we have?",
  "Which payments are overdue?",
  "What should I focus on today?",
];

const m = (k, v, tone) => ({ k, v, tone });
const FOCUS = {
  title: "Here is what needs you today, in priority order",
  blocks: [
    { t: "rank", items: [
      ["Riverside Villas", "11 days behind. Steel (18 MT) still not dispatched; crane down. Call the Tata Steel Partner today.", "bad", "/projects/riverside"],
      ["Orion Business Park — ₹72.4L overdue", "RA Bill #08 is 18 days outstanding and steel is short for Block A. Escalate to Orion Realty’s finance head.", "bad", "/billing"],
      ["Skyline — TMT 12mm stock-out in 1.1 days", "MR-2841 and PO-1844 await your approval. A 3-day faster supplier prevents ~₹1.2L delay cost.", "warn", "/approvals"],
      ["Metro Mall Interiors — overrun risk ₹11.4L", "89% of budget used at 83% completion. Freeze new change requests until CO-044 is priced.", "risk", "/reports?tab=leaks"],
    ] },
    { t: "p", text: "7 approvals are waiting on you, worth ₹2.9 Cr. The two critical ones are the steel MR and PO for Skyline." },
  ],
};
export const ANSWERS = [
  { match: ["attention", "focus", "priorit"], a: FOCUS },
  { match: ["most delayed"], a: { title: "Riverside Villas is the most delayed project", blocks: [
    { t: "metrics", items: [m("Behind schedule", "11 days", "bad"), m("Planned vs actual", "47% vs 36%", "bad"), m("Cost impact", "₹14.8L", "risk")] },
    { t: "p", text: "Next most delayed: Skyline Residency (3 days) and Orion Business Park (5% behind plan, ~5 days). All others are within 1 day of plan." },
    { t: "action", text: "Ask “Why is Riverside Villas delayed?” for the root-cause breakdown." }] } },
  { match: ["stuck with client", "money is stuck", "receivable", "client"], a: { title: "₹7.6 Cr is pending from clients", blocks: [
    { t: "metrics", items: [m("Billed, not collected", "₹7.6 Cr", "warn"), m("Certified, unpaid", "₹4.9 Cr", "bad"), m("Under client query", "₹2.7 Cr", "mute")] },
    { t: "list", items: ["Orion Realty — ₹72.4L pending for 18 days (RA Bill #08)", "Urban Living Developers — ₹66L on Skyline RA-12 (9 days) + ₹16L Riverside (14 days)", "Eastern Business Group — ₹27L (7 days)", "Metro Retail Ventures — ₹22L (12 days)"] },
    { t: "action", text: "Orion is the only account beyond 15 days. Recommend a call from you to Orion Realty’s MD today." }] } },
  { match: ["exceed", "budget", "overrun"], a: { title: "Three projects may exceed budget", blocks: [
    { t: "rank", items: [
      ["Orion Business Park", "Projected overrun ₹18.6L — steel escalation (₹7.4L), delay overheads, extra dewatering.", "warn"],
      ["Riverside Villas", "Projected overrun ₹14.8L — idle crew, crane hire, expedited freight.", "bad"],
      ["Metro Mall Interiors", "Projected overrun ₹11.4L — rate escalation ₹4.2L, rework ₹2.8L, labour ₹2.1L, client changes ₹2.3L.", "risk"],
    ] },
    { t: "p", text: "Skyline is forecast ₹60L above its direct-cost budget, but an escalation recovery of ₹1.3 Cr from the client keeps margin at 17.9%." }] } },
  { match: ["riverside"], a: { title: "Riverside Villas is currently 11 days behind schedule", blocks: [
    { t: "p", text: "Primary causes:" },
    { t: "bars", items: [["Steel delivery delay", 5], ["Contractor manpower shortage", 3], ["Heavy rainfall", 2], ["Crane breakdown", 1]] },
    { t: "p", text: "Current critical activity: Block B slab reinforcement." },
    { t: "action", text: "Recommended action: expedite the 18 MT steel delivery (PO-1802) and add 8 reinforcement workers for the next 5 days." },
    { t: "metrics", items: [m("Projected recovery", "4–5 days", "good"), m("Cost to recover", "₹1.1L", "mute")] }] } },
  { match: ["steel", "skyline"].slice(0, 1), a: { title: "Skyline holds 8.8 MT of steel — but only 5.4 MT is 12mm", blocks: [
    { t: "metrics", items: [m("Ordered", "62 MT"), m("Received", "48 MT"), m("Consumed", "39.2 MT"), m("In store", "8.8 MT", "warn")] },
    { t: "p", text: "12mm bars are the problem: 18 MT required, 5.4 MT available. At 4.8 MT/day that is only 1.1 days of stock." },
    { t: "action", text: "PO-1844 (18 MT, JSW) is due 09 Oct. Approve the faster supplier so Tower B column work does not stop." }] } },
  { match: ["run out", "materials may"], a: { title: "4 materials may run out this week", blocks: [
    { t: "rank", items: [
      ["TMT Steel 12mm — Skyline", "5.4 MT left · 1.1 days", "bad"],
      ["TMT Steel — Riverside", "4.0 MT left · ~1.5 days; PO-1802 delayed", "bad"],
      ["Vitrified tiles — Metro", "500 SQM left · PO-1829 delayed 4 days", "warn"],
      ["TMT Steel — Orion", "4.1 MT left · ~2 days", "warn"],
    ] }] } },
  { match: ["contractor", "underperform"], a: { title: "Two contractors are underperforming", blocks: [
    { t: "rank", items: [
      ["Eastern Structural Works — Riverside", "Score 52. 18 workers on a 26-worker plan. Slab reinforcement slipped 3 days.", "bad"],
      ["Shree Interiors — Metro Mall", "Score 58. Quality 52%, 2 failed tile inspections, 7 open snags.", "warn"],
    ] },
    { t: "action", text: "Hold next Shree Interiors bill (CB-0927, ₹22L) until snags SNG-183/184 are closed." }] } },
  { match: ["happened", "today"], a: { title: "Today at Skyline Residency", blocks: [
    { t: "metrics", items: [m("Workers", "146"), m("Slab", "Tower A done", "good"), m("Steel received", "18 MT", "good"), m("Crane", "TC-02 down", "bad")] },
    { t: "list", items: ["07:45 — 146 workers checked in", "08:10 — Concrete pouring started, Tower A", "10:42 — 18 MT steel (16mm) arrived", "12:20 — QI-2482 passed", "02:40 — Crane TC-02 stopped (hydraulic)", "04:18 — Tower A slab completed", "06:02 — DPR submitted"] }] } },
  { match: ["unbilled"], a: { title: "₹8.4 Cr of completed work has not been billed", blocks: [
    { t: "metrics", items: [m("Work completed", "₹47.8 Cr"), m("Billed", "₹39.4 Cr"), m("Unbilled", "₹8.4 Cr", "warn")] },
    { t: "list", items: ["Greenfield — RA #09 (₹2.36 Cr) prepared, awaiting your approval", "Skyline — ~₹1.6 Cr (Tower B + club house measured, not yet in RA-13)", "Orion — ~₹1.9 Cr", "Others — ₹2.5 Cr"] },
    { t: "action", text: "Billing earlier brings cash forward: approving RA #09 alone adds ₹2.36 Cr to receivables." }] } },
  { match: ["overdue", "payment"], a: { title: "₹1.3 Cr overdue — ₹72.4L from clients, ₹60L to vendors", blocks: [
    { t: "rank", items: [
      ["Receivable — Orion RA #08", "₹72.4L · 18 days overdue", "bad"],
      ["Payable — UltraTech Cement Dealer", "₹8.9L · overdue 2 days (VB-3316)", "warn"],
      ["Payable — Kajaria Distribution", "₹7.3L · overdue 1 day (VB-3309)", "warn"],
    ] }, { t: "p", text: "₹28L collection is expected today; ₹14L vendor payment is due." }] } },
];
export function answer(q) {
  const s = q.toLowerCase();
  const hit = ANSWERS.find((x) => x.match.some((k) => s.includes(k)));
  return hit ? hit.a : FOCUS;
}
