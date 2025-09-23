export interface IEmergencyContact {
  _id?: string;
  user_id: string;
  name: string;
  phone?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}