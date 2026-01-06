# ⚛️ Frontend Development Guide - KasserPro MVP

## دليل تطوير الـ Frontend باستخدام React + TypeScript

> **الهدف:** بناء واجهة POS احترافية وسريعة وسهلة الصيانة
>
> **التقنيات:** React 18, TypeScript, Vite, TailwindCSS, Redux Toolkit + RTK Query
>
> **المبادئ:** Component-Based, Type Safety, Centralized State

---

## 📑 جدول المحتويات

1. [هيكل المشروع](#-هيكل-المشروع-project-structure)
2. [إعداد المشروع](#-إعداد-المشروع-project-setup)
3. [المكونات الأساسية](#-المكونات-الأساسية-core-components)
4. [إدارة الحالة](#-إدارة-الحالة-state-management)
5. [التواصل مع API](#-التواصل-مع-api)
6. [الصفحات المطلوبة](#-الصفحات-المطلوبة-للـ-mvp)
7. [أفضل الممارسات](#-أفضل-الممارسات-best-practices)
8. [خطوات التنفيذ](#-خطوات-التنفيذ-step-by-step)

---

## 📁 هيكل المشروع (Project Structure)

```
kasserpro-frontend/
├── 📁 public/
│   ├── favicon.ico
│   └── logo.svg
│
├── 📁 src/
│   ├── 📁 api/                    # 🔌 RTK Query API
│   │   ├── baseApi.ts            # Base API with createApi
│   │   ├── authApi.ts            # Auth endpoints
│   │   ├── productsApi.ts        # Products CRUD
│   │   ├── categoriesApi.ts      # Categories CRUD
│   │   ├── ordersApi.ts          # Orders endpoints
│   │   └── shiftsApi.ts          # Shifts endpoints
│   │
│   ├── 📁 components/             # 🧩 Reusable Components
│   │   ├── 📁 common/            # مكونات عامة
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Alert.tsx
│   │   │   └── Card.tsx
│   │   ├── 📁 layout/            # مكونات التخطيط
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── AuthLayout.tsx
│   │   └── 📁 pos/               # مكونات الكاشير
│   │       ├── ProductCard.tsx
│   │       ├── ProductGrid.tsx
│   │       ├── CategoryTabs.tsx
│   │       ├── Cart.tsx
│   │       ├── CartItem.tsx
│   │       ├── OrderSummary.tsx
│   │       ├── PaymentModal.tsx
│   │       └── ReceiptModal.tsx
│   │
│   ├── 📁 hooks/                  # 🪝 Custom Hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   ├── useProducts.ts
│   │   ├── useOrders.ts
│   │   ├── useShift.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── 📁 pages/                  # 📄 Pages
│   │   ├── 📁 auth/
│   │   │   └── LoginPage.tsx
│   │   ├── 📁 pos/
│   │   │   └── POSPage.tsx
│   │   ├── 📁 products/
│   │   │   ├── ProductsPage.tsx
│   │   │   └── ProductFormPage.tsx
│   │   ├── 📁 categories/
│   │   │   └── CategoriesPage.tsx
│   │   ├── 📁 orders/
│   │   │   ├── OrdersPage.tsx
│   │   │   └── OrderDetailsPage.tsx
│   │   ├── 📁 shifts/
│   │   │   └── ShiftPage.tsx
│   │   ├── 📁 reports/
│   │   │   └── DailyReportPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── 📁 store/                  # 🗃️ Redux Store
│   │   ├── index.ts              # Store configuration
│   │   ├── hooks.ts              # Typed hooks (useAppDispatch, useAppSelector)
│   │   └── slices/
│   │       ├── authSlice.ts      # Auth state & reducers
│   │       ├── cartSlice.ts      # Cart state & reducers
│   │       └── uiSlice.ts        # UI state (modals, etc.)
│   │
│   ├── 📁 types/                  # 📝 TypeScript Types
│   │   ├── api.types.ts          # API response types
│   │   ├── auth.types.ts
│   │   ├── product.types.ts
│   │   ├── order.types.ts
│   │   ├── category.types.ts
│   │   └── shift.types.ts
│   │
│   ├── 📁 utils/                  # 🔧 Utilities
│   │   ├── formatters.ts         # تنسيق الأرقام والتواريخ
│   │   ├── validators.ts         # التحقق من البيانات
│   │   ├── constants.ts          # الثوابت
│   │   └── helpers.ts            # دوال مساعدة
│   │
│   ├── 📁 styles/                 # 🎨 Styles
│   │   └── globals.css
│   │
│   ├── App.tsx                   # Main App component
│   ├── main.tsx                  # Entry point
│   ├── router.tsx                # React Router setup
│   └── vite-env.d.ts
│
├── .env                          # Environment variables
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

---

## 🚀 إعداد المشروع (Project Setup)

### الخطوة 1: إنشاء المشروع

```powershell
# إنشاء مشروع React + TypeScript + Vite
npm create vite@latest kasserpro-frontend -- --template react-ts

# الدخول للمجلد
cd kasserpro-frontend

# تثبيت الحزم الأساسية
npm install
```

### الخطوة 2: تثبيت الحزم المطلوبة

```powershell
# UI & Styling
npm install tailwindcss postcss autoprefixer
npm install @headlessui/react @heroicons/react
npm install clsx tailwind-merge

# State Management & Data Fetching (Redux Toolkit + RTK Query)
npm install @reduxjs/toolkit react-redux

# Routing
npm install react-router-dom

# Forms & Validation
npm install react-hook-form
npm install zod @hookform/resolvers

# Utilities
npm install date-fns
npm install react-hot-toast

# Dev Dependencies
npm install -D @types/node
```

### الخطوة 3: إعداد TailwindCSS

```powershell
# إنشاء ملفات Tailwind
npx tailwindcss init -p
```

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        arabic: ["Cairo", "sans-serif"],
      },
    },
  },
  plugins: [],
};
```

```css
/* src/styles/globals.css */
@import url("https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  font-family: "Cairo", sans-serif;
}

/* RTL Support */
[dir="rtl"] {
  text-align: right;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

/* POS specific styles */
@layer components {
  .btn-primary {
    @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors;
  }

  .btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors;
  }

  .btn-danger {
    @apply bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors;
  }

  .card {
    @apply bg-white rounded-xl shadow-sm border border-gray-100 p-4;
  }

  .input {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none;
  }
}
```

### الخطوة 4: Environment Variables

```env
# .env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=KasserPro
```

```env
# .env.example
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=KasserPro
```

---

## 📝 Types (TypeScript Interfaces)

```typescript
// src/types/api.types.ts
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
}
```

```typescript
// src/types/auth.types.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Cashier";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  user: User;
}
```

```typescript
// src/types/product.types.ts
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
```

```typescript
// src/types/category.types.ts
export interface Category {
  id: number;
  name: string;
  nameEn?: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  productsCount?: number;
}
```

```typescript
// src/types/order.types.ts
export type OrderStatus =
  | "Draft"
  | "Pending"
  | "Completed"
  | "Cancelled"
  | "Refunded";
export type PaymentMethod = "Cash" | "Card" | "Mada";

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  notes?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  changeAmount: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  items: OrderItem[];
  payments: Payment[];
  createdAt: string;
  completedAt?: string;
}

export interface Payment {
  id: number;
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

export interface CreateOrderRequest {
  items: {
    productId: number;
    quantity: number;
    notes?: string;
  }[];
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export interface CompleteOrderRequest {
  payments: {
    method: PaymentMethod;
    amount: number;
    reference?: string;
  }[];
}
```

```typescript
// src/types/shift.types.ts
export interface Shift {
  id: number;
  openingBalance: number;
  closingBalance: number;
  expectedBalance: number;
  difference: number;
  openedAt: string;
  closedAt?: string;
  isClosed: boolean;
  notes?: string;
  totalCash: number;
  totalCard: number;
  totalOrders: number;
  userId: number;
  userName?: string;
}

export interface OpenShiftRequest {
  openingBalance: number;
}

export interface CloseShiftRequest {
  closingBalance: number;
  notes?: string;
}
```

---

## 🔌 التواصل مع API (RTK Query)

### Base API Setup

```typescript
// src/api/baseApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

const API_URL = import.meta.env.VITE_API_URL;

// Base query with auth header
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Base query with re-auth logic
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // Token expired - logout
    api.dispatch({ type: "auth/logout" });
    window.location.href = "/login";
  }

  return result;
};

// Create the base API
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Products", "Categories", "Orders", "Shifts", "User"],
  endpoints: () => ({}),
});
```

### Auth API

```typescript
// src/api/authApi.ts
import { baseApi } from "./baseApi";
import { LoginRequest, LoginResponse, User } from "../types/auth.types";
import { ApiResponse } from "../types/api.types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // تسجيل الدخول
    login: builder.mutation<ApiResponse<LoginResponse>, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    // الحصول على بيانات المستخدم
    getMe: builder.query<ApiResponse<User>, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),

    // تسجيل مستخدم جديد
    register: builder.mutation<
      ApiResponse<User>,
      { name: string; email: string; password: string; role?: string }
    >({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

// تصدير الـ hooks التي تُنشأ تلقائياً
export const { useLoginMutation, useGetMeQuery, useRegisterMutation } = authApi;
```

### Products API

```typescript
// src/api/productsApi.ts
import { baseApi } from "./baseApi";
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "../types/product.types";
import { ApiResponse } from "../types/api.types";

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // جلب كل المنتجات
    getProducts: builder.query<ApiResponse<Product[]>, void>({
      query: () => "/products",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Products" as const,
                id,
              })),
              { type: "Products", id: "LIST" },
            ]
          : [{ type: "Products", id: "LIST" }],
    }),

    // جلب منتج واحد
    getProduct: builder.query<ApiResponse<Product>, number>({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Products", id }],
    }),

    // جلب منتجات حسب التصنيف
    getProductsByCategory: builder.query<ApiResponse<Product[]>, number>({
      query: (categoryId) => `/products?categoryId=${categoryId}`,
      providesTags: [{ type: "Products", id: "LIST" }],
    }),

    // إضافة منتج
    createProduct: builder.mutation<ApiResponse<Product>, CreateProductRequest>(
      {
        query: (product) => ({
          url: "/products",
          method: "POST",
          body: product,
        }),
        invalidatesTags: [{ type: "Products", id: "LIST" }],
      }
    ),

    // تحديث منتج
    updateProduct: builder.mutation<
      ApiResponse<Product>,
      { id: number; data: UpdateProductRequest }
    >({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Products", id },
        { type: "Products", id: "LIST" },
      ],
    }),

    // حذف منتج
    deleteProduct: builder.mutation<ApiResponse<boolean>, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetProductsByCategoryQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
```

### Categories API

```typescript
// src/api/categoriesApi.ts
import { baseApi } from "./baseApi";
import { Category } from "../types/category.types";
import { ApiResponse } from "../types/api.types";

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // جلب كل التصنيفات
    getCategories: builder.query<ApiResponse<Category[]>, void>({
      query: () => "/categories",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Categories" as const,
                id,
              })),
              { type: "Categories", id: "LIST" },
            ]
          : [{ type: "Categories", id: "LIST" }],
    }),

    // إضافة تصنيف
    createCategory: builder.mutation<
      ApiResponse<Category>,
      { name: string; nameEn?: string; description?: string }
    >({
      query: (category) => ({
        url: "/categories",
        method: "POST",
        body: category,
      }),
      invalidatesTags: [{ type: "Categories", id: "LIST" }],
    }),

    // تحديث تصنيف
    updateCategory: builder.mutation<
      ApiResponse<Category>,
      { id: number; data: Partial<Category> }
    >({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Categories", id },
        { type: "Categories", id: "LIST" },
      ],
    }),

    // حذف تصنيف
    deleteCategory: builder.mutation<ApiResponse<boolean>, number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Categories", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
```

### Orders API

```typescript
// src/api/ordersApi.ts
import { baseApi } from "./baseApi";
import {
  Order,
  CreateOrderRequest,
  CompleteOrderRequest,
} from "../types/order.types";
import { ApiResponse } from "../types/api.types";

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // جلب كل الطلبات
    getOrders: builder.query<ApiResponse<Order[]>, void>({
      query: () => "/orders",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Orders" as const,
                id,
              })),
              { type: "Orders", id: "LIST" },
            ]
          : [{ type: "Orders", id: "LIST" }],
    }),

    // جلب طلب واحد
    getOrder: builder.query<ApiResponse<Order>, number>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: "Orders", id }],
    }),

    // إنشاء طلب جديد
    createOrder: builder.mutation<ApiResponse<Order>, CreateOrderRequest>({
      query: (order) => ({
        url: "/orders",
        method: "POST",
        body: order,
      }),
      invalidatesTags: [{ type: "Orders", id: "LIST" }, "Shifts"],
    }),

    // إضافة عنصر للطلب
    addOrderItem: builder.mutation<
      ApiResponse<Order>,
      {
        orderId: number;
        item: { productId: number; quantity: number; notes?: string };
      }
    >({
      query: ({ orderId, item }) => ({
        url: `/orders/${orderId}/items`,
        method: "POST",
        body: item,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Orders", id: orderId },
      ],
    }),

    // حذف عنصر من الطلب
    removeOrderItem: builder.mutation<
      ApiResponse<Order>,
      { orderId: number; itemId: number }
    >({
      query: ({ orderId, itemId }) => ({
        url: `/orders/${orderId}/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Orders", id: orderId },
      ],
    }),

    // إكمال الطلب
    completeOrder: builder.mutation<
      ApiResponse<Order>,
      { orderId: number; data: CompleteOrderRequest }
    >({
      query: ({ orderId, data }) => ({
        url: `/orders/${orderId}/complete`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Orders", id: orderId },
        { type: "Orders", id: "LIST" },
        "Shifts",
      ],
    }),

    // إلغاء الطلب
    cancelOrder: builder.mutation<
      ApiResponse<boolean>,
      { orderId: number; reason?: string }
    >({
      query: ({ orderId, reason }) => ({
        url: `/orders/${orderId}/cancel`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Orders", id: orderId },
        { type: "Orders", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useAddOrderItemMutation,
  useRemoveOrderItemMutation,
  useCompleteOrderMutation,
  useCancelOrderMutation,
} = ordersApi;
```

### Shifts API

```typescript
// src/api/shiftsApi.ts
import { baseApi } from "./baseApi";
import {
  Shift,
  OpenShiftRequest,
  CloseShiftRequest,
} from "../types/shift.types";
import { ApiResponse } from "../types/api.types";

export const shiftsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // جلب الوردية الحالية
    getCurrentShift: builder.query<ApiResponse<Shift>, void>({
      query: () => "/shifts/current",
      providesTags: [{ type: "Shifts", id: "CURRENT" }],
    }),

    // جلب كل الورديات
    getShifts: builder.query<ApiResponse<Shift[]>, void>({
      query: () => "/shifts",
      providesTags: ["Shifts"],
    }),

    // فتح وردية
    openShift: builder.mutation<ApiResponse<Shift>, OpenShiftRequest>({
      query: (data) => ({
        url: "/shifts/open",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Shifts"],
    }),

    // إغلاق وردية
    closeShift: builder.mutation<ApiResponse<Shift>, CloseShiftRequest>({
      query: (data) => ({
        url: "/shifts/close",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Shifts"],
    }),
  }),
});

export const {
  useGetCurrentShiftQuery,
  useGetShiftsQuery,
  useOpenShiftMutation,
  useCloseShiftMutation,
} = shiftsApi;
```

---

## 🗃️ إدارة الحالة (Redux Toolkit)

### Store Configuration

```typescript
// src/store/index.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

// API
import { baseApi } from "../api/baseApi";

// Slices
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import uiReducer from "./slices/uiSlice";

// Persist config for auth
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["token", "user", "isAuthenticated"],
};

// Root reducer
const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: persistReducer(authPersistConfig, authReducer),
  cart: cartReducer,
  ui: uiReducer,
});

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
});

// Persistor
export const persistor = persistStore(store);

// Setup listeners for refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Typed Hooks

```typescript
// src/store/hooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./index";

// استخدم هذه الـ hooks بدلاً من useDispatch و useSelector العادية
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### Auth Slice

```typescript
// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types/auth.types";
import { authApi } from "../../api/authApi";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // تعيين بيانات المصادقة
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },

    // تسجيل الخروج
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    },

    // تحديث بيانات المستخدم
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },

  // معالجة نتائج الـ API تلقائياً
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        if (payload.success && payload.data) {
          state.token = payload.data.accessToken;
          state.user = payload.data.user;
          state.isAuthenticated = true;
        }
      }
    );
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAdmin = (state: { auth: AuthState }) =>
  state.auth.user?.role === "Admin";

