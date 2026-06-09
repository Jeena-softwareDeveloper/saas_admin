import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { OrderStatus, PaymentStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export function truncate(str: string, length = 80): string {
  return str.length > length ? `${str.slice(0, length)}…` : str;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function getOrderStatusBadge(status: OrderStatus): {
  label: string;
  className: string;
} {
  const map: Record<OrderStatus, { label: string; className: string }> = {
    PENDING: { label: "Pending", className: "badge-yellow" },
    PROCESSING: { label: "Processing", className: "badge-blue" },
    SHIPPED: { label: "Shipped", className: "badge-purple" },
    DELIVERED: { label: "Delivered", className: "badge-green" },
    CANCELLED: { label: "Cancelled", className: "badge-red" },
    REFUNDED: { label: "Refunded", className: "badge-gray" },
  };
  return map[status] ?? { label: status, className: "badge-gray" };
}

export function getPaymentStatusBadge(status: PaymentStatus): {
  label: string;
  className: string;
} {
  const map: Record<PaymentStatus, { label: string; className: string }> = {
    UNPAID: { label: "Unpaid", className: "badge-yellow" },
    PAID: { label: "Paid", className: "badge-green" },
    FAILED: { label: "Failed", className: "badge-red" },
    REFUNDED: { label: "Refunded", className: "badge-gray" },
  };
  return map[status] ?? { label: status, className: "badge-gray" };
}

export function getRoleBadge(role: string): { label: string; className: string } {
  const map: Record<string, { label: string; className: string }> = {
    SUPER_ADMIN: { label: "Super Admin", className: "badge-purple" },
    ADMIN: { label: "Admin", className: "badge-blue" },
    CUSTOMER: { label: "Customer", className: "badge-green" },
    GUEST: { label: "Guest", className: "badge-gray" },
  };
  return map[role] ?? { label: role, className: "badge-gray" };
}

export function generateStars(rating: number): string {
  return "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
}

export function getDiscountPercent(price: number, comparePrice: number): number {
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}
