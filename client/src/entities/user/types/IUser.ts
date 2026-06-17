export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  backgroundUrl?: string;
  role?: "CLIENT" | "ADMIN";
  isActivated: boolean;
}
