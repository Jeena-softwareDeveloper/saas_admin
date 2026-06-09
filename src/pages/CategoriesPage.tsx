"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Tag, ChevronRight, Check, X, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, Tr, Th, Td, FilterBar, EmptyState } from "@/components/ui";
import { adminService } from "@/services/admin.service";
import { SetAdminHeader } from "@/lib/adminHeaderContext";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  image_url: string | null;
  is_active: boolean;
  products_count: number;
  children: Category[];
}

function buildCategoryTree(categories: any[]): Category[] {
  const map = new Map<string, Category>();
  categories.forEach(c => map.set(c.id, { ...c, children: [] }));
  const roots: Category[] = [];
  categories.forEach(c => {
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(map.get(c.id)!);
    } else {
      roots.push(map.get(c.id)!);
    }
  });
  return roots;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await adminService.getCategories();
      const data = res.data?.data;
      if (data && Array.isArray(data)) {
        setFlatCategories(data);
        const tree = buildCategoryTree(data);
        setCategories(tree);
        setExpanded(tree.map(c => c.id));
      } else {
        setFlatCategories([]);
        setCategories([]);
      }
    } catch (err) {
      setFlatCategories([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggle = (id: string) =>
    setExpanded((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await adminService.deleteCategory(id);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete");
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await adminService.toggleCategory(id);
      fetchCategories();
    } catch (err) {

    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    formData.append("isActive", "true");
    
    // Clean up empty parentId
    if (!formData.get("parentId")) {
      formData.delete("parentId");
    }

    try {
      if (editCat) {
        await adminService.updateCategory(editCat.id, formData);
      } else {
        await adminService.createCategory(formData);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter root categories
  const filteredTree = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 animate-fade-in">
      <SetAdminHeader
        title="Categories"
        subtitle="Manage your product categories"
        filter={
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search categories..."
          />
        }
        action={
          <button
            id="add-category-btn"
            onClick={() => { setEditCat(null); setShowModal(true); }}
            className="btn-primary"
          >
            <Plus size={15} /> Add Category
          </button>
        }
      />

      <div className="flex flex-col gap-2">
        <Table>
          <TableHeader>
            <Tr>
              <Th>Image</Th>
              <Th>Category</Th>
              <Th>Slug</Th>
              <Th>Products</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </TableHeader>
          <TableBody>
            {loading ? (
              <Tr><Td colSpan={6} className="text-center py-8"><Loader2 className="animate-spin inline-block text-indigo-600" /></Td></Tr>
            ) : filteredTree.length === 0 ? (
              <Tr>
                <Td colSpan={6}>
                  <EmptyState icon={<Tag size={24} />} title="No categories found" description="Try adjusting your search or add a new category." />
                </Td>
              </Tr>
            ) : (
              filteredTree.map((cat) => (
                <React.Fragment key={cat.id}>
                  {/* Root Category Row */}
                  <Tr>
                    <Td className="w-16">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-indigo-100/50">
                        {cat.image_url ? (
                          <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <Tag size={15} className="text-indigo-600" />
                        )}
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-3">
                        {cat.children.length > 0 ? (
                          <button
                            onClick={() => toggle(cat.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
                          >
                            <ChevronRight
                              size={16}
                              className={`transition-transform ${expanded.includes(cat.id) ? "rotate-90" : ""}`}
                            />
                          </button>
                        ) : (
                          <div className="w-6" />
                        )}
                        <p className={`text-sm font-semibold ${cat.is_active ? 'text-slate-900' : 'text-slate-400'}`}>{cat.name}</p>
                      </div>
                    </Td>
                    <Td className="text-xs text-slate-500 font-mono">/{cat.slug}</Td>
                    <Td><span className="badge-blue">{cat.products_count} products</span></Td>
                    <Td>
                      <span className={cat.is_active ? "badge-green" : "badge-red"}>
                        {cat.is_active ? "Active" : "Inactive"}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleToggleActive(cat.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title={cat.is_active ? "Deactivate" : "Activate"}
                        >
                          {cat.is_active ? <X size={14} /> : <Check size={14} />}
                        </button>
                        <button
                          onClick={() => { setEditCat(cat); setShowModal(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                  
                  {/* Children Rows */}
                  {expanded.includes(cat.id) && cat.children.map((child) => (
                    <Tr key={child.id} className="bg-slate-50/40">
                      <Td className="w-16">
                        <div className="w-8 h-8 ml-2 rounded bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200">
                          {child.image_url ? (
                            <img src={child.image_url} alt={child.name} className="w-full h-full object-cover" />
                          ) : (
                            <Tag size={12} className="text-slate-500" />
                          )}
                        </div>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-3 pl-8">
                          <p className={`text-sm font-medium ${child.is_active ? 'text-slate-700' : 'text-slate-400'}`}>{child.name}</p>
                        </div>
                      </Td>
                      <Td className="text-xs text-slate-500 font-mono">/{child.slug}</Td>
                      <Td><span className="badge-gray">{child.products_count} products</span></Td>
                      <Td>
                        <span className={child.is_active ? "badge-green" : "badge-red"}>
                          {child.is_active ? "Active" : "Inactive"}
                        </span>
                      </Td>
                      <Td>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleToggleActive(child.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title={child.is_active ? "Deactivate" : "Activate"}
                          >
                            {child.is_active ? <X size={14} /> : <Check size={14} />}
                          </button>
                          <button
                            onClick={() => { setEditCat(child); setShowModal(true); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(child.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editCat ? "Edit Category" : "Add Category"}
        size="sm"
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <div>
            <label className="label">Name *</label>
            <input name="name" className="input" placeholder="e.g. Electronics" defaultValue={editCat?.name} required />
          </div>
          <div>
            <label className="label">Parent Category</label>
            <select name="parentId" className="input" defaultValue={editCat?.parentId || ""}>
              <option value="">None (Root category)</option>
              {(flatCategories || []).filter(c => c.id !== editCat?.id).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Image</label>
            <input type="file" name="image" className="input" accept="image/*" />
            {editCat?.image_url && (
              <img src={editCat.image_url} alt="Current" className="h-16 mt-2 rounded object-cover border border-slate-200" />
            )}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" className="input min-h-[60px]" placeholder="Category description…" defaultValue={editCat?.description || ""} />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" disabled={submitting}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editCat ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
