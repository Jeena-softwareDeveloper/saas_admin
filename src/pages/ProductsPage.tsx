"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Package,
  Upload,
  X,
  Loader2,
  Tag as TagIcon
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, Pagination, Table, TableHeader, TableBody, Tr, Th, Td, FilterBar } from "@/components/ui";
import { formatPrice } from "@/lib/utils";

import { adminService } from "@/services/admin.service";
import { SetAdminHeader } from "@/lib/adminHeaderContext";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await Promise.all([
        adminService.getProducts(),
        adminService.getCategories()
      ]);
      setProducts(res[0].data.data.data || []);
      setCategories(res[1].data.data || []);
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditClick = async (productId: string) => {
    setLoadingEdit(productId);
    try {
      const res = await adminService.getProduct(productId);
      setEditProduct(res.data.data);
      setShowModal(true);
    } catch (err) {
      alert("Failed to load product details");
    } finally {
      setLoadingEdit(null);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const perPage = 10;
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <SetAdminHeader
        title="Products"
        subtitle={`${filtered.length} products total`}
        action={
          <button
            id="add-product-btn"
            onClick={() => { setEditProduct(null); setShowModal(true); }}
            className="btn-primary"
          >
            <Plus size={15} /> Add Product
          </button>
        }
        filter={
          <FilterBar
            search={search}
            onSearchChange={(val) => { setSearch(val); setPage(1); }}
            searchPlaceholder="Search products, SKU…"
            filters={[
              {
                value: "",
                onChange: () => {}, // To be wired later
                placeholder: "All Categories",
                options: [
                  { label: "Electronics", value: "Electronics" },
                  { label: "Clothing", value: "Clothing" },
                  { label: "Home & Living", value: "Home & Living" },
                  { label: "Sports", value: "Sports" },
                ]
              },
              {
                value: "",
                onChange: () => {}, // To be wired later
                placeholder: "All Status",
                options: [
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                  { label: "Featured", value: "Featured" },
                ]
              }
            ]}
          />
        }
      />

      {/* Table */}
      <div className="flex-1 min-h-0 flex flex-col gap-2">
        <Table>
            <TableHeader>
              <Tr>
                <Th>Product</Th>
                <Th>SKU</Th>
                <Th>Category</Th>
                <Th>Price</Th>
                <Th>Stock</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </TableHeader>
            <TableBody>
              {loading ? (
                <Tr><Td colSpan={7} className="text-center py-8 text-slate-500">Loading products...</Td></Tr>
              ) : paged.map((product) => (
                <Tr key={product.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Package size={16} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{product.name}</p>
                        {product.isFeatured && (
                          <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
                            <Star size={9} fill="currentColor" /> Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </Td>
                  <Td className="font-mono text-xs text-slate-500">{product.sku || "—"}</Td>
                  <Td>
                    <span className="badge-blue">{product.category?.name || "Uncategorized"}</span>
                  </Td>
                  <Td className="font-semibold text-slate-900">{formatPrice(product.price)}</Td>
                  <Td>
                    <span
                      className={
                        product.stockQuantity === 0
                          ? "badge-red"
                          : product.stockQuantity < 10
                          ? "badge-yellow"
                          : "badge-green"
                      }
                    >
                      {product.stockQuantity === 0 ? "Out of stock" : `${product.stockQuantity} units`}
                    </span>
                  </Td>
                  <Td>
                    <span className={product.isPublished ? "badge-green" : "badge-gray"}>
                      {product.isPublished ? "Active" : "Inactive"}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditClick(product.id)}
                        disabled={loadingEdit === product.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                        title="Edit"
                      >
                        {loadingEdit === product.id ? <Loader2 size={15} className="animate-spin" /> : <Edit2 size={15} />}
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await adminService.publishProduct(product.id);
                            fetchProducts();
                          } catch (err) {

                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title={product.isPublished ? "Deactivate" : "Activate"}
                      >
                        {product.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        onClick={() => setDeleteId(product.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
              {paged.length === 0 && (
                <Tr>
                  <Td colSpan={7}>
                    <EmptyState
                      icon={<Package size={24} />}
                      title="No products found"
                      description="Try adjusting your search or add a new product."
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editProduct ? "Edit Product" : "Add New Product"}
        size="lg"
      >
        <ProductForm product={editProduct} categories={categories} onClose={() => { setShowModal(false); fetchProducts(); }} />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Product" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setDeleteId(null)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={async () => {
              if (deleteId) {
                try {
                  await adminService.deleteProduct(deleteId);
                  setDeleteId(null);
                  fetchProducts();
                } catch (err) {

                }
              }
            }} className="btn-danger">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onClose,
}: {
  product: any | null;
  categories: any[];
  onClose: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>(product?.images || []);
  
  const [variants, setVariants] = useState<any[]>(product?.variants || []);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [submittingVariant, setSubmittingVariant] = useState(false);
  const [newVariant, setNewVariant] = useState({ variantName: "", sku: "", price: "", stockQuantity: "" });

  const handleDeleteExistingImage = async (imgId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      await adminService.removeProductImage(product.id, imgId);
      setExistingImages(prev => prev.filter(img => img.id !== imgId));
    } catch (err) {
      alert("Failed to delete image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    formData.delete("images");
    selectedFiles.forEach(f => formData.append("images", f));
    
    try {
      if (product) {
        await adminService.updateProduct(product.id, formData, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await adminService.createProduct(formData, { headers: { "Content-Type": "multipart/form-data" } });
      }
      onClose();
    } catch (err) {

      alert("Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmittingVariant(true);
    try {
      const res = await adminService.addProductVariant(product.id, newVariant);
      setVariants([...variants, res.data.data]);
      setShowVariantForm(false);
      setNewVariant({ variantName: "", sku: "", price: "", stockQuantity: "" });
    } catch (err) {
      alert("Failed to add variant");
    } finally {
      setSubmittingVariant(false);
    }
  };

  return (
    <div className="space-y-6">
    <form className="space-y-4" id="main-product-form" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Product Name *</label>
          <input
            name="name"
            id="product-name-input"
            className="input"
            placeholder="e.g. Wireless Bluetooth Earphones"
            defaultValue={product?.name}
            required
          />
        </div>
        <div>
          <label className="label">Category *</label>
          <select name="categoryId" id="product-category-select" className="input" defaultValue={product?.categoryId} required>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Price (₹) *</label>
          <input
            name="price"
            type="number"
            className="input"
            placeholder="0.00"
            defaultValue={product?.price}
            min={0}
            step={0.01}
            required
          />
        </div>
        <div>
          <label className="label">Compare Price (₹)</label>
          <input name="compareAtPrice" type="number" className="input" placeholder="Original price" defaultValue={product?.compareAtPrice} min={0} step={0.01} />
        </div>
        <div>
          <label className="label">Stock *</label>
          <input
            name="stockQuantity"
            type="number"
            className="input"
            placeholder="0"
            defaultValue={product?.stockQuantity}
            min={0}
            required
          />
        </div>
        <div>
          <label className="label">Weight (g)</label>
          <input name="weight" type="number" className="input" defaultValue={product?.weight} placeholder="0" min={0} />
        </div>

        {/* Pricing & Tax Controls */}
        <div className="sm:col-span-2 mt-2 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
             Pricing & Shipping Rules
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="label text-[10px]">GST Percentage (%)</label>
              <input name="gstPercentage" type="number" className="input text-xs" defaultValue={product?.gstPercentage || 0} placeholder="e.g. 18" min={0} max={100} />
            </div>
            <div>
              <label className="label text-[10px]">Shipping Charge (₹)</label>
              <input name="shippingCharge" type="number" className="input text-xs" defaultValue={product?.shippingCharge || 0} placeholder="e.g. 50 (0 for Free)" min={0} step={0.01} />
            </div>
            <div>
              <label className="label text-[10px]">COD Charge (₹)</label>
              <input name="codCharge" type="number" className="input text-xs" defaultValue={product?.codCharge || 0} placeholder="e.g. 50 (0 for Free)" min={0} step={0.01} />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center cursor-pointer pb-2">
                <input name="isCodEnabled" value="true" type="checkbox" className="sr-only peer" defaultChecked={product?.isCodEnabled ?? true} />
                <div className="relative w-9 h-5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                <span className="ml-2 text-xs font-medium text-slate-700">Allow COD</span>
              </label>
            </div>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description *</label>
          <textarea name="description" className="input min-h-[80px] resize-y" defaultValue={product?.description} placeholder="Product description…" required />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Tags (comma separated)</label>
          <input name="tags" className="input" defaultValue={product?.tags?.join(", ")} placeholder="wireless, bluetooth, earphones" />
        </div>

        {/* Image Upload */}
        <div className="sm:col-span-2">
          <div className="flex justify-between items-center mb-3">
            <label className="label mb-0">Product Photos <span className="text-red-500">*</span></label>
            <span className="text-xs font-medium text-slate-400">{(existingImages?.length || 0) + selectedFiles.length}/10</span>
          </div>

          <div className="flex flex-wrap gap-4 items-start">
            {/* Existing Images */}
            {existingImages.map((img: any) => (
              <div key={img.id} className="relative w-[120px] h-[160px] rounded-xl overflow-hidden group shadow-sm bg-slate-100 border border-slate-200">
                <img src={img.imageUrl} alt="Product" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteExistingImage(img.id);
                  }} 
                  className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-sm transition-colors"
                >
                  <X size={12} strokeWidth={3}/>
                </button>
              </div>
            ))}

            {/* Newly Selected Files */}
            {selectedFiles.map((f, i) => (
              <div key={i} className="relative w-[120px] h-[160px] rounded-xl overflow-hidden group shadow-sm bg-slate-100 border border-slate-200">
                <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                
                {/* Delete Button */}
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedFiles(prev => prev.filter((_, index) => index !== i));
                  }} 
                  className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-sm transition-colors"
                >
                  <X size={12} strokeWidth={3}/>
                </button>
              </div>
            ))}

            {((existingImages?.length || 0) + selectedFiles.length) < 10 && (
              <label 
                className={`w-[120px] h-[160px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors
                  ${dragOver ? 'border-purple-400 bg-purple-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { 
                  e.preventDefault(); 
                  setDragOver(false); 
                  if (e.dataTransfer.files) {
                    setSelectedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files!)].slice(0, 10));
                  }
                }}
              >
                <Upload size={20} className="text-slate-400 mb-2" />
                <span className="text-xs font-medium text-slate-500">Add Photo</span>
                <input 
                  name="images" 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files) {
                      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 10));
                    }
                  }}
                />
              </label>
            )}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input name="isPublished" value="true" type="checkbox" className="sr-only peer" defaultChecked={product?.isPublished ?? true} />
            <div className="w-9 h-5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            <span className="ml-2 text-sm text-slate-700">Active</span>
          </label>
        </div>
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input name="isFeatured" value="true" type="checkbox" className="sr-only peer" defaultChecked={product?.isFeatured} />
            <div className="w-9 h-5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            <span className="ml-2 text-sm text-slate-700">Featured</span>
          </label>
        </div>
      </div>
    </form>

    {product && (
      <div className="border-t border-slate-200 pt-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TagIcon size={16} className="text-indigo-600" /> Product Variants
          </h3>
          <button 
            type="button"
            onClick={() => setShowVariantForm(!showVariantForm)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            {showVariantForm ? "Cancel" : "+ Add Variant"}
          </button>
        </div>

        {showVariantForm && (
          <form onSubmit={handleAddVariant} className="bg-slate-50 p-4 rounded-lg mb-4 space-y-3 border border-slate-100">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-[10px]">Variant Name *</label>
                <input 
                  required className="input text-xs h-8" placeholder="e.g. Size M, Red" 
                  value={newVariant.variantName} onChange={e => setNewVariant({...newVariant, variantName: e.target.value})} 
                />
              </div>
              <div>
                <label className="label text-[10px]">SKU</label>
                <input 
                  className="input text-xs h-8" placeholder="e.g. TSHIRT-M-RED" 
                  value={newVariant.sku} onChange={e => setNewVariant({...newVariant, sku: e.target.value})} 
                />
              </div>
              <div>
                <label className="label text-[10px]">Price Override (₹)</label>
                <input 
                  type="number" step={0.01} className="input text-xs h-8" placeholder="Leave empty for default" 
                  value={newVariant.price} onChange={e => setNewVariant({...newVariant, price: e.target.value})} 
                />
              </div>
              <div>
                <label className="label text-[10px]">Stock Quantity *</label>
                <input 
                  required type="number" className="input text-xs h-8" placeholder="0" 
                  value={newVariant.stockQuantity} onChange={e => setNewVariant({...newVariant, stockQuantity: e.target.value})} 
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button disabled={submittingVariant} className="btn-primary py-1.5 px-3 text-xs">
                {submittingVariant ? "Adding..." : "Save Variant"}
              </button>
            </div>
          </form>
        )}

        {variants.length > 0 ? (
          <div className="space-y-2">
            {variants.map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg text-sm">
                <div>
                  <p className="font-semibold text-slate-900">{v.variantName}</p>
                  <p className="text-xs text-slate-500 font-mono">{v.sku || "No SKU"}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900">{v.price ? formatPrice(v.price) : "Default Price"}</p>
                  <p className="text-xs text-slate-500">{v.stockQuantity} in stock</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No variants added yet.</p>
        )}
      </div>
    )}

      <div className="flex gap-2 pt-2 justify-end border-t border-slate-100 mt-6 pt-4">
        <button type="button" onClick={onClose} className="btn-secondary">
          <X size={14} /> Cancel
        </button>
        <button type="submit" form="main-product-form" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : product ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </div>
  );
}
