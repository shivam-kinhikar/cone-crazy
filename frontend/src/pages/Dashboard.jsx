import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Package, CreditCard, ShoppingBag, Truck } from 'lucide-react';
import api from '../utils/axios';

const StatCard = ({ title, value, trend, isPositive, icon: Icon, colorName }) => (
  <div className="bg-surface border border-border shadow-sm rounded-sm p-6 flex flex-col justify-between h-full hover:border-primary/50 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <p className="text-text-muted font-bold text-xs uppercase tracking-wider">{title}</p>
      <div className={`p-2 border border-${colorName}/20 rounded-sm text-${colorName} bg-${colorName}/5`}>
        <Icon size={18} />
      </div>
    </div>
    <div>
      <h3 className="text-2xl font-black text-secondary tracking-tight">{value}</h3>
      <div className="flex items-center mt-3 pt-3 border-t border-border/50">
        <span className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-sm border uppercase tracking-wider ${isPositive ? 'bg-success/5 text-success border-success/20' : 'bg-danger/5 text-danger border-danger/20'}`}>
          {isPositive ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
          {trend}
        </span>
        <span className="text-[10px] font-bold text-text-muted ml-2 uppercase tracking-wider">Vs Last Month</span>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState('All');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    deliveredOrders: 0,
    outstandingOrders: 0,
    chartData: [],
    lowStockItems: []
  });

  useEffect(() => {
    fetchDashboardStats();
  }, [yearFilter, monthFilter]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/stats', {
        params: { year: yearFilter, month: monthFilter }
      });
      setStats(res.data.data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  // We are skipping the real "Compared to Last Month" calculation for simplicity, defaulting to positive trends for UI demonstration.
  // In a full implementation, the backend would return `lastMonthRevenue` and `currentMonthRevenue` to compute exact percentages.

  const currentY = new Date().getFullYear();
  const years = ['All'];
  for (let y = currentY; y >= 2000; y--) years.push(y);
  const months = [
    { value: 'All', label: 'All Months' }, { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' },
    { value: 3, label: 'Mar' }, { value: 4, label: 'Apr' }, { value: 5, label: 'May' },
    { value: 6, label: 'Jun' }, { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' },
    { value: 9, label: 'Sep' }, { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
  ];

  if (loading && stats.totalOrders === 0) return <div className="flex h-full items-center justify-center text-text-muted">Loading Analytics...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary flex items-center">
          <div className="w-1.5 h-7 bg-primary mr-3 shadow-sm"></div>
          Dashboard
        </h1>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          trend="100%" 
          isPositive={true} 
          icon={ShoppingBag}
          colorName="primary"
        />
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue.toFixed(2)}`} 
          trend="100%" 
          isPositive={true} 
          icon={CreditCard}
          colorName="success"
        />
        <StatCard 
          title="Delivered Orders" 
          value={stats.deliveredOrders} 
          trend="100%" 
          isPositive={true} 
          icon={Truck}
          colorName="warning"
        />
        <StatCard 
          title="Outstanding Orders" 
          value={stats.outstandingOrders} 
          trend="100%" 
          isPositive={stats.outstandingOrders === 0} 
          icon={Package}
          colorName="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="bg-surface border border-border shadow-sm rounded-sm p-6 lg:col-span-2 flex flex-col relative">
          {loading && (
            <div className="absolute inset-0 bg-surface/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-sm">
              <span className="text-primary font-bold text-sm uppercase tracking-wider">Updating Chart...</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-sm font-bold text-secondary uppercase tracking-wider">Total Sales</h2>
              <h3 className="text-2xl font-black text-secondary tracking-tight mt-1">₹{stats.totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <select 
                className="bg-background border border-border text-secondary rounded-sm px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-primary transition-colors w-full sm:w-auto"
                value={yearFilter}
                onChange={(e) => {
                  setYearFilter(e.target.value);
                  if (e.target.value === 'All') setMonthFilter('All');
                }}
              >
                {years.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>)}
              </select>
              
              <select 
                className={`bg-background border border-border text-secondary rounded-sm px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-primary transition-colors w-full sm:w-auto ${yearFilter === 'All' ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                disabled={yearFilter === 'All'}
              >
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '4px', color: '#111827', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#6366f1' }}
                  formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Sales']}
                />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Warning Panel */}
        <div className="bg-surface border border-border shadow-sm rounded-sm flex flex-col">
          <div className="p-6 border-b border-border/50">
            <h2 className="text-sm font-bold text-secondary flex items-center uppercase tracking-wider">
              <Package size={16} className="mr-2 text-warning" />
              Low Stock Warnings
            </h2>
            <p className="text-text-muted text-xs mt-1 font-medium">
              <span className="font-bold text-secondary">
                {stats.lowStockItems?.length || 0} materials, {stats.lowStockProducts?.length || 0} products
              </span> need restocking
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {(!stats.lowStockItems || stats.lowStockItems.length === 0) && (!stats.lowStockProducts || stats.lowStockProducts.length === 0) ? (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-text-muted space-y-3 opacity-60">
                <Package size={32} />
                <p className="font-bold text-xs uppercase tracking-wider">Inventory looks good!</p>
              </div>
            ) : (
              <>
                {stats.lowStockProducts?.map((product, idx) => (
                  <div key={`prod-${product._id}`} className={`flex justify-between items-center p-4 hover:bg-surface-hover/30 transition-colors border-b border-border/50`}>
                    <div className="flex-1 min-w-0 pr-3 flex items-center">
                      <div className="w-10 h-10 rounded-sm border border-border bg-background flex items-center justify-center text-text-muted mr-3 shrink-0 overflow-hidden">
                        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover grayscale opacity-80" /> : <Package size={16} />}
                      </div>
                      <div>
                        <p className="font-bold text-secondary text-sm truncate">{product.name}</p>
                        <p className="text-warning text-[10px] uppercase tracking-wider font-bold mt-0.5">Ice Cream (Product)</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-warning text-base">{product.stock}</p>
                      <p className="text-text-muted text-[10px] uppercase tracking-wider font-bold">Left</p>
                    </div>
                  </div>
                ))}
                
                {stats.lowStockItems?.map((item, idx) => (
                  <div key={`mat-${item._id}`} className={`flex justify-between items-center p-4 hover:bg-surface-hover/30 transition-colors ${idx !== stats.lowStockItems.length - 1 ? 'border-b border-border/50' : ''}`}>
                    <div className="flex-1 min-w-0 pr-3 flex items-center">
                      <div className="w-10 h-10 rounded-sm border border-border bg-background flex items-center justify-center text-text-muted mr-3 shrink-0 overflow-hidden">
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.itemName} className="w-full h-full object-cover grayscale opacity-80" /> : <Package size={16} />}
                      </div>
                      <div>
                        <p className="font-bold text-secondary text-sm truncate">{item.itemName}</p>
                        <p className="text-text-muted text-[10px] uppercase tracking-wider font-bold mt-0.5">Threshold: {item.minimumQuantity} {item.unit}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-danger text-base">{item.quantity}</p>
                      <p className="text-text-muted text-[10px] uppercase tracking-wider font-bold">{item.unit}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
