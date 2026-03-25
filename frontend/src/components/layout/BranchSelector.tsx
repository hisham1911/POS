import { useEffect } from "react";
import { Building05 } from "@untitledui/icons";
import { useTranslation } from "react-i18next";

import { baseApi } from "@/api/baseApi";
import { useGetBranchesQuery } from "@/api/branchesApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectBranches,
  selectCurrentBranch,
  setBranches,
  setCurrentBranch
} from "@/store/slices/branchSlice";
import { clearCart } from "@/store/slices/cartSlice";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { Select } from "@/components/ui/select";

export const BranchSelector = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentBranch = useAppSelector(selectCurrentBranch);
  const branches = useAppSelector(selectBranches);
  const currentUser = useAppSelector(selectCurrentUser);
  const { data: branchesData, isLoading } = useGetBranchesQuery();

  useEffect(() => {
    if (branchesData?.data) {
      dispatch(
        setBranches({
          branches: branchesData.data,
          userBranchId: currentUser?.branchId
        })
      );
    }
  }, [branchesData, currentUser?.branchId, dispatch]);

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = Number(e.target.value);
    const branch = branches.find((item) => item.id === branchId);
    if (!branch) return;

    dispatch(setCurrentBranch(branch));
    dispatch(clearCart());
    dispatch(
      baseApi.util.invalidateTags([
        "Products",
        "Categories",
        "Orders",
        "Shifts",
        "Customers",
        "Inventory",
        "Suppliers",
        "PurchaseInvoice",
        "Reports",
        "Expense",
        "Expenses",
        "CashRegisterBalance",
        "CashRegisterTransactions"
      ])
    );
  };

  const isCashier = currentUser?.role === "Cashier";
  const canSwitch = !isCashier && branches.length > 1;

  if (isLoading) {
    return (
      <div className="frost-card flex h-11 items-center gap-3 rounded-2xl px-4 py-0">
        <Building05 className="size-4 text-muted-foreground" />
        <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (!canSwitch) {
    return (
      <div className="frost-card flex h-11 items-center gap-3 rounded-2xl px-4 py-0">
        <Building05 className="size-4 text-muted-foreground" />
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            {t("layout.branch")}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {currentBranch?.name || t("layout.workspace")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="frost-card flex items-center gap-3 rounded-2xl px-3 py-2">
      <Building05 className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-[9rem] flex-1">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          {t("layout.branch")}
        </p>
        <Select
          className="h-8 border-0 bg-transparent px-0 pe-7 text-sm font-semibold shadow-none focus:ring-0"
          value={currentBranch?.id ?? ""}
          onChange={handleBranchChange}
        >
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};
