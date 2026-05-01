"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Package, ShieldCheck, MapPin, Settings, Heart, LogOut, Clock, Truck, Loader2, IndianRupee, TrendingUp, Users as UsersIcon, Award, Plus, ShieldAlert } from 'lucide-react';
import { NetworkTree } from '@/components/NetworkTree';
import styles from './Dashboard.module.css';

export default function UserDashboard() {
  const { user, isAuthenticated, loading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'orders' | 'earnings'>('orders');
  const [orders, setOrders] = React.useState<any[]>([]);
  
  // New State for MLM Logic
  const [referrals, setReferrals] = React.useState<any[]>([]);

  const [stats, setStats] = React.useState({
    totalBv: 0,
    directCommission: 0,
    indirectCommission: 0,
    totalCommission: 0,
    referralsCount: 0
  });

  const [isAddingMember, setIsAddingMember] = React.useState(false);
  const [newMemberData, setNewMemberData] = React.useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    ps: '',
    po: ''
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?callbackUrl=/dashboard');
    }
    
    // Auto-refresh user role if Admin approved verification
    if (isAuthenticated) {
      refreshUser();
    }
    
    // Load dynamic orders
    const savedOrders = JSON.parse(localStorage.getItem('safeshop-orders') || '[]');
    setOrders(savedOrders);

    // Load dynamic referrals from global list
    const globalUsers = JSON.parse(localStorage.getItem('safeshop-global-users') || '[]');
    const myReferrals = globalUsers.filter((u: any) => u.referredBy === user?.id);
    setReferrals(myReferrals);

    // Calculate BV stats based on orders (Personal Shopping)
    const personalBv = savedOrders.reduce((acc: number, order: any) => {
      return acc + order.items.reduce((sum: number, item: any) => sum + (item.bv * item.quantity), 0);
    }, 0);
    
    // Calculate Commissions based on the new Business Model
    // 1. Direct Commission: 10% of Direct Referrals Sales
    const directComm = myReferrals.reduce((acc: number, ref: any) => acc + (ref.sales * 0.10), 0);
    
    // 2. Indirect Commission: 2% of Indirect Sales
    const indirectComm = myReferrals.reduce((acc: number, ref: any) => acc + (ref.indirectSales * 0.02), 0);

    setStats({
      totalBv: personalBv,
      directCommission: directComm,
      indirectCommission: indirectComm,
      totalCommission: directComm + indirectComm,
      referralsCount: myReferrals.length
    });

  }, [isAuthenticated, loading, router, user?.id]);

  if (loading || !user) {
    return null;
  }

  return (
    <div className={styles.dashboard}>
      <div className="container">
        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.userCard}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
              ) : (
                <div className={styles.avatar}>{user.name.charAt(0)}</div>
              )}
              <div>
                <h3>{user.name}</h3>
                <p>Member since 2023</p>
              </div>
            </div>
            
            <nav className={styles.nav}>
              <button className={activeTab === 'orders' ? styles.active : ''} onClick={() => setActiveTab('orders')}><Package size={20} /> My Orders</button>
              
              {/* Layer 2 & 3: See Earnings - Restricted to Associates, Sellers and Admins */}
              {(user.role !== 'user') && (
                <button className={activeTab === 'earnings' ? styles.active : ''} onClick={() => setActiveTab('earnings')}><Award size={20} color="var(--secondary)" /> Earnings & Network</button>
              )}
              
              <button><ShieldCheck size={20} /> Buyer Protection</button>
              
              {/* Layer 1: Join CTA */}
              {user.role === 'user' && (
                <button className={styles.joinBtn} onClick={() => router.push('/register')}><Plus size={20} color="var(--primary)" /> Join SafeShop Business</button>
              )}

              {/* Layer 2: Send ID Verification */}
              {user.role === 'associate' && (
                <button onClick={() => router.push('/kyc')} className={styles.pendingBtn}><ShieldCheck size={20} color="var(--warning)" /> ID Verification Pending</button>
              )}

              {/* Layer 3: Verified Badge */}
              {user.role === 'seller' && (
                <button className={styles.verifiedBtn}><ShieldCheck size={20} color="var(--primary)" /> ID Verified Seller</button>
              )}

              <button><Heart size={20} /> Wishlist</button>
              <button><MapPin size={20} /> Saved Addresses</button>
              <button><Settings size={20} /> Account Settings</button>
              <div className={styles.divider} />
              <button className={styles.logout} onClick={logout}><LogOut size={20} /> Logout</button>
            </nav>
          </aside>

          {/* Main Content */}
          <div className={styles.main}>
            {/* ID Verification Alert Banner */}
            {user.role !== 'seller' && user.role !== 'admin' && (
              <div className={styles.kycAlertBanner}>
                <div className={styles.kycInfo}>
                  <ShieldAlert size={24} color="var(--warning)" />
                  <div>
                    <h4>Action Required: Verify Your Identity</h4>
                    <p>To start earning commissions and listing products, you must verify your ID documents.</p>
                  </div>
                </div>
                <button onClick={() => router.push('/kyc')} className="gradient-primary">
                  Start Verification
                </button>
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

                        {order.status.includes('Escrow') && (
                          <div className={styles.escrowBanner}>
                            <ShieldCheck size={16} />
                            <span>Your money is safe in escrow. Payment will be released after delivery confirmation.</span>
                          </div>
                        )}
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

                <div className={styles.mlmStats}>
                  <div className={styles.mlmCard}>
                    <div className={styles.mlmIcon} style={{ background: '#e3f2fd', color: '#1976d2' }}><TrendingUp size={24} /></div>
                    <div className={styles.mlmInfo}>
                      <span>₹{stats.directCommission.toLocaleString()}</span>
                      <p>Direct Sales (10%)</p>
                    </div>
                  </div>
                  <div className={styles.mlmCard}>
                    <div className={styles.mlmIcon} style={{ background: '#e8f5e9', color: '#2e7d32' }}><IndianRupee size={24} /></div>
                    <div className={styles.mlmInfo}>
                      <span>₹{stats.indirectCommission.toLocaleString()}</span>
                      <p>Indirect (2% Level 2+)</p>
                    </div>
                  </div>
                  <div className={styles.mlmCard}>
                    <div className={styles.mlmIcon} style={{ background: '#fff3e0', color: '#ef6c00' }}><UsersIcon size={24} /></div>
                    <div className={styles.mlmInfo}>
                      <span>₹{stats.totalCommission.toLocaleString()}</span>
                      <p>Total Payout</p>
                    </div>
                  </div>
                </div>

                <div className={styles.networkGroups}>
                  <h2>Your Referral Network (Ternary Tree)</h2>
                  <p className={styles.subtext}>Visual representation of your direct sales team (C, D, E).</p>
                  
                  {/* Visual Ternary Tree for Verified Sellers */}
                  {(user.role === 'seller' || user.role === 'admin') && (
                    <div className={styles.visualTreeSection}>
                      <div className={styles.treeHeader}>
                        <h3>Pyramid Business Structure</h3>
                        <button className={styles.addMemberBtn} onClick={() => setIsAddingMember(!isAddingMember)}>
                          <Plus size={16} /> {isAddingMember ? 'Cancel' : 'Register Member'}
                        </button>
                      </div>

                      {isAddingMember && (
                        <div className={styles.addMemberForm}>
                          <h4>Quick Register Member</h4>
                          <div className={styles.miniFormGrid}>
                            <input type="text" placeholder="Full Name" value={newMemberData.name} onChange={(e) => setNewMemberData({...newMemberData, name: e.target.value})} />
                            <input type="email" placeholder="Email" value={newMemberData.email} onChange={(e) => setNewMemberData({...newMemberData, email: e.target.value})} />
                            <input type="tel" placeholder="Phone Number" value={newMemberData.phone} onChange={(e) => setNewMemberData({...newMemberData, phone: e.target.value})} />
                            <input type="text" placeholder="City" value={newMemberData.city} onChange={(e) => setNewMemberData({...newMemberData, city: e.target.value})} />
                            <input type="text" placeholder="Police Station (PS)" value={newMemberData.ps} onChange={(e) => setNewMemberData({...newMemberData, ps: e.target.value})} />
                            <input type="text" placeholder="Post Office (PO)" value={newMemberData.po} onChange={(e) => setNewMemberData({...newMemberData, po: e.target.value})} />
                          </div>
                          
                          <div className={styles.registrationUploads}>
                            <p><strong>Referral ID Documents (KYC)</strong></p>
                            <div className={styles.uploadRow}>
                              <div className={styles.miniUpload}>
                                <input type="file" id="ref-front" />
                                <label htmlFor="ref-front">ID Front</label>
                              </div>
                              <div className={styles.miniUpload}>
                                <input type="file" id="ref-back" />
                                <label htmlFor="ref-back">ID Back</label>
                              </div>
                              <div className={styles.miniUpload}>
                                <input type="file" id="ref-selfie" />
                                <label htmlFor="ref-selfie">Selfie</label>
                              </div>
                            </div>
                          </div>

                          <div className={styles.termsConsent}>
                            <input type="checkbox" id="reg-terms" required />
                            <label htmlFor="reg-terms">I agree to SafeShop's <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a> for this new member.</label>
                          </div>

                          <button 
                            className="gradient-primary" 
                            style={{ marginTop: '15px', padding: '10px 20px', borderRadius: '8px', color: 'white', fontWeight: 'bold' }}
                            onClick={() => {
                              const newUserId = `SS-USR-${Math.floor(Math.random() * 10000)}`;
                              const newRef = {
                                id: newUserId,
                                name: newMemberData.name,
                                email: newMemberData.email,
                                avatar: newMemberData.name[0],
                                sales: 0,
                                indirectSales: 0,
                                status: 'pending',
                                referredBy: user.id,
                                role: 'associate',
                                ps: newMemberData.ps,
                                po: newMemberData.po,
                                phone: newMemberData.phone,
                                hasDocs: true,
                                joinedAt: new Date().toLocaleDateString()
                              };
                              
                              // Update local state
                              setReferrals([...referrals, newRef]);
                              
                              // Save to global users list for Admin to see
                              const globalUsers = JSON.parse(localStorage.getItem('safeshop-global-users') || '[]');
                              globalUsers.push(newRef);
                              localStorage.setItem('safeshop-global-users', JSON.stringify(globalUsers));

                              alert(`Member ${newMemberData.name} registered successfully with ID Documents! Admin will verify everything soon.`);
                              setIsAddingMember(false);
                              setNewMemberData({ name: '', email: '', phone: '', city: '', state: '', ps: '', po: '' });
                            }}
                          >
                            Confirm Registration
                          </button>
                        </div>
                      )}
                      
                      <div className={styles.treeContainer}>
                        <NetworkTree 
                          rootUser={{ name: user.name, id: user.id }}
                          referrals={referrals}
                          onAddMember={() => setIsAddingMember(true)}
                        />
                      </div>
                    </div>
                  )}

                  <div className={styles.commissionExplanation}>
                    <h3>How your earnings are calculated:</h3>
                    <div className={styles.explGrid}>
                      <div className={styles.explCard}>
                        <div className={styles.explIcon}><Award size={20} /></div>
                        <div>
                          <strong>Direct Commission (10%)</strong>
                          <p>Earn ₹200 for every ₹2000 product sold to your direct recruits (C, D, E).</p>
                        </div>
                      </div>
                      <div className={styles.explCard}>
                        <div className={styles.explIcon}><TrendingUp size={20} /></div>
                        <div>
                          <strong>Indirect Commission (2%)</strong>
                          <p>Earn 2% from any sales made by people joined by your direct recruits.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role Based Tools */}
                {(user.role === 'seller' || user.role === 'admin') ? (
                  <>
                    <div className={styles.referralSection}>
                      <div className={styles.referCard}>
                        <div className={styles.referText}>
                          <h3>Expand Your Pyramid</h3>
                          <p>Share your unique referral link to grow your network and earn passive income from level 2 sales.</p>
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
                          <div className={styles.rStat}>
                            <button onClick={() => router.push('/seller/list-product')} className="gradient-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px' }}>+ New Sale</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={styles.lockedSection}>
                    <ShieldAlert size={48} color="var(--warning)" />
                    <h3>Business Dashboard Locked</h3>
                    <p>Your ID verification is pending. Only verified sellers can access recruitment tools and earn commissions.</p>
                    <div className={styles.lockedActions}>
                      <button className="gradient-primary" onClick={() => router.push('/kyc')}>Check Verification Status</button>
                    </div>
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
