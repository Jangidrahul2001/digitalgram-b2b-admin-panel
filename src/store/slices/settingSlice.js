import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import { apiEndpoints } from "../../api/apiEndpoints";

export const fetchSettings = createAsyncThunk(
  "settings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(apiEndpoints.fetchSetting);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch settings");
    }
  },
);

export const updateSetting = createAsyncThunk(
  "settings/update",
  async ({ key, value }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append(key, value);
      const response = await api.put(apiEndpoints.updateSetting, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return { key, value: response[key] };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update setting");
    }
  },
);

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    data: {
      title: "",
      logo: null,
      favicon: null,
      qrCode: null,
      email: "",
      contactNumber: "",
      address: "",
      logoUrl: "",
      faviconUrl: "",
      qrCodeUrl: "",
    },
    loading: false,
    error: null,
  },
  reducers: {
    updateLocalSetting: (state, action) => {
      const { key, value } = action.payload;
      state.data[key] = value;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.setting;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSetting.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSetting.fulfilled, (state, action) => {
        state.loading = false;
        state.data[action.payload.key] = action.payload.value;
      })
      .addCase(updateSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateLocalSetting } = settingsSlice.actions;
export default settingsSlice.reducer;
