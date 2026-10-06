"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { Panel, PageHead, Kpis, Seg } from "@/components/ui";
import { Bars, HBars, LineChart } from "@/components/charts";
import { MONTHS, SERIES } from "@/data/ops";
import { VEHICLES, DRIVERS, CUSTOMERS } from "@/data/fleet";
import { ROUTES } from "@/data/geo";
import { inr } from "@/lib/format";
import { useApp } from "@/lib/store";

const REPORTS = ["Trip Report", "Fleet Utilization", "Vehicle Profitability", "Driver Performance", "Fuel Consumption", "Mileage Report", "Maintenance Cost", "Route Profitability", "Customer Profitability", "POD Aging", "Receivables", "Vendor Payables", "Delivery Performance", "Empty KM", "Breakdown Analysis", "Expense Report"];
const OWN = VEHICLES.filter((v) => v.ownership !== "Attached");

function Body({ r }) {
  if (r === "Vehicle Profitability") return <HBars items={[...OWN].sort((a, b) => b.profit - a.profit).slice(0, 10).map((v) => ({ k: v.id, v: v.profit }))} fmt={inr} tone="green" />;
  if (r === "Route Profitability") return <HBars items={[...ROUTES].sort((a, b) => b.margin - a.margin).map((x) => ({ k: `${x.from.slice(0, 4)}→${x.to.slice(0, 4)}`, v: +x.margin.toFixed(1), tone: x.margin < 20 ? "red" : "green" }))} fmt={(v) => v + "%"} />;
  if (r === "Customer Profitability") return <HBars items={CUSTOMERS.slice(0, 8).map((c) => ({ k: c.short.slice(0, 20), v: c.margin }))} fmt={(v) => v + "%"} />;
  if (r === "Driver Performance") return <HBars items={[...DRIVERS].sort((a, b) => b.score - a.score).slice(0, 10).map((d) => ({ k: d.name, v: d.score }))} fmt={(v) => v} max={100} />;
  if (r === "Fuel Consumption" || r === "Mileage Report") return <LineChart labels={MONTHS} series={[{ name: r.startsWith("Fuel") ? "₹ Lakh" : "km/L", data: r.startsWith("Fuel") ? SERIES.fuelCost : SERIES.mileage, color: "amber" }]} min={r.startsWith("Fuel") ? 40 : 3.8} fmt={(v) => v} />;
  if (r === "Fleet Utilization") return <LineChart labels={MONTHS} series={[{ name: "Utilization %", data: SERIES.util, color: "blue" }]} min={66} fmt={(v) => v + "%"} />;
  if (r === "Delivery Performance") return <LineChart labels={MONTHS} series={[{ name: "On-time %", data: SERIES.ontime, color: "green" }]} min={84} fmt={(v) => v + "%"} />;
  if (r === "Empty KM") return <LineChart labels={MONTHS} series={[{ name: "Empty km %", data: SERIES.empty, color: "red" }]} min={16} fmt={(v) => v + "%"} />;
  if (r === "Maintenance Cost") return <Bars data={MONTHS.map((m, i) => ({ k: m, v: SERIES.maint[i] }))} fmt={(v) => v} />;
  if (r === "POD Aging") return <Bars data={[{ k: "0–1d", v: 4 }, { k: "2–3d", v: 7 }, { k: "4–5d", v: 4 }, { k: "6d+", v: 2, color: "red" }]} fmt={(v) => v} />;
  if (r === "Receivables") return <Bars data={[{ k: "Not due", v: 53.6, color: "grey" }, { k: "0–15", v: 11.2 }, { k: "16–30", v: 9.6 }, { k: "31–60", v: 7.4, color: "red" }, { k: "61–90", v: 3.2, color: "red" }, { k: "90+", v: 1.4, color: "red" }]} fmt={(v) => v + "L"} />;
  if (r === "Vendor Payables") return <HBars items={[["Shree Roadways", 6.1], ["National Freight", 4.8], ["Bharat Transport", 3.9], ["Eastern Trucking", 3.2], ["Highway Logistics", 2.4]].map(([k, v]) => ({ k, v }))} fmt={(v) => `₹${v}L`} />;
  if (r === "Breakdown Analysis") return <Bars data={["Clutch", "Tyre", "Engine", "Brake", "Electrical", "Body"].map((k, i) => ({ k, v: [3, 5, 4, 2, 3, 1][i] }))} fmt={(v) => v} />;
  if (r === "Expense Report") return <HBars items={[["Fuel", 54.7], ["Vendor freight", 38.2], ["Driver cost", 21.4], ["Toll", 14.8], ["Maintenance", 11.2]].map(([k, v]) => ({ k, v }))} fmt={(v) => `₹${v}L`} />;
  return <LineChart labels={MONTHS} series={[{ name: "Revenue ₹Cr", data: SERIES.revenue, color: "ink" }, { name: "Cost", data: SERIES.cost, color: "amber", dash: true }]} fmt={(v) => v} />;
}

export default function Reports() {
  const { notify } = useApp();
  const [r, setR] = useState("Vehicle Profitability");
  const [rng, setRng] = useState("Last 12 months");
  return (
    <div className="page">
      <PageHead title="Reports Center" sub="16 operational and financial reports — scheduled to email, exportable to Excel."><Seg options={["Last 30 days", "Last 12 months", "FY 26-27"]} value={rng} onChange={setRng} /><button className="btn pri" onClick={() => notify(`${r} exported`)}><Download size={14} /> Export</button></PageHead>
      <div className="grid" style={{ gridTemplateColumns: "250px minmax(0,1fr)", alignItems: "start" }}>
        <div className="panel" style={{ padding: 6 }}>{REPORTS.map((x) => <button key={x} className="menu mi" style={{ position: "static", boxShadow: "none", border: 0, background: r === x ? "var(--grey-soft)" : "none", fontWeight: r === x ? 650 : 400, minWidth: 0 }} onClick={() => setR(x)}>{x}</button>)}</div>
        <div style={{ display: "grid", gap: 14 }}>
          <Panel title={r} sub={rng}><Body r={r} /></Panel>
          <Kpis items={[{ label: "Period revenue", value: "₹2.92 Cr" }, { label: "Period cost", value: "₹2.16 Cr" }, { label: "Gross profit", value: "₹76.0L", tone: "g" }, { label: "Margin", value: "26.0%" }]} />
        </div>
      </div>
    </div>
  );
}
