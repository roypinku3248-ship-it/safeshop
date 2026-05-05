"use client";

import React from 'react';
import { User, Users, ChevronRight, Share2, TrendingUp, PlusCircle, Maximize2, Minimize2 } from 'lucide-react';
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
  isFullScreen?: boolean;
  setIsFullScreen?: (val: boolean) => void;
}

export const NetworkTree: React.FC<NetworkTreeProps> = ({ 
  rootUser, 
  directReferrals = [], 
  fullTeam = [],
  onAddMember,
  isAdminView = false,
  isFullScreen: externalIsFullScreen,
  setIsFullScreen: externalSetIsFullScreen
}) => {
  const [viewType, setViewType] = React.useState<'pyramid' | 'list'>('pyramid');
  
  // Drill-down State
  const [currentRootId, setCurrentRootId] = React.useState(rootUser.id);
  const [navigationStack, setNavigationStack] = React.useState<string[]>([]);
  const [zoom, setZoom] = React.useState(0.8);
  
  // Local state if props not provided
  const [localIsFullScreen, setLocalIsFullScreen] = React.useState(false);
  const isFullScreen = externalIsFullScreen !== undefined ? externalIsFullScreen : localIsFullScreen;
  const setIsFullScreen = externalSetIsFullScreen || setLocalIsFullScreen;
  
  // Find the current user being viewed
  const currentRoot = fullTeam.find(u => u.id === currentRootId) || rootUser;

  // Hyper-Resilient Helper to build the tree recursively
  const getSubTree = (userId: string) => {
    if (!userId || !fullTeam) return [];
    
    const normalizedId = userId.toString().toLowerCase().trim();
    const currentRootEmail = currentRoot?.email?.toLowerCase().trim();
    const currentRootName = currentRoot?.name?.toLowerCase().trim();
    
    return fullTeam.filter(u => {
      if (!u.referred_by) return false;
      
      const refId = u.referred_by.toString().toLowerCase().trim();
      const uRefEmail = u.referred_by_email?.toLowerCase().trim();
      const uRefName = u.referred_by_name?.toLowerCase().trim();
      
      // Multi-point matching: Try ID first, then Email, then Name as last resort
      return refId === normalizedId || 
             (currentRootEmail && uRefEmail === currentRootEmail) ||
             (currentRootName && uRefName === currentRootName);
    });
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
    // 1. Get children of this node
    const children = user ? getSubTree(user.id) : [];
    
    // 2. Sequential Leg Locking Logic:
    // If we are at depth > 0 (meaning we are looking at children of a child)
    // We check if the PREVIOUS leg of the parent is full.
    let isLocked = false;
    if (depth === 1 && legIdx > 0) {
      // Find the parent node in fullTeam
      const parentNode = fullTeam.find(u => u.id === parentId);
      if (parentNode) {
        const parentChildren = getSubTree(parentId);
        // Look at the node in the previous slot
        const previousLegNode = parentChildren[legIdx - 1];
        if (!previousLegNode) {
          isLocked = true; // Previous leg doesn't even have a root yet
        } else {
          const prevLegChildren = getSubTree(previousLegNode.id);
          if (prevLegChildren.length < 3) {
            isLocked = true; // Previous leg is not full yet (needs 3 members)
          }
        }
      }
    }
    
    if (depth > 2) return null; 

    return (
      <div className={styles.nodeWrapper} key={user?.id || `empty-${parentId}-${legIdx}`}>
        {depth === 0 && <div className={styles.legLabel}>Slot {legIdx + 1}</div>}
        
        {user ? (
          <div className={styles.nodeGroup} style={{ opacity: isLocked ? 0.5 : 1, filter: isLocked ? 'grayscale(1)' : 'none' }}>
            <div className={depth === 0 ? styles.nodeCard : styles.legCard} onClick={() => !isLocked && handleDrillDown(user.id)}>
              <div className={styles.miniAvatar}>{user.name ? user.name[0] : '?'}</div>
              <div className={styles.nodeInfo}>
                <strong style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{user.name}</strong>
                <span style={{ fontSize: '0.55rem', color: '#94a3b8' }}>ID: {user.id?.toString().slice(-6)}</span>
                <span className={user.status === 'verified' ? styles.verified : styles.pending}>
                  {isLocked ? 'Locked' : (user.status || 'Pending')}
                </span>
              </div>
            </div>
            
            <div className={styles.subLevel}>
              {[0, 1, 2].map((idx) => (
                renderNode(children[idx], user.id, idx, depth + 1)
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.emptyNodeSlot}>
             <div 
                className={`${styles.emptyNode} ${isLocked ? styles.lockedNode : styles.activeJoinNode}`} 
                onClick={() => !isLocked && onAddMember?.(parentId, legIdx)}
                style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
             >
                {isLocked ? <ShieldCheck size={20} opacity={0.3} /> : <PlusCircle size={20} />}
                <span>{isLocked ? 'Locked' : 'Join'}</span>
                {!isLocked && <span style={{ fontSize: '0.5rem', opacity: 0.5, marginTop: '4px' }}>to {parentId?.toString().slice(-6)}</span>}
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
  const [offsetX, setOffsetX] = React.useState(0);
  const [offsetY, setOffsetY] = React.useState(0);
  const [startOffsetX, setStartOffsetX] = React.useState(0);
  const [startOffsetY, setStartOffsetY] = React.useState(0);

  React.useEffect(() => {
    // Reset offset when root changes to keep it centered
    setOffsetX(0);
    setOffsetY(0);
  }, [currentRootId, viewType]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX);
    setStartY(e.pageY);
    setStartOffsetX(offsetX);
    setStartOffsetY(offsetY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const walkX = (e.pageX - startX);
    const walkY = (e.pageY - startY);
    setOffsetX(startOffsetX + walkX);
    setOffsetY(startOffsetY + walkY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
    setStartY(e.touches[0].pageY);
    setStartOffsetX(offsetX);
    setStartOffsetY(offsetY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const walkX = (e.touches[0].pageX - startX);
    const walkY = (e.touches[0].pageY - startY);
    setOffsetX(startOffsetX + walkX);
    setOffsetY(startOffsetY + walkY);
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  return (
    <div className={`${styles.treeWrapper} ${isFullScreen ? styles.fullScreenMode : ''}`}>
      <div className={styles.treeHeader}>
        <div className={styles.headerLeft}>
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
        </div>

        <div className={styles.headerRight}>
          {isFullScreen && (
            <button 
              className={styles.focusBtn} 
              onClick={() => setIsFullScreen(false)}
              title="Exit Focus Mode"
            >
              <Minimize2 size={18} />
              <span>Close Focus</span>
            </button>
          )}
        </div>
        
        {viewType === 'pyramid' && (
          <div className={styles.floatingZoom}>
            <button onClick={() => setZoom(Math.max(0.2, zoom - 0.1))} title="Zoom Out">-</button>
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
          <div 
            className={styles.pyramidLayout} 
            style={{ 
              zoom: zoom, 
              transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out'
            }}
          >
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
