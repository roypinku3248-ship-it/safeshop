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
  const [activeTab, setActiveTab] = React.useState<'orders' | 'earnings' | 'protection' | 'wishlist' | 'addresses' | 'settings'>('orders');
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

  const packages = [
    { id: 'starter', name: 'Starter Pack', price: 2000, bv: 100 },
    { id: 'silver', name: 'Silver Pack', price: 5000, bv: 250 },
    { id: 'gold', name: 'Gold Pack', price: 10000, bv: 500 },
  ];

  const [isAddingMember, setIsAddingMember] = React.useState(false);
  const [selectedParentId, setSelectedParentId] = React.useState<string | null>(null);
  const [selectedLegIdx, setSelectedLegIdx] = React.useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [registering, setRegistering] = React.useState(false);
  const [newMemberData, setNewMemberData] = React.useState({
    name: '', email: '', phone: '', city: '', ps: '', po: '', aadhar: '', pan: '', bankAcc: '', ifsc: '', packageId: ''
  });

  // Extract UNIQUE packages from user's orders
  const ownedPackages = React.useMemo(() => {
    const allItems = orders.flatMap(order => order.items || []);
    // Filter out duplicates and ensure we have necessary fields
    const unique = allItems.reduce((acc: any[], item: any) => {
      if (!acc.find(i => i.name === item.name)) {
        acc.push({
          id: item.id || item.name.toLowerCase().replace(/\s+/g, '-'),
          name: item.name,
          price: item.price,
          bv: item.bv || 0,
          image: item.image
        });
      }
      return acc;
    }, []);
    return unique.length > 0 ? unique : packages; // Fallback to defaults if none owned yet
  }, [orders]);

  // Set default package ID once ownedPackages are loaded
  React.useEffect(() => {
    if (ownedPackages.length > 0) {
      setNewMemberData(prev => ({ ...prev, packageId: ownedPackages[0].id }));
    }
  }, [ownedPackages]);

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
          dbId: o.id, // Keep original ID for actions
          date: new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
          status: o.status || 'Pending',
          seller: o.seller_name || 'SafeShop Official',
          total: o.total_amount || 0,
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
              <button className={activeTab === 'protection' ? styles.active : ''} onClick={() => { setActiveTab('protection'); setIsSidebarOpen(false); }}><ShieldCheck size={20} /> Buyer Protection</button>
              {user.role === 'user' && (
                <button className={styles.joinBtn} onClick={() => { router.push('/register'); setIsSidebarOpen(false); }}><Plus size={20} color="var(--primary)" /> Join SafeShop Business</button>
              )}
              {user.role === 'associate' && (
                <button onClick={() => { router.push('/kyc'); setIsSidebarOpen(false); }} className={styles.pendingBtn}><ShieldCheck size={20} color="var(--warning)" /> ID Verification Pending</button>
              )}
              {user.role === 'seller' && (
                <button className={styles.verifiedBtn} onClick={() => { router.push('/kyc'); setIsSidebarOpen(false); }}><ShieldCheck size={20} color="var(--primary)" /> ID Verified Seller</button>
              )}
              <button className={activeTab === 'wishlist' ? styles.active : ''} onClick={() => { setActiveTab('wishlist'); setIsSidebarOpen(false); }}><Heart size={20} /> Wishlist</button>
              <button className={activeTab === 'addresses' ? styles.active : ''} onClick={() => { setActiveTab('addresses'); setIsSidebarOpen(false); }}><MapPin size={20} /> Saved Addresses</button>
              <button className={activeTab === 'settings' ? styles.active : ''} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}><Settings size={20} /> Account Settings</button>
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

            {/* HIGH-VISIBILITY PAYMENT ALERT */}
            {orders.some(o => o.status?.toLowerCase() === 'awaiting payment') && (
              <div style={{ 
                background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', 
                border: '1px solid #fcd34d', 
                padding: '20px', 
                borderRadius: '16px', 
                marginBottom: '25px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                boxShadow: '0 4px 15px rgba(251, 191, 36, 0.1)',
                animation: 'fadeIn 0.5s'
              }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ background: '#fbbf24', color: 'white', padding: '10px', borderRadius: '12px' }}>
                    <IndianRupee size={24} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: '#92400e', fontWeight: '800' }}>Pending Business Activation</h4>
                    <p style={{ margin: '2px 0 0', color: '#b45309', fontSize: '0.9rem' }}>You have a pending package order. Pay now to activate your account and start earning.</p>
                  </div>
                </div>
                <button 
                  className="gradient-primary" 
                  style={{ padding: '10px 25px', borderRadius: '10px', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
                  onClick={() => {
                    const pendingOrder = orders.find(o => o.status?.toLowerCase() === 'awaiting payment');
                    if (pendingOrder) {
                      localStorage.setItem('safeshop-cart', JSON.stringify(pendingOrder.items));
                      localStorage.setItem('safeshop-pending-order-id', pendingOrder.dbId);
                      window.location.href = '/checkout';
                    }
                  }}
                >
                  Pay Now
                </button>
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
                            {idx === 0 && (
                              <div className={styles.orderActions}>
                                {order.status?.toLowerCase() === 'awaiting payment' ? (
                                  <button 
                                    className="gradient-primary" 
                                    style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                                    onClick={() => {
                                      // Save this order's items to cart for checkout
                                      localStorage.setItem('safeshop-cart', JSON.stringify(order.items));
                                      localStorage.setItem('safeshop-pending-order-id', order.dbId);
                                      window.location.href = '/checkout';
                                    }}
                                  >
                                    Pay Now to Activate
                                  </button>
                                ) : (
                                  <button className={styles.trackBtn}>Track Package</button>
                                )}
                              </div>
                            )}
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
                      rootUser={{ name: user.name, id: user.id }} 
                      directReferrals={referrals}
                      fullTeam={fullTeam} 
                      isFullScreen={isFullScreen}
                      setIsFullScreen={setIsFullScreen}
                      onAddMember={handleAddMemberClick}
                    />
                  </div>

                  {isAddingMember && (
                    <div className={styles.modalOverlay}>
                      <div className={styles.modalContent}>
                        <button className={styles.closeModal} onClick={() => setIsAddingMember(false)}><X size={20} /></button>
                        <form className={styles.addMemberForm} onSubmit={async (e) => {
                          e.preventDefault();
                          setRegistering(true);
                          const toastId = toast.loading('Registering member & recording sale...');
                          try {
                            const selectedPkg = ownedPackages.find(p => p.id === newMemberData.packageId) || ownedPackages[0];
                            
                            if (!selectedPkg) {
                              throw new Error('You do not have any packages in your inventory to sell. Please purchase a package first.');
                            }

                            // 1. Check if user already exists
                            const { data: existingUser } = await supabase
                              .from('users')
                              .select('id, status')
                              .eq('email', newMemberData.email.trim().toLowerCase())
                              .single();

                            let targetUserId = existingUser?.id;

                            if (!existingUser) {
                              // 2. Create NEW user if they don't exist
                              const newUserId = `SS-USR-${Math.floor(100000 + Math.random() * 900000)}`;
                              const { error: userError } = await supabase.from('users').insert([{
                                id: newUserId,
                                name: newMemberData.name,
                                email: newMemberData.email.trim().toLowerCase(),
                                password: 'password123',
                                phone: newMemberData.phone,
                                city: newMemberData.city,
                                ps: newMemberData.ps,
                                po: newMemberData.po,
                                aadhar: newMemberData.aadhar,
                                pan: newMemberData.pan,
                                role: 'associate',
                                status: 'pending',
                                referred_by: user.id,
                                joined_at: new Date().toISOString()
                              }]);
                              if (userError) throw userError;
                              targetUserId = newUserId;
                            } else {
                              // 2b. If user exists, ensure they are linked to the recruiter if not already
                              const { error: updateError } = await supabase
                                .from('users')
                                .update({ referred_by: user.id })
                                .eq('id', existingUser.id);
                              if (updateError) console.error('Failed to update referral link:', updateError);
                            }
                            
                            // 3. RECORD THE SALE as "Awaiting Payment"
                            const { error: orderError } = await supabase.from('orders').insert([{
                              user_id: targetUserId,
                              status: 'Awaiting Payment',
                              total_amount: selectedPkg.price,
                              items: [{ 
                                name: selectedPkg.name, 
                                price: selectedPkg.price, 
                                quantity: 1, 
                                image: '/package.jpg', 
                                bv: selectedPkg.bv 
                              }]
                            }]);

                            if (orderError) throw orderError;

                            toast.success(`Request sent to ${newMemberData.name}! They can now pay from their dashboard.`, { id: toastId });
                            setIsAddingMember(false);
                            // Give a small delay before reload to ensure DB consistency
                            setTimeout(() => window.location.reload(), 1500);
                          } catch (err: any) {
                            toast.error(err.message, { id: toastId });
                          } finally { setRegistering(false); }
                        }}>
                          <div className={styles.modalHeader}>
                            <h3>Register Business Member</h3>
                            <p>Complete onboarding with KYC and Package Selection.</p>
                          </div>

                          <div className={styles.miniFormGrid}>
                            <div className={styles.formItem}>
                              <label>Full Name</label>
                              <input type="text" placeholder="Enter full name" required value={newMemberData.name} onChange={e => setNewMemberData({...newMemberData, name: e.target.value})} />
                            </div>
                            <div className={styles.formItem}>
                              <label>Email Address</label>
                              <input type="email" placeholder="email@example.com" required value={newMemberData.email} onChange={e => setNewMemberData({...newMemberData, email: e.target.value})} />
                            </div>
                            <div className={styles.formItem}>
                              <label>Phone Number</label>
                              <input type="tel" placeholder="10-digit mobile" required value={newMemberData.phone} onChange={e => setNewMemberData({...newMemberData, phone: e.target.value})} />
                            </div>
                            <div className={styles.formItem}>
                              <label>City / Village</label>
                              <input type="text" placeholder="Enter city" required value={newMemberData.city} onChange={e => setNewMemberData({...newMemberData, city: e.target.value})} />
                            </div>
                            <div className={styles.formItem}>
                              <label>Police Station (PS)</label>
                              <input type="text" placeholder="Enter PS" required value={newMemberData.ps} onChange={e => setNewMemberData({...newMemberData, ps: e.target.value})} />
                            </div>
                            <div className={styles.formItem}>
                              <label>Post Office (PO)</label>
                              <input type="text" placeholder="Enter PO" required value={newMemberData.po} onChange={e => setNewMemberData({...newMemberData, po: e.target.value})} />
                            </div>
                          </div>

                          <div className={styles.kycSection}>
                            <h4>KYC Documents</h4>
                            <div className={styles.miniFormGrid}>
                              <div className={styles.formItem}>
                                <label>Aadhar Number</label>
                                <input type="text" placeholder="12-digit Aadhar" required value={newMemberData.aadhar} onChange={e => setNewMemberData({...newMemberData, aadhar: e.target.value})} />
                              </div>
                              <div className={styles.formItem}>
                                <label>PAN Number</label>
                                <input type="text" placeholder="ABCDE1234F" required value={newMemberData.pan} onChange={e => setNewMemberData({...newMemberData, pan: e.target.value})} />
                              </div>
                            </div>
                          </div>
                          
                          <div className={styles.packageSection} style={{ marginBottom: '30px' }}>
                            <h4 style={{ color: 'var(--primary)', marginBottom: '15px', fontWeight: '800' }}>Choose Business Package</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
                              {ownedPackages.map(pkg => (
                                <div 
                                  key={pkg.id}
                                  onClick={() => setNewMemberData({...newMemberData, packageId: pkg.id})}
                                  style={{
                                    padding: '15px',
                                    borderRadius: '16px',
                                    border: `2px solid ${newMemberData.packageId === pkg.id ? 'var(--primary)' : '#e2e8f0'}`,
                                    background: newMemberData.packageId === pkg.id ? 'rgba(37, 99, 235, 0.05)' : 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'center'
                                  }}
                                >
                                  <div style={{ fontWeight: '800', color: '#1e293b', marginBottom: '4px', fontSize: '0.85rem' }}>{pkg.name}</div>
                                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>₹{pkg.price.toLocaleString()}</div>
                                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', marginTop: '4px' }}>{pkg.bv} BV Stock</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className={styles.modalFooter}>
                            <button type="button" className={styles.cancelBtn} onClick={() => setIsAddingMember(false)}>Cancel</button>
                            <button type="submit" className={styles.submitBtn} disabled={registering}>
                              {registering ? 'Processing Registration...' : 'Complete Registration & Sale'}
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
            {activeTab === 'protection' && (
              <div className={styles.tabContent}>
                <div className={styles.header}>
                  <h1>Buyer Protection</h1>
                  <p>Secure shopping and hassle-free returns.</p>
                </div>
                <div className={styles.protectionGrid}>
                  <div className={styles.protectionCard}>
                    <ShieldCheck size={40} color="var(--primary)" />
                    <h3>Secure Payments</h3>
                    <p>Your payment information is always encrypted and never shared with sellers.</p>
                  </div>
                  <div className={styles.protectionCard}>
                    <Truck size={40} color="var(--secondary)" />
                    <h3>On-Time Delivery</h3>
                    <p>Get a full refund if your order doesn't arrive by the scheduled date.</p>
                  </div>
                  <div className={styles.protectionCard}>
                    <Package size={40} color="#8e24aa" />
                    <h3>Refund Guarantee</h3>
                    <p>Money-back guarantee for products that don't match their description.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className={styles.tabContent}>
                <div className={styles.header}>
                  <h1>My Wishlist</h1>
                  <p>Items you've saved for later.</p>
                </div>
                <div className={styles.emptyState}>
                  <Heart size={64} color="#f44336" />
                  <h3>Your wishlist is empty</h3>
                  <p>Save items you like to see them here.</p>
                  <button className="gradient-primary" onClick={() => router.push('/products')}>Browse Products</button>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className={styles.tabContent}>
                <div className={styles.header}>
                  <h1>Saved Addresses</h1>
                  <p>Manage your delivery locations.</p>
                </div>
                <div className={styles.addressList}>
                  <div className={styles.addressCard}>
                    <div className={styles.addressHeader}>
                      <MapPin size={20} />
                      <strong>Home Address</strong>
                    </div>
                    <p>{user.name}<br />{(user as any).city || 'Kolkata'}, West Bengal<br />Phone: {(user as any).phone || '+91 9876543210'}</p>
                    <div className={styles.addressActions}>
                      <button className={styles.editBtn}>Edit</button>
                      <button className={styles.deleteBtn}>Remove</button>
                    </div>
                  </div>
                  <button className={styles.addAddressBtn}><Plus size={20} /> Add New Address</button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className={styles.tabContent}>
                <div className={styles.header}>
                  <h1>Account Settings</h1>
                  <p>Update your profile and security preferences.</p>
                </div>
                <div className={styles.settingsForm}>
                  <div className={styles.formGroup}>
                    <label>Full Name</label>
                    <input type="text" defaultValue={user.name} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email Address</label>
                    <input type="email" defaultValue={user.email} disabled />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone Number</label>
                    <input type="tel" defaultValue={(user as any).phone} />
                  </div>
                  <button className="gradient-primary" onClick={() => toast.success('Profile updated!')}>Save Changes</button>
                  <div className={styles.divider} />
                  <h3>Security</h3>
                  <button className={styles.outlineBtn}>Change Password</button>
                  <button className={styles.outlineBtn} style={{ color: '#f44336', borderColor: '#f44336' }}>Delete Account</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
