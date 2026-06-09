"use client";

import { useState, useEffect } from "react";
import { Search, Star, Loader2, CheckCircle, XCircle, Plus, Trash2 } from "lucide-react";
import { EmptyState, Pagination, Table, TableHeader, TableBody, Tr, Th, Td, FilterBar, Modal } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { adminService } from "@/services/admin.service";
import { SetAdminHeader } from "@/lib/adminHeaderContext";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    userId: "",
    rating: 5,
    title: "",
    body: "",
  });

  const fetchReviews = async () => {
    try {
      const res = await adminService.getReviews();
      setReviews(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        adminService.getProducts(),
        adminService.getCustomers()
      ]);
      setProducts(pRes.data.data?.data || pRes.data.data || []);
      setCustomers(cRes.data.data?.data || cRes.data.data || []);
    } catch (err) {
      console.error("Failed to load options");
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchOptions();
  }, []);

  const handleToggleApproval = async (id: string, isApproved: boolean) => {
    try {
      await adminService.approveReview(id, isApproved);
      setReviews(reviews.map(r => r.id === id ? { ...r, isApproved } : r));
    } catch (err) {
      alert("Failed to update review status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await adminService.deleteReview(id);
      setReviews(reviews.filter(r => r.id !== id));
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminService.createReview({
        ...formData,
        isApproved: true
      });
      setIsAddModalOpen(false);
      setFormData({ productId: "", userId: "", rating: 5, title: "", body: "" });
      fetchReviews();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add review");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = reviews.filter((r) => {
    return r.product?.name.toLowerCase().includes(search.toLowerCase()) ||
      r.user?.name.toLowerCase().includes(search.toLowerCase()) ||
      r.title?.toLowerCase().includes(search.toLowerCase());
  });

  const perPage = 10;
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-4 animate-fade-in">
      <SetAdminHeader 
        title="Reviews" 
        subtitle="Manage customer reviews and feedback" 
        filter={
          <FilterBar
            search={search}
            onSearchChange={(val) => { setSearch(val); setPage(1); }}
            searchPlaceholder="Search products, customers, or titles..."
            filters={[]}
          />
        }
        action={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Review
          </button>
        }
      />

      <div className="flex flex-col gap-2">
        <Table>
            <TableHeader>
              <Tr>
                <Th>Rating</Th>
                <Th>Product & Review</Th>
                <Th>Customer</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </TableHeader>
            <TableBody>
              {loading ? (
                <Tr><Td colSpan={6} className="text-center py-8"><Loader2 className="animate-spin mx-auto text-indigo-600" /></Td></Tr>
              ) : paged.map((review) => (
                <Tr key={review.id}>
                  <Td>
                    <div className="flex gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "transparent"} className={i < review.rating ? "" : "text-slate-300"} />
                      ))}
                    </div>
                  </Td>
                  <Td className="max-w-xs">
                    <p className="text-xs font-semibold text-indigo-600 mb-1">{review.product?.name}</p>
                    <p className="font-medium text-slate-900 text-sm truncate">{review.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5" title={review.body}>{review.body}</p>
                  </Td>
                  <Td>
                    <p className="font-medium text-slate-900 text-sm">{review.user?.name}</p>
                    <p className="text-xs text-slate-500">{review.user?.email}</p>
                  </Td>
                  <Td className="text-xs text-slate-500">{formatDateTime(review.createdAt)}</Td>
                  <Td>
                    <span className={review.isApproved ? "badge-green" : "badge-yellow"}>
                      {review.isApproved ? "Approved" : "Pending"}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      {!review.isApproved ? (
                        <button 
                          onClick={() => handleToggleApproval(review.id, true)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle size={16} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleToggleApproval(review.id, false)}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Reject/Hide"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(review.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
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
                    <EmptyState
                      icon={<Star size={24} />}
                      title="No reviews found"
                      description="You don't have any reviews matching these filters."
                    />
                  </Td>
                </Tr>
              )}
            </TableBody>
          </Table>
        <div className="px-4 py-3 border-t border-slate-100">
          <Pagination
            page={page}
            totalPages={Math.ceil(filtered.length / perPage)}
            onPageChange={setPage}
          />
        </div>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Customer Review">
        <form onSubmit={handleAddReview} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Product</label>
              <select
                required
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
              >
                <option value="">Select a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Customer</label>
              <select
                required
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
              >
                <option value="">Select a customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Rating</label>
            <div className="flex gap-2 text-amber-500">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: i })}
                  className="hover:scale-110 transition-transform"
                >
                  <Star size={24} fill={i <= formData.rating ? "currentColor" : "transparent"} className={i <= formData.rating ? "" : "text-slate-300"} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Review Title</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Amazing product!"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Review Content</label>
            <textarea
              required
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Write the customer's review here..."
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Save Review
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
