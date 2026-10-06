import type { Dispatch, Invoice, Order, Shipment } from "@/types";
import { whName, custById } from "@/data/core";
import type { Step } from "@/components/ui/ui";
import { fdt } from "./format";

const WH_PEOPLE: Record<string, [string, string]> = { RNC: ["Manoj Prasad", "Rahul Verma"], DHN: ["Deepak Mahto", "Imran Ansari"], PAT: ["Suresh Thakur", "Pankaj Ranjan"] };
const PROGRESS: Record<string, number> = { Draft: 1, "Pending Approval": 1, Approved: 2, "Stock Allocated": 3, Packing: 3, Ready: 5, Dispatched: 6, "In Transit": 7, "Partially Delivered": 8, Delivered: 8 };

export function journey(o: Order, inv?: Invoice, d?: Dispatch, sh?: Shipment): Step[] {
  const t0 = new Date(o.date).getTime();
  const at = (h: number) => fdt(new Date(t0 + h * 36e5));
  const wh = WH_PEOPLE[o.wh];
  const loc = whName(o.wh);
  const is1047 = o.id === "ORD-1047";
  const cityName = custById(o.custId)?.city ?? o.city;
  let p = PROGRESS[o.status] ?? 1;
  if (o.status === "Cancelled") p = 1;
  const paid = inv ? inv.balance === 0 : false;
  if (inv && (o.status === "Delivered" || o.status === "Partially Delivered") && paid) p = 9;
  const base: Omit<Step, "done" | "current">[] = [
    { label: "Order Created", ts: is1047 ? "04 Oct, 10:50 AM" : at(0), who: o.rep, where: "Ranchi HO · Mobile App", note: `${o.items} items · ${o.qty.toLocaleString("en-IN")} units · ${o.terms}` },
    { label: "Manager Approved", ts: is1047 ? "04 Oct, 11:25 AM" : at(1.2), who: "Rahul Singh", where: "Ranchi HO", note: "Credit check passed · within limit" },
    { label: "Stock Allocated", ts: is1047 ? "04 Oct, 12:16 PM" : at(2), who: "System (auto-allocation)", where: loc, note: is1047 ? "2,180 units reserved from Ranchi — Dhanbad was short on kitchen sinks" : `${o.allocated.toLocaleString("en-IN")} of ${o.qty.toLocaleString("en-IN")} units reserved` },
    { label: "Packing Completed", ts: is1047 ? "06 Oct, 03:52 PM" : at(26), who: wh[1], where: loc, note: is1047 ? "2,150 of 2,180 packed · 30 units pending (BF-AV-CH backorder) · 48 packages" : `${o.packed.toLocaleString("en-IN")} units packed` },
    { label: "Invoice Generated", ts: is1047 ? "06 Oct, 04:05 PM" : at(27), who: "Kiran Devi", where: "Accounts · Ranchi HO", note: inv ? `${inv.id}` : undefined, href: inv ? `/invoices/${inv.id}` : undefined },
    { label: "Truck Dispatched", ts: is1047 ? "06 Oct, 04:40 PM" : d?.departure ? fdt(d.departure) : at(29), who: d?.driver && d.driver !== "—" ? d.driver : "Dispatch desk", where: loc, note: d && d.vehicle !== "—" ? `${d.vehicle} · ${d.transporter}` : undefined, href: d ? `/dispatch/${d.id}` : undefined },
    { label: "In Transit", ts: is1047 ? "06 Oct, 06:48 PM" : at(31), who: sh?.transporter ?? "Transporter", where: sh ? `${sh.route[Math.min(sh.at, sh.route.length - 1)]} (current)` : "On route", note: is1047 ? "Crossed Bokaro checkpoint · ETA 2 hr 18 min" : undefined, href: sh ? `/shipments/${sh.id}` : undefined },
    { label: o.status === "Partially Delivered" ? "Partially Delivered" : "Delivery", ts: is1047 ? "Expected 07 Oct, 11:00 AM" : at(52), who: custById(o.custId)?.contact, where: cityName, note: is1047 ? "Unloading slot at dealer godown · POD to be captured" : sh?.pod && sh.pod !== "Pending" ? `POD ${sh.pod}` : undefined },
    { label: "Payment Collection", ts: is1047 ? "₹2,00,000 received 04 Oct" : inv?.paid ? `${inv.paid.toLocaleString("en-IN")} received` : undefined, who: "Accounts", where: "Ranchi HO", note: inv ? (paid ? "Fully collected" : `Outstanding ₹${inv.balance.toLocaleString("en-IN")}`) : undefined },
  ];
  const steps: Step[] = base.map((s, i) => {
    const done = i < p;
    const keep = done || is1047;
    return { ...s, ts: keep ? s.ts : undefined, note: keep ? s.note : undefined, done, current: o.status !== "Cancelled" && i === p };
  });
  if (is1047) steps[8] = { ...steps[8], done: false, current: false };
  if (o.status === "Cancelled") return [{ ...steps[0], done: true }, { label: "Order Cancelled", done: true, who: "Rahul Singh", note: "Cancelled at dealer request" }];
  if (!(o.status === "Delivered" || o.status === "Partially Delivered")) steps.forEach((s, i) => { if (i === p) s.current = true; });
  if (is1047) { steps[6].current = true; steps[6].done = false; steps[5].done = true; steps[7].current = false; }
  return steps;
}
export const NEXT_LABEL: Record<string, string> = {
  Draft: "Submit for approval", "Pending Approval": "Approve order", Approved: "Allocate stock", "Stock Allocated": "Start packing", Packing: "Mark ready (invoice)", Ready: "Dispatch vehicle",
  Dispatched: "Mark in transit", "In Transit": "Mark delivered",
};
