"use client";
import { useState } from "react";
import { Btn, Card, Kpi, Pill } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { MRP } from "@/data/orders";
import { useStore } from "@/lib/store";
import { num } from "@/lib/format";

export function Mrp() {
  const { createPR, toast, prs } = useStore();
  const [done, setDone] = useState({});
  const rows = MRP.map((m) => ({ ...m, key: m.code }));
  const short = rows.filter((r) => r.shortage > 0);
  const make = (r) => {
    const id = createPR({ material: r.name, qty: r.recommend, unit: r.unit, by: "2026-10-09", priority: "Urgent", reason: "Projected shortage from MRP run", suppliers: [r.supplier] });
    setDone((d) => ({ ...d, [r.code]: id }));
    toast(`${id} created`, "ok", `${num(r.recommend)} ${r.unit} ${r.name} · pending approval`);
  };
  const existing = (r) => done[r.code] ?? prs.find((p) => p.material.replace("Coil", "").trim() === r.name.replace("Sheet", "").trim() && p.status !== "Ordered")?.id;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Materials planned" value={rows.length} sub="From 6 active production plans" />
        <Kpi label="Short materials" value={short.length} tone={short.length ? "bad" : undefined} sub="Projected shortage after incoming" />
        <Kpi label="Biggest shortage" value="9,700 kg" sub="SS 304 Sheet 1.2mm" tone="bad" />
        <Kpi label="Work orders affected" value="3" sub="WO-2841 · WO-2849 · WO-2855" tone="warn" />
      </div>
      <DataTable
        rows={rows} rowKey={(r) => r.code} exportName="mrp" pageSize={10} defaultSort={{ key: "shortage", dir: "desc" }}
        searchPlaceholder="Search material…"
        filters={[{ key: "s", label: "Status", options: ["Shortage", "Covered"], match: (r, v) => (v === "Shortage" ? r.shortage > 0 : r.shortage === 0) }]}
        cols={[
          { key: "name", header: "Material", render: (r) => <div><div className="font-medium">{r.name}</div><div className="text-[11.5px] text-mute">{r.code}</div></div> },
          { key: "required", header: "Production demand", align: "right", render: (r) => `${num(r.required)} ${r.unit}` },
          { key: "onhand", header: "Current stock", align: "right", render: (r) => num(r.onhand) },
          { key: "reserved", header: "Reserved", align: "right", render: (r) => num(r.reserved) },
          { key: "incoming", header: "Incoming PO", align: "right", render: (r) => num(r.incoming) },
          { key: "shortage", header: "Projected shortage", align: "right", render: (r) => r.shortage ? <b className="text-bad">{num(r.shortage)} {r.unit}</b> : <span className="text-ok">Covered</span> },
          { key: "recommend", header: "Recommended buy", align: "right", render: (r) => r.recommend ? `${num(r.recommend)} ${r.unit}` : "—" },
          { key: "supplier", header: "Preferred supplier", muted: true },
          { key: "act", header: "Action", sortable: false, render: (r) => r.shortage ? (existing(r) ? <Pill tone="info">{existing(r)} raised</Pill> : <Btn size="xs" variant="primary" onClick={() => make(r)}>Create Purchase Requisition</Btn>) : <span className="text-faint">—</span> },
        ]}
        expand={(r) => <div className="text-[12.5px] text-mute">Projected shortage = demand {num(r.required)} − (stock {num(r.onhand)} − reserved {num(r.reserved)}) − incoming {num(r.incoming)} = <b className="text-ink">{num(r.shortage)} {r.unit}</b>. Recommendation includes a 5% buffer for scrap and nesting loss.</div>}
      />
      <Card><p className="text-[12.5px] text-mute">MRP explodes every planned work order through its BOM, nets off stock already reserved for other orders, and adds open purchase orders. SS 304 Sheet is slit from SS 304 Coil, so the requisition is raised on the coil (PR-1838).</p></Card>
    </div>
  );
}
