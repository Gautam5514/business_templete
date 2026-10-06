"use client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import DataTable from "@/components/table";
import { Avatar, Insight, Kpis, PageHead, Stars, TechChip } from "@/components/ui";
import { TECHS, techScore } from "@/data/core";
import { CURRENT } from "@/data/ops";

export default function Technicians() {
  const router = useRouter();
  const cols = useMemo(() => [
    { key: "name", label: "Technician", render: (t) => <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><Avatar name={t.name} size={24} /><span><b style={{ fontWeight: 600 }}>{t.name}</b><div className="faint" style={{ fontSize: 11 }}>{t.title}</div></span></span> },
    { key: "branch", label: "Branch", render: (t) => t.branch[0].toUpperCase() + t.branch.slice(1) },
    { key: "skills", label: "Skills", sortable: false, render: (t) => t.skills.join(" · "), csv: (t) => t.skills.join("; ") },
    { key: "status", label: "Status", render: (t) => <TechChip s={t.status} /> },
    { key: "jobsToday", label: "Jobs today", right: true }, { key: "completion", label: "Completion", right: true, render: (t) => t.completion + "%" },
    { key: "ftf", label: "First-time fix", right: true, render: (t) => <b className={t.ftf >= 90 ? "pos" : t.ftf < 80 ? "warn" : ""}>{t.ftf}%</b> },
    { key: "rating", label: "Rating", render: (t) => <Stars v={t.rating} /> }, { key: "score", label: "Score", right: true, render: (t) => <b>{techScore(t)}</b>, sort: (t) => techScore(t), csv: (t) => techScore(t) },
    { key: "rev", label: "Revenue (MTD)", right: true, render: (t) => `₹${t.rev}L`, sort: (t) => t.rev, csv: (t) => `₹${t.rev}L` },
    { key: "loc", label: "Current location", render: (t) => CURRENT[t.id] ? `${CURRENT[t.id].loc}` : t.loc, csv: (t) => t.loc },
  ], []);
  const views = [{ name: "All", count: TECHS.length }, { name: "Available", filter: (t) => t.status === "available", count: 8 }, { name: "On job", filter: (t) => t.status === "onjob" || t.status === "travelling" }, { name: "Delayed", filter: (t) => t.status === "delayed" }, { name: "Offline", filter: (t) => t.status === "offline", count: 16 }, ...["ranchi", "dhanbad", "jamshedpur", "patna"].map((b) => ({ name: b[0].toUpperCase() + b.slice(1), filter: (t) => t.branch === b }))];
  return (
    <div className="page">
      <PageHead title="Technicians" sub="68 field technicians across 4 branches — live status, quality and revenue contribution." />
      <Insight tone="a"><b>Suresh Mahto’s first-time-fix is 79% against a 87% company average</b> — every 1% below target adds ≈ ₹12K of repeat-visit cost per month. Pair him with a senior on RO and geyser jobs.</Insight>
      <Kpis items={[{ label: "Total technicians", value: 68 }, { label: "Active now", value: 52, tone: "g" }, { label: "Available", value: 8 }, { label: "Absent", value: 3, tone: "a" }, { label: "Avg first-time fix", value: "87%" }, { label: "Avg rating", value: "★ 4.5" }]} />
      <DataTable title="Technicians" rows={TECHS} cols={cols} views={views} searchKeys={["name", "title", "branch", "loc"]} onRow={(t) => router.push(`/technicians/${t.id}`)} />
    </div>
  );
}