export default authSlice.reducer;
```

### Cart Slice

```typescript
// src/store/slices/cartSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "../../types/product.types";

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  taxRate: number;
}

const TAX_RATE = 15; // VAT 15%

const initialState: CartState = {
  items: [],
  taxRate: TAX_RATE,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // إضافة منتج للسلة
    addItem: (
      state,
      action: PayloadAction<{ product: Product; quantity?: number }>
    ) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }
    },

    // حذف منتج من السلة
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        (item) => item.product.id !== action.payload
      );
    },

    // تحديث الكمية
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: number; quantity: number }>
    ) => {
      const { productId, quantity } = action.payload;

      if (quantity <= 0) {
        state.items = state.items.filter(
          (item) => item.product.id !== productId
        );
        return;
      }

      const item = state.items.find((item) => item.product.id === productId);
      if (item) {
        item.quantity = quantity;
      }
    },

    // تحديث الملاحظات
    updateNotes: (
      state,
      action: PayloadAction<{ productId: number; notes: string }>
    ) => {
      const { productId, notes } = action.payload;
      const item = state.items.find((item) => item.product.id === productId);
      if (item) {
        item.notes = notes;
      }
    },

    // إفراغ السلة
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, updateQuantity, updateNotes, clearCart } =
  cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectTaxRate = (state: { cart: CartState }) => state.cart.taxRate;

