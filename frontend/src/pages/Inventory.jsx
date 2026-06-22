import { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Box, Search, Edit, Trash2, Upload, X, Tag } from 'lucide-react';
import api from '../utils/axios';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Form State
  const [itemId, setItemId] = useState(null);
  const [itemName, setItemName] = useState('');
  const [unit, setUnit] = useState('kg');
  const [quantity, setQuantity] = useState('');
  const [minThreshold, setMinThreshold] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/inventory');
      setItems(res.data.data);
    } catch (error) {
      console.error("Failed to fetch inventory", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setItemId(item._id);
      setItemName(item.itemName);
      setUnit(item.unit);
      setQuantity(item.quantity);
      setMinThreshold(item.minimumQuantity);
      setSellingPrice(item.sellingPrice || '');
      setImagePreview(item.imageUrl || '');
      setImage(null);
    } else {
      setItemId(null);
      setItemName('');
      setUnit('kg');
      setQuantity('');
      setMinThreshold('');
      setSellingPrice('');
      setImagePreview('');
      setImage(null);
    }
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    let uploadedImageUrl = '';
    let uploadedPublicId = '';

    try {
      // 1. Upload Image to Cloudinary via backend if a new file is selected
      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        const uploadRes = await api.post('/upload/product-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedImageUrl = uploadRes.data.imageUrl;
        uploadedPublicId = uploadRes.data.publicId;
      }

      // 2. Prepare JSON Payload
      const payload = { 
        itemName, 
        unit, 
        quantity: Number(quantity), 
        minimumQuantity: Number(minThreshold),
        sellingPrice: Number(sellingPrice) || 0
      };

      if (uploadedImageUrl) {
        payload.imageUrl = uploadedImageUrl;
        payload.cloudinaryPublicId = uploadedPublicId;
      }

      // 3. Save to database
      if (itemId) {
        await api.put(`/inventory/${itemId}`, payload);
      } else {
        await api.post('/inventory', payload);
      }
      setShowModal(false);
      fetchInventory();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save item');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this material?")) return;
    try {
      await api.delete(`/inventory/${id}`);
      fetchInventory();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleStockUpdate = async (id, type) => {
    const amount = prompt(`Enter quantity to ${type}:`);
    if (!amount || isNaN(amount)) return;
    try {
      const endpoint = type === 'add' ? `/inventory/stock-in/${id}` : `/inventory/stock-out/${id}`;
      await api.patch(endpoint, { amount: Number(amount) });
      fetchInventory();
    } catch (error) {
      alert(error.response?.data?.message || 'Stock update failed');
    }
  };

  const filteredItems = (items || []).filter(item => 
    (item.itemName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex h-full items-center justify-center text-text-muted">Loading inventory...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary flex items-center">
          <div className="w-1.5 h-7 bg-gradient-to-b from-primary to-primary-hover mr-3 rounded-full shadow-lg shadow-primary/20"></div>
          Inventory Management
        </h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl flex items-center text-sm font-bold transition-all duration-300 shadow-lg shadow-primary/30 hover:-translate-y-0.5"
        >
          <Plus size={18} className="mr-2" /> Add Material
        </button>
      </div>

      <div className="saas-card overflow-hidden bg-surface/50 backdrop-blur-sm border-0 shadow-[0_4px_24px_-4px_rgba(6,81,237,0.05)]">
        <div className="p-5 border-b border-border/50 flex justify-between items-center bg-surface/80">
          <div className="relative w-80">
            <input 
              type="text" 
              placeholder="Search raw materials..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full bg-background/50 text-text border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium shadow-sm"
            />
            <Search size={16} className="absolute left-3.5 top-3 text-text-muted" />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-bold text-secondary px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10">
              <span className="text-primary">{filteredItems.length}</span> Total Items
            </span>
          </div>
        </div>

        <div className="p-4 space-y-3 bg-background/30 min-h-[400px]">
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-text-muted">
              <Box size={48} className="opacity-20 mb-4" />
              <p className="font-medium">No inventory items found.</p>
            </div>
          )}
          {filteredItems.map((item) => {
            const isLowStock = item.quantity <= item.minimumQuantity;
            const stockPercentage = Math.min((item.quantity / (item.minimumQuantity * 3)) * 100, 100);
            
            return (
              <div 
                key={item._id} 
                className={`group flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-surface rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${isLowStock ? 'border-danger/30 hover:border-danger/50 bg-gradient-to-r from-danger-bg/20 to-transparent' : 'border-border hover:border-primary/30'}`}
              >
                {/* Left: Image & Name */}
                <div className="flex items-center space-x-4 w-full md:w-1/3 mb-4 md:mb-0">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden border shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-sm ${isLowStock ? 'border-danger/20 bg-danger-bg text-danger' : 'border-primary/10 bg-gradient-to-br from-primary/5 to-primary/10 text-primary'}`}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.itemName} className="w-full h-full object-cover" />
                    ) : (
                      <Box size={22} className={isLowStock ? "text-danger" : "text-primary"} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-secondary text-base group-hover:text-primary transition-colors">{item.itemName}</h3>
                    {item.sellingPrice > 0 ? (
                      <p className="text-xs text-text-muted mt-1 font-semibold flex items-center">
                        <Tag size={12} className="mr-1.5 opacity-60 text-primary" /> ₹{item.sellingPrice.toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-xs text-text-muted mt-1 font-medium">Internal Supply</p>
                    )}
                  </div>
                </div>
                
                {/* Middle: Stock Level with Progress Bar */}
                <div className="w-full md:w-1/4 mb-4 md:mb-0 px-2">
                  <div className="flex justify-between items-end mb-1.5">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Current Stock</p>
                    <p className="text-[10px] font-bold text-text-muted">Min: {item.minimumQuantity}</p>
                  </div>
                  <div className="flex items-baseline space-x-1.5 mb-2">
                    <span className={`text-2xl font-black tracking-tight ${isLowStock ? 'text-danger' : 'text-secondary'}`}>{item.quantity}</span>
                    <span className="text-text-muted font-bold text-xs uppercase">{item.unit}</span>
                  </div>
                  <div className="w-full h-1.5 bg-background border border-border/50 rounded-full overflow-hidden">
                     <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${isLowStock ? 'bg-danger' : 'bg-gradient-to-r from-primary to-primary-hover'}`} 
                        style={{ width: `${stockPercentage}%` }}
                     ></div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="w-full md:w-1/6 mb-4 md:mb-0 flex md:justify-center">
                  {isLowStock ? (
                    <span className="px-3 py-1.5 bg-danger-bg/80 border border-danger/30 text-danger text-[11px] font-black rounded-lg uppercase tracking-wider flex items-center shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-danger mr-2 animate-pulse"></span>
                      Low Stock
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 bg-success-bg/60 border border-success/20 text-success text-[11px] font-black rounded-lg uppercase tracking-wider flex items-center shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-success mr-2"></span>
                      In Stock
                    </span>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-4 w-full md:w-1/4 justify-end">
                  <div className="flex space-x-2 md:opacity-0 group-hover:opacity-100 transition-all duration-300 md:translate-x-4 group-hover:translate-x-0">
                    <button onClick={() => handleStockUpdate(item._id, 'add')} className="p-2.5 bg-success-bg/80 text-success hover:bg-success hover:text-white rounded-xl text-sm font-bold flex items-center transition-all border border-success/20 shadow-sm hover:shadow-success/20 hover:-translate-y-0.5" title="Add Stock">
                      <Plus size={16} />
                    </button>
                    <button onClick={() => handleStockUpdate(item._id, 'consume')} className="p-2.5 bg-danger-bg/80 text-danger hover:bg-danger hover:text-white rounded-xl text-sm font-bold flex items-center transition-all border border-danger/20 shadow-sm hover:shadow-danger/20 hover:-translate-y-0.5" title="Consume Stock">
                      <Minus size={16} />
                    </button>
                  </div>
                  
                  <div className="hidden md:block w-px h-10 bg-border mx-1"></div>
                  
                  <div className="flex space-x-1">
                    <button onClick={() => handleOpenModal(item)} className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-colors" title="Edit Item">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-2 text-text-muted hover:text-danger hover:bg-danger-bg rounded-xl transition-colors" title="Delete Item">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-secondary/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="saas-card rounded-[24px] shadow-2xl shadow-primary/10 w-full max-w-md overflow-hidden animate-fade-in-up border-0 ring-1 ring-white/10">
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-surface/80">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Box size={16} className="text-primary" />
                </div>
                <h3 className="text-xl font-extrabold text-secondary tracking-tight">{itemId ? 'Edit Material' : 'New Material'}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-danger hover:bg-danger-bg transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5 bg-surface">
              
              {/* Image Upload Area */}
              <div className="mb-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-40 rounded-[16px] border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 relative overflow-hidden group shadow-inner"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-secondary/60 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Upload size={24} className="text-white mb-2 transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="text-xs font-bold text-white">Change Image</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center transform group-hover:-translate-y-1 transition-transform duration-300">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <Upload size={20} className="text-primary" />
                      </div>
                      <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Click to Upload Image</span>
                      <span className="text-[10px] font-medium text-text-muted">Supports JPG, PNG, WEBP</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Item Name</label>
                <input type="text" required value={itemName} onChange={e => setItemName(e.target.value)} className="w-full bg-background/50 border border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all shadow-sm outline-none text-secondary font-semibold" placeholder="e.g. Premium Cocoa Powder" />
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Unit of Measure</label>
                  <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full bg-background/50 border border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all shadow-sm outline-none text-secondary font-semibold appearance-none">
                    <option value="kg">Kilograms (kg)</option>
                    <option value="liters">Liters (L)</option>
                    <option value="units">Units (pcs)</option>
                    <option value="boxes">Boxes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">{itemId ? 'Current Quantity' : 'Initial Quantity'}</label>
                  <input type="number" required value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full bg-background/50 border border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all shadow-sm outline-none text-secondary font-semibold" placeholder="0" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-5 pt-2 border-t border-border/50">
                <div>
                  <label className="block text-[11px] font-bold text-text-muted mb-1.5 uppercase tracking-wider flex items-center">
                    <Tag size={12} className="mr-1" /> Selling Price (₹)
                  </label>
                  <input type="number" min="0" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} className="w-full bg-background/50 border border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm transition-all shadow-sm outline-none text-secondary font-semibold" placeholder="0 (Optional)" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Low Stock Alert At</label>
                  <input type="number" min="0" required value={minThreshold} onChange={e => setMinThreshold(e.target.value)} className="w-full bg-danger-bg/20 border border-danger/20 hover:border-danger/50 focus:border-danger focus:ring-2 focus:ring-danger/20 rounded-xl px-4 py-3 text-sm transition-all shadow-sm outline-none text-danger font-bold placeholder:text-danger/40" placeholder="e.g. 5" />
                </div>
              </div>
              
              <div className="pt-6 mt-2 flex space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 px-4 bg-background hover:bg-danger-bg hover:text-danger border border-border hover:border-danger/30 text-text-muted font-bold rounded-xl transition-all text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={processing} className="flex-[2] py-3 px-4 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 text-sm">
                  {processing ? 'Saving...' : 'Save Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
