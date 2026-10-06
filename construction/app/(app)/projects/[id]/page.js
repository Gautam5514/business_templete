"use client";
import { Suspense, use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { getProject } from "@/data/core";
import { Btn, Card, Insight, Tabs, Pill } from "@/components/ui/ui";
import Overview, { ProjectHero } from "@/components/projects/Overview";
import BuildingProgress from "@/components/projects/BuildingProgress";
import { CriticalPath, Gantt, MilestoneTimeline } from "@/components/projects/Timeline";
import { BoqSection } from "@/components/boq/Boq";
import { BudgetSection, ProjectCashflow, Profitability, ProfitLeaks } from "@/components/finance/Budget";
import { MaterialsSection } from "@/components/materials/Materials";
import { InventorySection, GateEntry } from "@/components/materials/Inventory";
import { MrTable, PoTable, SupplierCompare } from "@/components/procurement/Procurement";
import { ContractorBills, ContractorsSection } from "@/components/site/Contractors";
import { LabourSection } from "@/components/site/Labour";
import { DprSection } from "@/components/site/Dpr";
import { QualitySection, SafetySection } from "@/components/quality/Quality";
import { EquipmentSection } from "@/components/site/Equipment";
import { ChangeOrders, MeasurementBook, PaymentsSection, RaTable, VendorBillsSection } from "@/components/finance/Billing";
import { ActivitySection, DocumentsSection, TasksSection } from "@/components/finance/Misc";
import { PhotoGallery, ProgressCompare } from "@/components/site/Photos";
import { useStore } from "@/lib/store";

const TABS = ["Overview", "Visual Progress", "Timeline", "BOQ", "Budget", "Tasks", "Materials", "Procurement", "Contractors", "Labour", "Daily Progress", "Quality", "Safety", "Equipment", "Bills", "Payments", "Documents", "Photos", "Activity", "AI Insights"];
const slug = (t) => t.toLowerCase().replace(/\s+/g, "-");

function Insights({ p }) {
  const { setAskOpen, setAskSeed } = useStore();
  const base = {
    skyline: [["warn", "Schedule", "Tower B slab is the critical path. Steel for L12–L14 columns arrives 09 Oct; every day of delay shifts masonry start by ~0.75 days."], ["accent", "Cost", "TMT steel rates rose 6.2% since PO-1760. Claiming ₹1.3 Cr escalation recovery under clause 11.4 protects the 17.9% margin."], ["warn", "Cash", "RA-13 (≈₹1.6 Cr of measured work) is not yet billed. Billing this week brings collection forward by ~20 days."], ["accent", "Productivity", "Masonry crew is at 85.5% of target. Adding 4 masons for 10 days recovers the gap at +₹38K cost."]],
    orion: [["bad", "Cash", "RA Bill #08 (₹72.4L) is 18 days overdue. Client has certified it — only payment is pending."], ["warn", "Material", "Steel cover is ~2 days. Tata Steel PO-1822 delivered only 22 of 40 MT."], ["warn", "Quality", "Basement waterproofing failed inspection QI-2479; rework adds ~₹3.4L and 3 days."]],
    riverside: [["bad", "Schedule", "11 days behind plan. Steel delay (5d) + manpower (3d) + rain (2d) + crane (1d)."], ["bad", "Cost", "Delay-driven overrun now projected at ₹14.8L; margin down to 9.4%."], ["accent", "Recovery", "Expedite 18 MT steel and add 8 workers for 5 days → 4–5 days recovered."]],
    metro: [["bad", "Budget", "89% of budget used for 83% of work — projected overrun ₹11.4L."], ["warn", "Quality", "Two failed tile inspections and 7 open snags; hold Shree Interiors’ next bill."], ["warn", "Change order", "CO-044 (₹8.4L, +6 days) unapproved — executing before approval risks non-payment."]],
  }[p.id] || [["accent", "Overall", `${p.name} is ${p.status.toLowerCase()} — ${p.pct}% complete against ${p.planned}% planned.`], ["accent", "Cost", `Projected margin ${p.margin}%; budget consumption ${p.budget}% vs ${p.pct}% progress.`], ["accent", "Outlook", `${p.days} days remain; no critical-path risks flagged this week.`]];
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">{base.map(([t, h, b]) => <div key={h} className="lift rounded-[8px] border border-line bg-surface p-4"><Pill tone={t === "accent" ? "accent" : t} dot={false}>{h}</Pill><p className="mt-2 text-[13.5px] leading-relaxed">{b}</p></div>)}</div>
      <Btn variant="primary" onClick={() => { setAskSeed(`Why is ${p.name} ${p.status === "On Track" ? "on track" : "delayed"}?`); setAskOpen(true); }}><Sparkles size={14} /> Ask SiteControl about {p.name}</Btn>
    </div>
  );
}

