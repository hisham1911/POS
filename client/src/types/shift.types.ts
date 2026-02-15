export interface Shift {
  id: number;
  userId?: number;
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

  // Activity tracking
  lastActivityAt: string;
  inactiveHours: number;

  // Force close
  isForceClosed: boolean;
  forceClosedByUserName?: string;
  forceClosedAt?: string;
  forceCloseReason?: string;

  // Handover
  isHandedOver: boolean;
  handedOverFromUserName?: string;
  handedOverToUserName?: string;
  handedOverAt?: string;
  handoverBalance: number;
  handoverNotes?: string;

  // Calculated fields
  durationHours: number;
  durationMinutes: number;
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

export interface ForceCloseShiftRequest {
  reason: string;
  actualBalance?: number;
  notes?: string;
}

export interface HandoverShiftRequest {
  toUserId: number;
  currentBalance: number;
  notes?: string;
}
