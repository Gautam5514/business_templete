"use client";
import { Plus } from "lucide-react";
import { Btn, Card, Kpi, PageHeader, Pill, Stepper } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { useStore } from "@/lib/store";
import { DISPATCH_FLOW } from "@/data/ops";
import { fdate, lakh, num } from "@/lib/format";

export default function Dispatch() {
  const { dispatches, openQuick } = useStore();
  return (
    <div>
      <PageHeader title="Dispatch" sub="From packing complete to delivered — vehicle, gate pass and transit." actions={<Btn variant="primary" icon={<Plus size={14} />} onClick={() => openQuick("dispatch")}>Create Dispatch</Btn>} />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4"><Kpi label="Loading now" value={dispatches.filter((d) => d.status === "Loading").length} sub="vehicle JH-01-BT-2284" /><Kpi label="In transit" value={dispatches.filter((d) => d.status === "In Transit").length} /><Kpi label="Awaiting vehicle" value={dispatches.filter((d) => ["Dispatch Created", "Packing Complete"].includes(d.status)).length} tone="warn" /><Kpi label="Dispatch value today" value={lakh(dispatches.filter((d) => ["Loading", "In Transit"].includes(d.status)).reduce((s, d) => s + d.value, 0))} /></div>
      <DataTable rows={dispatches} rowKey={(d) => d.id} pageSize={10} exportName="dispatch" searchPlaceholder="Search dispatch, customer, vehicle…" selectable
        filters={[{ key: "st", label: "Status", options: DISPATCH_FLOW.slice(1), match: (r, v) => r.status === v }]}
        expand={(d) => <Stepper stages={DISPATCH_FLOW} current={d.stage} />}
        cols={[{ key: "id", header: "Dispatch", render: (d) => <span className="font-medium">{d.id}</span> }, { key: "customer", header: "Customer" }, { key: "so", header: "Order", muted: true }, { key: "product", header: "Products" }, { key: "qty", header: "Quantity", align: "right", render: (d) => num(d.qty) }, { key: "packages", header: "Packages", align: "right" }, { key: "value", header: "Value", align: "right", render: (d) => lakh(d.value) }, { key: "wh", header: "Warehouse", muted: true, defaultHidden: true }, { key: "transporter", header: "Transporter", muted: true }, { key: "vehicle", header: "Vehicle", muted: true }, { key: "status", header: "Status", render: (d) => <Pill>{d.status}</Pill> }, { key: "eta", header: "Expected delivery", render: (d) => fdate(d.eta) }]} />
      <Card className="mt-4"><p className="text-[12.5px] text-mute">Expand a dispatch to see its stage. Dispatch is blocked automatically if the batch is on QC hold or the customer is over their credit limit.</p></Card>
    </div>
  );
}
