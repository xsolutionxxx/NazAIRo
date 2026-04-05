import $api from "@shared/api";
import { AxiosResponse } from "axios";
import { AccountResponse } from "./accountResponse";

export default class AccountService {
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
}
