"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import { products, sellers } from '@/data/mockData';
import { ShieldCheck, ArrowRight, Star, CheckCircle2, Smartphone, Shirt, Home as HomeIcon, Sparkles, Utensils, Trophy, Package, Award } from 'lucide-react';
import styles from './page.module.css';
import Link from 'next/link';

export default function Home() {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className={styles.home}>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Hero />
      </motion.section>

      {/* Featured Categories */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Shop by Verified Categories</h2>
            <Link href="/categories" className={styles.viewAll}>
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className={styles.categories}>
            {[
              { name: 'Electronics', icon: <Smartphone size={24} /> },
              { name: 'Fashion', icon: <Shirt size={24} /> },
              { name: 'Home', icon: <HomeIcon size={24} /> },
              { name: 'Beauty', icon: <Sparkles size={24} /> },
              { name: 'Kitchen', icon: <Utensils size={24} /> },
              { name: 'Sports', icon: <Trophy size={24} /> }
            ].map((cat, i) => (
              <motion.div 
                key={cat.name} 
                className={styles.categoryCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={styles.catIcon}>{cat.icon}</div>
                <span>{cat.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className={`${styles.section} ${styles.trustSection}`}>
        <div className="container">
          <div className={styles.trustGrid}>
            <motion.div 
              className={styles.trustContent}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className={styles.trustBadge}>SafeShop Guarantee</div>
              <h2>Why India trusts SafeShop for high-value purchases.</h2>
              <p>We've eliminated the risks of online shopping through a multi-layered verification system.</p>
              
              <ul className={styles.trustList}>
                <li>
                  <CheckCircle2 className={styles.listIcon} />
                  <div>
                    <h4>Every Seller is KYC Verified</h4>
                    <p>We check ID, business address, and warehouse location before approving any seller.</p>
                  </div>
                </li>
                <li>
                  <CheckCircle2 className={styles.listIcon} />
                  <div>
                    <h4>Escrow Protected Payments</h4>
                    <p>Your money is held by us and only released to the seller after you receive and approve the product.</p>
                  </div>
                </li>
                <li>
                  <CheckCircle2 className={styles.listIcon} />
                  <div>
                    <h4>Zero-Tolerance Scam Policy</h4>
                    <p>Any seller found selling fakes is permanently banned and reported to authorities.</p>
                  </div>
                </li>
              </ul>
            </motion.div>
            <motion.div 
              className={styles.trustImage}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className={styles.imagePlaceholder}>
                <ShieldCheck size={120} color="var(--secondary)" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Top Products */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Highest Safety Rated Products</h2>
            <Link href="/products" className={styles.viewAll}>
              Browse All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid-products">
            {featuredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Seller Highlights */}
      <section className={`${styles.section} ${styles.sellerSection}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Top Verified Sellers</h2>
            <Link href="/sellers" className={styles.viewAll}>
              Meet All Sellers <ArrowRight size={16} />
            </Link>
          </div>
          <div className={styles.sellersGrid}>
            {sellers.map((seller, i) => (
              <motion.div 
                key={seller.id} 
                className={styles.sellerCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={styles.sellerHeader}>
                  <div className={styles.sellerAvatar}>{seller.name[0]}</div>
                  <div className={styles.sellerMeta}>
                    <h4>{seller.name} <ShieldCheck size={14} color="var(--primary)" /></h4>
                    <span>{seller.location}</span>
                  </div>
                </div>
                <div className={styles.sellerStats}>
                  <div className={styles.stat}>
                    <span className={styles.statVal}>{seller.safetyScore}</span>
                    <span className={styles.statLabel}>Safety Score</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statVal}>{seller.rating}★</span>
                    <span className={styles.statLabel}>Rating</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statVal}>{seller.totalSales}+</span>
                    <span className={styles.statLabel}>Sales</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>What our buyers say</h2>
          </div>
          <div className={styles.reviewsGrid}>
            {[
              { name: 'Rahul S.', text: 'Finally a site where I don\'t have to worry about getting a soap bar instead of a phone!', rating: 5 },
              { name: 'Anjali M.', text: 'The safety score really helps in making decisions. Bought a laptop and the experience was seamless.', rating: 5 },
              { name: 'Vikram K.', text: 'Verified sellers give me peace of mind. Delivery was fast and tracking was accurate.', rating: 4 }
            ].map((review, i) => (
              <motion.div 
                key={i} 
                className={styles.reviewCard}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={styles.stars}>
                  {[...Array(review.rating)].map((_, j) => <Star key={j} size={16} fill="#ffab00" color="#ffab00" />)}
                </div>
                <p>"{review.text}"</p>
                <div className={styles.reviewer}>
                  <strong>{review.name}</strong>
                  <span>Verified Purchase</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification CTA */}
      <section className={styles.verificationCTA}>
        <div className="container">
          <div className={styles.vBox}>
            <div className={styles.vText}>
              <div className={styles.vBadge}>Trust & Safety</div>
              <h2>Want to sell on SafeShop?</h2>
              <p>Complete your ID verification to join India's most trusted network of sellers. Get the blue tick and start selling securely.</p>
            </div>
            <Link href="/kyc" className={`${styles.vBtn} gradient-secondary`}>
              Verify My ID <ShieldCheck size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className="container">
          <motion.div 
            className={`${styles.ctaBox} gradient-trust`}
            whileHover={{ scale: 1.01 }}
          >
            <h2>Ready for a scam-free shopping experience?</h2>
            <p>Join thousands of Indians who shop with 100% confidence on SafeShop.</p>
            <Link href="/register" className={styles.ctaBtn}>Create Secure Account</Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
