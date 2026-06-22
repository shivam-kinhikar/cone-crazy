import { useState, useEffect } from 'react';
import { Plus, Gift, Calendar, Percent, Trash2, Search, X, Edit, CheckCircle, XCircle } from 'lucide-react';
import api from '../utils/axios';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Edit State
  const [editMode, setEditMode] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);

  // Form State
  const [offerName, setOfferName] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('Percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('active');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await api.get('/offers');
      setOffers(res.data.data);
    } catch (error) {
      console.error("Failed to fetch offers", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOfferName('');
    setDescription('');
    setDiscountType('Percentage');
    setDiscountValue('');
    setStartDate('');
    setEndDate('');
    setStatus('active');
    setEditMode(false);
    setEditingOfferId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (offer) => {
    setOfferName(offer.offerName || '');
    setDescription(offer.description || '');
    setDiscountType(offer.discountType || 'Percentage');
    setDiscountValue(offer.discountValue || '');
    
    // Format dates for input type="date"
    const sd = offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : '';
    const ed = offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '';
    
    setStartDate(sd);
    setEndDate(ed);
    setStatus(offer.status || 'active');
    setEditMode(true);
    setEditingOfferId(offer._id);
    setShowModal(true);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    const payload = {
      offerName,
      description,
      discountType,
      discountValue: Number(discountValue),
      startDate,
      endDate,
      status
    };

    try {
      if (editMode) {
        await api.put(`/offers/${editingOfferId}`, payload);
      } else {
        await api.post('/offers', payload);
      }
      setShowModal(false);
      resetForm();
      fetchOffers();
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} offer`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this offer?")) return;
    try {
      await api.delete(`/offers/${id}`);
      fetchOffers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete offer');
    }
  };

  const filteredOffers = (offers || []).filter(offer => 
    (offer.offerName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex h-full items-center justify-center text-text-muted">Loading offers...</div>;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary flex items-center">
          <div className="w-1.5 h-7 bg-primary mr-3 shadow-sm"></div>
          Promotional Offers
        </h1>
        <button 
          onClick={handleOpenAddModal}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-sm flex items-center text-sm font-bold transition-colors shadow-sm"
        >
          <Plus size={18} className="mr-2" /> Create Offer
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-surface border border-border shadow-sm">
        {/* Search Bar */}
        <div className="p-4 border-b border-border bg-surface-hover/30 flex justify-between items-center">
          <div className="relative w-80">
            <input 
              type="text" 
              placeholder="Search promotional offers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-background text-text border border-border rounded-sm focus:border-primary outline-none transition-colors text-sm font-medium"
            />
            <Search size={16} className="absolute left-3.5 top-2.5 text-text-muted" />
          </div>
          <div className="text-sm font-bold text-secondary">
            Total: <span className="text-primary">{filteredOffers.length}</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-xs uppercase tracking-wider text-text-muted">
                <th className="p-4 font-bold w-[30%]">Offer Details</th>
                <th className="p-4 font-bold w-[20%]">Discount</th>
                <th className="p-4 font-bold w-[20%]">Validity</th>
                <th className="p-4 font-bold w-[15%]">Status</th>
                <th className="p-4 font-bold text-center w-[15%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center">
                      <Gift size={32} className="opacity-20 mb-3" />
                      <p className="font-medium text-sm">No promotional offers found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOffers.map((offer) => {
                  const isActive = offer.status === 'active';
                  return (
                    <tr key={offer._id} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors group">
                      <td className="p-4 align-middle">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded bg-surface-hover flex items-center justify-center mr-3 border border-border`}>
                            {offer.discountType === 'Percentage' ? <Percent size={14} className="text-primary" /> : <Gift size={14} className="text-primary" />}
                          </div>
                          <div>
                            <p className="font-bold text-secondary text-sm group-hover:text-primary transition-colors">{offer.offerName}</p>
                            <p className="text-xs text-text-muted mt-0.5 truncate max-w-[200px]">{offer.description || 'No description provided.'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-secondary">
                            {offer.discountType === 'Percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                          </span>
                          <span className="text-[10px] font-bold text-text-muted uppercase bg-surface-hover px-1.5 py-0.5 rounded border border-border">
                            {offer.discountType}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center text-sm font-medium text-secondary">
                          <Calendar size={14} className="mr-2 text-primary/60" />
                          {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center">
                          {isActive ? (
                            <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                              <CheckCircle size={10} className="mr-1" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center text-[10px] font-bold text-danger bg-danger-bg border border-danger-border px-2 py-0.5 rounded-sm uppercase tracking-wider">
                              <XCircle size={10} className="mr-1" /> Inactive
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle text-center">
                        <div className="flex justify-center items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenEditModal(offer)} 
                            className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-sm transition-colors"
                            title="Edit Offer"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(offer._id)} 
                            className="p-1.5 text-text-muted hover:text-danger hover:bg-danger-bg rounded-sm transition-colors"
                            title="Delete Offer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                {editMode ? 'Edit Promotional Offer' : 'Create New Offer'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-danger transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="p-6">
              <div className="grid grid-cols-2 gap-5 mb-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Offer Name <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    required 
                    value={offerName} 
                    onChange={e => setOfferName(e.target.value)} 
                    placeholder="e.g. Summer Weekend Special" 
                    className="w-full bg-background border border-border focus:border-primary rounded-sm px-3 py-2 text-sm transition-colors outline-none text-secondary font-semibold" 
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Offer Status</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)} 
                    className="w-full bg-background border border-border focus:border-primary rounded-sm px-3 py-2 text-sm transition-colors outline-none text-secondary font-semibold appearance-none"
                  >
                    <option value="active">Active - Ready to use</option>
                    <option value="inactive">Inactive - Temporarily disabled</option>
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Description</label>
                  <textarea 
                    rows="2" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    className="w-full bg-background border border-border focus:border-primary rounded-sm px-3 py-2 text-sm transition-colors outline-none text-secondary font-semibold custom-scrollbar"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Discount Type</label>
                  <select 
                    value={discountType} 
                    onChange={e => setDiscountType(e.target.value)} 
                    className="w-full bg-background border border-border focus:border-primary rounded-sm px-3 py-2 text-sm transition-colors outline-none text-secondary font-semibold appearance-none"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Flat">Flat Amount (₹)</option>
                    <option value="BOGO">Buy One Get One</option>
                    <option value="Combo">Combo Meal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Discount Value <span className="text-danger">*</span></label>
                  <input 
                    type="number" 
                    required 
                    value={discountValue} 
                    onChange={e => setDiscountValue(e.target.value)} 
                    className="w-full bg-background border border-border focus:border-primary rounded-sm px-3 py-2 text-sm transition-colors outline-none text-secondary font-semibold" 
                    placeholder="e.g. 10" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Start Date <span className="text-danger">*</span></label>
                  <input 
                    type="date" 
                    required 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)} 
                    className="w-full bg-background border border-border focus:border-primary rounded-sm px-3 py-2 text-sm transition-colors outline-none text-secondary font-semibold" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">End Date <span className="text-danger">*</span></label>
                  <input 
                    type="date" 
                    required 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)} 
                    className="w-full bg-background border border-border focus:border-primary rounded-sm px-3 py-2 text-sm transition-colors outline-none text-secondary font-semibold" 
                  />
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
                  {processing ? 'Saving...' : (editMode ? 'Update Offer' : 'Save Offer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offers;
