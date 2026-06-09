export type Role = "SUPER_ADMIN" | "ADMIN" | "CUSTOMER" | "GUEST";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  shopName?: string;
  tenantSlug?: string;
  tenantId?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  category: Pick<Category, "id" | "name" | "slug">;
  tags: string[];
  weight?: number;
  avgRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  user: Pick<User, "id" | "name" | "avatar">;
  productId: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Pick<Product, "id" | "name" | "price" | "images" | "stock" | "slug">;
  quantity: number;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isDefault: boolean;
}

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderItem {
  id: string;
  productId: string;
  product: Pick<Product, "id" | "name" | "images" | "slug">;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  user: Pick<User, "id" | "name" | "email">;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  address: Address;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
