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
  isTaxEnabled: boolean;
}

const initialState: CartState = {
  items: [],
  taxRate: 14, // Default VAT 14% (الضريبة المصرية) - will be updated from tenant
  isTaxEnabled: true,
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
    },
    
    // تحديث إعدادات الضريبة من بيانات الشركة
    setTaxSettings: (
      state,
      action: PayloadAction<{ taxRate: number; isTaxEnabled: boolean }>
    ) => {
      state.taxRate = action.payload.taxRate;
      state.isTaxEnabled = action.payload.isTaxEnabled;
    },
  },
});

export const { addItem, removeItem, updateQuantity, updateNotes, clearCart, setTaxSettings } =
  cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectTaxRate = (state: { cart: CartState }) => state.cart.taxRate;
export const selectIsTaxEnabled = (state: { cart: CartState }) => state.cart.isTaxEnabled;

export const selectItemsCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

/**
 * Subtotal = Sum of all item prices (Net, before tax)
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
 * Tax Exclusive (Additive): Tax is calculated on top of Net price
 * TaxAmount = Subtotal * (TaxRate / 100)
 * 
 * Example (100 EGP Net with 14% VAT):
 *   TaxAmount = 100 * 0.14 = 14 EGP
 */
export const selectTaxAmount = (state: { cart: CartState }) => {
  // If tax is disabled, return 0
  if (!state.cart.isTaxEnabled) return 0;
  
  const subtotal = state.cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  
  // Tax Exclusive: TaxAmount = Subtotal * (Rate / 100)
  const taxAmount = subtotal * (state.cart.taxRate / 100);
  return Math.round(taxAmount * 100) / 100;
};

/**
 * Total = Subtotal + Tax
 * 
 * Example (100 EGP Net with 14% VAT):
 *   Total = 100 + 14 = 114 EGP
 */
export const selectTotal = (state: { cart: CartState }) => {
  const subtotal = state.cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  
  // If tax is disabled, Total = Subtotal
  if (!state.cart.isTaxEnabled) {
    return Math.round(subtotal * 100) / 100;
  }
  
  // Tax Exclusive: Total = Subtotal + Tax
  const taxAmount = subtotal * (state.cart.taxRate / 100);
  return Math.round((subtotal + taxAmount) * 100) / 100;
};

export default cartSlice.reducer;
