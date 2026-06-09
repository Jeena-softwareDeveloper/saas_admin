"use client";

import { cn, generateStars } from "@/lib/utils";
export * from "./Table";
export * from "./FilterBar";
export * from "./Modal";

interface StarRatingProps {
  rating?: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}

export function StarRating({ rating = 0, count, size = "md", className }: StarRatingProps) {
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const safeRating = typeof rating === "number" ? rating : Number(rating) || 0;
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className={cn("text-amber-400 tracking-tight", size === "sm" ? "text-sm" : "text-base")}>
        {generateStars(safeRating)}
      </span>
      <span className={cn("text-slate-500", textSize)}>
        {safeRating.toFixed(1)}
        {count !== undefined && <span className="ml-0.5">({count})</span>}
      </span>
    </div>
  );
}

interface PriceBadgeProps {
  price: number;
  comparePrice?: number;
  size?: "sm" | "md" | "lg";
}

export function PriceBadge({ price, comparePrice, size = "md" }: PriceBadgeProps) {
  const sizeClass = { sm: "text-sm", md: "text-base", lg: "text-xl" }[size];
  const formatINR = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(n);

  const discount = comparePrice
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={cn("font-bold text-slate-900", sizeClass)}>
        {formatINR(price)}
      </span>
      {comparePrice && comparePrice > price && (
        <>
          <span className={cn("text-slate-400 line-through", size === "lg" ? "text-base" : "text-sm")}>
            {formatINR(comparePrice)}
          </span>
          <span className="badge-green text-xs">{discount}% off</span>
        </>
      )}
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="mb-4 p-4 bg-slate-100 rounded-full text-slate-400">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: "indigo" | "emerald" | "amber" | "rose";
}

export function StatCard({ title, value, icon, trend, color = "indigo" }: StatCardProps) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={cn("p-3 rounded-xl", colorMap[color])}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        {trend && (
          <p className={cn("text-xs mt-1", trend.value >= 0 ? "text-emerald-600" : "text-red-600")}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2);

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ← Prev
      </button>
      {visible.map((p, i) => {
        const prev = visible[i - 1];
        const showEllipsis = prev && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1">
            {showEllipsis && <span className="px-2 text-slate-400">…</span>}
            <button
              onClick={() => onPageChange(p)}
              className={cn(
                "w-8 h-8 text-sm rounded-lg border transition-colors",
                p === page
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              {p}
            </button>
          </span>
        );
      })}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </div>
  );
}
