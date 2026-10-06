"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import DataTable from "@/components/table";
import { Insight, Kpis, PageHead, Person, PrioChip, SlaCell, StatusChip, Mono } from "@/components/ui";
import { JOBS, TODAY } from "@/data/ops";
import { techById, hhmm } from "@/data/core";
import { useApp } from "@/lib/store";

export default function Requests() {
  const router = useRouter();
  const { setOverlay, assigned } = useApp();
  const [f, setF] = useState(null);
  const rows = JOBS;
  const cols = useMemo(() => [
    { key: "sr", label: "Request ID", render: (j) => <Mono href={`/requests/${j.sr}`}>{j.sr}</Mono> },
    { key: "customer", label: "Customer", render: (j) => <Link href={`/customers/${j.cust.id}`} style={{ fontWeight: 550 }}>{j.customer}</Link> },
    { key: "cat", label: "Category" },
    { key: "issue", label: "Issue", render: (j) => <span style={{ display: "inline-block", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", verticalAlign: "bottom" }}>{j.issue}</span> },
    { key: "loc", label: "Location", render: (j) => `${j.loc}${j.branch !== "ranchi" ? ` · ${j.branch[0].toUpperCase() + j.branch.slice(1)}` : ""}` },
    { key: "prio", label: "Priority", render: (j) => <PrioChip p={j.prio} />, sort: (j) => ["Emergency", "High", "AMC", "Normal"].indexOf(j.prio) },
    { key: "req", label: "Requested", render: (j) => hhmm(j.req) },
    { key: "slaLeft", label: "SLA", render: (j) => <SlaCell j={j} /> },
    { key: "tech", label: "Technician", render: (j) => <Person t={techById(assigned[j.id] || j.tech)} />, csv: (j) => techById(j.tech)?.name || "Unassigned", sort: (j) => techById(j.tech)?.name || "" },
    { key: "status", label: "Status", render: (j) => <StatusChip s={assigned[j.id] ? "Technician Assigned" : j.status} /> },
    { key: "pay", label: "Payment Type", hide: false },
    { key: "source", label: "Source" },
  ], [assigned]);
  const views = [
    { name: "All", count: rows.length }, { name: "Needs assignment", filter: (j) => j.bucket === "unassigned", count: TODAY.unassigned },
    { name: "Delayed", filter: (j) => j.bucket === "delayed", count: TODAY.delayed }, { name: "In progress", filter: (j) => j.bucket === "progress", count: TODAY.progress },
    { name: "Emergency", filter: (j) => j.prio === "Emergency" && j.status !== "Completed" }, { name: "Completed", filter: (j) => j.bucket === "completed", count: TODAY.completed },
  ];
  return (
    <div className="page">
      <PageHead title="Service Requests" sub="Every enquiry from phone, WhatsApp, web and AMC auto-schedule — classified, prioritised and SLA-timed.">
        <button className="btn pri" onClick={() => setOverlay({ type: "create", kind: "New Service Request" })}><Plus size={14} /> New request</button>
      </PageHead>
      <Insight tone="r"><b>6 requests are unassigned, including 2 that may breach SLA within the next hour.</b> Phone and WhatsApp bring 61% of today’s volume.</Insight>
      <Kpis items={[
        { label: "Requests today", value: TODAY.total, hint: "▲ 9 vs yesterday" }, { label: "Awaiting assignment", value: TODAY.unassigned, tone: "r", hint: "dispatch now" },
        { label: "Delayed", value: TODAY.delayed, tone: "a", hint: "₹1.86L revenue at risk" }, { label: "Completed", value: TODAY.completed, tone: "g", hint: "67% of today" },
        { label: "Emergency open", value: JOBS.filter((j) => j.prio === "Emergency" && j.status !== "Completed").length, hint: "2h SLA" },
      ]} />
      <DataTable title="Service requests" rows={rows} cols={cols} views={views} searchKeys={["sr", "customer", "issue", "loc", "cat"]} pageSize={14} onRow={(j) => router.push(`/requests/${j.sr}`)}
        expand={(j) => <div className="muted">{j.issue} — {j.service}. Asset {j.asset || "not linked"} · Source {j.source} · Est. value ₹{j.value.toLocaleString("en-IN")}. <Link className="link" href={`/jobs/${j.id}`}>Open {j.id} →</Link></div>} />
    </div>
  );
}
