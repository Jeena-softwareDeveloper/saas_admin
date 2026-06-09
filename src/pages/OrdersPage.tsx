"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Truck, CheckCircle, XCircle, Clock, Package } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, Pagination, Table, TableHeader, TableBody, Tr, Th, Td, FilterBar } from "@/components/ui";
import { formatPrice, formatDateTime, getOrderStatusBadge, getPaymentStatusBadge } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/lib/types";
import { adminService } from "@/services/admin.service";
import { SetAdminHeader } from "@/lib/adminHeaderContext";

const statusIcons = {
  PENDING: <Clock size={13} />,
  PROCESSING: <Package size={13} />,
  SHIPPED: <Truck size={13} />,
  DELIVERED: <CheckCircle size={13} />,
  CANCELLED: <XCircle size={13} />,
  REFUNDED: <XCircle size={13} />,
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await adminService.getOrders();
      setOrders(res.data.data.data || []);
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.user?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const perPage = 10;
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-4 animate-fade-in">
      <SetAdminHeader 
        title="Orders" 
        subtitle={`${filtered.length} orders found`} 
        filter={
          <FilterBar
            search={search}
            onSearchChange={(val) => { setSearch(val); setPage(1); }}
            searchPlaceholder="Search order ID, customer…"
          />
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "All", value: orders.length, filter: "ALL", color: "bg-slate-100 text-slate-700" },
          { label: "Pending", value: orders.filter((o) => o.status === "PENDING").length, filter: "PENDING", color: "bg-amber-100 text-amber-700" },
          { label: "Processing", value: orders.filter((o) => o.status === "PROCESSING").length, filter: "PROCESSING", color: "bg-blue-100 text-blue-700" },
          { label: "Shipped", value: orders.filter((o) => o.status === "SHIPPED").length, filter: "SHIPPED", color: "bg-indigo-100 text-indigo-700" },
          { label: "Delivered", value: orders.filter((o) => o.status === "DELIVERED").length, filter: "DELIVERED", color: "bg-emerald-100 text-emerald-700" },
        ].map((s) => (
          <button
            key={s.filter}
            onClick={() => { setStatusFilter(s.filter); setPage(1); }}
            className={`card p-3 text-center transition-all hover:shadow-md ${statusFilter === s.filter ? "ring-2 ring-indigo-500" : ""}`}
          >
            <p className={`text-xl font-bold ${s.color.split(" ")[1]}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>



      {/* Table */}
      <div className="flex flex-col gap-2">
        <Table>
            <TableHeader>
              <Tr>
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th>Items</Th>
                <Th>Total</Th>
                <Th>Payment</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th>Actions</Th>
              </Tr>
            </TableHeader>
            <TableBody>
              {loading ? (
                <Tr><Td colSpan={8} className="text-center py-8 text-slate-500">Loading orders...</Td></Tr>
              ) : paged.map((order) => {
                const orderBadge = getOrderStatusBadge(order.status);
                const payBadge = getPaymentStatusBadge(order.paymentStatus);
                return (
                  <Tr key={order.id}>
                    <Td className="font-mono text-xs font-semibold text-indigo-600">{order.orderNumber}</Td>
                    <Td>
                      <p className="text-sm font-medium text-slate-900">{order.user?.name || "Guest"}</p>
                      <p className="text-xs text-slate-400">{order.user?.email || "—"}</p>
                    </Td>
                    <Td className="text-center">{order.items?.length || 0}</Td>
                    <Td className="font-semibold">{formatPrice(Number(order.totalAmount))}</Td>
                    <Td><span className={payBadge.className}>{payBadge.label}</span></Td>
                    <Td>
                      <span className={`${orderBadge.className} flex items-center gap-1 w-fit`}>
                        {statusIcons[order.status as keyof typeof statusIcons]}
                        {orderBadge.label}
                      </span>
                    </Td>
                    <Td className="text-xs text-slate-500">{formatDateTime(order.createdAt)}</Td>
                    <Td>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                    </Td>
                  </Tr>
                );
              })}
              {paged.length === 0 && (
                <Tr><Td colSpan={8}>
                  <EmptyState icon={<Package size={24} />} title="No orders found" />
                </Td></Tr>
              )}
            </TableBody>
          </Table>
        <div className="px-4 py-3 border-t border-slate-100">
          <Pagination page={page} totalPages={Math.ceil(filtered.length / perPage)} onPageChange={setPage} />
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Order Details" size="lg">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-3">
                <p className="text-xs text-slate-500">Order Number</p>
                <p className="font-mono font-bold text-indigo-600">{selectedOrder.orderNumber}</p>
              </div>
              <div className="card p-3">
                <p className="text-xs text-slate-500">Customer</p>
                <p className="font-semibold text-slate-900">{selectedOrder.user?.name || "Guest"}</p>
              </div>
              <div className="card p-3">
                <p className="text-xs text-slate-500">Total Amount</p>
                <p className="font-bold text-slate-900">{formatPrice(Number(selectedOrder.totalAmount))}</p>
              </div>
              <div className="card p-3">
                <p className="text-xs text-slate-500">Date</p>
                <p className="text-sm text-slate-700">{formatDateTime(selectedOrder.createdAt)}</p>
              </div>
            </div>
            <div>
              <label className="label">Update Status</label>
              <form className="flex gap-2" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const status = (form.elements.namedItem("status") as HTMLSelectElement).value;
                try {
                  await adminService.updateOrderStatus(selectedOrder.id, status);
                  setSelectedOrder({ ...selectedOrder, status });
                  fetchOrders();
                } catch (err) {
                  alert("Failed to update status");
                }
              }}>
                <select name="status" className="input flex-1" defaultValue={selectedOrder.status}>
                  {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button type="submit" className="btn-primary">Update</button>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
