"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Award,
  Loader2,
  Link as LinkIcon,
  Eye,
  EyeOff,
  UploadCloud,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, Tr, Th, Td } from "@/components/ui";
import { adminService } from "@/services/admin.service";
import { SetAdminHeader } from "@/lib/adminHeaderContext";

interface Certification {
  id: string;
  name: string;
  imageUrl: string;
  link: string | null;
  isActive: boolean;
  sortOrder: number;
}

export default function AdminCertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCert, setEditCert] = useState<Certification | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCertifications();
      setCertifications(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch certifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setEditCert(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const openEdit = (c: Certification) => {
    setEditCert(c);
    setPreviewUrl(c.imageUrl);
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPreviewUrl(URL.createObjectURL(f));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certification?")) return;
    try {
      await adminService.deleteCertification(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to delete");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await adminService.toggleCertification(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to toggle status");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // If editing and no new file selected, remove image field (keep existing)
    if (editCert && !fileRef.current?.files?.length) {
      formData.delete("image");
    }

    try {
      if (editCert) {
        await adminService.updateCertification(editCert.id, formData);
      } else {
        await adminService.createCertification(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to save certification");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <SetAdminHeader
        title="Certifications"
        subtitle="Manage trust badges and quality certifications shown on the store landing page"
        action={
          <button id="add-cert-btn" onClick={openAdd} className="btn-primary">
            <Plus size={15} /> Add Certification
          </button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={28} />
        </div>
      ) : certifications.length === 0 ? (
        <div className="card p-12 text-center border border-slate-100 bg-white rounded-2xl">
          <Award size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm font-medium">No certifications yet.</p>
          <p className="text-slate-400 text-xs mt-1">
            Add badges like organic certifications, ISO standards, or GMP seals to build trust with shoppers.
          </p>
          <button onClick={openAdd} className="btn-primary mt-4 mx-auto">
            <Plus size={14} /> Add Certification
          </button>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col gap-2">
          <Table>
            <TableHeader>
              <Tr>
                <Th>Image</Th>
                <Th>Name</Th>
                <Th>Verification Link</Th>
                <Th>Order</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </TableHeader>
            <TableBody>
              {certifications.map((cert) => (
                <Tr key={cert.id} className={!cert.isActive ? "opacity-60 bg-slate-50" : ""}>
                  <Td>
                    <div className="w-12 h-12 bg-white rounded border border-slate-100 flex items-center justify-center p-1.5 shadow-sm">
                      <img src={cert.imageUrl} alt={cert.name} className="max-w-full max-h-full object-contain" />
                    </div>
                  </Td>
                  <Td className="font-semibold text-slate-800">{cert.name}</Td>
                  <Td>
                    {cert.link ? (
                      <a href={cert.link} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline flex items-center gap-1 text-xs font-medium">
                        <LinkIcon size={12} /> View
                      </a>
                    ) : <span className="text-slate-400 text-xs italic">—</span>}
                  </Td>
                  <Td className="font-mono text-xs">{cert.sortOrder}</Td>
                  <Td>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${cert.isActive ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                      {cert.isActive ? "Active" : "Inactive"}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(cert)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleToggle(cert.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title={cert.isActive ? "Deactivate" : "Activate"}>
                        {cert.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button onClick={() => handleDelete(cert.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
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
        title={editCert ? "Edit Certification" : "Add Certification"}
        size="md"
      >
        <form className="space-y-4" onSubmit={handleSave} encType="multipart/form-data">
          {/* Image Upload */}
          <div>
            <label className="label">Logo Image {!editCert && "*"}</label>
            <div
              className="relative border-2 border-dashed border-slate-200 rounded-xl overflow-hidden bg-slate-50 hover:border-indigo-400 transition-colors cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              {previewUrl ? (
                <div className="relative aspect-square max-w-[140px] mx-auto p-4 flex items-center justify-center bg-white rounded-lg border border-slate-100">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/35 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                      <UploadCloud size={14} /> Change Logo
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <UploadCloud size={28} className="text-slate-300" />
                  <p className="text-sm text-slate-500 font-medium">Click to upload logo file</p>
                  <p className="text-[11px] text-slate-400">PNG, JPG, WEBP · Max 5MB · Transparent background preferred</p>
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
              required={!editCert}
            />
          </div>

          {/* Name */}
          <div>
            <label className="label">Certification Name *</label>
            <input
              name="name"
              className="input"
              placeholder="e.g. USDA Organic"
              defaultValue={editCert?.name}
              required
            />
          </div>

          {/* Verification Link */}
          <div>
            <label className="label">Verification Link (optional)</label>
            <input
              name="link"
              className="input"
              placeholder="e.g. https://www.usda.gov/organic"
              defaultValue={editCert?.link || ""}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Add a link if shoppers can click the badge to verify the certificate details.
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
              defaultValue={editCert?.sortOrder ?? 0}
            />
            <p className="text-[11px] text-slate-400 mt-1">Lower order number will be displayed first in the row.</p>
          </div>

          {/* Active status */}
          {editCert && (
            <div className="flex items-center gap-3">
              <label className="label mb-0">Active</label>
              <select name="isActive" className="input w-auto" defaultValue={editCert.isActive ? "true" : "false"}>
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
              ) : editCert ? (
                "Save Changes"
              ) : (
                "Create Certification"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