export const selectItemsCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectSubtotal = (state: { cart: CartState }) =>
  state.cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

export const selectTaxAmount = (state: { cart: CartState }) => {
  const subtotal = state.cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  return (subtotal * state.cart.taxRate) / 100;
};

export const selectTotal = (state: { cart: CartState }) => {
  const subtotal = state.cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const taxAmount = (subtotal * state.cart.taxRate) / 100;
  return subtotal + taxAmount;
};

export default cartSlice.reducer;
```

### UI Slice

```typescript
// src/store/slices/uiSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  isPaymentModalOpen: boolean;
  isReceiptModalOpen: boolean;
  isSidebarOpen: boolean;
  currentOrderId: number | null;
}

const initialState: UiState = {
  isPaymentModalOpen: false,
  isReceiptModalOpen: false,
  isSidebarOpen: true,
  currentOrderId: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openPaymentModal: (state) => {
      state.isPaymentModalOpen = true;
    },
    closePaymentModal: (state) => {
      state.isPaymentModalOpen = false;
    },
    openReceiptModal: (state, action: PayloadAction<number>) => {
      state.isReceiptModalOpen = true;
      state.currentOrderId = action.payload;
    },
    closeReceiptModal: (state) => {
      state.isReceiptModalOpen = false;
      state.currentOrderId = null;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
  },
});

