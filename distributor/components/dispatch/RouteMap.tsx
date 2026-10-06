"use client";
import type { Shipment } from "@/types";
import { cn } from "@/components/ui/ui";

const GEO: Record<string, [number, number]> = {
  Ranchi: [85.33, 23.34], Ramgarh: [85.56, 23.63], Bokaro: [86.15, 23.67], Dhanbad: [86.43, 23.8], Jamshedpur: [86.2, 22.8], Hazaribagh: [85.36, 23.99], Giridih: [86.3, 24.19],
  Deoghar: [86.7, 24.49], Dumka: [87.25, 24.27], Patna: [85.14, 25.59], Gaya: [85.0, 24.79], Muzaffarpur: [85.39, 26.12], Bhagalpur: [87.0, 25.24], Purnia: [87.47, 25.78],
  Kolkata: [88.36, 22.57], Howrah: [88.31, 22.59], Asansol: [86.98, 23.68], Durgapur: [87.31, 23.52], Siliguri: [88.43, 26.72], Tatisilwai: [85.45, 23.28], Chandil: [86.05, 22.96],
  Jehanabad: [84.99, 25.21], Hajipur: [85.21, 25.69], Barh: [85.71, 25.48], Munger: [86.47, 25.37], Begusarai: [86.13, 25.42], Katihar: [87.57, 25.54], Kishanganj: [87.94, 26.1],
  Jamtara: [86.8, 23.96], Topchanchi: [86.2, 23.95], Bardhaman: [87.86, 23.23],
};
const W = 760, H = 420, X0 = 84.4, X1 = 89.0, Y0 = 22.2, Y1 = 27.1;
const pt = (c: string): [number, number] | null => { const g = GEO[c.replace(" Dealer", "")]; return g ? [((g[0] - X0) / (X1 - X0)) * W, H - ((g[1] - Y0) / (Y1 - Y0)) * H] : null; };

export function RouteMap({ shipments, focus, height = 340 }: { shipments: Shipment[]; focus?: string; height?: number }) {
  const cities = new Set<string>();
  const active = shipments.filter((s) => !["Delivered"].includes(s.status));
  shipments.forEach((s) => s.route.forEach((r) => cities.add(r.replace(" Dealer", ""))));
  const show = focus ? active.filter((s) => s.id === focus).concat(shipments.filter((s) => s.id === focus && s.status === "Delivered")) : active;
  const labelled = focus ? new Set(show.flatMap((s) => s.route.map((r) => r.replace(" Dealer", "")))) : new Set(["Ranchi", "Dhanbad", "Patna", "Kolkata", "Jamshedpur", "Siliguri", "Bhagalpur", "Gaya", "Bokaro"]);
  // fit the viewport to what is being shown
  const pool = (focus ? show : active.length ? active : shipments).flatMap((s) => s.route.map(pt)).filter(Boolean) as [number, number][];
  let vb = `0 0 ${W} ${H}`;
  let k = 1;
  if (focus && pool.length) {
    const xs = pool.map((p) => p[0]), ys = pool.map((p) => p[1]);
    const pad = 70;
    let x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
    const ar = W / H;
    let w = x1 - x0, h = y1 - y0;
    if (w / h < ar) { const nw = h * ar; x0 -= (nw - w) / 2; w = nw; } else { const nh = w / ar; y0 -= (nh - h) / 2; h = nh; }
    vb = `${x0.toFixed(1)} ${y0.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`;
    k = w / W;
  }
  return (
    <div className="overflow-hidden rounded-[8px] border border-line bg-[#fbfbfa]">
      <svg viewBox={vb} style={{ height }} className="w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Shipment route map">
        <defs><pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#e4e3de" /></pattern></defs>
        <rect x="-400" y="-400" width={W + 800} height={H + 800} fill="url(#dots)" />
        {show.map((s) => {
          const pts = s.route.map(pt).filter(Boolean) as [number, number][];
          if (pts.length < 2) return null;
          const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
          const done = pts.slice(0, Math.min(s.at, pts.length - 1) + 1).map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
          const cur = pts[Math.min(s.at, pts.length - 1)];
          const isF = s.id === focus;
          return (
            <g key={s.id} opacity={focus && !isF ? 0.25 : 1}>
              <path d={d} fill="none" stroke="#c9c7bf" strokeWidth={(isF ? 2.5 : 1.5) * k} strokeDasharray={`${4 * k} ${4 * k}`} />
              <path d={done} fill="none" stroke={s.status === "Issue" || s.status === "Delayed" ? "#b42318" : "#3a3fc4"} strokeWidth={(isF ? 3 : 2) * k} />
              <g transform={`translate(${cur[0]} ${cur[1]})`}>
                <circle r={(isF ? 11 : 8) * k} fill={s.status === "Issue" || s.status === "Delayed" ? "#b42318" : "#3a3fc4"} opacity=".15" className="live-dot" />
                <circle r={(isF ? 5.5 : 4) * k} fill={s.status === "Issue" || s.status === "Delayed" ? "#b42318" : "#3a3fc4"} stroke="#fff" strokeWidth={1.5 * k} />
              </g>
            </g>
          );
        })}
        {Array.from(cities).map((c) => {
          const p = pt(c);
          if (!p) return null;
          const major = ["Ranchi", "Dhanbad", "Patna"].includes(c);
          return (
            <g key={c} transform={`translate(${p[0]} ${p[1]})`}>
              <circle r={(major ? 5 : 3) * k} fill={major ? "#1b1b19" : "#fff"} stroke="#1b1b19" strokeWidth={1.25 * k} />
              {(labelled.has(c) || major) && <text x={7 * k} y={4 * k} fontSize={11 * k} fill="#4b4a45" fontWeight={major ? 600 : 400} style={{ paintOrder: "stroke" }} stroke="#fbfbfa" strokeWidth={3 * k}>{c}</text>}
            </g>
          );
        })}
      </svg>
      <div className={cn("flex flex-wrap items-center gap-4 border-t border-line bg-surface px-3 py-2 text-[11.5px] text-mute")}>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-accent" />Vehicle</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-bad" />Delayed / issue</span><span className="flex items-center gap-1.5"><i className="h-0.5 w-4 bg-accent" />Travelled</span><span className="flex items-center gap-1.5"><i className="h-0.5 w-4 border-t border-dashed border-line-strong" />Remaining</span>
      </div>
    </div>
  );
}
