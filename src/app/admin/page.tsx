'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { sellers, products } from '@/data/mockData';
import { NetworkTree } from '@/components/NetworkTree';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Users as UsersIcon, Package, AlertTriangle, BarChart3, CheckCircle, XCircle, Search, ChevronDown, ChevronRight, UserCheck, Loader2, Trash2, ShieldCheck } from 'lucide-react';
import styles from './Admin.module.css';

export default function AdminPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  React.useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login?callbackUrl=/admin');
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading || !isAuthenticated || user?.role !== 'admin') {
    return <div className={styles.adminPage}><div className="container">Verifying admin credentials...</div></div>;
  }

  const [activeTab, setActiveTab] = React.useState('stats');
  const [kycQueue, setKycQueue] = React.useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = React.useState<any[]>([]);
  const [allOrders, setAllOrders] = React.useState<any[]>([]);
  const [newRegistrations, setNewRegistrations] = React.useState<any[]>([]);

  const [globalUsers, setGlobalUsers] = React.useState<any[]>([]);
  const [dataLoading, setDataLoading] = React.useState(true);
  
  // User Deletion State
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<any>(null);
  const [adminPassword, setAdminPassword] = React.useState('');
  const [pendingVerificationId, setPendingVerificationId] = React.useState<string | null>(null);

  const loadData = async () => {
    setDataLoading(true);
    try {
      // 1. Fetch Users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('joined_at', { ascending: false });
      
      if (usersError) throw usersError;
      setGlobalUsers(usersData || []);

      // 2. Fetch Pending Products
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (prodError) throw prodError;
      setPendingProducts(prodData || []);

      // 3. Fetch KYC Submissions (Cloud)
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (kycError) {
        console.warn('KYC table might not exist yet:', kycError.message);
      } else {
        setKycQueue(kycData || []);
      }
      
      // 4. Fetch Orders (Cloud)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.warn('Orders table might not exist yet:', ordersError.message);
      } else {
        setAllOrders(ordersData || []);
      }

    } catch (error: any) {
      console.error('Data load error:', error.message);
    } finally {
      setDataLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    setPendingVerificationId(userId);
    setAdminPassword('');
  };

  const confirmVerification = async () => {
    if (adminPassword !== 'admin123') { // Fixed passkey for now, should be env variable
      alert('Incorrect Admin Pass Key!');
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'verified', role: 'seller' })
        .eq('id', pendingVerificationId);

      if (error) throw error;
      setGlobalUsers(globalUsers.map(u => u.id === pendingVerificationId ? { ...u, status: 'verified', role: 'seller' } : u));
      setPendingVerificationId(null);
      alert('User verified successfully!');
    } catch (err: any) {
      alert('Error verifying user: ' + err.message);
    }
  };

  const [pendingKycAction, setPendingKycAction] = React.useState<{id: string, action: 'approve' | 'reject'} | null>(null);

  const handleKycAction = async (id: string, action: 'approve' | 'reject') => {
    setPendingKycAction({ id, action });
    setAdminPassword('');
  };

  const confirmKycAction = async () => {
    if (!pendingKycAction) return;
    if (adminPassword !== 'admin123') {
      alert('Incorrect Admin Pass Key!');
      return;
    }

    try {
      const { error } = await supabase
        .from('kyc_submissions')
        .update({ status: pendingKycAction.action === 'approve' ? 'Approved' : 'Rejected' })
        .eq('id', pendingKycAction.id);

      if (error) throw error;
      setKycQueue(kycQueue.filter(q => q.id !== pendingKycAction.id));
      
      if (pendingKycAction.action === 'approve') {
        const submission = kycQueue.find(q => q.id === pendingKycAction.id);
        if (submission) {
          await supabase.from('users').update({ status: 'verified', role: 'seller' }).eq('id', submission.user_id);
          setGlobalUsers(globalUsers.map(u => u.id === submission.user_id ? { ...u, status: 'verified', role: 'seller' } : u));
        }
      }
      
      setPendingKycAction(null);
      alert(`KYC ${pendingKycAction.action === 'approve' ? 'Approved' : 'Rejected'} successfully!`);
    } catch (err: any) {
      alert('Error updating KYC: ' + err.message);
    }
  };

  React.useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const handleProductAction = (id: string, action: 'approve' | 'reject') => {
    const updated = pendingProducts.filter(p => p.id !== id);
    setPendingProducts(updated);
    localStorage.setItem('safeshop-pending-products', JSON.stringify(updated));
  };

  const handleDeleteUser = async () => {
    // SECURITY CHECK
    if (adminPassword !== 'admin123') {
      alert('❌ Incorrect Admin Password! Access Denied.');
      return;
    }

    if (!userToDelete) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userToDelete.id);

      if (error) throw error;

      alert(`✅ User ${userToDelete.name} has been permanently removed.`);
      setShowDeleteModal(false);
      setUserToDelete(null);
      setAdminPassword('');
      loadData(); // Refresh the list
    } catch (err: any) {
      alert('Error deleting user: ' + err.message);
    }
  };

  const [selectedNetworkUser, setSelectedNetworkUser] = React.useState<any>(null);
  const [viewingKyc, setViewingKyc] = React.useState<any>(null);

  const renderAuthModal = () => {
    const isPending = pendingVerificationId || pendingKycAction;
    if (!isPending) return null;

    const actionText = pendingVerificationId ? 'Verify User ID' : (pendingKycAction?.action === 'approve' ? 'Approve KYC Documents' : 'Reject KYC Documents');

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.deleteModal} style={{ borderColor: 'var(--primary)' }}>
          <ShieldCheck size={48} color="var(--primary)" style={{ marginBottom: '15px' }} />
          <h3>Admin Authorization</h3>
          <p>Please enter the Admin Pass Key to <strong>{actionText}</strong>.</p>
          
          <input 
            type="password" 
            className={styles.modalInput} 
            placeholder="Pass Key"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            autoFocus
          />

          <div className={styles.modalActions}>
            <button className={styles.cancelBtn} onClick={() => { setPendingVerificationId(null); setPendingKycAction(null); }}>Cancel</button>
            <button 
              className={styles.approveBtn} 
              style={{ flex: 1 }} 
              onClick={pendingVerificationId ? confirmVerification : confirmKycAction}
            >
              Confirm Action
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderKycModal = () => {
    if (!viewingKyc) return null;
    return (
      <div className={styles.modalOverlay} onClick={() => setViewingKyc(null)}>
        <div className={styles.kycDocModal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h3>ID Documents: {viewingKyc.user_name}</h3>
            <button className={styles.closeBtn} onClick={() => setViewingKyc(null)}><XCircle size={24} /></button>
          </div>
          <div className={styles.docGrid}>
            <div className={styles.docItem}>
              <span>Document Type: {viewingKyc.doc_type}</span>
              <div className={styles.docImage}>
                {/* Fallback to placeholders since actual storage upload is being implemented */}
                <img src="https://images.unsplash.com/photo-1557124816-e9b7d5440de2?w=500" alt="Front" />
                <p>Front Side</p>
              </div>
            </div>
            <div className={styles.docItem}>
              <span>Document Back</span>
              <div className={styles.docImage}>
                <img src="https://images.unsplash.com/photo-1634224143540-062bb00700ae?w=500" alt="Back" />
                <p>Back Side</p>
              </div>
            </div>
            <div className={styles.docItem}>
              <span>Face Verification</span>
              <div className={styles.docImage}>
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500" alt="Selfie" />
                <p>User Selfie</p>
              </div>
            </div>
          </div>
          <div className={styles.modalActions}>
            <button className={styles.approveBtn} onClick={() => { handleKycAction(viewingKyc.id, 'approve'); setViewingKyc(null); }}>Approve Verification</button>
            <button className={styles.rejectBtn} onClick={() => { handleKycAction(viewingKyc.id, 'reject'); setViewingKyc(null); }}>Reject Documents</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.adminPage}>
      <div className="container">
        <div className={styles.header}>
          <h1>Admin Dashboard</h1>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <UsersIcon size={24} />
              <div><span>{sellers.length + globalUsers.filter(u => u.status === 'verified').length}</span><p>Verified Sellers</p></div>
            </div>
            <div className={styles.statCard}>
              <Package size={24} />
              <div><span>{products.length}</span><p>Live Products</p></div>
            </div>
            <div className={styles.statCard}>
              <AlertTriangle size={24} color="var(--danger)" />
              <div><span>0</span><p>Active Disputes</p></div>
            </div>
            <div className={styles.statCard}>
              <BarChart3 size={24} color="var(--secondary)" />
              <div>
                <span>₹{allOrders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}</span>
                <p>Total GMV</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button className={activeTab === 'stats' ? styles.activeTab : ''} onClick={() => setActiveTab('stats')}>Overview</button>
          <button className={activeTab === 'network' ? styles.activeTab : ''} onClick={() => setActiveTab('network')}>Explore Networks (Pyramids)</button>
          <button className={activeTab === 'users' ? styles.activeTab : ''} onClick={() => setActiveTab('users')}>Users & Verification ({globalUsers.filter(u => u.status === 'pending').length} New)</button>
          <button className={activeTab === 'orders_list' ? styles.activeTab : ''} onClick={() => setActiveTab('orders_list')}>Manage Orders ({allOrders.length})</button>
          <button className={activeTab === 'products' ? styles.activeTab : ''} onClick={() => setActiveTab('products')}>Product Approvals ({pendingProducts.length})</button>
          <button className={activeTab === 'kyc' ? styles.activeTab : ''} onClick={() => setActiveTab('kyc')}>ID Verifications ({kycQueue.length})</button>
        </div>

        {activeTab === 'stats' && (
          <div className={styles.layout}>
          {/* Seller Approvals */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Recent ID Submissions</h2>
              <button onClick={() => setActiveTab('users')}>View All</button>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Seller Name</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {globalUsers.filter(u => u.status === 'pending').length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>
                      No pending seller verifications.
                    </td>
                  </tr>
                ) : (
                  globalUsers.filter(u => u.status === 'pending').slice(0, 5).map(u => (
                    <tr key={u.id}>
                      <td><code style={{ fontSize: '0.7rem' }}>R-{u.id.slice(-6).toUpperCase()}</code></td>
                      <td>{u.name}</td>
                      <td><span className={styles.statusPending}>Pending</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className={styles.viewBtn} style={{ fontSize: '0.75rem' }} onClick={() => setViewingKyc(u)}>View Docs</button>
                          <button className={styles.approveBtn} style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => handleApproveUser(u.id)}>Verify Now</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Dispute Management */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Recent Disputes</h2>
              <button>Manage All</button>
            </div>
            <div className={styles.disputeList}>
              <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>No active disputes reported.</p>
            </div>
          </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div className={styles.networkView}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>SafeShop User Hierarchy Explorer</h2>
                <div className={styles.userSelector}>
                  <span>Select User:</span>
                  <select 
                    value={selectedNetworkUser?.id || ''} 
                    onChange={(e) => {
                      const all = [...sellers, ...globalUsers];
                      setSelectedNetworkUser(all.find(s => s.id === e.target.value));
                    }}
                    className={styles.selectInput}
                  >
                    <option value="">Select a User</option>
                    {sellers.map(s => <option key={s.id} value={s.id}>{s.name} (Root)</option>)}
                    {globalUsers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
                  </select>
                </div>
              </div>
              
              {selectedNetworkUser ? (
                <>
                  <div className={styles.pyramidHeaderInfo}>
                    <div className={styles.userInfoMini}>
                      <div className={styles.userBadge}>
                        <div className={styles.avatarMini}>{selectedNetworkUser?.name[0]}</div>
                        <div>
                          <h3>{selectedNetworkUser?.name}</h3>
                          <p>Total Sales: ₹{(selectedNetworkUser?.total_sales || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className={styles.userStatsMini}>
                        <div className={styles.miniStat}>
                          <span>Direct</span>
                          <strong>{globalUsers.filter(u => u.referred_by === selectedNetworkUser?.id).length}</strong>
                        </div>
                        <div className={styles.miniStat}>
                          <span>Indirect</span>
                          <strong>0</strong>
                        </div>
                        <div className={styles.miniStat}>
                          <span>Role</span>
                          <strong>{selectedNetworkUser?.role || 'User'}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.pyramidArea} style={{ background: 'transparent', padding: 0, border: 'none' }}>
                    <NetworkTree 
                      rootUser={{ name: selectedNetworkUser?.name || 'User', id: selectedNetworkUser?.id || 'ID' }} 
                      directReferrals={globalUsers.filter(u => u.referred_by === selectedNetworkUser?.id)}
                      fullTeam={globalUsers}
                      isAdminView={true}
                    />
                  </div>
                </>
              ) : (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)' }}>
                  <UsersIcon size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
                  <p>Please select a user from the dropdown to explore their recruitment network.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Registered Users & Sellers</h2>
              <div className={styles.searchBar}>
                <Search size={18} />
                <input type="text" placeholder="Search by name or email..." />
              </div>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ color: 'red' }}>MEMBER UNIQUE ID</th>
                  <th>USER FULL NAME</th>
                  <th>PHONE & ADDRESS</th>
                  <th>REFERRED BY</th>
                  <th>ACCOUNT ROLE</th>
                  <th>TOTAL SALES</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {[...sellers, ...globalUsers].map((u, i) => (
                  <tr key={u.id || i}>
                    <td>
                      <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#1e293b', fontSize: '0.8rem' }}>
                        R-{u.id?.toString().slice(-6).toUpperCase()}
                      </code>
                    </td>
                    <td>
                      <div className={styles.userNameCell}>
                        <div className={styles.avatarMini} style={{ width: '30px', height: '30px', fontSize: '0.8rem' }}>
                          {(u.name || 'U')[0]}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{u.name || 'Unnamed User'}</span>
                            {u.hasDocs && <span className={styles.docsBadge}>Docs Ready</span>}
                          </div>
                          <p style={{ fontSize: '0.7rem', color: 'var(--muted)', margin: 0 }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{u.phone || 'N/A'}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>PS: {u.ps || 'N/A'} | PO: {u.po || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      {u.referredBy ? (
                        <div className={styles.referrerBadge}>
                          <UserCheck size={12} /> {u.referredBy}
                        </div>
                      ) : <span style={{ color: 'var(--muted)' }}>Root</span>}
                    </td>
                    <td>
                      <span className={u.status === 'verified' || u.role === 'seller' ? styles.statusVerified : styles.statusPending}>
                        {u.status === 'verified' || u.role === 'seller' ? 'Verified Seller' : 'Pending ID'}
                      </span>
                    </td>
                    <td>₹{(u.totalSales || 0).toLocaleString()}</td>
                    <td className={styles.actions}>
                      {u.status === 'pending' && (
                        <button className={styles.approveBtn} onClick={() => handleApproveUser(u.id)}>Verify ID</button>
                      )}
                      <button 
                        className={styles.viewBtn}
                        onClick={() => {
                          setSelectedNetworkUser(u);
                          setActiveTab('network');
                        }}
                      >
                        Network
                      </button>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => {
                          setUserToDelete(u);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'kyc' && (
          <div className={styles.kycView}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Pending ID Verification Requests</h2>
                <span className={styles.badge}>4 Urgent</span>
              </div>
              <div className={styles.kycList}>
                {kycQueue.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>No pending ID verification requests.</p>
                ) : (
                  kycQueue.map((req) => (
                    <div key={req.id} className={styles.kycItem}>
                      <div className={styles.kycUser}>
                        <div className={styles.userInitial}>{(req.user_name || 'U')[0]}</div>
                        <div>
                          <h4>{req.user_name}</h4>
                          <p>{req.doc_type} • Submitted {new Date(req.submitted_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={styles.kycActions}>
                        <button className={styles.viewDocBtn} onClick={() => setViewingKyc(req)}>View Documents</button>
                        <button className="gradient-primary" onClick={() => router.push('/kyc')}>Check ID Verification Status</button>
                        <button className={styles.approveBtn} onClick={() => handleKycAction(req.id, 'approve')}>
                          <UserCheck size={18} /> Approve
                        </button>
                        <button className={styles.rejectBtn} onClick={() => handleKycAction(req.id, 'reject')}>
                          <XCircle size={18} /> Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'orders_list' && (
          <div className={styles.orderPanel}>
            <div className={styles.panelHeader}>
              <h2>All Platform Orders</h2>
              <span className={styles.badge}>{allOrders.length} Total</span>
            </div>
            <div className={styles.orderList}>
              {allOrders.length === 0 ? (
                <p className={styles.emptyMsg}>No customer orders found.</p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Escrow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.customer_name || 'Guest'}</td>
                        <td>₹{order.total?.toLocaleString() || '0'}</td>
                        <td>
                          <span className={`${styles.status} ${styles[(order.status || 'pending').toLowerCase().split(' ')[0]] || styles.pending}`}>
                            {order.status || 'Pending'}
                          </span>
                        </td>
                        <td><span className={styles.escrowTag}>Protected</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        {activeTab === 'products' && (
          <div className={styles.productPanel}>
            <div className={styles.panelHeader}>
              <h2>New Product Listings</h2>
              <span className={styles.badge}>{pendingProducts.length} Pending</span>
            </div>
            <div className={styles.productList}>
              {pendingProducts.length === 0 ? (
                <p className={styles.emptyMsg}>No products pending approval.</p>
              ) : (
                pendingProducts.map(p => (
                  <div key={p.id} className={styles.productItem}>
                    <img src={p.image} alt={p.name} className={styles.pThumb} />
                    <div className={styles.pInfo}>
                      <h4>{p.name}</h4>
                      <p>{p.category} • ₹{p.price.toLocaleString()} • {p.bv} BV</p>
                      <span className={styles.pSeller}>By: {p.seller.name}</span>
                    </div>
                    <div className={styles.pActions}>
                      <button className={styles.approveBtn} onClick={() => handleProductAction(p.id, 'approve')}>Approve</button>
                      <button className={styles.rejectBtn} onClick={() => handleProductAction(p.id, 'reject')}>Reject</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Verification Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <Trash2 size={48} color="#ff4757" style={{ marginBottom: '15px' }} />
            <h3>Confirm Deletion</h3>
            <p>You are about to permanently delete <strong>{userToDelete?.name}</strong>. This action cannot be undone.</p>
            
            <input 
              type="password" 
              className={styles.modalInput} 
              placeholder="Enter Admin Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              autoFocus
            />

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className={styles.confirmDeleteBtn} onClick={handleDeleteUser}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
      {renderKycModal()}
      {renderAuthModal()}
    </div>
  );
}
