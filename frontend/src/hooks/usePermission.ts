import { useAppSelector } from "../store/hooks";
import {
  selectCurrentUser,
  selectIsAdmin,
  selectIsSystemOwner,
} from "../store/slices/authSlice";

export const usePermission = () => {
  const user = useAppSelector(selectCurrentUser);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isSystemOwner = useAppSelector(selectIsSystemOwner);

  const hasPermission = (permission: string): boolean => {
    // Admin & SystemOwner have all permissions
    if (isAdmin || isSystemOwner) return true;
    if (!user?.permissions) return false;
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((p) => hasPermission(p));
  };

  return { hasPermission, hasAnyPermission };
};
