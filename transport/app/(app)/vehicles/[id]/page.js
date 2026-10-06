"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Fragment, useState } from "react";
import { ArrowLeft } from "lucide-react";
import FleetMap, { VehicleCard } from "@/components/FleetMap";
import DataTable from "@/components/table";
import { Avatar, Chip, Insight, Kpis, Panel, Prog, Tabs, TripChip, VehChip } from "@/components/ui";
import { Bars, HBars, LineChart } from "@/components/charts";
import { TRIPS, VEHICLES, vehicleById, driverById, DRIVERS } from "@/data/fleet";
import { FUEL, MAINTENANCE, EXPENSES, docsFor, VEHICLE_MONTHLY, ACTIVITY } from "@/data/ops";
import { full, inr, num, pct } from "@/lib/format";

const TABS = ["Overview", "Live Location", "Trips", "Fuel", "Maintenance", "Expenses", "Documents", "Driver History", "Profitability", "Activity"];
const M6 = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];

export default function Vehicle360() {
  const { id } = useParams();
  const v = vehicleById(id);
  const [tab, setTab] = useState("Overview");
  if (!v) return <div className="page"><h1>Vehicle not found</h1></div>;

  const hero = v.id === "JH01DK4821";
  const d = driverById(v.driverId);
  const mp = VEHICLE_MONTHLY(v);
  const km = hero ? 5480 : v.trips30 * 310, empty = hero ? 1060 : Math.round((km * v.empty) / 100), loaded = km - empty;
  const fuelCost = mp.items[0][1], maint = mp.items[4][1];
  const profit = v.revenue - v.cost;
  const ownSorted = VEHICLES.filter((x) => x.ownership !== "Attached").sort((a, b) => b.profit - a.profit);
  const rankPos = ownSorted.findIndex((x) => x.id === v.id) + 1;
  const trips = TRIPS.filter((t) => t.vehicleId === v.id);
  const docs = docsFor(v);
  const fleetAvgMileage = 4.1;
  const mDelta = ((v.mileage - fleetAvgMileage) / fleetAvgMileage) * 100;
  const revSeries = M6.map((_, i) => Math.round(v.revenue * [0.82, 0.9, 0.86, 0.95, 0.98, 1][i]) / 1e5);
  const costSeries = M6.map((_, i) => Math.round(v.cost * [0.88, 0.92, 0.93, 0.96, 0.97, 1][i]) / 1e5);

  const kpis = [
    { label: "Trips this month", value: v.trips30 }, { label: "Revenue", value: inr(v.revenue) }, { label: "Fuel cost", value: inr(fuelCost) }, { label: "Maintenance", value: inr(maint) },
    { label: "Total cost", value: inr(v.cost) }, { label: "Profit", value: inr(profit), tone: profit < 0 ? "r" : "g", hint: pct((profit / v.revenue) * 100, 1) + " margin" }, { label: "Utilization", value: v.util + "%" }, { label: "Mileage", value: `${v.mileage} km/L`, tone: mDelta < -10 ? "r" : null, hint: `${mDelta >= 0 ? "+" : ""}${mDelta.toFixed(0)}% vs fleet` },
  ];
  return (
    <div className="page">
      <Link href="/vehicles" className="faint" style={{ display: "inline-flex", gap: 6, alignItems: "center", marginBottom: 10 }}><ArrowLeft size={13} /> All vehicles</Link>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}><h1 className="mono" style={{ margin: 0, fontSize: 30, letterSpacing: "-0.03em" }}>{v.id}</h1><VehChip s={v.status} sub={v.sub} /><Chip tone={v.ownership === "Owned" ? "k" : "n"}>{v.ownership}</Chip></div>
          <div className="muted" style={{ marginTop: 3 }}>{v.model} · {v.type} · {v.year} · {v.hub} hub</div>
        </div>
        <div style={{ display: "flex", gap: 22 }}>
          {d && <div style={{ display: "flex", gap: 9, alignItems: "center" }}><Avatar name={d.name} /><div><div className="lbl">Driver</div><Link href={`/drivers/${d.id}`} className="link">{d.name}</Link></div></div>}
          <div><div className="lbl">Current trip</div>{v.tripId ? <Link className="mono link" href={`/trips/${v.tripId}`}>{v.tripId}</Link> : <span className="faint">None</span>}</div>
        </div>
      </div>
      <Kpis items={kpis} />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "Overview" && (
        <div className="grid" style={{ gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)" }}>
          <div style={{ display: "grid", gap: 14 }}>
            <Insight tone={profit < 0 ? "r" : "g"}>{profit < 0 ? <><b>This vehicle lost {inr(-profit)} this month.</b> Empty kilometres ({pct(v.empty, 1)}) and fuel efficiency {Math.abs(mDelta).toFixed(0)}% below fleet average are the main drivers.</> : <><b>This vehicle earned {inr(profit)} profit</b> at {pct((profit / v.revenue) * 100, 1)} margin — ranked #{rankPos} of {ownSorted.length} owned vehicles.</>}</Insight>
            <Panel title="Revenue vs cost" sub="₹ Lakh · 6 months"><LineChart labels={M6} series={[{ name: "Revenue", data: revSeries, color: "ink" }, { name: "Cost", data: costSeries, color: "amber", dash: true }]} fmt={(x) => x.toFixed(1)} /></Panel>
            <Panel title="Cost breakdown" sub="where each rupee of revenue went">
              <HBars items={mp.items.filter((i) => i[1] > 0).map(([k, val]) => ({ k, v: val }))} fmt={inr} />
            </Panel>
          </div>
          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <Panel title="Empty kilometres" actions={<Chip tone={v.empty > 18 ? "a" : "g"}>{pct(hero ? 19.3 : v.empty, 1)}</Chip>}>
              <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", marginBottom: 10 }}><i style={{ width: `${(loaded / km) * 100}%`, background: "var(--ink)" }} /><i style={{ flex: 1, background: "var(--amber)" }} /></div>
              <dl className="kv"><dt>Total KM</dt><dd>{num(km)}</dd><dt>Loaded</dt><dd>{num(loaded)}</dd><dt>Empty</dt><dd>{num(empty)}</dd><dt className="tot">Estimated avoidable cost</dt><dd className="tot warn">{full(hero ? 31800 : empty * 30)}</dd></dl>
            </Panel>
            <Panel title="Mileage" sub="8-week trend"><LineChart labels={["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]} series={[{ name: "km/L", data: hero ? [4.4, 4.38, 4.35, 4.3, 4.1, 3.85, 3.65, 3.54] : [v.mileage + 0.1, v.mileage, v.mileage + 0.05, v.mileage - 0.02, v.mileage + 0.03, v.mileage, v.mileage - 0.04, v.mileage], color: "blue" }]} height={140} fmt={(x) => x.toFixed(2)} />
              <p className="muted" style={{ margin: "6px 0 0", fontSize: 12.5 }}>{hero ? <>Mileage has dropped <b>18%</b> in 8 weeks — possible fuel leakage or an injector/air-filter issue. Adds ≈ ₹11,800/month in fuel.</> : <>Mileage is {Math.abs(mDelta).toFixed(0)}% {mDelta < 0 ? "below" : "above"} the fleet average of {fleetAvgMileage} km/L.</>}</p></Panel>
            <Panel title="Document expiry"><div style={{ display: "grid", gap: 7 }}>{docs.filter((x) => x.days < 60).slice(0, 4).map((x) => <div key={x.type} style={{ display: "flex", justifyContent: "space-between" }}><span>{x.type}</span><Chip tone={x.tone}>expires in {x.days} days</Chip></div>)}{!docs.some((x) => x.days < 60) && <span className="faint">All documents valid for 60+ days.</span>}</div></Panel>
          </div>
        </div>
      )}

      {tab === "Live Location" && (
        <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) 300px" }}>
          <div style={{ position: "relative", height: 460 }}><FleetMap vehicles={[v]} selectedId={null} fillParent fitRoute={v.tripId ? TRIPS.find((t) => t.id === v.tripId)?.route : undefined} focusRoute={v.tripId ? TRIPS.find((t) => t.id === v.tripId)?.route : undefined} cardAnchor={false} showAllRoutes={false} /></div>
          <div className="map" style={{ position: "static", height: "auto" }}><VehicleCard v={v} style={{ position: "static", width: "auto", border: 0, boxShadow: "none" }} /></div>
        </div>
      )}

      {tab === "Trips" && <DataTable rows={trips.length ? trips : TRIPS.slice(0, 6)} title="Trips" pageSize={8} cols={[
        { key: "id", label: "Trip", render: (t) => <Link className="mono link" href={`/trips/${t.id}`}>{t.id}</Link> }, { key: "r", label: "Route", render: (t) => `${t.from} → ${t.to}` }, { key: "customer", label: "Customer", render: (t) => t.customer.short },
        { key: "freight", label: "Freight", right: true, render: (t) => full(t.freight) }, { key: "status", label: "Status", render: (t) => <TripChip s={t.status} /> }, { key: "profit", label: "Profit", right: true, render: (t) => inr(t.profit) }]} />}

      {tab === "Fuel" && <DataTable rows={FUEL.filter((f) => f.vehicleId === v.id).length ? FUEL.filter((f) => f.vehicleId === v.id) : FUEL.slice(0, 6).map((f) => ({ ...f, vehicleId: v.id }))} title="Fuel" pageSize={8} cols={[
        { key: "date", label: "Date" }, { key: "station", label: "Station" }, { key: "litres", label: "Litres", right: true }, { key: "rate", label: "Rate", right: true, render: (f) => "₹" + f.rate }, { key: "total", label: "Total", right: true, render: (f) => full(f.total) }, { key: "odo", label: "Odometer", right: true, render: (f) => num(f.odo) }, { key: "payment", label: "Payment" }]} />}

      {tab === "Maintenance" && <DataTable rows={MAINTENANCE.filter((m) => m.vehicleId === v.id).length ? MAINTENANCE.filter((m) => m.vehicleId === v.id) : MAINTENANCE.slice(3, 7).map((m) => ({ ...m, vehicleId: v.id }))} title="Maintenance" cols={[
        { key: "id", label: "Job" }, { key: "type", label: "Type" }, { key: "date", label: "When" }, { key: "shop", label: "Workshop" }, { key: "note", label: "Note" }, { key: "est", label: "Estimate", right: true, render: (m) => full(m.est) }, { key: "priority", label: "Priority", render: (m) => <Chip tone={m.priority === "Critical" ? "r" : m.priority === "High" ? "a" : "n"}>{m.priority}</Chip> }]} />}

      {tab === "Expenses" && <DataTable rows={EXPENSES.filter((e) => e.vehicleId === v.id).length ? EXPENSES.filter((e) => e.vehicleId === v.id) : EXPENSES.slice(0, 8).map((e) => ({ ...e, vehicleId: v.id }))} title="Expenses" cols={[
        { key: "date", label: "Date" }, { key: "cat", label: "Category" }, { key: "tripId", label: "Trip" }, { key: "amount", label: "Amount", right: true, render: (e) => full(e.amount) }, { key: "by", label: "Entered by" }, { key: "status", label: "Status", render: (e) => <Chip tone={e.status === "Approved" ? "g" : "a"}>{e.status}</Chip> }]} />}

      {tab === "Documents" && (
        <Panel title="Compliance documents" tight>
          <table className="tbl"><thead><tr><th>Document</th><th>Number</th><th>Expiry</th><th>Status</th></tr></thead><tbody>
            {docs.map((x) => <tr key={x.type}><td><b>{x.type}</b></td><td className="mono">{x.no}</td><td>{x.days} days left</td><td><Chip tone={x.tone} dot>{x.tone === "g" ? "Valid" : x.tone === "a" ? "Renew soon" : "Urgent"}</Chip></td></tr>)}
          </tbody></table>
        </Panel>
      )}

      {tab === "Driver History" && (
        <Panel title="Driver assignments" tight>
          <table className="tbl"><thead><tr><th>Driver</th><th>From</th><th>To</th><th className="r">Trips</th><th className="r">Avg mileage</th><th className="r">Rating</th></tr></thead><tbody>
            {[d, DRIVERS[(DRIVERS.indexOf(d) + 11) % 128], DRIVERS[(DRIVERS.indexOf(d) + 23) % 128]].map((x, i) => <tr key={x.id}><td style={{ display: "flex", gap: 8, alignItems: "center" }}><Avatar name={x.name} size={22} /><Link className="link" href={`/drivers/${x.id}`}>{x.name}</Link>{i === 0 && <Chip tone="g">Current</Chip>}</td><td>{["Jun 2026", "Jan 2026", "Mar 2025"][i]}</td><td>{["Present", "May 2026", "Dec 2025"][i]}</td><td className="r">{[v.trips30 * 4, 61, 88][i]}</td><td className="r">{x.mileage} km/L</td><td className="r">{x.rating}</td></tr>)}
          </tbody></table>
        </Panel>
      )}

      {tab === "Profitability" && (
        <div style={{ display: "grid", gap: 14 }}>
          <Kpis items={[
            { label: "Revenue / km", value: "₹" + Math.round(v.revenue / km) }, { label: "Cost / km", value: "₹" + Math.round(v.cost / km) }, { label: "Fuel cost / km", value: "₹" + Math.round(fuelCost / km) },
            { label: "Maintenance / km", value: "₹" + (maint / km).toFixed(1) }, { label: "Idle days", value: Math.round(((100 - v.util) / 100) * 30) + " / 30" }, { label: "Utilization", value: v.util + "%", tone: v.util < 60 ? "r" : null },
          ]} />
          <div className="grid g2">
            <Panel title="Vehicle P&L" sub="last 30 days">
              <dl className="kv"><dt>Revenue</dt><dd>{full(v.revenue)}</dd>{mp.items.map(([k, val]) => <Fragment key={k}><dt className="faint">− {k}</dt><dd>{full(val)}</dd></Fragment>)}<dt className="tot">Net profit</dt><dd className={"tot " + (profit < 0 ? "neg" : "pos")}>{full(profit)}</dd></dl>
            </Panel>
            <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
              <Panel title="Revenue vs cost vs profit" sub="₹ Lakh"><Bars data={[{ k: "Revenue", v: +(v.revenue / 1e5).toFixed(1) }, { k: "Cost", v: +(v.cost / 1e5).toFixed(1), color: "amber" }, { k: "Profit", v: +(Math.abs(profit) / 1e5).toFixed(1), color: profit < 0 ? "red" : "green" }]} fmt={(x) => x + "L"} height={160} /></Panel>
              <Panel title="Utilization"><Prog v={v.util} tone={v.util > 80 ? "g" : v.util > 60 ? "" : "r"} /><p className="muted" style={{ margin: "8px 0 0" }}>Each idle day costs ≈ {inr(Math.round(v.revenue / 30))} in lost earning capacity.</p></Panel>
            </div>
          </div>
        </div>
      )}

      {tab === "Activity" && <Panel tight>{ACTIVITY.slice(0, 12).map((a, i) => <div key={i} className="feed-i"><div style={{ flex: 1 }}><b>{a.who}</b> {a.what} <span className="muted">· {a.detail}</span></div><span className="faint">{a.when}</span></div>)}</Panel>}
    </div>
  );
}
