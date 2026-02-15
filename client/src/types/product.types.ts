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
  trackInventory?: boolean;
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
  trackInventory?: boolean;
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
