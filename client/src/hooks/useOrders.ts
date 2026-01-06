import {
  useGetOrdersQuery,
  useGetTodayOrdersQuery,
  useCreateOrderMutation,
  useCompleteOrderMutation,
  useCancelOrderMutation,
} from "../api/ordersApi";
import { useCart } from "./useCart";
import { CompleteOrderRequest, Order } from "../types/order.types";
import { toast } from "sonner";

export const useOrders = () => {
  const { items, clearCart } = useCart();

  const { data: ordersData, isLoading: isLoadingOrders, refetch } = useGetOrdersQuery();
  const { data: todayOrdersData, isLoading: isLoadingToday } = useGetTodayOrdersQuery();

  const [createMutation, { isLoading: isCreating }] = useCreateOrderMutation();
  const [completeMutation, { isLoading: isCompleting }] = useCompleteOrderMutation();
  const [cancelMutation, { isLoading: isCancelling }] = useCancelOrderMutation();

  const orders = ordersData?.data || [];
  const todayOrders = todayOrdersData?.data || [];

  const createOrder = async (): Promise<Order | null> => {
    const orderItems = items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      notes: item.notes,
    }));

    try {
      const result = await createMutation({ items: orderItems }).unwrap();
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.message);
    } catch {
      toast.error("فشل في إنشاء الطلب");
      return null;
    }
  };

  const completeOrder = async (orderId: number, data: CompleteOrderRequest): Promise<Order | null> => {
    try {
      const result = await completeMutation({ orderId, data }).unwrap();
      if (result.success && result.data) {
        clearCart();
        toast.success("تم إكمال الطلب بنجاح");
        return result.data;
      }
      throw new Error(result.message);
    } catch {
      toast.error("فشل في إكمال الطلب");
      return null;
    }
  };

  const cancelOrder = async (orderId: number, reason?: string) => {
    try {
      await cancelMutation({ orderId, reason }).unwrap();
      toast.success("تم إلغاء الطلب");
      refetch();
    } catch {
      toast.error("فشل في إلغاء الطلب");
    }
  };

  return {
    orders,
    todayOrders,
    isLoadingOrders,
    isLoadingToday,
    refetch,
    createOrder,
    completeOrder,
    cancelOrder,
    isCreating,
    isCompleting,
    isCancelling,
  };
};
