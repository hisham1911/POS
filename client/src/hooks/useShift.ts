import {
  useGetCurrentShiftQuery,
  useGetShiftsQuery,
  useOpenShiftMutation,
  useCloseShiftMutation,
} from "../api/shiftsApi";
import { OpenShiftRequest, CloseShiftRequest, Shift } from "../types/shift.types";
import { toast } from "sonner";

// Mock shift for development
const mockShift: Shift = {
  id: 1,
  openingBalance: 500,
  closingBalance: 0,
  expectedBalance: 2300,
  difference: 0,
  openedAt: new Date().toISOString(),
  isClosed: false,
  totalCash: 1800,
  totalCard: 450,
  totalMada: 200,
  totalOrders: 25,
  totalSales: 2450,
  userId: 1,
  userName: "أحمد محمد",
};

export const useShift = () => {
  const { data: shiftData, isLoading, refetch } = useGetCurrentShiftQuery();
  const { data: shiftsData, isLoading: isLoadingShifts } = useGetShiftsQuery();

  const [openMutation, { isLoading: isOpening }] = useOpenShiftMutation();
  const [closeMutation, { isLoading: isClosing }] = useCloseShiftMutation();

  // Use API data or fallback to mock
  const currentShift = shiftData?.data || mockShift;
  const shifts = shiftsData?.data || [mockShift];
  const hasActiveShift = currentShift && !currentShift.isClosed;

  const openShift = async (data: OpenShiftRequest) => {
    try {
      await openMutation(data).unwrap();
      toast.success("تم فتح الوردية بنجاح");
      refetch();
    } catch {
      toast.error("فشل في فتح الوردية");
    }
  };

  const closeShift = async (data: CloseShiftRequest) => {
    try {
      await closeMutation(data).unwrap();
      toast.success("تم إغلاق الوردية بنجاح");
      refetch();
    } catch {
      toast.error("فشل في إغلاق الوردية");
    }
  };

  return {
    currentShift,
    shifts,
    hasActiveShift,
    isLoading,
    isLoadingShifts,
    refetch,
    openShift,
    closeShift,
    isOpening,
    isClosing,
  };
};
