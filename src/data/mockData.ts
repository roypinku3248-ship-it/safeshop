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
    id: 'SS-ADMIN-MASTER',
    name: 'Root Admin Store',
    isVerified: true,
    safetyScore: 9.8,
    joinedDate: '2024-01-01',
    totalSales: 1500,
    rating: 4.9,
    location: 'Mumbai, MH'
  },
  {
    id: 'S-VERIFIED-001',
    name: 'Prime Electronics',
    isVerified: true,
    safetyScore: 9.5,
    joinedDate: '2024-02-15',
    totalSales: 850,
    rating: 4.8,
    location: 'Bangalore, KA'
  },
  {
    id: 'S-VERIFIED-002',
    name: 'Fashion Hub',
    isVerified: true,
    safetyScore: 9.2,
    joinedDate: '2024-03-10',
    totalSales: 420,
    rating: 4.7,
    location: 'Delhi, DL'
  }
];

const categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Groceries'];

const baseProducts = [
  { name: 'Ultra HD Smart TV 55"', price: 45999, originalPrice: 59999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500' },
  { name: 'Wireless Noise Cancelling Headphones', price: 12999, originalPrice: 18999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
  { name: 'Smartphone Pro Max 256GB', price: 89999, originalPrice: 94999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500' },
  { name: 'Gaming Laptop RTX 4060', price: 74999, originalPrice: 89999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500' },
  { name: 'Smart Watch Series 9', price: 32999, originalPrice: 35999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' },
  { name: 'Premium Cotton Polo Shirt', price: 1299, originalPrice: 1999, category: 'Fashion', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500' },
  { name: 'Classic Leather Watch', price: 4500, originalPrice: 6000, category: 'Fashion', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500' },
  { name: 'Designer Denim Jacket', price: 2999, originalPrice: 4500, category: 'Fashion', image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500' },
  { name: 'Running Sneakers Pro', price: 3500, originalPrice: 5500, category: 'Fashion', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500' },
  { name: 'Silk Summer Dress', price: 2499, originalPrice: 3999, category: 'Fashion', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500' },
  { name: 'Ergonomic Office Chair', price: 12500, originalPrice: 15000, category: 'Home', image: 'https://images.unsplash.com/photo-1505797149-43b0000ee20e?w=500' },
  { name: 'Modern Coffee Table', price: 8999, originalPrice: 12000, category: 'Home', image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=500' },
  { name: 'LED Desk Lamp', price: 1500, originalPrice: 2500, category: 'Home', image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=500' },
  { name: 'Velvet Sofa 3-Seater', price: 34999, originalPrice: 45000, category: 'Home', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500' },
  { name: 'Abstract Wall Art', price: 2200, originalPrice: 3500, category: 'Home', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500' }
];

const generateProducts = () => {
  const allProducts: Product[] = [];
  
  // Add base products
  baseProducts.forEach((p, idx) => {
    allProducts.push({
      id: `P-${1000 + idx}`,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      category: p.category,
      image: p.image,
      safetyScore: 7 + (idx % 4), // Deterministic
      seller: sellers[idx % sellers.length],
      rating: 4 + (idx % 10) / 10, // Deterministic
      reviewsCount: 50 + idx * 10,
      description: 'This premium product is verified by SafeShop for 100% authenticity and safety.',
      features: ['1 Year Warranty', 'Free Shipping', 'Verified Seller', 'Escrow Protected'],
      bv: Math.floor(p.price / 10)
    });
  });

  // Generate 40 more to reach 55
  for (let i = 1; i <= 40; i++) {
    const cat = categories[i % categories.length];
    const price = 500 + i * 200;
    allProducts.push({
      id: `P-${2000 + i}`,
      name: `${cat} Verified Essential #${i}`,
      price: price,
      originalPrice: price + Math.floor(price * 0.2),
      category: cat,
      image: `https://images.unsplash.com/photo-${1500000000000 + i}?w=500&auto=format`,
      safetyScore: 6 + (i % 5),
      seller: sellers[i % sellers.length],
      rating: 3.5 + (i % 15) / 10,
      reviewsCount: 20 + i * 5,
      description: 'High-quality verified item sourced from trusted sellers across India.',
      features: ['Secure Packaging', 'Fast Delivery', 'Quality Assured'],
      bv: Math.floor(price / 10)
    });
  }

  return allProducts;
};

export const products = generateProducts();
