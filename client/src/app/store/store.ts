import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@features/auth/model/authSlice";
import flightReducer from "@features/flights/model/flightSlice";
import hotelReducer from "@features/hotels/model/hotelSlice";
/* import accountReducer from "@features/account/model/accountSlice"; */

const store = configureStore({
  reducer: { authReducer, flightReducer, hotelReducer /* , accountReducer */ },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: process.env.NODE_ENV !== "production",
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export default store;
