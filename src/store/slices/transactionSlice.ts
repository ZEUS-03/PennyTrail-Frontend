import { toast } from "@/hooks/use-toast";
import { transactionService } from "@/services/transaction";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TransactionState {
  transactions: object[];
  loading: boolean;
  error: string | null;
}

interface SyncTransactionsParams {
  syncAll?: boolean;
  maxResults?: number;
}

const initialState: TransactionState = {
  transactions: [],
  loading: false,
  error: null,
};

export const syncTransactions = createAsyncThunk<
  object[],
  SyncTransactionsParams | undefined
>(
  "transactions/getTransactions",
  async ({ syncAll = true, maxResults = 50 }, { rejectWithValue }) => {
    try {
      const response = await transactionService.syncTransactions({
        maxResults,
        syncAll,
      });
      return response.data;
    } catch (error) {
      toast({
        title: "Failed to Sync Emails",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }
  }
);

export const transactionSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<object[]>) => {
      state.transactions = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle getTransactions
      .addCase(syncTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
        state.error = null;
      })
      .addCase(syncTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setTransactions, setLoading, setError } =
  transactionSlice.actions;
export default transactionSlice.reducer;
