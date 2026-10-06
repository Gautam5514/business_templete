"use client";
import { useEffect, useRef, useState } from "react";

export default function SignaturePad({ onChange, height = 110 }) {
  const ref = useRef(null), drawing = useRef(false), [has, setHas] = useState(false);
  useEffect(() => { const c = ref.current, r = c.getBoundingClientRect(); c.width = r.width * 2; c.height = r.height * 2; const x = c.getContext("2d"); x.scale(2, 2); x.lineWidth = 2; x.lineCap = "round"; x.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--ink") || "#111"; }, []);
  const pos = (e) => { const r = ref.current.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  return (
    <div style={{ position: "relative" }}>
      <canvas ref={ref} className="sig" style={{ width: "100%", height, display: "block" }}
        onPointerDown={(e) => { drawing.current = true; ref.current.setPointerCapture(e.pointerId); const x = ref.current.getContext("2d"), [a, b] = pos(e); x.beginPath(); x.moveTo(a, b); }}
        onPointerMove={(e) => { if (!drawing.current) return; const x = ref.current.getContext("2d"), [a, b] = pos(e); x.lineTo(a, b); x.stroke(); if (!has) { setHas(true); onChange?.(true); } }}
        onPointerUp={() => { drawing.current = false; }} />
      {!has && <span className="faint" style={{ position: "absolute", left: 12, top: 10, fontSize: 12, pointerEvents: "none" }}>Sign here</span>}
      {has && <button className="btn sm ghost" style={{ position: "absolute", right: 6, top: 6 }} onClick={() => { const c = ref.current; c.getContext("2d").clearRect(0, 0, c.width, c.height); setHas(false); onChange?.(false); }}>Clear</button>}
    </div>
  );
}
