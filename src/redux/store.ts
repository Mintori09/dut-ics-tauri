import { configureStore } from "@reduxjs/toolkit";
import appStateSlide from "./features/appStateSlice";

export const store = configureStore({
  reducer: {
    appState: appStateSlide,
  },
});

export type RootState = ReturnType<typeof store.getState>;
