import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../utils/axios';
import { Calendar, AlertTriangle, TrendingUp, Package, FileText, Download, IndianRupee } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const [salesReport, setSalesReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default to last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [salesRes, invRes] = await Promise.all([
        api.get(`/reports/sales?startDate=${startDate}&endDate=${endDate}`),
        api.get('/reports/inventory')
      ]);
      setSalesReport(salesRes.data.data);
      setInventoryReport(invRes.data.data);
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!salesReport) return;
    
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(6, 81, 237);
    doc.text('Cone Crazy', 14, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('Sales & Analytics Report', 14, 30);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Period: ${startDate} to ${endDate}`, 14, 38);
    
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(`Total Revenue: Rs. ${salesReport.totalRevenue?.toFixed(2) || '0.00'}`, 14, 50);
    doc.text(`Total Orders: ${salesReport.totalOrders || 0}`, 14, 58);

    if (salesReport.orders && salesReport.orders.length > 0) {
      const tableColumn = ["Order ID", "Date", "Customer", "Status", "Items", "Total (Rs)"];
      const tableRows = [];

      salesReport.orders.forEach(o => {
        const customer = o.customerId ? o.customerId.name : 'Walk-in';
        const date = new Date(o.createdAt).toLocaleDateString();
        const rowData = [
          o._id.slice(-6).toUpperCase(),
          date,
          customer,
          o.orderStatus,
          o.items.length.toString(),
          o.totalAmount.toFixed(2)
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 65,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [6, 81, 237], textColor: 255 },
      });
    } else {
      doc.setFontSize(11);
      doc.setTextColor(150);
      doc.text("No orders found in this date range.", 14, 70);
    }

    doc.save(`cone_crazy_report_${startDate}_to_${endDate}.pdf`);
  };

  const handleExportCSV = () => {
    if (!salesReport || !salesReport.orders) {
      alert("Report data is not loaded yet.");
      return;
    }
    
    const headers = ['Order ID,Date,Customer,Status,Payment Method,Items Count,Subtotal,Discount,Tax,Grand Total\n'];
    const rows = salesReport.orders.map(o => {
      const customer = o.customerId ? o.customerId.name : 'Walk-in';
      const date = new Date(o.createdAt).toLocaleDateString();
      return `${o._id},${date},${customer},${o.orderStatus},${o.paymentMethod},${o.items.length},${o.subtotal},${o.discountAmount},${o.taxAmount},${o.totalAmount}`;
    });
    
    const csvContent = headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process data for charts
  const getChartData = () => {
    if (!salesReport || !salesReport.orders) return [];
    
    // Group by Date
    const grouped = salesReport.orders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, orders: 0 };
      }
      acc[date].revenue += order.totalAmount;
      acc[date].orders += 1;
      return acc;
    }, {});
    
    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const chartData = getChartData();

  if (loading && !salesReport) return <div className="flex h-full items-center justify-center text-text-muted">Loading reports...</div>;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-secondary flex items-center">
          <div className="w-1.5 h-7 bg-primary mr-3 shadow-sm"></div>
          Analytics & Reports
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center bg-surface border border-border rounded-sm px-2 shadow-sm">
            <div className="flex items-center text-text-muted">
              <Calendar size={14} className="mr-2" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs font-bold text-secondary outline-none bg-transparent py-2.5"
              />
            </div>
            <span className="text-border px-2">|</span>
            <div className="flex items-center text-text-muted">
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs font-bold text-secondary outline-none bg-transparent py-2.5"
              />
            </div>
          </div>
          
          <button 
            onClick={handleExportCSV}
            className="bg-surface hover:bg-surface-hover text-text px-4 py-2 rounded-sm flex items-center text-sm font-bold border border-border shadow-sm transition-colors"
          >
            <Download size={16} className="mr-2 text-primary" />
            Export CSV
          </button>
          
          <button 
            onClick={handleExportPDF}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-sm flex items-center text-sm font-bold shadow-sm transition-colors"
          >
            <FileText size={16} className="mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border p-5 rounded-sm shadow-sm flex items-center">
          <div className="w-10 h-10 rounded bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mr-4">
            <IndianRupee size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-xl font-black text-secondary">₹{salesReport?.totalRevenue?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
        
        <div className="bg-surface border border-border p-5 rounded-sm shadow-sm flex items-center">
          <div className="w-10 h-10 rounded bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-4">
            <TrendingUp size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Total Orders</p>
            <p className="text-xl font-black text-secondary">{salesReport?.totalOrders || 0}</p>
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-sm shadow-sm flex items-center">
          <div className="w-10 h-10 rounded bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mr-4">
            <AlertTriangle size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Low Stock Products</p>
            <p className="text-xl font-black text-rose-600 dark:text-rose-400">{inventoryReport?.lowStockProducts?.length || 0}</p>
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-sm shadow-sm flex items-center">
          <div className="w-10 h-10 rounded bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mr-4">
            <Package size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Low Stock Materials</p>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400">{inventoryReport?.lowStockMaterials?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Revenue Chart */}
        <div className="bg-surface border border-border p-6 rounded-sm shadow-sm">
          <h2 className="text-sm uppercase tracking-wider font-bold text-secondary mb-6 border-b border-border pb-3">Daily Revenue</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 600}} tickFormatter={(val) => `₹${val}`} dx={-10} />
                <RechartsTooltip cursor={{fill: 'var(--color-surface-hover)'}} contentStyle={{backgroundColor: 'var(--color-surface)', borderRadius: '4px', border: '1px solid var(--color-border)', color: 'var(--color-text)', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', fontSize: '12px', fontWeight: 'bold'}} />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[2, 2, 0, 0]} name="Revenue (₹)" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume Chart */}
        <div className="bg-surface border border-border p-6 rounded-sm shadow-sm">
          <h2 className="text-sm uppercase tracking-wider font-bold text-secondary mb-6 border-b border-border pb-3">Order Volume</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 600}} dx={-10} />
                <RechartsTooltip contentStyle={{backgroundColor: 'var(--color-surface)', borderRadius: '4px', border: '1px solid var(--color-border)', color: 'var(--color-text)', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', fontSize: '12px', fontWeight: 'bold'}} />
                <Area type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" name="Orders" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Low Stock Detailed Lists */}
      {(inventoryReport?.lowStockProducts?.length > 0 || inventoryReport?.lowStockMaterials?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {inventoryReport?.lowStockProducts?.length > 0 && (
            <div className="bg-surface border border-rose-200 dark:border-rose-500/20 p-5 rounded-sm shadow-sm">
              <h3 className="text-sm uppercase tracking-wider font-bold text-rose-700 dark:text-rose-400 flex items-center mb-4 border-b border-rose-100 dark:border-rose-500/20 pb-3">
                <AlertTriangle size={16} className="mr-2" /> Products Running Low
              </h3>
              <div className="space-y-2">
                {inventoryReport.lowStockProducts.map(p => (
                  <div key={p._id} className="flex justify-between items-center bg-rose-50/50 dark:bg-rose-500/10 px-3 py-2 rounded-sm border border-rose-100/50 dark:border-rose-500/20">
                    <span className="text-sm font-bold text-secondary">{p.name}</span>
                    <span className="text-xs font-black bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded uppercase tracking-wider border border-rose-200 dark:border-rose-500/30">{p.stock} remaining</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {inventoryReport?.lowStockMaterials?.length > 0 && (
            <div className="bg-surface border border-amber-200 dark:border-amber-500/20 p-5 rounded-sm shadow-sm">
              <h3 className="text-sm uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400 flex items-center mb-4 border-b border-amber-100 dark:border-amber-500/20 pb-3">
                <Package size={16} className="mr-2" /> Materials Running Low
              </h3>
              <div className="space-y-2">
                {inventoryReport.lowStockMaterials.map(m => (
                  <div key={m._id} className="flex justify-between items-center bg-amber-50/50 dark:bg-amber-500/10 px-3 py-2 rounded-sm border border-amber-100/50 dark:border-amber-500/20">
                    <span className="text-sm font-bold text-secondary">{m.itemName}</span>
                    <span className="text-xs font-black bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded uppercase tracking-wider border border-amber-200 dark:border-amber-500/30">{m.quantity} {m.unit} <span className="opacity-70 font-bold ml-1">(Min: {m.minimumQuantity})</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Reports;
