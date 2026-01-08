export interface Tenant {
  id: number;
  name: string;
  nameEn?: string;
  slug: string;
  logoUrl?: string;
  currency: string;
  timezone: string;
  isActive: boolean;
  // Tax Settings
  taxRate: number;
  isTaxEnabled: boolean;
  // Inventory Settings
  allowNegativeStock: boolean;
  createdAt: string;
}

export interface UpdateTenantRequest {
  name: string;
  nameEn?: string;
  logoUrl?: string;
  currency: string;
  timezone: string;
  // Tax Settings
  taxRate?: number;
  isTaxEnabled?: boolean;
  // Inventory Settings
  allowNegativeStock?: boolean;
}
