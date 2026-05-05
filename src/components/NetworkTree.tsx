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
  
  // Drill-down State
  const [currentRootId, setCurrentRootId] = React.useState(rootUser.id);
  const [navigationStack, setNavigationStack] = React.useState<string[]>([]);
  const [zoom, setZoom] = React.useState(1);
  
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
    const children = user ? getSubTree(user.id) : [];
    
    // Depth limiter to prevent UI overflow, but allows drilling
    if (depth > 2) return null; 

    return (
      <div className={styles.nodeWrapper} key={legIdx}>
        {depth === 0 && <div className={styles.legLabel}>Leg {legIdx + 1}</div>}
        
        {user ? (
          <div className={styles.nodeGroup}>
            <div className={depth === 0 ? styles.nodeCard : styles.legCard} onClick={() => handleDrillDown(user.id)}>
              <div className={styles.miniAvatar}>{user.name[0]}</div>
              <div className={styles.nodeInfo}>
                <strong>{user.name}</strong>
                <span className={user.status === 'verified' ? styles.verified : styles.pending}>
                  {user.status || 'Pending'}
                </span>
              </div>
            </div>
            
            {/* Recursive Children Rendering */}
            <div className={styles.subLevel}>
              {[0, 1, 2].map((idx) => (
                renderNode(children[idx], user.id, idx, depth + 1)
              ))}
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

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [startY, setStartY] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const [scrollTop, setScrollTop] = React.useState(0);

  // Auto-center the tree when it loads or changes
  React.useEffect(() => {
    const centerTree = () => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const scrollPos = (container.scrollWidth - container.clientWidth) / 2;
        container.scrollLeft = scrollPos;
      }
    };
    // Short timeout allows the DOM to finish painting the wide layout first
    const timeoutId = setTimeout(centerTree, 100);
    return () => clearTimeout(timeoutId);
  }, [currentRootId, zoom, viewType]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setStartY(e.pageY - scrollRef.current.offsetTop);
    setScrollLeft(scrollRef.current.scrollLeft);
    setScrollTop(scrollRef.current.scrollTop);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const y = e.pageY - scrollRef.current.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walkX;
    scrollRef.current.scrollTop = scrollTop - walkY;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setStartY(e.touches[0].pageY - scrollRef.current.offsetTop);
    setScrollLeft(scrollRef.current.scrollLeft);
    setScrollTop(scrollRef.current.scrollTop);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const y = e.touches[0].pageY - scrollRef.current.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walkX;
    scrollRef.current.scrollTop = scrollTop - walkY;
  };

  const stopDragging = () => {
    setIsDragging(false);
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
        
        {viewType === 'pyramid' && (
          <div className={styles.floatingZoom}>
            <button onClick={() => setZoom(Math.max(0.4, zoom - 0.1))} title="Zoom Out">-</button>
            <div className={styles.zoomValue}>{Math.round(zoom * 100)}%</div>
            <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} title="Zoom In">+</button>
            <button onClick={() => setZoom(1)} className={styles.resetBtn}>Reset</button>
          </div>
        )}
        {viewType === 'pyramid' && navigationStack.length > 0 && (
          <button className={styles.backBtn} onClick={handleGoBack}>
            ← Go Up
          </button>
        )}
      </div>

      {viewType === 'pyramid' ? (
        <div 
          ref={scrollRef}
          className={`${styles.pyramidContainer} ${isDragging ? styles.grabbing : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={stopDragging}
        >
          <div className={styles.pyramidLayout} style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
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
              <span><div className={styles.legCard} style={{ width: 40, height: 25, display: 'inline-flex', marginRight: 8 }}></div> Level 2 Team Members</span>
              <p>Click any member to zoom in | Click & Drag to move</p>
            </div>
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
