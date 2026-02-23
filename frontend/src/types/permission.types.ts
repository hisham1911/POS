export interface PermissionInfo {
  key: string;
  group: string;
  groupAr: string;
  description: string;
  descriptionAr: string;
  isDefault: boolean;
}

export interface UserPermissions {
  userId: number;
  userName: string;
  email: string;
  permissions: string[];
}

export interface UpdatePermissionsRequest {
  permissions: string[];
}
