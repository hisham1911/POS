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
        item.quantity = quantity;
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
