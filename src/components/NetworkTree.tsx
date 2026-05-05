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
  directReferrals: any[];
  fullTeam: any[];
  onAddMember?: (parentId?: string, legIndex?: number) => void;
  isAdminView?: boolean;
}

export const NetworkTree: React.FC<NetworkTreeProps> = ({ 
  rootUser, 
  directReferrals = [], 
  fullTeam = [],
  onAddMember,
  isAdminView = false 
}) => {
  const [viewType, setViewType] = React.useState<'pyramid' | 'list'>('pyramid');
  
  // Drill-down State: Which user's pyramid are we currently looking at?
  const [currentRootId, setCurrentRootId] = React.useState(rootUser.id);
  const [navigationStack, setNavigationStack] = React.useState<string[]>([]);

  // Find the current user being viewed
  const currentRoot = fullTeam.find(u => u.id === currentRootId) || rootUser;

  // Helper to build the tree recursively
  const getSubTree = (userId: string) => {
    return fullTeam.filter(u => u.referred_by === userId);
  };

  const handleDrillDown = (userId: string) => {
    setNavigationStack([...navigationStack, currentRootId]);
    setCurrentRootId(userId);
  };

  const handleGoBack = () => {
    const prevId = navigationStack.pop();
    if (prevId) {
      setCurrentRootId(prevId);
      setNavigationStack([...navigationStack]);
    }
  };

  return (
    <div className={styles.treeWrapper}>
      <div className={styles.treeHeader}>
        <div className={styles.viewToggle}>
          <button 
            className={viewType === 'pyramid' ? styles.activeView : ''} 
            onClick={() => { setViewType('pyramid'); setCurrentRootId(rootUser.id); setNavigationStack([]); }}
          >
            Unlimited Pyramid
          </button>
          <button 
            className={viewType === 'list' ? styles.activeView : ''} 
            onClick={() => setViewType('list')}
          >
            Personal Directs
          </button>
        </div>
        
        {viewType === 'pyramid' && navigationStack.length > 0 && (
          <button className={styles.backBtn} onClick={handleGoBack}>
            ← Back to Up-line
          </button>
        )}
      </div>

      {viewType === 'pyramid' ? (
        <div className={styles.pyramidLayout}>
          <div className={styles.rootBox}>
            <div className={styles.nodeAvatarMain}>{(currentRoot.name || 'U')[0]}</div>
            <strong>{currentRoot.name}</strong>
            <span className={styles.idBadge}>
              {currentRoot.id === rootUser.id ? 'Your Master View' : 'Down-line Team View'}
            </span>
          </div>

          <div className={styles.connectorLine} />

          <div className={styles.levelOne}>
            {[0, 1, 2].map((idx) => {
              const children = getSubTree(currentRoot.id);
              const user = children[idx];
              
              return (
                <div key={idx} className={styles.branchWrapper}>
                  <div className={styles.legLabel}>Leg {idx + 1}</div>
                  {user ? (
                    <div className={styles.nodeCard} onClick={() => handleDrillDown(user.id)} style={{ cursor: 'pointer' }}>
                      <div className={styles.miniAvatar}>{user.name[0]}</div>
                      <strong>{user.name}</strong>
                      <span className={user.status === 'verified' ? styles.verified : styles.pending}>
                        {user.status || 'Pending'}
                      </span>
                      
                      <div className={styles.depthInfo}>
                        Click to view {fullTeam.filter(u => u.referred_by === user.id).length} members
                      </div>
                    </div>
                  ) : (!isAdminView && idx === children.length) ? (
                    <div className={`${styles.emptyNode} ${styles.activeJoinNode}`} onClick={() => onAddMember?.(currentRoot.id, idx)}>
                      <div className={styles.plusIcon}><PlusCircle size={24} /></div>
                      <button>Join Now</button>
                    </div>
                  ) : (
                    <div className={styles.emptyNode}>
                      <div className={styles.plusIcon} style={{ opacity: 0.3 }}>+</div>
                      <span>Empty Slot</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <p className={styles.drillHint}>💡 Tip: Click on any member to explore their team levels.</p>
        </div>
      ) : (
        <div className={styles.listLayout}>
          <div className={styles.listGrid}>
            <div className={styles.listHeader}>
              <h4>Direct Sponsorship List</h4>
              <p>Total Personally Joined: {directReferrals.length}</p>
            </div>
            {directReferrals.map((user, index) => (
              <div key={user.id} className={styles.listBranch}>
                <div className={styles.listConnector} />
                <div className={styles.listItem}>
                  <div className={styles.listIndex}>{index + 1}</div>
                  <div className={styles.listUser}>
                    <div className={styles.listAvatar}>{user.avatar || user.name[0]}</div>
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
            
            {!isAdminView && (
              <div className={styles.listBranch}>
                <div className={styles.listConnector} />
                <div className={`${styles.listItem} ${styles.joinRow}`} onClick={() => onAddMember?.()}>
                  <div className={styles.listIndex}>+</div>
                  <div className={styles.listUser}>
                    <div className={`${styles.listAvatar} ${styles.joinAvatar}`}><PlusCircle size={20} /></div>
                    <div>
                      <strong style={{ color: 'var(--primary)' }}>Add New Personal Referral</strong>
                      <p>Invite someone directly to your team</p>
                    </div>
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
