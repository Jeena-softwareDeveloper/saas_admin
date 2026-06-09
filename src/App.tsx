import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayoutRoot from '@/components/admin/AdminLayout'
import DashboardPage from '@/pages/DashboardPage'
import ProductsPage from '@/pages/ProductsPage'
import CategoriesPage from '@/pages/CategoriesPage'
import BannersPage from '@/pages/BannersPage'
import BlogsPage from '@/pages/BlogsPage'
import CertificationsPage from '@/pages/CertificationsPage'
import OrdersPage from '@/pages/OrdersPage'
import UsersPage from '@/pages/UsersPage'
import ReviewsPage from '@/pages/ReviewsPage'
import CouponsPage from '@/pages/CouponsPage'
import NotificationsPage from '@/pages/NotificationsPage'
import SupportPage from '@/pages/SupportPage'
import MenusPage from '@/pages/MenusPage'
import SettingsPage from '@/pages/SettingsPage'
import ClientStorefrontPage from '@/pages/ClientStorefrontPage'
import LogsPage from '@/pages/LogsPage'
import { useAuthStore } from '@/lib/authStore'
import { useState } from 'react'
import api from '@/lib/api'

function LoginPage() {
  const { login } = useAuthStore();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/admin/login", { email, password });
      const { user, accessToken, refreshToken } = res.data.data;
      login(user, accessToken, refreshToken);
      window.location.href = "/admin";
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="card p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" required />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

import RouteTracker from '@/components/RouteTracker'

function App() {
  return (
    <Router>
      <RouteTracker />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/admin" element={<AdminLayoutRoot><DashboardPage /></AdminLayoutRoot>} />
        <Route path="/admin/products" element={<AdminLayoutRoot><ProductsPage /></AdminLayoutRoot>} />
        <Route path="/admin/categories" element={<AdminLayoutRoot><CategoriesPage /></AdminLayoutRoot>} />
        <Route path="/admin/banners" element={<AdminLayoutRoot><BannersPage /></AdminLayoutRoot>} />
        <Route path="/admin/blogs" element={<AdminLayoutRoot><BlogsPage /></AdminLayoutRoot>} />
        <Route path="/admin/certifications" element={<AdminLayoutRoot><CertificationsPage /></AdminLayoutRoot>} />
        <Route path="/admin/orders" element={<AdminLayoutRoot><OrdersPage /></AdminLayoutRoot>} />
        <Route path="/admin/users" element={<AdminLayoutRoot><UsersPage /></AdminLayoutRoot>} />
        <Route path="/admin/reviews" element={<AdminLayoutRoot><ReviewsPage /></AdminLayoutRoot>} />
        <Route path="/admin/coupons" element={<AdminLayoutRoot><CouponsPage /></AdminLayoutRoot>} />
        <Route path="/admin/support" element={<AdminLayoutRoot><SupportPage /></AdminLayoutRoot>} />
        <Route path="/admin/notifications" element={<AdminLayoutRoot><NotificationsPage /></AdminLayoutRoot>} />
        <Route path="/admin/menus" element={<AdminLayoutRoot><MenusPage /></AdminLayoutRoot>} />
        <Route path="/admin/settings" element={<AdminLayoutRoot><SettingsPage /></AdminLayoutRoot>} />
        <Route path="/admin/logs" element={<AdminLayoutRoot><LogsPage /></AdminLayoutRoot>} />
        {/* Full-screen storefront editor — no sidebar */}
        <Route path="/admin/clients/:clientId/storefront" element={<ClientStorefrontPage />} />
        
        {/* Redirect root to admin */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  )
}

export default App
