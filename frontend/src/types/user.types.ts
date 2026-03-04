export interface UserDto {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: "Admin" | "Cashier" | "SystemOwner";
  isActive: boolean;
  tenantId?: number;
  branchId?: number;
  branchName?: string;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
  branchId?: number;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  phone?: string;
  role: string;
  branchId?: number;
}

export interface ToggleUserStatusRequest {
  isActive: boolean;
}
