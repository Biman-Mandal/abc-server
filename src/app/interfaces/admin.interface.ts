export interface IAdmin {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "superadmin";
  profilePictureUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;

  comparePassword?(enteredPassword: string): Promise<boolean>;
}
