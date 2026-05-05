'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import styles from './Login.module.css';
import Link from 'next/link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await login(email, password);
      // Redirect Admin directly to Admin Panel
      if (email === 'admin@smstudioapp.com') {
        router.push('/admin');
      } else {
        router.push(callbackUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginCard}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <ShieldCheck size={40} className={styles.logoIcon} />
          <span>Safe<span>Shop</span></span>
        </div>
        <h1>Welcome Back</h1>
        <p>India's first scam-free marketplace</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.inputGroup}>
          <label>Email Address</label>
          <div className={styles.inputWrapper}>
            <Mail size={18} className={styles.inputIcon} />
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <div className={styles.labelRow}>
            <label>Password</label>
            <Link href="/forgot-password" className={styles.forgot}>Forgot?</Link>
          </div>
          <div className={styles.inputWrapper}>
            <Lock size={18} className={styles.inputIcon} />
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
        </div>

        <button type="submit" className={`${styles.submitBtn} gradient-primary`} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
            <>Sign In <ArrowRight size={18} /></>
          )}
        </button>
      </form>

      <div className={styles.footer}>
        <p>New to SafeShop? <Link href="/register">Create a secure account</Link></p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.loginPage}>
      <div className="container">
        <Suspense fallback={<div className={styles.loadingBox}><Loader2 className="animate-spin" /> Loading secure portal...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
