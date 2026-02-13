import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "../../types/product.types";

export type DiscountType = "Percentage" | "Fixed";

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  taxRate: number;
  isTaxEnabled: boolean;
  allowNegativeStock: boolean;
  // Order-level discount
  discountType?: DiscountType;
  discountValue?: number;
}

const initialState: CartState = {
  items: [],
  taxRate: 14, // Default VAT 14% (الضريبة المصرية) - will be updated from tenant
  isTaxEnabled: true,
  allowNegativeStock: false, // Default: don't allow selling when stock is 0
  discountType: undefined,
  discountValue: undefined,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (
      state,
      action: PayloadAction<{ product: Product; quantity?: number }>
    ) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(
        (item) => item.product.id === product.id
      );

      // Check stock availability
      const currentQty = existingItem?.quantity ?? 0;
      const newQty = currentQty + quantity;
      const availableStock = product.stockQuantity ?? Infinity;

      // If allowNegativeStock is enabled, skip stock check
      if (state.allowNegativeStock) {
        if (existingItem) {
          existingItem.quantity = newQty;
        } else {
          state.items.push({ product, quantity });
        }
        return;
      }

      // Don't allow adding if track inventory and exceeds stock
      if (product.trackInventory && newQty > availableStock) {
        // Limit to available stock
        const maxAddable = Math.max(0, availableStock - currentQty);
        if (maxAddable <= 0) return; // Can't add more

        if (existingItem) {
          existingItem.quantity = availableStock;
        } else {
          state.items.push({ product, quantity: maxAddable });
        }
        return;
      }

      if (existingItem) {
        existingItem.quantity = newQty;
      } else {
        state.items.push({ product, quantity });
      }
    },

    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        (item) => item.product.id !== action.payload
      );
    },

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
        // If allowNegativeStock is enabled, skip stock check
        if (state.allowNegativeStock) {
          item.quantity = quantity;
          return;
        }
        // Check stock availability
        const availableStock = item.product.stockQuantity ?? Infinity;
        if (item.product.trackInventory && quantity > availableStock) {
          item.quantity = availableStock; // Limit to available stock
        } else {
          item.quantity = quantity;
        }
      }
    },

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

    clearCart: (state) => {
      state.items = [];
      state.discountType = undefined;
      state.discountValue = undefined;
    },

    // تحديث إعدادات الضريبة والمخزون من بيانات الشركة
    setTaxSettings: (
      state,
      action: PayloadAction<{
        taxRate: number;
        isTaxEnabled: boolean;
        allowNegativeStock?: boolean;
      }>
    ) => {
      state.taxRate = action.payload.taxRate;
      state.isTaxEnabled = action.payload.isTaxEnabled;
      if (action.payload.allowNegativeStock !== undefined) {
        state.allowNegativeStock = action.payload.allowNegativeStock;
      }
    },

    // تطبيق خصم على الطلب
    setDiscount: (
      state,
      action: PayloadAction<{
        type: DiscountType;
        value: number;
      } | undefined>
    ) => {
      if (!action.payload) {
        state.discountType = undefined;
        state.discountValue = undefined;
      } else {
        state.discountType = action.payload.type;
        state.discountValue = action.payload.value;
      }
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  updateNotes,
  clearCart,
  setTaxSettings,
  setDiscount,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectTaxRate = (state: { cart: CartState }) => state.cart.taxRate;
export const selectIsTaxEnabled = (state: { cart: CartState }) =>
  state.cart.isTaxEnabled;

export const selectAllowNegativeStock = (state: { cart: CartState }) =>
  state.cart.allowNegativeStock;

export const selectDiscountType = (state: { cart: CartState }) =>
  state.cart.discountType;

export const selectDiscountValue = (state: { cart: CartState }) =>
  state.cart.discountValue;

export const selectItemsCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

/**
 * Subtotal = Sum of all item prices (Net, before tax and discount)
 * Product.price is the NET price (excluding tax)
 */
export const selectSubtotal = (state: { cart: CartState }) =>
  Math.round(
    state.cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    ) * 100
  ) / 100;

/**
 * Calculate discount amount based on type and value
 */
export const selectDiscountAmount = (state: { cart: CartState }) => {
  if (!state.cart.discountType || !state.cart.discountValue) return 0;

  const subtotal = state.cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let discountAmount = 0;
  if (state.cart.discountType === "Percentage") {
    // Percentage discount: value is percentage (e.g., 10 for 10%)
    discountAmount = subtotal * (state.cart.discountValue / 100);
  } else {
    // Fixed discount: value is the amount
    discountAmount = state.cart.discountValue;
  }

  // Discount cannot exceed subtotal
  return Math.round(Math.min(discountAmount, subtotal) * 100) / 100;
};

/**
 * Tax Exclusive (Additive): Tax is calculated on (Subtotal - Discount)
 * TaxAmount = (Subtotal - Discount) * (TaxRate / 100)
 *
 * Example (100 EGP Net with 10 EGP discount and 14% VAT):
 *   TaxAmount = (100 - 10) * 0.14 = 12.6 EGP
 */
export const selectTaxAmount = (state: { cart: CartState }) => {
  // If tax is disabled, return 0
  if (!state.cart.isTaxEnabled) return 0;

  const subtotal = state.cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Calculate discount
  let discountAmount = 0;
  if (state.cart.discountType && state.cart.discountValue) {
    if (state.cart.discountType === "Percentage") {
      discountAmount = subtotal * (state.cart.discountValue / 100);
    } else {
      discountAmount = state.cart.discountValue;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  // Tax is calculated on (Subtotal - Discount)
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (state.cart.taxRate / 100);
  return Math.round(taxAmount * 100) / 100;
};

/**
 * Total = Subtotal - Discount + Tax
 *
 * Example (100 EGP Net with 10 EGP discount and 14% VAT):
 *   Total = 100 - 10 + 12.6 = 102.6 EGP
 */
export const selectTotal = (state: { cart: CartState }) => {
  const subtotal = state.cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Calculate discount
  let discountAmount = 0;
  if (state.cart.discountType && state.cart.discountValue) {
    if (state.cart.discountType === "Percentage") {
      discountAmount = subtotal * (state.cart.discountValue / 100);
    } else {
      discountAmount = state.cart.discountValue;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const afterDiscount = subtotal - discountAmount;

  // If tax is disabled, Total = Subtotal - Discount
  if (!state.cart.isTaxEnabled) {
    return Math.round(afterDiscount * 100) / 100;
  }

  // Tax Exclusive: Total = (Subtotal - Discount) + Tax
  const taxAmount = afterDiscount * (state.cart.taxRate / 100);
  return Math.round((afterDiscount + taxAmount) * 100) / 100;
};

export default cartSlice.reducer;
