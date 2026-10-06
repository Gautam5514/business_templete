"use client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Plus } from "lucide-react";
import DataTable from "@/components/table";
import { Chip, Insight, Kpis, PageHead, Prog, Mono } from "@/components/ui";
import { AMCS } from "@/data/ops";
import { inr, amcTone } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function AMC() {
  const router = useRouter(), { setOverlay } = useApp();
  const cols = useMemo(() => [
    { key: "cust", label: "Customer", render: (a) => <span style={{ fontWeight: 600 }}>{a.cust}</span> },
    { key: "id", label: "Contract", render: (a) => <Mono href={`/amc/${a.id}`}>{a.id}</Mono> },
    { key: "scope", label: "Coverage" }, { key: "assets", label: "Assets", right: true }, { key: "start", label: "Start" }, { key: "expiry", label: "Expiry" },
    { key: "used", label: "Visits", render: (a) => <span style={{ display: "inline-flex", gap: 8, alignItems: "center", width: 100 }}><span style={{ width: 54 }}><Prog v={a.used} max={a.incl} /></span>{a.used}/{a.incl}</span>, sort: (a) => a.used / a.incl, csv: (a) => `${a.used}/${a.incl}` },
    { key: "next", label: "Next visit" }, { key: "value", label: "Value", right: true, render: (a) => inr(a.value) },
    { key: "margin", label: "Margin", right: true, render: (a) => { const m = ((a.value - a.cost) / a.value) * 100; return <b className={m < 8 ? "neg" : m < 25 ? "warn" : "pos"}>{m.toFixed(0)}%</b>; }, sort: (a) => (a.value - a.cost) / a.value, csv: (a) => (((a.value - a.cost) / a.value) * 100).toFixed(1) },
    { key: "prob", label: "Renewal prob.", render: (a) => <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><span style={{ width: 46 }}><Prog v={a.prob} tone={a.prob > 75 ? "g" : a.prob > 60 ? "a" : "r"} /></span>{a.prob}%</span> },
    { key: "status", label: "Status", render: (a) => <Chip tone={amcTone(a.status)} dot>{a.status}</Chip> },
  ], []);
  const views = [{ name: "All", count: AMCS.length }, { name: "Expiring", filter: (a) => a.status === "Expiring", count: AMCS.filter((a) => a.status === "Expiring").length }, { name: "Visits overdue", filter: (a) => a.status === "Overdue visit" }, { name: "Renewal at risk", filter: (a) => a.prob < 65 }, { name: "Unprofitable", filter: (a) => (a.value - a.cost) / a.value < 0.08 }];
  return (
    <div className="page">
      <PageHead title="AMC Contracts" sub="1,204 active contracts — visits, renewals and profitability tracked per contract.">
        <button className="btn pri" onClick={() => setOverlay({ type: "create", kind: "Create AMC" })}><Plus size={14} /> New AMC</button>
      </PageHead>
      <Insight tone="r"><b>City Hospital’s ₹4.8L AMC expires in 12 days and renewal has not yet started.</b> 7 contracts worth ₹18.6L expire this month; 3 of them are below 65% renewal probability.</Insight>
      <Kpis cols={6} items={[{ label: "Active AMCs", value: "1,204" }, { label: "Expiring this month", value: "7", tone: "r", hint: "₹18.6L renewal value" }, { label: "Visits due", value: "18", hint: "this week", tone: "a" }, { label: "Visits overdue", value: "5", tone: "r", hint: "oldest 9 days" }, { label: "Renewal value (90d)", value: "₹62.4L" }, { label: "AMC revenue / month", value: "₹17.2L", tone: "g" }]} />
      <DataTable title="AMC contracts" rows={AMCS} cols={cols} views={views} searchKeys={["cust", "id", "scope"]} onRow={(a) => router.push(`/amc/${a.id}`)} />
    </div>
  );
}
