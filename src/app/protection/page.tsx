'use client';

import React from 'react';
import { ShieldCheck, Lock, Truck, RotateCcw, AlertCircle } from 'lucide-react';
import styles from './Protection.module.css';

export default function ProtectionPage() {
  return (
    <div className={styles.protectionPage}>
      <div className="container">
        <div className={styles.hero}>
          <ShieldCheck size={80} color="var(--primary)" />
          <h1>SafeShop Buyer Protection</h1>
          <p>Your security is our #1 priority. Every transaction on SafeShop is protected by our automated Escrow system.</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <Lock size={32} color="var(--secondary)" />
            <h3>Escrow Payment System</h3>
            <p>When you buy a product, your money is held in a secure SafeShop account. We only release payment to the seller after you confirm delivery.</p>
          </div>
          <div className={styles.card}>
            <Truck size={32} color="var(--secondary)" />
            <h3>Verified Delivery</h3>
            <p>Every shipment is tracked. If the product isn't delivered or is different from the description, you get a 100% refund.</p>
          </div>
          <div className={styles.card}>
            <RotateCcw size={32} color="var(--secondary)" />
            <h3>7-Day Return Policy</h3>
            <p>Not happy with your purchase? You have 7 days to request a return. We'll handle the process and ensure your money is safe.</p>
          </div>
          <div className={styles.card}>
            <AlertCircle size={32} color="var(--secondary)" />
            <h3>Scam Protection</h3>
            <p>Our AI and human moderators monitor all listings. If a seller is found to be fraudulent, they are banned and your money is refunded instantly.</p>
          </div>
        </div>

        <div className={styles.howItWorks}>
          <h2>How it Works</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNum}>1</div>
              <h4>You Buy</h4>
              <p>Place an order using secure UPI, Cards, or NetBanking.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>2</div>
              <h4>Money in Escrow</h4>
              <p>SafeShop holds your payment securely. Seller is notified to ship.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>3</div>
              <h4>You Receive</h4>
              <p>Product arrives. You check it and click "Confirm Receipt".</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>4</div>
              <h4>Seller Gets Paid</h4>
              <p>Only then is the money released to the seller's wallet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
