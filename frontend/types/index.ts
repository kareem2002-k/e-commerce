import { z } from "zod";

export type Category = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  parentId: string | null;
  parent?: Category | null;
  children?: Category[];
  productsCount?: number;
};

export type ProductImage = {
  id?: string;
  url: string;
  altText: string;
  file?: File;
  isNew?: boolean;
};

// Product type based on backend schema
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  lowStockThreshold: number;
  featured: boolean;
  discount: number | null;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  images: {
    id: string;
    url: string;
    altText: string;
  }[];
  reviews?: {
    id: string;
    rating: number;
    comment: string;
    userId: string;
    user: {
      id: string;
      name: string;
    };
  }[];
  rating?: number; // Overall product rating
  brand?: string; // Product brand name
  createdAt?: string; // When the product was created
  isNew?: boolean; // Whether this is a new product
  isSale?: boolean; // Whether this product is on sale
  tags?: string[]; // Product tags
  features?: string[]; // Product features
  weight?: number; // Product weight (in kg or lbs)
  weightUnit?: string; // Weight unit (kg or lbs)
  dimensions?: string; // Product dimensions (e.g. "10 x 20 x 30 cm")
  freeShippingThreshold?: number; // Free shipping threshold
  warrantyPeriod?: string; // Warranty period (e.g. "2-Year Warranty")
  warrantyDescription?: string; // Warranty description
  returnPeriod?: string; // Return period (e.g. "30-Day Returns")
  returnDescription?: string; // Return description
};

// Campaign type
export type Campaign = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  couponId: string;
  isActive: boolean;
  clickCount: number;
  conversionCount: number;
  startDate: string;
  endDate: string;
  position?: string;
  targetAudience?: string;
  goals?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  coupon?: {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    description?: string;
    validFrom: string;
    validUntil: string;
    usageLimit?: number;
    usedCount: number;
  };
};

// Define form schema
export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;


// Define form schema
export const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

interface OrderUser {
  id: string;
  name: string;
  email: string;
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: Array<{
      id: string;
      url: string;
      altText: string;
    }>;
  };
}

interface Address {
  id: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  user: OrderUser;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  shippingCost: number;
  taxAmount: number;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
}