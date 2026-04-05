import { IUser } from "../../../entities/user/types/IUser";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}
