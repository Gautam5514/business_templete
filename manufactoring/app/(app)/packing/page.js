"use client";
import { Btn, Kpi, PageHeader, Pill, Progress } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { useStore } from "@/lib/store";
import { PACKING } from "@/data/ops";
import { num } from "@/lib/format";
import { WoLink } from "@/components/ui/links";

export default function Packing() {
  const { toast } = useStore();
  return (
    <div>
      <PageHeader title="Packing" sub="Accepted finished goods waiting to be boxed, labelled and handed to dispatch." />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4"><Kpi label="Packing queue" value={PACKING.filter((p) => p.status !== "Completed").length} sub="open packing jobs" /><Kpi label="Packed today" value="3,740" sub="units" /><Kpi label="Waiting to pack" value="2,184" sub="accepted units" tone="warn" /><Kpi label="Packaging stock" value="OK" sub="Cartons low — PR-1841 approved" /></div>
      <DataTable rows={PACKING} rowKey={(p) => p.id} pageSize={10} exportName="packing" searchPlaceholder="Search job, order, product…" selectable bulkActions={(s, clear) => <Btn size="xs" onClick={() => { toast(`${s.length} packing jobs marked complete`, "ok", "Packaging inventory consumed"); clear(); }}>Mark complete</Btn>}
        filters={[{ key: "st", label: "Status", options: ["Pending", "Packing", "Completed"], match: (r, v) => r.status === v }]}
        expand={(p) => <div className="text-[12.5px]"><span className="label mr-2">Packaging consumed</span>{p.material}</div>}
        cols={[{ key: "id", header: "Job", render: (p) => <span className="font-medium">{p.id}</span> }, { key: "wo", header: "Work order", render: (p) => <WoLink id={p.wo} /> }, { key: "so", header: "Sales order", muted: true }, { key: "product", header: "Product" },
          { key: "available", header: "Available FG", align: "right", render: (p) => num(p.available) }, { key: "required", header: "Packing required", align: "right", render: (p) => num(p.required) },
          { key: "packed", header: "Packed", align: "right", render: (p) => <div className="w-24 text-right"><span>{num(p.packed)}</span><Progress value={p.packed} max={p.required} tone={p.packed >= p.required ? "ok" : "info"} className="mt-1" /></div> }, { key: "team", header: "Team", muted: true }, { key: "status", header: "Status", render: (p) => <Pill>{p.status}</Pill> }]} />
    </div>
  );
}
