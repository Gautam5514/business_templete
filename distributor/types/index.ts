export type WhId = "RNC" | "DHN" | "PAT";
export type Warehouse = { id: WhId; name: string; city: string; manager: string };

export type Segment = "Platinum" | "Gold" | "Silver" | "New" | "At Risk";
export type Behaviour = "Excellent" | "Good" | "Delayed" | "Risky";
export type Customer = {
  id: string; code: string; name: string; city: string; state: string; territory: string;
  rep: string; segment: Segment; creditLimit: number; outstanding: number; overdue: number;
  oldestDays: number; lastOrder: string; totalSales: number; orders: number; behaviour: Behaviour;
  since: number; avgDelay: number; phone: string; gstin: string; contact: string;
};

export type Product = {
  id: string; sku: string; name: string; category: string; price: number; cost: number;
  gst: number; unit: string; weight: number;
  sales: number; units: number; growth: number; margin: number;
};
export type StockRow = {
  sku: string; wh: WhId; physical: number; reserved: number; packed: number; transit: number;
  damaged: number; reorder: number;
};

export type OrderStatus =
  | "Draft" | "Pending Approval" | "Approved" | "Stock Allocated" | "Packing" | "Ready"
  | "Dispatched" | "In Transit" | "Delivered" | "Partially Delivered" | "Cancelled";
export type Line = { sku: string; qty: number; price: number; disc: number; gst: number };
export type Order = {
  id: string; custId: string; city: string; rep: string; lines: Line[]; freight: number;
  items: number; qty: number; value: number; stock: "Available" | "Partial Stock" | "Out of Stock";
  terms: string; date: string; expDispatch: string; status: OrderStatus; wh: WhId;
  allocated: number; packed: number; dispatched: number; delivered: number; invoiceId?: string; dispatchId?: string;
};

export type InvStatus = "Paid" | "Partially Paid" | "Unpaid" | "Overdue";
export type Invoice = {
  id: string; orderId: string; custId: string; date: string; due: string; lines: Line[];
  freight: number; taxable: number; gst: number; discount: number; total: number;
  paid: number; balance: number; status: InvStatus; shipmentId?: string;
};
export type PayMethod = "Cash" | "Bank Transfer" | "UPI" | "Cheque" | "NEFT" | "RTGS" | "Credit Adjustment";
export type Payment = {
  id: string; custId: string; invoiceId: string; amount: number; method: PayMethod; ref: string;
  by: string; date: string; notes: string;
};

export type DispatchStatus = "Pending Packing" | "Packing" | "Ready" | "Vehicle Assigned" | "Dispatched";
export type Dispatch = {
  id: string; orderId: string; custId: string; wh: WhId; packages: number; qty: number;
  weight: number; value: number; transporter: string; vehicle: string; driver: string;
  phone: string; expected: string; departure?: string; status: DispatchStatus; shipmentId?: string;
};
export type ShipStatus =
  | "Scheduled" | "Loading" | "Dispatched" | "In Transit" | "Reached Hub" | "Out For Delivery"
  | "Delivered" | "Delayed" | "Issue";
export type Shipment = {
  id: string; dispatchId: string; orderId: string; custId: string; route: string[]; at: number;
  eta: string; status: ShipStatus; vehicle: string; driver: string; phone: string; transporter: string;
  value: number; qty: number; contact: string; pod: string; note?: string;
};

export type Employee = {
  id: string; name: string; role: string; dept: string; location: string; phone: string;
  joined: string; stats: { label: string; value: string }[]; status: "Active" | "On Leave";
};
