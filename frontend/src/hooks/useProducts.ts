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

  const products = productsData?.data || [];

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

  const categories = categoriesData?.data || [];

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
