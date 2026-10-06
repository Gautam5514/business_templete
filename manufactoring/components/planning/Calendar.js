"use client";
import { useRef, useState } from "react";
import { Btn, Card, Pill, cn } from "@/components/ui/ui";
import { CAL_DAYS, CAL_ROWS } from "@/data/orders";
import { useStore } from "@/lib/store";
import { num } from "@/lib/format";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dow = (d) => DOW[new Date(2026, 9, d).getDay()];
const tone = { done: "bg-panel border-line-strong text-mute", run: "bg-accent text-white border-accent", plan: "bg-info-soft text-info border-info/30", late: "bg-warn-soft text-warn border-warn/40" };

export function Calendar() {
  const { toast } = useStore();
  const [rows, setRows] = useState(CAL_ROWS);
  const [sel, setSel] = useState(null);
  const grid = useRef(null);
  const drag = useRef(null);
  const colW = () => (grid.current ? grid.current.getBoundingClientRect().width / CAL_DAYS.length : 80);
  const start = CAL_DAYS[0];

  const move = (li, wo, delta) => setRows((rs) => rs.map((r, i) => i !== li ? r : { ...r, blocks: r.blocks.map((b) => b.wo === wo ? { ...b, s: Math.max(start, b.s + delta), e: b.e + delta } : b) }));
  const onDown = (e, li, b) => {
    setSel(b.wo);
    if (b.tone === "done") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { li, wo: b.wo, x: e.clientX, moved: 0 };
  };
  const onMove = (e) => {
    const d = drag.current; if (!d) return;
    const dd = Math.round(((e.clientX - d.x) / colW()) * 4) / 4;
    if (dd !== d.moved) { move(d.li, d.wo, dd - d.moved); d.moved = dd; }
  };
  const onUp = () => { const d = drag.current; drag.current = null; if (d && d.moved) toast(`${d.wo} rescheduled`, "ok", `${d.moved > 0 ? "+" : ""}${d.moved} day(s) · material & capacity re-checked`); };

  const selB = rows.flatMap((r, li) => r.blocks.map((b) => ({ ...b, li, line: r.line }))).find((b) => b.wo === sel);
  const fmt = (x) => { const d = Math.floor(x); const h = Math.round((x - d) * 24); return `${String(d).padStart(2, "0")} Oct ${String(h).padStart(2, "0")}:00`; };

  return (
    <div className="space-y-4">
      <Card title="Production Calendar" sub="Drag a planned work order left or right to reschedule — running and completed orders are locked" action={<div className="flex items-center gap-3 text-[12px] text-mute">{[["Completed", "bg-panel"], ["Running", "bg-accent"], ["Planned", "bg-info-soft"], ["At risk", "bg-warn-soft"]].map(([k, c]) => <span key={k} className="flex items-center gap-1.5"><span className={cn("h-2.5 w-2.5 rounded-[2px] border border-line-strong", c)} />{k}</span>)}</div>} pad={false}>
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            <div className="grid" style={{ gridTemplateColumns: `130px 1fr` }}>
              <div className="border-b border-r border-line bg-bg px-3 py-2 label">Line</div>
              <div className="grid border-b border-line bg-bg" style={{ gridTemplateColumns: `repeat(${CAL_DAYS.length}, 1fr)` }}>
                {CAL_DAYS.map((d) => <div key={d} className={cn("border-r border-line px-2 py-1.5 text-center last:border-r-0", d === 6 && "bg-accent-soft")}><div className="num text-[12px] font-semibold">{d} Oct</div><div className="text-[10.5px] text-mute">{dow(d)}{d === 6 && " · today"}</div></div>)}
              </div>
              {rows.map((r, li) => (
                <div key={r.line} className="contents">
                  <div className="border-b border-r border-line px-3 py-3"><div className="text-[13px] font-semibold">{r.line}</div><div className="text-[11.5px] text-mute">{r.plant}</div></div>
                  <div ref={li === 0 ? grid : undefined} className="relative h-[84px] border-b border-line" onPointerMove={onMove} onPointerUp={onUp}>
                    <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${CAL_DAYS.length}, 1fr)` }}>{CAL_DAYS.map((d) => <div key={d} className={cn("border-r border-line last:border-r-0", d === 6 && "bg-accent-soft/40", [4, 11].includes(d) && "")} />)}</div>
                    {r.blocks.map((b) => (
                      <div key={b.wo} onPointerDown={(e) => onDown(e, li, b)} style={{ left: `${((b.s - start) / CAL_DAYS.length) * 100}%`, width: `${((b.e - b.s) / CAL_DAYS.length) * 100}%` }}
                        className={cn("absolute top-2.5 h-[60px] touch-none select-none overflow-hidden rounded-[6px] border px-2 py-1.5 text-[11.5px] leading-tight shadow-sm", tone[b.tone], b.tone !== "done" && "cursor-grab active:cursor-grabbing", sel === b.wo && "ring-2 ring-accent/50")}>
                        <div className="truncate font-semibold">{b.wo}</div><div className="truncate opacity-90">{b.product}</div><div className="num truncate opacity-80">{num(b.qty)} units</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
      <Card title={selB ? `${selB.wo} · ${selB.product}` : "Select a work order"} sub={selB ? `${selB.line} · ${num(selB.qty)} units` : "Click a block to see its schedule and nudge it by half a day"}>
        {selB ? (
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[13px]">
            <div><div className="label">Start</div><div className="num">{fmt(selB.s)}</div></div>
            <div><div className="label">Finish</div><div className="num">{fmt(selB.e)}</div></div>
            <div><div className="label">Status</div><Pill tone={selB.tone === "run" ? "ok" : selB.tone === "late" ? "warn" : selB.tone === "done" ? "neutral" : "info"}>{{ done: "Completed", run: "Running", plan: "Planned", late: "At risk" }[selB.tone]}</Pill></div>
            <div className="ml-auto flex items-center gap-2">
              <Btn size="sm" icon={<ChevronLeft size={14} />} disabled={selB.tone === "done" || selB.tone === "run"} onClick={() => move(selB.li, selB.wo, -0.5)}>½ day earlier</Btn>
              <Btn size="sm" disabled={selB.tone === "done" || selB.tone === "run"} onClick={() => move(selB.li, selB.wo, 0.5)}>½ day later <ChevronRight size={14} /></Btn>
              <Link href={`/production/${selB.wo}`} className="inline-flex h-7 items-center rounded-[6px] bg-accent px-2.5 text-[12.5px] font-medium text-white">Open WO</Link>
            </div>
          </div>
        ) : <p className="text-[13px] text-mute">Capacity check: Line 2 is 88% booked through 12 Oct; Line 3 is at 96% and blocked until brass cartridge arrives.</p>}
      </Card>
    </div>
  );
}
