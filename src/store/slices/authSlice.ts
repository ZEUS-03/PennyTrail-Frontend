import { authService } from "@/services/auth";
import { User } from "@/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
interface AuthState {
  user: User;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isGuest: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isGuest: false,
};

export const getSelfCall = createAsyncThunk(
  "auth/getSelfCall",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getSelfDetails();
      return response.data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message,
      });
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setGuest: (state, action: PayloadAction<boolean>) => {
      state.isGuest = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle getGoogleAuthUrl
      .addCase(getSelfCall.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSelfCall.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getSelfCall.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    // Handle loginWithGoogle
    // .addCase(loginWithGoogle.pending, (state) => {
    //   state.loading = true;
    //   state.error = null;
    // })
    // .addCase(loginWithGoogle.fulfilled, (state, action) => {
    //   state.loading = false;
    //   state.user = action.payload;
    //   state.isAuthenticated = true;
    // })
    // .addCase(loginWithGoogle.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload as string;
    // });
  },
});

export const { logout, setError, setGuest } = authSlice.actions;
export default authSlice.reducer;
