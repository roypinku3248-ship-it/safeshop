"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Lock, Zap, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.heroContent}>
          <motion.div 
            className={styles.heroText}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.badge}>
              <ShieldCheck size={16} /> Verified Secured Marketplace
            </div>
            <h1>Safe Shopping, <span>Zero Scams.</span></h1>
            <p>The only platform with 100% ID-verified sellers and escrow-protected payments. Shop with total peace of mind.</p>
            <div className={styles.heroBtns}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/products" className="gradient-primary">
                  Explore Products <ArrowRight size={20} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/seller/list-product" className={styles.outlineBtn}>
                  Start Selling
                </Link>
              </motion.div>
            </div>

            <div className={styles.trustStrip}>
              <div className={styles.trustItem}><Lock size={16} /> Escrow Protected</div>
              <div className={styles.trustItem}><Zap size={16} /> Instant Support</div>
              <div className={styles.trustItem}><Award size={16} /> Verified Badge</div>
            </div>
          </motion.div>
          
          <motion.div 
            className={styles.heroImage}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className={styles.imagePlaceholder}>
               <div className={styles.floatingCard}>
                 <ShieldCheck size={24} color="var(--secondary)" />
                 <div>
                   <strong>100% Verified</strong>
                   <span>Seller Network</span>
                 </div>
               </div>
               <ShieldCheck size={180} color="var(--primary)" opacity={0.1} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
