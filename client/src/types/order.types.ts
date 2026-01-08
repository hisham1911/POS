export type OrderStatus =
  | "Draft"
  | "Pending"
  | "Completed"
  | "Cancelled"
  | "Refunded";

export type OrderType = "DineIn" | "Takeaway" | "Delivery";

export type PaymentMethod = "Cash" | "Card" | "Fawry";

export interface OrderItem {
  id: number;
  productId: number;
  // Product Snapshot
  productName: string;
  productNameEn?: string;
  productSku?: string;
  productBarcode?: string;
  // Price Snapshot
  unitPrice: number;
  originalPrice: number;
  quantity: number;
  // Discount
  discountType?: string;
  discountValue?: number;
  discountAmount: number;
  discountReason?: string;
  // Tax
  taxRate: number;
  taxAmount: number;
  taxInclusive: boolean;
  subtotal: number;
  total: number;
  notes?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  orderType?: OrderType;
  // Branch Snapshot
  branchId: number;
  branchName?: string;
  branchAddress?: string;
  branchPhone?: string;
  // Currency
  currencyCode: string;
  // Totals
  subtotal: number;
  discountType?: string;
  discountValue?: number;
  discountAmount: number;
  discountCode?: string;
  taxRate: number;
  taxAmount: number;
  serviceChargePercent: number;
  serviceChargeAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  changeAmount: number;
  // Customer
  customerName?: string;
  customerPhone?: string;
  customerId?: number;
  notes?: string;
  // User
  userId: number;
  userName?: string;
  // Timestamps
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  items: OrderItem[];
  payments: Payment[];
}

export interface Payment {
  id: number;
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

export interface CreateOrderRequest {
  orderType?: OrderType;
  items: {
    productId: number;
    quantity: number;
    notes?: string;
  }[];
  customerName?: string;
  customerPhone?: string;
  customerId?: number;
  notes?: string;
}

export interface CompleteOrderRequest {
  payments: {
    method: PaymentMethod;
    amount: number;
    reference?: string;
  }[];
}
