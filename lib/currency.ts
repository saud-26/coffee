export function formatINR(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const hasDecimals = Math.abs(safeAmount % 1) > 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(safeAmount);
}

