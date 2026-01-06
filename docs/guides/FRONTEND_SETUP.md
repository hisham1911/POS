# 🎨 دليل إعداد الـ Frontend - KasserPro POS

## المرحلة الأولى: الإعداد الكامل

---

## 📋 جدول المحتويات

1. [إنشاء المشروع](#-إنشاء-المشروع)
2. [تثبيت الحزم](#-تثبيت-الحزم)
3. [هيكل المجلدات](#-هيكل-المجلدات)
4. [ملفات الإعداد](#-ملفات-الإعداد)
5. [نظام الألوان والتصميم](#-نظام-الألوان-والتصميم)
6. [المكونات الأساسية](#-المكونات-الأساسية)
7. [الصفحات](#-الصفحات)
8. [التشغيل](#-التشغيل)

---

## 🚀 إنشاء المشروع

```powershell
# إنشاء مشروع React + TypeScript + Vite
npm create vite@latest kasserpro-frontend -- --template react-ts

# الدخول للمجلد
cd kasserpro-frontend

# تثبيت الحزم الأساسية
npm install
```

---

## 📦 تثبيت الحزم

```powershell
# UI & Styling
npm install tailwindcss postcss autoprefixer
npm install @headlessui/react @heroicons/react
npm install clsx

# State Management (Redux Toolkit + RTK Query)
npm install @reduxjs/toolkit react-redux redux-persist

# Routing
npm install react-router-dom

# Forms
npm install react-hook-form zod @hookform/resolvers

# Utilities
npm install react-hot-toast date-fns

# إعداد Tailwind
npx tailwindcss init -p
```

---

## 📁 هيكل المجلدات

```
kasserpro-frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                    # RTK Query APIs
│   │   ├── baseApi.ts
│   │   ├── authApi.ts
│   │   ├── productsApi.ts
│   │   ├── categoriesApi.ts
│   │   ├── ordersApi.ts
│   │   └── shiftsApi.ts
│   ├── components/
│   │   ├── common/             # مكونات عامة
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── Card.tsx
│   │   ├── layout/             # تخطيط الصفحات
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MainLayout.tsx
│   │   └── pos/                # مكونات الكاشير
│   │       ├── ProductCard.tsx
│   │       ├── ProductGrid.tsx
│   │       ├── CategoryTabs.tsx
│   │       ├── Cart.tsx
│   │       ├── CartItem.tsx
│   │       ├── OrderSummary.tsx
│   │       └── PaymentModal.tsx
│   ├── hooks/                  # Custom Hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── useProducts.ts
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── pos/
│   │   │   └── POSPage.tsx
│   │   ├── orders/
│   │   │   └── OrdersPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── store/
│   │   ├── index.ts
│   │   ├── hooks.ts
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       ├── cartSlice.ts
│   │       └── uiSlice.ts
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   ├── product.types.ts
│   │   ├── category.types.ts
│   │   ├── order.types.ts
│   │   └── shift.types.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── constants.ts
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx
├── .env
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## ⚙️ ملفات الإعداد

### 1. tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        success: {
          50: "#ecfdf5",
          500: "#10b981",
          600: "#059669",
        },
        warning: {
          50: "#fffbeb",
          500: "#f59e0b",
          600: "#d97706",
        },
        danger: {
          50: "#fef2f2",
          500: "#ef4444",
          600: "#dc2626",
        },
      },
      fontFamily: {
        arabic: ["Cairo", "sans-serif"],
      },
    },
  },
  plugins: [],
};
```

### 2. src/styles/globals.css

```css
@import url("https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ===== Base Styles ===== */
* {
  font-family: "Cairo", sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  direction: rtl;
}

body {
  @apply bg-gray-50 text-gray-900;
}

/* ===== Scrollbar ===== */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400;
}

/* ===== Components ===== */
@layer components {
  /* Buttons */
  .btn {
    @apply inline-flex items-center justify-center gap-2 font-medium rounded-lg 
           transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
           disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-primary {
    @apply btn bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500;
  }

  .btn-secondary {
    @apply btn bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500;
  }

  .btn-success {
    @apply btn bg-success-500 hover:bg-success-600 text-white focus:ring-success-500;
  }

  .btn-danger {
    @apply btn bg-danger-500 hover:bg-danger-600 text-white focus:ring-danger-500;
  }

  .btn-outline {
    @apply btn border-2 border-gray-300 hover:bg-gray-100 text-gray-700;
  }

  .btn-ghost {
    @apply btn hover:bg-gray-100 text-gray-700;
  }

  /* Button Sizes */
  .btn-sm {
    @apply px-3 py-1.5 text-sm;
  }

  .btn-md {
    @apply px-4 py-2 text-base;
  }

  .btn-lg {
    @apply px-6 py-3 text-lg;
  }

  .btn-xl {
    @apply px-8 py-4 text-xl;
  }

  /* Inputs */
  .input {
    @apply w-full px-4 py-2.5 border border-gray-300 rounded-lg
           focus:ring-2 focus:ring-primary-500 focus:border-transparent
           outline-none transition-all duration-200
           placeholder:text-gray-400;
  }

  .input-error {
    @apply input border-danger-500 focus:ring-danger-500;
  }

  .input-label {
    @apply block text-sm font-medium text-gray-700 mb-1.5;
  }

  .input-hint {
    @apply mt-1 text-sm text-gray-500;
  }

  .input-error-message {
    @apply mt-1 text-sm text-danger-500;
  }

  /* Cards */
  .card {
    @apply bg-white rounded-xl shadow-sm border border-gray-100;
  }

  .card-hover {
    @apply card hover:shadow-md hover:border-primary-200 transition-all duration-200 cursor-pointer;
  }

  /* Badges */
  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }

  .badge-primary {
    @apply badge bg-primary-100 text-primary-800;
  }

  .badge-success {
    @apply badge bg-success-50 text-success-500;
  }

  .badge-warning {
    @apply badge bg-warning-50 text-warning-500;
  }

  .badge-danger {
    @apply badge bg-danger-50 text-danger-500;
  }

  .badge-gray {
    @apply badge bg-gray-100 text-gray-600;
  }

  /* Modal */
  .modal-overlay {
    @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50;
  }

  .modal-content {
    @apply bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-auto;
  }

  /* Tables */
  .table-container {
    @apply overflow-x-auto rounded-xl border border-gray-200;
  }

  .table {
    @apply w-full text-sm;
  }

  .table th {
    @apply bg-gray-50 px-4 py-3 text-right font-semibold text-gray-600 border-b;
  }

  .table td {
    @apply px-4 py-3 border-b border-gray-100;
  }

  .table tr:hover {
    @apply bg-gray-50;
  }
}

/* ===== Animations ===== */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

/* ===== POS Specific ===== */
.pos-container {
  @apply h-screen flex overflow-hidden;
}

.pos-products {
  @apply flex-1 flex flex-col bg-gray-50 p-4 overflow-hidden;
}

.pos-cart {
  @apply w-96 bg-white border-r border-gray-200 p-4 flex flex-col;
}

.product-grid {
  @apply grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3;
}

.category-tabs {
  @apply flex gap-2 overflow-x-auto pb-2;
}

.category-tab {
  @apply px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
         transition-all duration-200;
}

.category-tab-active {
  @apply category-tab bg-primary-600 text-white;
}

.category-tab-inactive {
  @apply category-tab bg-white text-gray-600 hover:bg-gray-100 border border-gray-200;
}
```

### 3. .env

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=KasserPro
```

### 4. vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```

### 5. tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 6. index.html

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>KasserPro - نظام نقاط البيع</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 🎨 نظام الألوان والتصميم

### الألوان الرئيسية

| اللون      | الاستخدام                 | الكود     |
| ---------- | ------------------------- | --------- |
| 🔵 Primary | الأزرار الرئيسية، الروابط | `#2563eb` |
| 🟢 Success | النجاح، الإكمال           | `#10b981` |
| 🟡 Warning | التحذيرات                 | `#f59e0b` |
| 🔴 Danger  | الأخطاء، الحذف            | `#ef4444` |
| ⚪ Gray    | الخلفيات، النصوص          | `#6b7280` |

### أحجام الخطوط

```css
text-xs    /* 12px - تفاصيل صغيرة */
text-sm    /* 14px - نص ثانوي */
text-base  /* 16px - نص عادي */
text-lg    /* 18px - عناوين فرعية */
text-xl    /* 20px - عناوين */
text-2xl   /* 24px - عناوين كبيرة */
text-3xl   /* 30px - عناوين رئيسية */
```

### الظلال

```css
shadow-sm   /* ظل خفيف للبطاقات */
shadow      /* ظل متوسط */
shadow-md   /* ظل للعناصر المرفوعة */
shadow-lg   /* ظل للنوافذ المنبثقة */
shadow-xl   /* ظل للموديلات */
```

### الحواف

```css
rounded       /* 4px */
rounded-md    /* 6px */
rounded-lg    /* 8px */
rounded-xl    /* 12px */
rounded-2xl   /* 16px */
rounded-full  /* دائري */
```

---

## 🧩 المكونات الأساسية

### 1. src/components/common/Button.tsx

```tsx
import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "outline"
    | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export const Button = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    success: "btn-success",
    danger: "btn-danger",
    outline: "btn-outline",
    ghost: "btn-ghost",
  };

  const sizes = {
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
    xl: "btn-xl",
  };

  return (
    <button
      className={clsx(variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>جاري التحميل...</span>
        </>
      ) : (
        <>
          {rightIcon && <span>{rightIcon}</span>}
          {children}
          {leftIcon && <span>{leftIcon}</span>}
        </>
      )}
    </button>
  );
};
```

### 2. src/components/common/Input.tsx

```tsx
import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="input-label">{label}</label>}
        <input
          ref={ref}
          className={clsx(error ? "input-error" : "input", className)}
          {...props}
        />
        {hint && !error && <p className="input-hint">{hint}</p>}
        {error && <p className="input-error-message">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
```

### 3. src/components/common/Modal.tsx

```tsx
import { ReactNode, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  children: ReactNode;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  size = "md",
  children,
}: ModalProps) => {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  };

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className={clsx(
          "modal-content w-full mx-4 animate-slide-up",
          sizes[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
```

### 4. src/components/common/Loading.tsx

```tsx
export const Loading = () => (
  <div className="flex items-center justify-center h-full">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-gray-500">جاري التحميل...</p>
    </div>
  </div>
);

export const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
    <Loading />
  </div>
);

export const LoadingSpinner = ({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={clsx(
        sizes[size],
        "border-primary-200 border-t-primary-600 rounded-full animate-spin"
      )}
    />
  );
};
```

### 5. src/components/common/Card.tsx

```tsx
import { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

export const Card = ({
  children,
  className,
  hover = false,
  padding = "md",
  onClick,
}: CardProps) => {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={clsx(
        hover ? "card-hover" : "card",
        paddings[padding],
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
```

### 6. src/components/pos/ProductCard.tsx

```tsx
import { Product } from "@/types/product.types";
import { formatCurrency } from "@/utils/formatters";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export const ProductCard = ({ product, onAdd }: ProductCardProps) => {
  return (
    <button
      onClick={() => onAdd(product)}
      className="card-hover p-3 text-right w-full"
      disabled={!product.isActive}
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl">{product.imageUrl || "📦"}</span>
        )}
      </div>

      {/* Name */}
      <h3 className="font-semibold text-gray-800 truncate mb-1">
        {product.name}
      </h3>

      {/* Price */}
      <p className="text-primary-600 font-bold text-lg">
        {formatCurrency(product.price)}
      </p>

      {/* Out of stock */}
      {!product.isActive && (
        <span className="badge-danger mt-2">غير متوفر</span>
      )}
    </button>
  );
};
```

### 7. src/components/pos/CategoryTabs.tsx

```tsx
import { Category } from "@/types/category.types";
import clsx from "clsx";

interface CategoryTabsProps {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export const CategoryTabs = ({
  categories,
  selectedId,
  onSelect,
}: CategoryTabsProps) => {
  return (
    <div className="category-tabs">
      {/* All */}
      <button
        onClick={() => onSelect(null)}
        className={clsx(
          selectedId === null ? "category-tab-active" : "category-tab-inactive"
        )}
      >
        🏪 الكل
      </button>

      {/* Categories */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={clsx(
            selectedId === category.id
              ? "category-tab-active"
              : "category-tab-inactive"
          )}
        >
          {category.imageUrl} {category.name}
        </button>
      ))}
    </div>
  );
};
```

### 8. src/components/pos/Cart.tsx

```tsx
import { useCart } from "@/hooks/useCart";
import { CartItem } from "./CartItem";
import { Button } from "../common/Button";
import { formatCurrency } from "@/utils/formatters";
import { ShoppingCartIcon, TrashIcon } from "@heroicons/react/24/outline";

interface CartProps {
  onCheckout: () => void;
}

export const Cart = ({ onCheckout }: CartProps) => {
  const { items, subtotal, taxAmount, total, clearCart } = useCart();

  // Empty State
  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <ShoppingCartIcon className="w-20 h-20 mb-4" />
        <p className="text-lg font-medium">السلة فارغة</p>
        <p className="text-sm">اضغط على المنتجات لإضافتها</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-lg font-bold">
          الطلب الحالي
          <span className="text-primary-600 mr-2">({items.length})</span>
        </h2>
        <button
          onClick={clearCart}
          className="flex items-center gap-1 text-danger-500 text-sm hover:underline"
        >
          <TrashIcon className="w-4 h-4" />
          إفراغ
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {items.map((item) => (
          <CartItem key={item.product.id} item={item} />
        ))}
      </div>

      {/* Summary */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>المجموع الفرعي</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>الضريبة (15%)</span>
          <span>{formatCurrency(taxAmount)}</span>
        </div>
        <div className="flex justify-between text-xl font-bold pt-2 border-t">
          <span>الإجمالي</span>
          <span className="text-primary-600">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <Button
        variant="success"
        size="xl"
        className="w-full mt-4"
        onClick={onCheckout}
      >
        💳 الدفع - {formatCurrency(total)}
      </Button>
    </div>
  );
};
```

### 9. src/components/pos/CartItem.tsx

```tsx
import { CartItem as CartItemType } from "@/store/slices/cartSlice";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/formatters";
import { PlusIcon, MinusIcon, TrashIcon } from "@heroicons/react/24/outline";

interface CartItemProps {
  item: CartItemType;
}

export const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;
  const total = product.price * quantity;

  return (
    <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
      {/* Image */}
      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shrink-0">
        <span className="text-2xl">{product.imageUrl || "📦"}</span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-800 truncate">{product.name}</h4>
        <p className="text-sm text-gray-500">{formatCurrency(product.price)}</p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQuantity(product.id, quantity - 1)}
            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border hover:bg-gray-100"
          >
            {quantity === 1 ? (
              <TrashIcon className="w-4 h-4 text-danger-500" />
            ) : (
              <MinusIcon className="w-4 h-4" />
            )}
          </button>

          <span className="w-8 text-center font-bold">{quantity}</span>

          <button
            onClick={() => updateQuantity(product.id, quantity + 1)}
            className="w-8 h-8 flex items-center justify-center bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="text-left">
        <p className="font-bold text-primary-600">{formatCurrency(total)}</p>
        <button
          onClick={() => removeItem(product.id)}
          className="text-danger-500 text-sm hover:underline mt-1"
        >
          حذف
        </button>
      </div>
    </div>
  );
};
```

### 10. src/components/pos/PaymentModal.tsx

```tsx
import { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/formatters";
import { BanknotesIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (paymentMethod: string, amountPaid: number) => void;
  isLoading?: boolean;
}

type PaymentMethod = "Cash" | "Card" | "Mada";

export const PaymentModal = ({
  isOpen,
  onClose,
  onComplete,
  isLoading,
}: PaymentModalProps) => {
  const { total } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [amountPaid, setAmountPaid] = useState(total.toString());

  const change = Number(amountPaid) - total;

  const handleSubmit = () => {
    onComplete(paymentMethod, Number(amountPaid));
  };

  const quickAmounts = [50, 100, 200, 500];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="الدفع" size="md">
      {/* Total */}
      <div className="text-center mb-6 pb-6 border-b">
        <p className="text-gray-500 mb-1">المبلغ المطلوب</p>
        <p className="text-4xl font-bold text-primary-600">
          {formatCurrency(total)}
        </p>
      </div>

      {/* Payment Methods */}
      <div className="mb-6">
        <label className="input-label mb-3">طريقة الدفع</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "Cash", label: "نقدي", icon: BanknotesIcon },
            { id: "Card", label: "بطاقة", icon: CreditCardIcon },
            { id: "Mada", label: "مدى", icon: CreditCardIcon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setPaymentMethod(id as PaymentMethod)}
              className={clsx(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                paymentMethod === id
                  ? "border-primary-600 bg-primary-50 text-primary-600"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <Icon className="w-8 h-8" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Amount Paid (Cash only) */}
      {paymentMethod === "Cash" && (
        <div className="mb-6">
          <Input
            label="المبلغ المدفوع"
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            min={total}
          />

          {/* Quick Amounts */}
          <div className="flex gap-2 mt-3">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setAmountPaid(amount.toString())}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                {amount}
              </button>
            ))}
          </div>

          {/* Change */}
          {change > 0 && (
            <div className="mt-4 p-4 bg-success-50 rounded-xl text-center">
              <p className="text-success-500 text-sm">الباقي</p>
              <p className="text-2xl font-bold text-success-500">
                {formatCurrency(change)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={onClose}
        >
          إلغاء
        </Button>
        <Button
          variant="success"
          size="lg"
          className="flex-1"
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={paymentMethod === "Cash" && Number(amountPaid) < total}
        >
          ✅ تأكيد الدفع
        </Button>
      </div>
    </Modal>
  );
};
```

---

## 📄 الصفحات

### 1. src/pages/auth/LoginPage.tsx

```tsx
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";

export const LoginPage = () => {
  const [email, setEmail] = useState("admin@kasserpro.com");
  const [password, setPassword] = useState("Admin@123");
  const { login, isLoggingIn } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🏪</span>
          </div>
          <h1 className="text-3xl font-bold text-primary-600">KasserPro</h1>
          <p className="text-gray-500 mt-2">نظام نقاط البيع</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="أدخل بريدك الإلكتروني"
            required
          />

          <Input
            label="كلمة المرور"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="أدخل كلمة المرور"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="xl"
            className="w-full"
            isLoading={isLoggingIn}
          >
            تسجيل الدخول
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm">
          <p className="font-medium text-gray-700 mb-2">بيانات تجريبية:</p>
          <p className="text-gray-600">
            <span className="font-medium">المدير:</span> admin@kasserpro.com /
            Admin@123
          </p>
          <p className="text-gray-600">
            <span className="font-medium">الكاشير:</span> ahmed@kasserpro.com /
            123456
          </p>
        </div>
      </div>
    </div>
  );
};
```

### 2. src/pages/pos/POSPage.tsx

```tsx
import { useState } from "react";
import { useGetProductsQuery } from "@/api/productsApi";
import { useGetCategoriesQuery } from "@/api/categoriesApi";
import { useCart } from "@/hooks/useCart";
import { CategoryTabs } from "@/components/pos/CategoryTabs";
import { ProductCard } from "@/components/pos/ProductCard";
import { Cart } from "@/components/pos/Cart";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { Loading } from "@/components/common/Loading";
import { Product } from "@/types/product.types";

export const POSPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const { data: productsData, isLoading: productsLoading } =
    useGetProductsQuery();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategoriesQuery();
  const { addItem } = useCart();

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];

  // Filter products
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  const handleAddProduct = (product: Product) => {
    addItem(product);
  };

  const handlePaymentComplete = (paymentMethod: string, amountPaid: number) => {
    // TODO: Create order
    console.log("Payment:", { paymentMethod, amountPaid });
    setShowPayment(false);
  };

  if (productsLoading || categoriesLoading) {
    return <Loading />;
  }

  return (
    <div className="pos-container">
      {/* Products Section */}
      <div className="pos-products">
        {/* Categories */}
        <CategoryTabs
          categories={categories}
          selectedId={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto mt-4 pr-2">
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={handleAddProduct}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">لا توجد منتجات في هذا التصنيف</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="pos-cart">
        <Cart onCheckout={() => setShowPayment(true)} />
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onComplete={handlePaymentComplete}
      />
    </div>
  );
};
```

---

## 🔧 Utils

### src/utils/formatters.ts

```typescript
// تنسيق العملة
export const formatCurrency = (amount: number, currency = "SAR"): string => {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// تنسيق بسيط للريال
export const formatPrice = (amount: number): string => {
  return `${amount.toFixed(2)} ر.س`;
};

// تنسيق التاريخ
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

// تنسيق التاريخ والوقت
export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

// تنسيق الوقت فقط
export const formatTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

// تنسيق الأرقام
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("ar-SA").format(num);
};
```

### src/utils/constants.ts

```typescript
// نسبة الضريبة
export const TAX_RATE = 15;

// حالات الطلب
export const ORDER_STATUS = {
  Draft: { label: "مسودة", color: "gray" },
  Pending: { label: "في الانتظار", color: "warning" },
  Completed: { label: "مكتمل", color: "success" },
  Cancelled: { label: "ملغي", color: "danger" },
  Refunded: { label: "مسترجع", color: "danger" },
} as const;

// طرق الدفع
export const PAYMENT_METHODS = {
  Cash: { label: "نقدي", icon: "💵" },
  Card: { label: "بطاقة", icon: "💳" },
  Mada: { label: "مدى", icon: "💳" },
} as const;

// صلاحيات المستخدمين
export const USER_ROLES = {
  Admin: { label: "مدير", color: "primary" },
  Cashier: { label: "كاشير", color: "gray" },
} as const;

// رسائل الأخطاء
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "حدث خطأ في الاتصال بالخادم",
  UNAUTHORIZED: "غير مصرح لك بالوصول",
  NOT_FOUND: "العنصر غير موجود",
  SERVER_ERROR: "حدث خطأ في الخادم",
  VALIDATION_ERROR: "يرجى التحقق من البيانات المدخلة",
} as const;
```

---

## 🚀 التشغيل

```powershell
# تشغيل الـ Backend أولاً
cd src/KasserPro.API
dotnet run --urls "http://localhost:5000"

# في Terminal جديد - تشغيل الـ Frontend
cd kasserpro-frontend
npm run dev
```

**روابط التشغيل:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Swagger: http://localhost:5000/swagger

---

## 📝 ملاحظات مهمة

1. **الـ RTL**: المشروع مُعد للغة العربية (من اليمين لليسار)
2. **الخطوط**: استخدم خط Cairo للنصوص العربية
3. **الألوان**: استخدم الألوان المحددة في tailwind.config.js
4. **الـ Components**: استخدم المكونات الجاهزة بدلاً من إنشاء جديدة
5. **الـ Types**: تأكد من استخدام TypeScript لكل الملفات

---

## ✅ قائمة التحقق للمرحلة الأولى

- [ ] إنشاء المشروع بـ Vite
- [ ] تثبيت جميع الحزم
- [ ] إعداد TailwindCSS
- [ ] إنشاء هيكل المجلدات
- [ ] إنشاء Types
- [ ] إنشاء المكونات الأساسية (Button, Input, Modal, Card)
- [ ] إنشاء صفحة Login
- [ ] إنشاء صفحة POS
- [ ] ربط الـ API
- [ ] اختبار كامل

---

**🎉 بالتوفيق في التطوير!**
