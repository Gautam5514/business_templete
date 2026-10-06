"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Btn, Field, Input, Modal, Select, Textarea } from "@/components/ui/ui";
import { CITIES, PRODUCTS, SALES_REPS, WAREHOUSES, custName } from "@/data/core";
import { SUPPLIERS } from "@/data/misc";
import { EXP_CATS } from "@/data/misc";
import { inr } from "@/lib/format";
import type { PayMethod } from "@/types";

export function RecordPaymentModal({ open, onClose, custId: c0, invoiceId: i0 }: { open: boolean; onClose: () => void; custId?: string; invoiceId?: string }) {
  const { customers, invoices, recordPayment, toast } = useStore();
  const withBal = invoices.filter((i) => i.balance > 0);
  const initCust = c0 ?? (i0 ? invoices.find((i) => i.id === i0)?.custId : undefined) ?? "sharma-hardware";
  const [cust, setCust] = useState(initCust);
  const list = withBal.filter((i) => i.custId === cust);
  const [inv, setInv] = useState(i0 ?? list[0]?.id ?? "");
  const cur = withBal.find((i) => i.id === inv) ?? list[0];
  const [amt, setAmt] = useState<string>("");
  const [method, setMethod] = useState<PayMethod>("NEFT");
  const [ref, setRef] = useState("");
  const [notes, setNotes] = useState("");
  const amount = Number(amt || cur?.balance || 0);
  const custOptions = Array.from(new Set(withBal.map((i) => i.custId)));
  const changeCust = (c: string) => { setCust(c); const l = withBal.filter((i) => i.custId === c); setInv(l[0]?.id ?? ""); setAmt(""); };
  const submit = () => {
    if (!cur || amount <= 0) return toast("Enter a valid amount", "bad");
    if (amount > cur.balance) return toast(`Amount exceeds invoice balance (${inr(cur.balance)})`, "bad");
    const id = recordPayment({ custId: cust, invoiceId: cur.id, amount, method, ref: ref || `${method.toUpperCase()}-DEMO`, notes });
    toast(`Payment ${id} recorded`, "ok", `${inr(amount)} from ${custName(cust)} · ${cur.id}`);
    onClose();
  };
  void customers;
  return (
    <Modal open={open} onClose={onClose} title="Record payment" sub="Posts against an open invoice and updates outstanding instantly." footer={<><Btn onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={submit}>Record payment</Btn></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Customer" className="sm:col-span-2"><Select value={cust} onChange={(e) => changeCust(e.target.value)}>{custOptions.map((c) => <option key={c} value={c}>{custName(c)}</option>)}</Select></Field>
        <Field label="Invoice" className="sm:col-span-2">
          <Select value={cur?.id ?? ""} onChange={(e) => { setInv(e.target.value); setAmt(""); }}>
            {list.length === 0 && <option>No open invoices</option>}
            {list.map((i) => <option key={i.id} value={i.id}>{i.id} · balance {inr(i.balance)} · {i.status}</option>)}
          </Select>
        </Field>
        <Field label="Amount (₹)" hint={cur ? `Invoice balance ${inr(cur.balance)}` : undefined}><Input type="number" value={amt || (cur?.balance ?? "")} onChange={(e) => setAmt(e.target.value)} /></Field>
        <Field label="Method"><Select value={method} onChange={(e) => setMethod(e.target.value as PayMethod)}>{["Cash", "Bank Transfer", "UPI", "Cheque", "NEFT", "RTGS", "Credit Adjustment"].map((m) => <option key={m}>{m}</option>)}</Select></Field>
        <Field label="Reference number" className="sm:col-span-2"><Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="UTR / cheque no. / UPI ref" /></Field>
        <Field label="Notes" className="sm:col-span-2"><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      </div>
    </Modal>
  );
}

export function QuickModals() {
  const { quick, openQuick, addCustomer, addExpense, createPO, orders, advanceDispatch, dispatches, toast, log } = useStore();
  const router = useRouter();
  const close = () => openQuick(null);

  const [nc, setNc] = useState({ name: "", city: "Ranchi", limit: "500000", rep: SALES_REPS[0] });
  const [ex, setEx] = useState({ cat: EXP_CATS[0], amount: "", desc: "", wh: "Ranchi" });
  const [po, setPo] = useState({ supplier: SUPPLIERS[0].name, items: "", value: "", wh: "Ranchi" });
  const [tr, setTr] = useState({ sku: PRODUCTS[0].sku, from: "RNC", to: "DHN", qty: "200" });
  const ready = orders.filter((o) => ["Stock Allocated", "Packing", "Ready"].includes(o.status));
  const [dsOrder, setDsOrder] = useState("");

  if (quick === "order") { close(); router.push("/orders/new"); return null; }

  return (
    <>
      <Modal open={quick === "customer"} onClose={close} title="New customer / dealer" footer={<><Btn onClick={close}>Cancel</Btn><Btn variant="primary" onClick={() => {
        if (!nc.name.trim()) return toast("Dealer name is required", "bad");
        const id = addCustomer({ name: nc.name.trim(), city: nc.city, creditLimit: Number(nc.limit), rep: nc.rep });
        toast("Dealer onboarded", "ok", `${nc.name} · credit limit ${inr(Number(nc.limit))}`);
        close(); router.push(`/customers/${id}`);
      }}>Create dealer</Btn></>}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Business name" className="sm:col-span-2"><Input value={nc.name} onChange={(e) => setNc({ ...nc, name: e.target.value })} placeholder="e.g. Shree Ram Hardware" autoFocus /></Field>
          <Field label="City"><Select value={nc.city} onChange={(e) => setNc({ ...nc, city: e.target.value })}>{Object.keys(CITIES).map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Assigned salesperson"><Select value={nc.rep} onChange={(e) => setNc({ ...nc, rep: e.target.value })}>{SALES_REPS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Credit limit (₹)"><Input type="number" value={nc.limit} onChange={(e) => setNc({ ...nc, limit: e.target.value })} /></Field>
        </div>
      </Modal>

      <RecordPaymentModal key={quick === "payment" ? "o" : "c"} open={quick === "payment"} onClose={close} />

      <Modal open={quick === "dispatch"} onClose={close} title="Create dispatch" sub="Move an order forward in the dispatch queue." footer={<><Btn onClick={close}>Cancel</Btn><Btn variant="primary" onClick={() => {
        const o = ready.find((x) => x.id === (dsOrder || ready[0]?.id));
        const d = dispatches.find((x) => x.orderId === o?.id);
        if (!o || !d) return toast("No order available", "bad");
        advanceDispatch(d.id); close(); router.push(`/dispatch/${d.id}`);
      }}>Advance dispatch</Btn></>}>
        <Field label="Order">
          <Select value={dsOrder || ready[0]?.id} onChange={(e) => setDsOrder(e.target.value)}>{ready.map((o) => <option key={o.id} value={o.id}>{o.id} · {custName(o.custId)} · {o.status} · {inr(o.value)}</option>)}</Select>
        </Field>
      </Modal>

      <Modal open={quick === "expense"} onClose={close} title="Add expense" footer={<><Btn onClick={close}>Cancel</Btn><Btn variant="primary" onClick={() => {
        if (!Number(ex.amount) || !ex.desc.trim()) return toast("Amount and description are required", "bad");
        addExpense({ cat: ex.cat, amount: Number(ex.amount), desc: ex.desc, wh: ex.wh, mode: "Bank Transfer" });
        toast("Expense added", "ok", `${ex.cat} · ${inr(Number(ex.amount))}`); close(); setEx({ ...ex, amount: "", desc: "" });
      }}>Save expense</Btn></>}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Category"><Select value={ex.cat} onChange={(e) => setEx({ ...ex, cat: e.target.value })}>{EXP_CATS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Amount (₹)"><Input type="number" value={ex.amount} onChange={(e) => setEx({ ...ex, amount: e.target.value })} /></Field>
          <Field label="Description" className="sm:col-span-2"><Input value={ex.desc} onChange={(e) => setEx({ ...ex, desc: e.target.value })} placeholder="e.g. Diesel — JH01DK4821" /></Field>
          <Field label="Location"><Select value={ex.wh} onChange={(e) => setEx({ ...ex, wh: e.target.value })}>{WAREHOUSES.map((w) => <option key={w.id}>{w.city}</option>)}</Select></Field>
        </div>
      </Modal>

      <Modal open={quick === "po"} onClose={close} title="Create purchase order" footer={<><Btn onClick={close}>Cancel</Btn><Btn variant="primary" onClick={() => {
        if (!po.items.trim() || !Number(po.value)) return toast("Items and value are required", "bad");
        createPO({ supplier: po.supplier, items: po.items, value: Number(po.value), wh: po.wh, eta: new Date(Date.now() + 8 * 864e5).toISOString().slice(0, 10) });
        close(); router.push("/purchase");
      }}>Create PO</Btn></>}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Supplier" className="sm:col-span-2"><Select value={po.supplier} onChange={(e) => setPo({ ...po, supplier: e.target.value })}>{SUPPLIERS.map((s) => <option key={s.name}>{s.name}</option>)}</Select></Field>
          <Field label="Items" className="sm:col-span-2"><Input value={po.items} onChange={(e) => setPo({ ...po, items: e.target.value })} placeholder="e.g. Chrome Basin Mixer · 800 pcs" /></Field>
          <Field label="PO value (₹)"><Input type="number" value={po.value} onChange={(e) => setPo({ ...po, value: e.target.value })} /></Field>
          <Field label="Deliver to"><Select value={po.wh} onChange={(e) => setPo({ ...po, wh: e.target.value })}>{WAREHOUSES.map((w) => <option key={w.id}>{w.city}</option>)}</Select></Field>
        </div>
      </Modal>

      <Modal open={quick === "transfer"} onClose={close} title="Stock transfer" sub="Move stock between warehouses." footer={<><Btn onClick={close}>Cancel</Btn><Btn variant="primary" onClick={() => {
        if (tr.from === tr.to) return toast("Choose different warehouses", "bad");
        const p = PRODUCTS.find((x) => x.sku === tr.sku)!;
        log(`transferred ${tr.qty} × ${p.name} ${tr.from} → ${tr.to}`, "Inventory", `TRF-${211}`, `/products/${p.id}`);
        toast("Transfer created", "ok", `${tr.qty} × ${p.name} · ${tr.from} → ${tr.to}`); close();
      }}>Create transfer</Btn></>}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Product" className="sm:col-span-2"><Select value={tr.sku} onChange={(e) => setTr({ ...tr, sku: e.target.value })}>{PRODUCTS.map((p) => <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>)}</Select></Field>
          <Field label="From"><Select value={tr.from} onChange={(e) => setTr({ ...tr, from: e.target.value })}>{WAREHOUSES.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</Select></Field>
          <Field label="To"><Select value={tr.to} onChange={(e) => setTr({ ...tr, to: e.target.value })}>{WAREHOUSES.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</Select></Field>
          <Field label="Quantity"><Input type="number" value={tr.qty} onChange={(e) => setTr({ ...tr, qty: e.target.value })} /></Field>
        </div>
      </Modal>
    </>
  );
}
