import $api from "@shared/api/index";
import { AxiosResponse } from "axios";
import { IUser } from "../../../entities/user/types/IUser";

export default class AdminService {
  static fetchUsers(): Promise<AxiosResponse<IUser[]>> {
    return $api.get<IUser[]>("/users");
  }
}
