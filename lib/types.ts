// Shared TypeScript interfaces and types

export interface Car {
  id: string;
  name: string;
  price: number;
  transmission: string;
  fuelType: string;
  images: string[];
  videos: string[];
  condition: string;
  location: string;
  description?: string;
  vehicleType?: string;
  color?: string;
  papers?: string;
  sold: boolean;
  createdAt: string;
}

export type CarFormData = Omit<Car, 'id' | 'createdAt'>;
