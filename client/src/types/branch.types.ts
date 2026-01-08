export interface Branch {
  id: number;
  tenantId: number;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateBranchRequest {
  name: string;
  code: string;
  address?: string;
  phone?: string;
}

export interface UpdateBranchRequest {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  isActive: boolean;
}
