"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import DataTable from "@/components/table";
import { Insight, Kpis, PageHead, Person, PrioChip, SlaCell, StatusChip, Mono } from "@/components/ui";
import { JOBS } from "@/data/ops";
import { techById } from "@/data/core";
import { inr } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function Jobs() {
  const router = useRouter();
  const { assigned } = useApp();
  const cols = useMemo(() => [
    { key: "id", label: "Job", render: (j) => <Mono href={`/jobs/${j.id}`}>{j.id}</Mono> },
    { key: "customer", label: "Customer", render: (j) => <span style={{ fontWeight: 550 }}>{j.customer}</span> },
    { key: "service", label: "Service" },
    { key: "prio", label: "Priority", render: (j) => <PrioChip p={j.prio} /> },
    { key: "tech", label: "Technician", render: (j) => <Person t={techById(assigned[j.id] || j.tech)} />, csv: (j) => techById(j.tech)?.name || "", sort: (j) => techById(j.tech)?.name || "" },
    { key: "status", label: "Status", render: (j) => <StatusChip s={assigned[j.id] ? "Technician Assigned" : j.status} /> },
    { key: "slaLeft", label: "SLA", render: (j) => <SlaCell j={j} /> },
    { key: "branch", label: "Branch", render: (j) => j.branch[0].toUpperCase() + j.branch.slice(1) },
    { key: "value", label: "Value", right: true, render: (j) => inr(j.value) },
  ], [assigned]);
  const views = [
    { name: "All jobs", count: JOBS.length },
    { name: "Need parts", filter: (j) => j.status === "Parts Pending", count: JOBS.filter((j) => j.status === "Parts Pending").length },
    { name: "Need approval", filter: (j) => ["Approval Pending", "Estimate Pending"].includes(j.status), count: JOBS.filter((j) => ["Approval Pending", "Estimate Pending"].includes(j.status)).length },
    { name: "Delayed", filter: (j) => j.bucket === "delayed" }, { name: "Escalated", filter: (j) => j.status === "Escalated" }, { name: "Completed", filter: (j) => j.bucket === "completed" },
  ];
  const blocked = JOBS.filter((j) => ["Parts Pending", "Approval Pending"].includes(j.status));
  return (
    <div className="page">
      <PageHead title="Jobs" sub="Every job from request to payment. Open one to see its full 360° journey." />
      <Insight><b>{blocked.length} jobs are blocked — {inr(blocked.reduce((a, j) => a + j.value, 0))} of work waiting on parts or customer approval.</b> <Link className="link" href="/inventory">Resolve stock →</Link></Insight>
      <Kpis items={[{ label: "Jobs today", value: JOBS.length }, { label: "Need parts", value: JOBS.filter((j) => j.status === "Parts Pending").length, tone: "r" }, { label: "Need approval", value: JOBS.filter((j) => j.status === "Approval Pending").length + 3, tone: "a" }, { label: "Escalated", value: JOBS.filter((j) => j.status === "Escalated").length, tone: "r" }, { label: "Completed", value: JOBS.filter((j) => j.bucket === "completed").length, tone: "g" }]} />
      <DataTable title="Jobs" rows={JOBS} cols={cols} views={views} searchKeys={["id", "customer", "service", "loc"]} onRow={(j) => router.push(`/jobs/${j.id}`)} />
    </div>
  );
}
