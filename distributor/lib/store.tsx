"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Customer, Dispatch, Invoice, Order, OrderStatus, Payment, Shipment } from "@/types";
import { CUSTOMERS, custById } from "@/data/core";
import { DISPATCHES, INVOICES, ORDERS, PAYMENTS, SHIPMENTS, sumLines } from "@/data/ops";
import { EXPENSES, FOLLOWUPS, LOGS, NOTIFS, POS, RETURNS, type Expense, type Followup, type Log, type Notif, type PO, type Ret } from "@/data/misc";
import { NOW, iso } from "./format";
import { ROLES, type RoleId } from "./roles";

export type Toast = { id: number; msg: string; tone: "ok" | "info" | "bad"; sub?: string };

type Store = {
  orders: Order[]; invoices: Invoice[]; payments: Payment[]; dispatches: Dispatch[]; shipments: Shipment[];
  customers: Customer[]; expenses: Expense[]; followups: Followup[]; returns: Ret[]; notifs: Notif[]; logs: Log[]; pos: PO[];
  role: RoleId; setRole: (r: RoleId) => void;
  ownerMode: boolean; setOwnerMode: (v: boolean) => void;
  warehouse: string; setWarehouse: (w: string) => void;
  offline: boolean; setOffline: (v: boolean) => void;
  toasts: Toast[]; toast: (msg: string, tone?: Toast["tone"], sub?: string) => void; dismissToast: (id: number) => void;
  log: (action: string, module: string, record: string, href?: string) => void;
  user: { name: string; title: string };
  createOrder: (o: Omit<Order, "id" | "date">) => string;
  setOrderStatus: (id: string, s: OrderStatus) => void;
  advanceOrder: (id: string) => void;
  recordPayment: (p: { custId: string; invoiceId: string; amount: number; method: Payment["method"]; ref: string; notes: string }) => string;
  addFollowup: (f: Omit<Followup, "id" | "ts" | "by">) => void;
  addExpense: (e: Omit<Expense, "id" | "date" | "by">) => void;
  addCustomer: (c: Pick<Customer, "name" | "city" | "creditLimit" | "rep">) => string;
  advanceReturn: (id: string) => void;
  advancePO: (id: string) => void;
  createPO: (p: Omit<PO, "id" | "date" | "by" | "stage">) => void;
  advanceDispatch: (id: string) => void;
  setShipmentStatus: (id: string, status: Shipment["status"], note?: string) => void;
  readNotif: (id?: string) => void;
  quick: string | null; openQuick: (k: string | null) => void;
  aiOpen: boolean; setAiOpen: (v: boolean, q?: string) => void; aiSeed: string;
  searchOpen: boolean; setSearchOpen: (v: boolean) => void;
};

const Ctx = createContext<Store | null>(null);
export const useStore = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
};

