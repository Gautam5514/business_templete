"use client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Plus } from "lucide-react";
import DataTable from "@/components/table";
import { Chip, Insight, Kpis, PageHead, Mono } from "@/components/ui";
import { ASSETS, custById } from "@/data/core";
import { inr } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function Assets() {
  const router = useRouter(), { setOverlay } = useApp();
  const cols = useMemo(() => [
    { key: "id", label: "Asset ID", render: (a) => <Mono href={`/assets/${a.id}`}>{a.id}</Mono> },
    { key: "cust", label: "Customer", render: (a) => custById(a.custId)?.name, sort: (a) => custById(a.custId)?.name, csv: (a) => custById(a.custId)?.name },
    { key: "loc", label: "Location" }, { key: "type", label: "Type" }, { key: "brand", label: "Brand" }, { key: "model", label: "Model" }, { key: "serial", label: "Serial", hide: true, style: { fontFamily: "var(--font-geist-mono)" } },
    { key: "installed", label: "Installed" }, { key: "warranty", label: "Warranty", render: (a) => <Chip tone={a.warranty === "Expired" ? "n" : "g"}>{a.warranty}</Chip> },
    { key: "amc", label: "AMC", render: (a) => <Chip tone={a.amc === "Active" ? "b" : "n"}>{a.amc}</Chip> }, { key: "last", label: "Last service" }, { key: "next", label: "Next service" },
    { key: "cond", label: "Condition", render: (a) => <Chip tone={a.cond === "Good" ? "g" : a.cond === "Fair" ? "n" : a.cond === "Needs attention" ? "a" : "r"} dot>{a.cond}</Chip> },
    { key: "repeat", label: "Repeat issues", right: true, render: (a) => a.repeat >= 3 ? <b className="neg">{a.repeat} / 90d</b> : a.repeat || <span className="faint">—</span> },
  ], []);
  const views = [{ name: "All", count: ASSETS.length }, ...["AC", "RO", "CCTV Camera", "DVR", "Geyser", "Refrigerator", "Electrical Panel", "Generator", "UPS"].map((t) => ({ name: t, filter: (a) => a.type === t })), { name: "Repeat failures", filter: (a) => a.repeat >= 3 }, { name: "Critical", filter: (a) => a.cond === "Critical" || a.cond === "Needs attention" }];
  return (
    <div className="page">
      <PageHead title="Assets" sub="Every AC, RO, camera, DVR, panel and generator we maintain — with warranty, AMC and service cost per asset.">
        <button className="btn pri" onClick={() => setOverlay({ type: "create", kind: "Add Asset" })}><Plus size={14} /> Add asset</button>
      </PageHead>
      <Insight tone="r"><b>{ASSETS.filter((a) => a.repeat >= 3).length} assets show repeat failures</b> — {inr(ASSETS.filter((a) => a.repeat >= 3).reduce((a, x) => a + x.cost, 0))} spent repairing equipment that may be cheaper to replace.</Insight>
      <Kpis items={[{ label: "Registered assets", value: "31,240" }, { label: "Under AMC", value: "18,460" }, { label: "Warranty expiring 30d", value: "212", tone: "a" }, { label: "Needs attention", value: ASSETS.filter((a) => a.cond === "Needs attention" || a.cond === "Critical").length * 12, tone: "r" }, { label: "Repeat-failure assets", value: ASSETS.filter((a) => a.repeat >= 3).length, tone: "r" }]} />
      <DataTable title="Assets" rows={ASSETS} cols={cols} views={views} searchKeys={["id", "brand", "model", "loc", "type", "serial"]} onRow={(a) => router.push(`/assets/${a.id}`)} />
    </div>
  );
}
