import { configureStore } from "@reduxjs/toolkit";
import settingsReducer from "./slices/settingSlice";
import walletReducer from "./slices/walletSlice";
import profileReducer from "./slices/profileSlice";

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    wallet: walletReducer,
    profile:profileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
