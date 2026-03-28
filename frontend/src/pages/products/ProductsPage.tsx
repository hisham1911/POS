import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronDown,
  Edit01,
  Package,
  Plus,
  SearchLg,
  Trash01,
} from "@untitledui/icons";

import {
  useDeleteProductMutation,
  useGetProductsQuery,
} from "@/api/productsApi";
import { MetricCard } from "@/components/app/metric-card";
import { Loading } from "@/components/common/Loading";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { useCategories } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product.types";
import { formatCurrency } from "@/utils/formatters";

export const ProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { categories } = useCategories();

  // Determine if we should use server-side filtering
  // For now, always use server-side filtering for better performance
  const useServerSideFiltering = true;

  // Build query params for server-side filtering
  const queryParams = useMemo(() => {
    if (!useServerSideFiltering) return undefined;

    return {
      categoryId: selectedCategory ?? undefined,
      search: searchQuery.trim() || undefined,
      isActive: showActiveOnly ? true : undefined,
      lowStock: showLowStockOnly ? true : undefined,
    };
  }, [
    selectedCategory,
    searchQuery,
    showActiveOnly,
    showLowStockOnly,
    useServerSideFiltering,
  ]);

  const { data: productsData, isLoading } = useGetProductsQuery(queryParams);
  const [deleteMutation, { isLoading: isDeleting }] =
    useDeleteProductMutation();

  const products = productsData?.data || [];

  // Client-side filtering fallback (if server-side is disabled)
  const filteredProducts = useMemo(() => {
    if (useServerSideFiltering) return products;

    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory || product.categoryId === selectedCategory;
      const matchesActive = !showActiveOnly || product.isActive;
      const matchesLowStock =
        !showLowStockOnly ||
        (product.trackInventory &&
          (product.stockQuantity ?? 0) < (product.lowStockThreshold ?? 5));
      return (
        matchesSearch && matchesCategory && matchesActive && matchesLowStock
      );
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    showActiveOnly,
    showLowStockOnly,
    useServerSideFiltering,
  ]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      try {
        await deleteMutation(id).unwrap();
        toast.success("تم حذف المنتج بنجاح");
      } catch (error) {
        toast.error("فشل في حذف المنتج");
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Loading />
      </div>
    );
  }

  const totalProducts = filteredProducts.length;
  const activeProducts = filteredProducts.filter((p) => p.isActive).length;
  const lowStockProducts = filteredProducts.filter(
    (p) =>
      p.trackInventory && (p.stockQuantity ?? 0) < (p.lowStockThreshold ?? 5),
  ).length;

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-black text-foreground">
              إدارة المنتجات
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
              إضافة وتعديل وحذف المنتجات
            </p>
          </div>

          <div className="flex items-end gap-2">
            <Button
              size="lg"
              onClick={() => setShowForm(true)}
              leftIcon={<Plus className="size-5" />}
            >
              إضافة منتج
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          title="إجمالي المنتجات"
          value={totalProducts}
          description="جميع المنتجات المسجلة"
          icon={Package}
        />
        <MetricCard
          title="المنتجات النشطة"
          value={activeProducts}
          description="متاحة للبيع حالياً"
          icon={Package}
          tone="success"
        />
        <MetricCard
          title="مخزون منخفض"
          value={lowStockProducts}
          description="تحتاج لإعادة الطلب"
          icon={Package}
          tone="danger"
        />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex flex-col gap-4 md:flex-row">
                <div className="flex-1 relative">
                  <SearchLg className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    placeholder="بحث عن منتج..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50"
                  />
                </div>
                <div className="relative min-w-[200px]">
                  <select
                    value={selectedCategory || ""}
                    onChange={(e) =>
                      setSelectedCategory(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="w-full appearance-none rounded-2xl border border-border bg-background/50 pl-10 pr-4 py-2.5 text-sm shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-muted-foreground/30"
                  >
                    <option value="">كل التصنيفات</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Additional Filters */}
              <div className="flex flex-wrap gap-6">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={showActiveOnly}
                    onChange={(e) => setShowActiveOnly(e.target.checked)}
                    className="size-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-background"
                  />
                  <span className="text-sm font-semibold text-foreground">نشط فقط</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={showLowStockOnly}
                    onChange={(e) => setShowLowStockOnly(e.target.checked)}
                    className="size-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-background"
                  />
                  <span className="text-sm font-semibold text-foreground">مخزون منخفض فقط</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col overflow-hidden">
            <div className="flex-1 overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell className="w-12 text-right">#</TableHeaderCell>
                    <TableHeaderCell className="text-right">المنتج</TableHeaderCell>
                    <TableHeaderCell className="text-right">التصنيف</TableHeaderCell>
                    <TableHeaderCell className="text-right">السعر</TableHeaderCell>
                    <TableHeaderCell className="text-right">الكمية</TableHeaderCell>
                    <TableHeaderCell className="text-right">نقطة إعادة الطلب</TableHeaderCell>
                    <TableHeaderCell className="text-right">الحالة</TableHeaderCell>
                    <TableHeaderCell className="text-center w-24">الإجراءات</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                        <Package className="mx-auto mb-4 size-12 opacity-50" />
                        <p className="text-lg font-medium">لا توجد منتجات</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product, index) => {
                      const category = categories.find(
                        (c) => c.id === product.categoryId,
                      );
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="text-muted-foreground font-mono">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Package className="size-5" />
                              </div>
                              <span className="font-semibold text-foreground">
                                {product.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground font-medium">
                            {category?.name || "-"}
                          </TableCell>
                          <TableCell className="font-mono font-black text-primary">
                            {formatCurrency(product.price)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold font-mono",
                                (product.stockQuantity ?? 0) <= 0
                                  ? "bg-danger/10 text-danger"
                                  : (product.stockQuantity ?? 0) <=
                                      (product.lowStockThreshold ?? 5)
                                    ? "bg-warning/10 text-warning"
                                    : "bg-success/10 text-success"
                              )}
                            >
                              {product.stockQuantity ?? 0}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono font-medium">
                            {product.reorderPoint ?? "—"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
                                product.isActive
                                  ? "bg-success/10 text-success"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {product.isActive ? "نشط" : "غير نشط"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(product)}
                                className="size-8 text-muted-foreground hover:text-primary"
                                aria-label="تعديل المنتج"
                              >
                                <Edit01 className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(product.id)}
                                disabled={isDeleting}
                                className="size-8 text-muted-foreground hover:text-danger hover:bg-danger/10"
                                aria-label="حذف المنتج"
                              >
                                <Trash01 className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>

      {showForm && (
        <ProductFormModal
          product={editingProduct}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default ProductsPage;
