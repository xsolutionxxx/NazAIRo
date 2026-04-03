import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import AuthService from "../api/authService";
import { AuthResponse } from "../api/authResponde";

interface RegistrationFields {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  terms: boolean;
}

export interface LoginFields {
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
    console.log(response.data);
    localStorage.setItem("token", response.data.accessToken);
    return response.data;
  } catch (err: unknown) {
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
    console.log(response.data);
    localStorage.setItem("token", response.data.accessToken);
    return response.data;
  } catch (err: unknown) {
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
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || "Registration Error";
        return rejectWithValue(message);
      }

      return rejectWithValue("Unknown Error");
    }
  },
);
