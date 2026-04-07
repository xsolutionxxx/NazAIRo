import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

import { AccountService, AuthService } from "../api/authService";
import { AuthResponse } from "../api/authResponse";
import { AccountResponse } from "../api/accountResponse";
import { API_URL } from "@shared/api/index";

interface RegistrationFields {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface LoginFields {
  email: string;
  password: string;
}

export const registration = createAsyncThunk<
  AuthResponse,
  RegistrationFields,
  { rejectValue: string }
>("auth/registration", async (fields, { rejectWithValue }) => {
  try {
    const { email, password, firstName, lastName, phone } = fields;
    const response = await AuthService.registration(
      email,
      password,
      firstName,
      lastName,
      phone,
    );
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message = err.response?.data?.message || "Registration Error";
      return rejectWithValue(message);
    }

    return rejectWithValue("Unknown Error");
  }
});

export const login = createAsyncThunk<
  AuthResponse,
  LoginFields,
  { rejectValue: string }
>("auth/login", async (fields, { rejectWithValue }) => {
  try {
    const { email, password } = fields;
    const response = await AuthService.login(email, password);
    localStorage.setItem("was_logged_in", "true");
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message = err.response?.data?.message || "Login Error";
      return rejectWithValue(message);
    }

    return rejectWithValue("Unknown Error");
  }
});

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.logout();
      localStorage.removeItem("was_logged_in");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || "Logout Error";
        return rejectWithValue(message);
      }

      return rejectWithValue("Unknown Error");
    }
  },
);

export const checkAuth = createAsyncThunk<
  AuthResponse,
  void,
  { rejectValue: string }
>("auth/check", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<AuthResponse>(`${API_URL}/refresh`, {
      withCredentials: true,
    });
    localStorage.setItem("was_logged_in", "true");
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        localStorage.removeItem("was_logged_in");
      }
      const message = err.response?.data?.message || "Auth check failed";
      return rejectWithValue(message);
    }

    return rejectWithValue("Unknown Error");
  }
});

interface ChangeEmailFields {
  newEmail: string;
  password: string;
}

interface ChangePasswordFields {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateProfileFields {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export const changeEmail = createAsyncThunk<
  AccountResponse,
  ChangeEmailFields,
  { rejectValue: string }
>("auth/change-email", async (fields, { rejectWithValue }) => {
  try {
    const { newEmail, password } = fields;
    const response = await AccountService.changeEmail(newEmail, password);
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message = err.response?.data?.message || "Failed to change email";
      return rejectWithValue(message);
    }

    return rejectWithValue("Unknown Error");
  }
});

export const changePassword = createAsyncThunk<
  AccountResponse,
  ChangePasswordFields,
  { rejectValue: string }
>("auth/change-password", async (fields, { rejectWithValue }) => {
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

export const updateProfile = createAsyncThunk<
  AccountResponse,
  UpdateProfileFields,
  { rejectValue: string }
>("auth/update-profile", async (fields, { rejectWithValue }) => {
  try {
    const response = await AccountService.updateProfile(fields);
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message = err.response?.data?.message || "Failed to update profile";
      return rejectWithValue(message);
    }

    return rejectWithValue("Unknown Error");
  }
});
