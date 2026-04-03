import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "../api/IUser";
import { registration, login, logout } from "./authActions";

interface AuthState {
  user: IUser | null;
  isAuth: boolean;
  authLoadingStatus: string;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuth: false,
  authLoadingStatus: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registration.fulfilled, (state, action) => {
        state.authLoadingStatus = "idle";
        state.isAuth = true;
        state.user = action.payload.user;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.authLoadingStatus = "idle";
        state.isAuth = true;
        state.user = action.payload.user;
      })
      .addCase(logout.fulfilled, (state) => {
        state.authLoadingStatus = "idle";
        state.isAuth = false;
      })
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.authLoadingStatus = "loading";
          state.error = null;
        },
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: PayloadAction<string>) => {
          state.authLoadingStatus = "error";
          state.error = action.payload;
        },
      )
      .addDefaultCase(() => {});
  },
});

const { reducer } = authSlice;

export default reducer;