function Body({ p, id }) {
  const router = useRouter(), sp = useSearchParams();
  const initial = TABS.find((t) => slug(t) === sp.get("tab")) || "Overview";
  const [tab, setTabState] = useState(initial);
  const setTab = (t) => { setTabState(t); window.history.replaceState(null, "", `?tab=${slug(t)}`); };
  const s = (k) => ({ pid: id });
  const content = {
    Overview: <Overview p={p} go={setTab} />,
    "Visual Progress": p.id === "skyline" ? <div className="space-y-5"><BuildingProgress /><ProgressCompare pid={id} /></div> : <div className="space-y-5"><Card title="Phase progress" sub="Tower-wise breakdown is configured for Skyline Residency in this demo"><MilestoneTimeline p={p} /></Card><ProgressCompare pid={id} /></div>,
    Timeline: <div className="space-y-5"><Card title="Milestones"><MilestoneTimeline p={p} /></Card>{p.id === "skyline" ? <><Gantt /><CriticalPath /></> : <Insight>The detailed Gantt and critical-path view is shown for Skyline Residency in this demo.</Insight>}</div>,
    BOQ: <BoqSection pid={id} />,
    Budget: <div className="space-y-5"><BudgetSection pid={id} /><ProjectCashflow pid={id} /><Profitability pid={id} /><ProfitLeaks pid={id} /></div>,
    Tasks: <TasksSection pid={id} />,
    Materials: <div className="space-y-5"><MaterialsSection pid={id} /><InventorySection pid={id} /></div>,
    Procurement: <div className="space-y-5">{id === "skyline" && <SupplierCompare />}<MrTable pid={id} /><PoTable pid={id} /><GateEntry pid={id} /></div>,
    Contractors: <div className="space-y-5"><ContractorsSection pid={id} /><ContractorBills pid={id} /></div>,
    Labour: <LabourSection pid={id} />,
    "Daily Progress": <DprSection pid={id} />,
    Quality: <QualitySection pid={id} />,
    Safety: <SafetySection pid={id} />,
    Equipment: <EquipmentSection pid={id} />,
    Bills: <div className="space-y-5"><RaTable pid={id} /><MeasurementBook pid={id} /><ChangeOrders pid={id} /><VendorBillsSection pid={id} /></div>,
    Payments: <div className="space-y-5"><PaymentsSection pid={id} /><ProjectCashflow pid={id} /></div>,
    Documents: <DocumentsSection pid={id} />,
    Photos: <div className="space-y-5"><ProgressCompare pid={id} /><PhotoGallery pid={id} /></div>,
    Activity: <ActivitySection pid={id} />,
    "AI Insights": <Insights p={p} />,
  }[tab];
  return (
    <div className="space-y-4">
      <Link href="/projects" className="inline-flex items-center gap-1 text-[12.5px] text-mute hover:text-ink"><ChevronLeft size={14} /> All projects</Link>
      <ProjectHero p={p} />
      <div className="sticky top-0 z-30 -mx-4 bg-bg/90 px-4 backdrop-blur sm:-mx-6 sm:px-6"><Tabs tabs={TABS} value={tab} onChange={setTab} /></div>
      <div className="pt-1">{content}</div>
    </div>
  );
}

export default function ProjectPage({ params }) {
  const { id } = use(params);
  const p = getProject(id);
  if (!p) notFound();
  return <Suspense fallback={<div className="p-10 text-mute">Loading project…</div>}><Body p={p} id={id} /></Suspense>;
}
