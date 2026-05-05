"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, ArrowLeft, Mail, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './Register.module.css';
import toast from 'react-hot-toast';

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
  const [otpStatus, setOtpStatus] = React.useState<'idle' | 'sent' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = React.useState('');
  const [resendCooldown, setResendCooldown] = React.useState(0);

  // Countdown timer for resend cooldown
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      // 1. Check if email already registered
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        toast.error('This email is already registered. Please login instead.');
        return;
      }

      // 2. Create the record in our custom users table directly
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

      toast.success('🎉 Registration successful! You can now login.');
      router.push('/login?registered=true');
    } catch (error: any) {
      toast.error('Registration Failed: ' + error.message);
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
              <UserPlus size={32} />
            </div>
            <h1>Create Account</h1>
            <p>Join SafeShop for a secure and protected experience.</p>
          </div>

          <form className={styles.form} onSubmit={handleRegister}>
            <div className={styles.grid}>
              {/* Form fields remain same */}
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
              {isVerifying ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
