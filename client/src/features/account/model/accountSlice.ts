import { IUser } from "@/entities/user/types/IUser";
import { createSlice } from "@reduxjs/toolkit";
import { changePassword } from "./accountAction";

interface AccountState {
  user: IUser | null;
  accountLoadingStatus: string;
  error: string | null;
}

const initialState: AccountState = {
  user: null,
  accountLoadingStatus: "idle",
  error: null,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(changePassword.pending, (state) => {
        state.accountLoadingStatus = "loading";
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.accountLoadingStatus = "idle";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.accountLoadingStatus = "error";
        state.error = action.payload || "An error occurred";
      })
      .addDefaultCase(() => {});
  },
});

const { reducer } = accountSlice;

export default reducer;
