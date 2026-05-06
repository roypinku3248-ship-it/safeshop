"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Package, ShieldCheck, MapPin, Settings, Heart, LogOut, Clock, Truck, Loader2, IndianRupee, TrendingUp, Users as UsersIcon, Award, Plus, ShieldAlert, PlusCircle, Maximize2, Minimize2, X, List } from 'lucide-react';
import { NetworkTree } from '@/components/NetworkTree';
import { supabase } from '@/lib/supabase';
import styles from './Dashboard.module.css';
import { toast } from 'react-hot-toast';

function SyncAccountNotice({ user }: { user: any }) {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [showSync, setShowSync] = React.useState(false);

  React.useEffect(() => {
    const checkUser = async () => {
      if (!user?.email) return;
      const { data } = await supabase.from('users').select('id').eq('email', user.email).single();
      if (!data) setShowSync(true);
    };
    checkUser();
  }, [user?.email]);

  if (!showSync) return null;

  return (
    <div style={{ background: '#fff9e6', border: '1px solid #ffeeba', padding: '15px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeIn 0.4s' }}>
      <p style={{ margin: 0, color: '#856404', fontSize: '0.9rem' }}>
        ⚠️ <strong>Database Sync Required:</strong> Click the button to register your account in the system.
      </p>
      <button 
        className="gradient-primary"
        disabled={isSyncing}
        style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
        onClick={async () => {
          setIsSyncing(true);
          try {
            const newUser = {
              id: user.id || `USR-${Math.random().toString(36).substr(2, 9)}`,
              name: user.name,
              email: user.email,
              password: 'password123',
              role: user.role || 'user',
              status: 'verified',
              joined_at: new Date().toISOString()
            };
            const { error } = await supabase.from('users').insert([newUser]);
            if (error) throw error;
            alert('✅ Success! Your account is now synced. You can now register members.');
            setShowSync(false);
            window.location.reload();
          } catch (err: any) {
            alert('Sync failed: ' + err.message);
          } finally {
            setIsSyncing(false);
          }
        }}
      >
        {isSyncing ? 'Syncing...' : 'Sync Account Now'}
      </button>
    </div>
  );
}

