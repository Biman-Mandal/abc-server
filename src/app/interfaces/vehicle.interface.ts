export interface IVehicle {
  _id?: string;
  title: string;
  vehicleTypeId: string;
  fuelType: 'gas' | 'diesel' | 'hybrid' | 'electric';
  ownership?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}