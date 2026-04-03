import $api from "@shared/api/index";
import { AxiosResponse } from "axios";
import { AuthResponse } from "./authResponde";

export default class AuthService {
  static async registration(
    email: string,
    password: string,
    confirmPassword: string,
    firstName: string,
    lastName: string,
    phone: string,
    terms: boolean,
  ): Promise<AxiosResponse<AuthResponse>> {
    return $api.post<AuthResponse>("/registration", {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
      terms,
    });
  }

  static async login(
    email: string,
    password: string,
    rememberMe: boolean,
  ): Promise<AxiosResponse<AuthResponse>> {
    return $api.post<AuthResponse>("/login", { email, password, rememberMe });
  }

  static async logout(): Promise<void> {
    return $api.post("/logout");
  }
}
