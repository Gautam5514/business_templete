import { MRP, WIP } from "@/data/orders";
import { DOWNTIME_CATS, PROD_TREND } from "@/data/ops";
import { MACHINES, SUPPLIERS } from "@/data/masters";
import { lakh, num } from "./format";

export const SUGGESTED = [
  "Which production orders are delayed?",
  "Which raw materials may run out this week?",
  "Why did production fall yesterday?",
  "Which machine has the most downtime?",
  "Which product has the highest rejection rate?",
  "How much material was consumed for sink 24×18 this month?",
  "Which supplier delivers late most often?",
  "What orders may miss their dispatch date?",
  "What is our production cost variance this month?",
  "How much WIP is older than 3 days?",
  "Which orders may miss their delivery date?",
];

const R = (h, lines) => ({ h, lines });

export function answer(q) {
  const t = q.toLowerCase();
  if (/delay|at.?risk|miss|late order|deliver.*date|dispatch date/.test(t) && !/supplier/.test(t)) {
    const orders = /dispatch|deliver/.test(t);
    return {
      title: orders ? "3 customer orders may miss their dispatch date." : "3 production orders are currently at risk.",
      sections: orders ? [
        R("ORD-5088 · Bihar Home Solutions", ["Due 12 Oct · WO-2845 Basin Mixer 940/3,000", "Brass cartridge batch rejected; PO-3319 is 2 days late"]),
        R("ORD-5093 · Maa Durga Enterprises", ["Due 09 Oct · WO-2848 Utility Sink 300/800", "Line 4 down for HP-05 seal; QC rejection 5.3%"]),
        R("ORD-5084 · Sharma Sanitary House", ["Due 10 Oct · WO-2841 Sink 24×18 1,240/2,000", "6 h behind plan after P-04 downtime — recoverable with evening shift"]),
      ] : [
        R("WO-2841", ["Delay: 6 hours", "Reason: Press P-04 downtime"]),
        R("WO-2845", ["Material shortage: Brass cartridge"]),
        R("WO-2848", ["QC rejection above threshold"]),
      ],
      stat: ["Estimated order value affected", "₹18.7L"], note: "Recommended: run WO-2841 through the evening shift, expedite PO-3319, and release HP-05 by 2:30 PM.",
      cta: { label: "View At-Risk Orders", href: "/production?risk=1" },
    };
  }
  if (/run out|material|shortage|stock out/.test(t) && !/consum/.test(t)) {
    const s = MRP.filter((m) => m.shortage > 0);
    return { title: `${s.length} raw materials are short against the production plan.`, sections: s.map((m) => R(m.name, [`Required ${num(m.required)} ${m.unit} · available ${num(m.avail)} · incoming ${num(m.incoming)}`, `Shortage ${num(m.shortage)} ${m.unit} — recommend buying ${num(m.recommend)}`])), note: "SS 304 Coil 1.2mm is also below minimum stock (7,220 kg vs 8,000 kg).", cta: { label: "Open MRP", href: "/raw-materials?tab=mrp" } };
  }
  if (/fall|drop|why.*production|less production/.test(t)) {
    const [y, d] = [PROD_TREND[13].actual, PROD_TREND[14].actual];
    return { title: `Production is down ${(((y - d) / y) * 100).toFixed(1)}% (${num(d)} vs ${num(y)} units).`, sections: [R("Press P-04 die jam", ["1 h 52 m lost on Line 2 · ≈ 410 units"]), R("HP-05 hydraulic leak", ["Line 4 stopped since 10:05 · ≈ 300 units"]), R("Brass cartridge shortage", ["Line 3 paused 42 min · ≈ 120 units"])], stat: ["Total downtime today", "3 hr 42 min"], cta: { label: "Open Downtime", href: "/maintenance?tab=downtime" } };
  }
  if (/downtime|machine/.test(t) && !/cost/.test(t)) {
    const m = [...MACHINES].sort((a, b) => b.downMin - a.downMin).slice(0, 3);
    return { title: `${m[0].name} has the most downtime today (${m[0].downMin} min).`, sections: m.map((x) => R(x.name, [`${x.downMin} min down · status ${x.status} · efficiency ${x.eff}%`])), stat: ["Top downtime cause", `${DOWNTIME_CATS[0].cat} — ${DOWNTIME_CATS[0].min} min`], cta: { label: "Open Machine", href: `/machines/${m[0].id}` } };
  }
  if (/reject|defect|quality/.test(t)) {
    return { title: "Utility Sink 21×18 has the highest rejection rate (4.6% this week).", sections: [R("Utility Sink 21×18", ["4.6% this week · 3.0% last week · dimension failures on HP-05"]), R("Premium Kitchen Sink 24×18", ["3.4% · surface dent (19) and welding (11) on QC-1182"]), R("Basin Mixer Chrome", ["3.1% · thread defects on CNC-02"])], stat: ["Plant rejection rate", "2.8% (target < 2%)"], cta: { label: "Open Quality", href: "/quality" } };
  }
  if (/consum|how much material|sink 24/.test(t)) {
    return { title: "Sink 24×18 used ≈ 1,73,300 kg of SS 304 this month.", sections: [R("Standard requirement", ["44,200 units × 3.8 kg = 1,67,960 kg"]), R("Actually issued", ["1,73,300 kg across 31 material issues"]), R("Variance", ["+5,340 kg (+3.2%) ≈ ₹3.95L — nesting loss and 2,004 rejected units"])], cta: { label: "Open Material Issues", href: "/raw-materials?tab=issue" } };
  }
  if (/supplier|vendor/.test(t)) {
    const s = [...SUPPLIERS].sort((a, b) => a.otd - b.otd).slice(0, 3);
    return { title: `${s[0].name} delivers late most often (${s[0].otd}% on time).`, sections: s.map((x) => R(x.name, [`On-time ${x.otd}% · lead time ${x.lead} days · rejection ${x.rej}%`])), note: "PO-3319 (Brass Cartridge, 4,000 pcs) is 2 days past due.", cta: { label: "Open Supplier 360", href: `/suppliers/${s[0].id}` } };
  }
  if (/cost|variance|costing/.test(t)) {
    return { title: "Cost per unit is ₹19 above standard on the live order WO-2841.", sections: [R("WO-2841 Sink 24×18", ["Standard ₹428 · actual ₹447 (+4.4%)"]), R("Biggest drivers", ["Material +₹8.2 · Rejection loss +₹3.4 · Machine +₹3.1 · Labour +₹2.9"]), R("Month trend", ["Average variance ₹14/unit, up from ₹6 in May"])], stat: ["Estimated variance this month", "₹5.8L"], cta: { label: "Open Cost Variance", href: "/finance?tab=variance" } };
  }
  if (/wip|work in progress|older/.test(t)) {
    const old = WIP.filter((w) => w.age > 3);
    const v = old.reduce((s, w) => s + w.value, 0);
    return { title: `${lakh(v)} of WIP is older than 3 days.`, sections: old.map((w) => R(`${w.wo} · ${w.product}`, [`${w.total} units · ${w.age.toFixed(1)} days · ${lakh(w.value)}`])), cta: { label: "Open WIP", href: "/wip" } };
  }
  return { title: "Here's what I can see across the factory right now.", sections: [R("Today", ["4,860 units produced against 5,400 target (90%)"]), R("Needs attention", ["3 at-risk work orders · 1 material shortage · 1 breakdown · 2 quality alerts"]), R("Try asking", ["“Which production orders are delayed?” or “Which raw materials may run out this week?”"])], cta: { label: "Open Dashboard", href: "/dashboard" } };
}
