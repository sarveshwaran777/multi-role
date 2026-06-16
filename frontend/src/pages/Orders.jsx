import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Plus, 
  Trash2, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsUpDown,
  Eye,
  CheckCircle,
  Clock,
  X,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

const Orders = () => {
  const { user, token } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'add', 'edit'
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    productName: '',
    quantity: 1,
    price: 0,
    status: 'Pending',
    date: ''
  });
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/orders', {
        params: {
          search,
          status: statusFilter,
          sortBy,
          order: sortOrder,
          page,
          limit: 10
        }
      });
      if (res.data.success) {
        setOrders(res.data.orders);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      console.error('Error fetching orders:', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!token) return;

    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const eventSource = new EventSource(`${apiBase}/api/updates?token=${token}`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.event === 'order_event') {
          console.log('Orders page received SSE real-time update:', payload);
          fetchOrders();
        }
      } catch (err) {
        console.error('Error parsing SSE event in Orders page:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('Orders page SSE connection error, retrying...', err);
    };

    return () => {
      eventSource.close();
    };
  }, [token, fetchOrders]);

  // Handle Sort Toggle
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // Open Modal
  const openModal = (type, order = null) => {
    setModalType(type);
    setSelectedOrder(order);
    setFormError('');

    if ((type === 'view' || type === 'edit') && order) {
      setFormData({
        customerName: order.customerName,
        productName: order.productName,
        quantity: order.quantity,
        price: order.price,
        status: order.status,
        date: order.date ? new Date(order.date).toISOString().substring(0, 16) : ''
      });
    } else {
      // Add mode
      setFormData({
        customerName: '',
        productName: '',
        quantity: 1,
        price: 0.0,
        status: 'Pending',
        date: new Date().toISOString().substring(0, 16)
      });
    }
    setIsModalOpen(true);
  };

  // Handle Form Submission (CRUD / Update status)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Field verification
    if (user.role === 'Super Admin' && modalType === 'add') {
      if (!formData.customerName || !formData.productName || !formData.quantity || !formData.price) {
        setFormError('Please fill in all required fields.');
        return;
      }
    }

    setFormSubmitting(true);
    try {
      let res;
      if (modalType === 'add') {
        res = await axios.post('/api/orders', formData);
      } else if (modalType === 'edit' || (modalType === 'view' && user.role === 'Manager')) {
        // Edit order
        let payload = {};
        if (user.role === 'Manager') {
          // Managers can only update status
          payload = { status: formData.status };
        } else {
          // Super admin can update everything
          payload = { ...formData };
        }
        res = await axios.put(`/api/orders/${selectedOrder._id}`, payload);
      }

      if (res && res.data.success) {
        setIsModalOpen(false);
        fetchOrders();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error saving order details');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Order Deletion
  const handleDeleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this order record? This cannot be undone.')) {
      try {
        const res = await axios.delete(`/api/orders/${id}`);
        if (res.data.success) {
          fetchOrders();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete order record');
      }
    }
  };

  // Status Badge Colors
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'Processing':
        return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
    }
  };

  const isSuperAdmin = user?.role === 'Super Admin';
  const isManager = user?.role === 'Manager';
  const isStaff = user?.role === 'Staff';

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Order Registry</h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
            Audit customer purchases, shipment state indicators, and transactions.
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => openModal('add')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/15 hover:bg-indigo-500 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Order</span>
          </button>
        )}
      </div>

      {/* Filters Hub */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search customer, ID, or product..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="block w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-950 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-xs"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer"
          >
            <option value="">All Order Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">No transactions recorded.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50/30 dark:bg-slate-900/10">
                  <th className="px-6 py-4 cursor-pointer select-none" onClick={() => handleSort('orderId')}>
                    <div className="flex items-center gap-1.5 hover:text-slate-600 dark:hover:text-slate-200">
                      <span>Order ID</span>
                      <ChevronsUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer select-none" onClick={() => handleSort('customerName')}>
                    <div className="flex items-center gap-1.5 hover:text-slate-600 dark:hover:text-slate-200">
                      <span>Customer</span>
                      <ChevronsUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer select-none" onClick={() => handleSort('productName')}>
                    <div className="flex items-center gap-1.5 hover:text-slate-600 dark:hover:text-slate-200">
                      <span>Product</span>
                      <ChevronsUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4 cursor-pointer select-none" onClick={() => handleSort('price')}>
                    <div className="flex items-center gap-1.5 hover:text-slate-600 dark:hover:text-slate-200">
                      <span>Total Value</span>
                      <ChevronsUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer select-none" onClick={() => handleSort('date')}>
                    <div className="flex items-center gap-1.5 hover:text-slate-600 dark:hover:text-slate-200">
                      <span>Date</span>
                      <ChevronsUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {orders.map((item) => (
                  <tr key={item._id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-4 font-bold font-mono text-xs text-indigo-600 dark:text-indigo-400">{item.orderId}</td>
                    <td className="px-6 py-4 font-semibold">{item.customerName}</td>
                    <td className="px-6 py-4 font-medium">{item.productName}</td>
                    <td className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">{item.quantity}</td>
                    <td className="px-6 py-4 font-black text-slate-800 dark:text-slate-200">${(item.price * item.quantity).toFixed(2)}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full border ${getStatusStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View / Edit Button */}
                        <button
                          onClick={() => openModal(isSuperAdmin ? 'edit' : 'view', item)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-all"
                          title={isSuperAdmin ? 'Edit Order' : 'View Order Details'}
                        >
                          {isSuperAdmin ? <ChevronRight className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>

                        {/* Delete Button (Super Admin only) */}
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDeleteOrder(item._id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-all"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200/50 dark:border-slate-800/50">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  Showing page {page} of {pages} ({total} total transactions)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page === pages}
                    onClick={() => setPage(page + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl animate-fade-in p-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {modalType === 'add' ? 'Create New Order' : modalType === 'edit' ? 'Edit Order Details' : 'Order Details Modal'}
            </h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
              {modalType === 'add' ? 'Enter product specifications and quantity.' : `Order Reference: ${selectedOrder?.orderId}`}
            </p>

            {formError && (
              <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Customer Name</label>
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Alice Johnson"
                  className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 disabled:bg-slate-100 dark:bg-slate-950/40 dark:disabled:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 text-xs"
                />
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Product Title</label>
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  required
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="Mechanical Keyboard"
                  className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 disabled:bg-slate-100 dark:bg-slate-950/40 dark:disabled:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 text-xs"
                />
              </div>

              {/* Quantity and Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Quantity</label>
                  <input
                    type="number"
                    disabled={!isSuperAdmin}
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 disabled:bg-slate-100 dark:bg-slate-950/40 dark:disabled:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Price ($)</label>
                  <input
                    type="number"
                    disabled={!isSuperAdmin}
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 disabled:bg-slate-100 dark:bg-slate-950/40 dark:disabled:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>

              {/* Date */}
              {modalType !== 'add' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Registry Date</label>
                  <input
                    type="datetime-local"
                    disabled={!isSuperAdmin}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 disabled:bg-slate-100 dark:bg-slate-950/40 dark:disabled:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 text-xs"
                  />
                </div>
              )}

              {/* Order Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Order Status</label>
                <select
                  disabled={isStaff}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 disabled:bg-slate-100 dark:bg-slate-950/40 dark:disabled:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Total Summary */}
              {formData.quantity && formData.price && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950/45 rounded-xl border border-slate-100 dark:border-slate-900 flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Total Valuation:</span>
                  <span className="text-slate-800 dark:text-slate-100 text-sm font-black">${(formData.quantity * formData.price).toFixed(2)}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {isStaff ? 'Close' : 'Cancel'}
                </button>
                
                {!isStaff && (
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex-1 flex justify-center items-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
                  >
                    {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{modalType === 'add' ? 'Create Order' : 'Update Order'}</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
