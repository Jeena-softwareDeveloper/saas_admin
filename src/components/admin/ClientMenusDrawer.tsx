import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Navigation,
  GripVertical,
  Tag,
  Link as LinkIcon,
  Loader2,
  Save,
  Store,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Check,
} from "lucide-react";
import api from "@/lib/api";

interface MenuItem {
  id: string;
  label: string;
  link: string | null;
  isActive: boolean;
  sortOrder: number;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ClientMenusDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string | null;
  shopName: string;
}

export function ClientMenusDrawer({
  isOpen,
  onClose,
  tenantId,
  shopName,
}: ClientMenusDrawerProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    label: "",
    categoryId: "",
    link: "",
    sortOrder: 0,
    isActive: true,
  });

  const fetchData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const [menusRes, catsRes] = await Promise.all([
        api.get(`/admin/menus?tenantId=${tenantId}`),
        api.get(`/admin/categories?tenantId=${tenantId}`),
      ]);
      setItems(menusRes.data.data || []);
      setCategories(catsRes.data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && tenantId) {
      fetchData();
    }
  }, [isOpen, tenantId]);

  const resetForm = () => {
    setForm({ label: "", categoryId: "", link: "", sortOrder: 0, isActive: true });
    setEditingId(null);
    setAddingNew(false);
  };

  const openAdd = () => {
    resetForm();
    setForm(f => ({ ...f, sortOrder: items.length }));
    setAddingNew(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setAddingNew(false);
    setForm({
      label: item.label,
      categoryId: item.categoryId || "",
      link: item.link || "",
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
  };

  const handleSave = async () => {
    if (!form.label.trim()) return;
    setSubmitting(true);
    const payload = {
      label: form.label,
      categoryId: form.categoryId || null,
      link: form.link || null,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
      tenantId,
    };
    try {
      if (editingId) {
        await api.put(`/admin/menus/${editingId}`, payload);
      } else {
        await api.post(`/admin/menus`, payload);
      }
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this menu item?")) return;
    try {
      await api.delete(`/admin/menus/${id}`);
      fetchData();
    } catch {}
  };

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/admin/menus/${id}/toggle`);
      setItems(prev => prev.map(i => i.id === id ? { ...i, isActive: !i.isActive } : i));
    } catch {}
  };

  const moveItem = async (index: number, dir: "up" | "down") => {
    const newItems = [...items];
    const swapIdx = dir === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newItems.length) return;
    [newItems[index], newItems[swapIdx]] = [newItems[swapIdx], newItems[index]];
    // Update sort orders
    const updates = newItems.map((item, i) => ({ id: item.id, sortOrder: i }));
    setItems(newItems);
    try {
      await Promise.all(
        updates.map(u => api.put(`/admin/menus/${u.id}`, { sortOrder: u.sortOrder }))
      );
    } catch {}
  };

  if (!isOpen) return null;

  const activeCategoryName = form.categoryId
    ? categories.find(c => c.id === form.categoryId)?.name
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <Navigation size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-slate-900 truncate">Navigation Menu</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Store size={11} />
              {shopName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="animate-spin text-indigo-500" size={28} />
            </div>
          ) : (
            <div className="p-6 space-y-5">

              {/* Live preview strip */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-4 py-2 flex items-center gap-2 border-b border-slate-100">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium ml-2">Storefront Preview</span>
                </div>
                <div className="bg-white px-4 py-3 flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-slate-100">
                  {items.filter(i => i.isActive).length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No active menu items yet</span>
                  ) : (
                    items
                      .filter(i => i.isActive)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((item, idx) => (
                        <span
                          key={item.id}
                          className={`flex-none px-4 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
                            idx === 0
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "text-slate-600 bg-slate-100"
                          }`}
                        >
                          {item.label}
                        </span>
                      ))
                  )}
                </div>
              </div>

              {/* Menu Items List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    Menu Items
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      {items.length} total · {items.filter(i => i.isActive).length} active
                    </span>
                  </h3>
                  <button
                    onClick={openAdd}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <Plus size={13} /> Add Item
                  </button>
                </div>

                {/* Add / Edit inline form */}
                {(addingNew || editingId) && (
                  <div className="mb-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50/50 p-4 space-y-3">
                    <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
                      {editingId ? "Edit Item" : "New Item"}
                    </p>

                    {/* Label */}
                    <div>
                      <label className="label text-xs">Label *</label>
                      <input
                        className="input text-sm"
                        placeholder="e.g. Herbal Supplements"
                        value={form.label}
                        onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                        autoFocus
                      />
                    </div>

                    {/* Category picker */}
                    <div>
                      <label className="label text-xs">Link to Category</label>
                      <select
                        className="input text-sm"
                        value={form.categoryId}
                        onChange={e => setForm(f => ({ ...f, categoryId: e.target.value, link: "" }))}
                      >
                        <option value="">— None (use custom URL) —</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Custom URL — shown only if no category selected */}
                    {!form.categoryId && (
                      <div>
                        <label className="label text-xs">Custom URL</label>
                        <input
                          className="input text-sm font-mono"
                          placeholder="/products or /products?tag=ayurveda"
                          value={form.link}
                          onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      {/* Sort order */}
                      <div>
                        <label className="label text-xs">Sort Order</label>
                        <input
                          type="number"
                          className="input text-sm"
                          min={0}
                          value={form.sortOrder}
                          onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                        />
                      </div>

                      {/* Active toggle */}
                      <div>
                        <label className="label text-xs">Status</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, isActive: true }))}
                            className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${
                              form.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            Active
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, isActive: false }))}
                            className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${
                              !form.isActive
                                ? "bg-slate-100 text-slate-600 border-slate-300"
                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            Hidden
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={resetForm}
                        className="btn-secondary text-xs flex-1 justify-center"
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={submitting || !form.label.trim()}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                      >
                        {submitting ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Check size={13} />
                        )}
                        {editingId ? "Save Changes" : "Add to Menu"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {items.length === 0 && !addingNew && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                    <Navigation size={32} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-500">No menu items yet</p>
                    <p className="text-xs text-slate-400 mt-1">Add items to build the storefront navigation bar</p>
                    <button onClick={openAdd} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors">
                      <Plus size={13} /> Add First Item
                    </button>
                  </div>
                )}

                {/* Items list */}
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`group relative flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                        editingId === item.id
                          ? "border-indigo-300 bg-indigo-50"
                          : item.isActive
                          ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                          : "border-slate-100 bg-slate-50 opacity-60"
                      }`}
                    >
                      {/* Drag handle */}
                      <div className="shrink-0 flex flex-col gap-0.5">
                        <button
                          onClick={() => moveItem(idx, "up")}
                          disabled={idx === 0}
                          className="p-0.5 text-slate-300 hover:text-slate-500 disabled:opacity-20 transition-colors"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <GripVertical size={14} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                        <button
                          onClick={() => moveItem(idx, "down")}
                          disabled={idx === items.length - 1}
                          className="p-0.5 text-slate-300 hover:text-slate-500 disabled:opacity-20 transition-colors"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>

                      {/* Sort badge */}
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {item.sortOrder}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 leading-tight">{item.label}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.categoryName ? (
                            <span className="flex items-center gap-1 text-[11px] text-indigo-600 font-medium">
                              <Tag size={9} />
                              {item.categoryName}
                            </span>
                          ) : item.link ? (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                              <LinkIcon size={9} />
                              {item.link}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-300 italic">No link</span>
                          )}
                        </div>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.isActive ? "Active" : "Hidden"}
                      </span>

                      {/* Actions */}
                      <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleToggle(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title={item.isActive ? "Hide" : "Show"}
                        >
                          {item.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info tip */}
              {items.length > 0 && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50 border border-blue-100">
                  <ChevronRight size={14} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Changes appear instantly on the storefront's navigation bar below the header. Items linked to categories will filter products automatically.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