export const {
  openPaymentModal,
  closePaymentModal,
  openReceiptModal,
  closeReceiptModal,
  toggleSidebar,
} = uiSlice.actions;

// Selectors
export const selectIsPaymentModalOpen = (state: { ui: UiState }) =>
  state.ui.isPaymentModalOpen;
export const selectIsReceiptModalOpen = (state: { ui: UiState }) =>
  state.ui.isReceiptModalOpen;
export const selectIsSidebarOpen = (state: { ui: UiState }) =>
  state.ui.isSidebarOpen;
export const selectCurrentOrderId = (state: { ui: UiState }) =>
  state.ui.currentOrderId;

export default uiSlice.reducer;
```

---

## 🪝 Custom Hooks

```typescript
// src/hooks/useAuth.ts
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useLoginMutation } from "../api/authApi";
import {
  logout as logoutAction,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
} from "../store/slices/authSlice";
import { baseApi } from "../api/baseApi";
import { LoginRequest } from "../types/auth.types";
import toast from "react-hot-toast";

export const useAuth = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Selectors
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);

  // RTK Query mutation
  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();

  // Login function
  const login = async (credentials: LoginRequest) => {
    try {
      const result = await loginMutation(credentials).unwrap();

      if (result.success) {
        toast.success("تم تسجيل الدخول بنجاح");
        navigate("/pos");
      } else {
        toast.error(result.message || "فشل تسجيل الدخول");
      }
    } catch (error) {
      toast.error("حدث خطأ في تسجيل الدخول");
    }
  };

  // Logout function
  const logout = () => {
    dispatch(logoutAction());
    dispatch(baseApi.util.resetApiState()); // Reset all cached data
    navigate("/login");
    toast.success("تم تسجيل الخروج");
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    isLoggingIn,
    logout,
  };
};
```

```typescript
// src/hooks/useProducts.ts
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "../api/productsApi";
import {
  CreateProductRequest,
  UpdateProductRequest,
} from "../types/product.types";
import toast from "react-hot-toast";

