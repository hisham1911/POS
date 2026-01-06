export interface Product {
  id: number;
  name: string;
  nameEn?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost?: number;
  imageUrl?: string;
  isActive: boolean;
  categoryId: number;
  categoryName?: string;
  trackInventory: boolean;
  stockQuantity?: number;
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
  imageUrl?: string;
  categoryId: number;
  trackInventory?: boolean;
  stockQuantity?: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}
