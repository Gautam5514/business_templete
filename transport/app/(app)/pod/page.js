"use client";
import Link from "next/link";
import { useState } from "react";
import { MapPin, PenLine, Stamp, Camera } from "lucide-react";
import DataTable from "@/components/table";
import { Chip, Drawer, Insight, Kpis, PageHead, Panel } from "@/components/ui";
import { PODS, POD_BLOCKED, POD_STATUS } from "@/data/ops";
import { customerById, driverById, tripById } from "@/data/fleet";
import { full, inr } from "@/lib/format";
import { useApp } from "@/lib/store";

const tone = { Pending: "r", Uploaded: "b", "Under Verification": "a", Approved: "g", Rejected: "r", "Original Required": "a" };
export default function Pod() {
  const { notify } = useApp();
  const [sel, setSel] = useState(null);
  const counts = Object.fromEntries(POD_STATUS.map((s) => [s, PODS.filter((p) => p.status === s).length]));
  const t = sel && tripById(sel.tripId);
  return (
    <div className="page">
      <PageHead title="Proof of Delivery" sub="No POD, no invoice. Track every delivery document from upload to original receipt."><button className="btn pri">Upload POD</button></PageHead>
      <Insight tone="r"><b>{POD_BLOCKED.count} PODs are pending, blocking {inr(POD_BLOCKED.value)} worth of invoicing.</b> The oldest has been missing for {POD_BLOCKED.oldest} days — POD delays are preventing ₹18.4L from being invoiced, adding ≈ 11 days to your collection cycle.</Insight>
      <div className="kpis">
        {POD_STATUS.map((s) => <div key={s} className="kpi"><div className="lbl">{s}</div><div className="v" style={{ color: s === "Pending" ? "var(--red)" : undefined }}>{s === "Approved" ? 412 : s === "Pending" ? counts[s] : counts[s] + 2}</div></div>)}
      </div>
      <DataTable rows={PODS} title="POD" onRow={setSel} initialView={0}
        views={[{ name: "All" }, { name: "Blocking invoices", filter: (p) => p.invoice === "Blocked" }, { name: "Pending", filter: (p) => p.status === "Pending" }, { name: "Original required", filter: (p) => p.status === "Original Required" }]}
        cols={[{ key: "tripId", label: "Trip", render: (p) => <Link className="mono link" href={`/trips/${p.tripId}`} onClick={(e) => e.stopPropagation()}>{p.tripId}</Link> }, { key: "customer", label: "Customer", render: (p) => customerById(p.customerId).short, csv: (p) => customerById(p.customerId).short },
          { key: "delivered", label: "Delivered Date" }, { key: "uploaded", label: "POD Uploaded", render: (p) => (p.uploaded ? <Chip tone="g">Yes</Chip> : <Chip tone="r">No</Chip>) }, { key: "original", label: "Original Received", render: (p) => (p.original ? "Yes" : <span className="faint">No</span>) },
          { key: "status", label: "Status", render: (p) => <Chip tone={tone[p.status]} dot>{p.status}</Chip> }, { key: "invoice", label: "Invoice Status", render: (p) => <Chip tone={p.invoice === "Blocked" ? "r" : p.invoice === "In review" ? "a" : "g"}>{p.invoice}</Chip> },
          { key: "value", label: "Value", right: true, render: (p) => inr(p.value) }, { key: "driver", label: "Driver", render: (p) => driverById(p.driverId)?.name, csv: (p) => driverById(p.driverId)?.name }, { key: "age", label: "Age", right: true, render: (p) => <span className={p.age > 4 && p.status !== "Approved" ? "neg" : ""}>{p.age}d</span> }]} />
      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel ? `POD · ${sel.tripId}` : ""} sub={sel && `${t.from} → ${t.to}`} wide
        footer={sel && sel.status !== "Approved" && <><button className="btn" onClick={() => { notify("Reminder sent to driver"); setSel(null); }}>Remind driver</button><button className="btn pri" onClick={() => { notify("POD approved · invoice released"); setSel(null); }}>Approve & release invoice</button></>}>
        {sel && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "flex", gap: 8 }}><Chip tone={tone[sel.status]} dot>{sel.status}</Chip><Chip tone={sel.invoice === "Blocked" ? "r" : "g"}>Invoice {sel.invoice.toLowerCase()}</Chip></div>
            <dl className="kv"><dt>Customer</dt><dd>{customerById(sel.customerId).name}</dd><dt>Delivery location</dt><dd>{t.to} consignee yard</dd><dt>Receiver</dt><dd>Mukesh Prasad (store-in-charge)</dd><dt>Invoice value</dt><dd>{full(sel.value)}</dd><dt>Timestamp</dt><dd>{sel.delivered} · 04:42 PM</dd><dt>GPS</dt><dd className="mono">{(20 + t.km / 40).toFixed(4)}° N, {(85 + t.km / 300).toFixed(4)}° E</dd></dl>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[[Camera, "Delivery photo"], [PenLine, "Receiver signature"], [Stamp, "Company stamp"], [MapPin, "Geo-tag verified"]].map(([I, l]) => (
                <div key={l} className="drop" style={{ height: 120, display: "grid", placeItems: "center", textAlign: "center", color: sel.uploaded ? "var(--ink2)" : "var(--ink3)", background: "var(--panel2)" }}><div><I size={22} style={{ margin: "0 auto 6px" }} /><div style={{ fontSize: 12 }}>{l}</div><div style={{ fontSize: 11 }} className={sel.uploaded ? "pos" : "neg"}>{sel.uploaded ? "✓ captured" : "not uploaded"}</div></div></div>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
