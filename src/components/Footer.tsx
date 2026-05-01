import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Play, Users, Globe, ShieldAlert, Truck, RotateCcw, CreditCard, SmartphoneNfc, Landmark, Wallet } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.trustBanner}>
          <div className={styles.trustItem}>
            <ShieldCheck size={40} className={styles.trustIcon} />
            <div>
              <h4>100% Buyer Protection</h4>
              <p>Your money is safe until delivery</p>
            </div>
          </div>
          <div className={styles.trustItem}>
            <ShieldAlert size={40} className={styles.trustIcon} />
            <div>
              <h4>Verified Sellers Only</h4>
              <p>KYC approved & background checked</p>
            </div>
          </div>
          <div className={styles.trustItem}>
            <RotateCcw size={40} className={styles.trustIcon} />
            <div>
              <h4>Easy 7-Day Returns</h4>
              <p>No questions asked refunds</p>
            </div>
          </div>
          <div className={styles.trustItem}>
            <Truck size={40} className={styles.trustIcon} />
            <div>
              <h4>Secure Express Delivery</h4>
              <p>Tracked shipping across India</p>
            </div>
          </div>
        </div>

        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.logo}>
              <ShieldCheck className={styles.logoIcon} size={28} />
              <span className={styles.logoText}>Safe<span>Shop</span></span>
            </Link>
            <p className={styles.brandDesc}>
              India's first scam-free marketplace. We prioritize your safety above everything else.
            </p>
            <div className={styles.socials}>
              <Play size={20} />
              <Users size={20} />
              <Globe size={20} />
            </div>
          </div>

          <div className={styles.footerLinks}>
            <h4>Shopping</h4>
            <Link href="/products">All Products</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/sellers">Top Sellers</Link>
            <Link href="/offers">Safe Deals</Link>
          </div>

          <div className={styles.footerLinks}>
            <h4>Trust & Safety</h4>
            <Link href="/protection">Buyer Protection</Link>
            <Link href="/seller-policy">Seller KYC Process</Link>
            <Link href="/kyc" className={styles.footerSupportBtn}>ID Verification</Link>
            <Link href="/disputes">Report a Scam</Link>
            <Link href="/escrow">How Escrow Works</Link>
          </div>

          <div className={styles.footerLinks}>
            <h4>Company</h4>
            <Link href="/about">About Us</Link>
            <Link href="/careers">Careers</Link>
            <Link href="/contact">Contact Support</Link>
            <Link href="/privacy">Privacy Policy</Link>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p>© 2024 SafeShop India. All Rights Reserved.</p>
          <div className={styles.payments}>
            <div className={styles.payIcon} title="UPI"><SmartphoneNfc size={24} /></div>
            <div className={styles.payIcon} title="Credit Cards"><CreditCard size={24} /></div>
            <div className={styles.payIcon} title="Net Banking"><Landmark size={24} /></div>
            <div className={styles.payIcon} title="Wallets"><Wallet size={24} /></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
