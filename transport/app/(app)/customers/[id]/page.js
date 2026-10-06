"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import DataTable from "@/components/table";
import { Chip, Kpis, Panel, Tabs, TripChip } from "@/components/ui";
import { Bars } from "@/components/charts";
import { TRIPS, customerById } from "@/data/fleet";
import { routeById } from "@/data/geo";
import { INVOICES, BOOKINGS, PAYMENTS, PODS } from "@/data/ops";
import { full, inr } from "@/lib/format";

const TABS = ["Overview", "Bookings", "Trips", "Invoices", "Payments", "Outstanding", "Rates", "Routes", "POD", "Issues", "Documents"];
export default function Customer360() {
  const { id } = useParams();
  const c = customerById(id);
  const [tab, setTab] = useState("Overview");
  if (!c) return <div className="page"><h1>Customer not found</h1></div>;
  const trips = TRIPS.filter((t) => t.customerId === c.id), inv = INVOICES.filter((i) => i.customerId === c.id), book = BOOKINGS.filter((b) => b.customerId === c.id), pays = PAYMENTS.filter((p) => p.customerId === c.id), pods = PODS.filter((p) => p.customerId === c.id);
  const routes = c.routes.map(routeById);
  const T = (rows, cols, title) => <DataTable rows={rows} cols={cols} title={title} pageSize={8} />;
  const rates = routes.map((r) => ({ ...r, rate: r.id === "R01" ? "₹48/km" : `₹${Math.round(r.rev / r.km)}/km`, min: inr(Math.round(r.rev * 0.8)), detention: "₹1,800/day", loading: "Customer", unloading: "Customer", terms: c.terms }));
  return (
    <div className="page">
      <Link href="/customers" className="faint" style={{ display: "inline-flex", gap: 6, alignItems: "center", marginBottom: 10 }}><ArrowLeft size={13} /> All customers</Link>
      <div style={{ marginBottom: 16 }}><h1 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.03em" }}>{c.name}</h1><div className="muted">{c.industry} · {c.contract} contract · Account manager {c.manager}</div></div>
      <Kpis items={[{ label: "Monthly freight", value: inr(c.monthly) }, { label: "Trips this month", value: c.trips }, { label: "Active trips", value: c.active }, { label: "Outstanding", value: inr(c.outstanding), tone: "r" }, { label: "Avg payment time", value: c.payDays + " days", tone: c.payDays > 40 ? "r" : c.payDays > 30 ? "a" : null }, { label: "Margin", value: c.margin + "%" }]} />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "Overview" && (
        <div className="grid g2" style={{ alignItems: "start" }}>
          <Panel title="Profitability"><dl className="kv"><dt>Revenue (30d)</dt><dd>{inr(c.monthly)}</dd><dt>Trips</dt><dd>{c.trips}</dd><dt>Average rate / trip</dt><dd>{inr(c.monthly / c.trips)}</dd><dt>Cost</dt><dd>{inr(c.monthly * (1 - c.margin / 100))}</dd><dt className="tot">Margin</dt><dd className="tot">{c.margin}%</dd></dl>
            <div className="hr" /><p className="muted" style={{ margin: 0 }}>Average payment takes <b>{c.payDays} days</b> against {c.terms} terms — {c.payDays > parseInt(c.terms) ? `${c.payDays - parseInt(c.terms)} days late on average, tying up ${inr(c.outstanding)}.` : "paying within terms."}</p></Panel>
          <Panel title="Freight by month" sub="₹ Lakh"><Bars data={["May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((m, i) => ({ k: m, v: +(c.monthly / 1e5 * [0.8, 0.88, 0.93, 0.97, 1.02, 1][i]).toFixed(1) }))} fmt={(v) => v + "L"} highlight={5} /></Panel>
        </div>
      )}
      {tab === "Bookings" && T(book.length ? book : BOOKINGS.slice(0, 5), [{ key: "id", label: "Booking" }, { key: "r", label: "Route", render: (b) => `${b.from} → ${b.to}` }, { key: "material", label: "Material" }, { key: "weight", label: "MT" }, { key: "freight", label: "Freight", right: true, render: (b) => full(b.freight) }, { key: "rateType", label: "Rate type" }], "Bookings")}
      {tab === "Trips" && T(trips.length ? trips : TRIPS.slice(0, 6), [{ key: "id", label: "Trip", render: (t) => <Link className="mono link" href={`/trips/${t.id}`}>{t.id}</Link> }, { key: "r", label: "Route", render: (t) => `${t.from} → ${t.to}` }, { key: "freight", label: "Freight", right: true, render: (t) => full(t.freight) }, { key: "status", label: "Status", render: (t) => <TripChip s={t.status} /> }], "Trips")}
      {(tab === "Invoices" || tab === "Outstanding") && T((inv.length ? inv : INVOICES.slice(0, 6)).filter((i) => tab === "Invoices" || i.balance > 0), [{ key: "id", label: "Invoice" }, { key: "route", label: "Route" }, { key: "total", label: "Total", right: true, render: (i) => full(i.total) }, { key: "balance", label: "Balance", right: true, render: (i) => full(i.balance) }, { key: "due", label: "Due" }, { key: "status", label: "Status", render: (i) => <Chip tone={i.status === "Paid" ? "g" : i.status === "Overdue" ? "r" : "a"}>{i.status}</Chip> }], tab)}
      {tab === "Payments" && T(pays.length ? pays : PAYMENTS.slice(0, 6), [{ key: "id", label: "Payment" }, { key: "date", label: "Date" }, { key: "invoice", label: "Invoice" }, { key: "mode", label: "Mode" }, { key: "amount", label: "Amount", right: true, render: (p) => full(p.amount) }], "Payments")}
      {tab === "Rates" && (
        <Panel title="Rate card" tight><table className="tbl"><thead><tr><th>Route</th><th>Vehicle</th><th className="r">Rate</th><th className="r">Minimum</th><th>Detention</th><th>Loading</th><th>Unloading</th><th>Payment terms</th></tr></thead><tbody>
          {rates.map((r) => <tr key={r.id}><td><b>{r.from} → {r.to}</b></td><td>32 FT</td><td className="r">{r.rate}</td><td className="r">{r.min}</td><td>{r.detention}</td><td>{r.loading}</td><td>{r.unloading}</td><td>{r.terms}</td></tr>)}
        </tbody></table></Panel>
      )}
      {tab === "Routes" && <div className="grid g3">{routes.map((r) => <Panel key={r.id} title={`${r.from} → ${r.to}`}><dl className="kv"><dt>Distance</dt><dd>{r.km} km</dd><dt>Avg revenue</dt><dd>{inr(r.rev)}</dd><dt>Margin</dt><dd>{r.margin.toFixed(1)}%</dd><dt>Delay rate</dt><dd>{r.delay}%</dd></dl></Panel>)}</div>}
      {tab === "POD" && T(pods.length ? pods : PODS.slice(0, 6), [{ key: "tripId", label: "Trip" }, { key: "delivered", label: "Delivered" }, { key: "status", label: "POD status" }, { key: "value", label: "Invoice value", right: true, render: (p) => full(p.value) }], "POD")}
      {tab === "Issues" && <Panel title="Open issues"><div style={{ display: "grid", gap: 10 }}>{["Detention charge disputed for TRP-9770 (3 days)", "Short delivery claim — 2 cartons damaged, TRP-9744", "Request: dedicated vehicle for Patna route from November"].map((x) => <div key={x} style={{ display: "flex", gap: 8 }}><Chip tone="a">Open</Chip>{x}</div>)}</div></Panel>}
      {tab === "Documents" && <Panel title="Documents" tight><table className="tbl"><tbody>{[["Master Service Agreement", "Signed · valid to Mar 2027"], ["Rate contract FY 26-27", "Signed · valid to Mar 2027"], ["GST certificate", "Verified"], ["Credit approval", "₹25L limit · reviewed Jul 2026"]].map(([a, b]) => <tr key={a}><td><b>{a}</b></td><td>{b}</td></tr>)}</tbody></table></Panel>}
    </div>
  );
}
