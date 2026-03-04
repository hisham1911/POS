// نوع المنتج: مادي أو خدمة
export enum ProductType {
  Physical = 1, // منتج مادي - يتتبع المخزون
  Service = 2,  // خدمة - لا يتتبع المخزون
}

export interface Product {
  id: number;
  name: string;
  nameEn?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost?: number;
  taxRate?: number;
  taxInclusive: boolean;
  imageUrl?: string;
  isActive: boolean;
  categoryId: number;
  categoryName?: string;
  // نوع المنتج (مادي أو خدمة)
  type: ProductType;
  // يتم تحديده تلقائياً بناءً على النوع
  trackInventory: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  reorderPoint?: number;
  lastStockUpdate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  nameEn?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost?: number;
  taxRate?: number;
  taxInclusive?: boolean;
  imageUrl?: string;
  categoryId: number;
  // نوع المنتج (مادي أو خدمة) - بدلاً من trackInventory
  type?: ProductType;
  stockQuantity?: number;
  lowStockThreshold?: number;
  reorderPoint?: number;
  branchStockQuantities?: Record<number, number>;
}

export interface UpdateProductRequest {
  name: string;
  nameEn?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost?: number;
  taxRate?: number;
  taxInclusive?: boolean;
  imageUrl?: string;
  categoryId: number;
  // نوع المنتج (مادي أو خدمة) - بدلاً من trackInventory
  type?: ProductType;
  stockQuantity?: number;
  lowStockThreshold?: number;
  reorderPoint?: number;
  isActive: boolean;
}

export interface ProductsQueryParams {
  categoryId?: number;
  search?: string;
  isActive?: boolean;
  lowStock?: boolean;
}

export interface QuickCreateProductRequest {
  name: string;
  price: number;
  categoryId: number;
  // نوع المنتج - افتراضياً خدمة للإنشاء السريع
  type?: ProductType;
  initialStock?: number;
  sku?: string;
  barcode?: string;
}
