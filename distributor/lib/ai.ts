import type { Customer, Dispatch, Invoice, Order, Shipment } from "@/types";
import { PRODUCTS, custName } from "@/data/core";
import { STOCK, available } from "@/data/ops";
import { lakh, inr } from "./format";

export type Answer = {
  title: string; text?: string;
  stats?: { label: string; value: string }[];
  list?: { label: string; value: string; sub?: string; href?: string }[];
  link?: { label: string; href: string };
  follow?: string[];
};
export type Ctx = { customers: Customer[]; orders: Order[]; invoices: Invoice[]; shipments: Shipment[]; dispatches: Dispatch[] };

export const SUGGESTIONS = [
  "How much money is overdue?",
  "Which customers have not paid for 30+ days?",
  "Show today's dispatches.",
  "How much stock did we send to Patna this month?",
  "Which products may go out of stock?",
  "Who is our highest-selling salesperson?",
  "Which customers reduced their purchases this quarter?",
  "Show delayed deliveries.",
  "What is our sales vs collection gap this month?",
];

export function ask(q: string, ctx: Ctx): Answer {
  const s = q.toLowerCase();

  if (/30\+|30 days|more than 30|not paid|haven'?t paid|unpaid for/.test(s)) {
    const rows = ctx.customers.filter((c) => c.overdue > 0 && c.oldestDays > 30).sort((a, b) => b.overdue - a.overdue);
    const total = rows.reduce((a, c) => a + c.overdue, 0);
    return {
      title: `${rows.length} customers haven't paid for more than 30 days`,
      text: `Together they owe ${lakh(total)} on invoices that are more than 30 days past due. The top accounts are listed below — Sharma Hardware crossed 30 days yesterday.`,
      list: rows.slice(0, 6).map((c) => ({ label: c.name, value: lakh(c.overdue), sub: `${c.oldestDays} days overdue · ${c.city} · ${c.rep}`, href: `/customers/${c.id}` })),
      link: { label: "View All Receivables", href: "/receivables" },
      follow: ["How much money is overdue?", "Show delayed deliveries."],
    };
  }
  if (/overdue|outstanding|owe|receivable/.test(s)) {
    return {
      title: "₹14.72 lakh is currently overdue.",
      text: "12 customers have invoices past their due date. Total receivables stand at ₹46.72 lakh, of which ₹18.2 lakh is not yet due.",
      list: [
        { label: "Sharma Hardware", value: "₹4.75L", sub: "31 days overdue · Amit Kumar", href: "/customers/sharma-hardware" },
        { label: "Gupta Enterprises", value: "₹2.82L", sub: "44 days overdue · Amit Kumar", href: "/customers/gupta-enterprises" },
        { label: "Maa Traders", value: "₹1.96L", sub: "38 days overdue · Rohit Singh", href: "/customers/maa-traders" },
      ],
      link: { label: "View All Receivables", href: "/receivables" },
      follow: ["Which customers have not paid for 30+ days?", "What is our sales vs collection gap this month?"],
    };
  }
  if (/dispatch/.test(s) && /today|now|current/.test(s)) {
    const today = ctx.dispatches.filter((d) => d.departure?.startsWith("2026-10-06") || d.status === "Vehicle Assigned" || d.status === "Ready");
    const val = today.reduce((a, d) => a + d.value, 0);
    return {
      title: `${today.length} dispatches today · ${lakh(val)}`,
      text: "Includes vehicles already on the road and loads that are ready or have a vehicle assigned.",
      list: today.slice(0, 6).map((d) => ({ label: `${d.id} · ${custName(d.custId)}`, value: lakh(d.value), sub: `${d.status} · ${d.vehicle} · ${d.qty.toLocaleString("en-IN")} units`, href: `/dispatch/${d.id}` })),
      link: { label: "Open Dispatch", href: "/dispatch" },
    };
  }
  if (/patna/.test(s)) {
    return {
      title: "6,420 units sent to Patna this month",
      text: "Worth ₹14.8 lakh at cost across 9 warehouse transfers and 14 direct dealer dispatches (Patna, Gaya, Muzaffarpur).",
      stats: [{ label: "Warehouse transfers", value: "3,850 units" }, { label: "Dealer dispatches", value: "2,570 units" }, { label: "Value at cost", value: "₹14.8 L" }],
      list: [
        { label: "Wall Mounted WC", value: "180 pcs", sub: "PO-5117 · inbound to Patna" },
        { label: "Premium LED Panel 18W", value: "3,000 pcs", sub: "PO-5118 · QC in progress" },
        { label: "Premium Kitchen Sink 24×18", value: "400 pcs", sub: "Transfer from Ranchi" },
      ],
      link: { label: "Open Patna Warehouse", href: "/warehouses/PAT" },
    };
  }
  if (/stock|inventory/.test(s) && /out|low|run|short/.test(s)) {
    const rows = STOCK.map((r) => ({ r, a: available(r), p: PRODUCTS.find((p) => p.sku === r.sku)! }))
      .filter((x) => x.a < x.r.reorder)
      .map((x) => ({ ...x, days: Math.max(1, Math.round(x.a / Math.max(1, x.p.units / 90 / 3))) }))
      .sort((a, b) => a.a / a.r.reorder - b.a / b.r.reorder);
    const ks = rows.findIndex((x) => x.r.sku === "KS-2418-P" && x.r.wh === "DHN");
    if (ks > 0) rows.unshift(...rows.splice(ks, 1));
    return {
      title: `${rows.length} product-locations are below reorder level`,
      text: "Ranked by how close they are to stock-out at current sales velocity.",
      list: rows.slice(0, 6).map((x) => ({ label: `${x.p.name} · ${x.r.wh === "RNC" ? "Ranchi" : x.r.wh === "DHN" ? "Dhanbad" : "Patna"}`, value: `${x.a.toLocaleString("en-IN")} left`, sub: `Min ${x.r.reorder.toLocaleString("en-IN")} · stock-out in ~${x.r.sku === "KS-2418-P" ? 6 : x.days} days`, href: `/products/${x.p.id}` })),
      link: { label: "Open Inventory", href: "/inventory" },
    };
  }
  if (/salesperson|sales ?man|highest|best|top (sales|seller)|leaderboard/.test(s) && !/product/.test(s)) {
    return {
      title: "Amit Kumar is the top salesperson this month",
      text: "₹31.4 lakh in sales across 42 orders with ₹24.8 lakh collected (79% collection rate).",
      list: [
        { label: "1. Amit Kumar", value: "₹31.4L", sub: "Target achieved 112% · 28 customers" },
        { label: "2. Rohit Singh", value: "₹28.7L", sub: "Target achieved 104% · 26 customers" },
        { label: "3. Vikash Sharma", value: "₹24.2L", sub: "Target achieved 91% · 24 customers" },
      ],
      link: { label: "View Sales Team Performance", href: "/reports?r=sales-team" },
    };
  }
  if (/reduc|decline|drop|fell|lower|less/.test(s)) {
    return {
      title: "4 key dealers reduced purchases this quarter",
      text: "Compared with the previous quarter. Two of them also have overdue invoices — worth a combined visit.",
      list: [
        { label: "Mahavir Traders", value: "−44%", sub: "Dumka · overdue ₹1.51L", href: "/customers/mahavir-traders" },
        { label: "Radhey Sanitary Store", value: "−31%", sub: "Bhagalpur · overdue ₹1.18L", href: "/customers/radhey-sanitary-store" },
        { label: "Singh Electricals", value: "−22%", sub: "Gaya", href: "/customers/singh-electricals" },
        { label: "Kolkata Bath Studio", value: "−18%", sub: "Kolkata", href: "/customers/kolkata-bath-studio" },
      ],
      link: { label: "Customer Analytics", href: "/reports?r=customers" },
    };
  }
  if (/delay|late|stuck|issue/.test(s)) {
    const sh = ctx.shipments.filter((x) => x.status === "Delayed" || x.status === "Issue");
    return {
      title: `${sh.length + 1} deliveries need attention`,
      text: "Shipments that are late or have a reported issue, plus one order held back by a stock shortage.",
      list: [
        { label: "ORD-1048 · Agarwal Traders", value: "2 days late", sub: "Dispatch held — partial stock", href: "/orders/ORD-1048" },
        ...sh.slice(0, 5).map((x) => ({ label: `${x.id} · ${custName(x.custId)}`, value: x.status, sub: x.note ?? x.transporter, href: `/shipments/${x.id}` })),
      ],
      link: { label: "Open Shipments", href: "/shipments" },
    };
  }
  if (/gap|vs|versus|collection/.test(s)) {
    return {
      title: "Collections are ₹42 lakh behind sales this month",
      text: "Sales ₹1.84 Cr vs collections ₹1.42 Cr — a 77% realisation rate, up from 80% last month on a lower base. Receivable health slipped because overdue invoices grew ₹2.8L.",
      stats: [{ label: "Sales", value: "₹1.84 Cr" }, { label: "Collections", value: "₹1.42 Cr" }, { label: "Gap", value: "₹42.0 L" }],
      link: { label: "Open Receivables", href: "/receivables" },
    };
  }
  const o = q.match(/ord-?\s?(\d{3,4})/i);
  if (o) {
    const id = `ORD-${o[1].padStart(4, "0")}`;
    const ord = ctx.orders.find((x) => x.id === id);
    if (ord) return { title: `${id} — ${custName(ord.custId)}`, text: `${inr(ord.value)} · ${ord.qty.toLocaleString("en-IN")} units · status ${ord.status}. ${ord.packed.toLocaleString("en-IN")} packed, ${ord.dispatched.toLocaleString("en-IN")} dispatched, ${ord.delivered.toLocaleString("en-IN")} delivered.`, link: { label: "Open order", href: `/orders/${id}` } };
  }
  const cust = ctx.customers.find((c) => s.includes(c.name.toLowerCase()) || (s.split(/\s+/).some((w) => w.length > 4 && c.name.toLowerCase().split(" ")[0] === w)));
  if (cust) {
    return {
      title: `${cust.name} — ${cust.city}`,
      text: `${cust.segment} dealer since ${cust.since}. Outstanding ${inr(cust.outstanding)} of which ${inr(cust.overdue)} is overdue. Credit used ${Math.round((cust.outstanding / cust.creditLimit) * 100)}% of ${lakh(cust.creditLimit)}.`,
      link: { label: "Open Customer 360°", href: `/customers/${cust.id}` },
    };
  }
  return {
    title: "I can answer questions about your live business data",
    text: "Try asking about overdue payments, stock risks, dispatches, delayed deliveries, salesperson performance or a specific dealer or order.",
    follow: SUGGESTIONS.slice(0, 4),
  };
}
