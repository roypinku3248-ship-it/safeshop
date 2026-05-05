"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, ArrowLeft, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './Register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    state: '',
    city: '',
    ps: '',
    po: '',
    pin: ''
  });

  const [step, setStep] = React.useState(1); // 1: Form, 2: OTP
  const [otp, setOtp] = React.useState('');
  const [isVerifying, setIsVerifying] = React.useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      // 1. Check if email already exists in custom users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        throw new Error('This email is already registered. Please login instead.');
      }

      // 2. Send OTP via Supabase Auth
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email
      });

      if (error) throw error;

      alert(`✅ OTP sent to ${formData.email}. Please check your inbox (and Spam folder).`);
      setStep(2);
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      // 1. Verify OTP
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: otp,
        type: 'email'
      });

      if (verifyError) throw new Error('Invalid or expired OTP. Please try again.');

      // 2. OTP is valid, now create the record in our custom users table
      const newUserId = `SS-USR-${Math.floor(Math.random() * 100000)}`;
      const newUser = {
        id: newUserId,
        ...formData,
        role: 'user',
        status: 'pending',
        total_sales: 0,
        joined_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('users')
        .insert([newUser]);

      if (insertError) throw insertError;

      alert('🎉 Registration successful! You can now login.');
      router.push('/login?registered=true');
    } catch (error: any) {
      alert('Verification Failed: ' + error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className="container">
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.iconBox}>
              {step === 1 ? <UserPlus size={32} /> : <Mail size={32} />}
            </div>
            <h1>{step === 1 ? 'Create Account' : 'Verify Email'}</h1>
            <p>
              {step === 1 
                ? 'Join SafeShop for a secure and protected experience.' 
                : `Enter the 6-digit code sent to ${formData.email}`}
            </p>
          </div>

          {step === 1 ? (
            <form className={styles.form} onSubmit={handleSendOtp}>
              <div className={styles.grid}>
                <div className={styles.inputGroup}>
                  <label>Full Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Email Address</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Password</label>
                  <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Phone Number</label>
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label>State</label>
                  <input type="text" required value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label>City</label>
                  <input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label>P.S. (Police Station)</label>
                  <input type="text" required value={formData.ps} onChange={(e) => setFormData({...formData, ps: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label>P.O. (Post Office)</label>
                  <input type="text" required value={formData.po} onChange={(e) => setFormData({...formData, po: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label>PIN Code</label>
                  <input type="text" required value={formData.pin} onChange={(e) => setFormData({...formData, pin: e.target.value})} />
                </div>
              </div>

              <div className={styles.agreement}>
                <input type="checkbox" required />
                <span>I agree to the SafeShop Terms & Privacy Policy.</span>
              </div>

              <button type="submit" className={`${styles.submitBtn} gradient-primary`} disabled={isVerifying}>
                {isVerifying ? 'Checking email...' : 'Send OTP & Register'}
              </button>
            </form>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.otpSection}>
                <label>Verification Code</label>
                <input 
                  type="text" 
                  maxLength={6} 
                  className={styles.otpInput} 
                  placeholder="000000"
                  required 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)}
                  autoFocus
                />
                <p className={styles.resendText}>
                  Didn't receive it? <button type="button" onClick={handleSendOtp} className={styles.linkBtn}>Resend OTP</button>
                </p>
              </div>

              <button type="submit" className={`${styles.submitBtn} gradient-primary`} disabled={isVerifying}>
                {isVerifying ? 'Verifying...' : 'Complete Verification'}
              </button>
              
              <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>
                <ArrowLeft size={16} /> Edit Details
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
