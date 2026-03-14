// ================================================================================
// Get Expiry Message
// ================================================================================
export function getExpiryMessage(
  discount_expires_at: string | undefined,
): string | null {
  //   Check if discount_expires_at is defined
  if (!discount_expires_at) return null;

  //   Convert discount_expires_at to a Date object
  const expiryDate = new Date(discount_expires_at);
  const now = new Date();

  //   Check if the offer has already expired
  if (expiryDate <= now) return null; // Don't show if already expired

  const diffTime = Math.abs(expiryDate.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return "Offer ends today!";
  if (diffDays <= 7) return `Offer ends in ${diffDays} days`;

  return `Expires on ${expiryDate.toLocaleDateString()}`;
}

// ===============================================================================
// Calculate Discount Percentage
// ===============================================================================
export function calculateDiscountPercentage(
  discount_price: number | null | undefined,
  price: number | null | undefined,
): number | null {
  if (
    discount_price === null ||
    discount_price === undefined ||
    price === null ||
    price === undefined
  )
    return null;

  return Math.floor(((price - discount_price) / price) * 100);
}
