// Shared TypeScript interfaces and types

export interface Car {
  id: string;
  name: string;
  brand: string;
  price: number;
  year: number;
  transmission: string;
  fuelType: string;
  images: string[];
  condition: string;
  location: string;
  description?: string;
  vehicleType?: string;
  sold: boolean;
  createdAt: string;
}

export type CarFormData = Omit<Car, 'id' | 'createdAt'>;