export const useProducts = () => {
  // Query
  const {
    data: productsData,
    isLoading,
    isError,
    refetch,
  } = useGetProductsQuery();

  // Mutations
  const [createMutation, { isLoading: isCreating }] =
    useCreateProductMutation();
  const [updateMutation, { isLoading: isUpdating }] =
    useUpdateProductMutation();
  const [deleteMutation, { isLoading: isDeleting }] =
    useDeleteProductMutation();

  // Create product
  const createProduct = async (data: CreateProductRequest) => {
    try {
      await createMutation(data).unwrap();
      toast.success("تم إضافة المنتج بنجاح");
    } catch (error) {
      toast.error("فشل في إضافة المنتج");
    }
  };

  // Update product
  const updateProduct = async (id: number, data: UpdateProductRequest) => {
    try {
      await updateMutation({ id, data }).unwrap();
      toast.success("تم تحديث المنتج بنجاح");
    } catch (error) {
      toast.error("فشل في تحديث المنتج");
    }
  };

  // Delete product
  const deleteProduct = async (id: number) => {
    try {
      await deleteMutation(id).unwrap();
      toast.success("تم حذف المنتج بنجاح");
    } catch (error) {
      toast.error("فشل في حذف المنتج");
    }
  };

  return {
    products: productsData?.data || [],
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
```

```typescript
// src/hooks/useCategories.ts
import { useGetCategoriesQuery } from "../api/categoriesApi";

export const useCategories = () => {
  const { data: categoriesData, isLoading, isError } = useGetCategoriesQuery();

  return {
    categories: categoriesData?.data || [],
    isLoading,
    isError,
  };
};
```

```typescript
// src/hooks/useCart.ts
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addItem,
  removeItem,
  updateQuantity,
  updateNotes,
  clearCart,
  selectCartItems,
  selectItemsCount,
  selectSubtotal,
  selectTaxAmount,
  selectTotal,
} from "../store/slices/cartSlice";
import { Product } from "../types/product.types";

export const useCart = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const items = useAppSelector(selectCartItems);
  const itemsCount = useAppSelector(selectItemsCount);
  const subtotal = useAppSelector(selectSubtotal);
  const taxAmount = useAppSelector(selectTaxAmount);
  const total = useAppSelector(selectTotal);

  // Actions
  const add = (product: Product, quantity = 1) => {
    dispatch(addItem({ product, quantity }));
  };

  const remove = (productId: number) => {
    dispatch(removeItem(productId));
  };

  const setQuantity = (productId: number, quantity: number) => {
    dispatch(updateQuantity({ productId, quantity }));
  };

  const setNotes = (productId: number, notes: string) => {
    dispatch(updateNotes({ productId, notes }));
  };

  const clear = () => {
    dispatch(clearCart());
  };

  return {
    items,
    itemsCount,
    subtotal,
    taxAmount,
    total,
    addItem: add,
    removeItem: remove,
    updateQuantity: setQuantity,
    updateNotes: setNotes,
    clearCart: clear,
  };
};
```

```typescript
// src/hooks/useOrders.ts
import {
  useCreateOrderMutation,
  useCompleteOrderMutation,
} from "../api/ordersApi";
import { useCart } from "./useCart";
import { CompleteOrderRequest } from "../types/order.types";
import toast from "react-hot-toast";

