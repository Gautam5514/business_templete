"use client";
import { Check } from "lucide-react";
import { Btn, Card, Insight, Kpi, PageHeader, Pill, Progress, Tabs } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { Calendar } from "@/components/planning/Calendar";
import { Bom } from "@/components/planning/Bom";
import { Mrp } from "@/components/materials/Mrp";
import { useStore } from "@/lib/store";
import { useTab } from "@/lib/useTab";
import { PLANNING } from "@/data/orders";
import { fdate, num } from "@/lib/format";

function Plan() {
  const { toast } = useStore();
  const demand = PLANNING.reduce((s, p) => s + p.demand, 0), stock = PLANNING.reduce((s, p) => s + p.stock, 0), short = PLANNING.reduce((s, p) => s + p.shortage, 0), plan = PLANNING.reduce((s, p) => s + p.plan, 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Demand from sales orders" value={num(demand)} sub="units · 6 products" />
        <Kpi label="Available finished stock" value={num(stock)} sub="units free + reserved" />
        <Kpi label="Required production" value={num(short)} sub="units short" tone="warn" />
        <Kpi label="Planned production" value={num(plan)} sub="units across 4 lines" />
        <Kpi label="Raw material requirement" value="18,600 kg" sub="SS 304 sheet · 9,700 short" tone="bad" />
        <Kpi label="Machine capacity" value="84%" sub="booked next 7 days" />
      </div>
      <Insight>Kitchen Sink 24×18 needs <b>3,380</b> more units than stock covers. The plan of 3,500 is feasible on Line 2 by <b>09 Oct</b> — but only if the 9,700 kg steel shortage (PR-1838) is cleared by 08 Oct.</Insight>
      <DataTable
        rows={PLANNING.map((p) => ({ ...p, key: p.pid }))} rowKey={(r) => r.pid} exportName="production-plan" pageSize={10} searchPlaceholder="Search product…"
        toolbar={<Btn size="sm" variant="primary" icon={<Check size={14} />} onClick={() => toast("Plan approved", "ok", "6 work orders released · material reserved")}>Approve & release plan</Btn>}
        filters={[{ key: "priority", label: "Priority", options: ["High", "Medium", "Low"], match: (r, v) => r.priority === v }, { key: "line", label: "Line", options: ["Line 1", "Line 2", "Line 3", "Line 4"], match: (r, v) => r.line === v }]}
        expand={(r) => (
          <div className="grid gap-4 text-[12.5px] sm:grid-cols-3">
            <div><div className="label mb-1">Demand sources</div>{r.orders}</div>
            <div><div className="label mb-1">Material needed</div><b className="num">{num(r.materialQty)} {r.unit}</b> {r.material}</div>
            <div><div className="label mb-1">Line capacity booked</div><Progress value={r.cap} tone={r.cap > 90 ? "bad" : "accent"} /><div className="mt-1 text-mute">{r.cap}% of {r.line} over the plan window</div></div>
          </div>
        )}
        cols={[
          { key: "product", header: "Product", render: (r) => <span className="font-medium">{r.product}</span> },
          { key: "demand", header: "Demand", align: "right", render: (r) => num(r.demand) },
          { key: "stock", header: "Finished stock", align: "right", render: (r) => num(r.stock) },
          { key: "shortage", header: "Shortage", align: "right", render: (r) => <b className="text-warn">{num(r.shortage)}</b> },
          { key: "plan", header: "Planned production", align: "right", render: (r) => <b>{num(r.plan)}</b> },
          { key: "mat", header: "Required material", get: (r) => r.materialQty, render: (r) => <span>{num(r.materialQty)} {r.unit} <span className="text-mute">{r.material}</span></span> },
          { key: "line", header: "Assigned line" },
          { key: "start", header: "Start", render: (r) => fdate(r.start) },
          { key: "end", header: "Completion", render: (r) => fdate(r.end) },
          { key: "priority", header: "Priority", render: (r) => <Pill>{r.priority}</Pill> },
          { key: "status", header: "Status", render: (r) => <Pill>{r.status}</Pill> },
        ]}
      />
    </div>
  );
}

export default function Planning() {
  const [tab, setTab] = useTab(["plan", "calendar", "mrp", "bom"], "plan");
  return (
    <div>
      <PageHeader title="Production Planning" sub="Customer demand → required production → material → machine capacity → completion date." />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "plan", label: "Planning board" }, { id: "calendar", label: "Production calendar" }, { id: "mrp", label: "Material requirement (MRP)" }, { id: "bom", label: "Bill of materials" }]} />
      {tab === "plan" && <Plan />}
      {tab === "calendar" && <Calendar />}
      {tab === "mrp" && <Mrp />}
      {tab === "bom" && <Bom />}
    </div>
  );
}
