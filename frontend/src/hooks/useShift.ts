import {
  useGetCurrentShiftQuery,
  useGetShiftsQuery,
  useOpenShiftMutation,
  useCloseShiftMutation,
} from "../api/shiftsApi";
import {
  OpenShiftRequest,
  CloseShiftRequest,
  Shift,
} from "../types/shift.types";
import { toast } from "sonner";

// Error response type from API
interface ApiErrorData {
  message?: string;
  errorCode?: string;
}

export const useShift = () => {
  // refetchOnMountOrArgChange: true يضمن إعادة جلب حالة الوردية عند كل mount
  const { data: shiftData, isLoading, refetch, isFetching } = useGetCurrentShiftQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: shiftsData, isLoading: isLoadingShifts } = useGetShiftsQuery();

  const [openMutation, { isLoading: isOpening }] = useOpenShiftMutation();
  const [closeMutation, { isLoading: isClosing }] = useCloseShiftMutation();

  const currentShift = shiftData?.data || null;
  const shifts = shiftsData?.data || [];
  const hasActiveShift = currentShift && !currentShift.isClosed;

  const openShift = async (data: OpenShiftRequest): Promise<Shift | null> => {
    try {
      const result = await openMutation(data).unwrap();
      if (result.success && result.data) {
        toast.success("تم فتح الوردية بنجاح");
        refetch();
        return result.data;
      }
      toast.error(result.message || "فشل في فتح الوردية");
      return null;
    } catch (error) {
      // Error already handled by baseQueryWithReauth
      const apiError = error as { data?: ApiErrorData };
      if (!apiError.data?.errorCode) {
        toast.error("فشل في فتح الوردية");
      }
      return null;
    }
  };

  const closeShift = async (data: CloseShiftRequest): Promise<Shift | null> => {
    try {
      const result = await closeMutation(data).unwrap();
      if (result.success && result.data) {
        toast.success("تم إغلاق الوردية بنجاح");
        refetch();
        return result.data;
      }
      toast.error(result.message || "فشل في إغلاق الوردية");
      return null;
    } catch (error) {
      // Error already handled by baseQueryWithReauth (including SHIFT_CONCURRENCY_CONFLICT)
      const apiError = error as { data?: ApiErrorData };
      if (!apiError.data?.errorCode) {
        toast.error("فشل في إغلاق الوردية");
      }
      // Refetch to get latest shift state
      refetch();
      return null;
    }
  };

  return {
    currentShift,
    shifts,
    hasActiveShift,
    isLoading,
    isLoadingShifts,
    isFetching,
    refetch,
    openShift,
    closeShift,
    isOpening,
    isClosing,
  };
};
