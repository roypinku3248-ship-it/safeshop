'use client';

import React from 'react';
import { sellers } from '@/data/mockData';
import { ShieldCheck, Star, MapPin } from 'lucide-react';
import styles from './Sellers.module.css';

export default function SellersPage() {
  return (
    <div className={styles.sellersPage}>
      <div className="container">
        <div className={styles.header}>
          <h1>Verified Direct Sellers</h1>
          <p>Every seller on SafeShop has passed 100% ID verification and background checks.</p>
        </div>

        <div className={styles.sellersGrid}>
          {sellers.map(seller => (
            <div key={seller.id} className={styles.sellerCard}>
              <div className={styles.sellerMain}>
                <div className={styles.avatar}>{seller.name[0]}</div>
                <div className={styles.info}>
                  <div className={styles.nameRow}>
                    <h3>{seller.name}</h3>
                    <ShieldCheck size={20} color="var(--primary)" />
                  </div>
                  <div className={styles.meta}>
                    <span><Star size={14} /> {seller.rating} Rating</span>
                    <span><MapPin size={14} /> {seller.location}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <strong>{seller.totalSales}</strong>
                  <span>Successful Sales</span>
                </div>
                <div className={styles.stat}>
                  <strong>100%</strong>
                  <span>Escrow Success</span>
                </div>
              </div>

              <div className={styles.badges}>
                <span className={styles.badge}>Fast Shipper</span>
                <span className={styles.badge}>Responsive</span>
              </div>

              <button className={styles.viewBtn}>View Profile & Products</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
