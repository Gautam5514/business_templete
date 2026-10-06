"use client";
import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { Btn, Modal, PageHeader } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { useStore } from "@/lib/store";
import { COSTS, INVOICES, profitability } from "@/data/finance";
import { DOWNTIME_CATS, FG, MAINT, POS, PROD_TREND } from "@/data/ops";
import { MACHINES, MATERIALS, SUPPLIERS } from "@/data/masters";
import { ISSUES, REJECTIONS, SALES_ORDERS, WIP, WORK_ORDERS } from "@/data/orders";
import { inr, lakh, num } from "@/lib/format";

const T = (cols, rows) => ({ cols: cols.map(([key, header, align]) => ({ key, header, align })), rows: rows.map((r, i) => ({ ...r, _k: i })) });
const REPORTS = [
  ["Production", "Production Summary", "Units by day vs target", () => T([["label", "Day"], ["actual", "Actual", "right"], ["target", "Target", "right"]], PROD_TREND)],
  ["Production", "Production Efficiency", "Efficiency by machine", () => T([["id", "Machine"], ["type", "Type"], ["eff", "Efficiency %", "right"], ["out", "Output", "right"]], MACHINES)],
  ["Production", "Work Order Report", "Status, progress and due dates", () => T([["id", "Work order"], ["product", "Product"], ["planned", "Planned", "right"], ["produced", "Produced", "right"], ["status", "Status"]], WORK_ORDERS.slice(0, 16))],
  ["Material", "Raw Material Consumption", "Standard vs issued", () => T([["id", "Issue"], ["wo", "WO"], ["material", "Material"], ["std", "Standard", "right"], ["actual", "Issued", "right"]], ISSUES)],
  ["Material", "Material Variance", "Over-issue by work order", () => T([["id", "Issue"], ["material", "Material"], ["variance", "Variance", "right"], ["vpct", "Var %", "right"]], ISSUES.map((i) => ({ ...i, vpct: i.vpct.toFixed(1) })))],
  ["Material", "Inventory", "Raw material stock & status", () => T([["name", "Material"], ["cur", "Stock", "right"], ["avail", "Available", "right"], ["status", "Status"]], MATERIALS)],
  ["Production", "WIP", "Work in progress by order", () => T([["wo", "Work order"], ["product", "Product"], ["total", "Units", "right"], ["age", "Age (d)", "right"]], WIP)],
  ["Material", "Finished Goods", "Stock vs reservations", () => T([["product", "Product"], ["available", "Available", "right"], ["reserved", "Reserved", "right"], ["status", "Status"]], FG)],
  ["Quality", "Quality", "Defects by reason", () => T([["defect", "Defect"], ["wo", "WO"], ["rejected", "Rejected", "right"], ["machine", "Machine"]], REJECTIONS)],
  ["Quality", "Rejection", "Rejection by shift & machine", () => T([["date", "Date"], ["product", "Product"], ["rejected", "Rejected", "right"], ["shift", "Shift"]], REJECTIONS)],
  ["Quality", "Scrap", "Scrap weight & value", () => T([["wo", "WO"], ["scrap", "Scrap units", "right"], ["scrapKg", "Kg", "right"], ["scrapValue", "Value (₹)", "right"]], REJECTIONS)],
  ["Assets", "Machine Efficiency", "Utilization by machine", () => T([["id", "Machine"], ["status", "Status"], ["runMin", "Run min", "right"], ["eff", "Eff %", "right"]], MACHINES)],
  ["Assets", "Downtime", "Minutes by category", () => T([["cat", "Category"], ["min", "Minutes", "right"], ["lost", "Lost units", "right"], ["cost", "Cost ₹", "right"]], DOWNTIME_CATS)],
  ["Assets", "Maintenance", "PM and breakdown work", () => T([["id", "Task"], ["machine", "Machine"], ["type", "Type"], ["status", "Status"]], MAINT)],
  ["Purchase", "Purchase", "Open and received POs", () => T([["id", "PO"], ["supplier", "Supplier"], ["material", "Material"], ["value", "Value ₹", "right"], ["status", "Status"]], POS)],
  ["Purchase", "Supplier Performance", "OTD, quality and rejection", () => T([["name", "Supplier"], ["otd", "OTD %", "right"], ["quality", "Quality %", "right"], ["rej", "Rej %", "right"]], SUPPLIERS)],
  ["Finance", "Production Cost", "Standard vs actual per unit", () => T([["wo", "WO"], ["std", "Std ₹", "right"], ["perUnit", "Actual ₹", "right"], ["total", "Total ₹", "right"]], COSTS)],
  ["Sales", "Order Fulfilment", "Sales orders and dispatch dates", () => T([["id", "Order"], ["customer", "Customer"], ["qty", "Qty", "right"], ["status", "Status"]], SALES_ORDERS)],
  ["Sales", "Customer Sales", "Invoices by customer", () => T([["id", "Invoice"], ["customer", "Customer"], ["amount", "Amount ₹", "right"], ["status", "Status"]], INVOICES)],
  ["Finance", "Profitability", "Margin by product", () => T([["product", "Product"], ["price", "Price ₹", "right"], ["cost", "Cost ₹", "right"], ["margin", "Margin %", "right"]], profitability)],
];
const GROUPS = ["Production", "Material", "Quality", "Assets", "Purchase", "Sales", "Finance"];

export default function Reports() {
  const [open, setOpen] = useState(null);
  const { toast } = useStore();
  const data = open ? open[3]() : null;
  return (
    <div>
      <PageHeader title="Reports Center" sub="20 standard reports — preview, filter and export any of them." />
      <div className="space-y-6">
        {GROUPS.map((g) => (
          <section key={g}>
            <h2 className="label mb-2">{g}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {REPORTS.filter((r) => r[0] === g).map((r) => (
                <button key={r[1]} onClick={() => setOpen(r)} className="flex items-start gap-3 rounded-[8px] border border-line bg-surface p-3.5 text-left transition-colors hover:border-accent hover:bg-bg"><span className="mt-0.5 rounded-[6px] bg-accent-soft p-1.5 text-accent"><FileText size={15} /></span><span><span className="block text-[13.5px] font-semibold">{r[1]}</span><span className="block text-[12px] text-mute">{r[2]}</span></span></button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <Modal open={!!open} onClose={() => setOpen(null)} width={820} title={open?.[1]} sub={open?.[2]} footer={<><Btn onClick={() => setOpen(null)}>Close</Btn><Btn variant="primary" icon={<Download size={14} />} onClick={() => { toast("Report exported", "ok", `${open[1]}.pdf`); setOpen(null); }}>Export PDF</Btn></>}>
        {data && <DataTable rows={data.rows} rowKey={(r) => r._k} cols={data.cols.map((c) => ({ ...c, render: (r) => (typeof r[c.key] === "number" ? num(r[c.key]) : String(r[c.key] ?? "")) }))} pageSize={10} maxH="360px" />}
      </Modal>
    </div>
  );
}
void inr; void lakh;
