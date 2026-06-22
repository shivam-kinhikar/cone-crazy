import { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, User, CreditCard, Banknote, Wallet, Receipt, IceCream, Tag, X } from 'lucide-react';
import api from '../utils/axios';

const Billing = () => {
  // Data States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [settings, setSettings] = useState({ taxPercentage: 0 });
  const [loading, setLoading] = useState(true);

  // POS States
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [processing, setProcessing] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  // New Customer State
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', mobile: '' });
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  useEffect(() => {
    fetchPOSData();
  }, []);

  const fetchPOSData = async () => {
    try {
      const [prodRes, invRes, catRes, custRes, offRes, setRes] = await Promise.all([
        api.get('/products'),
        api.get('/inventory'),
        api.get('/categories'),
        api.get('/customers'),
        api.get('/offers').catch(() => ({ data: { data: [] } })),
        api.get('/settings').catch(() => ({ data: { data: { taxPercentage: 0 } } }))
      ]);
      
      const prodData = Array.isArray(prodRes.data.data) ? prodRes.data.data : (prodRes.data.data.data || []);
      const invData = Array.isArray(invRes.data.data) ? invRes.data.data : (invRes.data.data.data || []);
      
      const activeProducts = prodData.filter(p => p.status === 'active');
      const activeInventory = invData.filter(i => i.status === 'active').map(inv => ({
         _id: inv._id,
         name: inv.itemName || 'Unnamed Item',
         price: Number(inv.sellingPrice) || 0,
         categoryId: { _id: 'inventory', name: 'Inventory Items' },
         stock: Number(inv.quantity) || 0,
         imageUrl: inv.imageUrl
      }));

      setProducts([...activeProducts, ...activeInventory]);
      setCategories([...catRes.data.data, { _id: 'inventory', name: 'Inventory Items', status: 'active' }]);
      
      const custData = Array.isArray(custRes.data.data) ? custRes.data.data : (custRes.data.data?.data || []);
      setCustomers(custData);
      
      const offData = Array.isArray(offRes.data.data) ? offRes.data.data : (offRes.data.data?.data || []);
      setOffers(offData.filter(o => o.status === 'active'));
      
      setSettings(setRes.data.data || { taxPercentage: 0 });
    } catch (error) {
      console.error("Failed to load POS data", error);
      alert("Error loading POS data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Customer Functions
  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.mobile) return alert("Please fill name and mobile");
    setCreatingCustomer(true);
    try {
      const res = await api.post('/customers', newCustomer);
      const createdCustomer = res.data.data;
      setCustomers(prev => [...prev, createdCustomer]);
      setSelectedCustomerId(createdCustomer._id);
      setIsAddingCustomer(false);
      setNewCustomer({ name: '', mobile: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create customer');
    } finally {
      setCreatingCustomer(false);
    }
  };

  // Cart Functions
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product._id);
      if (existing) {
        return prev.map(item => item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { 
        productId: product._id, 
        productName: product.name, 
        unitPrice: product.price, 
        quantity: 1,
        imageUrl: product.imageUrl
      }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  
  let computedDiscount = Number(discountAmount || 0);
  if (selectedOfferId) {
    const offer = offers.find(o => o._id === selectedOfferId);
    if (offer) {
      if (offer.discountType === 'Flat') {
        computedDiscount = offer.discountValue;
      } else if (offer.discountType === 'Percentage') {
        computedDiscount = subtotal * (offer.discountValue / 100);
      }
    }
  }
  
  const taxAmount = ((subtotal - computedDiscount) * (settings.taxPercentage / 100));
  const grandTotal = subtotal - computedDiscount + taxAmount;

  // Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Cart is empty!');
    setProcessing(true);

    try {
      const payload = {
        items: cart,
        paymentMethod,
        discountAmount: computedDiscount,
        taxAmount: taxAmount
      };
      if (selectedCustomerId) payload.customerId = selectedCustomerId;
      if (selectedOfferId) payload.offerId = selectedOfferId;

      const res = await api.post('/orders', payload);
      
      alert(`Order Completed! Invoice generated: ${res.data.data.invoiceId}`);
      setCart([]);
      setDiscountAmount(0);
      setSelectedCustomerId('');
      setSelectedOfferId('');
      setPaymentMethod('Cash');
      setShowCartDrawer(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  // Filtering
  const filteredProducts = (products || []).filter(p => {
    const pCatId = p?.categoryId?._id || p?.category?._id || p?.categoryId || '';
    const matchCategory = activeCategory === 'All' || pCatId === activeCategory;
    const matchSearch = (p?.name || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) return <div className="flex h-full items-center justify-center text-text-muted">Loading POS System...</div>;

  return (
    <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 overflow-hidden relative">
      
      {/* Mobile Cart Floating Action Button */}
      <button 
        onClick={() => setShowCartDrawer(true)}
        className="lg:hidden fixed bottom-6 right-6 z-30 bg-primary text-white p-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] shadow-primary/40 flex items-center justify-center hover:scale-105 transition-transform"
      >
        <ShoppingCart size={24} />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-danger text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-background">
            {cart.reduce((s, i) => s + i.quantity, 0)}
          </span>
        )}
      </button>

      {/* Left Pane: Products */}
      <div className="flex-1 flex flex-col h-full space-y-4 min-w-0">
        {/* Search & Categories */}
        <div className="bg-surface border border-border shrink-0">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Search products by name or SKU..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-md pl-10 pr-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-text text-sm font-medium"
              />
            </div>
          </div>
          
          <div className="flex overflow-x-auto custom-scrollbar bg-surface-hover/20">
            <button 
              onClick={() => setActiveCategory('All')}
              className={`px-6 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeCategory === 'All' 
                  ? 'border-primary text-primary bg-primary/5' 
                  : 'border-transparent text-text-muted hover:text-secondary hover:bg-surface-hover'
              }`}
            >
              All Items
            </button>
            {(categories || []).map(c => (
              <button 
                key={c._id}
                onClick={() => setActiveCategory(c._id)}
                className={`px-6 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeCategory === c._id 
                    ? 'border-primary text-primary bg-primary/5' 
                    : 'border-transparent text-text-muted hover:text-secondary hover:bg-surface-hover'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20 lg:pb-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map(p => (
              <div 
                key={p._id} 
                onClick={() => addToCart(p)}
                className="group bg-surface border border-border rounded-md overflow-hidden cursor-pointer transition-colors hover:border-primary/60 flex flex-col h-full shadow-sm"
              >
                {/* Image Container */}
                <div className="h-32 sm:h-36 bg-white dark:bg-white/5 border-b border-border flex items-center justify-center p-2 shrink-0 relative transition-colors">
                  {p.imageUrl ? (
                    <img 
                      src={p.imageUrl} 
                      alt={p.name} 
                      className="h-full w-full object-contain" 
                    />
                  ) : (
                    <IceCream size={32} className="text-text-muted/30" />
                  )}
                  
                  {/* Quick Add Button Icon (Visible on hover) */}
                  <div className="absolute top-2 right-2 w-7 h-7 bg-primary text-white shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-sm">
                    <Plus size={16} strokeWidth={2.5} />
                  </div>
                </div>
                
                {/* Product Details */}
                <div className="p-3 flex flex-col flex-1 justify-between bg-surface">
                  <p className="font-semibold text-secondary text-sm leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {p?.name || 'Unnamed Product'}
                  </p>
                  <div className="flex justify-between items-center mt-auto">
                    <p className="text-secondary font-bold">₹{Number(p?.price || 0).toFixed(2)}</p>
                    {p?.stock !== undefined && (
                      <span className="text-[10px] font-semibold text-text-muted">
                        Stock: {p.stock}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-10 text-center text-text-muted">No products found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Cart Overlay */}
      {showCartDrawer && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setShowCartDrawer(false)}
        />
      )}

      {/* Right Pane: Cart & Checkout (Drawer on Mobile) */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-surface shadow-2xl transform transition-transform duration-300 ease-in-out ${showCartDrawer ? 'translate-x-0' : 'translate-x-full'} lg:relative lg:translate-x-0 lg:w-[400px] shrink-0 lg:shadow-none flex flex-col h-full lg:border-l lg:border-border saas-card`}>
        
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-border flex justify-between items-center bg-background shrink-0">
          <h2 className="text-lg font-bold text-secondary flex items-center">
            <ShoppingCart size={20} className="mr-2 text-primary" /> Your Cart
          </h2>
          <button onClick={() => setShowCartDrawer(false)} className="p-2 text-text-muted hover:text-danger rounded-full hover:bg-surface-hover transition-colors">
             <X size={20} />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex p-5 border-b border-border bg-surface-hover/30 justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-secondary flex items-center">
            <ShoppingCart size={20} className="mr-2 text-primary" /> Current Order
          </h2>
          <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs font-bold">
            {cart.reduce((s, i) => s + i.quantity, 0)} Items
          </span>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text-muted space-y-3 opacity-60">
              <ShoppingCart size={48} />
              <p className="font-medium">Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="flex justify-between items-center p-3 border border-border rounded-xl hover:bg-surface-hover/50 transition-colors">
                <div className="flex-1 min-w-0 pr-3">
                  <p className="font-bold text-secondary text-sm truncate">{item.productName}</p>
                  <p className="text-primary font-bold text-sm mt-0.5">₹{(item.unitPrice * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(item.productId, -1)} className="p-1.5 text-text-muted hover:text-secondary hover:bg-surface-hover transition-colors"><Minus size={14}/></button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className="p-1.5 text-text-muted hover:text-secondary hover:bg-surface-hover transition-colors"><Plus size={14}/></button>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="text-danger/70 hover:text-danger p-1 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Section */}
        <div className="shrink-0 border-t border-border bg-surface-hover/30 p-4 lg:p-5 space-y-4">
          
          {/* Customer Selection */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-text-muted flex items-center">
                <User size={12} className="mr-1" /> Customer (Optional)
              </label>
              {!isAddingCustomer && (
                <button 
                  onClick={() => setIsAddingCustomer(true)}
                  className="bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded text-[10px] font-bold flex items-center uppercase tracking-wider transition-colors"
                >
                  <Plus size={12} className="mr-0.5" /> Add New
                </button>
              )}
            </div>
            
            {isAddingCustomer ? (
              <div className="bg-background border border-border rounded-lg p-3 space-y-2 animate-fade-in">
                <input 
                  type="text" 
                  placeholder="Customer Name" 
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="w-full bg-surface border border-border rounded px-3 py-1.5 text-sm font-medium focus:border-primary transition-colors outline-none"
                />
                <input 
                  type="tel" 
                  placeholder="Mobile Number" 
                  value={newCustomer.mobile}
                  onChange={e => setNewCustomer({...newCustomer, mobile: e.target.value})}
                  className="w-full bg-surface border border-border rounded px-3 py-1.5 text-sm font-medium focus:border-primary transition-colors outline-none"
                />
                <div className="flex gap-2 pt-1">
                  <button 
                    onClick={handleCreateCustomer}
                    disabled={creatingCustomer}
                    className="flex-1 bg-primary hover:bg-primary-hover transition-colors text-white text-xs font-bold py-1.5 rounded disabled:opacity-70"
                  >
                    {creatingCustomer ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={() => { setIsAddingCustomer(false); setNewCustomer({ name: '', mobile: '' }); }}
                    className="flex-1 bg-surface-hover text-text-muted hover:text-secondary hover:bg-border transition-colors text-xs font-bold py-1.5 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <select 
                value={selectedCustomerId} 
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="">Walk-in Customer</option>
                {(customers || []).map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.mobile})</option>
                ))}
              </select>
            )}
          </div>

          {/* Offer Selection */}
          <div>
            <label className="text-xs font-bold text-text-muted flex items-center mb-1.5">
              <Tag size={12} className="mr-1" /> Apply Offer (Optional)
            </label>
            <select 
              value={selectedOfferId} 
              onChange={e => {
                setSelectedOfferId(e.target.value);
                if (e.target.value) setDiscountAmount(0); // Clear manual discount if offer selected
              }}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="">No Offer</option>
              {(offers || []).map(o => (
                <option key={o._id} value={o._id}>
                  {o.offerName} ({o.discountType === 'Percentage' ? `${o.discountValue}% OFF` : `₹${o.discountValue} OFF`})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-bold text-text-muted mb-1.5 block">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setPaymentMethod('Cash')}
                className={`py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-colors border ${paymentMethod === 'Cash' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-text-muted'}`}
              >
                <Banknote size={14} className="mr-1.5" /> Cash
              </button>
              <button 
                onClick={() => setPaymentMethod('UPI')}
                className={`py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-colors border ${paymentMethod === 'UPI' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-text-muted'}`}
              >
                <Wallet size={14} className="mr-1.5" /> UPI
              </button>
              <button 
                onClick={() => setPaymentMethod('Card')}
                className={`py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-colors border ${paymentMethod === 'Card' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-text-muted'}`}
              >
                <CreditCard size={14} className="mr-1.5" /> Card
              </button>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted font-medium">Subtotal</span>
              <span className="font-bold text-secondary">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-text-muted font-medium">Discount (₹)</span>
              {selectedOfferId ? (
                <span className="font-bold text-success">-₹{computedDiscount.toFixed(2)}</span>
              ) : (
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={discountAmount}
                  onChange={e => setDiscountAmount(e.target.value)}
                  className="w-20 text-right border border-border rounded p-1 text-sm outline-none focus:border-primary"
                  disabled={selectedOfferId !== ''}
                />
              )}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted font-medium">Tax ({settings.taxPercentage}%)</span>
              <span className="font-bold text-secondary">₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-border flex justify-between items-end">
              <span className="font-bold text-secondary text-lg">Total</span>
              <span className="font-black text-primary text-2xl">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={processing || cart.length === 0}
            className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-bold text-lg flex justify-center items-center shadow-lg shadow-primary/20 transition-all disabled:opacity-70 disabled:shadow-none"
          >
            {processing ? 'Processing...' : 'Complete Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
