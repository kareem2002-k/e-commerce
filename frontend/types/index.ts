// Product types
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  lowStockThreshold: number;
  categoryId: string;
  category?: Category;
  images: ProductImage[];
  createdAt?: string;
  updatedAt?: string;
};

export type ProductFormData = {
  name: string;
  description: string;
  sku: string;
  price: string;
  stock: string;
  lowStockThreshold: string;
  categoryId: string;
  images?: string;
};

export type ProductFormErrors = Partial<Record<keyof ProductFormData, string>>;

// Category types
export type Category = {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  parent?: Category | null;
  children?: Category[];
  productsCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CategoryFormData = {
  name: string;
  description: string;
  parentId: string;
};

export type CategoryFormErrors = Partial<Record<keyof CategoryFormData, string>>;

// Image types
export type ProductImage = {
  id?: string;
  url: string;
  altText: string;
  file?: File;
  isNew?: boolean;
  productId?: string;
};

// API response types
export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  isSuccess: boolean;
};

export type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  cache?: RequestCache;
};

export type ValidationError = {
  field: string;
  message: string;
};

// Auth types
export type User = {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthFormData = {
  email: string;
  password: string;
  name?: string;
};

export type AuthFormErrors = Partial<Record<keyof AuthFormData, string>>;

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = LoginCredentials & {
  name: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

// Other common types
export type PaginationParams = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

export type SortParams = {
  field: string;
  direction: 'asc' | 'desc';
};

// App state types
export type FilterOptions = {
  search?: string;
  category?: string;
  sort?: SortParams;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
};

// Dashboard types
export type DashboardStats = {
  totalProducts: number;
  lowStockProducts: number;
  totalValue: number;
  totalCategories: number;
  totalOrders?: number;
  recentOrders?: Order[];
  salesByDay?: { date: string; amount: number }[];
  topSellingProducts?: { product: Product; totalSold: number }[];
};

// Order types
export type Order = {
  id: string;
  userId: string;
  user?: User;
  orderDate: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
};

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type PaymentMethod = 'credit_card' | 'paypal' | 'stripe';

export type Address = {
  id?: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
  userId?: string;
};

// Cart types
export type CartItem = {
  productId: string;
  product: Product;
  quantity: number;
};

export type Cart = {
  items: CartItem[];
  total: number;
  itemCount: number;
};

// Component prop types
export type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  pagination?: PaginationParams;
  onPaginationChange?: (pagination: PaginationParams) => void;
};

export type ColumnDef<T> = {
  header: string;
  accessorKey: keyof T | string;
  cell?: (info: { row: T }) => React.ReactNode;
  enableSorting?: boolean;
};

// Error handling types
export type ApiError = {
  status: number;
  message: string;
  errors?: ValidationError[];
};

// Settings and preferences
export type UserPreferences = {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    orderUpdates: boolean;
    marketing: boolean;
  };
};

// Search types
export type SearchResult = {
  products: Product[];
  categories: Category[];
}; 