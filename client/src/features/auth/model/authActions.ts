import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

import AuthService from "../api/authService";
import { AuthResponse } from "../api/authResponse";

import $api from "@shared/api";

interface RegistrationFields {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  terms: boolean;
}

interface LoginFields {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const registration = createAsyncThunk<
  AuthResponse,
  RegistrationFields,
  { rejectValue: string }
>("auth/registration", async (fields, { rejectWithValue }) => {
  try {
    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
      terms,
    } = fields;
    const response = await AuthService.registration(
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
      terms,
    );
    localStorage.setItem("token", response.data.accessToken);
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
    const { email, password, rememberMe } = fields;
    const response = await AuthService.login(email, password, rememberMe);
    localStorage.setItem("token", response.data.accessToken);
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message = err.response?.data?.message || "Registration Error";
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
      localStorage.removeItem("token");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || "Registration Error";
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
    const response = await $api<AuthResponse>("/refresh");
    localStorage.setItem("token", response.data.accessToken);
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
      }
      const message = err.response?.data?.message || "Auth check failed";
      return rejectWithValue(message);
    }

    return rejectWithValue("Unknown Error");
  }
});
