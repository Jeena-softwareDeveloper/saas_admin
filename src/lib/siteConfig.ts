import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./authStore";
import { decrypt } from "./crypto";

interface SiteConfig {
  storeName: string;
  logoUrl: string | null;
  primaryColor: string;
  footerColor: string;
  storePhone: string;
  usp1: string;
  usp2: string;
  usp3: string;
}

interface SiteConfigStore {
  config: SiteConfig;
  setConfig: (c: Partial<SiteConfig>) => void;
  applyTheme: () => void;
  fetchConfig: () => Promise<void>;
}

const DEFAULT: SiteConfig = {
  storeName: "",
  logoUrl: null,
  primaryColor: "#e11955",
  footerColor: "#0f172a",
  storePhone: "+91 98765 43210",
  usp1: "Free Delivery on orders above ₹499",
  usp2: "100% Natural & Chemical Free",
  usp3: "Secure Payment | 14 Days Easy Returns",
};

export const useSiteConfig = create<SiteConfigStore>()(
  persist(
    (set, get) => ({
      config: DEFAULT,
      setConfig: (c) => {
        set((s) => ({ config: { ...s.config, ...c } }));
        get().applyTheme();
      },
      applyTheme: () => {
        const { primaryColor, footerColor } = get().config;
        if (typeof document !== "undefined") {
          document.documentElement.style.setProperty("--color-brand-600", primaryColor);
          document.documentElement.style.setProperty("--color-brand-500", primaryColor);
          document.documentElement.style.setProperty("--color-brand-700", shadeColor(primaryColor, -20));
          document.documentElement.style.setProperty("--color-footer-bg", footerColor || "#0f172a");
        }
      },
      fetchConfig: async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          const headers: any = {};

          const authUser = useAuthStore.getState().user;
          if (authUser?.role === 'SUPER_ADMIN') {
            set((s) => ({
              config: {
                ...s.config,
                storeName: 'Platform Admin',
              }
            }));
            get().applyTheme();
            return;
          }

          if (authUser?.tenantSlug) {
            headers["x-tenant-slug"] = authUser.tenantSlug;
          }

          const res = await fetch(`${apiUrl}/store/theme`, {
            method: "GET",
            cache: "no-store",
            headers,
          });
          if (res.ok) {
            const text = await res.text();
            let json;
            try {
              const decrypted = decrypt(text);
              json = JSON.parse(decrypted);
            } catch (err) {
              json = JSON.parse(text);
            }
            const data = json.data;
            if (data) {
              set((s) => ({
                config: {
                  ...s.config,
                  storeName: data.storeName || s.config.storeName,
                  logoUrl: data.logoUrl !== undefined ? data.logoUrl : s.config.logoUrl,
                  primaryColor: data.primaryColor || s.config.primaryColor,
                  footerColor: data.footerColor || s.config.footerColor,
                  storePhone: data.storePhone || s.config.storePhone,
                  usp1: data.usp1 || s.config.usp1,
                  usp2: data.usp2 || s.config.usp2,
                  usp3: data.usp3 || s.config.usp3,
                }
              }));
              get().applyTheme();
            }
          }
        } catch (e) {}
      }
    }),
    { name: "site-config" }
  )
);

/** Lighten or darken a hex color by percent */
function shadeColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent * 2));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent * 2));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent * 2));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
