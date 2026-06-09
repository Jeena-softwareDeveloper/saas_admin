import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Navigation,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Loader2,
  Tag,
  Link as LinkIcon,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Check,
  RefreshCw,
  Monitor,
  Smartphone,
  Store,
  ExternalLink,
  ChevronRight,
  Palette,
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

export default function ClientStorefrontPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [client, setClient] = useState<any>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [refreshKey, setRefreshKey] = useState(0);

  const [activeTab, setActiveTab] = useState<"navigation" | "theme">("navigation");
  const [themeConfig, setThemeConfig] = useState({
    primaryColor: "#e11955",
    footerColor: "#0f172a",
    fontFamily: "Inter",
    shopName: "Store"
  });
  const [themeSaving, setThemeSaving] = useState(false);

  const [form, setForm] = useState({
    label: "",
    categoryId: "",
    link: "",
    sortOrder: 0,
    isActive: true,
  });

  // Fetch client info + menus + categories
  useEffect(() => {
    if (!clientId) return;
    const load = async () => {
      setLoading(true);
      try {
        const clientRes = await api.get(`/admin/customers/${clientId}`);
        const clientData = clientRes.data.data;
        setClient(clientData);

        if (clientData.tenant) {
          setThemeConfig({
            primaryColor: clientData.tenant.primaryColor || "#e11955",
            footerColor: clientData.tenant.footerColor || "#0f172a",
            fontFamily: clientData.tenant.fontFamily || "Inter",
            shopName: clientData.tenant.name || clientData.shop_name || "Store"
          });
        }

        const tenantId = clientData.tenant?.id || clientData.ownedTenant?.id;
        if (tenantId) {
          const [menusRes, catsRes] = await Promise.all([
            api.get(`/admin/menus?tenantId=${tenantId}`),
            api.get(`/admin/categories?tenantId=${tenantId}`),
          ]);
          setItems(menusRes.data.data || []);
          setCategories(catsRes.data.data || []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clientId]);

  const tenantId = client?.tenant?.id || client?.ownedTenant?.id;
  const tenantSlug = client?.tenant?.slug || client?.ownedTenant?.slug;
  const shopName = client?.tenant?.name || client?.ownedTenant?.name || client?.shop_name || client?.name || "Store";

  // Build the storefront URL for the iframe dynamically
  const baseStorefrontUrl = client?.tenant?.domain || import.meta.env.VITE_STOREFRONT_URL || "http://localhost:3000";
  
  const storeUrl = tenantSlug
    ? `${baseStorefrontUrl}?previewTenantSlug=${tenantSlug}`
    : baseStorefrontUrl;

  const fetchMenus = async () => {
    if (!tenantId) return;
    try {
      const menusRes = await api.get(`/admin/menus?tenantId=${tenantId}`);
      setItems(menusRes.data.data || []);
    } catch {}
  };

  const refreshIframe = () => {
    setIframeLoading(true);
    setRefreshKey(k => k + 1);
  };

  const resetForm = () => {
    setForm({ label: "", categoryId: "", link: "", sortOrder: 0, isActive: true });
    setEditingId(null);
    setAddingNew(false);
  };

  const openAdd = () => {
    resetForm();
    setForm(f => ({ ...f, sortOrder: items.length }));
    setAddingNew(true);
    setEditingId(null);
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
    const payload: any = {
      label: form.label,
      categoryId: form.categoryId || null,
      link: form.link || null,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    };
    if (!editingId) payload.tenantId = tenantId;

    try {
      if (editingId) {
        await api.put(`/admin/menus/${editingId}`, payload);
      } else {
        await api.post(`/admin/menus`, payload);
      }
      resetForm();
      await fetchMenus();
      refreshIframe();
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
      await fetchMenus();
      refreshIframe();
    } catch {}
  };

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/admin/menus/${id}/toggle`);
      setItems(prev =>
        prev.map(i => (i.id === id ? { ...i, isActive: !i.isActive } : i))
      );
      refreshIframe();
    } catch {}
  };

  const moveItem = async (index: number, dir: "up" | "down") => {
    const newItems = [...items];
    const swapIdx = dir === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newItems.length) return;
    [newItems[index], newItems[swapIdx]] = [newItems[swapIdx], newItems[index]];
    const updates = newItems.map((item, i) => ({ id: item.id, sortOrder: i }));
    setItems(newItems);
    try {
      await Promise.all(
        updates.map(u => api.put(`/admin/menus/${u.id}`, { sortOrder: u.sortOrder }))
      );
      refreshIframe();
    } catch {}
  };

  const handleSaveTheme = async () => {
    if (!clientId) return;
    setThemeSaving(true);
    try {
      await api.patch(`/admin/customers/${clientId}/status`, themeConfig);
      refreshIframe();
      alert("Theme saved successfully");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save theme");
    } finally {
      setThemeSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
          <p className="text-sm text-slate-500 font-medium">Loading storefront…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f0f2f5] overflow-hidden">
      {/* ── LEFT PANEL: Menu Editor ─────────────────────────── */}
      <div className="w-[360px] shrink-0 flex flex-col h-full bg-white border-r border-slate-200 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white shrink-0">
          <button
            onClick={() => navigate("/admin/users")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center shrink-0">
                <Navigation size={12} className="text-white" />
              </div>
              <h1 className="text-sm font-bold text-slate-900 truncate">Navigation</h1>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Store size={9} />
              {shopName}
            </p>
          </div>
          <a
            href={storeUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Open store in new tab"
          >
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-100 bg-slate-50 shrink-0">
          <button
            onClick={() => setActiveTab("navigation")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === "navigation"
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            <Navigation size={13} /> Navigation
          </button>
          <button
            onClick={() => setActiveTab("theme")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === "theme"
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            <Palette size={13} /> Theme Colors
          </button>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">

            {activeTab === "navigation" && (
              <>
                {/* Add/Edit Form */}
            {(addingNew || editingId) && (
              <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/80 to-white p-4 space-y-3 shadow-sm">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                  {editingId ? "✏️ Edit item" : "✨ New item"}
                </p>

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

                <div>
                  <label className="label text-xs">Link to Category</label>
                  <select
                    className="input text-sm"
                    value={form.categoryId}
                    onChange={e =>
                      setForm(f => ({ ...f, categoryId: e.target.value, link: "" }))
                    }
                  >
                    <option value="">— Custom URL —</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {!form.categoryId && (
                  <div>
                    <label className="label text-xs">Custom URL</label>
                    <input
                      className="input text-sm font-mono"
                      placeholder="/products or /blogs"
                      value={form.link}
                      onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label text-xs">Order</label>
                    <input
                      type="number"
                      className="input text-sm"
                      min={0}
                      value={form.sortOrder}
                      onChange={e =>
                        setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))
                      }
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Visible</label>
                    <div className="flex gap-1.5 mt-1">
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, isActive: true }))}
                        className={`flex-1 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                          form.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-white border-slate-200 text-slate-400"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, isActive: false }))}
                        className={`flex-1 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                          !form.isActive
                            ? "bg-slate-100 text-slate-600 border-slate-300"
                            : "bg-white border-slate-200 text-slate-400"
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
                    className="btn-secondary text-xs flex-1 justify-center py-2"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={submitting || !form.label.trim()}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm shadow-indigo-600/20"
                  >
                    {submitting ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Check size={12} />
                    )}
                    {editingId ? "Save" : "Add to Menu"}
                  </button>
                </div>
              </div>
            )}

            {/* Items header */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Menu Items ({items.length})
              </p>
              {!addingNew && !editingId && (
                <button
                  onClick={openAdd}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Plus size={11} /> Add
                </button>
              )}
            </div>

            {/* Empty state */}
            {items.length === 0 && !addingNew && (
              <div className="text-center py-10 rounded-2xl border-2 border-dashed border-slate-200">
                <Navigation size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-400">No menu items</p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Add items to build the storefront nav bar
                </p>
                <button
                  onClick={openAdd}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={12} /> Add First
                </button>
              </div>
            )}

            {/* Items list */}
            <div className="space-y-1.5">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className={`group relative flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-default ${
                    editingId === item.id
                      ? "border-indigo-300 bg-indigo-50 shadow-sm"
                      : item.isActive
                      ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                      : "border-slate-100 bg-slate-50 opacity-50"
                  }`}
                >
                  {/* Reorder */}
                  <div className="shrink-0 flex flex-col items-center gap-0.5">
                    <button
                      onClick={() => moveItem(idx, "up")}
                      disabled={idx === 0}
                      className="p-0.5 text-slate-200 hover:text-slate-500 disabled:opacity-0 transition-colors"
                    >
                      <ArrowUp size={10} />
                    </button>
                    <GripVertical
                      size={12}
                      className="text-slate-200 group-hover:text-slate-400 transition-colors"
                    />
                    <button
                      onClick={() => moveItem(idx, "down")}
                      disabled={idx === items.length - 1}
                      className="p-0.5 text-slate-200 hover:text-slate-500 disabled:opacity-0 transition-colors"
                    >
                      <ArrowDown size={10} />
                    </button>
                  </div>

                  {/* Order badge */}
                  <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 text-[9px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 leading-tight truncate">
                      {item.label}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {item.categoryName ? (
                        <span className="flex items-center gap-1 text-[10px] text-indigo-500 font-semibold">
                          <Tag size={8} /> {item.categoryName}
                        </span>
                      ) : item.link ? (
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                          <LinkIcon size={8} /> {item.link}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">no link</span>
                      )}
                    </div>
                  </div>

                  {/* Actions — appear on hover */}
                  <div className="shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleToggle(item.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      title={item.isActive ? "Hide" : "Show"}
                    >
                      {item.isActive ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {items.length > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <ChevronRight size={12} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Changes appear live on the storefront's navigation bar. The preview on the right refreshes automatically.
                </p>
              </div>
            )}
              </>
            )}

            {activeTab === "theme" && (
              <div className="space-y-4">
                <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/80 to-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Palette size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Brand Colors</h3>
                      <p className="text-[11px] text-slate-500">Update the store's primary theme</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="label text-xs font-bold">App Name (Store Name)</label>
                      <input
                        type="text"
                        value={themeConfig.shopName}
                        onChange={(e) => setThemeConfig(prev => ({ ...prev, shopName: e.target.value }))}
                        className="input text-sm mt-1"
                        placeholder="e.g. My Store"
                      />
                    </div>

                    <div>
                      <label className="label text-xs font-bold">Font Family</label>
                      <select
                        value={themeConfig.fontFamily}
                        onChange={(e) => setThemeConfig(prev => ({ ...prev, fontFamily: e.target.value }))}
                        className="input text-sm mt-1"
                      >
                        <option value="Inter">Inter (Modern, Clean)</option>
                        <option value="Plus Jakarta Sans">Plus Jakarta Sans (Friendly, Geometric)</option>
                        <option value="Roboto">Roboto (Standard, Professional)</option>
                        <option value="Poppins">Poppins (Round, Playful)</option>
                        <option value="Playfair Display">Playfair Display (Elegant, Serif)</option>
                      </select>
                    </div>

                    <div>
                      <label className="label text-xs font-bold">Primary Color</label>
                      <div className="flex gap-3 items-center mt-1">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                          <input
                            type="color"
                            value={themeConfig.primaryColor}
                            onChange={(e) => setThemeConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-full h-full p-0 border-0 cursor-pointer scale-150"
                          />
                        </div>
                        <input
                          type="text"
                          value={themeConfig.primaryColor}
                          onChange={(e) => setThemeConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="input font-mono text-sm uppercase"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Used for buttons, links, and accents.</p>
                    </div>

                    <div>
                      <label className="label text-xs font-bold">Footer Color</label>
                      <div className="flex gap-3 items-center mt-1">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                          <input
                            type="color"
                            value={themeConfig.footerColor}
                            onChange={(e) => setThemeConfig(prev => ({ ...prev, footerColor: e.target.value }))}
                            className="w-full h-full p-0 border-0 cursor-pointer scale-150"
                          />
                        </div>
                        <input
                          type="text"
                          value={themeConfig.footerColor}
                          onChange={(e) => setThemeConfig(prev => ({ ...prev, footerColor: e.target.value }))}
                          className="input font-mono text-sm uppercase"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Used for the footer background.</p>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveTheme}
                    disabled={themeSaving}
                    className="w-full mt-6 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm shadow-indigo-600/20"
                  >
                    {themeSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {themeSaving ? "Saving..." : "Save Theme Colors"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Storefront Preview ─────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#1e1e2e]">
        {/* Preview toolbar */}
        <div className="flex items-center gap-3 px-5 py-2.5 bg-[#1e1e2e] border-b border-white/10 shrink-0">
          {/* Browser chrome dots */}
          <div className="flex gap-1.5 shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-amber-500/70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
          </div>

          {/* URL bar */}
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <div className="w-3 h-3 rounded-full border-2 border-emerald-400/60 shrink-0" />
            <span className="text-[12px] text-white/50 font-mono truncate select-none">
              {storeUrl}
            </span>
          </div>

          {/* Viewport toggles */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
            <button
              onClick={() => setViewport("desktop")}
              className={`p-1.5 rounded-md transition-colors ${
                viewport === "desktop"
                  ? "bg-white/15 text-white"
                  : "text-white/30 hover:text-white/60"
              }`}
              title="Desktop"
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={() => setViewport("mobile")}
              className={`p-1.5 rounded-md transition-colors ${
                viewport === "mobile"
                  ? "bg-white/15 text-white"
                  : "text-white/30 hover:text-white/60"
              }`}
              title="Mobile"
            >
              <Smartphone size={14} />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={refreshIframe}
            className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors border border-white/10"
            title="Refresh preview"
          >
            <RefreshCw size={13} className={iframeLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Preview frame container */}
        <div className="flex-1 flex items-start justify-center overflow-auto py-5 px-6">
          <div
            className={`relative bg-white shadow-2xl shadow-black/40 rounded-xl overflow-hidden transition-all duration-500 ${
              viewport === "mobile"
                ? "w-[390px] min-h-[700px]"
                : "w-full max-w-[1200px] min-h-[600px]"
            }`}
            style={{ height: "calc(100vh - 130px)" }}
          >
            {/* Loading shimmer */}
            {iframeLoading && (
              <div className="absolute inset-0 z-10 bg-white flex flex-col">
                {/* Navbar skeleton */}
                <div className="h-16 border-b border-slate-100 flex items-center gap-4 px-6">
                  <div className="w-28 h-7 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="flex-1 flex justify-center gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-16 h-4 bg-slate-100 rounded animate-pulse" />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse" />
                    <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse" />
                  </div>
                </div>
                {/* Menubar skeleton */}
                <div className="h-9 border-b border-slate-100 flex items-center gap-2 px-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-20 h-5 bg-slate-100 rounded-full animate-pulse" />
                  ))}
                </div>
                {/* Content skeleton */}
                <div className="flex-1 px-6 py-8 space-y-6">
                  <div className="w-full h-52 bg-slate-100 rounded-2xl animate-pulse" />
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="w-20 h-20 bg-slate-100 rounded-xl animate-pulse shrink-0" />
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div key={i} className="aspect-[3/4] bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <iframe
              key={refreshKey}
              ref={iframeRef}
              src={storeUrl}
              className="w-full h-full border-0"
              onLoad={() => setIframeLoading(false)}
              title={`${shopName} Storefront Preview`}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
