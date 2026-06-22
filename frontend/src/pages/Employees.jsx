import { useState, useEffect } from 'react';
import { Plus, User, Trash2, Search, X, Mail, Shield, Phone, CheckCircle, XCircle, Edit } from 'lucide-react';
import api from '../utils/axios';

const Employees = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Edit State
  const [editMode, setEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  // User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('cashier');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('active');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('cashier');
    setPhone('');
    setStatus('active');
    setEditMode(false);
    setEditingUserId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (user) => {
    setName(user.name || '');
    setEmail(user.email || '');
    setPassword(''); // don't load password, keep blank to not change it
    setRole(user.role || 'cashier');
    setPhone(user.phone || '');
    setStatus(user.status || 'active');
    setEditMode(true);
    setEditingUserId(user._id);
    setShowModal(true);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    const payload = {
      name, email, role, phone, status
    };
    
    // Only include password if it's provided (required for creation, optional for edit)
    if (password) {
      payload.password = password;
    }

    try {
      if (editMode) {
        await api.put(`/users/${editingUserId}`, payload);
      } else {
        await api.post('/auth/register', payload);
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} user`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? They will immediately lose access to the system.")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = (users || []).filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (roleStr) => {
    switch (roleStr) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'manager': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'inventory_staff': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200'; // Cashier
    }
  };

  const formatRole = (roleStr) => {
    if (!roleStr) return '';
    return roleStr.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) return <div className="flex h-full items-center justify-center text-text-muted">Loading users...</div>;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary flex items-center">
          <div className="w-1.5 h-7 bg-primary mr-3 shadow-sm"></div>
          Staff Management
        </h1>
        <button 
          onClick={handleOpenAddModal}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-sm flex items-center text-sm font-bold transition-colors shadow-sm"
        >
          <Plus size={18} className="mr-2" /> Add Staff Member
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-surface border border-border shadow-sm">
        {/* Search Bar */}
        <div className="p-4 border-b border-border bg-surface-hover/30 flex justify-between items-center">
          <div className="relative w-80">
            <input 
              type="text" 
              placeholder="Search staff..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-background text-text border border-border rounded-sm focus:border-primary outline-none transition-colors text-sm font-medium"
            />
            <Search size={16} className="absolute left-3.5 top-2.5 text-text-muted" />
          </div>
          <div className="text-sm font-bold text-secondary">
            Total Staff: <span className="text-primary">{filteredUsers.length}</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-xs uppercase tracking-wider text-text-muted">
                <th className="p-4 font-bold w-[25%]">Staff Member</th>
                <th className="p-4 font-bold w-[25%]">Contact Info</th>
                <th className="p-4 font-bold w-[20%]">Position</th>
                <th className="p-4 font-bold w-[15%]">Status</th>
                <th className="p-4 font-bold text-center w-[15%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center">
                      <User size={32} className="opacity-20 mb-3" />
                      <p className="font-medium text-sm">No staff members found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors group">
                    <td className="p-4 align-middle">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded bg-surface-hover flex items-center justify-center mr-3 border border-border">
                          <User size={14} className="text-primary" />
                        </div>
                        <span className="font-bold text-secondary text-sm group-hover:text-primary transition-colors">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle space-y-1">
                      <div className="flex items-center text-xs font-medium text-secondary">
                        <Mail size={12} className="mr-2 text-text-muted" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-xs font-medium text-text-muted">
                          <Phone size={12} className="mr-2" />
                          {user.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded flex items-center w-max border ${getRoleBadgeColor(user.role)}`}>
                        <Shield size={10} className="mr-1" />
                        {formatRole(user.role)}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center">
                        {user.status === 'active' ? (
                          <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                            <CheckCircle size={12} className="mr-1" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center text-xs font-bold text-danger bg-danger-bg border border-danger-border px-2 py-0.5 rounded-sm">
                            <XCircle size={12} className="mr-1" /> Inactive
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-center">
                      <div className="flex justify-center items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenEditModal(user)} 
                          className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-sm transition-colors"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id)} 
                          className="p-1.5 text-text-muted hover:text-danger hover:bg-danger-bg rounded-sm transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-secondary/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-surface shadow-2xl w-full max-w-2xl border border-border rounded-sm overflow-hidden animate-fade-in-up">
            <div className="p-5 border-b border-border flex justify-between items-center bg-surface-hover/30">
              <h3 className="text-lg font-bold text-secondary uppercase tracking-wide">
                {editMode ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-danger transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="p-6">
              <div className="grid grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Full Name <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full bg-background border border-border focus:border-primary rounded-sm px-3 py-2 text-sm transition-colors outline-none text-secondary font-semibold" 
                    placeholder="e.g. John Doe" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Email Address <span className="text-danger">*</span></label>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full bg-background border border-border focus:border-primary rounded-sm px-3 py-2 text-sm transition-colors outline-none text-secondary font-semibold" 
                    placeholder="e.g. john@gmail.com" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Phone Number</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    className="w-full bg-background border border-border focus:border-primary rounded-sm px-3 py-2 text-sm transition-colors outline-none text-secondary font-semibold" 
                    placeholder="e.g. +1 234 567 8900" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">
                    {editMode ? 'Reset Password' : 'Temporary Password'} {!editMode && <span className="text-danger">*</span>}
                  </label>
                  <input 
                    type="text" 
                    required={!editMode} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full bg-background border border-border focus:border-primary rounded-sm px-3 py-2 text-sm transition-colors outline-none text-secondary font-semibold" 
                    placeholder={editMode ? "Leave blank to keep current" : "Min. 6 characters"} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Position / Role <span className="text-danger">*</span></label>
                  <select 
                    value={role} 
                    onChange={e => setRole(e.target.value)} 
                    className="w-full bg-background border border-border focus:border-primary rounded-sm px-3 py-2 text-sm transition-colors outline-none text-secondary font-semibold appearance-none"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="inventory_staff">Inventory Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Account Status</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)} 
                    className="w-full bg-background border border-border focus:border-primary rounded-sm px-3 py-2 text-sm transition-colors outline-none text-secondary font-semibold appearance-none"
                  >
                    <option value="active">Active - Can login</option>
                    <option value="inactive">Inactive - Access blocked</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-5 border-t border-border flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="py-2 px-4 bg-background hover:bg-danger-bg hover:text-danger border border-border text-text-muted font-bold rounded-sm transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={processing} 
                  className="py-2 px-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-sm transition-colors shadow-sm disabled:opacity-70 text-sm"
                >
                  {processing ? 'Saving...' : (editMode ? 'Update Account' : 'Create Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
