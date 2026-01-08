/**
 * Inventory Types - Matches backend StockMovementDto and related DTOs
 */

export type StockMovementType = 
  | "Sale" 
  | "Refund" 
  | "Adjustment" 
  | "Receiving" 
  | "Damage" 
  | "Transfer";

export type StockAdjustmentType = 
  | "Adjustment" 
  | "Receiving" 
  | "Damage" 
  | "Transfer";

export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  productSku?: string;
  type: StockMovementType;
  typeName: string;
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: number;
  referenceType?: string;
  reason?: string;
  userId: number;
  userName?: string;
  createdAt: string;
}

export interface StockAdjustmentRequest {
  quantity: number;
  reason: string;
  adjustmentType?: StockAdjustmentType;
}

export interface LowStockProduct {
  productId: number;
  productName: string;
  sku?: string;
  barcode?: string;
  currentStock: number;
  lowStockThreshold: number;
  reorderPoint?: number;
  stockDeficit: number;
  categoryName: string;
}

export interface StockHistoryPagedResult {
  items: StockMovement[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface StockHistoryQueryParams {
  productId: number;
  page?: number;
  pageSize?: number;
}

export interface CurrentStockResponse {
  productId: number;
  currentStock: number;
}

export interface StockAdjustResponse {
  productId: number;
  newBalance: number;
}

export interface LowStockResponse {
  success: boolean;
  data: LowStockProduct[];
  count: number;
}
