"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUp, Sparkles } from "lucide-react";
import { ask, SUGGESTIONS, type Answer } from "@/lib/ai";
import { useStore } from "@/lib/store";
import { Skeleton, cn } from "@/components/ui/ui";

type Msg = { id: number; q: string; a?: Answer };
let mid = 1;

export function AskPanel({ seed, full, onNavigate }: { seed?: string; full?: boolean; onNavigate?: () => void }) {
  const store = useStore();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const lastSeed = useRef("");

  const submit = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const id = mid++;
    setMsgs((m) => [...m, { id, q: t }]);
    setQ("");
    setTimeout(() => setMsgs((m) => m.map((x) => (x.id === id ? { ...x, a: ask(t, store) } : x))), 650);
  };

  useEffect(() => {
    if (seed && seed !== lastSeed.current) { lastSeed.current = seed; submit(seed); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {msgs.length === 0 && (
          <div className={cn("mx-auto", full ? "max-w-2xl pt-6" : "")}>
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-[8px] bg-accent-soft text-accent"><Sparkles size={18} /></div>
            <h3 className="text-[18px] font-semibold tracking-tight">Ask Your Business</h3>
            <p className="mt-1 text-[13px] text-mute">Plain-English answers from your live orders, stock, dispatches, invoices and payments — no reports to build.</p>
            <div className="mt-5 label">Try asking</div>
            <div className="mt-2 grid gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => submit(s)} className="group flex items-center justify-between rounded-[6px] border border-line bg-surface px-3 py-2 text-left text-[13px] hover:border-accent/40 hover:bg-accent-soft/40">
                  <span>“{s}”</span><ArrowRight size={14} className="text-faint group-hover:text-accent" />
                </button>
              ))}
            </div>
          </div>
        )}
        <div className={cn("space-y-5", full && "mx-auto max-w-2xl")}>
          {msgs.map((m) => (
            <div key={m.id} className="space-y-3">
              <div className="flex justify-end"><div className="max-w-[85%] rounded-[10px] rounded-br-[3px] bg-ink px-3 py-2 text-[13px] text-white">{m.q}</div></div>
              {!m.a ? (
                <div className="rounded-[10px] border border-line bg-surface p-4"><Skeleton className="h-5 w-2/3" /><Skeleton className="mt-3 h-3.5 w-full" /><Skeleton className="mt-2 h-3.5 w-4/5" /></div>
              ) : (
                <div className="slide-up rounded-[10px] border border-line bg-surface p-4">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-accent"><Sparkles size={12} /> Answer from live data</div>
                  <h4 className="text-[17px] font-semibold leading-snug tracking-tight">{m.a.title}</h4>
                  {m.a.text && <p className="mt-1.5 text-[13px] text-mute">{m.a.text}</p>}
                  {m.a.stats && (
                    <div className="mt-3 grid grid-cols-3 gap-2">{m.a.stats.map((s) => <div key={s.label} className="rounded-[6px] bg-panel p-2.5"><div className="label !text-[10px]">{s.label}</div><div className="num mt-0.5 text-[15px] font-semibold">{s.value}</div></div>)}</div>
                  )}
                  {m.a.list && (
                    <ul className="mt-3 divide-y divide-line rounded-[6px] border border-line">
                      {m.a.list.map((l, i) => {
                        const inner = (<><div className="min-w-0"><div className="truncate text-[13px] font-medium">{l.label}</div>{l.sub && <div className="truncate text-[12px] text-mute">{l.sub}</div>}</div><div className="num shrink-0 text-[13px] font-semibold">{l.value}</div></>);
                        return <li key={i}>{l.href ? <Link href={l.href} onClick={onNavigate} className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-bg">{inner}</Link> : <div className="flex items-center justify-between gap-3 px-3 py-2">{inner}</div>}</li>;
                      })}
                    </ul>
                  )}
                  {m.a.link && <Link href={m.a.link.href} onClick={onNavigate} className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-[6px] bg-accent px-3 text-[13px] font-medium text-white hover:bg-accent-ink">{m.a.link.label}<ArrowRight size={14} /></Link>}
                  {m.a.follow && <div className="mt-3 flex flex-wrap gap-1.5">{m.a.follow.map((f) => <button key={f} onClick={() => submit(f)} className="rounded-full border border-line-strong px-2.5 py-1 text-[12px] text-mute hover:border-accent hover:text-accent">{f}</button>)}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); submit(q); }} className="border-t border-line bg-surface p-3">
        <div className={cn("flex items-center gap-2 rounded-[8px] border border-line-strong bg-surface px-3 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15", full && "mx-auto max-w-2xl")}>
          <Sparkles size={15} className="text-accent" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask anything about your business..." className="h-10 flex-1 bg-transparent text-[13.5px] placeholder:text-faint focus:outline-none" />
          <button type="submit" disabled={!q.trim()} className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-accent text-white disabled:bg-line-strong" aria-label="Ask"><ArrowUp size={15} /></button>
        </div>
      </form>
    </div>
  );
}
