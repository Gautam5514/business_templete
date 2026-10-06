"use client";
import { useState } from "react";
import DataTable from "@/components/table";
import { Chip, Insight, Kpis, PageHead, Panel, Plate, VehChip } from "@/components/ui";
import { VENDORS } from "@/data/ops";
import { VEHICLES, driverById } from "@/data/fleet";
import { full, inr } from "@/lib/format";

export default function Vendors() {
  const [sel, setSel] = useState(VENDORS[0]);
  const attached = VEHICLES.filter((v) => v.ownership === "Attached");
  const payable = VENDORS.reduce((a, v) => a + v.payable, 0);
  return (
    <div className="page">
      <PageHead title="Vendor Vehicles" sub="42 attached trucks from 5 transport vendors — rates, trips, payables and compliance."><button className="btn pri">Add vendor</button></PageHead>
      <Insight tone="a"><b>{inr(payable)} is payable to vendors</b> this cycle. Attached trucks earn the company ≈ 24% margin on average — {VENDORS.find((v) => v.docs !== "Valid")?.name} has a document expiring this month.</Insight>
      <Kpis items={[{ label: "Attached vehicles", value: 42 }, { label: "Vendors", value: VENDORS.length }, { label: "Trips this month", value: VENDORS.reduce((a, v) => a + v.trips, 0) }, { label: "Payable", value: inr(payable), tone: "a" }, { label: "Avg company margin", value: "24%" }]} />
      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) 380px", alignItems: "start", marginBottom: 14 }}>
        <DataTable rows={VENDORS} title="Vendors" pageSize={6} onRow={setSel}
          cols={[{ key: "name", label: "Vendor", render: (v) => <b>{v.name}</b> }, { key: "owner", label: "Owner" }, { key: "vehicles", label: "Vehicles", right: true }, { key: "rate", label: "Rate", right: true }, { key: "trips", label: "Trips (mo)", right: true }, { key: "payable", label: "Payable", right: true, render: (v) => inr(v.payable) }, { key: "docs", label: "Documents", render: (v) => <Chip tone={v.docs === "Valid" ? "g" : "a"}>{v.docs}</Chip> }, { key: "perf", label: "Performance", right: true, render: (v) => v.perf + "%" }]} />
        <Panel title="Vendor settlement" sub="sample trip · TRP-9801">
          <dl className="kv"><dt>Revenue from customer</dt><dd>₹78,000</dd><dt>Vendor freight</dt><dd>₹52,000</dd><dt>Toll reimbursed</dt><dd>₹4,200</dd><dt>Advance paid</dt><dd>−₹20,000</dd><dt className="tot">Balance payable</dt><dd className="tot">₹36,200</dd></dl>
          <div style={{ marginTop: 12, padding: 12, background: "var(--green-soft)", borderRadius: 8, display: "flex", justifyContent: "space-between" }}><span className="lbl">Company margin</span><b className="pos" style={{ fontSize: 18 }}>₹21,800</b></div>
        </Panel>
      </div>
      <Panel title={`${sel.name} · attached trucks`} tight>
        <table className="tbl"><thead><tr><th>Vehicle</th><th>Owner</th><th>Driver</th><th>Status</th><th>Current trip</th><th className="r">Monthly revenue</th></tr></thead><tbody>
          {attached.filter((v) => v.vendor === sel.name).slice(0, 8).map((v) => <tr key={v.id}><td><Plate id={v.id} /></td><td>{sel.owner}</td><td>{driverById(v.driverId)?.name}</td><td><VehChip s={v.status} sub={v.sub} /></td><td className="mono">{v.tripId || "—"}</td><td className="r">{inr(v.revenue)}</td></tr>)}
        </tbody></table>
      </Panel>
    </div>
  );
}
