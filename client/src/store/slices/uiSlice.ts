import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  isPaymentModalOpen: boolean;
  isReceiptModalOpen: boolean;
  isSidebarOpen: boolean;
  currentOrderId: number | null;
}

const initialState: UiState = {
  isPaymentModalOpen: false,
  isReceiptModalOpen: false,
  isSidebarOpen: true,
  currentOrderId: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openPaymentModal: (state) => {
      state.isPaymentModalOpen = true;
    },
    closePaymentModal: (state) => {
      state.isPaymentModalOpen = false;
    },
    openReceiptModal: (state, action: PayloadAction<number>) => {
      state.isReceiptModalOpen = true;
      state.currentOrderId = action.payload;
    },
    closeReceiptModal: (state) => {
      state.isReceiptModalOpen = false;
      state.currentOrderId = null;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
  },
});

export const {
  openPaymentModal,
  closePaymentModal,
  openReceiptModal,
  closeReceiptModal,
  toggleSidebar,
} = uiSlice.actions;

// Selectors
export const selectIsPaymentModalOpen = (state: { ui: UiState }) => state.ui.isPaymentModalOpen;
export const selectIsReceiptModalOpen = (state: { ui: UiState }) => state.ui.isReceiptModalOpen;
export const selectIsSidebarOpen = (state: { ui: UiState }) => state.ui.isSidebarOpen;
export const selectCurrentOrderId = (state: { ui: UiState }) => state.ui.currentOrderId;

export default uiSlice.reducer;
