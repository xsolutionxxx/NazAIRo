export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  isActivated: boolean;
}
