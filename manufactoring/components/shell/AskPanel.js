"use client";
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Send, Sparkles } from "lucide-react";
import { answer, SUGGESTED } from "@/lib/ai";
import { Btn } from "@/components/ui/ui";

export function AskPanel({ seed, onNavigate, full }) {
  const router = useRouter();
  const [msgs, setMsgs] = useState([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef(null);

  const ask = (text) => {
    const t = (text ?? q).trim();
    if (!t || busy) return;
    setQ(""); setBusy(true);
    setMsgs((m) => [...m, { role: "u", text: t }]);
    setTimeout(() => { setMsgs((m) => [...m, { role: "a", a: answer(t) }]); setBusy(false); }, 650);
  };
  useEffect(() => { if (seed) ask(seed); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [seed]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, busy]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {msgs.length === 0 && (
          <div>
            <div className="mb-1 text-[20px] font-semibold tracking-[-0.01em]">Ask Your Factory</div>
            <p className="mb-4 text-[13px] text-mute">Answers come straight from production, material, machine, quality and order data — no spreadsheets to chase.</p>
            <div className={full ? "grid gap-2 sm:grid-cols-2" : "space-y-2"}>
              {SUGGESTED.slice(0, 10).map((s) => (
                <button key={s} onClick={() => ask(s)} className="flex w-full items-center justify-between gap-2 rounded-[8px] border border-line bg-surface px-3 py-2.5 text-left text-[13px] hover:border-line-strong hover:bg-bg">
                  <span>“{s}”</span><ArrowRight size={13} className="shrink-0 text-faint" />
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => m.role === "u" ? (
          <div key={i} className="flex justify-end"><div className="max-w-[85%] rounded-[10px] rounded-br-[3px] bg-accent px-3 py-2 text-[13.5px] text-white">{m.text}</div></div>
        ) : (
          <div key={i} className="flex gap-2.5">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"><Sparkles size={13} /></span>
            <div className="min-w-0 flex-1 rounded-[10px] rounded-tl-[3px] border border-line bg-surface p-3.5">
              <h3 className="text-[15px] font-semibold leading-snug tracking-[-0.01em]">{m.a.title}</h3>
              <div className="mt-3 space-y-2.5">
                {m.a.sections.map((s) => (
                  <div key={s.h} className="border-l-2 border-line-strong pl-3">
                    <div className="num text-[13px] font-semibold">{s.h}</div>
                    {s.lines.map((l) => <div key={l} className="text-[12.5px] text-mute">{l}</div>)}
                  </div>
                ))}
              </div>
              {m.a.stat && <div className="mt-3 rounded-[6px] bg-panel px-3 py-2 text-[12.5px]"><span className="text-mute">{m.a.stat[0]}: </span><b className="num">{m.a.stat[1]}</b></div>}
              {m.a.note && <p className="mt-3 text-[12.5px] text-mute">{m.a.note}</p>}
              {m.a.cta && <div className="mt-3"><Btn variant="primary" size="sm" onClick={() => { onNavigate?.(); router.push(m.a.cta.href); }}>{m.a.cta.label}</Btn></div>}
            </div>
          </div>
        ))}
        {busy && <div className="flex items-center gap-2 text-[12.5px] text-mute"><Sparkles size={13} className="live-dot text-accent" />Checking production, material and machine data…</div>}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); ask(); }} className="shrink-0 border-t border-line bg-surface p-3">
        <div className="flex items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask anything about production, material, machines or orders..." className="h-10 min-w-0 flex-1 rounded-[8px] border border-line-strong bg-surface px-3 text-[13.5px] placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15" />
          <Btn type="submit" variant="primary" size="md" icon={<Send size={14} />} disabled={!q.trim() || busy} className="h-10">Ask</Btn>
        </div>
      </form>
    </div>
  );
}
