"use client";

import React from 'react';
import { ShoppingCart, ShieldCheck, Trash2, ArrowRight, Lock, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './Cart.module.css';
import Link from 'next/link';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  if (cart.length === 0) {
    return (
      <div className={styles.cartPage}>
        <div className="container">
          <div className={styles.emptyCart}>
            <ShoppingBag size={80} className={styles.emptyIcon} />
            <h1>Your cart is empty</h1>
            <p>Looks like you haven't added any verified products yet.</p>
            <Link href="/products" className="gradient-primary" style={{ padding: '12px 24px', borderRadius: '8px', color: 'white', display: 'inline-block', marginTop: '20px' }}>
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      <div className="container">
        <h1>Shopping Cart</h1>

        <div className={styles.layout}>
          <div className={styles.cartList}>
            {cart.map(item => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemImg}>
                  <img src={item.image} alt={item.name} />
                </div>
                <div className={styles.itemInfo}>
                  <Link href={`/product/${item.id}`}>
                    <h3>{item.name}</h3>
                  </Link>
                  <div className={styles.sellerInfo}>
                    <ShieldCheck size={14} color="var(--primary)" />
                    <span>{item.seller.name}</span>
                  </div>
                  <div className={styles.itemPrice}>₹{item.price.toLocaleString('en-IN')}</div>
                </div>
                <div className={styles.itemQty}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={16} /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={16} /></button>
                </div>
                <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}><Trash2 size={18} /></button>
              </div>
            ))}
          </div>

          <aside className={styles.summary}>
            <div className={styles.summaryCard}>
              <h3>Order Summary</h3>
              <div className={styles.summaryRow}>
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span className={styles.free}>FREE</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Tax</span>
                <span>₹0</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>

              <div className={styles.trustMicrocopy}>
                <Lock size={14} />
                <span>Secure Checkout with SafeShop Escrow</span>
              </div>

              <Link href="/checkout" className={`${styles.checkoutBtn} gradient-primary`}>
                Proceed to Checkout <ArrowRight size={18} />
              </Link>
            </div>
            
            <div className={styles.protectionBox}>
              <h4>SafeShop Buyer Protection</h4>
              <p>Your payment is 100% safe. We only release funds to the seller after you confirm delivery.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
