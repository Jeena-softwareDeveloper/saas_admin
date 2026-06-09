"use client";

import { useState, useEffect } from "react";
import { Search, Ticket, Plus, Edit2, Trash2, Loader2, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, Pagination, Table, TableHeader, TableBody, Tr, Th, Td, FilterBar } from "@/components/ui";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { adminService } from "@/services/admin.service";
import { SetAdminHeader } from "@/lib/adminHeaderContext";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      const res = await adminService.getCoupons();
      setCoupons(res.data.data);
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminService.deleteCoupon(deleteId);
      setCoupons(coupons.filter(c => c.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert("Failed to delete coupon");
    }
  };

  const filtered = coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase()));
  const perPage = 10;
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-4 animate-fade-in">
      <SetAdminHeader
        title="Coupons"
        subtitle="Manage discount codes"
        action={
          <button
            onClick={() => { setEditCoupon(null); setShowModal(true); }}
            className="btn-primary"
          >
            <Plus size={15} /> Create Coupon
          </button>
        }
        filter={
          <FilterBar
            search={search}
            onSearchChange={(val) => { setSearch(val); setPage(1); }}
            searchPlaceholder="Search coupon codes..."
            filters={[]}
          />
        }
      />

      <div className="flex flex-col gap-2">
        <Table>
          <TableHeader>
            <Tr>
              <Th>Code</Th>
              <Th>Discount</Th>
              <Th>Usage Limit</Th>
              <Th>Expires</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </TableHeader>
          <TableBody>
            {loading ? (
              <Tr><Td colSpan={6} className="text-center py-8"><Loader2 className="animate-spin mx-auto text-indigo-600" /></Td></Tr>
            ) : paged.map((coupon) => (
              <Tr key={coupon.id}>
                <Td>
                  <p className="font-mono font-bold text-indigo-600 uppercase text-sm">{coupon.code}</p>
                </Td>
                <Td>
                  <p className="font-semibold text-slate-900">
                    {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : formatPrice(Number(coupon.discountValue))} OFF
                  </p>
                  {coupon.minOrderAmount && <p className="text-[10px] text-slate-500">Min: {formatPrice(Number(coupon.minOrderAmount))}</p>}
                </Td>
                <Td className="text-sm text-slate-700">
                  {coupon.usedCount} / {coupon.usageLimit || '∞'}
                </Td>
                <Td className="text-xs text-slate-500">
                  {coupon.expiresAt ? formatDateTime(coupon.expiresAt) : 'Never'}
                </Td>
                <Td>
                  <span className={coupon.isActive ? "badge-green" : "badge-gray"}>
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditCoupon(coupon); setShowModal(true); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteId(coupon.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
            {!loading && paged.length === 0 && (
              <Tr>
                <Td colSpan={6}>
                  <EmptyState icon={<Ticket size={24} />} title="No coupons found" />
                </Td>
              </Tr>
            )}
          </TableBody>
        </Table>
        <div className="px-4 py-3 border-t border-slate-100">
          <Pagination page={page} totalPages={Math.ceil(filtered.length / perPage)} onPageChange={setPage} />
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editCoupon ? "Edit Coupon" : "Create Coupon"} size="md">
        <CouponForm coupon={editCoupon} onClose={() => { setShowModal(false); fetchCoupons(); }} />
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Coupon" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Are you sure you want to delete this coupon? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn-danger">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CouponForm({ coupon, onClose }: { coupon: any; onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [discountType, setDiscountType] = useState(coupon?.discountType || "PERCENTAGE");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const payload: any = Object.fromEntries(formData.entries());

    payload.discountValue = Number(payload.discountValue) as any;
    if (payload.minOrderAmount) payload.minOrderAmount = Number(payload.minOrderAmount) as any;
    if (payload.maxDiscountAmount) payload.maxDiscountAmount = Number(payload.maxDiscountAmount) as any;
    if (payload.usageLimit) payload.usageLimit = Number(payload.usageLimit) as any;
    payload.isActive = payload.isActive === 'true' as any;

    try {
      if (coupon) {
        await adminService.updateCoupon(coupon.id, payload);
      } else {
        await adminService.createCoupon(payload);
      }
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="label">Coupon Code *</label>
        <input name="code" className="input uppercase" required defaultValue={coupon?.code} placeholder="SUMMER20" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Discount Type *</label>
          <select name="discountType" className="input" value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FLAT_AMOUNT">Fixed Amount (₹)</option>
          </select>
        </div>
        {discountType === "FLAT_AMOUNT" ? (
          <div>
            <label className="label">Discount Amount (₹) *</label>
            <input name="discountValue" type="number" step={0.01} min={0} className="input" required defaultValue={coupon?.discountValue} />
          </div>
        ) : (
          <div>
            <label className="label">Discount Percentage (%) *</label>
            <input name="discountValue" type="number" step={0.01} min={0} max={100} className="input" required defaultValue={coupon?.discountValue} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Min Order Amount (₹)</label>
          <input name="minOrderAmount" type="number" step={0.01} min={0} className="input" defaultValue={coupon?.minOrderAmount} />
        </div>
        <div>
          <label className="label">Usage Limit (Total)</label>
          <input name="usageLimit" type="number" min={1} className="input" placeholder="Leave empty for unlimited" defaultValue={coupon?.usageLimit} />
        </div>
      </div>

      <div>
        <label className="label">Expiry Date</label>
        <input name="expiresAt" type="datetime-local" className="input" defaultValue={formatDateForInput(coupon?.expiresAt)} />
      </div>
      <div>
        <label className="label">Status</label>
        <select name="isActive" className="input" defaultValue={coupon?.isActive === false ? 'false' : 'true'}>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
        <button type="button" onClick={onClose} className="btn-secondary"><X size={14} /> Cancel</button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving..." : coupon ? "Save Changes" : "Create Coupon"}
        </button>
      </div>
    </form>
  );
}