const FLOW: OrderStatus[] = ["Draft", "Pending Approval", "Approved", "Stock Allocated", "Packing", "Ready", "Dispatched", "In Transit", "Delivered"];
let tid = 1;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState(ORDERS);
  const [invoices, setInvoices] = useState(INVOICES);
  const [payments, setPayments] = useState(PAYMENTS);
  const [dispatches, setDispatches] = useState(DISPATCHES);
  const [shipments, setShipments] = useState(SHIPMENTS);
  const [customers, setCustomers] = useState(CUSTOMERS);
  const [expenses, setExpenses] = useState(EXPENSES);
  const [followups, setFollowups] = useState(FOLLOWUPS);
  const [returns, setReturns] = useState(RETURNS);
  const [notifs, setNotifs] = useState(NOTIFS);
  const [logs, setLogs] = useState(LOGS);
  const [pos, setPos] = useState(POS);
  const [role, setRoleS] = useState<RoleId>("owner");
  const [ownerMode, setOwnerMode] = useState(false);
  const [warehouse, setWarehouse] = useState("ALL");
  const [offline, setOffline] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [quick, openQuick] = useState<string | null>(null);
  const [aiOpen, setAiOpenS] = useState(false);
  const [aiSeed, setAiSeed] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const roleDef = ROLES.find((r) => r.id === role)!;
  const user = useMemo(() => ({ name: roleDef.person, title: roleDef.title }), [roleDef]);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((msg: string, tone: Toast["tone"] = "ok", sub?: string) => {
    const id = tid++;
    setToasts((t) => [...t.slice(-3), { id, msg, tone, sub }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const log = useCallback(
    (action: string, module: string, record: string, href?: string) =>
      setLogs((l) => [{ id: `LOG-${Date.now()}`, ts: iso(new Date()), user: roleDef.person, action, module, record, device: "Chrome · Demo session", ip: "127.0.0.1", href }, ...l]),
    [roleDef.person],
  );

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const setRole = (r: RoleId) => {
    setRoleS(r);
    const d = ROLES.find((x) => x.id === r)!;
    toast(`Switched to ${d.label}`, "info", `${d.person} · modules restricted to this role`);
  };

  const createOrder: Store["createOrder"] = (o) => {
    const id = `ORD-${String(1049 + orders.filter((x) => Number(x.id.slice(4)) >= 1049).length).padStart(4, "0")}`;
    const full: Order = { ...o, id, date: iso(new Date()) };
    setOrders((l) => [full, ...l]);
    log(`created order ${id}`, "Sales Orders", id, `/orders/${id}`);
    return id;
  };

  const advanceOrder = (id: string) => {
    const o = orders.find((x) => x.id === id);
    if (!o) return;
    const i = FLOW.indexOf(o.status);
    if (i < 0 || i >= FLOW.length - 1) return;
    setOrderStatus(id, FLOW[i + 1]);
  };

  const setOrderStatus: Store["setOrderStatus"] = (id, s) => {
    const o = orders.find((x) => x.id === id);
    if (!o) return;
    const n = Number(id.slice(4));
    const stage = FLOW.indexOf(s);
    const upd: Order = {
      ...o, status: s,
      allocated: stage >= 3 ? o.qty : o.allocated,
      packed: s === "Ready" || stage >= 6 ? (o.packed || o.qty) : s === "Packing" ? Math.round(o.qty * 0.5) : o.packed,
      dispatched: stage >= 6 ? (o.dispatched || o.packed || o.qty) : o.dispatched,
      delivered: s === "Delivered" ? o.dispatched || o.qty : o.delivered,
      dispatchId: stage >= 3 ? (o.dispatchId ?? `DSP-${n + 1787}`) : o.dispatchId,
      invoiceId: stage >= 5 ? (o.invoiceId ?? `INV-${n + 1894}`) : o.invoiceId,
      stock: stage >= 3 ? "Available" : o.stock,
    };
    setOrders((l) => l.map((x) => (x.id === id ? upd : x)));
    const c = custById(o.custId);
    if (stage >= 5 && !invoices.find((v) => v.orderId === id)) {
      const taxable = Math.round(o.lines.reduce((a, l) => a + l.qty * l.price * (1 - l.disc / 100), 0));
      const due = new Date(NOW); due.setDate(due.getDate() + (o.terms === "Net 45" ? 45 : o.terms === "Net 15" ? 15 : 30));
      const inv: Invoice = { id: upd.invoiceId!, orderId: id, custId: o.custId, date: iso(NOW), due: iso(due), lines: o.lines, freight: o.freight, taxable, gst: o.value - o.freight - taxable, discount: 0, total: o.value, paid: 0, balance: o.value, status: "Unpaid", shipmentId: `SHP-${n - 649}` };
      setInvoices((l) => [inv, ...l]);
    }
    if (stage >= 3 && !dispatches.find((d) => d.orderId === id)) {
      const d: Dispatch = { id: upd.dispatchId!, orderId: id, custId: o.custId, wh: o.wh, packages: Math.max(2, Math.round(o.qty / 38)), qty: o.qty, weight: Math.round(o.qty * 1.4), value: o.value, transporter: "—", vehicle: "—", driver: "—", phone: "—", expected: iso(new Date(NOW.getTime() + 2 * 864e5)), status: "Pending Packing" };
      setDispatches((l) => [d, ...l]);
    }
    setDispatches((l) => l.map((d) => {
      if (d.orderId !== id) return d;
      if (s === "Packing") return { ...d, status: "Packing" };
      if (s === "Ready") return { ...d, status: "Vehicle Assigned", transporter: "Eastern Roadways", vehicle: "JH01DK4821", driver: "Sunil Yadav", phone: "98XXXXXX12" };
      if (s === "Dispatched" || s === "In Transit") return { ...d, status: "Dispatched", departure: iso(NOW), shipmentId: d.shipmentId ?? `SHP-${n - 649}`, transporter: d.transporter === "—" ? "Eastern Roadways" : d.transporter, vehicle: d.vehicle === "—" ? "JH01DK4821" : d.vehicle, driver: d.driver === "—" ? "Sunil Yadav" : d.driver };
      return d;
    }));
    if ((s === "Dispatched" || s === "In Transit") && !shipments.find((x) => x.orderId === id)) {
      const whCity = o.wh === "RNC" ? "Ranchi" : o.wh === "DHN" ? "Dhanbad" : "Patna";
      const sh: Shipment = { id: `SHP-${n - 649}`, dispatchId: upd.dispatchId!, orderId: id, custId: o.custId, route: [whCity, c?.city ?? o.city], at: 0, eta: "4 hr 10 min", status: s === "In Transit" ? "In Transit" : "Dispatched", vehicle: "JH01DK4821", driver: "Sunil Yadav", phone: "98XXXXXX12", transporter: "Eastern Roadways", value: o.value, qty: o.qty, contact: `${c?.contact ?? ""} · ${c?.phone ?? ""}`, pod: "Pending" };
      setShipments((l) => [sh, ...l]);
    } else if (s === "In Transit" || s === "Delivered") {
      setShipments((l) => l.map((x) => (x.orderId === id ? { ...x, status: s === "Delivered" ? "Delivered" : "In Transit", at: s === "Delivered" ? x.route.length - 1 : Math.max(1, x.at), eta: s === "Delivered" ? "Delivered" : x.eta, pod: s === "Delivered" ? `POD-${n + 2100}.pdf` : x.pod } : x)));
    }
    log(`moved ${id} to ${s}`, "Sales Orders", id, `/orders/${id}`);
    toast(`${id} moved to ${s}`, "ok", c?.name);
  };

  const recordPayment: Store["recordPayment"] = (p) => {
    const id = `PAY-${1861 + payments.filter((x) => Number(x.id.slice(4)) > 1860).length}`;
    const pay: Payment = { id, ...p, by: roleDef.person, date: iso(new Date()) };
    setPayments((l) => [pay, ...l]);
    setInvoices((l) => l.map((i) => {
      if (i.id !== p.invoiceId) return i;
      const paid = i.paid + p.amount; const balance = Math.max(0, i.total - paid);
      return { ...i, paid, balance, status: balance === 0 ? "Paid" : new Date(i.due) < NOW ? "Overdue" : "Partially Paid" };
    }));
    setCustomers((l) => l.map((c) => (c.id === p.custId ? { ...c, outstanding: Math.max(0, c.outstanding - p.amount), overdue: Math.max(0, c.overdue - p.amount) } : c)));
    log(`recorded payment ${id} ₹${p.amount.toLocaleString("en-IN")} from ${custById(p.custId)?.name}`, "Payments", id);
    return id;
  };

  const addFollowup: Store["addFollowup"] = (f) => {
    setFollowups((l) => [{ ...f, id: `F${Date.now()}`, by: roleDef.person, ts: iso(new Date()) }, ...l]);
    log(`logged ${f.kind} for ${custById(f.custId)?.name}`, "Receivables", custById(f.custId)?.name ?? "", `/customers/${f.custId}`);
  };
  const addExpense: Store["addExpense"] = (e) => {
    setExpenses((l) => [{ ...e, id: `EXP-${3400 + l.length}`, date: iso(new Date()), by: roleDef.person }, ...l]);
    log(`added ${e.cat} expense ₹${e.amount.toLocaleString("en-IN")}`, "Expenses", e.desc);
  };
  const addCustomer: Store["addCustomer"] = (c) => {
    const id = c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const info = { state: "Jharkhand", territory: "Unassigned" };
    const nc: Customer = { id, code: `DLR-${1001 + customers.length}`, name: c.name, city: c.city, ...info, rep: c.rep, segment: "New", creditLimit: c.creditLimit, outstanding: 0, overdue: 0, oldestDays: 0, lastOrder: iso(NOW), totalSales: 0, orders: 0, behaviour: "Good", since: 2026, avgDelay: 0, phone: "98XXXXXX00", gstin: "—", contact: "—" };
    setCustomers((l) => [nc, ...l]);
    log(`onboarded new dealer ${c.name}`, "Customers", c.name, `/customers/${id}`);
    return id;
  };
  const advanceReturn = (id: string) => {
    setReturns((l) => l.map((r) => (r.id === id && r.stage < 6 ? { ...r, stage: r.stage + 1 } : r)));
    log(`advanced return ${id}`, "Returns", id);
  };
  const advancePO = (id: string) => {
    setPos((l) => l.map((r) => (r.id === id && r.stage < 8 ? { ...r, stage: r.stage + 1 } : r)));
    log(`advanced purchase order ${id}`, "Purchase", id);
  };
  const createPO: Store["createPO"] = (p) => {
    const id = `PO-${5122 + pos.length - 12}`;
    setPos((l) => [{ ...p, id, date: iso(NOW).slice(0, 10), by: roleDef.person, stage: 1 }, ...l]);
    log(`created purchase order ${id}`, "Purchase", id);
    toast(`${id} created`, "ok", `${p.supplier} · sent for supplier confirmation`);
  };
  const advanceDispatch = (id: string) => {
    const d = dispatches.find((x) => x.id === id);
    if (d) {
      const map: Record<string, OrderStatus> = { "Pending Packing": "Packing", Packing: "Ready", Ready: "Dispatched", "Vehicle Assigned": "Dispatched" };
      const next = map[d.status];
      if (next) setOrderStatus(d.orderId, next);
    }
  };
  const setShipmentStatus: Store["setShipmentStatus"] = (id, status, note) => {
    const sh = shipments.find((x) => x.id === id);
    if (!sh) return;
    if (status === "Delivered") { setOrderStatus(sh.orderId, "Delivered"); return; }
    setShipments((l) => l.map((x) => (x.id === id ? { ...x, status, note: note ?? x.note, at: status === "Reached Hub" ? Math.min(x.route.length - 2, x.at + 1) : status === "Out For Delivery" ? x.route.length - 2 : x.at } : x)));
    log(`updated shipment ${id} to ${status}`, "Shipments", id, `/shipments/${id}`);
    toast(`${id} marked ${status}`, status === "Issue" || status === "Delayed" ? "info" : "ok", custById(sh.custId)?.name);
  };
  const readNotif = (id?: string) => setNotifs((l) => l.map((n) => (!id || n.id === id ? { ...n, unread: false } : n)));
  const setAiOpen = (v: boolean, q?: string) => { setAiOpenS(v); if (q !== undefined) setAiSeed(q); };

  const value: Store = {
    orders, invoices, payments, dispatches, shipments, customers, expenses, followups, returns, notifs, logs, pos,
    role, setRole, ownerMode, setOwnerMode, warehouse, setWarehouse, offline, setOffline, toasts, toast, dismissToast, log, user,
    createOrder, setOrderStatus, advanceOrder, recordPayment, addFollowup, addExpense, addCustomer, advanceReturn, advancePO, createPO,
    advanceDispatch, setShipmentStatus, readNotif, quick, openQuick, aiOpen, setAiOpen, aiSeed, searchOpen, setSearchOpen,
  };
  void sumLines;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
