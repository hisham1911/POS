import { useEffect } from "react";
import { Building2, ChevronDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetBranchesQuery } from "@/api/branchesApi";
import { setCurrentBranch, setBranches, selectCurrentBranch, selectBranches } from "@/store/slices/branchSlice";
import { baseApi } from "@/api/baseApi";

export const BranchSelector = () => {
  const dispatch = useAppDispatch();
  const currentBranch = useAppSelector(selectCurrentBranch);
  const branches = useAppSelector(selectBranches);
  const { data: branchesData, isLoading } = useGetBranchesQuery();

  useEffect(() => {
    if (branchesData?.data) {
      dispatch(setBranches(branchesData.data));
    }
  }, [branchesData, dispatch]);

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = parseInt(e.target.value);
    const branch = branches.find((b) => b.id === branchId);
    if (branch) {
      dispatch(setCurrentBranch(branch));
      // Invalidate all cached data when branch changes
      dispatch(baseApi.util.invalidateTags(["Products", "Categories", "Orders", "Shifts"]));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg animate-pulse">
        <Building2 className="w-4 h-4 text-gray-400" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
    );
  }

  if (branches.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
        <Building2 className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium">{currentBranch?.name || "الفرع الرئيسي"}</span>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
      <Building2 className="w-4 h-4 text-gray-500" />
      <select
        value={currentBranch?.id || ""}
        onChange={handleBranchChange}
        className="appearance-none bg-transparent text-sm font-medium pr-6 cursor-pointer focus:outline-none"
      >
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-gray-400 absolute left-2 pointer-events-none" />
    </div>
  );
};
