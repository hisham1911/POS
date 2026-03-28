import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertCircle,
  BankNote01,
  Building02,
  Check,
  CheckCircle,
  CreditCard01,
  File04,
  Minus,
  Package,
  Phone,
  Plus,
  PlusCircle,
  Receipt,
  SearchLg,
  ShoppingCart01,
  Star01,
  Tag01,
  Trash01,
  User01,
  XClose,
} from "@untitledui/icons";
import { useLazyGetCustomerByPhoneQuery } from "@/api/customersApi";
import { useGetShiftWarningsQuery } from "@/api/shiftsApi";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/common/Loading";
import { CartItemComponent } from "@/components/pos/CartItem";
import { CategoryChips } from "@/components/pos/CategoryChips";
import { CustomerQuickCreateModal } from "@/components/pos/CustomerQuickCreateModal";
import { CustomItemModal } from "@/components/pos/CustomItemModal";
import { ProductListView } from "@/components/pos/ProductListView";
import { ProductQuickCreateModal } from "@/components/pos/ProductQuickCreateModal";
import { useCart } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";
import { usePOSMode } from "@/hooks/usePOSMode";
import { usePOSShortcuts } from "@/hooks/usePOSShortcuts";
import { useCategories, useProducts } from "@/hooks/useProducts";
import { useShift } from "@/hooks/useShift";
import { cn } from "@/lib/utils";
import type { Customer } from "@/types/customer.types";
import type { PaymentMethod } from "@/types/order.types";
import { formatCurrency } from "@/utils/formatters";

type WorkspaceTab = "cart" | "customer" | "payment" | "summary";

