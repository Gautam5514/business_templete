"use client";
import { PageHeader } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { useStore } from "@/lib/store";
import { fdt } from "@/lib/format";

export default function Logs() {
  const { logs } = useStore();
  const rows = logs.map((l, i) => ({ ...l, k: i }));
  return (
    <div>
      <PageHeader title="Activity Logs" sub="Who did what, and when — across production, stores, quality, purchase and accounts." />
      <DataTable rows={rows} rowKey={(l) => l.k} pageSize={25} exportName="activity-log" searchPlaceholder="Search user, action, reference…"
        filters={[{ key: "u", label: "User", options: Array.from(new Set(rows.map((r) => r.user))), match: (r, v) => r.user === v }]}
        cols={[{ key: "ts", header: "When", render: (l) => <span className="num">{fdt(l.ts)}</span> }, { key: "user", header: "User", render: (l) => <span className="font-medium">{l.user}</span> }, { key: "action", header: "Action" }, { key: "ref", header: "Reference", muted: true }, { key: "detail", header: "Detail", muted: true, render: (l) => <span className="block max-w-[520px] truncate">{l.detail}</span> }]} />
    </div>
  );
}
