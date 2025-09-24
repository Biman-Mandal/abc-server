export interface IVehiclePrice {
  _id?: string;
  vehicleId: string;
  pricePerKm?: number;
  pricePerMile?: number;
  currency: string;
  basePrice?: number;
  additionalCharges?: {
    name: string;
    amount: number;
    type: 'fixed' | 'percentage';
  }[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}