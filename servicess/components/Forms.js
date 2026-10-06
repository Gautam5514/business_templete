"use client";
import { useState } from "react";
import { ClipboardList, Briefcase, CalendarPlus, UserPlus, Cpu, FileText, Receipt, CreditCard, Package, ShieldCheck } from "lucide-react";
import { Field, Modal } from "./ui";
import { CUSTOMERS, ASSETS, TECHS } from "@/data/core";
import { JOBS, SOURCES } from "@/data/ops";

const cust = CUSTOMERS.slice(0, 24).map((c) => c.name);
const F = (label, type = "text", opts, span) => ({ label, type, opts, span });
const cats = ["AC Service", "CCTV", "RO / Water Purifier", "Electrical", "Appliance Repair", "Facility Maintenance", "Installation Project"];

export const QUICK = {
  "New Service Request": { icon: ClipboardList, hint: "Log a customer enquiry", done: "SR-5878 created · auto-classified as High · SLA 4h started", fields: [F("Customer", "select", cust, 2), F("Category", "select", cats), F("Source", "select", SOURCES), F("Issue description", "textarea", null, 2), F("Priority", "select", ["Emergency", "High", "Normal"]), F("Location / floor")] },
  "Create Job": { icon: Briefcase, hint: "Convert a request into a job", done: "JOB-2870 created and added to the dispatch queue", fields: [F("Service request", "select", ["SR-5842", "SR-5841", "SR-5838"]), F("Asset", "select", ASSETS.slice(0, 12).map((a) => a.id)), F("Required skill", "select", ["Commercial AC", "Residential AC", "CCTV", "RO / Water", "Electrical", "Appliance"]), F("Scheduled for", "date")] },
  "Schedule Visit": { icon: CalendarPlus, hint: "Preventive or follow-up visit", done: "Visit scheduled · technician and customer notified", fields: [F("Customer", "select", cust, 2), F("Visit type", "select", ["AMC preventive", "Follow-up", "Inspection", "Filter replacement"]), F("Technician", "select", TECHS.slice(0, 16).map((t) => t.name)), F("Date", "date"), F("Time slot", "select", ["09:00–11:00", "11:00–13:00", "14:00–16:00", "16:00–18:00"])] },
  "Add Customer": { icon: UserPlus, hint: "Residential or commercial", done: "Customer added · welcome message sent on WhatsApp", fields: [F("Customer / company name", "text", null, 2), F("Type", "select", ["Residential", "Commercial", "Enterprise", "Institution"]), F("Branch", "select", ["Ranchi", "Dhanbad", "Jamshedpur", "Patna"]), F("Contact person"), F("Phone"), F("Address", "textarea", null, 2)] },
  "Add Asset": { icon: Cpu, hint: "Register equipment under a customer", done: "Asset AC-28990 registered with QR label", fields: [F("Customer", "select", cust, 2), F("Asset type", "select", ["AC", "RO", "CCTV Camera", "DVR", "Geyser", "Refrigerator", "Electrical Panel", "Generator", "UPS"]), F("Brand"), F("Model"), F("Serial number"), F("Installation date", "date")] },
  "Create Estimate": { icon: FileText, hint: "Parts + labour quotation", done: "Estimate EST-4411 created · ready to send", fields: [F("Job", "select", JOBS.slice(0, 20).map((j) => j.id)), F("Part cost (₹)", "number"), F("Labour (₹)", "number"), F("Gas / consumables (₹)", "number"), F("Visit charge (₹)", "number")] },
  "Create Invoice": { icon: Receipt, hint: "Single job or monthly consolidated", done: "Invoice INV-26/4182 created", fields: [F("Customer", "select", cust, 2), F("Invoice type", "select", ["Single job", "Monthly consolidated"]), F("Jobs", "text", null, 2)] },
  "Record Payment": { icon: CreditCard, hint: "Cash, UPI, cheque, transfer", done: "Payment recorded · receipt generated and sent", fields: [F("Customer", "select", cust, 2), F("Amount (₹)", "number"), F("Mode", "select", ["Cash", "UPI", "Card", "Bank Transfer", "Cheque", "Credit", "AMC Included"]), F("Reference"), F("Date", "date")] },
  "Request Part": { icon: Package, hint: "Route through approval", done: "Part request PR-916 sent to supervisor for approval", fields: [F("Job", "select", JOBS.slice(0, 20).map((j) => j.id)), F("Part", "select", ["AC Compressor 1.5 Ton", "RO Membrane 75 GPD", "CP Plus 32-Ch DVR", "Contactor 40A"]), F("Quantity", "number"), F("Urgency", "select", ["Blocking job", "Same day", "Next day"])] },
  "Create AMC": { icon: ShieldCheck, hint: "Contract with visit schedule", done: "AMC-1836 created · 4 preventive visits scheduled", fields: [F("Customer", "select", cust, 2), F("Coverage", "text", null, 2), F("Start", "date"), F("Expiry", "date"), F("Visits included", "number"), F("Contract value (₹)", "number")] },
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
              : <input className="input" type={f.type} />}
          </Field>
        ))}
      </div>
    </Modal>
  );
}
