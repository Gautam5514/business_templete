"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DataTable from "@/components/table";
import { Chip, Insight, Kpis, PageHead, Panel, Plate, VehChip } from "@/components/ui";
import { HBars } from "@/components/charts";
import { VEHICLES, driverById } from "@/data/fleet";
import { inr } from "@/lib/format";

export default function Vehicles() {
  const router = useRouter();
  const own = VEHICLES.filter((v) => v.ownership !== "Attached");
  const rank = [...own].sort((a, b) => b.profit - a.profit);
  const losing = own.filter((v) => v.profit < 0);
  const idle = VEHICLES.filter((v) => v.status === "idle");
  const cols = [
    { key: "id", label: "Vehicle Number", render: (v) => <Plate id={v.id} /> },
    { key: "type", label: "Type", render: (v) => <span>{v.type}<div className="faint" style={{ fontSize: 11 }}>{v.model}</div></span> },
    { key: "ownership", label: "Ownership", render: (v) => <Chip tone={v.ownership === "Owned" ? "k" : "n"}>{v.ownership}</Chip> },
    { key: "status", label: "Current Status", render: (v) => <VehChip s={v.status} sub={v.sub} />, sort: (v) => v.status },
    { key: "driver", label: "Driver", render: (v) => driverById(v.driverId)?.name, sort: (v) => driverById(v.driverId)?.name || "", csv: (v) => driverById(v.driverId)?.name },
    { key: "loc", label: "Current Location" },
    { key: "tripId", label: "Current Trip", render: (v) => (v.tripId ? <Link className="mono link" href={`/trips/${v.tripId}`}>{v.tripId}</Link> : <span className="faint">—</span>) },
    { key: "odo", label: "Odometer", right: true, render: (v) => v.odo.toLocaleString("en-IN") + " km" },
    { key: "mileage", label: "Mileage", right: true, render: (v) => <span className={v.mileage < 3.6 ? "neg" : ""}>{v.mileage} km/L</span> },
    { key: "lastService", label: "Last Service", hide: true },
    { key: "nextKm", label: "Next Service", right: true, render: (v) => (v.nextKm < 0 ? <Chip tone="r">Overdue {-v.nextKm} km</Chip> : <span className={v.nextKm < 1500 ? "warn" : ""}>in {v.nextKm.toLocaleString("en-IN")} km</span>) },
    { key: "revenue", label: "Monthly Revenue", right: true, render: (v) => inr(v.revenue) },
    { key: "cost", label: "Monthly Cost", right: true, render: (v) => inr(v.cost) },
    { key: "profit", label: "Profit", right: true, render: (v) => <b className={v.profit < 0 ? "neg" : v.profit / v.revenue < 0.18 ? "warn" : "pos"}>{inr(v.profit)}</b> },
  ];
  const views = [
    { name: "All", count: VEHICLES.length }, { name: "Owned", filter: (v) => v.ownership === "Owned" }, { name: "Attached", filter: (v) => v.ownership === "Attached" },
    { name: "Idle", count: idle.length, filter: (v) => v.status === "idle" }, { name: "Needs service", filter: (v) => v.nextKm < 1000 }, { name: "Losing money", count: losing.length, filter: (v) => v.profit < 0 },
  ];
  return (
    <div className="page">
      <PageHead title="Vehicles" sub="All 128 vehicles — owned, leased and attached — with live status and 30-day economics."><button className="btn pri">Add vehicle</button></PageHead>
      <Insight tone="a"><b>31 vehicles are currently idle</b>, representing approximately <b>₹6.2L/day</b> in unused earning capacity. <b>{losing.length} owned vehicles</b> are operating at negative margin this month.</Insight>
      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", marginBottom: 14 }}>
        <Panel title="Fleet profitability ranking" sub="top earners · last 30 days"><HBars items={rank.slice(0, 5).map((v, i) => ({ k: `${i + 1}. ${v.id}`, v: v.profit }))} fmt={inr} tone="green" /></Panel>
        <Panel title="Lowest performers" sub="below target margin"><HBars items={rank.slice(-5).reverse().map((v) => ({ k: v.id, v: v.profit }))} fmt={inr} /></Panel>
      </div>
      <DataTable rows={VEHICLES} cols={cols} views={views} searchKeys={["id", "type", "loc", "tripId", "driver", "ownership"]} title="Vehicles" onRow={(v) => router.push(`/vehicles/${v.id}`)} />
    </div>
  );
}
