import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { Eye, Clock, CheckCircle, XCircle, Download, Printer, Trash2 } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await api.delete('/orders');
      alert('All orders deleted successfully.');
      setOrders([]);
      setShowDeleteConfirm(false);
    } catch (error) {
      alert('Failed to delete all orders: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    if (!invoiceId) {
      alert("Invoice not generated yet for this order.");
      return;
    }
    
    try {
      const response = await api.get(`/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId.slice(-6)}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download invoice", error);
      alert("Could not download invoice. Please make sure you are authorized.");
    }
  };

  const handlePrintInvoice = async (invoiceId) => {
    if (!invoiceId) {
      alert("Invoice not generated yet for this order.");
      return;
    }
    
    try {
      const response = await api.get(`/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        // Many browsers will auto-open the PDF viewer and its print dialog,
        // but we can also trigger print when the blob loads if supported.
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error("Failed to print invoice", error);
      alert("Could not print invoice. Please make sure you are authorized.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
      case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
      case 'Cancelled': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle size={14} className="mr-1" />;
      case 'Pending': return <Clock size={14} className="mr-1" />;
      case 'Cancelled': return <XCircle size={14} className="mr-1" />;
      default: return null;
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center text-text-muted">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">Order Management</h1>
        {orders.length > 0 && (
          <button onClick={() => setShowDeleteConfirm(true)} className="bg-rose-100 dark:bg-rose-500/10 hover:bg-rose-200 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 px-4 py-2 rounded-md font-bold text-sm transition-colors flex items-center">
            <Trash2 size={16} className="mr-2" />
            Delete All
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-secondary mb-2">Delete All Orders?</h3>
            <p className="text-text-muted text-sm mb-6">Are you absolutely sure you want to delete all order history? This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="flex-1 px-4 py-2 bg-surface-hover hover:bg-border text-text rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAll} 
                className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition-colors shadow-sm shadow-rose-600/30"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="saas-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-hover border-b border-border">
                <th className="p-4 text-sm font-semibold text-text-muted whitespace-nowrap">Order ID</th>
                <th className="p-4 text-sm font-semibold text-text-muted whitespace-nowrap">Date</th>
                <th className="p-4 text-sm font-semibold text-text-muted whitespace-nowrap">Customer</th>
                <th className="p-4 text-sm font-semibold text-text-muted whitespace-nowrap">Items</th>
                <th className="p-4 text-sm font-semibold text-text-muted whitespace-nowrap">Total</th>
                <th className="p-4 text-sm font-semibold text-text-muted whitespace-nowrap">Status</th>
                <th className="p-4 text-sm font-semibold text-text-muted text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-text-muted">No orders found.</td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-surface-hover transition-colors">
                  <td className="p-4 text-sm font-mono text-text whitespace-nowrap">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="p-4 text-sm text-text whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-sm font-medium text-secondary whitespace-nowrap">
                    {order.customerId ? order.customerId.name : 'Walk-in'}
                  </td>
                  <td className="p-4 text-sm text-text whitespace-nowrap">{order.items.length} items</td>
                  <td className="p-4 text-sm font-bold text-primary whitespace-nowrap">₹{order.totalAmount.toFixed(2)}</td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                      {getStatusIcon(order.orderStatus)}
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => handlePrintInvoice(order.invoiceId)} className="p-2 text-text-muted hover:text-primary transition-colors inline-flex items-center" title="Print Invoice">
                      <Printer size={18} />
                    </button>
                    <button onClick={() => handleDownloadInvoice(order.invoiceId)} className="p-2 text-text-muted hover:text-primary transition-colors inline-flex items-center" title="Download Invoice">
                      <Download size={18} />
                    </button>
                    <button onClick={() => setSelectedOrder(order)} className="p-2 text-text-muted hover:text-primary transition-colors inline-flex items-center" title="View Details">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl animate-fade-in-up">
            <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-secondary">Order Details</h2>
                <p className="text-sm text-text-muted font-mono mt-1">#{selectedOrder._id.toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-text-muted hover:text-rose-500 transition-colors rounded-full hover:bg-rose-50 dark:hover:bg-rose-500/10">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                <div className="bg-surface-hover p-3 rounded-lg border border-border">
                  <p className="text-xs font-semibold text-text-muted mb-1">Date</p>
                  <p className="text-sm font-medium text-secondary">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div className="bg-surface-hover p-3 rounded-lg border border-border">
                  <p className="text-xs font-semibold text-text-muted mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.orderStatus)}`}>
                    {getStatusIcon(selectedOrder.orderStatus)}
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <div className="bg-surface-hover p-3 rounded-lg border border-border">
                  <p className="text-xs font-semibold text-text-muted mb-1">Payment Method</p>
                  <p className="text-sm font-medium text-secondary">{selectedOrder.paymentMethod || 'N/A'}</p>
                </div>
                <div className="bg-surface-hover p-3 rounded-lg border border-border">
                  <p className="text-xs font-semibold text-text-muted mb-1">Customer</p>
                  <p className="text-sm font-medium text-secondary">{selectedOrder.customerId ? selectedOrder.customerId.name : 'Walk-in'}</p>
                </div>
              </div>
              
              <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4 border-b border-border pb-2">Items Purchased</h3>
              <div className="space-y-3 mb-8">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-surface-hover p-3 rounded-lg border border-border">
                    <div className="flex flex-col">
                      <span className="font-medium text-secondary">{item.productName}</span>
                      <span className="text-xs text-text-muted mt-0.5">₹{item.unitPrice.toFixed(2)} x {item.quantity}</span>
                    </div>
                    <span className="font-bold text-primary">₹{item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="bg-surface-hover p-4 rounded-xl border border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="font-medium text-secondary">₹{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Discount</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">-₹{selectedOrder.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Tax</span>
                  <span className="font-medium text-secondary">₹{selectedOrder.taxAmount.toFixed(2)}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-border flex justify-between items-center">
                  <span className="font-bold text-secondary">Grand Total</span>
                  <span className="font-bold text-xl text-primary">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-border bg-surface-hover rounded-b-2xl flex justify-end">
              <button onClick={() => setSelectedOrder(null)} className="px-5 py-2.5 bg-surface border border-border text-text rounded-xl hover:bg-border transition-colors font-medium shadow-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
