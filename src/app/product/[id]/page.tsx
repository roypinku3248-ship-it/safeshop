"use client";

import React, { use } from 'react';
import { products } from '@/data/mockData';
import { ShieldCheck, Star, Truck, ShieldAlert, Heart, Share2, Info } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './ProductDetail.module.css';
import Link from 'next/link';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = products.find(p => p.id === id) || products[0];
  const { addToCart } = useCart();

  return (
    <div className={styles.detailPage}>
      <div className="container">
        <div className={styles.breadcrumb}>
          <span>Home</span> / <span>{product.category}</span> / <span>{product.name}</span>
        </div>

        <div className={styles.mainGrid}>
          {/* Image Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              <img src={product.image} alt={product.name} />
            </div>
            <div className={styles.thumbnails}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={styles.thumb}>
                  <img src={product.image} alt="thumbnail" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className={styles.info}>
            <div className={styles.sellerBadge}>
              <ShieldCheck size={16} color="var(--primary)" />
              <span>Verified Seller: <strong>{product.seller.name}</strong></span>
            </div>

            <h1 className={styles.title}>{product.name}</h1>

            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill={i < Math.floor(product.rating) ? "#ffab00" : "none"} color="#ffab00" />
                ))}
              </div>
              <span className={styles.reviewCount}>({product.reviewsCount} verified reviews)</span>
              <span className={styles.divider}>|</span>
              <div className={styles.safetyScore}>
                <ShieldCheck size={16} />
                <span>Safety Score: {product.safetyScore}/10</span>
              </div>
            </div>

            <div className={styles.priceSection}>
              <div className={styles.priceRow}>
                <span className={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
                {product.originalPrice && (
                  <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
                )}
                <span className={styles.discount}>
                  {Math.round((1 - product.price / (product.originalPrice || product.price)) * 100)}% OFF
                </span>
              </div>
              <p className={styles.taxInfo}>Inclusive of all taxes</p>
            </div>

            <div className={styles.trustBox}>
              <div className={styles.trustItem}>
                <ShieldCheck size={20} className={styles.trustIcon} />
                <div>
                  <h4>Buyer Protection Guaranteed</h4>
                  <p>Money held in escrow until delivery is confirmed by you.</p>
                </div>
              </div>
              <div className={styles.trustItem}>
                <Truck size={20} className={styles.trustIcon} />
                <div>
                  <h4>Insured Shipping</h4>
                  <p>Free express shipping with full insurance coverage.</p>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button 
                className={`${styles.addToCart} gradient-primary`}
                onClick={() => addToCart(product)}
              >
                Add to Cart
              </button>
              <Link href="/cart" className={styles.buyNow} onClick={() => addToCart(product)}>
                Buy Now
              </Link>
              <button className={styles.wishlist}><Heart size={20} /></button>
            </div>

            <div className={styles.description}>
              <h3>Product Description</h3>
              <p>{product.description}</p>
              <ul>
                {product.features.map((f, i) => <li key={i}><CheckCircle size={14} /> {f}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CheckCircle = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--secondary)', marginRight: '8px' }}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
