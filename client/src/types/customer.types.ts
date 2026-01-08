/**
 * Customer Types - Matches backend CustomerDto
 */

export interface Customer {
  id: number;
  phone: string;
  name?: string;
  email?: string;
  address?: string;
  notes?: string;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CustomerSummary {
  id: number;
  phone: string;
  name?: string;
  loyaltyPoints: number;
}

export interface CreateCustomerRequest {
  phone: string;
  name?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
}

export interface GetOrCreateCustomerRequest {
  phone: string;
  name?: string;
}

export interface GetOrCreateCustomerResponse {
  success: boolean;
  data: Customer;
  wasCreated: boolean;
  message?: string;
}

export interface LoyaltyPointsRequest {
  points: number;
}

export interface CustomersPagedResult {
  items: Customer[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CustomersQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}
