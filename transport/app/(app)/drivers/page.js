"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DataTable from "@/components/table";
import { Avatar, Chip, Insight, Kpis, PageHead, Plate } from "@/components/ui";
import { DRIVERS, SILENT_DRIVERS, vehicleById } from "@/data/fleet";

const tripOf = (d) => vehicleById(d.vehicleId)?.tripId;

export default function Drivers() {
  const router = useRouter();
  const expiring = DRIVERS.filter((d) => d.licenseDays < 45);
  const cols = [
    { key: "name", label: "Driver", render: (d) => <span style={{ display: "flex", gap: 9, alignItems: "center" }}><Avatar name={d.name} size={24} /><b>{d.name}</b></span> },
    { key: "phone", label: "Phone", render: (d) => <span className="mono">{d.phone}</span> },
    { key: "vehicleId", label: "Assigned Vehicle", render: (d) => <Plate id={d.vehicleId} /> },
    { key: "tripId", label: "Current Trip", render: (d) => { const t = tripOf(d); return t ? <Link className="mono link" href={`/trips/${t}`}>{t}</Link> : <span className="faint">—</span>; }, sort: (d) => tripOf(d) || "", csv: (d) => tripOf(d) },
    { key: "licenseExpiry", label: "License Expiry", render: (d) => <span className={d.licenseDays < 30 ? "neg" : ""}>{d.licenseExpiry}{d.licenseDays < 45 && <Chip tone="r" className="ml-2">{d.licenseDays}d</Chip>}</span>, sort: (d) => d.licenseDays },
    { key: "attendance", label: "Attendance", right: true, render: (d) => d.attendance + "%" },
    { key: "month", label: "Trips (mo)", right: true }, { key: "ontime", label: "On-time %", right: true, render: (d) => <span className={d.ontime < 85 ? "warn" : ""}>{d.ontime}%</span> },
    { key: "mileage", label: "Fuel Efficiency", right: true, render: (d) => <span className={d.mileage < 3.6 ? "neg" : ""}>{d.mileage} km/L</span> },
    { key: "incidents", label: "Incidents", right: true, render: (d) => <span className={d.incidents > 2 ? "neg" : ""}>{d.incidents}</span> },
    { key: "rating", label: "Rating", right: true, render: (d) => `${d.rating} ★` },
    { key: "score", label: "Score", right: true, render: (d) => <b>{d.score}</b> },
  ];
  return (
    <div className="page">
      <PageHead title="Drivers" sub="128 active drivers — documents, attendance, efficiency and safety in one place."><button className="btn pri">Add driver</button></PageHead>
      <Insight tone="a"><b>{SILENT_DRIVERS.length} drivers on active trips have not updated status</b> for over 90 minutes, and <b>{expiring.length} licences expire within 45 days</b> — those drivers can’t be dispatched after expiry.</Insight>
      <Kpis items={[{ label: "Drivers on trip", value: 64 }, { label: "Avg on-time", value: "91%" }, { label: "Avg fuel efficiency", value: "4.0 km/L" }, { label: "Licences expiring", value: expiring.length, tone: "a", hint: "within 45 days" }, { label: "Incidents (30d)", value: 11 }]} />
      <DataTable rows={DRIVERS} cols={cols} views={[{ name: "All", count: 128 }, { name: "On trip", filter: (d) => !!tripOf(d) }, { name: "Licence expiring", count: expiring.length, filter: (d) => d.licenseDays < 45 }, { name: "Low efficiency", filter: (d) => d.mileage < 3.6 }, { name: "Top performers", filter: (d) => d.score >= 90 }]} title="Drivers" onRow={(d) => router.push(`/drivers/${d.id}`)} />
    </div>
  );
}
