export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

export function lakh(n: number, dp = 2) {
  const a = Math.abs(n);
  const s = n < 0 ? "-" : "";
  if (a >= 1e7) return `${s}₹${(a / 1e7).toFixed(2)} Cr`;
  if (a >= 1e5) return `${s}₹${(a / 1e5).toFixed(dp)} L`;
  return `${s}₹${Math.round(a).toLocaleString("en-IN")}`;
}
export const lakhShort = (n: number) => {
  const a = Math.abs(n);
  if (a === 0) return "₹0";
  if (a >= 1e7) return `₹${(a / 1e7).toFixed(2)}Cr`;
  if (a >= 1e5) return `₹${(a / 1e5).toFixed(1)}L`;
  return `₹${Math.round(a / 1e3)}K`;
};
export const num = (n: number) => Math.round(n).toLocaleString("en-IN");

export const NOW = new Date("2026-10-06T19:12:00");
const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fdate(d: string | Date, withYear = false) {
  const x = typeof d === "string" ? new Date(d) : d;
  return `${String(x.getDate()).padStart(2, "0")} ${M[x.getMonth()]}${withYear ? " " + x.getFullYear() : ""}`;
}
export function ftime(d: string | Date) {
  const x = typeof d === "string" ? new Date(d) : d;
  let h = x.getHours();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${String(x.getMinutes()).padStart(2, "0")} ${ap}`;
}
export const fdt = (d: string | Date) => `${fdate(d)}, ${ftime(d)}`;
export const daysBetween = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / 864e5);
export const addDays = (d: string | Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
export const iso = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
};
export const pct = (n: number, dp = 1) => `${n >= 0 ? "+" : ""}${n.toFixed(dp)}%`;
