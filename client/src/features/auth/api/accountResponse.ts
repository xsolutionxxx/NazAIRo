import { IUser } from "@/entities/user/types/IUser";

export interface AccountResponse extends IUser {
  message?: string;
}
