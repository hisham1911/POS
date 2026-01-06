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
