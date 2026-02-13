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
  selectDiscountAmount,
  selectDiscountType,
  selectDiscountValue,
  setDiscount,
  DiscountType,
} from "../store/slices/cartSlice";
import { Product } from "../types/product.types";

export const useCart = () => {
  const dispatch = useAppDispatch();

  const items = useAppSelector(selectCartItems);
  const itemsCount = useAppSelector(selectItemsCount);
  const subtotal = useAppSelector(selectSubtotal);
  const discountAmount = useAppSelector(selectDiscountAmount);
  const discountType = useAppSelector(selectDiscountType);
  const discountValue = useAppSelector(selectDiscountValue);
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

  const applyDiscount = (type: DiscountType, value: number) => {
    dispatch(setDiscount({ type, value }));
  };

  const removeDiscount = () => {
    dispatch(setDiscount(undefined));
  };

  return {
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
    addItem: add,
    removeItem: remove,
    updateQuantity: setQuantity,
    updateNotes: setNotes,
    clearCart: clear,
    applyDiscount,
    removeDiscount,
  };
};
