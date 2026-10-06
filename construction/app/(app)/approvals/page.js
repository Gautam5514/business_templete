"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, CornerUpLeft, X } from "lucide-react";
import { CreditCard } from "lucide-react";
import { projName } from "@/data/core";
import { Btn, Pill, PageHead, Seg, cn } from "@/components/ui/ui";
import { rs } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function Approvals() {
  const { approvals, decide } = useStore();
  const [tab, setTab] = useState("pending"), [type, setType] = useState("All"), [open, setOpen] = useState(null), [comment, setComment] = useState("");
  const types = ["All", ...new Set(approvals.map((a) => a.type))];
  const list = approvals.filter((a) => (tab === "pending" ? a.state === "pending" : a.state !== "pending") && (type === "All" || a.type === type));
  const total = approvals.filter((a) => a.state === "pending").reduce((s, a) => s + a.amount, 0);
  return (
    <div>
      <PageHead icon={CreditCard} title="Approvals" sub={`${approvals.filter((a) => a.state === "pending").length} waiting on you · ${rs(total)} in total value.`} actions={<Seg options={[{ key: "pending", label: "Pending" }, { key: "done", label: "Decided" }]} value={tab} onChange={setTab} />} />
      <div className="mb-4 flex flex-wrap gap-1.5">{types.map((t) => <button key={t} onClick={() => setType(t)} className={cn("rounded-[4px] border px-2.5 py-1 text-[12px] font-medium", type === t ? "border-ink bg-ink text-bg" : "border-line text-mute hover:bg-panel")}>{t}</button>)}</div>
      <div className="space-y-2.5">
        {list.length === 0 && <div className="rounded-[8px] border border-dashed border-line-strong p-12 text-center text-mute">{tab === "pending" ? "Inbox zero. Nothing is waiting on you. ✨" : "No decisions yet."}</div>}
        {list.map((a) => (
          <div key={a.id} className={cn("rounded-[8px] border bg-surface p-4", a.priority === "Critical" ? "border-bad/40" : "border-line")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-semibold uppercase tracking-wider text-faint">{a.type}</span><span className="num text-[12px] font-semibold text-accent-ink">{a.ref}</span><Pill>{a.priority}</Pill>{a.state !== "pending" && <Pill tone={a.state === "approved" ? "good" : a.state === "rejected" ? "bad" : "warn"}>{a.state === "sent" ? "Sent back" : a.state}</Pill>}</div>
                <div className="mt-1 text-[15px] font-semibold">{a.title}</div>
                <div className="mt-0.5 text-[12.5px] text-mute">{projName(a.project)} · {a.by} · {a.age} ago</div>
                <div className="mt-1.5 text-[12.5px]">{a.note}</div>
              </div>
              <div className="text-right"><div className="num text-[20px] font-semibold">{rs(a.amount)}</div></div>
            </div>
            {a.state === "pending" && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                {open === a.id && <input autoFocus value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment…" className="h-8 min-w-[220px] flex-1 rounded-[6px] border border-line-strong bg-surface px-2.5 text-[13px] outline-none focus:border-accent" />}
                <div className="ml-auto flex gap-1.5">
                  {open !== a.id && <Btn size="sm" variant="ghost" onClick={() => { setOpen(a.id); setComment(""); }}>Comment</Btn>}
                  <Btn size="sm" variant="danger" onClick={() => { decide(a.id, "rejected", comment); setOpen(null); }}><X size={13} /> Reject</Btn>
                  <Btn size="sm" onClick={() => { decide(a.id, "sent", comment); setOpen(null); }}><CornerUpLeft size={13} /> Send back</Btn>
                  <Btn size="sm" variant="primary" onClick={() => { decide(a.id, "approved", comment); setOpen(null); }}><Check size={13} /> Approve</Btn>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
