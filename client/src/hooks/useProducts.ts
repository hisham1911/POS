import { useMemo } from "react";
import { Product } from "../types/product.types";
import { Category } from "../types/category.types";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "../api/productsApi";
import { useGetCategoriesQuery } from "../api/categoriesApi";
import { CreateProductRequest, UpdateProductRequest } from "../types/product.types";
import { toast } from "sonner";

// Mock data for development fallback
const mockCategories: Category[] = [
  { id: 1, name: "المشروبات", nameEn: "Beverages", sortOrder: 1, isActive: true, productsCount: 8 },
  { id: 2, name: "الوجبات السريعة", nameEn: "Fast Food", sortOrder: 2, isActive: true, productsCount: 6 },
  { id: 3, name: "الحلويات", nameEn: "Desserts", sortOrder: 3, isActive: true, productsCount: 5 },
  { id: 4, name: "المقبلات", nameEn: "Appetizers", sortOrder: 4, isActive: true, productsCount: 4 },
];

const mockProducts: Product[] = [
  { id: 1, name: "قهوة أمريكية", price: 15, categoryId: 1, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 2, name: "لاتيه", price: 18, categoryId: 1, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 3, name: "كابتشينو", price: 17, categoryId: 1, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 4, name: "موكا", price: 20, categoryId: 1, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 5, name: "شاي أخضر", price: 12, categoryId: 1, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 6, name: "عصير برتقال", price: 14, categoryId: 1, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 7, name: "سموذي فراولة", price: 22, categoryId: 1, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 8, name: "ماء معدني", price: 5, categoryId: 1, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 9, name: "برجر كلاسيك", price: 35, categoryId: 2, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 10, name: "برجر دجاج", price: 32, categoryId: 2, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 11, name: "بيتزا مارغريتا", price: 45, categoryId: 2, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 12, name: "شاورما لحم", price: 28, categoryId: 2, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 13, name: "فرايز كبير", price: 15, categoryId: 2, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 14, name: "ناجتس دجاج", price: 25, categoryId: 2, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 15, name: "كيكة شوكولاتة", price: 25, categoryId: 3, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 16, name: "تشيز كيك", price: 28, categoryId: 3, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 17, name: "آيس كريم", price: 15, categoryId: 3, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 18, name: "كريم كراميل", price: 18, categoryId: 3, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 19, name: "براوني", price: 20, categoryId: 3, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 20, name: "سلطة سيزر", price: 22, categoryId: 4, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 21, name: "حمص", price: 12, categoryId: 4, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 22, name: "متبل", price: 12, categoryId: 4, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
  { id: 23, name: "فتوش", price: 18, categoryId: 4, isActive: true, trackInventory: false, createdAt: new Date().toISOString() },
];

export const useProducts = () => {
  const {
    data: productsData,
    isLoading,
    isError,
    refetch,
  } = useGetProductsQuery();

  const [createMutation, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateMutation, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteMutation, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Use API data or fallback to mock
  const products = productsData?.data || mockProducts;

  const createProduct = async (data: CreateProductRequest) => {
    try {
      await createMutation(data).unwrap();
      toast.success("تم إضافة المنتج بنجاح");
    } catch {
      toast.error("فشل في إضافة المنتج");
    }
  };

  const updateProduct = async (id: number, data: UpdateProductRequest) => {
    try {
      await updateMutation({ id, data }).unwrap();
      toast.success("تم تحديث المنتج بنجاح");
    } catch {
      toast.error("فشل في تحديث المنتج");
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await deleteMutation(id).unwrap();
      toast.success("تم حذف المنتج بنجاح");
    } catch {
      toast.error("فشل في حذف المنتج");
    }
  };

  return {
    products,
    isLoading,
    isError,
    refetch,
    createProduct,
    updateProduct,
    deleteProduct,
    isCreating,
    isUpdating,
    isDeleting,
  };
};

export const useCategories = () => {
  const { data: categoriesData, isLoading, isError } = useGetCategoriesQuery();

  // Use API data or fallback to mock
  const categories = categoriesData?.data || mockCategories;

  return {
    categories,
    isLoading,
    isError,
  };
};

export const useFilteredProducts = (categoryId: number | null) => {
  const { products, isLoading, isError } = useProducts();
  
  const filteredProducts = useMemo(() => {
    if (!categoryId) return products;
    return products.filter(p => p.categoryId === categoryId);
  }, [products, categoryId]);

  return {
    products: filteredProducts,
    isLoading,
    isError,
  };
};
