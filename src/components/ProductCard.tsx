"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShieldCheck, TrendingUp, ShoppingCart } from 'lucide-react';
import { Product } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Link href={`/product/${product.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={product.image} alt={product.name} className={styles.image} />
        <div className={styles.safetyBadge}>
          <ShieldCheck size={14} />
          <span>{product.safetyScore}/10 Safe</span>
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.categoryRow}>
          <span className={styles.category}>{product.category}</span>
          <div className={styles.rating}>
            <Star size={14} fill="currentColor" />
            <span>{product.rating}</span>
          </div>
        </div>
        
        <h3 className={styles.name}>{product.name}</h3>
        
        <div className={styles.sellerRow}>
          <ShieldCheck size={12} className={styles.verifiedIcon} />
          <span className={styles.sellerName}>{product.seller.name}</span>
        </div>

        <div className={styles.priceRow}>
          <div className={styles.priceInfo}>
            <div className={styles.price}>
              <span className={styles.currency}>₹</span>
              <span className={styles.amount}>{product.price.toLocaleString('en-IN')}</span>
            </div>
            {product.originalPrice && (
              <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
          <button 
            className={styles.addToCartBtn} 
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
        
        <div className={styles.trustFooter}>
          <TrendingUp size={12} />
          <span>Trusted by 500+ buyers</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
