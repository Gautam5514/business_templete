"use client";
import { useState } from "react";
import { Camera, Plus } from "lucide-react";
import { GATE, MATERIALS, MAT_STATUS } from "@/data/ops";
import { projName, PROJECTS } from "@/data/core";
import { Btn, Card, Field, inputCls, Modal, Pill } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { num } from "@/lib/format";
import { useStore } from "@/lib/store";
import { daysOfStock } from "./Materials";

export function InventorySection({ pid }) {
  const rows = MATERIALS.filter((m) => !pid || m.p === pid).map((m, i) => {
    const rec = +(m.received * 0.03).toFixed(1), con = +(m.consumed * 0.025).toFixed(1), wst = +(m.wastage * 0.02).toFixed(1), tr = i % 7 === 3 ? +(m.stock * 0.05).toFixed(1) : 0;
    return { ...m, id: m.id, received_d: rec, transferred: tr, consumed_d: con, wastage_d: wst, opening: +(m.stock - rec + con + wst + tr).toFixed(1) };
  });
  return (
    <Card title="Site inventory — today’s movement" sub="Opening → received → transferred → consumed → closing" pad={false}>
      <DataTable exportName="site-inventory" pageSize={10} dense searchKeys={["name"]} selectable
        filters={[{ key: "status", label: "Status", options: ["Healthy", "Low_", "Out"], get: (r) => r.status }]}
        columns={[
          ...(pid ? [] : [{ key: "p", label: "Site", render: (r) => <span className="text-mute">{projName(r.p)}</span>, sort: (r) => projName(r.p) }]),
          { key: "name", label: "Material", render: (r) => <b className="font-medium">{r.name}</b> }, { key: "unit", label: "Unit" },
          { key: "opening", label: "Opening", align: "right", render: (r) => num(r.opening, 1) },
          { key: "received_d", label: "Received", align: "right", render: (r) => <span className="text-good">+{num(r.received_d, 1)}</span> },
          { key: "transferred", label: "Transferred", align: "right", render: (r) => (r.transferred ? `−${num(r.transferred, 1)}` : "—") },
          { key: "consumed_d", label: "Consumed", align: "right", render: (r) => `−${num(r.consumed_d, 1)}` },
          { key: "wastage_d", label: "Wastage", align: "right", render: (r) => <span className="text-risk">{num(r.wastage_d, 1)}</span> },
          { key: "stock", label: "Closing", align: "right", render: (r) => <b>{num(r.stock, 1)}</b> },
          { key: "min", label: "Min level", align: "right", render: (r) => num(r.min) },
          { key: "status", label: "Status", render: (r) => <Pill tone={MAT_STATUS[r.status][1]}>{MAT_STATUS[r.status][0]}</Pill>, csv: (r) => MAT_STATUS[r.status][0] },
        ]} rows={rows} />
    </Card>
  );
}

export function GateEntry({ pid }) {
  const { toast, log } = useStore();
  const [list, setList] = useState(GATE);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ p: "skyline", vehicle: "", supplier: "", po: "", material: "", challan: "", qty: "", driver: "", weight: "" });
  const rows = list.filter((g) => !pid || g.p === pid);
  const save = () => {
    const id = `GE-${7732 + list.length - GATE.length}`;
    setList([{ ...f, id, entry: "Just now", by: "Arjun Mehta" }, ...list]);
    log(`Gate entry ${id}: ${f.material || "material"} received (${f.vehicle || "vehicle"}).`, "Store Manager", f.p);
    toast(`${id} recorded`); setOpen(false);
  };
  return (
    <>
      <Card title="Site gate entry" sub="Every vehicle in — vehicle, challan, weight, photo" pad={false} action={<Btn size="sm" variant="primary" onClick={() => setOpen(true)}><Plus size={13} /> Record delivery</Btn>}>
        <DataTable exportName="gate-entries" pageSize={6} dense searchKeys={["vehicle", "supplier", "material", "po"]} columns={[
          { key: "id", label: "Entry", render: (r) => <span className="num font-medium">{r.id}</span> },
          { key: "vehicle", label: "Vehicle", render: (r) => <span className="num">{r.vehicle}</span> },
          { key: "supplier", label: "Supplier" }, { key: "po", label: "PO", render: (r) => <span className="num text-accent-ink">{r.po}</span> },
          { key: "material", label: "Material" }, { key: "challan", label: "Challan" }, { key: "qty", label: "Qty", align: "right" },
          { key: "weight", label: "Weight", align: "right" }, { key: "driver", label: "Driver" }, { key: "entry", label: "Entry time" }, { key: "by", label: "Received by" },
          { key: "photo", label: "Photo", render: () => <Camera size={14} className="text-mute" />, csv: () => "" },
        ]} rows={rows} />
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="Record gate entry" footer={<><Btn onClick={() => setOpen(false)}>Cancel</Btn><Btn variant="primary" onClick={save}>Save entry</Btn></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Site" className="col-span-2"><select className={inputCls} value={f.p} onChange={(e) => setF({ ...f, p: e.target.value })}>{PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
          {[["vehicle", "Vehicle number"], ["driver", "Driver"], ["supplier", "Supplier"], ["po", "PO number"], ["material", "Material"], ["qty", "Quantity"], ["challan", "Challan"], ["weight", "Weight"]].map(([k, l]) => <Field key={k} label={l}><input className={inputCls} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></Field>)}
          <div className="col-span-2 flex h-16 items-center justify-center rounded-[6px] border border-dashed border-line-strong text-[12.5px] text-mute"><Camera size={15} className="mr-2" /> Capture vehicle & challan photo</div>
        </div>
      </Modal>
    </>
  );
}
