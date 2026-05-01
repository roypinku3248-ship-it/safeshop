'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Upload, FileText, CheckCircle, AlertCircle, Camera, UserCircle } from 'lucide-react';
import styles from './KYC.module.css';

export default function KYCPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [docType, setDocType] = useState('aadhaar');

  if (!isAuthenticated) {
    router.push('/login?callbackUrl=/kyc');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to localStorage so Admin can see it
    const pendingKyc = JSON.parse(localStorage.getItem('safeshop-kyc-queue') || '[]');
    const newRequest = {
      id: Date.now().toString(),
      name: user?.name || 'Anonymous User',
      email: user?.email, // Added email for admin to track
      type: docType === 'aadhaar' ? 'Aadhaar Card' : (docType === 'pan' ? 'PAN Card' : 'Voter ID'),
      date: new Date().toLocaleDateString(),
      status: 'Pending',
      hasFace: true,
      hasDoc: true
    };
    localStorage.setItem('safeshop-kyc-queue', JSON.stringify([newRequest, ...pendingKyc]));
    
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className={styles.kycPage}>
        <div className="container">
          <div className={styles.successCard}>
            <CheckCircle size={80} color="var(--primary)" className={styles.icon} />
            <h1>Verification in Progress</h1>
            <p>Your documents and face photo have been uploaded successfully. The Root Admin will review your profile shortly.</p>
            <div className={styles.statusBox}>
              <span>Status:</span>
              <strong className={styles.pendingText}>Under Review</strong>
            </div>
            <button onClick={() => router.push('/dashboard')} className="gradient-primary">Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.kycPage}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.badge}><ShieldCheck size={16} /> Secure Verification</div>
          <h1>Identity & Face Verification</h1>
          <p>Complete your 3-step verification to unlock full selling and recruitment features.</p>
        </div>

        <div className={styles.layout}>
          <div className={styles.formCard}>
            <form onSubmit={handleSubmit}>
              {/* Step 1 */}
              <div className={styles.section}>
                <div className={styles.stepNum}>1</div>
                <h3>Choose Document Type</h3>
                <div className={styles.docTypeGrid}>
                  <button 
                    type="button" 
                    className={docType === 'aadhaar' ? styles.activeDoc : ''} 
                    onClick={() => setDocType('aadhaar')}
                  >
                    <FileText size={18} /> Aadhaar
                  </button>
                  <button 
                    type="button" 
                    className={docType === 'pan' ? styles.activeDoc : ''} 
                    onClick={() => setDocType('pan')}
                  >
                    <FileText size={18} /> PAN Card
                  </button>
                  <button 
                    type="button" 
                    className={docType === 'voter' ? styles.activeDoc : ''} 
                    onClick={() => setDocType('voter')}
                  >
                    <FileText size={18} /> Voter ID
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className={styles.section}>
                <div className={styles.stepNum}>2</div>
                <h3>Upload ID Documents</h3>
                <div className={styles.uploadGrid}>
                  <div className={styles.uploadBox}>
                    <input type="file" required id="doc-front" className={styles.fileInput} />
                    <label htmlFor="doc-front">
                      <Upload size={24} />
                      <span>Front Side</span>
                      <small>JPG, PNG or PDF</small>
                    </label>
                  </div>
                  <div className={styles.uploadBox}>
                    <input type="file" required id="doc-back" className={styles.fileInput} />
                    <label htmlFor="doc-back">
                      <Upload size={24} />
                      <span>Back Side</span>
                      <small>JPG, PNG or PDF</small>
                    </label>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className={styles.section}>
                <div className={styles.stepNum}>3</div>
                <h3>Face Verification</h3>
                <div className={styles.faceVerification}>
                  <div className={styles.faceInstruction}>
                    <div className={styles.faceIcon}><UserCircle size={40} /></div>
                    <div>
                      <p>Upload a clear selfie holding your ID card.</p>
                      <small>Ensure your face and ID details are clearly visible.</small>
                    </div>
                  </div>
                  <div className={styles.uploadBoxFull}>
                    <input type="file" required id="face-photo" className={styles.fileInput} />
                    <label htmlFor="face-photo">
                      <Camera size={24} />
                      <span>Click to Upload Selfie</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.consent}>
                <input type="checkbox" required id="consent" />
                <label htmlFor="consent">I confirm that the documents uploaded belong to me and all information is accurate.</label>
              </div>

              <button type="submit" className={`${styles.submitBtn} gradient-primary`}>
                Submit All Documents
              </button>
            </form>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.infoCard}>
              <h3>Security Promise</h3>
              <p>Your documents are encrypted and only accessible by the Root Admin for verification purposes. We never share your data with 3rd parties.</p>
              <div className={styles.shield}><ShieldCheck size={48} /></div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
