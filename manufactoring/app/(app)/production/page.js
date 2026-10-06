"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Btn, Card, Kpi, PageHeader, Pill, Progress } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { useStore } from "@/lib/store";
import { fdt, num } from "@/lib/format";
import { WoLink } from "@/components/ui/links";

const AT_RISK = { "WO-2841": "6 h behind plan — Press P-04 downtime", "WO-2845": "Material shortage: Brass cartridge", "WO-2848": "QC rejection above threshold + Line 4 maintenance" };
const STATUSES = ["Planned", "Material Pending", "Ready", "Running", "Paused", "QC Pending", "Completed", "Cancelled"];

export default function Production() {
  const { wos, openQuick } = useStore();
  const router = useRouter();
  const risk = useSearchParams().get("risk") === "1";
  const rows = risk ? wos.filter((w) => AT_RISK[w.id]) : wos;
  const count = (s) => wos.filter((w) => w.status === s).length;
  return (
    <div>
      <PageHeader title="Production Orders" sub={risk ? "Showing the 3 at-risk work orders — ₹18.7L of customer orders affected." : "Work orders linked to customer demand, material, machines and quality."} actions={<>{risk && <Btn onClick={() => router.push("/production")}>Show all</Btn>}<Btn variant="primary" icon={<Plus size={14} />} onClick={() => openQuick("wo")}>Create Production Order</Btn></>} />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Running" value={count("Running")} sub="Lines 1 & 2" />
        <Kpi label="Material pending" value={count("Material Pending")} tone="warn" sub="Waiting on purchase" />
        <Kpi label="Planned / ready" value={count("Planned") + count("Ready")} sub="Next 3 weeks" />
        <Kpi label="At risk" value={Object.keys(AT_RISK).length} tone="bad" sub="Delay, shortage or quality" />
      </div>
      <DataTable
        rows={rows} rowKey={(w) => w.id} exportName="work-orders" pageSize={10} searchPlaceholder="Search work order, product, supervisor…"
        defaultSort={risk ? undefined : { key: "id", dir: "asc" }} onRowClick={(w) => router.push(`/production/${w.id}`)} selectable
        bulkActions={(s, clear) => <Btn size="xs" onClick={clear}>Release {s.length} to floor</Btn>}
        filters={[
          { key: "status", label: "Status", options: STATUSES, match: (r, v) => r.status === v },
          { key: "line", label: "Line", options: ["Line 1", "Line 2", "Line 3", "Line 4"], match: (r, v) => r.line === v },
        ]}
        cols={[
          { key: "id", header: "Work order", render: (w) => <span className="font-semibold">{w.id}</span> },
          { key: "so", header: "Sales order", muted: true },
          { key: "product", header: "Product", render: (w) => <div><div>{w.product}</div>{AT_RISK[w.id] && <div className="text-[11.5px] text-bad">{AT_RISK[w.id]}</div>}</div> },
          { key: "planned", header: "Planned", align: "right", render: (w) => num(w.planned) },
          { key: "produced", header: "Produced", align: "right", render: (w) => <div className="w-24 text-right"><span>{num(w.produced)}</span><Progress value={w.progress} tone={w.status === "Completed" ? "ok" : "info"} className="mt-1" /></div> },
          { key: "accepted", header: "Accepted", align: "right", render: (w) => num(w.accepted) },
          { key: "rejected", header: "Rejected", align: "right", render: (w) => w.rejected ? <span className={w.produced && w.rejected / w.produced > 0.03 ? "font-medium text-bad" : ""}>{num(w.rejected)}</span> : "0" },
          { key: "wip", header: "WIP", align: "right", render: (w) => num(w.wip) },
          { key: "start", header: "Start", render: (w) => fdt(w.start), muted: true },
          { key: "due", header: "Due date", render: (w) => fdt(w.due) },
          { key: "line", header: "Line" },
          { key: "supervisor", header: "Supervisor", muted: true },
          { key: "status", header: "Status", render: (w) => <Pill>{w.status}</Pill> },
        ]}
      />
    </div>
  );
}
void Card;
