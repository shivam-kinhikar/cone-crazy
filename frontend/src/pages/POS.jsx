import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, User, CheckCircle } from 'lucide-react';
import api from '../utils/axios';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, custRes] = await Promise.all([
          api.get('/products'),
          api.get('/customers')
        ]);
        // Filter only available products
        setProducts(prodRes.data.data.filter(p => p.status === 'Available'));
        setCustomers(custRes.data.data);
      } catch (error) {
        console.error("Failed to load POS data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product._id === product._id);
      if (existing) {
        return prev.map(item => 
          item.product._id === product._id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, { product, price: product.price, quantity: 1, subtotal: product.price }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product._id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity, subtotal: newQuantity * item.price };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      const orderData = {
        items: cart.map(item => ({ product: item.product._id, quantity: item.quantity, price: item.price })),
        totalAmount,
        paymentMethod,
        ...(selectedCustomer && { customer: selectedCustomer })
      };
      await api.post('/orders', orderData);
      setSuccessMsg('Order completed successfully!');
      setCart([]);
      setSelectedCustomer('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error("Checkout failed", error);
      alert(error.response?.data?.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center text-slate-400">Loading POS...</div>;

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Left Side: Products Grid */}
      <div className="flex-1 flex flex-col saas-card rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-secondary">Products</h2>
        </div>
        <div className="p-6 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(product => (
            <div 
              key={product._id} 
              onClick={() => addToCart(product)}
              className="bg-slate-50 rounded-xl p-4 border border-slate-100 cursor-pointer hover:border-primary hover:shadow-md transition-all flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-slate-200 rounded-full mb-3 overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">No Img</div>
                )}
              </div>
              <h3 className="font-semibold text-sm text-secondary mb-1">{product.name}</h3>
              <p className="text-primary font-bold">${product.price.toFixed(2)}</p>
            </div>
          ))}
          {products.length === 0 && <p className="text-slate-500 col-span-full">No products available.</p>}
        </div>
      </div>

      {/* Right Side: Cart & Checkout */}
      <div className="w-96 flex flex-col saas-card rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-secondary flex items-center">
            <ShoppingCart className="mr-2" size={24} /> Current Order
          </h2>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
            {cart.length} items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <ShoppingCart size={48} className="opacity-20" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product._id} className="saas-card p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-secondary truncate">{item.product.name}</h4>
                  <p className="text-xs text-primary font-medium">${item.price.toFixed(2)} x {item.quantity}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => updateQuantity(item.product._id, -1)} className="p-1 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200">
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product._id, 1)} className="p-1 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200">
                    <Plus size={14} />
                  </button>
                  <button onClick={() => removeFromCart(item.product._id)} className="p-1 ml-2 text-rose-400 hover:text-rose-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-slate-100 saas-card space-y-4">
          {successMsg && (
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-sm flex items-center font-medium">
              <CheckCircle size={16} className="mr-2" /> {successMsg}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <User size={16} className="text-slate-400" />
              <select 
                className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-primary"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">Walk-in Customer</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.mobile})</option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-between items-center text-sm font-medium text-slate-500 pt-2 border-t border-slate-100">
              <span>Payment Method</span>
              <select 
                className="bg-transparent font-bold text-secondary outline-none text-right cursor-pointer"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option>Cash</option>
                <option>Card</option>
                <option>UPI</option>
              </select>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-bold text-secondary">Total</span>
              <span className="text-2xl font-extrabold text-primary">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || processing}
            className="w-full py-3 bg-primary hover:bg-primary-hover disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center"
          >
            {processing ? 'Processing...' : 'Complete Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
