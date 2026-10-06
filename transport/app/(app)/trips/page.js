"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DataTable from "@/components/table";
import { Chip, Insight, Kpis, PageHead, Plate, TripChip } from "@/components/ui";
import { TRIPS, ACTIVE, fmtMin } from "@/data/fleet";
import { full, inr } from "@/lib/format";

const podTone = { Approved: "g", Pending: "r", "Under Verification": "a", "Original Required": "a", Uploaded: "b", "—": "n" };
export default function Trips() {
  const router = useRouter();
  const rows = TRIPS;
  const cnt = (f) => rows.filter(f).length;
  const delayed = rows.filter((t) => t.status === "delayed" || t.status === "breakdown");
  const cols = [
    { key: "id", label: "Trip ID", render: (t) => <Link href={`/trips/${t.id}`} className="mono link" style={{ fontWeight: 600 }}>{t.id}</Link> },
    { key: "vehicleId", label: "Vehicle", render: (t) => <Plate id={t.vehicleId} /> },
    { key: "driver", label: "Driver", render: (t) => t.driver.name, sort: (t) => t.driver.name, csv: (t) => t.driver.name },
    { key: "customer", label: "Customer", render: (t) => t.customer.short, sort: (t) => t.customer.short, csv: (t) => t.customer.short },
    { key: "from", label: "Origin" }, { key: "to", label: "Destination" },
    { key: "km", label: "Distance", right: true, render: (t) => `${t.km} km` },
    { key: "load", label: "Load", right: true, hide: true, render: (t) => `${t.load} MT` },
    { key: "freight", label: "Freight Value", right: true, render: (t) => full(t.freight) },
    { key: "start", label: "Trip Start", hide: true, sort: (t) => t.startMin, render: (t) => (t.startMin < 0 ? `${Math.ceil(-t.startMin / 1440)}d ago` : `Today ${fmtMin(t.startMin)}`), csv: (t) => t.startMin },
    { key: "eta", label: "ETA", sort: (t) => t.etaMin, render: (t) => (["completed", "podpending", "cancelled"].includes(t.status) ? "—" : <span className={t.delay > 30 ? "neg" : ""}>{fmtMin(t.etaMin)}{t.delay ? ` +${t.delay}m` : ""}</span>), csv: (t) => fmtMin(t.etaMin) },
    { key: "actual", label: "Actual Delivery", render: (t) => (["completed", "podpending"].includes(t.status) ? `${t.deliveredAgo}d ago` : "—"), hide: true },
    { key: "status", label: "Status", render: (t) => <TripChip s={t.status} /> },
    { key: "pod", label: "POD", render: (t) => <Chip tone={podTone[t.pod] || "n"}>{t.pod}</Chip> },
    { key: "profit", label: "Profit", right: true, render: (t) => <b className={t.profit < 0 ? "neg" : t.margin < 18 ? "warn" : "pos"}>{inr(t.profit)}</b> },
  ];
  const views = [
    { name: "All", count: rows.length }, { name: "Active", count: cnt((t) => ACTIVE.includes(t.status)), filter: (t) => ACTIVE.includes(t.status) },
    { name: "Delayed / breakdown", count: delayed.length, filter: (t) => t.status === "delayed" || t.status === "breakdown" },
    { name: "POD pending", count: cnt((t) => t.status === "podpending"), filter: (t) => t.status === "podpending" },
    { name: "Low margin", count: cnt((t) => t.margin < 20), filter: (t) => t.margin < 20 }, { name: "Completed", filter: (t) => t.status === "completed" },
  ];
  const act = rows.filter((t) => ACTIVE.includes(t.status));
  return (
    <div className="page">
      <PageHead title="Trips" sub="Every trip from booking to profit — click any row for the full 360° view."><button className="btn pri">Create trip</button></PageHead>
      <Insight tone="r"><b>{delayed.length} trips are delayed or broken down</b>, putting {inr(delayed.reduce((a, t) => a + t.freight, 0))} of freight at risk of detention penalties and missed delivery windows.</Insight>
      <Kpis items={[{ label: "Active trips", value: act.length, hint: "in transit · 14 loading / unloading" }, { label: "Freight in transit", value: inr(act.reduce((a, t) => a + t.freight, 0)) }, { label: "Delayed", value: cnt((t) => t.status === "delayed"), tone: "r", hint: "+3 breakdown" }, { label: "POD pending", value: cnt((t) => t.status === "podpending"), tone: "a", hint: "invoice blocked" }, { label: "Avg trip margin", value: (rows.reduce((a, t) => a + t.margin, 0) / rows.length).toFixed(1) + "%" }]} />
      <DataTable rows={rows} cols={cols} views={views} searchKeys={["id", "vehicleId", "from", "to", "driver", "customer"]} title="Trips" initialView={1} onRow={(t) => router.push(`/trips/${t.id}`)}
        expand={(t) => <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}><span><span className="faint">Material </span>{t.material}</span><span><span className="faint">Route avg margin </span>{t.route.margin.toFixed(1)}%</span><span><span className="faint">Cost </span>{full(t.cost)}</span><span><span className="faint">Margin </span>{t.margin.toFixed(1)}%</span><Link href={`/trips/${t.id}`} className="link">Open trip 360° →</Link></div>} />
    </div>
  );
}
