import { useEffect } from "react";
import { useGetCurrentTenantQuery } from "@/api/branchesApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setTaxSettings,
  selectTaxRate,
  selectIsTaxEnabled,
  selectAllowNegativeStock,
} from "@/store/slices/cartSlice";
import { selectIsAuthenticated } from "@/store/slices/authSlice";

/**
 * مكون لمزامنة إعدادات الضريبة والمخزون من بيانات الشركة إلى السلة
 * يتم تحميله مرة واحدة عند تسجيل الدخول ويحدث السلة تلقائياً
 */
export const TaxSettingsSync = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentTaxRate = useAppSelector(selectTaxRate);
  const currentIsTaxEnabled = useAppSelector(selectIsTaxEnabled);
  const currentAllowNegativeStock = useAppSelector(selectAllowNegativeStock);

  // Only fetch tenant data when authenticated
  const { data: tenantData } = useGetCurrentTenantQuery(undefined, {
    skip: !isAuthenticated,
  });

  const tenant = tenantData?.data;

  useEffect(() => {
    if (tenant) {
      // Only update if values are different to avoid unnecessary re-renders
      const needsUpdate =
        tenant.taxRate !== currentTaxRate ||
        tenant.isTaxEnabled !== currentIsTaxEnabled ||
        tenant.allowNegativeStock !== currentAllowNegativeStock;

      if (needsUpdate) {
        dispatch(
          setTaxSettings({
            taxRate: tenant.taxRate,
            isTaxEnabled: tenant.isTaxEnabled,
            allowNegativeStock: tenant.allowNegativeStock,
          })
        );
      }
    }
  }, [
    tenant,
    currentTaxRate,
    currentIsTaxEnabled,
    currentAllowNegativeStock,
    dispatch,
  ]);

  // This component doesn't render anything
  return null;
};
