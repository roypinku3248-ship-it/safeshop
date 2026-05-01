"use client";

import React, { use } from 'react';
import { sellers, products } from '@/data/mockData';
import ProductCard from '@/components/ProductCard';
import { ShieldCheck, MapPin, Calendar, Star, Package, ThumbsUp } from 'lucide-react';
import styles from '../Seller.module.css';

export default function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const seller = sellers.find(s => s.id === id) || sellers[0];
  const sellerProducts = products.filter(p => p.seller.id === seller.id);

  return (
    <div className={styles.sellerPage}>
      <div className={styles.sellerHeaderSection}>
        <div className="container">
          <div className={styles.headerContent}>
            <div className={styles.avatar}>{seller.name[0]}</div>
            <div className={styles.info}>
              <div className={styles.nameRow}>
                <h1>{seller.name}</h1>
                {seller.isVerified && (
                  <div className={styles.verifiedBadge}>
                    <ShieldCheck size={16} />
                    <span>KYC Verified Seller</span>
                  </div>
                )}
              </div>
              <div className={styles.metaRow}>
                <div className={styles.metaItem}><MapPin size={16} /> {seller.location}</div>
                <div className={styles.metaItem}><Calendar size={16} /> Joined {seller.joinedDate}</div>
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.followBtn}>Follow Seller</button>
              <button className={styles.contactBtn}>Contact Support</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statVal}>{seller.safetyScore}/10</span>
            <span className={styles.statLabel}>Safety Score</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>{seller.rating} ★</span>
            <span className={styles.statLabel}>Positive Rating</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>{seller.totalSales}+</span>
            <span className={styles.statLabel}>Success Deliveries</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>0.2%</span>
            <span className={styles.statLabel}>Return Rate</span>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.sidebar}>
            <div className={styles.trustCard}>
              <h3>Seller Verification</h3>
              <ul className={styles.verificationList}>
                <li><ShieldCheck size={14} color="var(--secondary)" /> Business GST Registered</li>
                <li><ShieldCheck size={14} color="var(--secondary)" /> Warehouse Verified</li>
                <li><ShieldCheck size={14} color="var(--secondary)" /> PAN Card Authenticated</li>
                <li><ShieldCheck size={14} color="var(--secondary)" /> No Scam Reports in 12 Months</li>
              </ul>
            </div>
          </div>

          <div className={styles.productsArea}>
            <div className={styles.areaHeader}>
              <h2>Products by {seller.name}</h2>
              <span>{sellerProducts.length} items</span>
            </div>
            <div className="grid-products">
              {sellerProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