export default function UserDashboard() {
  const { user, isAuthenticated, loading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'orders' | 'earnings'>('orders');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [orders, setOrders] = React.useState<any[]>([]);
  
  // MLM Logic States
  const [referrals, setReferrals] = React.useState<any[]>([]);
  const [fullTeam, setFullTeam] = React.useState<any[]>([]);
  const [teamMembers, setTeamMembers] = React.useState<any[]>([]);

  const [stats, setStats] = React.useState({
    totalBv: 0,
    directCommission: 0,
    indirectCommission: 0,
    totalCommission: 0,
    referralsCount: 0,
    directSellCoins: 0,
    pyramidCoins: 0,
    pendingVerifications: 0
  });

  const [isAddingMember, setIsAddingMember] = React.useState(false);
  const [selectedParentId, setSelectedParentId] = React.useState<string | null>(null);
  const [selectedLegIdx, setSelectedLegIdx] = React.useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [registering, setRegistering] = React.useState(false);
  const [newMemberData, setNewMemberData] = React.useState({
    name: '', email: '', phone: '', city: '', ps: '', po: '', aadhar: '', pan: '', bankAcc: '', ifsc: ''
  });

  const handleAddMemberClick = (parentId?: string, legIdx?: number) => {
    setSelectedParentId(parentId || user?.id || null);
    setSelectedLegIdx(legIdx ?? null);
    setIsAddingMember(true);
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?callbackUrl=/dashboard');
    }
    
    if (isAuthenticated) {
      refreshUser();
    }
    
    const loadOrders = async () => {
      try {
        const { data: dbOrders, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user?.id);
        
        if (error) throw error;

        const localOrders = JSON.parse(localStorage.getItem('safeshop-orders') || '[]');
        
        // Format DB orders to match UI expectations
        const formattedDbOrders = (dbOrders || []).map(o => ({
          id: o.id.toString().slice(0, 8).toUpperCase(),
          date: new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
          status: o.status,
          seller: o.seller_name || 'SafeShop Official',
          total: o.total_amount,
          items: o.items || []
        }));

        const combinedOrders = [...formattedDbOrders, ...localOrders];
        setOrders(combinedOrders);

        // Calculate Personal BV from all orders
        const personalBv = combinedOrders.reduce((acc: number, order: any) => {
          return acc + (order.items || []).reduce((sum: number, item: any) => sum + (item.bv * item.quantity), 0);
        }, 0);
        setStats(prev => ({ ...prev, totalBv: personalBv }));

      } catch (err) {
        console.error('Error loading orders:', err);
        const localOrders = JSON.parse(localStorage.getItem('safeshop-orders') || '[]');
        setOrders(localOrders);
      }
    };

    if (user?.id) {
      loadOrders();
    }

    const loadReferrals = async () => {
      try {
        const { data: directs, error: directError } = await supabase
          .from('users')
          .select('*')
          .eq('referred_by', user?.id);
        
        if (directError) throw directError;

        let formattedDirects: any[] = [];
        if (directs) {
          formattedDirects = directs.map(u => ({
            id: u.id,
            name: u.name,
            avatar: u.name[0],
            sales: u.total_sales || 0,
            status: u.status,
            email: u.email
          }));
          setReferrals(formattedDirects);
        }

        const { data: allUsers, error: teamError } = await supabase
          .from('users')
          .select('*');
        
        if (teamError) throw teamError;

        if (allUsers) {
          setFullTeam(allUsers || []);
          
          // Helper to find all descendants
          const getDescendants = (userId: string, team: any[]): any[] => {
            const children = team.filter(u => u.referred_by === userId);
            let descendants = [...children];
            children.forEach(child => {
              descendants = [...descendants, ...getDescendants(child.id, team)];
            });
            return descendants;
          };

          const myTeam = getDescendants(user?.id || '', allUsers);
          setTeamMembers(myTeam); // New state to hold ONLY my team

          // Calculate Coin Logic
          const verifiedDirects = formattedDirects.filter(d => d.status?.toLowerCase() === 'verified');
          const directSellCoins = verifiedDirects.length * 100;
          
          const verifiedTeamMembers = myTeam.filter(m => m.status?.toLowerCase() === 'verified');
          const pendingTeamMembers = myTeam.filter(m => m.status?.toLowerCase() === 'pending');
          const pyramidCoins = verifiedTeamMembers.length * 100;

          const directComm = formattedDirects.reduce((acc: number, ref: any) => acc + (ref.sales * 0.10), 0);
          setStats(prev => ({
            ...prev,
            directCommission: directComm,
            referralsCount: formattedDirects.length,
            totalCommission: directComm + prev.indirectCommission,
            directSellCoins: directSellCoins,
            pyramidCoins: pyramidCoins,
            pendingVerifications: pendingTeamMembers.length
          }));
        }
      } catch (err: any) {
        console.error('Fetch Error:', err);
      }
    };

    if (user?.id) {
      loadReferrals();
    }

  }, [isAuthenticated, loading, router, user?.id]);

  const [orderStatusTab, setOrderStatusTab] = React.useState<'active' | 'completed' | 'returns'>('active');

  const filteredOrders = orders.filter(order => {
    const status = (order.status || '').toLowerCase();
    if (orderStatusTab === 'active') {
      return !status.includes('delivered') && !status.includes('completed') && !status.includes('returned') && !status.includes('refunded');
    }
    if (orderStatusTab === 'completed') {
      return status.includes('delivered') || status.includes('completed');
    }
    if (orderStatusTab === 'returns') {
      return status.includes('returned') || status.includes('refunded');
    }
    return true;
  });

  if (loading || !user) return null;

  return (
    <div className={styles.dashboard}>
      <div className="container">
        <div className={styles.layout}>
          {/* Mobile Menu Toggle */}
          <button 
            className={styles.mobileToggle} 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={24} /> : <List size={24} />}
            <span>{isSidebarOpen ? 'Close Menu' : 'Dashboard Menu'}</span>
          </button>

          {/* Sidebar */}
          <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
            <div className={styles.userCard}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
              ) : (
                <div className={styles.avatar}>{user.name.charAt(0)}</div>
              )}
              <div>
                <h3 style={{ color: 'white' }}>{user.name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>Member since {new Date(user.joined_at || Date.now()).getFullYear()}</p>
                <p style={{ fontWeight: 'bold', color: 'white', marginTop: '4px', fontSize: '0.9rem', background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                  R-{user.id?.toString().replace(/^R-/, '').slice(-6).toUpperCase()}
                </p>
              </div>
            </div>
            
            <nav className={styles.nav}>
              <button className={activeTab === 'orders' ? styles.active : ''} onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}><Package size={20} /> My Orders</button>
              {(user.role !== 'user') && (
                <button className={activeTab === 'earnings' ? styles.active : ''} onClick={() => { setActiveTab('earnings'); setIsSidebarOpen(false); }}><Award size={20} color="var(--secondary)" /> Earnings & Network</button>
              )}
              <button onClick={() => setIsSidebarOpen(false)}><ShieldCheck size={20} /> Buyer Protection</button>
              {user.role === 'user' && (
                <button className={styles.joinBtn} onClick={() => { router.push('/register'); setIsSidebarOpen(false); }}><Plus size={20} color="var(--primary)" /> Join SafeShop Business</button>
              )}
              {user.role === 'associate' && (
                <button onClick={() => { router.push('/kyc'); setIsSidebarOpen(false); }} className={styles.pendingBtn}><ShieldCheck size={20} color="var(--warning)" /> ID Verification Pending</button>
              )}
              {user.role === 'seller' && (
                <button className={styles.verifiedBtn} onClick={() => setIsSidebarOpen(false)}><ShieldCheck size={20} color="var(--primary)" /> ID Verified Seller</button>
              )}
              <button onClick={() => setIsSidebarOpen(false)}><Heart size={20} /> Wishlist</button>
              <button onClick={() => setIsSidebarOpen(false)}><MapPin size={20} /> Saved Addresses</button>
              <button onClick={() => setIsSidebarOpen(false)}><Settings size={20} /> Account Settings</button>
              <div className={styles.divider} />
              <button className={styles.logout} onClick={() => { logout(); setIsSidebarOpen(false); }}><LogOut size={20} /> Logout</button>
            </nav>
          </aside>

          {/* Main Content */}
          <div className={styles.main}>
            <SyncAccountNotice user={user} />

            {user.role !== 'seller' && user.role !== 'admin' && (
              <div className={styles.kycAlertBanner}>
                <div className={styles.kycInfo}>
                  <ShieldAlert size={24} color="var(--warning)" />
                  <div>
                    <h4>Action Required: Verify Your Identity</h4>
                    <p>To start earning commissions and listing products, you must verify your ID documents.</p>
                  </div>
                </div>
                <button onClick={() => router.push('/kyc')} className="gradient-primary">Start Verification</button>
              </div>
            )}

            {activeTab === 'orders' && (
              <>
                <div className={styles.header}>
                  <h1>My Orders</h1>
                  <div className={styles.tabs}>
                    <button 
                      className={orderStatusTab === 'active' ? styles.tabActive : ''} 
                      onClick={() => setOrderStatusTab('active')}
                    >
                      Active ({orders.filter(o => !o.status?.toLowerCase().includes('delivered') && !o.status?.toLowerCase().includes('returned')).length})
                    </button>
                    <button 
                      className={orderStatusTab === 'completed' ? styles.tabActive : ''} 
                      onClick={() => setOrderStatusTab('completed')}
                    >
                      Completed
                    </button>
                    <button 
                      className={orderStatusTab === 'returns' ? styles.tabActive : ''} 
                      onClick={() => setOrderStatusTab('returns')}
                    >
                      Returns
                    </button>
                  </div>
                </div>
                <div className={styles.orderList}>
                  {filteredOrders.length === 0 ? (
                    <div className={styles.emptyOrders}>
                      <Package size={48} />
                      <p>No {orderStatusTab} orders found.</p>
                      {orderStatusTab === 'active' && <button onClick={() => router.push('/products')} className="gradient-primary">Start Shopping</button>}
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div key={order.id} className={styles.orderCard}>
                        <div className={styles.orderHeader}>
                          <div className={styles.orderMeta}>
                            <span>Order {order.id}</span>
                            <span>Placed on {order.date}</span>
                          </div>
                          <div className={order.status.includes('Success') || order.status.includes('Delivered') ? styles.orderStatusSuccess : styles.orderStatus}>
                            {order.status.includes('Success') || order.status.includes('Delivered') ? <Truck size={16} /> : <Clock size={16} />}
                            <span>{order.status}</span>
                          </div>
                        </div>
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className={styles.orderItem}>
                            <img src={item.image} alt={item.name} />
                            <div className={styles.itemDetail}>
                              <h4>{item.name}</h4>
                              <p>Seller: {order.seller} <ShieldCheck size={12} color="var(--primary)" /></p>
                              <span className={styles.price}>₹{item.price.toLocaleString('en-IN')} x {item.quantity}</span>
                              <span className={styles.bvBadge}>{item.bv * item.quantity} BV</span>
                            </div>
                            {idx === 0 && <button className={styles.trackBtn}>Track Package</button>}
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {activeTab === 'earnings' && (
              <div className={styles.earningsView}>
                <div className={styles.header}>
                  <h1>Seller Compensation Dashboard</h1>
                  <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><Award size={24} /></div>
                      <div className={styles.statInfo}>
                        <span>Direct Sell Coins</span>
                        <strong>🪙 {stats.directSellCoins}</strong>
                      </div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><TrendingUp size={24} /></div>
                      <div className={styles.statInfo}>
                        <span>Pyramid Earn Coins</span>
                        <strong>🪙 {stats.pyramidCoins}</strong>
                      </div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><ShieldCheck size={24} /></div>
                      <div className={styles.statInfo}>
                        <span>Pending Verify</span>
                        <strong>{stats.pendingVerifications}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.networkSection} style={{ marginTop: '30px' }}>
                  <div className={styles.sectionHeader}>
                    <h2>Your Recruitment Network</h2>
                    <button className="gradient-primary" onClick={() => setIsAddingMember(true)}>
                      <Plus size={18} /> Add New Member
                    </button>
                  </div>
                  
                  <div className={styles.treeContainer}>
                    <NetworkTree 
                      currentUser={user} 
                      fullTeam={fullTeam} 
                      isFullScreen={isFullScreen}
                      onCloseFocus={() => setIsFullScreen(false)}
                    />
                  </div>

                  {isAddingMember && (
                    <div className={styles.modalOverlay}>
                      <div className={styles.modal}>
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          setRegistering(true);
                          const toastId = toast.loading('Registering member...');
                          try {
                            const newUserId = `SS-USR-${Math.floor(100000 + Math.random() * 900000)}`;
                            const { error } = await supabase.from('users').insert([{
                              id: newUserId,
                              name: newMemberData.name,
                              email: newMemberData.email,
                              phone: newMemberData.phone,
                              role: 'user',
                              status: 'pending',
                              referred_by: user.id,
                              joined_at: new Date().toISOString()
                            }]);
                            if (error) throw error;
                            toast.success('Member added!', { id: toastId });
                            setIsAddingMember(false);
                            window.location.reload();
                          } catch (err: any) {
                            toast.error(err.message, { id: toastId });
                          } finally { setRegistering(false); }
                        }}>
                          <div className={styles.modalHeader}>
                            <h3>Quick Register Member</h3>
                            <p>Join your organization and start earning.</p>
                          </div>
                          <div className={styles.miniFormGrid}>
                            <div className={styles.formItem}>
                              <label>Full Name</label>
                              <input type="text" required value={newMemberData.name} onChange={e => setNewMemberData({...newMemberData, name: e.target.value})} />
                            </div>
                            <div className={styles.formItem}>
                              <label>Email Address</label>
                              <input type="email" required value={newMemberData.email} onChange={e => setNewMemberData({...newMemberData, email: e.target.value})} />
                            </div>
                            <div className={styles.formItem}>
                              <label>Phone Number</label>
                              <input type="tel" required value={newMemberData.phone} onChange={e => setNewMemberData({...newMemberData, phone: e.target.value})} />
                            </div>
                          </div>
                          <div className={styles.modalActions}>
                            <button type="button" className={styles.cancelBtn} onClick={() => setIsAddingMember(false)}>Cancel</button>
                            <button type="submit" className={`${styles.submitBtn} gradient-primary`} disabled={registering}>
                              {registering ? 'Adding...' : 'Register Member'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.salesHistory} style={{ marginTop: '30px' }}>
                  <h3 style={{ marginBottom: '15px', color: '#1e293b' }}>Sales & Commission History</h3>
                  <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                          <th style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#64748b' }}>Date</th>
                          <th style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#64748b' }}>Sold To (Referral)</th>
                          <th style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#64748b' }}>Amount</th>
                          <th style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#64748b' }}>Commission</th>
                          <th style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#64748b' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {referrals.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                              No sales recorded yet. Join new members to start selling packages.
                            </td>
                          </tr>
                        ) : (
                          referrals.map((ref, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px 15px', fontSize: '0.9rem' }}>6 May 2026</td>
                              <td style={{ padding: '12px 15px' }}>
                                <div style={{ fontWeight: '600', color: '#1e293b' }}>{ref.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ref.email}</div>
                              </td>
                              <td style={{ padding: '12px 15px', fontWeight: 'bold' }}>₹2,000</td>
                              <td style={{ padding: '12px 15px' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: ref.status?.toLowerCase() === 'verified' ? '#fff9e6' : '#f1f5f9', padding: '2px 8px', borderRadius: '10px', border: ref.status?.toLowerCase() === 'verified' ? '1px solid #ffeeba' : '1px solid #e2e8f0' }}>
                                  <span style={{ fontSize: '11px', color: ref.status?.toLowerCase() === 'verified' ? '#856404' : '#64748b', fontWeight: '700' }}>
                                    🪙 {ref.status?.toLowerCase() === 'verified' ? '100' : '0'}
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: '12px 15px' }}>
                                <span className={ref.status?.toLowerCase() === 'verified' ? styles.statusV : styles.statusP} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                                  {ref.status || 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={styles.commissionExplanation}>
                  <h3>How your earnings are calculated:</h3>
                  <div className={styles.explGrid}>
                    <div className={styles.explCard}>
                      <div className={styles.explIcon}><Award size={20} /></div>
                      <div><strong>Direct Join Coins</strong><p>Earn 100 coins for every ₹2,000 package sold to direct verified recruits.</p></div>
                    </div>
                    <div className={styles.explCard}>
                      <div className={styles.explIcon}><TrendingUp size={20} /></div>
                      <div><strong>Pyramid Earn Coins</strong><p>Earn 100 coins for every verified member in your downline network.</p></div>
                    </div>
                  </div>
                </div>

                <div className={styles.referralSection}>
                  <div className={styles.referCard}>
                    <div className={styles.referText}>
                      <h3>Expand Your Network</h3>
                      <p>Share your unique referral link to grow your network.</p>
                      <div className={styles.linkBox}>
                        <code>safeshop.in/join?ref={user.id}</code>
                        <button className={styles.copyBtn}>Copy Link</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
