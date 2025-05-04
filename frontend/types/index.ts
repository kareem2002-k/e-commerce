import { z } from "zod";

export type Category = {
  id: string;
  name: string;
  description: string | null;
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
  };
  

// Define form schema
export const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
  });
  
  export type LoginFormValues = z.infer<typeof loginSchema>;