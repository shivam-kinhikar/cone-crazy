import { useState, useEffect, useRef } from 'react';
import { Plus, Image as ImageIcon, Edit, Trash2, Search, X, Upload, Tag, Package, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import api from '../utils/axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Form State
  const [productId, setProductId] = useState(null); // null if creating
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      const prodData = Array.isArray(prodRes.data.data) ? prodRes.data.data : (prodRes.data.data?.data || []);
      const catData = Array.isArray(catRes.data.data) ? catRes.data.data : (catRes.data.data?.data || []);
      setProducts(prodData);
      setCategories(catData);
      if (catData.length > 0) {
        setCategory(catData[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (prod = null) => {
    if (prod) {
      setProductId(prod._id);
      setName(prod.name);
      setDescription(prod.description || '');
      setPrice(prod.price);
      setStock(prod.stock || 0);
      setCategory(prod.categoryId?._id || prod.categoryId || (categories.length > 0 ? categories[0]._id : ''));
      setImagePreview(prod.imageUrl || '');
      setImage(null);
    } else {
      setProductId(null);
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      if (categories.length > 0) setCategory(categories[0]._id);
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
      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        const uploadRes = await api.post('/upload/product-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedImageUrl = uploadRes.data.imageUrl;
        uploadedPublicId = uploadRes.data.publicId;
      }

      const payload = {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        categoryId: category,
      };

      if (uploadedImageUrl) {
        payload.imageUrl = uploadedImageUrl;
        payload.cloudinaryPublicId = uploadedPublicId;
      }

      if (productId) {
        await api.put(`/products/${productId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save ice cream');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to remove this ice cream?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove ice cream');
    }
  };

  const filteredProducts = (products || []).filter(product => 
    (product.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex h-full items-center justify-center text-text-muted">Loading ice creams...</div>;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary flex items-center">
          <div className="w-1.5 h-7 bg-primary mr-3 shadow-sm"></div>
          Ice-Cream Menu
        </h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-sm flex items-center text-sm font-bold transition-colors shadow-sm"
        >
          <Plus size={18} className="mr-2" /> Add Ice Cream
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-surface border border-border shadow-sm rounded-sm">
        {/* Search Bar */}
        <div className="p-4 border-b border-border bg-surface-hover/30 flex justify-between items-center">
          <div className="relative w-80">
            <input 
              type="text" 
              placeholder="Search ice creams..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-background text-text border border-border rounded-sm focus:border-primary outline-none transition-colors text-sm font-medium"
            />
            <Search size={16} className="absolute left-3.5 top-2.5 text-text-muted" />
          </div>
          <div className="text-sm font-bold text-secondary">
            Total Products: <span className="text-primary">{filteredProducts.length}</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-xs uppercase tracking-wider text-text-muted">
                <th className="p-4 font-bold w-[35%]">Product Details</th>
                <th className="p-4 font-bold w-[15%]">Price</th>
                <th className="p-4 font-bold w-[15%]">Stock</th>
                <th className="p-4 font-bold w-[20%]">Status</th>
                <th className="p-4 font-bold text-center w-[15%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center">
                      <ImageIcon size={32} className="opacity-20 mb-3" />
                      <p className="font-medium text-sm">No ice creams found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isAvailable = p.status === 'active' && p.stock > 0;
                  const isLowStock = isAvailable && p.stock <= 5;

                  return (
                    <tr key={p._id} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors group">
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded border shrink-0 flex items-center justify-center overflow-hidden ${isAvailable ? 'bg-surface-hover border-border' : 'bg-background border-border/50 grayscale opacity-60'}`}>
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={16} className="text-text-muted" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-secondary text-sm group-hover:text-primary transition-colors">{p.name}</h3>
                            <p className="text-xs text-text-muted mt-0.5">{p.categoryId?.name || 'Uncategorized'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="font-black text-secondary">
                          ₹{p.price.toFixed(2)}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center text-sm font-medium text-secondary">
                          <Package size={14} className={`mr-2 ${isLowStock ? 'text-warning' : 'text-text-muted'}`} />
                          <span className={isLowStock ? 'text-warning font-black' : ''}>{p.stock}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center">
                          {isLowStock ? (
                            <span className="flex items-center text-[10px] font-bold text-warning bg-warning/10 border border-warning/20 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                              <AlertCircle size={10} className="mr-1" /> Low Stock
                            </span>
                          ) : isAvailable ? (
                            <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                              <CheckCircle size={10} className="mr-1" /> In Stock
                            </span>
                          ) : (
                            <span className="flex items-center text-[10px] font-bold text-danger bg-danger-bg border border-danger-border px-2 py-0.5 rounded-sm uppercase tracking-wider">
                              <XCircle size={10} className="mr-1" /> Out of Stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle text-center">
                        <div className="flex justify-center items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenModal(p)} 
                            className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-sm transition-colors"
                            title="Edit Product"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(p._id)} 
                            className="p-1.5 text-text-muted hover:text-danger hover:bg-danger-bg rounded-sm transition-colors"
                            title="Remove Product"
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
          <div className="bg-surface shadow-2xl w-full max-w-3xl border border-border rounded-sm overflow-hidden animate-fade-in-up flex flex-col md:flex-row">
            
            {/* Left side: Image Upload (1/3 width) */}
            <div className="w-full md:w-1/3 bg-surface-hover/30 p-6 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-border relative">
              <button 
                onClick={() => setShowModal(false)} 
                className="absolute top-4 left-4 text-text-muted hover:text-danger md:hidden transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="mb-4 text-center">
                <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Product Image</h3>
                <p className="text-xs text-text-muted mt-1">Upload a high-quality photo</p>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square rounded-sm border border-dashed border-border bg-background flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden group shadow-inner"
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload size={20} className="text-primary mb-2 shadow-sm" />
                      <span className="text-xs font-bold text-secondary bg-surface/80 px-2 py-1 rounded border border-border">Change</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4">
                    <div className="w-10 h-10 rounded bg-surface-hover border border-border flex items-center justify-center mb-3">
                      <ImageIcon size={18} className="text-text-muted" />
                    </div>
                    <span className="text-xs font-bold text-primary mb-1">Click to Browse</span>
                    <span className="text-[10px] font-medium text-text-muted">JPG, PNG, WEBP</span>
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

            {/* Right side: Form Details (2/3 width) */}
            <div className="w-full md:w-2/3 flex flex-col">
              <div className="p-5 border-b border-border flex justify-between items-center bg-surface-hover/30 hidden md:flex">
                <h3 className="text-lg font-bold text-secondary uppercase tracking-wide">
                  {productId ? 'Update Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-danger transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="p-6 flex-grow flex flex-col">
                <div className="grid grid-cols-2 gap-5 mb-6">
                  
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Product Name <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      required 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      className="w-full bg-background border border-border focus:border-primary rounded-sm px-3 py-2 text-sm transition-colors outline-none text-secondary font-semibold" 
                      placeholder="e.g. Vanilla Bean Cone" 
                    />
                  </div>
                  
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Category <span className="text-danger">*</span></label>
                    <select 
                      required 
                      value={category} 
                      onChange={e => setCategory(e.target.value)} 
                      className="w-full bg-background border border-border focus:border-primary rounded-sm px-3 py-2 text-sm transition-colors outline-none text-secondary font-semibold appearance-none"
                    >
                      {(categories || []).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider flex items-center">
                      Selling Price (₹) <span className="text-danger ml-1">*</span>
                    </label>
                    <input 
                      type="number" 
                      step="0.01" 
                      required 
                      value={price} 
                      onChange={e => setPrice(e.target.value)} 
                      className="w-full bg-background border border-border focus:border-primary rounded-sm px-3 py-2 text-sm transition-colors outline-none text-secondary font-semibold" 
                      placeholder="0.00" 
                    />
                  </div>
                  
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Initial Stock <span className="text-danger">*</span></label>
                    <input 
                      type="number" 
                      required 
                      value={stock} 
                      onChange={e => setStock(e.target.value)} 
                      className="w-full bg-background border border-border focus:border-primary rounded-sm px-3 py-2 text-sm transition-colors outline-none text-secondary font-semibold" 
                      placeholder="0" 
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Description</label>
                    <textarea 
                      rows="2" 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      className="w-full bg-background border border-border focus:border-primary rounded-sm px-3 py-2 text-sm transition-colors outline-none text-secondary font-semibold custom-scrollbar placeholder:font-normal" 
                      placeholder="Optional details..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="mt-auto pt-5 border-t border-border flex justify-end space-x-3">
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
                    {processing ? 'Saving...' : (productId ? 'Update Product' : 'Save Product')}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