export const useOrders = () => {
  const { items, clearCart } = useCart();

  // Mutations
  const [createMutation, { isLoading: isCreating }] = useCreateOrderMutation();
  const [completeMutation, { isLoading: isCompleting }] =
    useCompleteOrderMutation();

  // Create order from cart
  const createOrder = async () => {
    const orderItems = items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      notes: item.notes,
    }));

    try {
      const result = await createMutation({ items: orderItems }).unwrap();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message);
    } catch (error) {
      toast.error("فشل في إنشاء الطلب");
      throw error;
    }
  };

  // Complete order with payment
  const completeOrder = async (orderId: number, data: CompleteOrderRequest) => {
    try {
      await completeMutation({ orderId, data }).unwrap();
      clearCart();
      toast.success("تم إكمال الطلب بنجاح");
    } catch (error) {
      toast.error("فشل في إكمال الطلب");
      throw error;
    }
  };

  return {
    createOrder,
    completeOrder,
    isCreating,
    isCompleting,
  };
};
```

```typescript
// src/hooks/useShift.ts
import {
  useGetCurrentShiftQuery,
  useOpenShiftMutation,
  useCloseShiftMutation,
} from "../api/shiftsApi";
import { OpenShiftRequest, CloseShiftRequest } from "../types/shift.types";
import toast from "react-hot-toast";

export const useShift = () => {
  // Query current shift
  const { data: shiftData, isLoading, refetch } = useGetCurrentShiftQuery();

  // Mutations
  const [openMutation, { isLoading: isOpening }] = useOpenShiftMutation();
  const [closeMutation, { isLoading: isClosing }] = useCloseShiftMutation();

  const currentShift = shiftData?.data;
  const hasActiveShift = currentShift && !currentShift.isClosed;

  // Open shift
  const openShift = async (data: OpenShiftRequest) => {
    try {
      await openMutation(data).unwrap();
      toast.success("تم فتح الوردية بنجاح");
    } catch (error) {
      toast.error("فشل في فتح الوردية");
    }
  };

  // Close shift
  const closeShift = async (data: CloseShiftRequest) => {
    try {
      await closeMutation(data).unwrap();
      toast.success("تم إغلاق الوردية بنجاح");
    } catch (error) {
      toast.error("فشل في إغلاق الوردية");
    }
  };

  return {
    currentShift,
    hasActiveShift,
    isLoading,
    refetch,
    openShift,
    closeShift,
    isOpening,
    isClosing,
  };
};
```

---

## 🧩 المكونات الأساسية (Core Components)

```tsx
// src/components/common/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: ReactNode;
}

export const Button = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    "font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500",
    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
    success: "bg-green-500 hover:bg-green-600 text-white focus:ring-green-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          جاري التحميل...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
```

```tsx
// src/components/common/Input.tsx
import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors",
            error ? "border-red-500" : "border-gray-300",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
