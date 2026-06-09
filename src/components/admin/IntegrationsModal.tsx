import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Loader2, Key, Save, Server, Shield, Mail, Truck, CreditCard } from "lucide-react";
import api from "../../lib/api";

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  shopName: string;
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({ isOpen, onClose, userId, shopName }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState<any>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isOpen && userId) {
      fetchIntegrations();
    }
  }, [isOpen, userId]);

  const fetchIntegrations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/admin/customers/${userId}/integrations`);
      setConfigs(res.data.data || {});
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load integrations");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setConfigs({ ...configs, [key]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.put(`/admin/customers/${userId}/integrations`, configs);
      setSuccess("Integration keys saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save integrations");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`API Integrations - ${shopName}`} size="xl">
      {loading ? (
        <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          {success && <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cloudinary */}
            <div className="card p-4 space-y-4 border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                <Server size={18} className="text-indigo-600" /> Cloudinary Settings
              </h4>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Cloud Name</label>
                <input
                  type="text"
                  value={configs.CLOUDINARY_CLOUD_NAME || ""}
                  onChange={(e) => handleChange("CLOUDINARY_CLOUD_NAME", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. dfxk4..."
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">API Key</label>
                <input
                  type="text"
                  value={configs.CLOUDINARY_API_KEY || ""}
                  onChange={(e) => handleChange("CLOUDINARY_API_KEY", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">API Secret</label>
                <input
                  type="password"
                  value={configs.CLOUDINARY_API_SECRET || ""}
                  onChange={(e) => handleChange("CLOUDINARY_API_SECRET", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Payment Gateways */}
            <div className="card p-4 space-y-4 border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                <CreditCard size={18} className="text-emerald-600" /> Razorpay
              </h4>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Key ID</label>
                <input
                  type="text"
                  value={configs.RAZORPAY_KEY_ID || ""}
                  onChange={(e) => handleChange("RAZORPAY_KEY_ID", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Key Secret</label>
                <input
                  type="password"
                  value={configs.RAZORPAY_KEY_SECRET || ""}
                  onChange={(e) => handleChange("RAZORPAY_KEY_SECRET", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Shiprocket */}
            <div className="card p-4 space-y-4 border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                <Truck size={18} className="text-amber-600" /> Shiprocket
              </h4>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Email</label>
                <input
                  type="email"
                  value={configs.SHIPROCKET_EMAIL || ""}
                  onChange={(e) => handleChange("SHIPROCKET_EMAIL", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Password</label>
                <input
                  type="password"
                  value={configs.SHIPROCKET_PASSWORD || ""}
                  onChange={(e) => handleChange("SHIPROCKET_PASSWORD", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Mail & Backup */}
            <div className="card p-4 space-y-4 border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                <Mail size={18} className="text-blue-600" /> Emails & Backups
              </h4>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">SMTP Email</label>
                <input
                  type="email"
                  value={configs.SMTP_USER || ""}
                  onChange={(e) => handleChange("SMTP_USER", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="For sending emails"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">SMTP Password</label>
                <input
                  type="password"
                  value={configs.SMTP_PASS || ""}
                  onChange={(e) => handleChange("SMTP_PASS", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Backup Drive Email</label>
                <input
                  type="email"
                  value={configs.BACKUP_DRIVE_EMAIL || ""}
                  onChange={(e) => handleChange("BACKUP_DRIVE_EMAIL", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 mr-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Integrations
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
