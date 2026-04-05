import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

import { AccountResponse } from "../api/accountResponse";
import AccountService from "../api/accountService";

interface ChangePasswordFields {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const changePassword = createAsyncThunk<
  AccountResponse,
  ChangePasswordFields,
  { rejectValue: string }
>("account/change-password", async (fields, { rejectWithValue }) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = fields;
    const response = await AccountService.changePassword(
      currentPassword,
      newPassword,
      confirmNewPassword,
    );
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message =
        err.response?.data?.message || "Failed to change password";
      return rejectWithValue(message);
    }

    return rejectWithValue("Unknown Error");
  }
});
