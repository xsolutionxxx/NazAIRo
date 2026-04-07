import $api from "@shared/api/index";
import { AxiosResponse } from "axios";
import { AuthResponse } from "./authResponse";
import { AccountResponse } from "./accountResponse";
import { UpdateProfileFields } from "../model/authActions";

export class AuthService {
  static async registration(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
  ): Promise<AxiosResponse<AuthResponse>> {
    return $api.post<AuthResponse>("/registration", {
      email,
      password,
      firstName,
      lastName,
      phone,
    });
  }

  static async login(
    email: string,
    password: string,
  ): Promise<AxiosResponse<AuthResponse>> {
    return $api.post<AuthResponse>("/login", { email, password });
  }

  static async logout(): Promise<void> {
    return $api.post("/logout");
  }
}

export class AccountService {
  static async changeEmail(
    newEmail: string,
    password: string,
  ): Promise<AxiosResponse<AccountResponse>> {
    return $api.post<AccountResponse>("/request-email-change", {
      newEmail,
      password,
    });
  }

  static async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string,
  ): Promise<AxiosResponse<AccountResponse>> {
    return $api.post<AccountResponse>("/change-password", {
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
  }

  static async updateProfile(
    fields: UpdateProfileFields,
  ): Promise<AxiosResponse<AccountResponse>> {
    return $api.patch<AccountResponse>("/update-profile", fields);
  }
}
