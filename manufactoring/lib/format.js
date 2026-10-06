export const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
export function lakh(n, dp = 2) {
  const a = Math.abs(n), s = n < 0 ? "-" : "";
  if (a >= 1e7) return `${s}₹${(a / 1e7).toFixed(2)} Cr`;
  if (a >= 1e5) return `${s}₹${(a / 1e5).toFixed(dp)} L`;
  return `${s}₹${Math.round(a).toLocaleString("en-IN")}`;
}
export const lakhShort = (n) => {
  const a = Math.abs(n);
  if (a === 0) return "₹0";
  if (a >= 1e7) return `₹${(a / 1e7).toFixed(2)}Cr`;
  if (a >= 1e5) return `₹${(a / 1e5).toFixed(1)}L`;
  return `₹${Math.round(a / 1e3)}K`;
};
export const num = (n) => Math.round(n).toLocaleString("en-IN");
export const pct = (n, dp = 1) => `${n.toFixed(dp)}%`;
export const hm = (min) => `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}m`;

export const NOW = new Date("2026-10-06T11:20:00");
const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fdate(d, withYear = false) {
  const x = typeof d === "string" ? new Date(d) : d;
  return `${String(x.getDate()).padStart(2, "0")} ${M[x.getMonth()]}${withYear ? " " + x.getFullYear() : ""}`;
}
export function ftime(d) {
  const x = typeof d === "string" ? new Date(d) : d;
  let h = x.getHours();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${String(x.getMinutes()).padStart(2, "0")} ${ap}`;
}
export const fdt = (d) => `${fdate(d)}, ${ftime(d)}`;
