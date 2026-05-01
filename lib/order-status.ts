export type CanonicalOrderStatus =
  | "payment_pending_verification"
  | "confirmed"
  | "roasting"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export const ORDER_STATUS_SEQUENCE: CanonicalOrderStatus[] = [
  "payment_pending_verification",
  "confirmed",
  "roasting",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

export const ORDER_STATUS_OPTIONS: Array<{
  value: CanonicalOrderStatus;
  label: string;
}> = [
  { value: "payment_pending_verification", label: "Payment Pending Verification" },
  { value: "confirmed", label: "Confirmed" },
  { value: "roasting", label: "Roasting" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export const ORDER_STATUS_DISPLAY: Record<
  CanonicalOrderStatus,
  { label: string; color: string; icon: string }
> = {
  payment_pending_verification: {
    label: "Payment Pending Verification",
    color: "#F59E0B",
    icon: "Receipt",
  },
  confirmed: { label: "Confirmed", color: "#EAB308", icon: "CheckCircle" },
  roasting: { label: "Roasting", color: "#D97706", icon: "Flame" },
  packed: { label: "Packed", color: "#A16207", icon: "PackageCheck" },
  shipped: { label: "Shipped", color: "#2563EB", icon: "Truck" },
  out_for_delivery: { label: "Out for Delivery", color: "#7C3AED", icon: "MapPin" },
  delivered: { label: "Delivered", color: "#16A34A", icon: "BadgeCheck" },
  cancelled: { label: "Cancelled", color: "#EF4444", icon: "CircleX" },
};

export function normalizeOrderStatus(status: string): CanonicalOrderStatus {
  switch (status) {
    case "pending":
      return "confirmed";
    case "processing":
    case "brewing":
      return "roasting";
    case "payment_pending_verification":
    case "confirmed":
    case "roasting":
    case "packed":
    case "shipped":
    case "out_for_delivery":
    case "delivered":
    case "cancelled":
      return status;
    default:
      return "confirmed";
  }
}

export function isOrderStatus(status: string): status is CanonicalOrderStatus {
  return ORDER_STATUS_OPTIONS.some((option) => option.value === status);
}

export function getOrderStatusIndex(status: string): number {
  const normalized = normalizeOrderStatus(status);
  return ORDER_STATUS_SEQUENCE.indexOf(normalized);
}
