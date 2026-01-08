import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setCredentials,
  logout as logoutAction,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
} from "../store/slices/authSlice";
import { useLoginMutation } from "../api/authApi";
import { LoginRequest } from "../types/auth.types";
import { toast } from "sonner";
import { baseApi } from "../api/baseApi";

export const useAuth = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);

  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();

  // Login function using RTK Query
  const login = async (credentials: LoginRequest) => {
    try {
      const result = await loginMutation(credentials).unwrap();

      if (result.success && result.data) {
        dispatch(setCredentials({
          user: result.data.user,
          token: result.data.accessToken,
        }));
        toast.success("تم تسجيل الدخول بنجاح");
        navigate("/pos");
      } else {
        toast.error(result.message || "فشل تسجيل الدخول");
      }
    } catch (error: unknown) {
      const errorMessage = (error as any)?.data?.message || "فشل تسجيل الدخول";
      toast.error(errorMessage);
    }
  };

  const logout = () => {
    dispatch(logoutAction());
    dispatch(baseApi.util.resetApiState());
    navigate("/login");
    toast.success("تم تسجيل الخروج");
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    isLoggingIn,
    logout,
  };
};
