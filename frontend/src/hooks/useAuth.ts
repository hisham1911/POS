import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useLoginMutation } from "../api/authApi";
import { baseApi } from "../api/baseApi";
import i18n from "../i18n";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectCurrentUser,
  selectIsAdmin,
  selectIsAuthenticated,
  selectIsSystemOwner,
  setCredentials,
  logout as logoutAction
} from "../store/slices/authSlice";
import { clearBranch } from "../store/slices/branchSlice";
import type { LoginRequest } from "../types/auth.types";

export const useAuth = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isSystemOwner = useAppSelector(selectIsSystemOwner);

  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();

  const login = async (credentials: LoginRequest) => {
    try {
      const result = await loginMutation(credentials).unwrap();

      if (result.success && result.data) {
        try {
          localStorage.removeItem("persist:branch");
        } catch {
          // Ignore localStorage edge cases.
        }

        dispatch(clearBranch());
        dispatch(
          setCredentials({
            user: result.data.user,
            token: result.data.accessToken
          })
        );

        toast.success(i18n.t("login.submit"));
        navigate(result.data.user.role === "SystemOwner" ? "/owner/tenants" : "/dashboard");
      } else {
        toast.error(result.message || i18n.t("login.passwordLabel"));
      }
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message;
      toast.error(errorMessage || i18n.t("login.passwordLabel"));
    }
  };

  const logout = () => {
    dispatch(logoutAction());
    dispatch(clearBranch());
    dispatch(baseApi.util.resetApiState());
    navigate("/login");
    toast.success(i18n.t("layout.logout"));
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    isSystemOwner,
    login,
    isLoggingIn,
    logout
  };
};
