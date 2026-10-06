// ₹ formatting in the Indian system (lakh / crore) — owners think in these units.
export function inr(n, { compact = true, sign = false } = {}) {
  if (n == null || Number.isNaN(n)) return "—";
  const neg = n < 0;
  const a = Math.abs(n);
  let s;
  if (!compact) s = "₹" + Math.round(a).toLocaleString("en-IN");
  else if (a >= 1e7) s = "₹" + (a / 1e7).toFixed(2) + " Cr";
  else if (a >= 1e5) s = "₹" + (a / 1e5).toFixed(a >= 1e6 ? 1 : 2).replace(/\.?0+$/, "") + "L";
  else if (a >= 1e3) s = "₹" + (a / 1e3).toFixed(a >= 1e4 ? 0 : 1).replace(/\.0$/, "") + "K";
  else s = "₹" + Math.round(a);
  return (neg ? "−" : sign ? "+" : "") + s;
}
export const full = (n) => inr(n, { compact: false });
export const pct = (n, d = 0) => (n == null ? "—" : n.toFixed(d) + "%");
export const num = (n, d = 0) => (n == null ? "—" : Number(n).toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: d }));
export const hm = (min) => `${Math.floor(min / 60)}h ${String(Math.round(min % 60)).padStart(2, "0")}m`;
export const initials = (name) => name.split(" ").map((p) => p[0]).slice(0, 2).join("");
const PAL = ["#3a4a6b", "#5b4a6b", "#2f5d56", "#6b4a3a", "#4a5b6b", "#6b3a4a", "#3a6b4f", "#5a5a3a"];
export const avatarColor = (name) => PAL[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % PAL.length];
export const cx = (...a) => a.filter(Boolean).join(" ");
export function toCSV(rows, cols) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [cols.map((c) => esc(c.label)).join(","), ...rows.map((r) => cols.map((c) => esc(c.csv ? c.csv(r) : r[c.key])).join(","))].join("\n");
}
