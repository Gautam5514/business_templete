"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUp, Sparkles } from "lucide-react";
import { answer, SUGGESTED } from "./answers";
import { Bar, cn, TONES } from "@/components/ui/ui";

function Block({ b }) {
  if (b.t === "p") return <p className="text-[13px] leading-relaxed">{b.text}</p>;
  if (b.t === "action") return <p className="rounded-[6px] border border-accent/25 bg-accent-soft px-3 py-2 text-[12.5px] font-medium text-accent-ink">{b.text}</p>;
  if (b.t === "list") return <ul className="space-y-1">{b.items.map((i, k) => <li key={k} className="flex gap-2 text-[13px]"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-faint" />{i}</li>)}</ul>;
  if (b.t === "metrics") return <div className="flex flex-wrap gap-2">{b.items.map((m, k) => <div key={k} className="min-w-[110px] rounded-[6px] border border-line bg-panel px-3 py-2"><div className="text-[10.5px] uppercase tracking-[0.06em] text-faint">{m.k}</div><div className={cn("num text-[16px] font-semibold", m.tone && TONES[m.tone].text)}>{m.v}</div></div>)}</div>;
  if (b.t === "bars") return <div className="space-y-2">{b.items.map(([k, v], i) => <div key={k} className="flex items-center gap-3"><span className="w-5 text-[12px] text-faint">{i + 1}.</span><span className="w-52 text-[13px]">{k}</span><Bar value={v} max={6} tone="bad" className="max-w-[160px] flex-1" /><span className="num w-14 text-[12.5px] font-semibold">{v} days</span></div>)}</div>;
  if (b.t === "rank") return (
    <ol className="space-y-1.5">{b.items.map(([h, d, tone, href], i) => {
      const inner = <><span className={cn("num flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] text-[11px] font-bold text-white")} style={{ background: TONES[tone].var }}>{i + 1}</span><span><span className="block text-[13px] font-semibold">{h}</span><span className="block text-[12.5px] text-mute">{d}</span></span></>;
      return <li key={i}>{href ? <Link href={href} className="flex gap-2.5 rounded-[6px] border border-line bg-surface p-2.5 hover:border-line-strong">{inner}</Link> : <div className="flex gap-2.5 rounded-[6px] border border-line bg-surface p-2.5">{inner}</div>}</li>;
    })}</ol>
  );
  return null;
}

function Answer({ a, typing }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <h3 className={cn("text-[15px] font-semibold tracking-[-0.01em]", typing && "caret")}>{a.title}</h3>
      {!typing && a.blocks.map((b, i) => <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }}><Block b={b} /></motion.div>)}
    </motion.div>
  );
}

export function Assistant({ seed, compact }) {
  const [msgs, setMsgs] = useState([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef(null);
  const ask = (text) => {
    if (!text.trim() || busy) return;
    setBusy(true); setQ("");
    setMsgs((m) => [...m, { q: text, a: answer(text), typing: true }]);
    setTimeout(() => { setMsgs((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, typing: false } : x))); setBusy(false); }, 900);
  };
  const seeded = useRef(false);
  useEffect(() => { if (seed && !seeded.current) { seeded.current = true; ask(seed); } }, [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs]);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="scroll-thin flex-1 overflow-y-auto">
        {msgs.length === 0 ? (
          <div className={cn("mx-auto max-w-2xl", compact ? "py-4" : "py-10")}>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[10px] bg-ink text-bg"><Sparkles size={20} /></div>
            <h2 className="display text-[28px] font-semibold leading-tight">Ask SiteControl</h2>
            <p className="mt-1 text-[13.5px] text-mute">Every answer is computed from live site, material, contractor and billing data across all 7 projects.</p>
            <div className="mt-6 grid gap-1.5 sm:grid-cols-2">
              {SUGGESTED.map((s) => <button key={s} onClick={() => ask(s)} className="lift rounded-[6px] border border-line bg-surface px-3 py-2 text-left text-[13px]">“{s}”</button>)}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 py-4">
            {msgs.map((m, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-end"><div className="max-w-[80%] rounded-[10px] rounded-br-[2px] bg-ink px-3.5 py-2 text-[13px] text-bg">{m.q}</div></div>
                <div className="rounded-[10px] border border-line bg-surface p-4"><Answer a={m.a} typing={m.typing} /></div>
              </div>
            ))}
            <div ref={end} />
          </div>
        )}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="mx-auto mt-3 flex w-full max-w-3xl items-center gap-2 rounded-[10px] border border-line-strong bg-surface p-1.5 pl-3.5 shadow-sm focus-within:border-accent">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask anything about your projects, cost, progress or sites..." className="h-9 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-faint" />
        <button disabled={!q.trim() || busy} className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-ink text-bg disabled:opacity-30"><ArrowUp size={16} /></button>
      </form>
    </div>
  );
}
