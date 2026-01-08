import { useEffect } from "react";
import { useGetCurrentTenantQuery } from "@/api/branchesApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTaxSettings, selectTaxRate, selectIsTaxEnabled } from "@/store/slices/cartSlice";
import { selectIsAuthenticated } from "@/store/slices/authSlice";

/**
 * مكون لمزامنة إعدادات الضريبة من بيانات الشركة إلى السلة
 * يتم تحميله مرة واحدة عند تسجيل الدخول ويحدث السلة تلقائياً
 */
export const TaxSettingsSync = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentTaxRate = useAppSelector(selectTaxRate);
  const currentIsTaxEnabled = useAppSelector(selectIsTaxEnabled);

  // Only fetch tenant data when authenticated
  const { data: tenantData } = useGetCurrentTenantQuery(undefined, {
    skip: !isAuthenticated,
  });

  const tenant = tenantData?.data;

  useEffect(() => {
    if (tenant) {
      // Only update if values are different to avoid unnecessary re-renders
      if (tenant.taxRate !== currentTaxRate || tenant.isTaxEnabled !== currentIsTaxEnabled) {
        dispatch(setTaxSettings({
          taxRate: tenant.taxRate,
          isTaxEnabled: tenant.isTaxEnabled,
        }));
      }
    }
  }, [tenant, currentTaxRate, currentIsTaxEnabled, dispatch]);

  // This component doesn't render anything
  return null;
};
