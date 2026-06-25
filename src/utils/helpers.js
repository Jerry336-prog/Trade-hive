// ============================================================
// Utility helpers
// ============================================================

/**
 * Format a number as a currency string.
 */
export const formatCurrency = (amount, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amount);

/**
 * Truncate text to a given character limit.
 */
export const truncateText = (text, limit = 100) =>
  text?.length > limit ? text.slice(0, limit) + "..." : text;

/**
 * Capitalize first letter of each word.
 */
export const titleCase = (str) =>
  str?.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

/**
 * Generate a color from a string (for avatar initials).
 */
export const stringToColor = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 50%)`;
};

/**
 * Get initials from a full name.
 */
export const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/**
 * Order status badge colors.
 */
export const statusColor = (status) => {
  const map = {
    Pending: "#f59e0b",
    Processing: "#3b82f6",
    Shipped: "#8b5cf6",
    Delivered: "#10b981",
    Cancelled: "#ef4444",
  };
  return map[status] || "#6b7280";
};

/**
 * Format Firestore timestamp or ISO string to readable date.
 */
export const formatDate = (ts) => {
  if (!ts) return "N/A";
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const CATEGORIES = [
  "All",
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Sports",
  "Beauty",
  "Books",
  "Toys",
  "Automotive",
  "Health",
  "Food & Grocery",
  "Other",
];
