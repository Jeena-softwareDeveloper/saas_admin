import api from "@/lib/api";

export const adminService = {
  getStats: async () => api.get("/admin/dashboard/stats"),
  getSalesChart: async () => api.get("/admin/dashboard/sales-chart"),
  getRecentOrders: async () => api.get("/admin/dashboard/recent-orders"),

  getCustomers: async () => api.get("/admin/customers?limit=100"),
  getCustomer: async (id: string) => api.get(`/admin/customers/${id}`),
  createCustomer: async (data: any) => api.post("/admin/customers", data),
  updateCustomerStatus: async (id: string, data: any) => api.patch(`/admin/customers/${id}/status`, data),
  deleteCustomer: async (id: string) => api.delete(`/admin/customers/${id}`),
  resetEncryptionKey: async (id: string) => api.post(`/admin/customers/${id}/encryption-key`),
  resetStoreKey: async (id: string) => api.post(`/admin/customers/${id}/store-key`),
  resetCustomerPassword: async (id: string, newPassword: string) => api.patch(`/admin/customers/${id}/password`, { newPassword }),
  getClientPayments: async (id: string) => api.get(`/admin/customers/${id}/payments`),
  addClientPayment: async (id: string, data: any) => api.post(`/admin/customers/${id}/payments`, data),
  deleteClientPayment: async (id: string, paymentId: string) => api.delete(`/admin/customers/${id}/payments/${paymentId}`),

  getConfig: async () => api.get("/admin/config"),
  updateConfig: async (data: any) => api.put("/admin/config", data),

  getReviews: async () => api.get("/admin/reviews"),
  createReview: async (data: any) => api.post("/admin/reviews", data),
  approveReview: async (id: string, isApproved: boolean) => api.patch(`/admin/reviews/${id}/approve`, { isApproved }),
  deleteReview: async (id: string) => api.delete(`/admin/reviews/${id}`),

  getProducts: async () => api.get("/admin/products"),
  generateSku: async () => api.get("/admin/products/generate-sku"),
  getProduct: async (id: string) => api.get(`/admin/products/${id}`),
  createProduct: async (data: any, config?: any) => api.post("/admin/products", data, config),
  updateProduct: async (id: string, data: any, config?: any) => api.put(`/admin/products/${id}`, data, config),
  deleteProduct: async (id: string) => api.delete(`/admin/products/${id}`),
  publishProduct: async (id: string) => api.patch(`/admin/products/${id}/publish`),
  addProductVariant: async (id: string, data: any) => api.post(`/admin/products/${id}/variants`, data),
  removeProductImage: async (productId: string, imageId: string) => api.delete(`/admin/products/${productId}/images/${imageId}`),

  getOrders: async () => api.get("/admin/orders"),
  updateOrderStatus: async (id: string, status: string) => api.patch(`/admin/orders/${id}/status`, { status }),

  getInventory: async () => api.get("/admin/inventory"),
  updateInventory: async (id: string, stockQuantity: number) => api.patch(`/admin/inventory/${id}`, { stockQuantity }),

  getCoupons: async () => api.get("/admin/coupons"),
  createCoupon: async (data: any) => api.post("/admin/coupons", data),
  updateCoupon: async (id: string, data: any) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: async (id: string) => api.delete(`/admin/coupons/${id}`),

  getCategories: async () => api.get("/admin/categories"),
  createCategory: async (data: any) => api.post("/admin/categories", data),
  updateCategory: async (id: string, data: any) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: async (id: string) => api.delete(`/admin/categories/${id}`),
  toggleCategory: async (id: string) => api.patch(`/admin/categories/${id}/toggle`),

  getBanners: async () => api.get("/admin/banners"),
  createBanner: async (formData: FormData) => api.post("/admin/banners", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  updateBanner: async (id: string, formData: FormData) => api.put(`/admin/banners/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  deleteBanner: async (id: string) => api.delete(`/admin/banners/${id}`),
  toggleBanner: async (id: string) => api.patch(`/admin/banners/${id}/toggle`),

  getBlogs: async () => api.get("/admin/blogs"),
  createBlog: async (data: any) => api.post("/admin/blogs", data),
  updateBlog: async (id: string, data: any) => api.put(`/admin/blogs/${id}`, data),
  deleteBlog: async (id: string) => api.delete(`/admin/blogs/${id}`),

  getCertifications: async () => api.get("/admin/certifications"),
  createCertification: async (formData: FormData) => api.post("/admin/certifications", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  updateCertification: async (id: string, formData: FormData) => api.put(`/admin/certifications/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  deleteCertification: async (id: string) => api.delete(`/admin/certifications/${id}`),
  toggleCertification: async (id: string) => api.patch(`/admin/certifications/${id}/toggle`),

  getSupportTickets: async () => api.get("/admin/support"),
  updateSupportTicketStatus: async (id: string, status: string) => api.put(`/admin/support/${id}/status`, { status }),

  getMenus: async () => api.get("/admin/menus"),
  createMenu: async (data: any) => api.post("/admin/menus", data),
  updateMenu: async (id: string, data: any) => api.put(`/admin/menus/${id}`, data),
  deleteMenu: async (id: string) => api.delete(`/admin/menus/${id}`),
  toggleMenu: async (id: string) => api.patch(`/admin/menus/${id}/toggle`),

  getLogs: async (params?: any) => api.get("/admin/logs", { params }),
  getActiveLogs: async (params?: any) => api.get("/admin/logs/active", { params }),
  trackActivity: async (data: any) => api.post("/admin/logs/track", data),
};


