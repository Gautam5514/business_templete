"use client";
import { useState } from "react";
import DataTable from "@/components/table";
import { Chip, Insight, Kpis, PageHead, Panel, Plate } from "@/components/ui";
import { LineChart, HBars } from "@/components/charts";
import { FUEL, FUEL_ANOMALIES, MONTHS, SERIES } from "@/data/ops";
import { VEHICLES, driverById } from "@/data/fleet";
import { Modal, Field } from "@/components/ui";
import { full, inr, num } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function FuelPage() {
  const { notify } = useApp();
  const [add, setAdd] = useState(false);
  const loss = FUEL_ANOMALIES.reduce((a, x) => a + x.loss, 0);
  const worst = [...VEHICLES].filter((v) => v.tripId).sort((a, b) => a.mileage - b.mileage).slice(0, 5);
  const cols = [
    { key: "date", label: "Date" }, { key: "vehicleId", label: "Vehicle", render: (f) => <Plate id={f.vehicleId} /> }, { key: "driver", label: "Driver", render: (f) => driverById(f.driverId)?.name, csv: (f) => driverById(f.driverId)?.name },
    { key: "tripId", label: "Trip" }, { key: "station", label: "Fuel Station" }, { key: "litres", label: "Litres", right: true }, { key: "rate", label: "Rate", right: true, render: (f) => "₹" + f.rate },
    { key: "total", label: "Total", right: true, render: (f) => full(f.total) }, { key: "odo", label: "Odometer", right: true, render: (f) => num(f.odo) },
    { key: "payment", label: "Payment" }, { key: "receipt", label: "Receipt", render: (f) => (f.receipt ? <Chip tone="g">Attached</Chip> : <Chip tone="r">Missing</Chip>) },
  ];
  return (
    <div className="page">
      <PageHead title="Fuel" sub="Fuel is 18.7% of revenue — the biggest controllable cost. Every litre is matched against trips, distance and mileage."><button className="btn pri" onClick={() => setAdd(true)}>Add fuel entry</button></PageHead>
      <Insight tone="r"><b>JH01DK4821’s mileage has dropped 18%</b> over eight weeks and <b>JH05CZ1182 is 29% below baseline</b>. The system flags possible fuel leakage or maintenance issues — {FUEL_ANOMALIES.length} anomalies are costing ≈ {inr(loss)} on recent fills alone.</Insight>
      <Kpis items={[{ label: "Fuel cost this month", value: "₹54.7L" }, { label: "Litres consumed", value: "58,420 L" }, { label: "Average mileage", value: "3.94 km/L", tone: "a", hint: "▼ from 4.12 in Nov" }, { label: "Highest consumption", value: "JH05CZ1182", hint: "3.1 km/L" }, { label: "Fuel variance", value: "+4.6%", tone: "r", hint: "vs expected" }, { label: "Fuel cost / km", value: "₹23.9" }]} />
      <div className="grid g2" style={{ marginBottom: 14 }}>
        <Panel title="Fuel anomaly detection" sub="expected vs actual consumption" tight>
          <table className="tbl"><thead><tr><th>Vehicle</th><th className="r">Expected</th><th className="r">Actual</th><th className="r">Variance</th><th className="r">Est. loss</th><th>Flag</th></tr></thead><tbody>
            {FUEL_ANOMALIES.map((a) => <tr key={a.vehicleId}><td><Plate id={a.vehicleId} /><div className="faint" style={{ fontSize: 11 }}>{a.note}</div></td><td className="r">{a.expected} L</td><td className="r">{a.actual} L</td><td className="r neg">+{a.variance} L</td><td className="r">{full(a.loss)}</td><td><Chip tone={a.flag === "Possible theft" || a.flag === "Investigate" ? "r" : "a"}>{a.flag}</Chip></td></tr>)}
          </tbody></table>
        </Panel>
        <div style={{ display: "grid", gap: 14 }}>
          <Panel title="Mileage trend" sub="fleet km/L · 12 months"><LineChart labels={MONTHS} series={[{ name: "km/L", data: SERIES.mileage, color: "amber" }]} height={150} fmt={(v) => v.toFixed(2)} min={3.8} /></Panel>
          <Panel title="Lowest mileage on road"><HBars items={worst.map((v) => ({ k: v.id, v: v.mileage, tone: "red" }))} fmt={(v) => v + " km/L"} max={5} /><p className="muted" style={{ margin: "10px 0 0", fontSize: 12.5 }}>Mileage on JH05CZ1182 is <b>29% below</b> its 90-day baseline — adding ≈ <b>₹11,800</b> monthly fuel cost.</p></Panel>
        </div>
      </div>
      <DataTable rows={FUEL} cols={cols} title="Fuel entries" views={[{ name: "All" }, { name: "Cash fills", filter: (f) => f.payment === "Cash" }, { name: "No receipt", filter: (f) => !f.receipt }]} />
      <Modal open={add} onClose={() => setAdd(false)} title="Add fuel entry" footer={<><button className="btn" onClick={() => setAdd(false)}>Cancel</button><button className="btn pri" onClick={() => { setAdd(false); notify("Fuel entry saved · mileage recalculated"); }}>Save</button></>}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {["Vehicle", "Driver", "Trip", "Fuel station", "Litres", "Rate", "Total", "Odometer"].map((l) => <Field key={l} label={l}><input className="input" /></Field>)}
          <Field label="Payment type"><select className="select"><option>Fuel card</option><option>Cash</option><option>Credit</option></select></Field><Field label="Receipt"><input className="input" type="file" /></Field>
        </div>
      </Modal>
    </div>
  );
}
