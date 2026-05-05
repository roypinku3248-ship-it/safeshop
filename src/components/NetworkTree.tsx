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

  const renderNode = (user: any, parentId: string, legIdx: number, depth: number = 0) => {
    const children = getSubTree(user?.id || '');
    const isNextToJoin = !user && !isAdminView; // Simple logic for now

    if (depth > 1) return null; // Limit visual depth for clarity, can drill deeper

    return (
      <div className={styles.nodeWrapper} key={legIdx}>
        <div className={styles.legLabel}>Leg {legIdx + 1}</div>
        
        {user ? (
          <div className={styles.nodeGroup}>
            <div className={styles.nodeCard} onClick={() => handleDrillDown(user.id)}>
              <div className={styles.miniAvatar}>{user.name[0]}</div>
              <div className={styles.nodeInfo}>
                <strong>{user.name}</strong>
                <span className={user.status === 'verified' ? styles.verified : styles.pending}>
                  {user.status || 'Pending'}
                </span>
              </div>
            </div>
            
            {/* Render Grandchildren (Level 2) */}
            <div className={styles.subLevel}>
              {[0, 1, 2].map((idx) => {
                const subChildren = getSubTree(user.id);
                const subUser = subChildren[idx];
                return (
                  <div key={idx} className={styles.subNodeWrapper}>
                    {subUser ? (
                      <div className={styles.dotNode} onClick={() => handleDrillDown(subUser.id)} title={subUser.name}>
                        {subUser.name[0]}
                      </div>
                    ) : (
                      <div className={styles.emptyDot} onClick={() => onAddMember?.(user.id, idx)}>+</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={styles.emptyNodeSlot}>
             <div className={`${styles.emptyNode} ${styles.activeJoinNode}`} onClick={() => onAddMember?.(parentId, legIdx)}>
                <PlusCircle size={20} />
                <span>Join</span>
             </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.treeWrapper}>
      <div className={styles.treeHeader}>
        <div className={styles.viewToggle}>
          <button 
            className={viewType === 'pyramid' ? styles.activeView : ''} 
            onClick={() => { setViewType('pyramid'); setCurrentRootId(rootUser.id); setNavigationStack([]); }}
          >
            Business Structure
          </button>
          <button 
            className={viewType === 'list' ? styles.activeView : ''} 
            onClick={() => setViewType('list')}
          >
            Direct List
          </button>
        </div>
        
        {viewType === 'pyramid' && navigationStack.length > 0 && (
          <button className={styles.backBtn} onClick={handleGoBack}>
            ← Go Up
          </button>
        )}
      </div>

      {viewType === 'pyramid' ? (
        <div className={styles.pyramidLayout}>
          <div className={styles.mainRoot}>
            <div className={styles.rootAvatar}>{(currentRoot.name || 'U')[0]}</div>
            <h3>{currentRoot.name}</h3>
            <p>{navigationStack.length === 0 ? 'Master Account' : 'Team Overview'}</p>
          </div>

          <div className={styles.mainConnectors}>
             <div className={styles.horizontalBar} />
          </div>

          <div className={styles.levelContainer}>
            {[0, 1, 2].map((idx) => {
              const children = getSubTree(currentRoot.id);
              return renderNode(children[idx], currentRoot.id, idx, 0);
            })}
          </div>
          
          <div className={styles.legend}>
            <span><div className={styles.dotNode} style={{ width: 12, height: 12 }}></div> Level 2 Team</span>
            <p>Click any member to zoom in</p>
          </div>
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
