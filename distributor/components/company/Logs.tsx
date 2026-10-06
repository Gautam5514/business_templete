"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { PageHeader, Pill } from "@/components/ui/ui";
import { DataTable, type Col } from "@/components/ui/table";
import type { Log } from "@/data/misc";
import { fdt } from "@/lib/format";

export function Logs() {
  const { logs } = useStore();
  const cols: Col<Log>[] = [
    { key: "ts", header: "Timestamp", get: (l) => l.ts, render: (l) => <span className="num text-mute">{fdt(l.ts)}</span> },
    { key: "user", header: "User", render: (l) => <span className="font-medium">{l.user}</span> },
    { key: "action", header: "Action" },
    { key: "module", header: "Module", render: (l) => <Pill tone="neutral" dot={false}>{l.module}</Pill> },
    { key: "record", header: "Record", render: (l) => (l.href ? <Link href={l.href} className="num font-medium hover:text-accent hover:underline">{l.record}</Link> : <span className="num">{l.record}</span>) },
    { key: "device", header: "Device", muted: true },
    { key: "ip", header: "IP", muted: true, render: (l) => <span className="num">{l.ip}</span> },
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Activity Logs" sub="Everything inside the system is logged — who did what, where and when." />
      <DataTable rows={logs} cols={cols} rowKey={(l) => l.id} pageSize={15} exportName="activity-log" defaultSort={{ key: "ts", dir: "desc" }} searchPlaceholder="Search user, action, record…"
        filters={[{ key: "mod", label: "Module", options: Array.from(new Set(logs.map((l) => l.module))).sort(), match: (l, v) => l.module === v }, { key: "user", label: "User", options: Array.from(new Set(logs.map((l) => l.user))).sort(), match: (l, v) => l.user === v }, { key: "day", label: "Day", options: ["Today", "Yesterday", "Earlier"], match: (l, v) => (v === "Today" ? l.ts.startsWith("2026-10-06") : v === "Yesterday" ? l.ts.startsWith("2026-10-05") : l.ts < "2026-10-05") }]} />
    </div>
  );
}
