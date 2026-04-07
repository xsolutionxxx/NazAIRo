import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "../../../entities/user/types/IUser";
import { registration, login, logout, checkAuth } from "./authActions";
import {
  changeEmail,
  changePassword,
  updateProfile,
} from "../model/authActions";

interface AuthState {
  user: IUser | null;
  message: string | null;
  isAuth: boolean;
  authLoadingStatus: string;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  message: null,
  isAuth: false,
  authLoadingStatus: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{ isAuth: boolean; user: IUser | null }>,
    ) => {
      state.isAuth = action.payload.isAuth;
      state.user = action.payload.user;
      state.authLoadingStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registration.fulfilled, (state, action) => {
        state.authLoadingStatus = "idle";
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
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.authLoadingStatus = "idle";
        state.isAuth = true;
        state.user = action.payload.user;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.authLoadingStatus = "idle";
        state.isAuth = false;
        state.user = null;
      })
      .addCase(changeEmail.fulfilled, (state, action) => {
        state.authLoadingStatus = "idle";
        state.message = action.payload.message || null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.authLoadingStatus = "idle";
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.authLoadingStatus = "loading";
          state.error = null;
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") &&
          !action.type.includes("auth/check"),
        (state, action: PayloadAction<string>) => {
          state.authLoadingStatus = "error";
          state.error = action.payload;
        },
      )
      .addDefaultCase(() => {});
  },
});

export const { setAuth } = authSlice.actions;
const { reducer } = authSlice;

export default reducer;
