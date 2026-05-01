"use client";

import React from 'react';
import { Plus } from 'lucide-react';
import styles from '@/app/dashboard/Dashboard.module.css';

interface Referral {
  id: string;
  name: string;
  avatar: string;
  sales: number;
  indirectSales: number;
}

interface NetworkTreeProps {
  rootUser: {
    name: string;
    id: string;
  };
  referrals: Referral[];
  onAddMember?: () => void;
  isAdminView?: boolean;
}

export const NetworkTree: React.FC<NetworkTreeProps> = ({ 
  rootUser, 
  referrals, 
  onAddMember,
  isAdminView = false 
}) => {
  return (
    <div className={styles.treeContainer}>
      {/* Root: Specified User */}
      <div className={styles.treeNodeRoot}>
        <div className={styles.nodeAvatar}>{rootUser.name[0]}</div>
        <strong>{rootUser.name}</strong>
        <span>ID: {rootUser.id}</span>
      </div>
      
      <div className={styles.treeConnectorsTernary}>
        <div className={styles.connectorLineTernary} />
      </div>
      
      <div className={styles.treeChildrenTernary}>
        {referrals.map((ref, idx) => (
          <div key={ref.id} className={styles.treeBranch}>
            <div className={styles.treeNode}>
              <div className={styles.nodeAvatar} style={{ background: idx % 2 === 0 ? 'var(--primary)' : 'var(--secondary)' }}>{ref.avatar}</div>
              <strong>{ref.name}</strong>
              <span>Sales: ₹{ref.sales}</span>
              {ref.indirectSales > 0 && (
                <div className={styles.indirectBadge}>+{Math.floor(ref.indirectSales/2000)} Indirect</div>
              )}
            </div>
          </div>
        ))}
        
        {/* Empty Slots if less than 3 (Only show "Join" if not admin view) */}
        {!isAdminView && referrals.length < 3 && Array(3 - referrals.length).fill(0).map((_, i) => (
          <div key={`empty-${i}`} className={styles.treeBranch}>
            <div className={`${styles.treeNode} ${styles.emptyNode}`}>
              <div className={styles.nodeAvatar}>?</div>
              <strong>Empty Slot</strong>
              {onAddMember && (
                <button className={styles.miniJoinBtn} onClick={onAddMember}>Join</button>
              )}
            </div>
          </div>
        ))}

        {/* If Admin View and less than 3, just show placeholders */}
        {isAdminView && referrals.length < 3 && Array(3 - referrals.length).fill(0).map((_, i) => (
          <div key={`empty-admin-${i}`} className={styles.treeBranch}>
            <div className={`${styles.treeNode} ${styles.emptyNode}`}>
              <div className={styles.nodeAvatar}>-</div>
              <strong>No Referral</strong>
              <span>Available</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
