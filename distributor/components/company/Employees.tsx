"use client";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card, PageHeader, Pill } from "@/components/ui/ui";
import { DataTable, type Col } from "@/components/ui/table";
import { EMPLOYEES } from "@/data/core";
import { fdate } from "@/lib/format";
import type { Employee } from "@/types";

const STAR = ["amit-kumar", "rahul-verma", "priya-sharma", "vikash-kumar"];
export function Employees() {
  const q = useSearchParams().get("q") ?? "";
  const { logs } = useStore();
  const cols: Col<Employee>[] = [
    { key: "name", header: "Employee", render: (e) => <span className="flex items-center gap-2.5"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-panel text-[10.5px] font-semibold text-mute">{e.name.split(" ").map((x) => x[0]).join("")}</span><span className="font-medium">{e.name}</span></span> },
    { key: "role", header: "Role" },
    { key: "dept", header: "Department", muted: true },
    { key: "location", header: "Location", muted: true },
    { key: "phone", header: "Phone", muted: true, render: (e) => <span className="num">{e.phone}</span> },
    { key: "joined", header: "Joined", get: (e) => e.joined, muted: true, render: (e) => <span className="num">{fdate(e.joined, true)}</span> },
    { key: "actions", header: "Actions today", get: (e) => logs.filter((l) => l.user === e.name && l.ts.startsWith("2026-10-06")).length, align: "right" },
    { key: "status", header: "Status", render: (e) => <Pill>{e.status}</Pill> },
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Employees" sub="32 people across 3 warehouses and the Ranchi head office — every action accountable." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {EMPLOYEES.filter((e) => STAR.includes(e.id)).map((e) => (
          <Card key={e.id} title={e.name} sub={e.role}>
            <dl className="space-y-1.5 text-[13px]">{e.stats.map((s) => <div key={s.label} className="flex justify-between"><dt className="text-mute">{s.label}</dt><dd className="num font-semibold">{s.value}</dd></div>)}</dl>
          </Card>
        ))}
      </div>
      <DataTable rows={EMPLOYEES} cols={cols} rowKey={(e) => e.id} pageSize={10} exportName="employees" searchPlaceholder="Search employee, role…" initialQuery={q}
        filters={[{ key: "dept", label: "Department", options: Array.from(new Set(EMPLOYEES.map((e) => e.dept))), match: (e, v) => e.dept === v }, { key: "loc", label: "Location", options: Array.from(new Set(EMPLOYEES.map((e) => e.location))), match: (e, v) => e.location === v }]}
        expand={(e) => <div className="grid gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">{e.stats.map((s) => <div key={s.label}><div className="label">{s.label}</div><div className="num mt-0.5 text-[16px] font-semibold">{s.value}</div></div>)}</div>} />
    </div>
  );
}
