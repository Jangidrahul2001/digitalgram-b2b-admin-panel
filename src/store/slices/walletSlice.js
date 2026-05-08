import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import { apiEndpoints } from "../../api/apiEndpoints";

export const fetchAdminWallet = createAsyncThunk(
  "adminWallet/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(apiEndpoints.adminWalletBalance);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch wallet");
    }
  },
);

const walletSlice = createSlice({
  name: "wallet",
  initialState: {
    data: {
      aepsHoldAmount: 0,
      aepsWallet: 0,
      mainHoldAmount: 0,
      mainWallet: 0,
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload?.data;
      })
      .addCase(fetchAdminWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default walletSlice.reducer;