```

```tsx
// src/components/pos/ProductCard.tsx
import { Product } from "../../types/product.types";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/formatters";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  const handleClick = () => {
    addItem(product);
  };

  return (
    <button
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-primary-200 transition-all text-right w-full"
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-24 object-cover rounded-lg mb-3"
        />
      ) : (
        <div className="w-full h-24 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
          <span className="text-4xl">📦</span>
        </div>
      )}

      <h3 className="font-semibold text-gray-800 mb-1 truncate">
        {product.name}
      </h3>

      <p className="text-primary-600 font-bold">
        {formatCurrency(product.price)}
      </p>
    </button>
  );
};
```

```tsx
// src/components/pos/Cart.tsx
import { useCart } from "../../hooks/useCart";
import { CartItem } from "./CartItem";
import { OrderSummary } from "./OrderSummary";
import { Button } from "../common/Button";

interface CartProps {
  onCheckout: () => void;
}

export const Cart = ({ onCheckout }: CartProps) => {
  const { items, clearCart, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <span className="text-6xl mb-4">🛒</span>
        <p>السلة فارغة</p>
        <p className="text-sm">اضغط على المنتجات لإضافتها</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">الطلب الحالي</h2>
        <button
          onClick={clearCart}
          className="text-red-500 text-sm hover:underline"
        >
          إفراغ السلة
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {items.map((item) => (
          <CartItem key={item.product.id} item={item} />
        ))}
      </div>

      {/* Summary */}
      <OrderSummary />

      {/* Checkout Button */}
      <Button
        variant="success"
        size="lg"
        className="w-full mt-4"
        onClick={onCheckout}
      >
        الدفع - {total.toFixed(2)} ر.س
      </Button>
    </div>
  );
};
```

---

## 📄 الصفحات المطلوبة للـ MVP

```tsx
// src/pages/auth/LoginPage.tsx
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div
      className="min-h-screen bg-gray-100 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">KasserPro</h1>
          <p className="text-gray-500 mt-2">نظام نقاط البيع</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@kasserpro.com"
            required
          />

          <Input
            label="كلمة المرور"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoggingIn}
          >
            تسجيل الدخول
          </Button>
        </form>
      </div>
    </div>
  );
};
```

```tsx
// src/pages/pos/POSPage.tsx
import { useState } from "react";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { ProductGrid } from "../../components/pos/ProductGrid";
import { CategoryTabs } from "../../components/pos/CategoryTabs";
import { Cart } from "../../components/pos/Cart";
import { PaymentModal } from "../../components/pos/PaymentModal";
import { Loading } from "../../components/common/Loading";

export const POSPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const { products, isLoading } = useProducts();
  const { categories } = useCategories();

  // Filter products by category
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="h-screen flex" dir="rtl">
      {/* Products Section - 70% */}
      <div className="flex-1 flex flex-col bg-gray-50 p-4">
        {/* Categories */}
        <CategoryTabs
          categories={categories}
          selectedId={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto mt-4">
          <ProductGrid products={filteredProducts} />
        </div>
      </div>

      {/* Cart Section - 30% */}
      <div className="w-96 bg-white border-r border-gray-200 p-4">
        <Cart onCheckout={() => setShowPayment(true)} />
      </div>

      {/* Payment Modal */}
      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} />}
    </div>
  );
};
```

---

## 🔧 Utilities

```typescript
// src/utils/formatters.ts
export const formatCurrency = (amount: number, currency = "SAR"): string => {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export const formatTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};
```

```typescript
// src/utils/constants.ts
export const TAX_RATE = 15; // VAT 15%

export const ORDER_STATUS = {
  Draft: "مسودة",
  Pending: "في الانتظار",
  Completed: "مكتمل",
  Cancelled: "ملغي",
  Refunded: "مسترجع",
} as const;

export const PAYMENT_METHODS = {
  Cash: "نقدي",
  Card: "بطاقة",
  Mada: "مدى",
} as const;

export const USER_ROLES = {
  Admin: "مدير",
  Cashier: "كاشير",
} as const;
```

---

## 🛣️ Router Setup

```tsx
// src/router.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAppSelector } from "./store/hooks";
import { selectIsAuthenticated, selectIsAdmin } from "./store/slices/authSlice";

// Layouts
import { MainLayout } from "./components/layout/MainLayout";
import { AuthLayout } from "./components/layout/AuthLayout";

// Pages
import { LoginPage } from "./pages/auth/LoginPage";
import { POSPage } from "./pages/pos/POSPage";
import { ProductsPage } from "./pages/products/ProductsPage";
import { CategoriesPage } from "./pages/categories/CategoriesPage";
import { OrdersPage } from "./pages/orders/OrdersPage";
import { ShiftPage } from "./pages/shifts/ShiftPage";
import { DailyReportPage } from "./pages/reports/DailyReportPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = useAppSelector(selectIsAdmin);

  if (!isAdmin) {
    return <Navigate to="/pos" replace />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <AuthLayout>
        <LoginPage />
      </AuthLayout>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/pos" replace /> },
      { path: "pos", element: <POSPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "shift", element: <ShiftPage /> },
      {
        path: "products",
        element: (
          <AdminRoute>
            <ProductsPage />
          </AdminRoute>
        ),
      },
      {
        path: "categories",
        element: (
          <AdminRoute>
            <CategoriesPage />
          </AdminRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <AdminRoute>
            <DailyReportPage />
          </AdminRoute>
        ),
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
```

---

## 🚀 إعداد التطبيق (App Setup)

### Main Entry Point

```tsx
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { store, persistor } from "./store";
import { router } from "./router";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: "Cairo, sans-serif",
            },
          }}
        />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