export const POSWorkspacePage = () => {
  const { mode } = usePOSMode();

  if (mode === "cashier") {
    return <Navigate to="/pos" replace />;
  }

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showCustomItem, setShowCustomItem] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("cart");
  const [showCustomerCreateModal, setShowCustomerCreateModal] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("Cash");
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [allowPartialPayment, setAllowPartialPayment] = useState(false);
  const [showPaymentError, setShowPaymentError] = useState(false);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountInputValue, setDiscountInputValue] = useState("");
  const [discountInputType, setDiscountInputType] = useState<"Percentage" | "Fixed">("Percentage");
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const customerPhoneRef = useRef<HTMLInputElement>(null);

  const { products, isLoading } = useProducts();
  const { categories } = useCategories();
  const {
    items,
    itemsCount,
    subtotal,
    discountAmount,
    discountType,
    discountValue,
    taxAmount,
    total,
    taxRate,
    isTaxEnabled,
    addItem,
    clearCart,
    applyDiscount,
    removeDiscount,
  } = useCart();
  const { hasActiveShift, isLoading: isLoadingShift, currentShift } = useShift();
  const { createOrder, completeOrder, isCreating, isCompleting } = useOrders();

  const [searchCustomer, { data: searchResult, isFetching: isSearchingCustomer }] =
    useLazyGetCustomerByPhoneQuery();

  const { data: warningsData } = useGetShiftWarningsQuery(undefined, {
    pollingInterval: 10 * 60 * 1000,
    skip: !hasActiveShift,
  });

  const shiftWarning = warningsData?.data;

  usePOSShortcuts({
    onCheckout: () => {
      if (items.length > 0) {
        setActiveTab("payment");
        setAmountPaid(total.toFixed(2));
      }
    },
    onSearch: () => searchInputRef.current?.focus(),
  });

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (activeTab === "payment") {
      setAmountPaid(total.toFixed(2));
    }
  }, [total, activeTab]);

  const handleSearchSubmit = useCallback(
    (value: string) => {
      const trimmedValue = value.trim();
      if (!trimmedValue) return;

      const foundProduct = products.find(
        (p) =>
          (p.barcode && p.barcode.toLowerCase() === trimmedValue.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase() === trimmedValue.toLowerCase()) ||
          p.name.toLowerCase() === trimmedValue.toLowerCase()
      );

      if (foundProduct) {
        addItem(foundProduct, 1);
        toast.success(`تمت الإضافة: ${foundProduct.name}`);
        setSearchInput("");
        searchInputRef.current?.focus();
      } else {
        toast.error(`لم يتم العثور على منتج: ${trimmedValue}`);
      }
    },
    [products, addItem]
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit(searchInput);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (customerPhone.length >= 8) {
        searchCustomer(customerPhone);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [customerPhone, searchCustomer]);

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerPhone("");
    toast.success(`تم اختيار العميل: ${customer.name || customer.phone}`);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerPhone("");
  };

  const handleNumpadClick = (value: string) => {
    if (value === "C") {
      setAmountPaid("");
    } else if (value === "←") {
      setAmountPaid((prev) => prev.slice(0, -1));
    } else if (value === ".") {
      if (!amountPaid.includes(".")) {
        setAmountPaid((prev) => prev + ".");
      }
    } else {
      setAmountPaid((prev) => prev + value);
    }
  };

  const handleQuickAmount = (amount: number) => {
    setAmountPaid(amount.toFixed(2));
  };

  const handleCompletePayment = async () => {
    const numericAmount = parseFloat(amountPaid) || 0;
    const amountDue = total - numericAmount;

    if (numericAmount < total && !allowPartialPayment) {
      setShowPaymentError(true);
      setTimeout(() => setShowPaymentError(false), 500);
      toast.error("المبلغ المدفوع أقل من الإجمالي");
      return;
    }

    if (numericAmount < total && !selectedCustomer) {
      toast.error("البيع الآجل يتطلب ربط عميل بالطلب");
      return;
    }

    if (numericAmount < total && selectedCustomer && !selectedCustomer.isActive) {
      toast.error("العميل غير نشط - لا يمكن البيع الآجل");
      return;
    }

    if (selectedCustomer && selectedCustomer.creditLimit > 0) {
      const availableCredit = selectedCustomer.creditLimit - selectedCustomer.totalDue;
      const creditLimitExceeded = amountDue > availableCredit;
      if (numericAmount < total && creditLimitExceeded) {
        toast.error(
          `تجاوز حد الائتمان. المتاح: ${formatCurrency(availableCredit)}، المطلوب: ${formatCurrency(amountDue)}`,
          { duration: 5000 }
        );
        return;
      }
    }

    try {
      const order = await createOrder(selectedCustomer?.id);
      if (!order) return;

      const completedOrder = await completeOrder(order.id, {
        payments: [{ method: selectedPaymentMethod, amount: numericAmount }],
      });

      if (completedOrder) {
        const change = numericAmount - total;
        if (change > 0) {
          toast.success(`تم إتمام الدفع! الباقي: ${formatCurrency(change)}`);
        } else if (amountDue > 0) {
          toast.success(
            `تم إتمام البيع الآجل! المبلغ المستحق: ${formatCurrency(amountDue)}`
          );
        } else {
          toast.success("تم إتمام الدفع بنجاح!");
        }

        setSelectedCustomer(null);
        setCustomerPhone("");
        setAmountPaid("");
        setAllowPartialPayment(false);
        setActiveTab("cart");
      }
    } catch {
      toast.error("حدث خطأ غير متوقع");
    }
  };

  let filteredProducts = products;

  if (searchInput.trim()) {
    const searchLower = searchInput.toLowerCase().trim();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchLower)) ||
        (p.sku && p.sku.toLowerCase().includes(searchLower))
    );
  }

  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(
      (p) => p.categoryId === selectedCategory
    );
  }

  if (showAvailableOnly) {
    filteredProducts = filteredProducts.filter((p) => {
      if (!p.trackInventory) return true;
      return (p.stockQuantity ?? 0) > 0;
    });
  }

  if (isLoading || isLoadingShift) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Loading />
      </div>
    );
  }

  if (!hasActiveShift) {
    return (
      <div className="flex h-full items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-3xl bg-card p-10 text-center shadow-xl border border-border/60">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-warning/10">
            <AlertCircle className="size-10 text-warning" />
          </div>
          <h2 className="mb-3 text-2xl font-black text-foreground">
            لا توجد وردية مفتوحة
          </h2>
          <p className="mb-8 text-muted-foreground leading-relaxed">
            يجب فتح وردية قبل البدء في البيع. اذهب إلى صفحة الورديات لفتح وردية جديدة لتتمكن من استخدام نقطة البيع.
          </p>
          <Link
            to="/shift"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-6 font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            الذهاب إلى الورديات
          </Link>
        </div>
      </div>
    );
  }

  const numericAmount = parseFloat(amountPaid) || 0;
  const change = numericAmount - total;
  const amountDue = total - numericAmount;

  const availableCredit = selectedCustomer
    ? selectedCustomer.creditLimit - selectedCustomer.totalDue
    : 0;

  const canTakeCredit =
    selectedCustomer &&
    selectedCustomer.isActive &&
    (selectedCustomer.creditLimit === 0 || amountDue <= availableCredit);

  const creditLimitExceeded =
    selectedCustomer &&
    selectedCustomer.creditLimit > 0 &&
    amountDue > availableCredit;

  const paymentMethods: {
    id: PaymentMethod;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: "Cash", label: "نقدي", icon: <BankNote01 className="size-6" /> },
    { id: "Card", label: "بطاقة", icon: <CreditCard01 className="size-6" /> },
    { id: "Fawry", label: "فوري", icon: <Building02 className="size-6" /> },
  ];

  const quickAmounts = [50, 100, 200, 500];

  return (
    <div className="flex h-full flex-col bg-background">
      {shiftWarning && shiftWarning.shouldWarn && (
        <div className="border-b border-warning/20 bg-warning/5 px-6 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 shrink-0 text-warning" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-warning">
                {shiftWarning.message}
              </p>
              {shiftWarning.hoursOpen && (
                <p className="text-xs font-medium text-warning/80">
                  الوردية مفتوحة منذ {shiftWarning.hoursOpen.toFixed(1)} ساعة
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        {/* Left: Product Explorer (60%) */}
        <div className="flex min-w-0 flex-1 flex-col p-4 lg:min-h-0 bg-muted/10">
          <div className="mb-5">
            <div className="relative group">
              <SearchLg className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="بحث بالاسم، الباركود أو SKU (اضغط Enter للإضافة)"
                className="w-full rounded-2xl border-2 border-border/50 bg-background pl-4 pr-12 py-3.5 text-sm font-medium shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="mb-5">
            <CategoryChips
              categories={categories}
              selectedId={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAvailableOnly(!showAvailableOnly)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all shadow-sm",
                showAvailableOnly
                  ? "bg-foreground text-background"
                  : "bg-background text-foreground border border-border hover:bg-muted"
              )}
            >
              <CheckCircle className="size-4" />
              <span>المتاح فقط</span>
            </button>

            <button
              onClick={() => setShowQuickCreate(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-all"
            >
              <PlusCircle className="size-4" />
              <span>منتج جديد</span>
            </button>

            <button
              onClick={() => setShowCustomItem(true)}
              disabled={itemsCount === 0}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                itemsCount > 0
                  ? "bg-accent/10 text-accent-foreground hover:bg-accent/20"
                  : "bg-muted text-muted-foreground cursor-not-allowed border border-border/50"
              )}
              title={itemsCount > 0 ? "إضافة منتج مخصص للطلب الحالي" : "ابدأ طلب أولاً"}
            >
              <File04 className="size-4" />
              <span>منتج مخصص</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin lg:min-h-0 min-h-[18rem] -mx-4 px-4 pb-4">
            <ProductListView products={filteredProducts} categories={categories} />
          </div>
        </div>

        {/* Right: Transaction Workspace (40%) */}
        <div className="flex min-h-[24rem] max-h-[70vh] w-full flex-col border-t border-border bg-card lg:max-h-none lg:w-[40%] lg:min-w-[24rem] lg:border-l lg:border-t-0 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] z-10">
          {/* Tabs */}
          <div className="grid grid-cols-4 border-b border-border bg-muted/20">
            <button
              onClick={() => setActiveTab("cart")}
              className={cn(
                "relative flex min-w-0 flex-col items-center justify-center gap-1.5 p-3 text-sm font-semibold transition-colors",
                activeTab === "cart"
                  ? "text-primary bg-background shadow-[inset_0_2px_0_0_hsl(var(--primary))]"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <ShoppingCart01 className="size-5" />
              <span className="truncate">السلة</span>
              {itemsCount > 0 && (
                <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                  {itemsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("customer")}
              className={cn(
                "relative flex min-w-0 flex-col items-center justify-center gap-1.5 p-3 text-sm font-semibold transition-colors",
                activeTab === "customer"
                   ? "text-primary bg-background shadow-[inset_0_2px_0_0_hsl(var(--primary))]"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <User01 className="size-5" />
              <span className="truncate">العميل</span>
              {selectedCustomer && (
                <div className="absolute right-2 top-2 size-2 rounded-full bg-success shadow-sm" />
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("payment");
                setAmountPaid(total.toFixed(2));
              }}
              disabled={items.length === 0}
              className={cn(
                "relative flex min-w-0 flex-col items-center justify-center gap-1.5 p-3 text-sm font-semibold transition-colors",
                activeTab === "payment"
                   ? "text-primary bg-background shadow-[inset_0_2px_0_0_hsl(var(--primary))]"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                items.length === 0 && "opacity-50 cursor-not-allowed"
              )}
            >
              <CreditCard01 className="size-5" />
              <span className="truncate">الدفع</span>
            </button>

            <button
              onClick={() => setActiveTab("summary")}
              disabled={items.length === 0}
              className={cn(
                "relative flex min-w-0 flex-col items-center justify-center gap-1.5 p-3 text-sm font-semibold transition-colors",
                activeTab === "summary"
                   ? "text-primary bg-background shadow-[inset_0_2px_0_0_hsl(var(--primary))]"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                items.length === 0 && "opacity-50 cursor-not-allowed"
              )}
            >
              <Receipt className="size-5" />
              <span className="truncate">الملخص</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {/* Cart Tab */}
            {activeTab === "cart" && (
              <div className="space-y-4">
                {items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-16 text-muted-foreground">
                    <div className="mb-5 flex size-24 items-center justify-center rounded-full bg-muted shadow-inner">
                      <ShoppingCart01 className="size-12 opacity-50" />
                    </div>
                    <p className="text-xl font-bold text-foreground">السلة فارغة</p>
                    <p className="mt-2 text-sm">ابحث عن المنتجات واضغط عليها لإضافتها</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-foreground">
                        العناصر ({itemsCount})
                      </h3>
                      <button
                        onClick={clearCart}
                        className="flex items-center gap-2 text-sm font-semibold text-danger hover:underline"
                      >
                        <Trash01 className="size-4" />
                        إفراغ
                      </button>
                    </div>

                    <div className="space-y-3">
                      {items.map((item) => (
                        <CartItemComponent key={item.product.id} item={item} />
                      ))}
                    </div>

                    <div className="mt-6 space-y-3 rounded-2xl bg-muted/40 p-4 border border-border/50">
                      <p className="text-sm font-bold text-foreground">الخصم الإضافي</p>
                      
                      {discountAmount === 0 ? (
                        showDiscountInput ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => setDiscountInputType("Percentage")}
                                className={cn(
                                  "rounded-xl py-2.5 text-sm font-bold transition-all",
                                  discountInputType === "Percentage"
                                    ? "bg-foreground text-background shadow-md"
                                    : "bg-background border border-border text-foreground hover:bg-muted"
                                )}
                              >
                                نسبة %
                              </button>
                              <button
                                onClick={() => setDiscountInputType("Fixed")}
                                className={cn(
                                  "rounded-xl py-2.5 text-sm font-bold transition-all",
                                  discountInputType === "Fixed"
                                    ? "bg-foreground text-background shadow-md"
                                    : "bg-background border border-border text-foreground hover:bg-muted"
                                )}
                              >
                                مبلغ ثابت
                              </button>
                            </div>

                            <input
                              type="number"
                              value={discountInputValue === "0" ? "" : discountInputValue}
                              onChange={(e) => setDiscountInputValue(e.target.value)}
                              placeholder={discountInputType === "Percentage" ? "0-100" : "0.00"}
                              className="w-full rounded-xl border-2 border-border/50 bg-background px-4 py-3 font-mono text-lg focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                              autoFocus
                            />

                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                className="flex-1"
                                onClick={() => {
                                  const value = parseFloat(discountInputValue);
                                  if (!isNaN(value) && value > 0) {
                                    if (discountInputType === "Percentage" && value <= 100) {
                                      applyDiscount("Percentage", value);
                                      toast.success(`تم تطبيق خصم ${value}%`);
                                      setShowDiscountInput(false);
                                      setDiscountInputValue("");
                                    } else if (discountInputType === "Fixed") {
                                      applyDiscount("Fixed", value);
                                      toast.success(`تم تطبيق خصم ${formatCurrency(value)}`);
                                      setShowDiscountInput(false);
                                      setDiscountInputValue("");
                                    } else {
                                      toast.error("النسبة يجب أن تكون بين 0 و 100");
                                    }
                                  }
                                }}
                              >
                                تطبيق
                              </Button>
                              <Button
                                variant="glass"
                                onClick={() => {
                                  setShowDiscountInput(false);
                                  setDiscountInputValue("");
                                }}
                              >
                                إلغاء
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowDiscountInput(true)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3.5 text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary font-semibold"
                          >
                            <Tag01 className="size-5" />
                            <span>إضافة خصم للطلب</span>
                          </button>
                        )
                      ) : (
                        <div className="rounded-xl border border-success/30 bg-success/10 p-4 relative overflow-hidden">
                          <div className="absolute inset-0 bg-success/5 pattern-dots pattern-success/20 pattern-bg-transparent pattern-size-4" />
                          <div className="relative z-10">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-bold text-success flex items-center gap-1.5">
                                <Tag01 className="size-4" />
                                {discountType === "Percentage" ? `خصم ${discountValue}%` : "خصم ثابت"}
                              </span>
                              <button
                                onClick={() => {
                                  removeDiscount();
                                  toast.success("تم إلغاء الخصم");
                                }}
                                className="rounded-lg p-1.5 text-success/70 hover:bg-success/20 hover:text-success transition-colors"
                              >
                                <XClose className="size-4" />
                              </button>
                            </div>
                            <div className="font-mono text-2xl font-bold text-success">
                              - {formatCurrency(discountAmount)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Customer Tab */}
            {activeTab === "customer" && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-foreground">
                  معلومات العميل
                </h3>

                {selectedCustomer ? (
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                    <div className="mb-5 flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                          <User01 className="size-7" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-foreground">
                            {selectedCustomer.name || "بدون اسم"}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground font-mono">
                            <Phone className="size-3.5" />
                            <span dir="ltr">{selectedCustomer.phone}</span>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleClearCustomer}
                        className="rounded-xl p-2 text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"
                        title="إزالة العميل"
                      >
                        <XClose className="size-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(selectedCustomer.loyaltyPoints ?? 0) > 0 && (
                        <div className="flex items-center justify-between rounded-xl bg-background border border-border p-3.5 shadow-sm">
                          <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                            <Star01 className="size-4 text-warning fill-warning" />
                            نقاط الولاء
                          </span>
                          <span className="font-mono text-lg font-bold text-warning">
                            {selectedCustomer.loyaltyPoints}
                          </span>
                        </div>
                      )}

                      {selectedCustomer.totalDue > 0 && (
                        <div className="flex items-center justify-between rounded-xl bg-danger/10 border border-danger/20 p-3.5 shadow-sm">
                          <span className="flex items-center gap-2 text-sm font-bold text-danger">
                            <AlertCircle className="size-4" />
                            رصيد مستحق
                          </span>
                          <span className="font-mono text-lg font-bold text-danger">
                            {formatCurrency(selectedCustomer.totalDue)}
                          </span>
                        </div>
                      )}

                      {selectedCustomer.creditLimit > 0 && (
                        <div className="flex items-center justify-between rounded-xl bg-background border border-border p-3.5 shadow-sm">
                          <span className="text-sm font-bold text-muted-foreground">حد الائتمان</span>
                          <span className="font-mono font-bold text-foreground">
                            {formatCurrency(selectedCustomer.creditLimit)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="relative group">
                      <input
                        ref={customerPhoneRef}
                        type="text"
                        value={customerPhone}
                        onChange={(e) =>
                          setCustomerPhone(e.target.value.replace(/[^0-9]/g, ""))
                        }
                        placeholder="ابحث برقم الهاتف عن عميل..."
                        className="w-full rounded-2xl border-2 border-border/50 bg-background px-5 py-4 pl-12 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 font-mono text-lg"
                        dir="ltr"
                      />
                      <SearchLg className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      
                      {isSearchingCustomer && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                      )}
                    </div>

                    {customerPhone.length >= 8 &&
                      !isSearchingCustomer &&
                      searchResult?.data && (
                        <div
                          onClick={() => handleSelectCustomer(searchResult.data!)}
                          className="group cursor-pointer rounded-2xl border-2 border-success/30 bg-success/5 p-4 transition-all hover:bg-success/10 hover:border-success/50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground shadow-md transition-transform group-hover:scale-105">
                              <User01 className="size-6" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-foreground text-lg">
                                {searchResult.data.name || "بدون اسم"}
                              </p>
                              <p className="font-mono text-sm text-muted-foreground">
                                {searchResult.data.phone}
                              </p>
                            </div>
                            <span className="rounded-lg bg-success/20 px-3 py-1.5 text-xs font-bold text-success">
                              اختيار
                            </span>
                          </div>
                        </div>
                      )}

                    {customerPhone.length >= 8 &&
                      !isSearchingCustomer &&
                      !searchResult?.data && (
                        <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 text-center">
                          <User01 className="mx-auto mb-3 size-10 text-muted-foreground/50" />
                          <p className="mb-4 font-semibold text-foreground">
                            العميل غير مسجل بالنظام
                          </p>
                          <Button
                            className="w-full"
                            onClick={() => setShowCustomerCreateModal(true)}
                            leftIcon={<Plus className="size-5" />}
                          >
                            تسجيل العميل وإضافته للطلب
                          </Button>
                        </div>
                      )}

                    <div className="py-10 text-center text-muted-foreground">
                      <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-muted/50 border border-border/50">
                        <Users01 className="size-10 opacity-40" />
                      </div>
                      <p className="font-medium">ابحث بالهاتف لربط الفاتورة بعميل</p>
                      <p className="text-sm mt-1 opacity-70">أو اتركها للزبائن العابرين (بيع نقدي)</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === "payment" && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-lg font-bold text-foreground">الدفع</h3>
                  <div className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-6 text-center shadow-inner relative">
                    <div className="absolute inset-0 bg-primary/5 pattern-dots pattern-primary/10 pattern-bg-transparent pattern-size-4" />
                    <div className="relative z-10">
                      <p className="mb-2 text-sm font-bold text-primary">المبلغ المطلوب</p>
                      <p className="font-display text-5xl font-black text-primary drop-shadow-sm">
                        {formatCurrency(total)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-bold text-foreground">
                    طريقة الدفع
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={cn(
                          "flex flex-col items-center gap-2.5 rounded-2xl border-2 p-4 transition-all",
                          selectedPaymentMethod === method.id
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border bg-background hover:border-primary/40 hover:bg-muted"
                        )}
                      >
                        <div className={cn("p-2 rounded-xl", selectedPaymentMethod === method.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                          {method.icon}
                        </div>
                        <span className="font-bold text-sm">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedPaymentMethod === "Cash" && (
                  <div className="space-y-5 rounded-3xl bg-muted/30 p-5 border border-border/50">
                    <div>
                      <p className="mb-3 text-sm font-bold text-foreground text-center">
                        المبلغ المستلم
                      </p>
                      <div
                        className={cn(
                          "rounded-2xl bg-background p-5 text-center shadow-inner transition-all border-2",
                          showPaymentError ? "animate-shake border-danger" : "border-transparent"
                        )}
                      >
                        <p className="font-mono text-4xl font-bold text-foreground">
                          {amountPaid || "0"}{" "}
                          <span className="text-xl text-muted-foreground mr-1">ج.م</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {quickAmounts.map((amount) => (
                         <button
                         key={amount}
                         onClick={() => handleQuickAmount(amount)}
                         className="rounded-xl bg-background border border-border py-3 font-mono text-sm font-bold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
                       >
                         {amount}
                       </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[
                        "7", "8", "9", "←",
                        "4", "5", "6", "C",
                        "1", "2", "3", ".",
                        "0", "00"
                      ].map((key) => (
                         <button
                          key={key}
                          onClick={() => handleNumpadClick(key)}
                          className={cn(
                            "flex h-14 items-center justify-center rounded-xl bg-background border border-border font-mono text-xl font-bold shadow-sm transition-all hover:bg-muted active:scale-95",
                            key === "0" && "col-span-2",
                            key === "C" && "text-danger bg-danger/5 border-danger/20 hover:bg-danger/10",
                            key === "←" && "text-warning bg-warning/5 border-warning/20 hover:bg-warning/10"
                          )}
                        >
                          {key}
                        </button>
                      ))}
                    </div>

                    {change > 0 && (
                      <div className="rounded-2xl border border-success/30 bg-success/10 p-5 text-center shadow-inner mt-4">
                        <p className="mb-1 text-sm font-bold text-success/80">الباقي للعميل</p>
                        <p className="font-mono text-3xl font-black text-success">
                          {formatCurrency(change)}
                        </p>
                      </div>
                    )}

                    {numericAmount < total && numericAmount > 0 && (
                      <div
                        className={cn(
                          "rounded-2xl border p-5 text-center shadow-inner mt-4",
                          creditLimitExceeded
                            ? "border-danger/30 bg-danger/10"
                            : "border-warning/30 bg-warning/10"
                        )}
                      >
                        <p className="mb-1 text-sm font-bold opacity-80">المبلغ المتبقي (الآجل)</p>
                        <p
                          className={cn(
                            "font-mono text-3xl font-black",
                            creditLimitExceeded ? "text-danger" : "text-warning"
                          )}
                        >
                          {formatCurrency(amountDue)}
                        </p>
                        {creditLimitExceeded && (
                          <p className="mt-2 text-xs font-bold text-danger bg-danger/10 p-1.5 rounded-md inline-block">
                            تجاوز حد الائتمان - المتاح: {formatCurrency(availableCredit)}
                          </p>
                        )}
                        {selectedCustomer && !selectedCustomer.isActive && (
                          <p className="mt-2 text-xs font-bold text-danger bg-danger/10 p-1.5 rounded-md inline-block">
                            العميل غير نشط
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {selectedCustomer && canTakeCredit && selectedPaymentMethod === "Cash" && (
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 transition-colors hover:bg-primary/10">
                    <input
                      type="checkbox"
                      checked={allowPartialPayment}
                      onChange={(e) => setAllowPartialPayment(e.target.checked)}
                      className="mt-1 size-5 rounded text-primary focus:ring-primary focus:ring-offset-background"
                    />
                    <div>
                      <p className="font-bold text-foreground">
                        السماح بالدفع الجزئي (بيع آجل)
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground leading-snug">
                        تسجيل الدفعة الحالية وتقييد الباقي كدين على حساب العميل.
                      </p>
                    </div>
                  </label>
                )}
              </div>
            )}

            {/* Summary Tab */}
            {activeTab === "summary" && (
              <div className="space-y-4">
                <h3 className="mb-4 text-lg font-bold text-foreground">
                  ملخص الطلب
                </h3>

                <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                  <p className="mb-2 text-xs font-bold text-muted-foreground">العميل</p>
                  {selectedCustomer ? (
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <User01 className="size-4" />
                      </div>
                      <span className="font-bold text-foreground">
                        {selectedCustomer.name || selectedCustomer.phone}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-muted-foreground">
                       <div className="bg-muted p-2 rounded-full">
                        <User01 className="size-4" />
                      </div>
                      <span className="font-medium">عميل نقدي عابر</span>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                  <div className="mb-3 flex justify-between items-center text-xs font-bold text-muted-foreground">
                    <span>العناصر</span>
                    <span className="bg-muted px-2 py-0.5 rounded-md">{itemsCount}</span>
                  </div>
                  <div className="max-h-56 space-y-2.5 overflow-y-auto scrollbar-thin pr-1">
                    {items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-start justify-between text-sm py-1 border-b border-border/40 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start gap-2.5 pr-2">
                          <span className="font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded text-xs">
                            {item.quantity}x
                          </span>
                          <span className="font-medium text-foreground line-clamp-2 leading-tight mt-0.5">{item.product.name}</span>
                        </div>
                        <span className="font-mono font-bold text-foreground whitespace-nowrap pt-0.5">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-primary/10 bg-primary/5 p-5 shadow-sm">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-muted-foreground">المجموع الفرعي</span>
                    <span className="font-mono font-bold text-foreground">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-bold text-success">
                        <Tag01 className="size-4" />
                        الخصم
                        {discountType === "Percentage" &&
                          discountValue &&
                          ` (${discountValue}%)`}
                      </span>
                      <span className="font-mono font-bold text-success">
                        - {formatCurrency(discountAmount)}
                      </span>
                    </div>
                  )}

                  {isTaxEnabled && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-muted-foreground">الضريبة ({taxRate}%)</span>
                      <span className="font-mono font-bold text-foreground">
                        {formatCurrency(taxAmount)}
                      </span>
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-3">
                    <span className="text-lg font-black text-foreground">الإجمالي</span>
                    <span className="font-display text-3xl font-black text-primary">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                  <p className="mb-2 text-xs font-bold text-muted-foreground">
                    طريقة الدفع
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="bg-background border border-border p-2 rounded-xl shadow-sm text-foreground">
                      {selectedPaymentMethod === "Cash" && <BankNote01 className="size-5" />}
                      {selectedPaymentMethod === "Card" && <CreditCard01 className="size-5" />}
                      {selectedPaymentMethod === "Fawry" && <Building02 className="size-5" />}
                    </div>
                    <span className="font-bold text-foreground">
                      {paymentMethods.find((m) => m.id === selectedPaymentMethod)?.label}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Total Bar */}
          <div className="border-t border-border bg-card p-5 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] z-20">
            <div className="mb-4 flex items-end justify-between px-1">
               <div>
                  <span className="text-sm font-bold text-muted-foreground block mb-0.5">الإجمالي النهائي</span>
                  <span className="font-display text-4xl font-black text-foreground drop-shadow-sm">
                    {formatCurrency(total)}
                  </span>
               </div>
               {activeTab === "payment" && selectedPaymentMethod === "Cash" && change > 0 && (
                 <div className="text-left">
                   <span className="text-xs font-bold text-success/80 block mb-0.5">الباقي</span>
                   <span className="font-mono text-xl font-black text-success">{formatCurrency(change)}</span>
                 </div>
               )}
            </div>

            {activeTab === "payment" && items.length > 0 && (
              <Button
                size="xl"
                className="w-full text-lg shadow-lg relative overflow-hidden group"
                onClick={handleCompletePayment}
                disabled={
                  isCreating ||
                  isCompleting ||
                  (numericAmount < total && !allowPartialPayment) ||
                  (numericAmount < total && creditLimitExceeded)
                }
                rightIcon={<Check className="size-6 transition-transform group-hover:scale-110" />}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                {isCreating
                  ? "جاري إنشاء الطلب..."
                  : isCompleting
                  ? "جاري الدفع..."
                  : numericAmount < total && allowPartialPayment
                  ? `إتمام البيع الآجل (مستحق: ${formatCurrency(amountDue)})`
                  : "إتمام الدفع واصدار הפاتورة"}
              </Button>
            )}

            {activeTab !== "payment" && items.length > 0 && (
              <Button
                size="xl"
                className="w-full text-lg shadow-md"
                onClick={() => {
                  setActiveTab("payment");
                  setAmountPaid(total.toFixed(2));
                }}
                rightIcon={<CreditCard01 className="size-6" />}
              >
                المتابعة للدفع
              </Button>
            )}
          </div>
        </div>
      </div>

      {showQuickCreate && (
        <ProductQuickCreateModal
          onClose={() => setShowQuickCreate(false)}
          onSuccess={() => {
            toast.success("تم إضافة المنتج بنجاح");
            setShowQuickCreate(false);
          }}
        />
      )}

      {showCustomItem && (
        <CustomItemModal
          onClose={() => setShowCustomItem(false)}
          onSuccess={(item) => {
            const customProduct = {
              id: -Date.now(),
              name: item.name,
              price: item.unitPrice,
              taxRate: item.taxRate || 14,
              categoryId: 0,
              isActive: true,
              trackInventory: false,
              type: 2,
              stockQuantity: null,
            };
            addItem(customProduct as any, item.quantity);
            toast.success(`تم إضافة: ${item.name}`);
            setShowCustomItem(false);
          }}
        />
      )}

      {showCustomerCreateModal && (
        <CustomerQuickCreateModal
          initialPhone={customerPhone}
          onClose={() => setShowCustomerCreateModal(false)}
          onSuccess={(customer) => {
            handleSelectCustomer(customer);
            setShowCustomerCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default POSWorkspacePage;
