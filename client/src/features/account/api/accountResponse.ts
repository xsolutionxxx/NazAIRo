import { IUser } from "@/entities/user/types/IUser";

export interface AccountResponse {
  user: IUser;
  message?: string;
}
