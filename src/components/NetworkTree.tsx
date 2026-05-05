"use client";

import React from 'react';
import { User, Users, ChevronRight, Share2, TrendingUp } from 'lucide-react';
import styles from './NetworkTree.module.css';

interface Referral {
  id: string;
  name: string;
  email?: string;
  status?: string;
  total_sales?: number;
  joined_at?: string;
}

interface NetworkTreeProps {
  rootUser: {
    name: string;
    id: string;
  };
  referrals: any[];
  onAddMember?: () => void;
  isAdminView?: boolean;
}

export const NetworkTree: React.FC<NetworkTreeProps> = ({ 
  rootUser, 
  referrals = [], 
  onAddMember,
  isAdminView = false 
}) => {
  const [viewType, setViewType] = React.useState<'pyramid' | 'list'>('pyramid');

  const displayedUsers = referrals.slice(0, 50);

  return (
    <div className={styles.treeWrapper}>
      <div className={styles.treeHeader}>
        <div className={styles.viewToggle}>
          <button 
            className={viewType === 'pyramid' ? styles.activeView : ''} 
            onClick={() => setViewType('pyramid')}
          >
            Ternary Pyramid
          </button>
          <button 
            className={viewType === 'list' ? styles.activeView : ''} 
            onClick={() => setViewType('list')}
          >
            Direct Join List (Up to 50)
          </button>
        </div>
      </div>

      {viewType === 'pyramid' ? (
        <div className={styles.pyramidLayout}>
          {/* Root User */}
          <div className={styles.rootBox}>
            <div className={styles.nodeAvatarMain}>{(rootUser.name || 'U')[0]}</div>
            <strong>{rootUser.name}</strong>
            <span className={styles.idBadge}>ID: {rootUser.id.substring(0, 8)}</span>
          </div>

          <div className={styles.connectorLine} />

          {/* Level 1: First 3 Referrals */}
          <div className={styles.levelOne}>
            {[0, 1, 2].map((idx) => {
              const user = displayedUsers[idx];
              return (
                <div key={idx} className={styles.branchWrapper}>
                  <div className={styles.legLabel}>Leg {idx + 1}</div>
                  {user ? (
                    <div className={styles.nodeCard}>
                      <div className={styles.miniAvatar}>{user.name[0]}</div>
                      <strong>{user.name}</strong>
                      <span className={user.status === 'verified' ? styles.verified : styles.pending}>
                        {user.status || 'Pending'}
                      </span>
                    </div>
                  ) : (
                    <div className={styles.emptyNode}>
                      <div className={styles.plusIcon}>+</div>
                      {!isAdminView && <button onClick={onAddMember}>Add User</button>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {displayedUsers.length > 3 && (
            <div className={styles.moreIndicator}>
              <TrendingUp size={16} />
              <span>+{displayedUsers.length - 3} more members growing below</span>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.listLayout}>
          <div className={styles.listGrid}>
            {displayedUsers.map((user, index) => (
              <div key={user.id} className={styles.listItem}>
                <div className={styles.listIndex}>{index + 1}</div>
                <div className={styles.listUser}>
                  <div className={styles.listAvatar}>{user.name[0]}</div>
                  <div>
                    <strong>{user.name}</strong>
                    <p>{user.email}</p>
                  </div>
                </div>
                <div className={styles.listStats}>
                  <div>
                    <span>Sales</span>
                    <strong>₹{user.total_sales || 0}</strong>
                  </div>
                  <div className={user.status === 'verified' ? styles.statusV : styles.statusP}>
                    {user.status}
                  </div>
                </div>
              </div>
            ))}
            {displayedUsers.length === 0 && (
              <div className={styles.noData}>
                <Users size={48} />
                <p>No members in your direct network yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
