"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Image,
  Check,
  X,
  Loader2,
  Link,
  Tag,
  Eye,
  EyeOff,
  UploadCloud,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, Tr, Th, Td } from "@/components/ui";
import { adminService } from "@/services/admin.service";
import { SetAdminHeader } from "@/lib/adminHeaderContext";

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
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

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const [bannersRes, catsRes] = await Promise.all([
        adminService.getBanners(),
        adminService.getCategories(),
      ]);
      setBanners(bannersRes.data.data || []);
      setCategories(catsRes.data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setEditBanner(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const openEdit = (b: Banner) => {
    setEditBanner(b);
    setPreviewUrl(b.imageUrl);
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPreviewUrl(URL.createObjectURL(f));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await adminService.deleteBanner(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await adminService.toggleBanner(id);
      fetchData();
    } catch {}
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // If editing and no new file selected, remove image field (keep existing)
    if (editBanner && !fileRef.current?.files?.length) {
      formData.delete("image");
    }

    try {
      if (editBanner) {
        await adminService.updateBanner(editBanner.id, formData);
      } else {
        await adminService.createBanner(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save banner");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <SetAdminHeader
        title="Banners"
        subtitle="Manage homepage promotional banners"
        action={
          <button id="add-banner-btn" onClick={openAdd} className="btn-primary">
            <Plus size={15} /> Add Banner
          </button>
        }
      />

      {/* Banners Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={28} />
        </div>
      ) : banners.length === 0 ? (
        <div className="card p-12 text-center">
          <Image size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm font-medium">No banners yet.</p>
          <p className="text-slate-400 text-xs mt-1">
            Add your first banner to promote products and categories on the homepage.
          </p>
          <button onClick={openAdd} className="btn-primary mt-4 mx-auto">
            <Plus size={14} /> Add Banner
          </button>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col gap-2">
          <Table>
            <TableHeader>
              <Tr>
                <Th>Banner</Th>
                <Th>Title</Th>
                <Th>Linked To</Th>
                <Th>Order</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <Tr key={banner.id} className={!banner.isActive ? "opacity-60 bg-slate-50" : ""}>
                  <Td>
                    <div className="w-24 h-12 bg-slate-100 rounded overflow-hidden flex items-center justify-center shadow-sm">
                      <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                    </div>
                  </Td>
                  <Td className="font-semibold text-slate-800">{banner.title}</Td>
                  <Td>
                    <div className="flex flex-col gap-1">
                      {banner.categoryName && (
                        <span className="flex items-center gap-1 text-[11px] text-indigo-600 font-medium">
                          <Tag size={10} /> {banner.categoryName}
                        </span>
                      )}
                      {banner.link && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Link size={10} /> <span className="truncate max-w-[150px]">{banner.link}</span>
                        </span>
                      )}
                      {!banner.categoryName && !banner.link && <span className="text-slate-400 text-xs italic">—</span>}
                    </div>
                  </Td>
                  <Td className="font-mono text-xs">{banner.sortOrder}</Td>
                  <Td>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${banner.isActive ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                      {banner.isActive ? "Active" : "Inactive"}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(banner)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleToggle(banner.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title={banner.isActive ? "Deactivate" : "Activate"}>
                        {banner.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button onClick={() => handleDelete(banner.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
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
        title={editBanner ? "Edit Banner" : "Add Banner"}
        size="md"
      >
        <form className="space-y-4" onSubmit={handleSave} encType="multipart/form-data">
          {/* Image Upload */}
          <div>
            <label className="label">Banner Image {!editBanner && "*"}</label>
            <div
              className="relative border-2 border-dashed border-slate-200 rounded-xl overflow-hidden bg-slate-50 hover:border-indigo-400 transition-colors cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              {previewUrl ? (
                <div className="relative aspect-[16/7]">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium flex items-center gap-1.5">
                      <UploadCloud size={14} /> Change Image
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <UploadCloud size={28} className="text-slate-300" />
                  <p className="text-sm text-slate-500 font-medium">Click to upload banner image</p>
                  <p className="text-[11px] text-slate-400">PNG, JPG, WEBP · Max 5MB · Recommended 16:7 ratio</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              name="image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              required={!editBanner}
            />
          </div>

          {/* Title */}
          <div>
            <label className="label">Title *</label>
            <input
              name="title"
              className="input"
              placeholder="e.g. Smartwatch Deals"
              defaultValue={editBanner?.title}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="label">Attach to Category (optional)</label>
            <select
              name="categoryId"
              className="input"
              defaultValue={editBanner?.categoryId || ""}
            >
              <option value="">— No category —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              If a category is selected and no custom link is set, clicking the banner navigates to that category's products.
            </p>
          </div>

          {/* Custom Link */}
          <div>
            <label className="label">Custom Link (optional)</label>
            <input
              name="link"
              className="input"
              placeholder="e.g. /products?search=smartwatch"
              defaultValue={editBanner?.link || ""}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Overrides the category link if both are set.
            </p>
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
              defaultValue={editBanner?.sortOrder ?? 0}
            />
            <p className="text-[11px] text-slate-400 mt-1">Lower number = shown first on homepage.</p>
          </div>

          {/* Active toggle if editing */}
          {editBanner && (
            <div className="flex items-center gap-3">
              <label className="label mb-0">Active</label>
              <select name="isActive" className="input w-auto" defaultValue={editBanner.isActive ? "true" : "false"}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editBanner ? (
                "Save Changes"
              ) : (
                "Create Banner"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
