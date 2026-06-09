import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Navigation,
  Link,
  Tag,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, Tr, Th, Td } from "@/components/ui";
import { adminService } from "@/services/admin.service";
import { SetAdminHeader } from "@/lib/adminHeaderContext";

interface MenuItem {
  id: string;
  label: string;
  link: string | null;
  isActive: boolean;
  sortOrder: number;
  categoryId: string | null;
  categoryName: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function MenusPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [menusRes, catsRes] = await Promise.all([
        adminService.getMenus(),
        adminService.getCategories(),
      ]);
      setItems(menusRes.data.data || []);
      setCategories(catsRes.data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditItem(null); setShowModal(true); };
  const openEdit = (item: MenuItem) => { setEditItem(item); setShowModal(true); };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    try {
      await adminService.deleteMenu(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await adminService.toggleMenu(id);
      fetchData();
    } catch {}
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const payload: any = {
      label: formData.get("label"),
      link: formData.get("link") || null,
      categoryId: formData.get("categoryId") || null,
      sortOrder: Number(formData.get("sortOrder") || 0),
    };
    if (editItem) {
      payload.isActive = formData.get("isActive") === "true";
    }
    try {
      if (editItem) {
        await adminService.updateMenu(editItem.id, payload);
      } else {
        await adminService.createMenu(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save menu item");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <SetAdminHeader
        title="Navigation Menus"
        subtitle="Manage storefront horizontal menu bar"
        action={
          <button id="add-menu-btn" onClick={openAdd} className="btn-primary">
            <Plus size={15} /> Add Menu Item
          </button>
        }
      />

      {/* Info banner */}
      <div className="card p-3 flex items-start gap-3 bg-indigo-50 border-indigo-200">
        <Navigation size={16} className="text-indigo-500 mt-0.5 shrink-0" />
        <p className="text-xs text-indigo-700 font-medium leading-relaxed">
          Menu items appear as a horizontal navigation row on your storefront. Link them to a category (recommended) or a custom URL. Drag & drop or use Sort Order to reorder.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={28} />
        </div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <Navigation size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm font-medium">No menu items yet.</p>
          <p className="text-slate-400 text-xs mt-1">Add your first menu item to create a navigation bar on your storefront.</p>
          <button onClick={openAdd} className="btn-primary mt-4 mx-auto">
            <Plus size={14} /> Add Menu Item
          </button>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col gap-2">
          {/* Live preview bar */}
          <div className="card p-3 border-dashed">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Storefront Preview</p>
            <div className="flex items-center gap-1 flex-wrap">
              {items.filter(i => i.isActive).map(i => (
                <span
                  key={i.id}
                  className="px-3 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 rounded-full border border-slate-200"
                >
                  {i.label}
                </span>
              ))}
              {items.filter(i => i.isActive).length === 0 && (
                <span className="text-xs text-slate-400 italic">No active items</span>
              )}
            </div>
          </div>

          <Table>
            <TableHeader>
              <Tr>
                <Th>Order</Th>
                <Th>Label</Th>
                <Th>Links To</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <Tr key={item.id} className={!item.isActive ? "opacity-60 bg-slate-50" : ""}>
                  <Td className="font-mono text-xs text-slate-500 w-12">{item.sortOrder}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Navigation size={13} className="text-indigo-400 shrink-0" />
                      <span className="font-semibold text-slate-800">{item.label}</span>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex flex-col gap-1">
                      {item.categoryName && (
                        <span className="flex items-center gap-1 text-[11px] text-indigo-600 font-medium">
                          <Tag size={10} /> {item.categoryName}
                        </span>
                      )}
                      {item.link && !item.categoryName && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Link size={10} />
                          <span className="truncate max-w-[180px]">{item.link}</span>
                        </span>
                      )}
                      {!item.categoryName && !item.link && (
                        <span className="text-slate-400 text-xs italic">—</span>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.isActive ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleToggle(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title={item.isActive ? "Deactivate" : "Activate"}>
                        {item.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editItem ? "Edit Menu Item" : "Add Menu Item"}
        size="sm"
      >
        <form className="space-y-4" onSubmit={handleSave}>
          {/* Label */}
          <div>
            <label className="label">Label *</label>
            <input
              name="label"
              className="input"
              placeholder="e.g. Herbal Supplements"
              defaultValue={editItem?.label}
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">This text appears in the menu bar on your storefront.</p>
          </div>

          {/* Category */}
          <div>
            <label className="label">Link to Category (Recommended)</label>
            <select
              name="categoryId"
              className="input"
              defaultValue={editItem?.categoryId || ""}
            >
              <option value="">— No category —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">If selected, clicking this menu item shows that category's products.</p>
          </div>

          {/* Custom Link */}
          <div>
            <label className="label">Custom URL (optional)</label>
            <input
              name="link"
              className="input"
              placeholder="e.g. /products?search=ayurveda"
              defaultValue={editItem?.link || ""}
            />
            <p className="text-[11px] text-slate-400 mt-1">Used only if no category is selected above.</p>
          </div>

          {/* Sort Order */}
          <div>
            <label className="label">Sort Order</label>
            <input
              name="sortOrder"
              type="number"
              className="input"
              min={0}
              placeholder="0"
              defaultValue={editItem?.sortOrder ?? 0}
            />
            <p className="text-[11px] text-slate-400 mt-1">Lower number = shown first in the menu bar.</p>
          </div>

          {/* Active when editing */}
          {editItem && (
            <div className="flex items-center gap-3">
              <label className="label mb-0">Active</label>
              <select name="isActive" className="input w-auto" defaultValue={editItem.isActive ? "true" : "false"}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editItem ? "Save Changes" : "Add to Menu"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
