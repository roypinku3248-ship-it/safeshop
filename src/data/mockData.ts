export interface Seller {
  id: string;
  name: string;
  isVerified: boolean;
  safetyScore: number;
  joinedDate: string;
  totalSales: number;
  rating: number;
  location: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  safetyScore: number;
  seller: Seller;
  rating: number;
  reviewsCount: number;
  description: string;
  features: string[];
  bv: number; // Business Volume points
}

export const sellers: Seller[] = [];

export const products: Product[] = [];
