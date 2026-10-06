export type RoleId = "owner" | "sales_manager" | "sales_exec" | "warehouse" | "accounts" | "logistics" | "admin";
export type Role = { id: RoleId; label: string; person: string; title: string; modules: string[] };

const ALL = ["dashboard", "orders", "customers", "products", "inventory", "warehouses", "purchase", "dispatch", "shipments", "invoices", "payments", "receivables", "returns", "expenses", "employees", "reports", "logs", "assistant", "settings"];

export const ROLES: Role[] = [
  { id: "owner", label: "Owner / Director", person: "Rajesh Agarwal", title: "Managing Director", modules: ALL },
  { id: "sales_manager", label: "Sales Manager", person: "Rahul Singh", title: "Sales Manager", modules: ["dashboard", "orders", "customers", "products", "inventory", "receivables", "returns", "reports", "assistant"] },
  { id: "sales_exec", label: "Sales Executive", person: "Amit Kumar", title: "Sales Executive", modules: ["dashboard", "orders", "customers", "products", "receivables", "assistant"] },
  { id: "warehouse", label: "Warehouse Manager", person: "Manoj Prasad", title: "Warehouse Manager — Ranchi", modules: ["dashboard", "orders", "products", "inventory", "warehouses", "purchase", "dispatch", "returns", "assistant"] },
  { id: "accounts", label: "Accounts Manager", person: "Priya Sharma", title: "Accounts Manager", modules: ["dashboard", "customers", "invoices", "payments", "receivables", "returns", "expenses", "reports", "assistant"] },
  { id: "logistics", label: "Logistics Manager", person: "Vikash Kumar", title: "Logistics Manager", modules: ["dashboard", "orders", "dispatch", "shipments", "returns", "expenses", "assistant"] },
  { id: "admin", label: "Admin", person: "Neha Gupta", title: "Admin & HR", modules: ["dashboard", "employees", "logs", "settings", "assistant"] },
];
export const OWNER_MODULES = ["dashboard", "orders", "receivables", "inventory", "reports", "assistant"];
export const ROLE_PERMS: Record<string, string[]> = {
  owner: ["Everything", "Approve credit overrides", "View margins & profitability"],
  sales_manager: ["Customers", "Quotations", "Orders & approvals", "Credit limits (≤ ₹10L)"],
  sales_exec: ["Create orders", "Assigned dealers only", "Log follow-ups"],
  warehouse: ["Stock", "Packing", "Dispatch", "Transfers"],
  accounts: ["Invoices", "Payments", "Outstanding", "Credit notes"],
  logistics: ["Vehicles", "Transporters", "Deliveries", "Freight expenses"],
  admin: ["Employees", "Permissions", "Configuration", "Audit logs"],
};
