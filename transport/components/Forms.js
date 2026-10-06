"use client";
import { useState } from "react";
import { ClipboardList, Route, Truck, Fuel, Wallet, AlertTriangle, FileCheck2, Receipt, CreditCard, UserPlus } from "lucide-react";
import { Field, Modal } from "./ui";
import { CUSTOMERS, VEHICLES, DRIVERS, TRIPS } from "@/data/fleet";
import { CITIES } from "@/data/geo";

const cust = CUSTOMERS.slice(0, 20).map((c) => c.name);
const cities = Object.keys(CITIES);
const veh = VEHICLES.slice(0, 40).map((v) => v.id);
const trips = TRIPS.slice(0, 30).map((t) => t.id);
const F = (label, type = "text", opts, span) => ({ label, type, opts, span });

export const QUICK = {
  "New Booking": { icon: ClipboardList, hint: "Customer load request with rate", done: "Booking BK-6157 created · sent for rate approval", fields: [F("Customer", "select", cust, 2), F("Pickup", "select", cities), F("Drop", "select", cities), F("Vehicle type", "select", ["32 FT Multi Axle", "32 FT Single Axle", "20 FT", "Container", "Trailer", "Tipper", "LCV", "Pickup"]), F("Material"), F("Weight (MT)", "number"), F("Quantity"), F("Pickup date", "date"), F("Delivery date", "date"), F("Rate type", "select", ["Per Trip", "Per KM", "Per Ton", "Per Kg", "Contract Rate", "Fixed Monthly"]), F("Freight rate (₹)", "number"), F("Advance (₹)", "number"), F("Special instructions", "textarea", null, 2)] },
  "Create Trip": { icon: Route, hint: "From a confirmed booking", done: "Trip TRP-9840 created", fields: [F("Booking", "select", ["BK-6156", "BK-6155", "BK-6154", "BK-6153"]), F("Vehicle", "select", veh), F("Driver", "select", DRIVERS.slice(0, 20).map((d) => d.name)), F("Planned start", "date"), F("Advance (₹)", "number")] },
  "Assign Vehicle": { icon: Truck, hint: "Match a load to the best vehicle", done: "Vehicle assigned · driver notified on app", fields: [F("Pending load", "select", ["L-4411 · JSW · Jamshedpur → Patna", "L-4412 · Sharma · Ranchi → Dhanbad", "L-4413 · Eastern Steel · Dhanbad → Kolkata"], 2), F("Vehicle", "select", ["JH05BX1188 (Best match)", "JH01CZ6212", "JH10KR3381"]), F("Driver", "select", ["Ravi Kumar", "Manoj Singh"])] },
  "Add Fuel": { icon: Fuel, hint: "Fuel entry with receipt", done: "Fuel entry saved · mileage recalculated", fields: [F("Vehicle", "select", veh), F("Trip", "select", trips), F("Fuel station"), F("Litres", "number"), F("Rate (₹/L)", "number"), F("Odometer", "number"), F("Payment type", "select", ["Fuel card", "Cash", "Credit"]), F("Receipt", "file")] },
  "Record Expense": { icon: Wallet, hint: "Toll, loading, repair, parking…", done: "Expense recorded and attached to trip P&L", fields: [F("Category", "select", ["Fuel", "Toll", "Parking", "Loading", "Unloading", "Repair", "Food", "Police / Checkpost", "Other"]), F("Trip", "select", trips), F("Amount (₹)", "number"), F("Receipt", "file"), F("Notes", "textarea", null, 2)] },
  "Report Breakdown": { icon: AlertTriangle, hint: "Start a breakdown flow", done: "BD-1185 opened · fleet manager alerted", fields: [F("Vehicle", "select", veh), F("Location"), F("Issue", "select", ["Clutch failure", "Tyre burst", "Engine", "Brake", "Electrical", "Body damage", "Other"]), F("Severity", "select", ["Low", "Medium", "High", "Critical"]), F("Notes", "textarea", null, 2)] },
  "Upload POD": { icon: FileCheck2, hint: "Proof of delivery for a trip", done: "POD uploaded · sent for verification", fields: [F("Trip", "select", ["TRP-9796", "TRP-9791", "TRP-9788"]), F("Receiver name"), F("POD photo", "file"), F("Notes", "textarea", null, 2)] },
  "Create Invoice": { icon: Receipt, hint: "Freight invoice for a delivered trip", done: "Invoice EFL/25-26/04230 created", fields: [F("Trip", "select", ["TRP-9790", "TRP-9788", "TRP-9785"]), F("Detention (₹)", "number"), F("Loading (₹)", "number"), F("Other charges (₹)", "number")] },
  "Record Payment": { icon: CreditCard, hint: "Customer receipt", done: "Payment recorded · invoices reconciled", fields: [F("Customer", "select", cust, 2), F("Amount (₹)", "number"), F("Mode", "select", ["NEFT", "RTGS", "UPI", "Cheque"]), F("Reference / UTR"), F("Date", "date")] },
  "Add Driver": { icon: UserPlus, hint: "Onboard with documents", done: "Driver added · documents pending verification", fields: [F("Full name", "text", null, 2), F("Phone"), F("Experience (yrs)", "number"), F("Licence number"), F("Licence expiry", "date"), F("Aadhaar", "file")] },
};

export default function CreateModal({ kind, onClose, onDone }) {
  const q = QUICK[kind];
  const [busy, setBusy] = useState(false);
  return (
    <Modal open onClose={onClose} title={kind} footer={<>
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn pri" disabled={busy} onClick={() => { setBusy(true); setTimeout(() => onDone(q.done), 450); }}>{busy ? "Saving…" : "Save"}</button>
    </>}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {q.fields.map((f) => (
          <Field key={f.label} label={f.label} span={f.span}>
            {f.type === "select" ? <select className="select"><option>Select…</option>{f.opts.map((o) => <option key={o}>{o}</option>)}</select>
              : f.type === "textarea" ? <textarea className="input" rows={3} />
              : f.type === "file" ? <input className="input" type="file" style={{ paddingTop: 5 }} />
              : <input className="input" type={f.type} />}
          </Field>
        ))}
      </div>
    </Modal>
  );
}
