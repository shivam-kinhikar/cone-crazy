import { useState, useEffect } from 'react';
import { Users, Search, Plus, Edit, Trash2, Eye, History, Award, DollarSign, Package } from 'lucide-react';
import api from '../utils/axios';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Drawer state
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerAnalytics, setCustomerAnalytics] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Form state
  const [customerId, setCustomerId] = useState(null);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [birthday, setBirthday] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      const custData = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.data || []);
      setCustomers(custData);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setCustomerId(customer._id);
      setName(customer.name);
      setMobile(customer.mobile);
      setEmail(customer.email || '');
      setAddress(customer.address || '');
      setBirthday(customer.birthday ? new Date(customer.birthday).toISOString().split('T')[0] : '');
    } else {
      setCustomerId(null);
      setName('');
      setMobile('');
      setEmail('');
      setAddress('');
      setBirthday('');
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const payload = { name, mobile, email, address, birthday };
      if (customerId) {
        await api.put(`/customers/${customerId}`, payload);
      } else {
        await api.post('/customers', payload);
      }
      setShowModal(false);
      fetchCustomers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save customer');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete customer');
    }
  };

  const handleViewProfile = async (customer) => {
    setSelectedCustomer(customer);
    setShowDrawer(true);
    setLoadingProfile(true);
    try {
      const [ordersRes, analyticsRes] = await Promise.all([
        api.get(`/customers/${customer._id}/orders`),
        api.get(`/customers/${customer._id}/analytics`)
      ]);
      setCustomerOrders(ordersRes.data.data || []);
      setCustomerAnalytics(analyticsRes.data.data || {});
    } catch (error) {
      console.error("Failed to fetch customer profile data", error);
      setCustomerOrders([]);
      setCustomerAnalytics({});
    } finally {
      setLoadingProfile(false);
    }
  };

  // Filter customers locally (safely handling missing or incorrect data types)
  const filteredCustomers = (customers || []).filter(c => {
    const cName = String(c?.name || '');
    const cMobile = String(c?.mobile || '');
    const search = String(searchTerm || '').toLowerCase();
    return cName.toLowerCase().includes(search) || cMobile.toLowerCase().includes(search);
  });

  if (loading) return <div className="flex h-full items-center justify-center text-text-muted">Loading customers...</div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-secondary flex items-center">
          <div className="w-1 h-6 bg-primary mr-3 rounded-full"></div>
          Customers Directory
        </h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus size={18} className="mr-2" /> Add Customer
        </button>
      </div>

      <div className="saas-card overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-hover/30">
          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Search Name & Mobile Number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-surface text-text border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-text-muted" />
          </div>
          <span className="text-sm font-medium text-text-muted">
            Total Customers: {customers.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm min-w-[800px]">
            <thead>
              <tr className="bg-surface border-b border-border text-text-muted">
                <th className="p-4 font-semibold whitespace-nowrap">Customer Name</th>
                <th className="p-4 font-semibold whitespace-nowrap">Mobile Number</th>
                <th className="p-4 font-semibold whitespace-nowrap">Loyalty Points</th>
                <th className="p-4 font-semibold whitespace-nowrap">Total Spent</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredCustomers.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-text-muted">No customers found.</td></tr>
              )}
              {filteredCustomers.map((c) => (
                <tr key={c._id} className="hover:bg-surface-hover transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                        <Users size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary whitespace-nowrap">{c.name}</p>
                        <p className="text-xs text-text-muted whitespace-nowrap">Since {new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-text whitespace-nowrap">{c.mobile}</p>
                    <p className="text-xs text-text-muted whitespace-nowrap">{c.email || 'No email'}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-warning-bg text-warning text-xs font-bold rounded whitespace-nowrap">
                      {c.loyaltyPoints} pts
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-text whitespace-nowrap">
                    ₹{Number(c.totalSpent || 0).toFixed(2)}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => handleViewProfile(c)} className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors" title="View Profile">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleOpenModal(c)} className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(c._id)} className="p-1.5 text-text-muted hover:text-danger hover:bg-danger-bg rounded transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Drawer */}
      {showDrawer && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div className="absolute inset-0 bg-secondary/50" onClick={() => setShowDrawer(false)}></div>
          
          {/* Drawer Content */}
          <div className="relative w-full max-w-md bg-surface h-full shadow-2xl flex flex-col animate-fade-in-up">
            <div className="p-6 border-b border-border bg-surface-hover/30 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-secondary">{selectedCustomer.name}</h2>
                <p className="text-sm text-text-muted mt-1">{selectedCustomer.mobile}</p>
              </div>
              <button onClick={() => setShowDrawer(false)} className="text-text-muted hover:text-text text-xl">&times;</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingProfile ? (
                <div className="text-center text-text-muted py-10">Loading profile data...</div>
              ) : (
                <>
                  {/* Analytics Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border bg-surface-hover/50 text-center">
                      <DollarSign size={20} className="mx-auto text-success mb-2" />
                      <p className="text-xs text-text-muted font-semibold">Total Spent</p>
                      <p className="text-lg font-bold text-secondary">₹{Number(customerAnalytics?.totalSpent || 0).toFixed(2)}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-surface-hover/50 text-center">
                      <Package size={20} className="mx-auto text-primary mb-2" />
                      <p className="text-xs text-text-muted font-semibold">Total Orders</p>
                      <p className="text-lg font-bold text-secondary">{customerAnalytics?.totalOrders || 0}</p>
                    </div>
                    <div className="col-span-2 p-4 rounded-xl border border-border bg-warning-bg/30 text-center">
                      <Award size={20} className="mx-auto text-warning mb-2" />
                      <p className="text-xs text-warning font-semibold">Loyalty Points Balance</p>
                      <p className="text-xl font-bold text-warning">{customerAnalytics?.loyaltyPoints || 0}</p>
                    </div>
                  </div>

                  {/* Purchase History */}
                  <div>
                    <h3 className="font-bold text-secondary mb-4 flex items-center">
                      <History size={18} className="mr-2 text-text-muted" /> 
                      Purchase History
                    </h3>
                    <div className="space-y-3">
                      {customerOrders.length === 0 ? (
                        <p className="text-sm text-text-muted text-center py-4">No past purchases.</p>
                      ) : (
                        customerOrders.map(order => (
                          <div key={order._id} className="p-3 border border-border rounded-lg bg-surface flex justify-between items-center">
                            <div>
                              <p className="text-sm font-semibold text-text">Order #{order.orderNumber.substring(0, 6)}</p>
                              <p className="text-xs text-text-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-success">+₹{order.totalAmount.toFixed(2)}</p>
                              <p className="text-xs text-text-muted">{order.items?.length || 0} items</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 p-4">
          <div className="saas-card w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="p-5 border-b border-border flex justify-between items-center bg-surface-hover/50">
              <h3 className="font-bold text-secondary">{customerId ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text transition-colors">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-muted mb-1">Full Name *</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="saas-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Mobile Number *</label>
                  <input type="text" required value={mobile} onChange={e => setMobile(e.target.value)} className="saas-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="saas-input" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-text-muted mb-1">Physical Address</label>
                  <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="saas-input" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-text-muted mb-1">Birthday</label>
                  <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} className="saas-input" />
                </div>
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 px-4 bg-surface hover:bg-surface-hover border border-border text-text font-medium rounded-lg transition-colors text-sm">Cancel</button>
                <button type="submit" disabled={processing} className="flex-1 py-2 px-4 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors disabled:opacity-70 text-sm">
                  {processing ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
