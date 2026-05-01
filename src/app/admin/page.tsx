'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { sellers, products } from '@/data/mockData';
import { NetworkTree } from '@/components/NetworkTree';
import { Users, Package, AlertTriangle, BarChart3, CheckCircle, XCircle, Search, ChevronDown, ChevronRight, UserCheck } from 'lucide-react';
import styles from './Admin.module.css';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('stats');
  const [kycQueue, setKycQueue] = React.useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = React.useState<any[]>([]);
  const [allOrders, setAllOrders] = React.useState<any[]>([]);
  const [newRegistrations, setNewRegistrations] = React.useState<any[]>([]);

  const [globalUsers, setGlobalUsers] = React.useState<any[]>([]);

  const loadData = () => {
    const savedKyc = localStorage.getItem('safeshop-kyc-queue');
    if (savedKyc) setKycQueue(JSON.parse(savedKyc));
    
    const savedProducts = localStorage.getItem('safeshop-pending-products');
    if (savedProducts) setPendingProducts(JSON.parse(savedProducts));

    const savedOrders = localStorage.getItem('safeshop-orders');
    if (savedOrders) setAllOrders(JSON.parse(savedOrders));

    const savedGlobalUsers = localStorage.getItem('safeshop-global-users');
    if (savedGlobalUsers) setGlobalUsers(JSON.parse(savedGlobalUsers));
  };

  const handleApproveUser = (id: string) => {
    const updatedUsers = globalUsers.map(u => {
      if (u.id === id) {
        return { ...u, status: 'verified', role: 'seller', isVerified: true };
      }
      return u;
    });
    setGlobalUsers(updatedUsers);
    localStorage.setItem('safeshop-global-users', JSON.stringify(updatedUsers));
    alert('User ID Verified successfully! They can now start selling.');
  };

  const handleKycAction = (id: string, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      const request = kycQueue.find(item => item.id === id);
      if (request) {
        // Try to find the user in global list or current session
        const savedGlobal = JSON.parse(localStorage.getItem('safeshop-global-users') || '[]');
        const updatedGlobal = savedGlobal.map((u: any) => {
          if (u.email === request.email || u.id === id) {
            return { ...u, status: 'verified', role: 'seller', isVerified: true };
          }
          return u;
        });
        localStorage.setItem('safeshop-global-users', JSON.stringify(updatedGlobal));
        setGlobalUsers(updatedGlobal);
      }
    }

    const updated = kycQueue.filter(item => item.id !== id);
    setKycQueue(updated);
    localStorage.setItem('safeshop-kyc-queue', JSON.stringify(updated));
    alert(action === 'approve' ? 'KYC Approved!' : 'KYC Rejected');
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

  const [selectedNetworkUser, setSelectedNetworkUser] = React.useState<any>(sellers[0]);

  return (
    <div className={styles.adminPage}>
      <div className="container">
        <div className={styles.header}>
          <h1>Admin Dashboard</h1>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <Users size={24} />
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
                      <td>{u.name}</td>
                      <td><span className={styles.statusPending}>Pending</span></td>
                      <td><button className={styles.viewBtn} onClick={() => handleApproveUser(u.id)}>Verify Now</button></td>
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
                    value={selectedNetworkUser?.id} 
                    onChange={(e) => {
                      const all = [...sellers, ...globalUsers];
                      setSelectedNetworkUser(all.find(s => s.id === e.target.value));
                    }}
                    className={styles.selectInput}
                  >
                    {sellers.map(s => <option key={s.id} value={s.id}>{s.name} (Root)</option>)}
                    {globalUsers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
                  </select>
                </div>
              </div>
              
              <div className={styles.pyramidHeaderInfo}>
                <div className={styles.userInfoMini}>
                  <div className={styles.userBadge}>
                    <div className={styles.avatarMini}>{selectedNetworkUser?.name[0]}</div>
                    <div>
                      <h3>{selectedNetworkUser?.name}</h3>
                      <p>Total Sales: ₹{(selectedNetworkUser?.totalSales * 1000 || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className={styles.userStatsMini}>
                    <div className={styles.miniStat}>
                      <span>Direct</span>
                      <strong>{globalUsers.filter(u => u.referredBy === selectedNetworkUser?.id).length}</strong>
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

              <div className={styles.pyramidArea}>
                <NetworkTree 
                  rootUser={{ name: selectedNetworkUser?.name || 'User', id: selectedNetworkUser?.id || 'ID' }} 
                  referrals={globalUsers.filter(u => u.referredBy === selectedNetworkUser?.id)}
                  isAdminView={true}
                />
              </div>
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
                  <th>User Name</th>
                  <th>Phone & Address</th>
                  <th>Referred By</th>
                  <th>Role</th>
                  <th>Total Sales</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...sellers, ...globalUsers].map((u, i) => (
                  <tr key={u.id || i}>
                    <td>
                      <div className={styles.userNameCell}>
                        <div className={styles.avatarMini} style={{ width: '30px', height: '30px', fontSize: '0.8rem' }}>{u.name[0]}</div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{u.name}</span>
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
                        <div className={styles.userInitial}>{req.name[0]}</div>
                        <div>
                          <h4>{req.name}</h4>
                          <p>{req.type} • Submitted {req.date}</p>
                        </div>
                      </div>
                      <div className={styles.kycActions}>
                        <button className={styles.viewDocBtn}>View Documents</button>
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
                        <td>{order.customer?.name || 'Guest'}</td>
                        <td>₹{order.total?.toLocaleString() || '0'}</td>
                        <td><span className={`${styles.status} ${styles[order.status?.toLowerCase()]}`}>{order.status}</span></td>
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
    </div>
  );
}
