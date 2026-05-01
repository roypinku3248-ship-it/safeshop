"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlus, MapPin, User, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './Register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    country: 'India',
    state: '',
    city: '',
    ps: '',
    po: '',
    pin: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUserId = `SS-USR-${Math.floor(Math.random() * 10000)}`;
    const newUser = {
      id: newUserId,
      name: formData.name,
      email: formData.email,
      password: formData.password, // In a real app, hash this!
      phone: formData.phone,
      state: formData.state,
      city: formData.city,
      ps: formData.ps,
      po: formData.po,
      pin: formData.pin,
      role: 'user',
      status: 'pending',
      total_sales: 0,
      joined_at: new Date().toISOString()
    };

    try {
      // 1. Save to Supabase (The Real Database)
      const { error } = await supabase
        .from('users')
        .insert([newUser]);

      if (error) throw error;

      // 2. Backup to LocalStorage (For immediate login flow)
      localStorage.setItem('safeshop-pending-registration', JSON.stringify(formData));
      
      const globalUsers = JSON.parse(localStorage.getItem('safeshop-global-users') || '[]');
      localStorage.setItem('safeshop-global-users', JSON.stringify([...globalUsers, newUser]));
      
      router.push('/login?registered=true');
    } catch (error: any) {
      console.error('Registration error:', error.message);
      alert('Error during registration: ' + error.message);
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className="container">
        <div className={styles.card}>
          <motion.div 
            className={styles.header}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles.iconBox}><UserPlus size={32} /></div>
            <h1>Create Your Account</h1>
            <p>Join SafeShop for a secure and protected shopping experience.</p>
          </motion.div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.grid}>
              {/* Account Details */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <User size={18} />
                  <h3>Basic Details</h3>
                </div>
                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Legal name" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="10-digit number" 
                      required 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="your@email.com" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Create Password</label>
                  <input 
                    type="password" 
                    placeholder="Min 8 characters" 
                    required 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              {/* Address Details */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <MapPin size={18} />
                  <h3>Full Address (P.S. & P.O.)</h3>
                </div>
                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label>State</label>
                    <input 
                      type="text" 
                      placeholder="e.g. West Bengal" 
                      required 
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>City</label>
                    <input 
                      type="text" 
                      placeholder="City/Town" 
                      required 
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                </div>
                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label>Police Station (P.S.)</label>
                    <input 
                      type="text" 
                      placeholder="P.S. name" 
                      required 
                      value={formData.ps}
                      onChange={(e) => setFormData({...formData, ps: e.target.value})}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Post Office (P.O.)</label>
                    <input 
                      type="text" 
                      placeholder="P.O. name" 
                      required 
                      value={formData.po}
                      onChange={(e) => setFormData({...formData, po: e.target.value})}
                    />
                  </div>
                </div>
                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label>PIN Code</label>
                    <input 
                      type="text" 
                      placeholder="6-digit PIN" 
                      required 
                      value={formData.pin}
                      onChange={(e) => setFormData({...formData, pin: e.target.value})}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Country</label>
                    <input type="text" value="India" readOnly />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.agreement}>
              <input type="checkbox" required />
              <span>I agree to the SafeShop Terms & Privacy Policy.</span>
            </div>

            <button type="submit" className={`${styles.submitBtn} gradient-primary`}>
              Complete Registration
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
