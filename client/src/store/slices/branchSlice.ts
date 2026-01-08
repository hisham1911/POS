import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Branch } from "../../types/branch.types";

interface BranchState {
  currentBranch: Branch | null;
  branches: Branch[];
}

const initialState: BranchState = {
  currentBranch: null,
  branches: [],
};

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {
    setCurrentBranch: (state, action: PayloadAction<Branch | null>) => {
      state.currentBranch = action.payload;
    },
    setBranches: (state, action: PayloadAction<Branch[]>) => {
      state.branches = action.payload;
      // Auto-select first branch if no current branch
      if (!state.currentBranch && action.payload.length > 0) {
        state.currentBranch = action.payload[0];
      }
    },
    clearBranch: (state) => {
      state.currentBranch = null;
      state.branches = [];
    },
  },
});

export const { setCurrentBranch, setBranches, clearBranch } = branchSlice.actions;

// Selectors
export const selectCurrentBranch = (state: { branch: BranchState }) => state.branch.currentBranch;
export const selectBranches = (state: { branch: BranchState }) => state.branch.branches;

export default branchSlice.reducer;
