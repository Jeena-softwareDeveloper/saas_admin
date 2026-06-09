"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, Shield, ShieldCheck, User, ToggleLeft, ToggleRight, Eye, MapPin, Package, Loader2, Trash2, Edit2, AlertTriangle, Store, Server, Key, Copy, Fingerprint, Lock, IndianRupee, Navigation } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { IntegrationsModal } from "@/components/admin/IntegrationsModal";
import { ClientPaymentsDrawer } from "@/components/admin/ClientPaymentsDrawer";
import { EmptyState, Pagination, Table, TableHeader, TableBody, Tr, Th, Td, FilterBar } from "@/components/ui";
import { formatDate, getRoleBadge, formatPrice, getOrderStatusBadge } from "@/lib/utils";
import type { Role } from "@/lib/types";
import { adminService } from "@/services/admin.service";
import { SetAdminHeader } from "@/lib/adminHeaderContext";

const FEATURE_MODULES = [
  { key: 'MODULE_PRODUCTS', label: 'Products' },
  { key: 'MODULE_CATEGORIES', label: 'Categories' },
  { key: 'MODULE_ORDERS', label: 'Orders' },
  { key: 'MODULE_USERS', label: 'Users' },
  { key: 'MODULE_BANNERS', label: 'Banners' },
  { key: 'MODULE_BLOGS', label: 'Blogs' },
  { key: 'MODULE_CERTIFICATIONS', label: 'Certifications' },
  { key: 'MODULE_REVIEWS', label: 'Reviews' },
  { key: 'MODULE_COUPONS', label: 'Coupons' },
  { key: 'MODULE_SUPPORT', label: 'Support' },
  { key: 'MODULE_SETTINGS', label: 'Settings' }
];

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [integrationsUser, setIntegrationsUser] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [editModalOpen, setEditModalOpen] = useState<any | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createData, setCreateData] = useState({ name: "", email: "", supportEmail: "", storeAddress_street: "", storeAddress_city: "", storeAddress_district: "", storeAddress_state: "", storeAddress_pincode: "", phone: "", password: "", shopName: "", logoUrl: "", logoFile: null as File | null, logoPreview: "", primaryColor: "#e11955", footerColor: "#0f172a", role: "ADMIN", permissions: [] as string[], domain: "", totalPaid: "", monthlyFee: "", serverFee: "", cloudinaryCloudName: "", cloudinaryApiKey: "", cloudinaryApiSecret: "", razorpayKeyId: "", razorpayKeySecret: "", shiprocketEmail: "", shiprocketPassword: "", smtpUser: "", smtpPass: "", backupEmail: "" });
  
  // Key Modal States
  const [keyModalOpen, setKeyModalOpen] = useState<any | null>(null);
  const [keyResetStep, setKeyResetStep] = useState<1 | 2>(1);
  const [keyConfirmInput, setKeyConfirmInput] = useState("");
  const [currentClientKey, setCurrentClientKey] = useState(import.meta.env.VITE_DECRYPTION_KEY || '');
  const [keySuccessMsg, setKeySuccessMsg] = useState("");

  const [storeKeyModalOpen, setStoreKeyModalOpen] = useState<any | null>(null);
  const [storeKeyResetStep, setStoreKeyResetStep] = useState<1 | 2>(1);
  const [storeKeyConfirmInput, setStoreKeyConfirmInput] = useState("");
  const [currentStoreKey, setCurrentStoreKey] = useState("");
  const [storeKeySuccessMsg, setStoreKeySuccessMsg] = useState("");
  
  const [pwdModalOpen, setPwdModalOpen] = useState<any | null>(null);
  const [pwdNewInput, setPwdNewInput] = useState("");
  const [pwdConfirmInput, setPwdConfirmInput] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [paymentsModalOpen, setPaymentsModalOpen] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const fetchUserDetails = async (userId: string) => {
    setLoadingDetails(true);
    try {
      const res = await adminService.getCustomer(userId);
      setSelectedUser(res.data.data);
    } catch (err: any) {
      alert("Failed to load details");
    } finally {
      setLoadingDetails(false);
    }
  };


  const fetchUsers = async () => {
    try {
      const res = await adminService.getCustomers();
      // Only show ADMIN — not SUPER_ADMIN or regular customers
      const adminUsers = (res.data.data.data as any[]).filter(
        (u: any) => u.role === 'ADMIN'
      );
      setUsers(adminUsers);
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || (roleFilter === "ACTIVE" ? u.isActive : u.role === roleFilter);
    return matchSearch && matchRole;
  });

  const perPage = 10;
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-4 animate-fade-in">
      <SetAdminHeader 
        title="Clients" 
        subtitle={`${filtered.length} clients registered`} 
        action={
          <button onClick={() => setCreateModalOpen(true)} className="btn-primary">
            <User size={16} /> Create Client
          </button>
        }
        filter={
          <FilterBar
            search={search}
            onSearchChange={(val) => { setSearch(val); setPage(1); }}
            searchPlaceholder="Search clients…"
            filters={[
              {
                value: roleFilter,
                onChange: (val) => { setRoleFilter(val); setPage(1); },
                options: [
                  { label: "All Clients", value: "ALL" },
                  { label: "Active Clients", value: "ACTIVE" }
                ]
              }
            ]}
          />
        }
      />
      
      {/* Table */}
      <div className="flex flex-col gap-2">
        <Table>
            <TableHeader>
              <Tr>
                <Th>Client Name</Th>
                <Th>Phone Number</Th>
                <Th>Shop Name</Th>
                <Th>Current Bill</Th>
                <Th>Client Details (Email & Joined)</Th>
                <Th>Actions</Th>
              </Tr>
            </TableHeader>
            <TableBody>
              {loading ? (
                <Tr><Td colSpan={6} className="text-center py-8 text-slate-500">Loading users...</Td></Tr>
              ) : paged.map((user) => {
                const roleBadge = getRoleBadge(user.role);
                return (
                  <Tr key={user.id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold">
                          {user.name[0]}
                        </div>
                        <span className="font-medium text-slate-900">{user.name}</span>
                      </div>
                    </Td>
                    <Td>{user.phone || <span className="text-slate-400 italic">Not provided</span>}</Td>
                    <Td>
                      {user.shop_name ? (
                        <div className="flex items-center gap-1.5">
                          <Store size={13} className="text-indigo-500 shrink-0" />
                          <span className="font-medium text-slate-800">{user.shop_name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </Td>
                    <Td className="font-bold text-slate-900">{formatPrice(user.current_bill || 0)}</Td>
                    <Td>
                      <p className="text-sm text-slate-700">{user.email}</p>
                      <p className="text-xs text-slate-500">Joined {formatDate(user.created_at)}</p>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fetchUserDetails(user.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setStoreKeyModalOpen(user);
                            setStoreKeyResetStep(1);
                            setCurrentStoreKey(user.tenant?.storeKey || user.tenant?.id || "N/A");
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                          title="Reset Store API Key"
                        >
                          <Fingerprint size={16} className="text-orange-500" />
                        </button>
                        <button
                          onClick={() => {
                            setKeyModalOpen(user);
                            setKeyResetStep(1);
                            setKeyConfirmInput("");
                            setKeySuccessMsg("");
                            const tenantKey = user.tenant?.encryptionKey;
                            setCurrentClientKey(tenantKey || import.meta.env.VITE_DECRYPTION_KEY || '');
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Manage Data Encryption Key"
                        >
                          <Key size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setPwdModalOpen(user);
                            setPwdNewInput("");
                            setPwdConfirmInput("");
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Reset Password"
                        >
                          <Lock size={16} className="text-red-500" />
                        </button>
                        <button
                          onClick={() => {
                            setPaymentsModalOpen(user);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                          title="Manage Payments"
                        >
                          <IndianRupee size={16} className="text-green-500" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/clients/${user.id}/storefront`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                          title="Manage Navigation Menus & Storefront"
                        >
                          <Navigation size={16} className="text-violet-500" />
                        </button>
                        <button
                          onClick={() => {
                            let parsedAddress = { street: "", city: "", district: "", state: "", pincode: "" };
                            if (user.tenant?.storeAddress) {
                              try {
                                parsedAddress = JSON.parse(user.tenant.storeAddress);
                              } catch(e) {
                                parsedAddress.street = user.tenant.storeAddress;
                              }
                            }
                            setEditModalOpen({
                              ...user,
                              tenant: user.tenant ? {
                                ...user.tenant,
                                storeAddress_street: parsedAddress.street,
                                storeAddress_city: parsedAddress.city,
                                storeAddress_district: parsedAddress.district,
                                storeAddress_state: parsedAddress.state,
                                storeAddress_pincode: parsedAddress.pincode,
                              } : null
                            });
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Edit client"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteModalOpen(user.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete client"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
              {paged.length === 0 && (
                <Tr><Td colSpan={6}>
                  <EmptyState icon={<Users size={24} />} title="No users found" />
                </Td></Tr>
              )}
            </TableBody>
          </Table>
        <div className="px-4 py-3 border-t border-slate-100">
          <Pagination page={page} totalPages={Math.ceil(filtered.length / perPage)} onPageChange={setPage} />
        </div>
      </div>

      {/* Customer Detail Modal */}
      <Modal isOpen={!!selectedUser || loadingDetails} onClose={() => setSelectedUser(null)} title="User Details" size="lg">
        {loadingDetails ? (
          <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
        ) : selectedUser ? (
          <div className="space-y-6">
            {/* Profile Info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold">
                {selectedUser.name[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedUser.name}</h3>
                <p className="text-sm text-slate-500">{selectedUser.email}</p>
                {selectedUser.phone && <p className="text-sm text-slate-500">{selectedUser.phone}</p>}
              </div>
              <div className="ml-auto flex flex-col items-end gap-2">
                <span className={getRoleBadge(selectedUser.role).className}>{getRoleBadge(selectedUser.role).label}</span>
                <span className={selectedUser.isActive ? "badge-green" : "badge-red"}>
                  {selectedUser.isActive ? "Active" : "Suspended"}
                </span>
              </div>
            </div>

            {/* Tenant Subscription Details (for Admin clients) */}
            {selectedUser.ownedTenant && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Store size={16} /> Client Subscription & Domain</h4>
                  <button
                    onClick={() => {
                      setIntegrationsUser(selectedUser);
                    }}
                    className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Server size={14} /> Configure Integrations
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="card p-3 border-l-4 border-l-indigo-500">
                    <p className="text-xs text-slate-500 font-medium">Custom Domain</p>
                    <p className="font-bold text-slate-900 text-sm mt-1">{selectedUser.ownedTenant.domain || "Not configured"}</p>
                  </div>
                  <div className="card p-3 border-l-4 border-l-emerald-500">
                    <p className="text-xs text-slate-500 font-medium">Total Project Paid</p>
                    <p className="font-bold text-slate-900 text-sm mt-1">{formatPrice(selectedUser.ownedTenant.totalPaid || 0)}</p>
                  </div>
                  <div className="card p-3 border-l-4 border-l-blue-500">
                    <p className="text-xs text-slate-500 font-medium">Monthly Maintenance</p>
                    <p className="font-bold text-slate-900 text-sm mt-1">{formatPrice(selectedUser.ownedTenant.monthlyFee || 0)}/mo</p>
                  </div>
                  <div className="card p-3 border-l-4 border-l-purple-500">
                    <p className="text-xs text-slate-500 font-medium">Server Hosting Fee</p>
                    <p className="font-bold text-slate-900 text-sm mt-1">{formatPrice(selectedUser.ownedTenant.serverFee || 0)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Addresses */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><MapPin size={16} /> Saved Addresses</h4>
              {selectedUser.addresses?.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No addresses saved.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedUser.addresses?.map((addr: any) => (
                    <div key={addr.id} className="card p-3 text-sm relative">
                      {addr.isDefault && <span className="absolute top-2 right-2 badge-blue text-[10px] py-0.5 px-1.5">Default</span>}
                      <p className="font-semibold text-slate-900">{addr.fullName}</p>
                      <p className="text-slate-600">{addr.addressLine1}</p>
                      {addr.addressLine2 && <p className="text-slate-600">{addr.addressLine2}</p>}
                      <p className="text-slate-600">{addr.city}, {addr.state} {addr.pincode}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><Package size={16} /> Recent Orders</h4>
              {selectedUser.orders?.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No orders found.</p>
              ) : (
                <div className="space-y-3">
                  {selectedUser.orders?.map((order: any) => {
                    const badge = getOrderStatusBadge(order.status);
                    return (
                      <div key={order.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                        <div>
                          <p className="font-mono text-xs font-bold text-indigo-600">{order.orderNumber}</p>
                          <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={badge.className}>{badge.label}</span>
                          <span className="font-bold text-sm text-slate-900">{formatPrice(Number(order.totalAmount))}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Integrations Modal */}
      {integrationsUser && (
        <IntegrationsModal
          isOpen={!!integrationsUser}
          onClose={() => setIntegrationsUser(null)}
          userId={integrationsUser.id}
          shopName={integrationsUser.ownedTenant?.name || integrationsUser.name}
        />
      )}

      {/* Delete Warning Modal */}
      <Modal isOpen={!!deleteModalOpen} onClose={() => { setDeleteModalOpen(null); setDeleteConfirmText(""); }} title="Delete Client" size="sm">
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Are you sure?</h3>
          <p className="text-sm text-slate-500 mb-4">
            Do you really want to delete this client? This process cannot be undone.
          </p>
          <div className="w-full text-left mb-6">
            <label className="label text-xs">Type <span className="font-bold text-rose-600">DELETE</span> to confirm</label>
            <input 
              type="text" 
              className="input mt-1" 
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={() => { setDeleteModalOpen(null); setDeleteConfirmText(""); }} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button
              disabled={deleteConfirmText !== "DELETE"}
              onClick={async () => {
                if (deleteModalOpen) {
                  try {
                    await adminService.deleteCustomer(deleteModalOpen);
                    setToastMessage("Client deleted successfully!");
                    setTimeout(() => setToastMessage(""), 3000);
                  } catch (err: any) {
                    alert(err.response?.data?.error || "Failed to delete client");
                  }
                }
                setDeleteModalOpen(null);
                setDeleteConfirmText("");
                fetchUsers();
              }}
              className="bg-rose-600 text-white font-medium text-sm rounded-xl px-4 py-2 hover:bg-rose-700 disabled:opacity-50 transition-colors flex-1 justify-center shadow-sm shadow-rose-600/20"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Client Modal */}
      <Modal isOpen={!!editModalOpen} onClose={() => setEditModalOpen(null)} title="Edit Client Details">
        {editModalOpen && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              let addressJson = "";
              try {
                addressJson = JSON.stringify({
                  street: editModalOpen.tenant?.storeAddress_street || "",
                  city: editModalOpen.tenant?.storeAddress_city || "",
                  district: editModalOpen.tenant?.storeAddress_district || "",
                  state: editModalOpen.tenant?.storeAddress_state || "",
                  pincode: editModalOpen.tenant?.storeAddress_pincode || ""
                });
              } catch (e) {}

              const formData = new FormData();
              formData.append("name", editModalOpen.name || "");
              formData.append("email", editModalOpen.email || "");
              formData.append("supportEmail", editModalOpen.tenant?.storeEmail || "");
              formData.append("storeAddress", addressJson);
              formData.append("phone", editModalOpen.phone || "");
              formData.append("shopName", editModalOpen.shop_name || "");
              formData.append("role", editModalOpen.role || "");
              formData.append("isActive", String(editModalOpen.is_active));
              if (editModalOpen.password) {
                formData.append("password", editModalOpen.password);
              }
              
              if (editModalOpen.permissions) {
                editModalOpen.permissions.forEach((perm: string) => {
                  formData.append("permissions", perm);
                });
              }
              if (editModalOpen.tenant) {
                formData.append("domain", editModalOpen.tenant.domain || "");
                formData.append("totalPaid", String(editModalOpen.tenant.totalPaid || 0));
                formData.append("monthlyFee", String(editModalOpen.tenant.monthlyFee || 0));
                formData.append("serverFee", String(editModalOpen.tenant.serverFee || 0));
                formData.append("primaryColor", editModalOpen.tenant.primaryColor || "#e11955");
                formData.append("footerColor", editModalOpen.tenant.footerColor || "#0f172a");
                
                if (editModalOpen.logoFile) {
                  formData.append("logo", editModalOpen.logoFile);
                } else if (editModalOpen.tenant.logoUrl === "") {
                  formData.append("logoUrl", "");
                } else {
                  formData.append("logoUrl", editModalOpen.tenant.logoUrl || "");
                }
              }

              await adminService.updateCustomerStatus(editModalOpen.id, formData);
              fetchUsers();
              setEditModalOpen(null);
            } catch (err) {
              alert("Failed to update client");
            }
          }} className="space-y-4 p-2 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  className="input"
                  value={editModalOpen.name || ""}
                  onChange={(e) => setEditModalOpen({...editModalOpen, name: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Admin Email Address (For Login)</label>
                <input
                  type="email"
                  className="input"
                  value={editModalOpen.email || ""}
                  onChange={(e) => setEditModalOpen({...editModalOpen, email: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Store Support Email (Public facing)</label>
                <input
                  type="email"
                  className="input"
                  value={editModalOpen.tenant?.storeEmail || ""}
                  onChange={(e) => setEditModalOpen({...editModalOpen, tenant: {...editModalOpen.tenant, storeEmail: e.target.value}})}
                />
              </div>
              <div className="col-span-2">
                <label className="label mb-2">Store Address</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <input type="text" placeholder="Street / Area" className="input" value={editModalOpen.tenant?.storeAddress_street || ""} onChange={(e) => setEditModalOpen({...editModalOpen, tenant: {...editModalOpen.tenant, storeAddress_street: e.target.value}})} />
                  </div>
                  <div>
                    <input type="text" placeholder="City / Taluk" className="input" value={editModalOpen.tenant?.storeAddress_city || ""} onChange={(e) => setEditModalOpen({...editModalOpen, tenant: {...editModalOpen.tenant, storeAddress_city: e.target.value}})} />
                  </div>
                  <div>
                    <input type="text" placeholder="District" className="input" value={editModalOpen.tenant?.storeAddress_district || ""} onChange={(e) => setEditModalOpen({...editModalOpen, tenant: {...editModalOpen.tenant, storeAddress_district: e.target.value}})} />
                  </div>
                  <div>
                    <input type="text" placeholder="State" className="input" value={editModalOpen.tenant?.storeAddress_state || ""} onChange={(e) => setEditModalOpen({...editModalOpen, tenant: {...editModalOpen.tenant, storeAddress_state: e.target.value}})} />
                  </div>
                  <div>
                    <input type="text" placeholder="Pincode" className="input" value={editModalOpen.tenant?.storeAddress_pincode || ""} onChange={(e) => setEditModalOpen({...editModalOpen, tenant: {...editModalOpen.tenant, storeAddress_pincode: e.target.value}})} />
                  </div>
                </div>
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="text"
                  className="input"
                  value={editModalOpen.phone || ""}
                  onChange={(e) => setEditModalOpen({...editModalOpen, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Reset Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Leave blank to keep current"
                  value={editModalOpen.password || ""}
                  onChange={(e) => setEditModalOpen({...editModalOpen, password: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="label">Shop Name</label>
              <input
                type="text"
                className="input"
                value={editModalOpen.shop_name || ""}
                onChange={(e) => setEditModalOpen({...editModalOpen, shop_name: e.target.value})}
              />
            </div>
            <div>
              <label className="label">Shop Logo</label>
              <div className="flex items-center gap-4 mt-1">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
                  {editModalOpen.logoPreview || editModalOpen.tenant?.logoUrl ? (
                    <img src={editModalOpen.logoPreview || editModalOpen.tenant?.logoUrl} alt="Logo preview" className="w-full h-full object-contain p-1" />
                  ) : (
                    <Store size={24} className="text-slate-300" />
                  )}
                </div>
                <div className="space-y-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="edit-logo-file-input"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setEditModalOpen({
                          ...editModalOpen,
                          logoFile: file,
                          logoPreview: url
                        });
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('edit-logo-file-input')?.click()}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Select Logo File
                  </button>
                  {editModalOpen.tenant?.logoUrl && !editModalOpen.logoFile && (
                    <button
                      type="button"
                      onClick={() => setEditModalOpen({
                        ...editModalOpen,
                        tenant: {
                          ...editModalOpen.tenant,
                          logoUrl: ''
                        }
                      })}
                      className="block text-[11px] text-red-500 hover:underline"
                    >
                      Remove Logo
                    </button>
                  )}
                  <p className="text-[10px] text-slate-400">PNG, SVG, WEBP · Max: 5MB</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Primary Theme Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-10 h-10 border border-slate-200 rounded cursor-pointer"
                    value={editModalOpen.tenant?.primaryColor || "#e11955"}
                    onChange={(e) => setEditModalOpen({
                      ...editModalOpen,
                      tenant: {
                        ...(editModalOpen.tenant || {}),
                        primaryColor: e.target.value
                      }
                    })}
                  />
                  <input
                    type="text"
                    className="input font-mono text-sm"
                    value={editModalOpen.tenant?.primaryColor || "#e11955"}
                    onChange={(e) => setEditModalOpen({
                      ...editModalOpen,
                      tenant: {
                        ...(editModalOpen.tenant || {}),
                        primaryColor: e.target.value
                      }
                    })}
                    placeholder="#e11955"
                  />
                </div>
              </div>
              <div>
                <label className="label">Footer Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-10 h-10 border border-slate-200 rounded cursor-pointer"
                    value={editModalOpen.tenant?.footerColor || "#0f172a"}
                    onChange={(e) => setEditModalOpen({
                      ...editModalOpen,
                      tenant: {
                        ...(editModalOpen.tenant || {}),
                        footerColor: e.target.value
                      }
                    })}
                  />
                  <input
                    type="text"
                    className="input font-mono text-sm"
                    value={editModalOpen.tenant?.footerColor || "#0f172a"}
                    onChange={(e) => setEditModalOpen({
                      ...editModalOpen,
                      tenant: {
                        ...(editModalOpen.tenant || {}),
                        footerColor: e.target.value
                      }
                    })}
                    placeholder="#0f172a"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="label">Role</label>
              <select
                className="input"
                value={editModalOpen.role}
                onChange={(e) => setEditModalOpen({...editModalOpen, role: e.target.value})}
              >
              <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Custom Domain</label>
                <input
                  type="text"
                  className="input"
                  value={editModalOpen.tenant?.domain || ""}
                  onChange={(e) => setEditModalOpen({...editModalOpen, tenant: {...editModalOpen.tenant, domain: e.target.value}})}
                />
              </div>
              <div>
                <label className="label">Total Paid (₹)</label>
                <input
                  type="number"
                  className="input"
                  value={editModalOpen.tenant?.totalPaid || 0}
                  onChange={(e) => setEditModalOpen({...editModalOpen, tenant: {...editModalOpen.tenant, totalPaid: e.target.value}})}
                />
              </div>
              <div>
                <label className="label">Monthly Maintenance (₹)</label>
                <input
                  type="number"
                  className="input"
                  value={editModalOpen.tenant?.monthlyFee || 0}
                  onChange={(e) => setEditModalOpen({...editModalOpen, tenant: {...editModalOpen.tenant, monthlyFee: e.target.value}})}
                />
              </div>
              <div>
                <label className="label">Server Hosting (₹)</label>
                <input
                  type="number"
                  className="input"
                  value={editModalOpen.tenant?.serverFee || 0}
                  onChange={(e) => setEditModalOpen({...editModalOpen, tenant: {...editModalOpen.tenant, serverFee: e.target.value}})}
                />
              </div>
            </div>

            <div>
              <label className="label">Status</label>
              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen({ ...editModalOpen, is_active: true })}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${editModalOpen.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalOpen({ ...editModalOpen, is_active: false })}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${!editModalOpen.is_active ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  Suspended
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
               <span className="text-sm font-medium text-slate-700">API Integrations</span>
               <button
                  type="button"
                  onClick={() => {
                    setIntegrationsUser(editModalOpen);
                    setEditModalOpen(null);
                  }}
                  className="text-xs font-semibold px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Server size={14} /> Configure API Keys
                </button>
            </div>

            <div>
              <label className="label mb-2">Permissions (Accessible Menus)</label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {FEATURE_MODULES.map(module => (
                  <label key={module.key} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={editModalOpen.permissions?.includes(module.key)}
                      onChange={(e) => {
                        const newPerms = e.target.checked 
                          ? [...(editModalOpen.permissions || []), module.key]
                          : (editModalOpen.permissions || []).filter((p: string) => p !== module.key);
                        setEditModalOpen({ ...editModalOpen, permissions: newPerms });
                      }}
                    />
                    <span className="text-slate-700">{module.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setEditModalOpen(null)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Create Client Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Client" size="md">
        <form onSubmit={async (e) => {
          e.preventDefault();
          try {
            let addressJson = "";
            try {
              addressJson = JSON.stringify({
                street: createData.storeAddress_street || "",
                city: createData.storeAddress_city || "",
                district: createData.storeAddress_district || "",
                state: createData.storeAddress_state || "",
                pincode: createData.storeAddress_pincode || ""
              });
            } catch (e) {}

            const formData = new FormData();
            formData.append("name", createData.name);
            formData.append("email", createData.email);
            formData.append("supportEmail", createData.supportEmail || "");
            formData.append("storeAddress", addressJson);
            formData.append("phone", createData.phone || "");
            formData.append("shopName", createData.shopName || "");
            formData.append("password", createData.password);
            formData.append("role", createData.role);
            if (createData.permissions) {
              createData.permissions.forEach(perm => {
                formData.append("permissions", perm);
              });
            }
            formData.append("domain", createData.domain || "");
            formData.append("totalPaid", String(createData.totalPaid || 0));
            formData.append("monthlyFee", String(createData.monthlyFee || 0));
            formData.append("serverFee", String(createData.serverFee || 0));
            
            if (createData.logoFile) {
              formData.append("logo", createData.logoFile);
            }
            formData.append("primaryColor", createData.primaryColor);
            formData.append("footerColor", createData.footerColor);

            await adminService.createCustomer(formData);
            setCreateModalOpen(false);
            setCreateData({ name: "", email: "", supportEmail: "", storeAddress_street: "", storeAddress_city: "", storeAddress_district: "", storeAddress_state: "", storeAddress_pincode: "", phone: "", password: "", shopName: "", logoUrl: "", logoFile: null, logoPreview: "", primaryColor: "#e11955", footerColor: "#0f172a", role: "ADMIN", permissions: [], domain: "", totalPaid: "", monthlyFee: "", serverFee: "", cloudinaryCloudName: "", cloudinaryApiKey: "", cloudinaryApiSecret: "", razorpayKeyId: "", razorpayKeySecret: "", shiprocketEmail: "", shiprocketPassword: "", smtpUser: "", smtpPass: "", backupEmail: "" });
            fetchUsers();
          } catch (err) {
            alert("Failed to create client");
          }
        }} className="space-y-4 p-2">
          <div>
            <label className="label">Full Name</label>
            <input required type="text" className="input" value={createData.name} onChange={e => setCreateData({ ...createData, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Admin Email Address (For Login)</label>
            <input required type="email" className="input" value={createData.email} onChange={e => setCreateData({ ...createData, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Store Support Email (Public facing)</label>
            <input type="email" placeholder="support@domain.com" className="input" value={createData.supportEmail} onChange={e => setCreateData({ ...createData, supportEmail: e.target.value })} />
          </div>
          <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
            <label className="label mb-3">Store Address</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <input type="text" placeholder="Street / Area" className="input" value={createData.storeAddress_street} onChange={e => setCreateData({ ...createData, storeAddress_street: e.target.value })} />
              </div>
              <div>
                <input type="text" placeholder="City / Taluk" className="input" value={createData.storeAddress_city} onChange={e => setCreateData({ ...createData, storeAddress_city: e.target.value })} />
              </div>
              <div>
                <input type="text" placeholder="District" className="input" value={createData.storeAddress_district} onChange={e => setCreateData({ ...createData, storeAddress_district: e.target.value })} />
              </div>
              <div>
                <input type="text" placeholder="State" className="input" value={createData.storeAddress_state} onChange={e => setCreateData({ ...createData, storeAddress_state: e.target.value })} />
              </div>
              <div>
                <input type="text" placeholder="Pincode" className="input" value={createData.storeAddress_pincode} onChange={e => setCreateData({ ...createData, storeAddress_pincode: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="col-span-2 border-t border-slate-100 pt-4"></div>
          <div>
            <label className="label">Phone Number</label>
            <input type="text" className="input" value={createData.phone} onChange={e => setCreateData({ ...createData, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Shop Name</label>
            <input type="text" className="input" value={createData.shopName} onChange={e => setCreateData({ ...createData, shopName: e.target.value })} />
          </div>
          <div>
            <label className="label">Shop Logo</label>
            <div className="flex items-center gap-4 mt-1">
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
                {createData.logoPreview ? (
                  <img src={createData.logoPreview} alt="Logo preview" className="w-full h-full object-contain p-1" />
                ) : (
                  <Store size={24} className="text-slate-300" />
                )}
              </div>
              <div className="space-y-1">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="create-logo-file-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setCreateData({
                        ...createData,
                        logoFile: file,
                        logoPreview: url
                      });
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('create-logo-file-input')?.click()}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Select Logo File
                </button>
                <p className="text-[10px] text-slate-400">PNG, SVG, WEBP · Max: 5MB</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Primary Theme Color</label>
              <div className="flex items-center gap-2">
                <input type="color" className="w-10 h-10 border border-slate-200 rounded cursor-pointer" value={createData.primaryColor} onChange={e => setCreateData({ ...createData, primaryColor: e.target.value })} />
                <input type="text" className="input font-mono text-sm" value={createData.primaryColor} onChange={e => setCreateData({ ...createData, primaryColor: e.target.value })} placeholder="#e11955" />
              </div>
            </div>
            <div>
              <label className="label">Footer Background Color</label>
              <div className="flex items-center gap-2">
                <input type="color" className="w-10 h-10 border border-slate-200 rounded cursor-pointer" value={createData.footerColor} onChange={e => setCreateData({ ...createData, footerColor: e.target.value })} />
                <input type="text" className="input font-mono text-sm" value={createData.footerColor} onChange={e => setCreateData({ ...createData, footerColor: e.target.value })} placeholder="#0f172a" />
              </div>
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <input required type="password" className="input" value={createData.password} onChange={e => setCreateData({ ...createData, password: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Custom Domain (CORS)</label>
              <input type="text" placeholder="e.g. http://my-shop.com" className="input" value={createData.domain} onChange={e => setCreateData({ ...createData, domain: e.target.value })} />
            </div>
            <div>
              <label className="label">Total Project Paid (₹)</label>
              <input type="number" placeholder="0" className="input" value={createData.totalPaid} onChange={e => setCreateData({ ...createData, totalPaid: e.target.value })} />
            </div>
            <div>
              <label className="label">Monthly Maintenance (₹)</label>
              <input type="number" placeholder="0" className="input" value={createData.monthlyFee} onChange={e => setCreateData({ ...createData, monthlyFee: e.target.value })} />
            </div>
            <div>
              <label className="label">Server Hosting Fee (₹)</label>
              <input type="number" placeholder="0" className="input" value={createData.serverFee} onChange={e => setCreateData({ ...createData, serverFee: e.target.value })} />
            </div>
          </div>


          {/* Permissions — only for ADMIN role */}
          {createData.role === "ADMIN" && (
          <div>
            <label className="label mb-2">Accessible Menus</label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {FEATURE_MODULES.map(module => (
                <label key={module.key} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={createData.permissions.includes(module.key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCreateData({ ...createData, permissions: [...createData.permissions, module.key] });
                      } else {
                        setCreateData({ ...createData, permissions: createData.permissions.filter(p => p !== module.key) });
                      }
                    }}
                  />
                  <span className="text-slate-700">{module.label}</span>
                </label>
              ))}
            </div>
            </div>
            )}

            {/* Integrations Section */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Server size={16} className="text-indigo-600"/> API Integrations (Optional)
              </h4>
              <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2 border p-3 rounded-lg bg-slate-50">
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cloudinary</h5>
                  <input type="text" placeholder="Cloud Name" className="w-full border rounded p-2 text-sm" value={createData.cloudinaryCloudName} onChange={e => setCreateData({...createData, cloudinaryCloudName: e.target.value})} />
                  <input type="text" placeholder="API Key" className="w-full border rounded p-2 text-sm" value={createData.cloudinaryApiKey} onChange={e => setCreateData({...createData, cloudinaryApiKey: e.target.value})} />
                  <input type="password" placeholder="API Secret" className="w-full border rounded p-2 text-sm" value={createData.cloudinaryApiSecret} onChange={e => setCreateData({...createData, cloudinaryApiSecret: e.target.value})} />
                </div>
                <div className="space-y-3 pt-3 border-t">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Razorpay</h5>
                  <input type="text" placeholder="Key ID" className="w-full border rounded p-2 text-sm" value={createData.razorpayKeyId} onChange={e => setCreateData({...createData, razorpayKeyId: e.target.value})} />
                  <input type="password" placeholder="Key Secret" className="w-full border rounded p-2 text-sm" value={createData.razorpayKeySecret} onChange={e => setCreateData({...createData, razorpayKeySecret: e.target.value})} />
                </div>
                <div className="space-y-3 pt-3 border-t">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shiprocket</h5>
                  <input type="email" placeholder="Email" className="w-full border rounded p-2 text-sm" value={createData.shiprocketEmail} onChange={e => setCreateData({...createData, shiprocketEmail: e.target.value})} />
                  <input type="password" placeholder="Password" className="w-full border rounded p-2 text-sm" value={createData.shiprocketPassword} onChange={e => setCreateData({...createData, shiprocketPassword: e.target.value})} />
                </div>
                <div className="space-y-3 pt-3 border-t">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mail & Backup</h5>
                  <input type="email" placeholder="SMTP Email" className="w-full border rounded p-2 text-sm" value={createData.smtpUser} onChange={e => setCreateData({...createData, smtpUser: e.target.value})} />
                  <input type="password" placeholder="SMTP Password" className="w-full border rounded p-2 text-sm" value={createData.smtpPass} onChange={e => setCreateData({...createData, smtpPass: e.target.value})} />
                  <input type="email" placeholder="Backup Drive Email" className="w-full border rounded p-2 text-sm" value={createData.backupEmail} onChange={e => setCreateData({...createData, backupEmail: e.target.value})} />
                </div>
              </div>
            </div>


          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setCreateModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">Create Client</button>
          </div>
        </form>
      </Modal>

      {/* Key Management Modal */}
      <Modal 
        isOpen={!!keyModalOpen} 
        onClose={() => {
          setKeyModalOpen(null);
          setKeyResetStep(1);
          setKeySuccessMsg("");
        }} 
        title={`Data Encryption Key - ${keyModalOpen?.shopName || keyModalOpen?.name}`}
      >
        <div className="space-y-6">
          {keySuccessMsg && (
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm font-medium flex items-center gap-2 border border-emerald-100">
              <ShieldCheck size={18} /> {keySuccessMsg}
            </div>
          )}
          {keyResetStep === 1 ? (
            <>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Current Client Key</h4>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={currentClientKey} 
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono text-slate-600 focus:outline-none"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(currentClientKey);
                      setKeySuccessMsg("Key copied to clipboard!");
                      setTimeout(() => setKeySuccessMsg(""), 3000);
                    }}
                    className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors shrink-0"
                    title="Copy Key"
                  >
                    <Copy size={18} />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-3">This key is used to symmetrically encrypt all API responses for this client's store.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => {
                    setKeyModalOpen(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors text-sm"
                >
                  Close
                </button>
                <button 
                  onClick={() => setKeyResetStep(2)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                >
                  <AlertTriangle size={16} /> Reset Key
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-bold text-red-800 text-sm">Danger: Breaking Change</h4>
                    <p className="text-xs text-red-700 mt-1">
                      Resetting the encryption key will immediately invalidate all current frontend API calls for this client. You MUST update the client's <code className="bg-red-100 px-1 py-0.5 rounded">.env.local</code> file and redeploy their frontend for their store to work again.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type <strong className="text-slate-900">{keyModalOpen?.shopName || keyModalOpen?.name}</strong> to confirm
                </label>
                <input 
                  type="text" 
                  value={keyConfirmInput}
                  onChange={(e) => setKeyConfirmInput(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  placeholder="Enter shop name..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setKeyResetStep(1)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  disabled={keyConfirmInput !== (keyModalOpen?.shopName || keyModalOpen?.name)}
                  onClick={async () => {
                    try {
                      const res = await adminService.resetEncryptionKey(keyModalOpen.id);
                      if (res.data.success) {
                        setCurrentClientKey(res.data.data.encryptionKey);
                        setKeyResetStep(1);
                        setKeySuccessMsg("New Encryption Key Generated! Please copy and update the client's env file.");
                        fetchUsers();
                      }
                    } catch (err: any) {
                      alert("Failed to reset key: " + (err.response?.data?.message || err.message));
                    }
                  }}
                 
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
> 
                  Confirm & Reset Key
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Store API Key Management Modal */}
      <Modal 
        isOpen={!!storeKeyModalOpen} 
        onClose={() => {
          setStoreKeyModalOpen(null);
          setStoreKeyResetStep(1);
          setStoreKeySuccessMsg("");
        }} 
        title={`Store API Key - ${storeKeyModalOpen?.shopName || storeKeyModalOpen?.name}`}
      >
        <div className="space-y-6">
          {storeKeySuccessMsg && (
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm font-medium flex items-center gap-2 border border-emerald-100">
              <ShieldCheck size={18} /> {storeKeySuccessMsg}
            </div>
          )}
          {storeKeyResetStep === 1 ? (
            <>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Current Store API Key</h4>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={currentStoreKey} 
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono text-slate-600 focus:outline-none"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(currentStoreKey);
                      setStoreKeySuccessMsg("Key copied to clipboard!");
                      setTimeout(() => setStoreKeySuccessMsg(""), 3000);
                    }}
                    className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors shrink-0"
                    title="Copy Key"
                  >
                    <Copy size={18} />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-3">This UUID identifies the storefront. It must match <code>NEXT_PUBLIC_STORE_KEY</code> in the storefront <code>.env.local</code>.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => {
                    setStoreKeyModalOpen(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors text-sm"
                >
                  Close
                </button>
                <button 
                  onClick={() => setStoreKeyResetStep(2)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                >
                  <AlertTriangle size={16} /> Reset API Key
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-semibold text-red-900 text-sm">Danger: Storefront Breakage</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Resetting the Store API Key will immediately break the client's storefront! 
                      You must update the client's <code className="bg-red-100 px-1 rounded">.env.local</code> file and redeploy for it to work again.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="label">Type the client name <strong>{storeKeyModalOpen?.shopName || storeKeyModalOpen?.name}</strong> to confirm</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Client Name"
                  value={storeKeyConfirmInput}
                  onChange={(e) => setStoreKeyConfirmInput(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setStoreKeyResetStep(1)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  disabled={storeKeyConfirmInput !== (storeKeyModalOpen?.shopName || storeKeyModalOpen?.name)}
                  onClick={async () => {
                    try {
                      const res = await adminService.resetStoreKey(storeKeyModalOpen.id);
                      if (res.data.success) {
                        setCurrentStoreKey(res.data.data.storeKey);
                        setStoreKeyResetStep(1);
                        setStoreKeySuccessMsg("New Store API Key Generated! Please update the client's env file.");
                        fetchUsers(); // Refresh the list
                      }
                    } catch (err: any) {
                      alert("Failed to reset key: " + (err.response?.data?.message || err.message));
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm & Reset Key
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        isOpen={!!pwdModalOpen}
        onClose={() => {
          setPwdModalOpen(null);
          setPwdNewInput("");
          setPwdConfirmInput("");
        }}
        title={`Reset Password - ${pwdModalOpen?.name}`}
      >
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-red-900 text-sm">Reset Client Password</h4>
                <p className="text-sm text-red-700 mt-1">
                  You are about to force-reset the password for this client. They will be logged out of their current sessions and must use the new password.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              className="input"
              placeholder="Enter new password (min 6 chars)"
              value={pwdNewInput}
              onChange={(e) => setPwdNewInput(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Confirm New Password</label>
            <input
              type="password"
              className="input"
              placeholder="Re-enter new password"
              value={pwdConfirmInput}
              onChange={(e) => setPwdConfirmInput(e.target.value)}
            />
            {pwdNewInput && pwdConfirmInput && pwdNewInput !== pwdConfirmInput && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setPwdModalOpen(null);
              }}
              disabled={pwdLoading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              disabled={!pwdNewInput || pwdNewInput.length < 6 || pwdNewInput !== pwdConfirmInput || pwdLoading}
              onClick={async () => {
                try {
                  setPwdLoading(true);
                  const res = await adminService.resetCustomerPassword(pwdModalOpen.id, pwdNewInput);
                  if (res.data.success) {
                    setToastMessage("Password reset successfully!");
                    setTimeout(() => setToastMessage(""), 3000);
                    setPwdModalOpen(null);
                  }
                } catch (err: any) {
                  alert("Failed to reset password: " + (err.response?.data?.message || err.message));
                } finally {
                  setPwdLoading(false);
                }
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {pwdLoading && <Loader2 size={16} className="animate-spin" />}
              Set New Password
            </button>
          </div>
        </div>
      </Modal>

      {/* Payments Slide-over Drawer Component */}
      <ClientPaymentsDrawer 
        isOpen={!!paymentsModalOpen}
        user={paymentsModalOpen}
        onClose={() => setPaymentsModalOpen(null)}
        onSuccess={() => {
          setToastMessage("Payment saved successfully!");
          setTimeout(() => setToastMessage(""), 3000);
          fetchUsers();
        }}
      />

      {/* Industry Level Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-[9999] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