```

### App Component (Optional - if using createBrowserRouter)

```tsx
// src/App.tsx
import { Outlet } from "react-router-dom";

function App() {
  return <Outlet />;
}

export default App;
```

### الحزم الإضافية للـ Persist

```powershell
# تثبيت redux-persist للاحتفاظ بالـ state في localStorage
npm install redux-persist
```

---

## ✅ أفضل الممارسات (Best Practices)

### 1. TypeScript

```typescript
// ✅ Good - استخدم Types صريحة
interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}

// ❌ Bad - any
const ProductCard = ({ product }: any) => {};
```

### 2. Component Structure

```typescript
// ✅ Good - مكونات صغيرة ومركزة
const ProductCard = ({ product }: Props) => {};
const ProductGrid = ({ products }: Props) => {};
const ProductsPage = () => {};

// ❌ Bad - مكون ضخم واحد
const ProductsEverythingPage = () => {
  /* 500 lines */
};
```

### 3. State Management (Redux Toolkit)

```typescript
// ✅ Good - استخدم Typed Hooks
import { useAppDispatch, useAppSelector } from "../store/hooks";
const user = useAppSelector(selectCurrentUser);
const dispatch = useAppDispatch();

// ✅ Good - استخدم Selectors
export const selectTotal = (state: RootState) => state.cart.total;

// ✅ Good - استخدم RTK Query hooks مباشرة
const { data, isLoading } = useGetProductsQuery();
const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

// ❌ Bad - استخدام useSelector/useDispatch بدون Types
const user = useSelector((state) => state.auth.user);
```

### 4. Error Handling

```typescript
// ✅ Good
try {
  await createOrder(data);
  toast.success("تم إنشاء الطلب");
} catch (error) {
  toast.error("فشل في إنشاء الطلب");
}

// ❌ Bad
await createOrder(data); // No error handling
```

### 5. Code Organization

```typescript
// ✅ Good - ملفات منظمة
import { Button } from "@/components/common/Button";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/utils/formatters";

// ❌ Bad - imports فوضوية
import { something } from "../../../../components/somewhere/something";
```

---

## 📝 خطوات التنفيذ (Step by Step)

### الأسبوع 1: الإعداد والأساسيات

- [ ] إنشاء المشروع بـ Vite
- [ ] إعداد TailwindCSS
- [ ] إنشاء هيكل المجلدات
- [ ] إعداد Types الأساسية
- [ ] إعداد Axios و API services
- [ ] إعداد React Query
- [ ] إنشاء صفحة Login

### الأسبوع 2: الـ POS الأساسي

- [ ] إنشاء Auth Store
- [ ] إنشاء Cart Store
- [ ] إنشاء مكونات المنتجات
- [ ] إنشاء مكونات السلة
- [ ] إنشاء صفحة POS الأساسية

### الأسبوع 3: إكمال الطلبات

- [ ] إنشاء Payment Modal
- [ ] ربط Create Order API
- [ ] إنشاء Receipt Modal
- [ ] إنشاء صفحة Orders
- [ ] عرض تفاصيل الطلب

### الأسبوع 4: إدارة المنتجات

- [ ] صفحة عرض المنتجات
- [ ] فورم إضافة/تعديل منتج
- [ ] صفحة التصنيفات
- [ ] رفع الصور (اختياري)

### الأسبوع 5: الورديات والتقارير

- [ ] صفحة الوردية
- [ ] فتح/إغلاق الوردية
- [ ] صفحة التقرير اليومي
- [ ] عرض إحصائيات

### الأسبوع 6: التحسينات

- [ ] Responsive Design
- [ ] Loading States
- [ ] Error Handling
- [ ] Final Testing
- [ ] Bug Fixes

---

## 🎯 الأوامر الأساسية

```powershell
# تشغيل المشروع
npm run dev

# بناء للإنتاج
npm run build

# معاينة البناء
npm run preview

# فحص الأكواد
npm run lint
```

---

> 💡 **نصيحة:** ركز على وظيفة واحدة في كل مرة. لا تحاول بناء كل شيء مرة واحدة!
