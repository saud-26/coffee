export type CanonicalOrderStatus =
  | "payment_pending_verification"
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export const ORDER_STATUS_OPTIONS: Array<{
  value: CanonicalOrderStatus;
  label: string;
}> = [
  { value: "payment_pending_verification", label: "Payment Pending Verification" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
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
    icon: "🧾",
  },
  pending: { label: "Pending", color: "#EAB308", icon: "⏳" },
  processing: { label: "Processing", color: "#D97706", icon: "⚙️" },
  shipped: { label: "Shipped", color: "#2563EB", icon: "🚚" },
  delivered: { label: "Delivered", color: "#16A34A", icon: "✅" },
  cancelled: { label: "Cancelled", color: "#EF4444", icon: "❌" },
};

export function normalizeOrderStatus(status: string): CanonicalOrderStatus {
  switch (status) {
    case "brewing":
      return "processing";
    case "out_for_delivery":
      return "shipped";
    case "payment_pending_verification":
    case "pending":
    case "processing":
    case "shipped":
    case "delivered":
    case "cancelled":
      return status;
    default:
      return "pending";
  }
}

export function toLegacyOrderStatus(status: CanonicalOrderStatus): string {
  switch (status) {
    case "payment_pending_verification":
      return "pending";
    case "processing":
      return "brewing";
    case "shipped":
      return "out_for_delivery";
    default:
      return status;
  }
}
