export interface Category {
  id: number;
  name: string;
  nameEn?: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  productCount?: number; // Changed from productsCount to match backend
}
