/* import { IUser } from "@/entities/user/types/IUser";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeEmail, changePassword } from "./accountAction";

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
      .addCase(changePassword.fulfilled, (state) => {
        state.accountLoadingStatus = "idle";
      })
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.accountLoadingStatus = "loading";
          state.error = null;
        },
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: PayloadAction<string>) => {
          state.accountLoadingStatus = "error";
          state.error = action.payload || "An error occurred";
        },
      )
      .addDefaultCase(() => {});
  },
});

const { reducer } = accountSlice;

export default reducer;
 */
