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

export const sellers: Seller[] = [
  {
    id: 's1',
    name: 'TechHub India',
    isVerified: true,
    safetyScore: 9.8,
    joinedDate: 'Jan 2022',
    totalSales: 1250,
    rating: 4.9,
    location: 'Bangalore, KA'
  },
  {
    id: 's2',
    name: 'FashionForward',
    isVerified: true,
    safetyScore: 9.5,
    joinedDate: 'Mar 2023',
    totalSales: 840,
    rating: 4.7,
    location: 'Mumbai, MH'
  },
  {
    id: 's3',
    name: 'HomeEssentials',
    isVerified: true,
    safetyScore: 9.2,
    joinedDate: 'Jun 2022',
    totalSales: 2100,
    rating: 4.6,
    location: 'Delhi, NCR'
  }
];

export const products: Product[] = [
  {
    id: 'p1',
    name: 'SafeAudio Pro Wireless Headphones',
    price: 4999,
    originalPrice: 7999,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
    category: 'Electronics',
    safetyScore: 9.7,
    seller: sellers[0],
    rating: 4.8,
    reviewsCount: 156,
    description: 'High-fidelity audio with active noise cancellation. Verified for quality and durability.',
    features: ['Noise Cancellation', '40h Battery', 'Fast Charging', 'Sweat Resistant'],
    bv: 200
  },
  {
    id: 'p2',
    name: 'EcoComfort Ergo Office Chair',
    price: 12499,
    originalPrice: 15999,
    image: 'https://images.unsplash.com/photo-1505843490701-5be559b3e14b?auto=format&fit=crop&q=80&w=600',
    category: 'Furniture',
    safetyScore: 9.4,
    seller: sellers[2],
    rating: 4.7,
    reviewsCount: 89,
    description: 'Ergonomic design for long working hours. Sustainable materials and robust build.',
    features: ['Lumbar Support', 'Breathable Mesh', 'Adjustable Arms', 'Tilt Lock'],
    bv: 500
  },
  {
    id: 'p3',
    name: 'UltraSync Smart Watch Gen 5',
    price: 3599,
    originalPrice: 5999,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
    category: 'Electronics',
    safetyScore: 9.8,
    seller: sellers[0],
    rating: 4.9,
    reviewsCount: 245,
    description: 'Track your health and stay connected. Certified by SafeShop for accurate sensor data.',
    features: ['Heart Rate Monitor', 'Sleep Tracking', 'IP68 Waterproof', 'NFC Payments'],
    bv: 150
  },
  {
    id: 'p4',
    name: 'Luxe Cotton Minimalist Tee',
    price: 899,
    originalPrice: 1299,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600',
    category: 'Fashion',
    safetyScore: 9.2,
    seller: sellers[1],
    rating: 4.5,
    reviewsCount: 312,
    description: 'Premium organic cotton. No shrinkage or color fading guaranteed.',
    features: ['100% Organic Cotton', 'Pre-shrunk', 'Breathable', 'Unisex Fit'],
    bv: 40
  },
  {
    id: 'p5',
    name: 'Titanium Chef Cookware Set',
    price: 6799,
    originalPrice: 9499,
    image: 'https://images.unsplash.com/photo-1584949091598-c31daaaa4aa9?auto=format&fit=crop&q=80&w=600',
    category: 'Kitchen',
    safetyScore: 9.5,
    seller: sellers[2],
    rating: 4.6,
    reviewsCount: 124,
    description: 'Non-stick titanium reinforced coating. Safe for all stovetops including induction.',
    features: ['Induction Base', 'PFOA Free', 'Stay-cool Handles', 'Dishwasher Safe'],
    bv: 300
  },
  {
    id: 'p6',
    name: 'SwiftCharge 20000mAh Power Bank',
    price: 1899,
    originalPrice: 2999,
    image: 'https://images.unsplash.com/photo-1609592806457-41484803732e?auto=format&fit=crop&q=80&w=600',
    category: 'Electronics',
    safetyScore: 9.9,
    seller: sellers[0],
    rating: 4.9,
    reviewsCount: 412,
    description: 'High capacity portable charger with multiple safety layers against overcharging.',
    features: ['Multi-layer Protection', 'Dual Output', 'LED Indicator', 'Type-C Input'],
    bv: 100
  }
];
