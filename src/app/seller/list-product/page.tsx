'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Package, IndianRupee, Tag, Image as ImageIcon, Plus, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './ListProduct.module.css';

export default function ListProductPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?callbackUrl=/seller/list-product');
    }
  }, [isAuthenticated, loading, router]);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    features: [''],
    stock: '1',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (loading || !isAuthenticated) {
    return <div className={styles.listPage}><div className="container">Verifying seller access...</div></div>;
  }

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newProduct = {
      name: formData.name,
      price: Number(formData.price),
      category: formData.category,
      description: formData.description,
      features: formData.features,
      image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600", // Default mock image
      bv: Math.floor(Number(formData.price) / 25),
      seller_id: user?.id,
      status: 'pending'
    };

    try {
      const { error } = await supabase
        .from('products')
        .insert([newProduct]);

      if (error) throw error;

      // Also keep a local backup for UI feedback
      const pendingProducts = JSON.parse(localStorage.getItem('safeshop-pending-products') || '[]');
      localStorage.setItem('safeshop-pending-products', JSON.stringify([newProduct, ...pendingProducts]));
      
      setIsSuccess(true);
    } catch (err: any) {
      alert('Error listing product: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.successPage}>
        <div className="container">
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <CheckCircle size={80} color="var(--primary)" />
            </div>
            <h1>Product Submitted for Review!</h1>
            <p>Our safety team will verify your product details within 24 hours. You'll receive a notification once it's live.</p>
            <div className={styles.successActions}>
              <button onClick={() => router.push('/dashboard')} className="gradient-primary">Go to Dashboard</button>
              <button onClick={() => setIsSuccess(false)} className={styles.secondaryBtn}>List Another Product</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.listPage}>
      <div className="container">
        <div className={styles.header}>
          <h1>List a New Product</h1>
          <p>Every product on SafeShop is verified for authenticity and safety.</p>
        </div>

        <div className={styles.layout}>
          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <Info size={20} />
                <h2>Basic Information</h2>
              </div>
              <div className={styles.inputGroup}>
                <label>Product Name</label>
                <div className={styles.inputWrapper}>
                  <Package size={18} className={styles.inputIcon} />
                  <input 
                    type="text" 
                    placeholder="e.g. iPhone 15 Pro Max - Verified" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div className={styles.grid}>
                <div className={styles.inputGroup}>
                  <label>Price (₹)</label>
                  <div className={styles.inputWrapper}>
                    <IndianRupee size={18} className={styles.inputIcon} />
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      required 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label>Category</label>
                  <div className={styles.inputWrapper}>
                    <Tag size={18} className={styles.inputIcon} />
                    <select 
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Home">Home</option>
                      <option value="Beauty">Beauty</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Description & Features */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <ImageIcon size={20} />
                <h2>Details & Images</h2>
              </div>
              <div className={styles.inputGroup}>
                <label>Product Description</label>
                <textarea 
                  className={styles.textarea}
                  rows={4} 
                  placeholder="Describe your product in detail..." 
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <div className={styles.inputGroup}>
                <label>Key Features (One per line)</label>
                {formData.features.map((feature, index) => (
                  <input 
                    key={index}
                    type="text" 
                    placeholder={`Feature ${index + 1}`} 
                    className={styles.featureInput}
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                  />
                ))}
                <button type="button" onClick={addFeature} className={styles.addBtn}>
                  <Plus size={16} /> Add Feature
                </button>
              </div>
              <div className={styles.uploadArea}>
                <ImageIcon size={40} />
                <p>Click to upload product images</p>
                <span>PNG, JPG up to 10MB (Max 5 images)</span>
                <input type="file" multiple className={styles.fileInput} />
              </div>
            </div>

            <button type="submit" className={`${styles.submitBtn} gradient-primary`} disabled={isSubmitting}>
              {isSubmitting ? 'Verifying Details...' : 'Submit for Verification'}
            </button>
          </form>

          <aside className={styles.sidebar}>
            <div className={styles.safetyCheck}>
              <h3>SafeShop Listing Policy</h3>
              <div className={styles.policyItem}>
                <ShieldCheck size={20} color="var(--primary)" />
                <p>Only authentic, non-counterfeit items allowed.</p>
              </div>
              <div className={styles.policyItem}>
                <ShieldCheck size={20} color="var(--primary)" />
                <p>Accurate photos of the actual product must be provided.</p>
              </div>
              <div className={styles.policyItem}>
                <AlertTriangle size={20} color="var(--warning)" />
                <p>Falsifying information leads to permanent ban.</p>
              </div>
            </div>

            <div className={styles.escrowHint}>
              <h4>Escrow Protected Sale</h4>
              <p>When you sell this item, the buyer's payment will be held in our secure escrow. Funds are released to you after the buyer confirms delivery.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
