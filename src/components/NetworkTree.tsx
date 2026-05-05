"use client";

import React from 'react';
import { User, Users, ChevronRight, Share2, TrendingUp, PlusCircle } from 'lucide-react';
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
  const [viewType, setViewType] = React.useState<'pyramid' | 'list'>('list');

  const displayedUsers = referrals.slice(0, 50);
  
  // Find the next available leg index (0, 1, or 2)
  const nextLegIdx = displayedUsers.length < 3 ? displayedUsers.length : -1;

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
            Direct Join List
          </button>
        </div>
      </div>

      {viewType === 'pyramid' ? (
        <div className={styles.pyramidLayout}>
          <div className={styles.rootBox}>
            <div className={styles.nodeAvatarMain}>{(rootUser.name || 'U')[0]}</div>
            <strong>{rootUser.name}</strong>
            <span className={styles.idBadge}>ID: {rootUser.id.substring(0, 8)}</span>
          </div>

          <div className={styles.connectorLine} />

          <div className={styles.levelOne}>
            {[0, 1, 2].map((idx) => {
              const user = displayedUsers[idx];
              const isNextToJoin = idx === nextLegIdx && !isAdminView;

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
                  ) : isNextToJoin ? (
                    <div className={`${styles.emptyNode} ${styles.activeJoinNode}`} onClick={onAddMember}>
                      <div className={styles.plusIcon}><PlusCircle size={24} /></div>
                      <button>Join Now</button>
                    </div>
                  ) : (
                    <div className={styles.emptyNode}>
                      <div className={styles.plusIcon} style={{ opacity: 0.3 }}>+</div>
                      <span>Locked</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {displayedUsers.length > 3 && (
            <div className={styles.moreIndicator}>
              <TrendingUp size={16} />
              <span>+{displayedUsers.length - 3} more members in your direct team</span>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.listLayout}>
          <div className={styles.listGrid}>
            {displayedUsers.map((user, index) => (
              <div key={user.id} className={styles.listBranch}>
                <div className={styles.listConnector} />
                <div className={styles.listItem}>
                  <div className={styles.listIndex}>{index + 1}</div>
                  <div className={styles.listUser}>
                    <div className={styles.listAvatar}>{user.name[0]}</div>
                    <div>
                      <strong>{user.name}</strong>
                      <p>{user.email}</p>
                    </div>
                  </div>
                  <div className={styles.listStats}>
                    <div className={user.status === 'verified' ? styles.statusV : styles.statusP}>
                      {user.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* The NEXT spot to join */}
            {!isAdminView && displayedUsers.length < 50 && (
              <div className={styles.listBranch}>
                <div className={styles.listConnector} />
                <div className={`${styles.listItem} ${styles.joinRow}`} onClick={onAddMember}>
                  <div className={styles.listIndex}>{displayedUsers.length + 1}</div>
                  <div className={styles.listUser}>
                    <div className={`${styles.listAvatar} ${styles.joinAvatar}`}><PlusCircle size={20} /></div>
                    <div>
                      <strong style={{ color: 'var(--primary)' }}>Add New Member</strong>
                      <p>Click here to join a user to your direct network</p>
                    </div>
                  </div>
                  <div className={styles.listStats}>
                    <button className={styles.miniJoinBtnAction}>Join Now</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
