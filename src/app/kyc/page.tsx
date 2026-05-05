'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Upload, FileText, CheckCircle, AlertCircle, Camera, UserCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './KYC.module.css';

export default function KYCPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<{front?: File, back?: File, face?: File}>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [docType, setDocType] = useState('aadhaar');

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?callbackUrl=/kyc');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return <div className={styles.kycPage}><div className="container">Checking verification status...</div></div>;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const fileName = `${user?.id}_${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('kyc-docs')
      .upload(`${path}/${fileName}`, file);
    
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('kyc-docs').getPublicUrl(data.path);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.front || !files.back || !files.face) {
      alert('Please upload all required documents and your face photo.');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload Files
      const frontUrl = await uploadFile(files.front, 'front');
      const backUrl = await uploadFile(files.back, 'back');
      const faceUrl = await uploadFile(files.face, 'face');

      // 2. Insert Submission Record
      const newRequest = {
        user_id: user?.id || 'anonymous',
        user_name: user?.name || 'Anonymous User',
        user_email: user?.email,
        doc_type: docType === 'aadhaar' ? 'Aadhaar Card' : (docType === 'pan' ? 'PAN Card' : 'Voter ID'),
        doc_front_url: frontUrl,
        doc_back_url: backUrl,
        face_photo_url: faceUrl,
        status: 'Pending',
        has_face: true,
        has_doc: true
      };

      const { error } = await supabase
        .from('kyc_submissions')
        .insert([newRequest]);

      if (error) throw error;
      setIsSubmitted(true);
    } catch (err: any) {
      alert('Error submitting KYC: ' + err.message);
    } finally {
      setIsUploading(false);
    }
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
                    <input type="file" required id="doc-front" className={styles.fileInput} onChange={(e) => handleFileChange(e, 'front')} />
                    <label htmlFor="doc-front" className={files.front ? styles.fileSelected : ''}>
                      <Upload size={24} />
                      <span>{files.front ? files.front.name : 'Front Side'}</span>
                      <small>JPG, PNG or PDF</small>
                    </label>
                  </div>
                  <div className={styles.uploadBox}>
                    <input type="file" required id="doc-back" className={styles.fileInput} onChange={(e) => handleFileChange(e, 'back')} />
                    <label htmlFor="doc-back" className={files.back ? styles.fileSelected : ''}>
                      <Upload size={24} />
                      <span>{files.back ? files.back.name : 'Back Side'}</span>
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
                    <input type="file" required id="face-photo" className={styles.fileInput} onChange={(e) => handleFileChange(e, 'face')} />
                    <label htmlFor="face-photo" className={files.face ? styles.fileSelected : ''}>
                      <Camera size={24} />
                      <span>{files.face ? files.face.name : 'Click to Upload Selfie'}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.consent}>
                <input type="checkbox" required id="consent" />
                <label htmlFor="consent">I confirm that the documents uploaded belong to me and all information is accurate.</label>
              </div>

              <button type="submit" disabled={isUploading} className={`${styles.submitBtn} gradient-primary`}>
                {isUploading ? 'Uploading Documents...' : 'Submit All Documents'}
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
