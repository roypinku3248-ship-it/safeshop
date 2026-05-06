'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ShieldAlert, Lock, CreditCard, Landmark, Wallet, CheckCircle2, Loader2, ArrowRight, Truck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './Checkout.module.css';

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState<'details' | 'payment' | 'processing' | 'success'>('details');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?callbackUrl=/checkout');
    }
    if (!loading && cart.length === 0 && step !== 'success') {
      router.push('/cart');
    }
  }, [isAuthenticated, loading, cart.length, router, step]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is verified before allowing purchase
    if (user?.status?.toLowerCase() !== 'verified') {
      alert('Verification Required: You must complete your KYC and get verified before you can purchase a business package.');
      router.push('/kyc');
      return;
    }

    setStep('processing');
    
    const pendingOrderId = localStorage.getItem('safeshop-pending-order-id');
    const isActivation = !!pendingOrderId;
    
    const orderId = isActivation ? pendingOrderId : `#SS-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalStatus = paymentMethod === 'cod' ? 'Awaiting Verification (COD)' : 'In Transit (Escrow Active)';

    const orderData = {
      user_id: user?.id || 'anonymous',
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        bv: (item as any).bv || 100
      })),
      total_amount: totalPrice,
      status: finalStatus
    };

    try {
      if (isActivation) {
        // Update existing order
        const { error } = await supabase
          .from('orders')
          .update(orderData)
          .eq('id', pendingOrderId);
        if (error) throw error;
      } else {
        // Insert new order
        const { error } = await supabase
          .from('orders')
          .insert([{ id: orderId, ...orderData }]);
        if (error) throw error;
      }

      // If online payment, wait for mock processing
      if (paymentMethod !== 'cod') {
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // 4. Update user's status to 'verified' upon payment
      await supabase
        .from('users')
        .update({ status: 'verified' })
        .eq('id', user.id);

      setStep('success');
      clearCart();
      localStorage.removeItem('safeshop-pending-order-id');
    } catch (err: any) {
      alert('Error processing order: ' + err.message);
      setStep('payment');
    }
  };

  if (loading || (!user && step !== 'success')) {
    return <div className={styles.loading}>Loading secure checkout...</div>;
  }

  if (step === 'success') {
    return (
      <div className={styles.successPage}>
        <div className="container">
          <div className={styles.successCard}>
            <CheckCircle2 size={80} className={styles.successIcon} />
            <h1>Order Placed Safely!</h1>
            <p>Your payment of <strong>₹{totalPrice.toLocaleString('en-IN')}</strong> is held securely in SafeShop Escrow.</p>
            <div className={styles.orderInfo}>
              <p>Order ID: <strong>#SS-{Math.floor(100000 + Math.random() * 900000)}</strong></p>
              <p>The seller has been notified and will ship your items shortly.</p>
            </div>
            <div className={styles.escrowNotice}>
              <ShieldCheck size={20} />
              <span>{paymentMethod === 'cod' ? 'Our agent will contact you for cash collection and verification.' : 'Reminder: We only release funds to the seller after you confirm receiving the correct items.'}</span>
            </div>
            <button onClick={() => router.push('/dashboard')} className="gradient-primary">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutPage}>
      <div className="container">
        <div className={styles.layout}>
          <div className={styles.main}>
            {user?.status?.toLowerCase() !== 'verified' && (
              <div style={{ background: '#fff9e6', border: '1px solid #ffeeba', padding: '15px', borderRadius: '12px', marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <ShieldAlert size={32} color="#856404" />
                <div>
                  <h4 style={{ color: '#856404', margin: 0 }}>ID Verification Required</h4>
                  <p style={{ color: '#856404', margin: '4px 0 0 0', fontSize: '0.9rem' }}>You must verify your ID to purchase business packages and earn commissions.</p>
                </div>
                <button onClick={() => router.push('/kyc')} style={{ marginLeft: 'auto', background: '#856404', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>Verify Now</button>
              </div>
            )}

            {step === 'details' && (
              <div className={styles.section}>
                <h2>1. Shipping Details</h2>
                <form className={styles.form}>
                  <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                      <label>Full Name</label>
                      <input type="text" defaultValue={user?.name} required />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Phone Number</label>
                      <input type="tel" placeholder="+91 00000 00000" required />
                    </div>
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Street Address</label>
                    <textarea placeholder="House No, Street, Area" required />
                  </div>
                  <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                      <label>City</label>
                      <input type="text" required />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Pincode</label>
                      <input type="text" maxLength={6} required />
                    </div>
                  </div>
                  <button type="button" onClick={() => setStep('payment')} className={`${styles.nextBtn} gradient-primary`}>
                    Continue to Payment <ArrowRight size={18} />
                  </button>
                </form>
              </div>
            )}

            {step === 'payment' && (
              <div className={styles.section}>
                <h2>2. Secure Payment (Escrow)</h2>
                <div className={styles.paymentMethods}>
                  <div 
                    className={`${styles.method} ${paymentMethod === 'upi' ? styles.activeMethod : ''}`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <Wallet size={24} />
                    <span>UPI (GPay, PhonePe, Paytm)</span>
                  </div>
                  <div 
                    className={`${styles.method} ${paymentMethod === 'card' ? styles.activeMethod : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard size={24} />
                    <span>Credit / Debit Card</span>
                  </div>
                  <div 
                    className={`${styles.method} ${paymentMethod === 'netbanking' ? styles.activeMethod : ''}`}
                    onClick={() => setPaymentMethod('netbanking')}
                  >
                    <Landmark size={24} />
                    <span>Net Banking</span>
                  </div>
                  <div 
                    className={`${styles.method} ${paymentMethod === 'cod' ? styles.activeMethod : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <Truck size={24} />
                    <span>Cash on Delivery (COD)</span>
                  </div>
                </div>

                <div className={styles.paymentDetails}>
                  {paymentMethod === 'upi' && (
                    <div className={styles.upiForm}>
                      <p>Pay using any UPI app</p>
                      <input type="text" placeholder="Enter UPI ID (e.g. rahul@okaxis)" />
                    </div>
                  )}
                  {paymentMethod === 'card' && (
                    <div className={styles.cardForm}>
                      <input type="text" placeholder="Card Number" />
                      <div className={styles.inputRow}>
                        <input type="text" placeholder="MM/YY" />
                        <input type="password" placeholder="CVV" />
                      </div>
                    </div>
                  )}
                  {paymentMethod === 'cod' && (
                    <div className={styles.upiForm}>
                      <p>Pay with cash upon delivery of your welcome kit.</p>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#059669', background: '#ecfdf5', padding: '10px', borderRadius: '8px', fontSize: '0.9rem' }}>
                        <CheckCircle2 size={16} />
                        <span>COD available for this business package</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.actions}>
                  <button onClick={() => setStep('details')} className={styles.backBtn}>Back</button>
                  <button onClick={handlePlaceOrder} className={`${styles.payBtn} gradient-primary`}>
                    Pay ₹{totalPrice.toLocaleString('en-IN')} Securely
                  </button>
                </div>
              </div>
            )}

            {step === 'processing' && (
              <div className={styles.processing}>
                <Loader2 className="animate-spin" size={60} color="var(--primary)" />
                <h2>Securing Your Transaction...</h2>
                <p>We are initializing the SafeShop Escrow for your order.</p>
                <div className={styles.lockBox}>
                  <Lock size={16} />
                  <span>256-bit SSL Encrypted Connection</span>
                </div>
              </div>
            )}
          </div>

          <aside className={styles.summary}>
            <div className={styles.summaryCard}>
              <h3>Order Summary</h3>
              <div className={styles.itemList}>
                {cart.map(item => (
                  <div key={item.id} className={styles.item}>
                    <img src={item.image} alt={item.name} />
                    <div className={styles.itemInfo}>
                      <span>{item.name} x {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.divider} />
              <div className={styles.totalRow}>
                <span>Total Amount</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.protectionNote}>
                <ShieldCheck size={16} />
                <span>Escrow Protected: Money stays safe until you confirm delivery.</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
