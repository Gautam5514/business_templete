"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import DataTable from "@/components/table";
import { Avatar, Chip, Kpis, Panel, Prog, Tabs, TripChip } from "@/components/ui";
import { Ring, LineChart } from "@/components/charts";
import { TRIPS, driverById, vehicleById } from "@/data/fleet";
import { EXPENSES } from "@/data/ops";
import { full } from "@/lib/format";

const TABS = ["Overview", "Documents", "Trip history", "Expense history", "Attendance", "Performance", "Settlement"];
export default function Driver360() {
  const { id } = useParams();
  const d = driverById(id);
  const [tab, setTab] = useState("Overview");
  if (!d) return <div className="page"><h1>Driver not found</h1></div>;
  const v = vehicleById(d.vehicleId);
  const trips = TRIPS.filter((t) => t.driverId === d.id);
  const exp = EXPENSES.filter((e) => e.driverId === d.id);
  const parts = [["On-Time Delivery", d.parts.ontime], ["Fuel Efficiency", d.parts.fuel], ["Safety", d.parts.safety], ["Document Compliance", d.parts.docs], ["Customer Feedback", d.parts.feedback]];
  const docs = [["Driving License", d.licenseExpiry, d.licenseDays], ["Aadhaar", "Verified", 9999], ["Medical fitness", "14 Mar 2027", 520], ["Training (defensive driving)", "Completed Aug 2026", 9999], ["Police verification", "Verified", 9999]];
  const DocChip = ({ days }) => (days < 45 ? <Chip tone="r">Expires in {days} days</Chip> : <Chip tone="g"><Check size={11} /> Valid</Chip>);
  return (
    <div className="page">
      <Link href="/drivers" className="faint" style={{ display: "inline-flex", gap: 6, alignItems: "center", marginBottom: 10 }}><ArrowLeft size={13} /> All drivers</Link>
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
        <Avatar name={d.name} size={54} />
        <div style={{ flex: 1 }}><h1 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.03em" }}>{d.name}</h1><div className="muted">{d.exp} years experience · {d.phone} · {v && <Link className="mono link" href={`/vehicles/${v.id}`}>{v.id}</Link>}</div></div>
        <button className="btn">Call</button><button className="btn pri">Message on app</button>
      </div>
      <Kpis items={[{ label: "Trips completed", value: d.trips }, { label: "This month", value: d.month }, { label: "On-time delivery", value: d.ontime + "%" }, { label: "Average mileage", value: d.mileage + " km/L" }, { label: "Incidents", value: d.incidents, tone: d.incidents > 2 ? "r" : null }, { label: "Customer rating", value: d.rating + " / 5" }]} />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "Overview" && (
        <div className="grid" style={{ gridTemplateColumns: "340px minmax(0,1fr)", alignItems: "start" }}>
          <Panel title="Driver score">
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><Ring value={d.score} size={160} label={d.score} sub="out of 100" tone={d.score >= 85 ? "green" : d.score >= 70 ? "amber" : "red"} /></div>
            <div style={{ display: "grid", gap: 10 }}>{parts.map(([k, val]) => <div key={k}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}><span className="muted">{k}</span><b>{val}</b></div><Prog v={val} tone={val >= 90 ? "g" : val >= 75 ? "" : "a"} /></div>)}</div>
          </Panel>
          <div style={{ display: "grid", gap: 14 }}>
            <Panel title="Fuel efficiency vs fleet" sub="km/L · 8 weeks"><LineChart labels={["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]} series={[{ name: d.name, data: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => +(d.mileage + Math.sin(i * 1.7) * 0.12).toFixed(2)), color: "green" }, { name: "Fleet", data: Array(8).fill(4.0), color: "ink", dash: true }]} height={160} fmt={(x) => x.toFixed(1)} area={false} /></Panel>
            <Panel title="Documents" tight><table className="tbl"><tbody>{docs.map(([a, b, days]) => <tr key={a}><td><b>{a}</b></td><td>{b}</td><td style={{ textAlign: "right" }}><DocChip days={days} /></td></tr>)}</tbody></table></Panel>
          </div>
        </div>
      )}
      {tab === "Documents" && <Panel tight><table className="tbl"><thead><tr><th>Document</th><th>Detail</th><th>Status</th></tr></thead><tbody>{docs.map(([a, b, days]) => <tr key={a}><td><b>{a}</b></td><td>{b}</td><td><DocChip days={days} /></td></tr>)}</tbody></table></Panel>}
      {tab === "Trip history" && <DataTable rows={trips.length ? trips : TRIPS.slice(0, 6)} title="Trips" pageSize={8} cols={[{ key: "id", label: "Trip", render: (t) => <Link className="mono link" href={`/trips/${t.id}`}>{t.id}</Link> }, { key: "r", label: "Route", render: (t) => `${t.from} → ${t.to}` }, { key: "customer", label: "Customer", render: (t) => t.customer.short }, { key: "freight", label: "Freight", right: true, render: (t) => full(t.freight) }, { key: "status", label: "Status", render: (t) => <TripChip s={t.status} /> }]} />}
      {tab === "Expense history" && <DataTable rows={exp.length ? exp : EXPENSES.slice(0, 8)} title="Driver expenses" cols={[{ key: "date", label: "Date" }, { key: "cat", label: "Category" }, { key: "tripId", label: "Trip" }, { key: "amount", label: "Amount", right: true, render: (e) => full(e.amount) }, { key: "receipt", label: "Receipt", render: (e) => (e.receipt ? <Chip tone="g">Attached</Chip> : <Chip tone="r">Missing</Chip>) }]} />}
      {tab === "Attendance" && <Panel title="October attendance" sub={`${d.attendance}% present`}><div style={{ display: "grid", gridTemplateColumns: "repeat(15,1fr)", gap: 6 }}>{Array.from({ length: 30 }, (_, i) => <div key={i} style={{ aspectRatio: "1", borderRadius: 5, display: "grid", placeItems: "center", fontSize: 11, background: i > 5 ? "var(--grey-soft)" : (i * 7 + d.score) % 11 === 0 ? "var(--red-soft)" : "var(--green-soft)", color: i > 5 ? "var(--ink3)" : "var(--ink2)" }}>{i + 1}</div>)}</div></Panel>}
      {tab === "Performance" && <div className="grid g2"><Panel title="Delivery performance"><dl className="kv"><dt>On-time delivery</dt><dd>{d.ontime}%</dd><dt>Avg delay when late</dt><dd>47 min</dd><dt>Customer rating</dt><dd>{d.rating} / 5</dd><dt>Trips (12 months)</dt><dd>{d.month * 11}</dd></dl></Panel><Panel title="Safety"><dl className="kv"><dt>Incidents</dt><dd>{d.incidents}</dd><dt>Harsh braking / 100 km</dt><dd>0.8</dd><dt>Overspeed events (30d)</dt><dd>3</dd><dt>Continuous driving &gt; 5h</dt><dd>2</dd></dl></Panel></div>}
      {tab === "Settlement" && <Panel title="Driver advance & settlement" sub="last closed trip"><dl className="kv" style={{ maxWidth: 420 }}><dt>Trip advance</dt><dd>₹15,000</dd><dt>Expenses submitted</dt><dd>₹11,420</dd><dt>Cash returned</dt><dd>₹2,400</dd><dt className="tot">Pending</dt><dd className="tot warn">₹1,180</dd></dl><div className="hr" /><div className="lbl" style={{ marginBottom: 8 }}>Attached receipts</div><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{["Fuel · ₹5,460", "Toll · ₹1,240", "Loading · ₹1,200", "Food · ₹820"].map((r) => <div key={r} className="drop" style={{ padding: "26px 14px", textAlign: "center", fontSize: 12 }}>🧾 {r}</div>)}</div></Panel>}
    </div>
  );
}
