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
  totalMada: number;
  totalOrders: number;
  totalSales: number;
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
