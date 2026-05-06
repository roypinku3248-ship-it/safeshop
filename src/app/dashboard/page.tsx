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
          
          // Calculate Coin Logic
          const verifiedDirects = formattedDirects.filter(d => d.status?.toLowerCase() === 'verified');
          const directSellCoins = verifiedDirects.length * 100;
          
          // Helper to find all descendants for pyramid coins
          const getDescendants = (userId: string, team: any[]): any[] => {
            const children = team.filter(u => u.referred_by === userId);
            let descendants = [...children];
            children.forEach(child => {
              descendants = [...descendants, ...getDescendants(child.id, team)];
            });
            return descendants;
          };

          const myTeam = getDescendants(user?.id || '', allUsers);
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
                    <button className={styles.tabActive}>Active (2)</button>
                    <button>Completed</button>
                    <button>Returns</button>
                  </div>
                </div>
                <div className={styles.orderList}>
                  {orders.length === 0 ? (
                    <div className={styles.emptyOrders}>
                      <Package size={48} />
                      <p>You haven't placed any orders yet.</p>
                      <button onClick={() => router.push('/products')} className="gradient-primary">Start Shopping</button>
                    </div>
                  ) : (
                    orders.map((order) => (
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
                  <p>Track your recruitment rewards and indirect sales commissions.</p>
                </div>

                <div className={styles.networkOverview} style={{ background: 'white', padding: '15px 25px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px', display: 'flex', gap: '30px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', padding: '8px', borderRadius: '8px' }}><UsersIcon size={20} /></div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Direct Referrals</span>
                      <strong style={{ fontSize: '1.1rem' }}>{referrals.length}</strong>
                    </div>
                  </div>
                  <div style={{ width: '1px', height: '30px', background: '#e2e8f0' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(0, 135, 90, 0.1)', color: 'var(--secondary)', padding: '8px', borderRadius: '8px' }}><TrendingUp size={20} /></div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Total Team Size</span>
                      <strong style={{ fontSize: '1.1rem' }}>{fullTeam.length}</strong>
                    </div>
                  </div>
                  <div style={{ width: '1px', height: '30px', background: '#e2e8f0' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(255, 171, 0, 0.1)', color: 'var(--warning)', padding: '8px', borderRadius: '8px' }}><ShieldAlert size={20} /></div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Pending Verifications</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--warning)' }}>{stats.pendingVerifications}</strong>
                    </div>
                  </div>
                </div>

                <div className={styles.mlmStats}>
                  <div className={styles.mlmCard} style={{ background: 'linear-gradient(135deg, #fff9e6, #fffde7)' }}>
                    <div className={styles.mlmIcon} style={{ background: '#fbc02d', color: 'white' }}>🪙</div>
                    <div className={styles.mlmInfo}>
                      <span style={{ color: '#856404' }}>{stats.directSellCoins.toLocaleString()}</span>
                      <p>Direct Join Coins</p>
                    </div>
                  </div>
                  <div className={styles.mlmCard} style={{ background: 'linear-gradient(135deg, #e3f2fd, #e1f5fe)' }}>
                    <div className={styles.mlmIcon} style={{ background: '#1976d2', color: 'white' }}>💎</div>
                    <div className={styles.mlmInfo}>
                      <span style={{ color: '#0d47a1' }}>{stats.pyramidCoins.toLocaleString()}</span>
                      <p>Pyramid Earn Coins</p>
                    </div>
                  </div>
                  <div className={styles.mlmCard} style={{ background: 'linear-gradient(135deg, #f3e5f5, #fce4ec)' }}>
                    <div className={styles.mlmIcon} style={{ background: '#8e24aa', color: 'white' }}>💰</div>
                    <div className={styles.mlmInfo}>
                      <span style={{ color: '#4a148c' }}>₹{stats.totalCommission.toLocaleString()}</span>
                      <p>Cash Commission</p>
                    </div>
                  </div>
                </div>

                {(user.role === 'seller' || user.role === 'admin') && (
                  <div className={styles.networkGroups}>
                    <h2>Your Referral Network (Ternary Tree)</h2>
                    <p className={styles.subtext}>Visual representation of your direct sales team (C, D, E).</p>
                    
                    <div className={styles.visualTreeSection}>
                      <div className={styles.treeHeader}>
                        <h3>Pyramid Business Structure</h3>
                      </div>

                      <div className={styles.treeContainer}>
                        <NetworkTree 
                          rootUser={{ name: user.name, id: user.id }}
                          directReferrals={referrals}
                          fullTeam={fullTeam}
                          onAddMember={handleAddMemberClick}
                          isFullScreen={isFullScreen}
                          setIsFullScreen={setIsFullScreen}
                        />
                      </div>

                      <div className={styles.treeActions}>
                        {!isAddingMember && (
                          <div className={styles.actionRow}>
                            <button className={styles.addMemberBtn} onClick={() => handleAddMemberClick()}>
                              <PlusCircle size={20} /> Add New Direct Member
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Flat Team List for Debugging */}
                      <div className={styles.flatTeamList} style={{ marginTop: '40px', textAlign: 'left', background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ marginBottom: '15px', color: '#1e293b' }}>All Registered Team Members ({fullTeam.length})</h4>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                              <tr>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Name</th>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>ID (Suffix)</th>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Sponsor ID</th>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {fullTeam.length === 0 ? (
                                <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No members found in database</td></tr>
                              ) : (
                                fullTeam.map((m: any) => (
                                  <tr key={m.id}>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>{m.name}</td>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>...{m.id.slice(-6)}</td>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>{m.referred_by ? `...${m.referred_by.slice(-6)}` : 'None (Root)'}</td>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>
                                      <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', background: m.status === 'verified' ? '#e8f5e9' : '#fff3e0', color: m.status === 'verified' ? '#2e7d32' : '#af5200' }}>
                                        {m.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {isAddingMember && (
                        <div className={styles.modalOverlay}>
                          <div className={styles.modalContent}>
                            <button className={styles.closeModal} onClick={() => setIsAddingMember(false)}><X size={24} /></button>
                            <form className={styles.addMemberForm} onSubmit={async (e) => {
                              e.preventDefault();
                              const toastId = toast.loading('Syncing network and registering member...');
                              setRegistering(true);
                              try {
                                if (!user || !user.id) throw new Error('Session expired');

                                // Fetch FRESH team data right before registration to ensure spillover is accurate
                                const { data: freshTeam, error: fetchError } = await supabase
                                  .from('users')
                                  .select('*');
                                
                                if (fetchError) throw fetchError;
                                const team = freshTeam || [];
                                
                                  const parentId = selectedParentId || user.id;
                                  console.log('📍 Placing user under parent:', parentId);

                                  const { error } = await supabase.from('users').insert([{
                                    id: `SS-USR-${Math.floor(Math.random() * 100000)}`,
                                    name: newMemberData.name,
                                    email: newMemberData.email,
                                    phone: newMemberData.phone,
                                    password: 'password123',
                                    role: 'associate',
                                    status: 'pending',
                                    referred_by: parentId,
                                    city: newMemberData.city,
                                    ps: newMemberData.ps,
                                    po: newMemberData.po,
                                    aadhar: newMemberData.aadhar,
                                    pan: newMemberData.pan,
                                    joined_at: new Date().toISOString()
                                  }]);

                                  if (error) throw error;
                                  toast.success('🎉 Member registered successfully in your network!', { id: toastId });
                                  setIsAddingMember(false);
                                  setSelectedParentId(null);
                                  setSelectedLegIdx(null);
                                  setTimeout(() => window.location.reload(), 1500);
                                } catch (err: any) {
                                  toast.error(err.message || 'Failed to register', { id: toastId });
                                } finally { 
                                  setRegistering(false); 
                                }
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
                                <div className={styles.formItem}>
                                  <label>City/Village</label>
                                  <input type="text" value={newMemberData.city} onChange={e => setNewMemberData({...newMemberData, city: e.target.value})} />
                                </div>
                                <div className={styles.formItem}>
                                  <label>Police Station (PS)</label>
                                  <input type="text" value={newMemberData.ps} onChange={e => setNewMemberData({...newMemberData, ps: e.target.value})} />
                                </div>
                                <div className={styles.formItem}>
                                  <label>Post Office (PO)</label>
                                  <input type="text" value={newMemberData.po} onChange={e => setNewMemberData({...newMemberData, po: e.target.value})} />
                                </div>
                              </div>

                              <div className={styles.kycSection}>
                                <h4>KYC & Documents</h4>
                                <div className={styles.miniFormGrid}>
                                  <div className={styles.formItem}>
                                    <label>Aadhar Number</label>
                                    <input type="text" value={newMemberData.aadhar} onChange={e => setNewMemberData({...newMemberData, aadhar: e.target.value})} />
                                  </div>
                                  <div className={styles.formItem}>
                                    <label>PAN Number</label>
                                    <input type="text" value={newMemberData.pan} onChange={e => setNewMemberData({...newMemberData, pan: e.target.value})} />
                                  </div>
                                </div>

                                <div className={styles.fileUploadGrid} style={{ marginTop: '20px' }}>
                                  <div className={styles.fileBox}>
                                    <span>Aadhar Front</span>
                                    <input type="file" accept="image/*" />
                                  </div>
                                  <div className={styles.fileBox}>
                                    <span>Aadhar Back</span>
                                    <input type="file" accept="image/*" />
                                  </div>
                                  <div className={styles.fileBox}>
                                    <span>PAN Card</span>
                                    <input type="file" accept="image/*" />
                                  </div>
                                </div>
                              </div>
                              <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsAddingMember(false)}>Cancel</button>
                                <button type="submit" className={styles.submitBtn} disabled={registering}>{registering ? "Registering..." : "Complete"}</button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={styles.commissionExplanation}>
                      <h3>How your earnings are calculated:</h3>
                      <div className={styles.explGrid}>
                        <div className={styles.explCard}>
                          <div className={styles.explIcon}><Award size={20} /></div>
                          <div><strong>Direct Commission (10%)</strong><p>Earn ₹200 for every ₹2000 product sold to your direct recruits.</p></div>
                        </div>
                        <div className={styles.explCard}>
                          <div className={styles.explIcon}><TrendingUp size={20} /></div>
                          <div><strong>Indirect Commission (2%)</strong><p>Earn 2% from sales made by your team recruits.</p></div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.referralSection}>
                      <div className={styles.referCard}>
                        <div className={styles.referText}>
                          <h3>Expand Your Pyramid</h3>
                          <p>Share your unique referral link to grow your network.</p>
                          <div className={styles.linkBox}>
                            <code>safeshop.in/join?ref={user.id}</code>
                            <button className={styles.copyBtn}>Copy Link</button>
                          </div>
                        </div>
                        <div className={styles.referStats}>
                          <div className={styles.rStat}>
                            <strong>{stats.referralsCount}</strong>
                            <span>Direct Team</span>
                          </div>
                          <div className={styles.rStat} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button className="gradient-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <List size={14} /> Direct List
                            </button>
                            <button 
                              className={styles.focusActionBtn}
                              onClick={() => setIsFullScreen(!isFullScreen)}
                              style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                            >
                              {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                              {isFullScreen ? "Close Focus" : "Full Pyramid"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {user.role === 'associate' && (
                  <div className={styles.lockedSection}>
                    <ShieldAlert size={48} color="var(--warning)" />
                    <h3>Business Dashboard Locked</h3>
                    <p>Your ID verification is pending. Only verified sellers can access recruitment tools.</p>
                    <button className="gradient-primary" onClick={() => router.push('/kyc')}>Check Status</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
