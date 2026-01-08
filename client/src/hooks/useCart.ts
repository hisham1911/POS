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
  selectTaxRate,
  selectIsTaxEnabled,
} from "../store/slices/cartSlice";
import { Product } from "../types/product.types";

export const useCart = () => {
  const dispatch = useAppDispatch();

  const items = useAppSelector(selectCartItems);
  const itemsCount = useAppSelector(selectItemsCount);
  const subtotal = useAppSelector(selectSubtotal);
  const taxAmount = useAppSelector(selectTaxAmount);
  const total = useAppSelector(selectTotal);
  const taxRate = useAppSelector(selectTaxRate);
  const isTaxEnabled = useAppSelector(selectIsTaxEnabled);

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
    taxRate,
    isTaxEnabled,
    addItem: add,
    removeItem: remove,
    updateQuantity: setQuantity,
    updateNotes: setNotes,
    clearCart: clear,
  };
};
