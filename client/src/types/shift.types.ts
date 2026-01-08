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
  userName?: string;
  orders?: ShiftOrder[];
}

export interface ShiftOrder {
  id: number;
  orderNumber: string;
  status: string;
  orderType?: string;
  total: number;
  customerName?: string;
  createdAt: string;
  completedAt?: string;
}

export interface OpenShiftRequest {
  openingBalance: number;
}

export interface CloseShiftRequest {
  closingBalance: number;
  notes?: string;
}
