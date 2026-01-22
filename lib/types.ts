// Shared TypeScript interfaces and types

export interface Car {
  name: string;
  id: string;
  price: string;
  transmission: string;
  fuelType: string;
  images: string[];
  videos: string[];
  tiktokUrl: string | null;
  location: string;
  description: string | null;
  vehicleType: string | null;
  color: string | null;
  papers: string | null;
  status: number;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CarFormData = Omit<Car, 'id' | 'createdAt'>;
