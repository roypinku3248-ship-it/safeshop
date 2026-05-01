"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, ShieldCheck, Menu, X, LogOut, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className={`${styles.nav} glass`}>
      <div className="container">
        <div className={styles.navContent}>
          <Link href="/" className={styles.logo}>
            <ShieldCheck className={styles.logoIcon} size={32} />
            <span className={styles.logoText}>Safe<span>Shop</span></span>
          </Link>

          <div className={styles.searchBar}>
            <input type="text" placeholder="Search for verified products..." />
            <button className={styles.searchButton}>
              <Search size={20} />
            </button>
          </div>

          <div className={styles.navActions}>
            {isAuthenticated ? (
              <div className={styles.userProfile}>
                <Link href="/dashboard" className={styles.navItem}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className={styles.avatar} />
                  ) : (
                    <User size={24} />
                  )}
                  <span>{user?.name.split(' ')[0]}</span>
                </Link>
                <button onClick={logout} className={styles.logoutBtn} title="Sign Out">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link href="/login" className={styles.navItem}>
                <User size={24} />
                <span>Login</span>
              </Link>
            )}
            
            {user && (user.role === 'seller' || user.role === 'admin') && (
              <Link href={user.role === 'admin' ? '/admin' : '/seller/list-product'} className={`${styles.navItem} ${styles.sellBtn}`}>
                <Plus size={20} />
                <span>{user.role === 'admin' ? 'Admin' : 'Sell'}</span>
              </Link>
            )}

            <Link href="/cart" className={styles.navItem}>
              <div className={styles.cartIconWrapper}>
                <ShoppingCart size={24} />
                {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
              </div>
              <span>Cart</span>
            </Link>
            <button className={styles.mobileMenuBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileSearch}>
            <input type="text" placeholder="Search products..." />
          </div>
          <Link href="/products" onClick={() => setIsMenuOpen(false)}>Shop All</Link>
          <Link href="/sellers" onClick={() => setIsMenuOpen(false)}>Verified Sellers</Link>
          <Link href="/seller/list-product" onClick={() => setIsMenuOpen(false)}>Sell on SafeShop</Link>
          <Link href="/trust" onClick={() => setIsMenuOpen(false)}>Buyer Protection</Link>
          <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>My Account</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
