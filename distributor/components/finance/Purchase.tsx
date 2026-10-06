"use client";
import { useState } from "react";
import { Plus, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import { Btn, Card, PageHeader, Pill, Stepper, Tabs } from "@/components/ui/ui";
import { DataTable, type Col } from "@/components/ui/table";
import { PO_STAGES, SUPPLIERS, type PO, type Supplier } from "@/data/misc";
import { fdate, inr, lakh } from "@/lib/format";

export function Purchase() {
  const { pos, advancePO, openQuick, toast } = useStore();
  const [tab, setTab] = useState<"Purchase Orders" | "Suppliers">("Purchase Orders");
  const open = pos.filter((p) => p.stage < 8);
  const poCols: Col<PO>[] = [
    { key: "id", header: "PO", render: (p) => <span className="num font-medium">{p.id}</span> },
    { key: "supplier", header: "Supplier" },
    { key: "items", header: "Items", muted: true },
    { key: "wh", header: "Deliver to", muted: true },
    { key: "value", header: "Value", align: "right", render: (p) => <b>{inr(p.value)}</b> },
    { key: "eta", header: "ETA", get: (p) => p.eta, render: (p) => <span className="num text-mute">{fdate(p.eta)}</span> },
    { key: "stage", header: "Stage", get: (p) => p.stage, render: (p) => <Pill tone={p.stage >= 8 ? "ok" : p.stage >= 4 ? "info" : "warn"}>{PO_STAGES[p.stage]}</Pill> },
    { key: "act", header: "", sortable: false, render: (p) => p.stage < 8 ? <div onClick={(e) => e.stopPropagation()}><Btn size="xs" onClick={() => { advancePO(p.id); toast(`${p.id} → ${PO_STAGES[p.stage + 1]}`, "ok", p.supplier); }}>→ {PO_STAGES[p.stage + 1]}</Btn></div> : null },
  ];
  const sCols: Col<Supplier>[] = [
    { key: "name", header: "Supplier", render: (s) => <span className="font-medium">{s.name}</span> },
    { key: "category", header: "Category", muted: true },
    { key: "city", header: "City", muted: true },
    { key: "value", header: "Purchase Value", align: "right", render: (s) => lakh(s.value) },
    { key: "pending", header: "Pending Orders", align: "right" },
    { key: "payable", header: "Payable", align: "right", render: (s) => <b className={s.payable ? "" : "text-faint"}>{lakh(s.payable)}</b> },
    { key: "lead", header: "Lead Time", align: "right", render: (s) => `${s.lead} days` },
    { key: "last", header: "Last Purchase", get: (s) => s.last, render: (s) => <span className="num text-mute">{fdate(s.last)}</span> },
    { key: "rating", header: "Rating", align: "right", render: (s) => <span className="inline-flex items-center gap-1"><Star size={12} className="fill-[#d4a017] text-[#d4a017]" />{s.rating.toFixed(1)}</span> },
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Purchase" sub="From purchase request to supplier payment." actions={<Btn variant="primary" icon={<Plus size={15} />} onClick={() => openQuick("po")}>Create Purchase Order</Btn>} />
      <Card pad><Stepper stages={PO_STAGES} current={-1} /></Card>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[["Open purchase orders", String(open.length)], ["Value on order", lakh(open.reduce((a, p) => a + p.value, 0))], ["Payable to suppliers", lakh(SUPPLIERS.reduce((a, s) => a + s.payable, 0))], ["Avg. lead time", "8.4 days"]].map(([l, v]) => <div key={l} className="rounded-[8px] border border-line bg-surface p-3"><div className="label">{l}</div><div className="num mt-1 text-[22px] font-semibold tracking-tight">{v}</div></div>)}
      </div>
      <Tabs tabs={["Purchase Orders", "Suppliers"] as const} value={tab} onChange={setTab} />
      {tab === "Purchase Orders" ? (
        <DataTable rows={pos} cols={poCols} rowKey={(p) => p.id} pageSize={10} exportName="purchase-orders" searchPlaceholder="Search PO, supplier, item…" defaultSort={{ key: "id", dir: "desc" }}
          filters={[{ key: "stage", label: "Stage", options: PO_STAGES, match: (p, v) => PO_STAGES[p.stage] === v }, { key: "wh", label: "Deliver to", options: ["Ranchi", "Dhanbad", "Patna"], match: (p, v) => p.wh === v }]}
          expand={(p) => <div className="space-y-3"><Stepper stages={PO_STAGES} current={p.stage} /><div className="text-[12.5px] text-mute">Raised {fdate(p.date)} by {p.by} · {p.items}</div></div>} />
      ) : <DataTable rows={SUPPLIERS} cols={sCols} rowKey={(s) => s.name} pageSize={10} exportName="suppliers" searchPlaceholder="Search supplier…" />}
    </div>
  );
}
