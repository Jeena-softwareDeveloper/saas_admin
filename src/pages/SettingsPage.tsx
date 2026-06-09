"use client";

import { useState, useEffect, useRef } from "react";
import {
  Save, Store, CreditCard, Truck, Mail, Bell, Loader2,
  Palette, UploadCloud, Check, RefreshCw,
} from "lucide-react";
import { adminService } from "@/services/admin.service";
import { useSiteConfig } from "@/lib/siteConfig";
import { SetAdminHeader } from "@/lib/adminHeaderContext";

const tabs = [
  { id: "general", label: "General", icon: Store },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "email", label: "Email", icon: Mail },
];

const PRESET_COLORS = [
  "#e11955", "#D80032", "#7c3aed", "#2563eb",
  "#0891b2", "#059669", "#d97706", "#dc2626",
  "#0f172a", "#6366f1",
];

const PRESET_FOOTER_COLORS = [
  "#0f172a", "#1e293b", "#020617", "#111827",
  "#18181b", "#171717", "#052e16", "#064e3b",
  "#1e1b4b", "#000000"
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Branding state
  const { config: siteConfig, setConfig: setSiteConfig } = useSiteConfig();
  const [pickedColor, setPickedColor] = useState(siteConfig.primaryColor);
  const [pickedFooterColor, setPickedFooterColor] = useState(siteConfig.footerColor || "#0f172a");
  const [logoPreview, setLogoPreview] = useState<string | null>(siteConfig.logoUrl);
  const [storeName, setStoreName] = useState(siteConfig.storeName);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await adminService.getConfig();
        const data = res.data.data;
        setConfig(data);
        if (data?.storeName) setStoreName(data.storeName);
        if (data?.PRIMARY_COLOR) setPickedColor(data.PRIMARY_COLOR);
        if (data?.FOOTER_COLOR) setPickedFooterColor(data.FOOTER_COLOR);
      } catch {}
      finally { setLoading(false); }
    };
    fetchConfig();
  }, []);

  // Live color preview
  useEffect(() => {
    document.documentElement.style.setProperty("--color-brand-600", pickedColor);
    document.documentElement.style.setProperty("--color-brand-500", pickedColor);
  }, [pickedColor]);

  useEffect(() => {
    document.documentElement.style.setProperty("--color-footer-bg", pickedFooterColor);
  }, [pickedFooterColor]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const payload = Object.fromEntries(formData.entries());
    if (payload.freeShippingThreshold) payload.freeShippingThreshold = Number(payload.freeShippingThreshold) as any;
    if (payload.shippingCost) payload.shippingCost = Number(payload.shippingCost) as any;
    if (payload.taxRate) payload.taxRate = Number(payload.taxRate) as any;
    try {
      const res = await adminService.updateConfig(payload);
      setConfig(res.data.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save settings");
    } finally { setSaving(false); }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    // Optionally upload to server
    const formData = new FormData();
    formData.append("logo", file);
    setUploadingLogo(true);
    adminService.updateConfig({ logoDataUrl: url }) // store locally for now
      .catch(() => {})
      .finally(() => setUploadingLogo(false));
  };

  const handleSaveBranding = async () => {
    setSiteConfig({
      primaryColor: pickedColor,
      footerColor: pickedFooterColor,
      logoUrl: logoPreview,
      storeName,
    });

    try {
      await adminService.updateConfig({
        PRIMARY_COLOR: pickedColor,
        FOOTER_COLOR: pickedFooterColor,
        storeName: storeName
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert("Failed to save branding settings");
    }
  };

  const handleResetColor = () => {
    setPickedColor("#e11955");
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600 w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <SetAdminHeader title="Settings" subtitle="Configure your store settings and branding" />

      {/* Tab bar */}
      <div className="flex gap-1 card p-1 overflow-x-auto no-scrollbar">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0
              ${activeTab === id
                ? "text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
              }`}
            style={activeTab === id ? { backgroundColor: pickedColor } : undefined}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── General ── */}
      {activeTab === "general" && (
        <div className="card p-6">
          <form className="space-y-5" onSubmit={handleSave}>
            <h2 className="text-base font-semibold text-slate-900">General Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Store Name</label>
                <input name="storeName" className="input" defaultValue={config?.storeName} required />
              </div>
              <div>
                <label className="label">Store Email</label>
                <input name="storeEmail" className="input" type="email" defaultValue={config?.storeEmail} required />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input name="storePhone" className="input" defaultValue={config?.storePhone} />
              </div>
              <div>
                <label className="label">Currency</label>
                <select name="currency" className="input" defaultValue={config?.currency}>
                  <option value="INR">INR — Indian Rupee (₹)</option>
                  <option value="USD">USD — US Dollar ($)</option>
                  <option value="EUR">EUR — Euro (€)</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Store Address</label>
                <textarea name="storeAddress" className="input min-h-[80px]" defaultValue={config?.storeAddress} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Store Description</label>
                <textarea name="storeDescription" className="input min-h-[80px]" defaultValue={config?.storeDescription} />
              </div>
              <div className="sm:col-span-2 mt-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Top Bar Settings (Storefront Header)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="label">Top Bar USP 1</label>
                    <input name="TOPBAR_USP_1" className="input" defaultValue={config?.TOPBAR_USP_1} placeholder="e.g. Free Delivery..." />
                  </div>
                  <div>
                    <label className="label">Top Bar USP 2</label>
                    <input name="TOPBAR_USP_2" className="input" defaultValue={config?.TOPBAR_USP_2} placeholder="e.g. 100% Organic..." />
                  </div>
                  <div>
                    <label className="label">Top Bar USP 3</label>
                    <input name="TOPBAR_USP_3" className="input" defaultValue={config?.TOPBAR_USP_3} placeholder="e.g. Easy Returns..." />
                  </div>
                  <div>
                    <label className="label">Top Bar Phone Number</label>
                    <input name="STORE_PHONE" className="input" defaultValue={config?.STORE_PHONE} placeholder="e.g. +91 98765..." />
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <Loader2 className="animate-spin w-4 h-4" /> : saved ? <Check size={15} /> : <Save size={15} />}
                {saved ? "Saved!" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Branding ── */}
      {activeTab === "branding" && (
        <div className="card p-6 space-y-7">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Branding</h2>
            <p className="text-sm text-slate-500 mt-0.5">Changes apply instantly across the admin panel and storefront.</p>
          </div>

          {/* Store Name */}
          <div>
            <label className="label">Store Name (shown in sidebar & navbar)</label>
            <input
              className="input max-w-sm"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. ShopNest"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="label">Store Logo</label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="w-24 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-1" />
                ) : (
                  <Store size={24} className="text-slate-300" />
                )}
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => logoRef.current?.click()}
                  className="btn-secondary text-xs py-1.5"
                  disabled={uploadingLogo}
                >
                  {uploadingLogo ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                  Upload Logo
                </button>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => setLogoPreview(null)}
                    className="block text-xs text-red-500 hover:underline"
                  >
                    Remove logo
                  </button>
                )}
                <p className="text-[11px] text-slate-400">PNG, SVG, WEBP · Recommended: 200×60px</p>
              </div>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </div>
          </div>

          {/* Primary Color */}
          <div>
            <label className="label">Primary Color</label>
            <p className="text-[11px] text-slate-400 mb-3">Used for buttons, active states, accents throughout the site</p>

            {/* Preset swatches */}
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setPickedColor(color)}
                  className="w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: pickedColor === color ? "#0f172a" : "transparent",
                    boxShadow: pickedColor === color ? "0 0 0 2px white, 0 0 0 4px " + color : "none",
                  }}
                  title={color}
                />
              ))}
              {/* Custom color picker */}
              <label className="w-8 h-8 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-slate-500 transition-colors" title="Custom color">
                <span className="text-slate-400 text-xs font-bold">+</span>
                <input
                  type="color"
                  value={pickedColor}
                  onChange={(e) => setPickedColor(e.target.value)}
                  className="absolute opacity-0 w-0 h-0"
                />
              </label>
            </div>

            {/* Current color display */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl shadow-md border border-white"
                style={{ backgroundColor: pickedColor }}
              />
              <div>
                <p className="text-sm font-bold text-slate-900 uppercase font-mono">{pickedColor}</p>
                <button
                  type="button"
                  onClick={handleResetColor}
                  className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 mt-0.5"
                >
                  <RefreshCw size={10} /> Reset to default
                </button>
              </div>
              {/* Live preview pill */}
              <button
                type="button"
                className="ml-4 px-4 py-1.5 text-white text-xs font-bold rounded-full shadow-sm transition-all"
                style={{ backgroundColor: pickedColor }}
              >
                Preview button
              </button>
            </div>
          </div>

          {/* Footer Background Color */}
          <div>
            <label className="label">Footer Background Color</label>
            <p className="text-[11px] text-slate-400 mb-3">Used for the storefront footer background color</p>

            {/* Preset swatches */}
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESET_FOOTER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setPickedFooterColor(color)}
                  className="w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: pickedFooterColor === color ? "#0f172a" : "transparent",
                    boxShadow: pickedFooterColor === color ? "0 0 0 2px white, 0 0 0 4px " + color : "none",
                  }}
                  title={color}
                />
              ))}
              {/* Custom color picker */}
              <label className="w-8 h-8 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-slate-500 transition-colors" title="Custom color">
                <span className="text-slate-400 text-xs font-bold">+</span>
                <input
                  type="color"
                  value={pickedFooterColor}
                  onChange={(e) => setPickedFooterColor(e.target.value)}
                  className="absolute opacity-0 w-0 h-0"
                />
              </label>
            </div>

            {/* Current color display */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl shadow-md border border-white"
                style={{ backgroundColor: pickedFooterColor }}
              />
              <div>
                <p className="text-sm font-bold text-slate-900 uppercase font-mono">{pickedFooterColor}</p>
                <button
                  type="button"
                  onClick={() => setPickedFooterColor("#0f172a")}
                  className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 mt-0.5"
                >
                  <RefreshCw size={10} /> Reset to default
                </button>
              </div>
              {/* Live preview block */}
              <div
                className="ml-4 px-4 py-1.5 text-slate-300 text-xs font-bold rounded-lg shadow-sm transition-all border border-white/10"
                style={{ backgroundColor: pickedFooterColor }}
              >
                Footer Preview
              </div>
            </div>
          </div>

          {/* Save branding */}
          <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveBranding}
              className="btn-primary"
            >
              {saved ? <Check size={15} /> : <Save size={15} />}
              {saved ? "Saved!" : "Apply & Save Branding"}
            </button>
            <p className="text-xs text-slate-400">Changes are saved locally and persist across sessions.</p>
          </div>
        </div>
      )}

      {/* ── Payment ── */}
      {activeTab === "payment" && (
        <div className="card p-6">
          <form className="space-y-5" onSubmit={handleSave}>
            <h2 className="text-base font-semibold text-slate-900">Payment Settings</h2>
            <div className="space-y-4">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-indigo-600" />
                    <span className="font-semibold text-slate-900">Stripe</span>
                  </div>
                  <span className="badge-green">Connected</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Publishable Key</label>
                    <input name="stripePublishableKey" className="input font-mono text-xs" defaultValue={config?.stripePublishableKey} />
                  </div>
                  <div>
                    <label className="label">Secret Key</label>
                    <input name="stripeSecretKey" className="input font-mono text-xs" type="password" defaultValue={config?.stripeSecretKey} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Webhook Secret</label>
                    <input name="stripeWebhookSecret" className="input font-mono text-xs" type="password" defaultValue={config?.stripeWebhookSecret} />
                  </div>
                </div>
              </div>
              <div>
                <label className="label">Free Shipping Threshold (₹)</label>
                <input name="freeShippingThreshold" type="number" className="input" defaultValue={config?.freeShippingThreshold} min={0} />
              </div>
              <div>
                <label className="label">Standard Shipping Cost (₹)</label>
                <input name="shippingCost" type="number" className="input" defaultValue={config?.shippingCost} min={0} />
              </div>
              <div>
                <label className="label">GST Rate (%)</label>
                <input name="taxRate" type="number" className="input" defaultValue={config?.taxRate} min={0} step={0.01} />
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={15} />} Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Coming Soon tabs ── */}
      {(activeTab === "shipping" || activeTab === "email") && (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            {activeTab === "shipping" && <Truck size={22} className="text-slate-400" />}
            {activeTab === "email" && <Mail size={22} className="text-slate-400" />}
          </div>
          <h3 className="text-sm font-bold text-slate-900 capitalize">{activeTab} Settings</h3>
          <p className="text-xs text-slate-400 mt-1">Coming soon.</p>
        </div>
      )}
    </div>
  );
}
