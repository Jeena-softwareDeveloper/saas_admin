"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Users,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { StatCard } from "@/components/ui";
import { formatPrice, formatDateTime, getOrderStatusBadge } from "@/lib/utils";
import { adminService } from "@/services/admin.service";
import { SetAdminHeader } from "@/lib/adminHeaderContext";

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock size={14} />, 
  PROCESSING: <Package size={14} />,
  SHIPPED: <Truck size={14} />,
  DELIVERED: <CheckCircle size={14} />,
  CANCELLED: <XCircle size={14} />,
  REFUNDED: <XCircle size={14} />,
};

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0, products: 0, overdue: 0, blockedUsers: 0 });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const fetchDashboardData = async () => {
      try {
        const [statsRes, salesRes, ordersRes] = await Promise.all([
          adminService.getStats(),
          adminService.getSalesChart(),
          adminService.getRecentOrders()
        ]);
        if (statsRes.data && statsRes.data.data) setStats(statsRes.data.data);
        if (salesRes.data && salesRes.data.data) setSalesData(salesRes.data.data);
        if (ordersRes.data && ordersRes.data.data) setRecentOrders(ordersRes.data.data);
      } catch (err) {

      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-5 animate-fade-in">
      <SetAdminHeader title="Dashboard" subtitle="Welcome back! Here's what's happening today." />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Users"
          value={stats.customers.toString()}
          icon={<Users size={20} />}
          color="indigo"
        />
        <StatCard
          title="Total Payment"
          value={formatPrice(stats.revenue)}
          icon={<TrendingUp size={20} />}
          color="emerald"
        />
        <StatCard
          title="Overdue"
          value={formatPrice(stats.overdue)}
          icon={<Clock size={20} />}
          color="rose"
        />
        <StatCard
          title="Blocked Users"
          value={stats.blockedUsers.toString()}
          icon={<XCircle size={20} />}
          color="amber"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-3 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Revenue Overview</h2>
              <p className="text-xs text-slate-500">Monthly revenue — 2026</p>
            </div>
          </div>
          {!loading && mounted && (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={salesData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  formatter={(val) => [formatPrice(val as number), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Recent Orders</h2>
          <a href="/admin/orders" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View all →
          </a>
        </div>
        <div className="table-wrapper rounded-none border-0">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
              ) : recentOrders.map((order) => {
                const badge = getOrderStatusBadge(order.status);
                return (
                  <tr key={order.id}>
                    <td className="font-mono text-xs font-semibold text-indigo-600">{order.orderNumber}</td>
                    <td className="font-medium">{order.user?.name || "Guest"}</td>
                    <td className="font-semibold">{formatPrice(Number(order.totalAmount))}</td>
                    <td>
                      <span className={`${badge.className} flex items-center gap-1 w-fit`}>
                        {statusIcons[order.status]}
                        {badge.label}
                      </span>
                    </td>
                    <td className="text-slate-500 text-xs">{formatDateTime(order.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
