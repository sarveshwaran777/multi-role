import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsUpDown,
  UserCheck,
  UserX,
  X
} from 'lucide-react';

const Users = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  
  // Filtering & Sorting State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Staff',
    status: 'active'
  });
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/users', {
        params: {
          search,
          role: roleFilter,
          status: statusFilter,
          sortBy,
          order: sortOrder,
          page,
          limit: 10
        }
      });
      if (res.data.success) {
        setUsers(res.data.users);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      console.error('Error fetching users:', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!token) return;

    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const eventSource = new EventSource(`${apiBase}/api/updates?token=${token}`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.event === 'user_event') {
          console.log('Users page received SSE real-time update:', payload);
          fetchUsers();
        }
      } catch (err) {
        console.error('Error parsing SSE event in Users page:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('Users page SSE connection error, retrying...', err);
    };

    return () => {
      eventSource.close();
    };
  }, [token, fetchUsers]);

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

  // Status Activation Toggle
  const toggleUserStatus = async (userToToggle) => {
    const updatedStatus = userToToggle.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await axios.put(`/api/users/${userToToggle._id}`, {
        status: updatedStatus
      });
      if (res.data.success) {
        setUsers(users.map(u => u._id === userToToggle._id ? { ...u, status: updatedStatus } : u));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  // Open Modal
  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    setFormError('');

    if (type === 'edit' && user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Leave empty for edit
        role: user.role,
        status: user.status
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'Staff',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  // Handle Submit Form (Add/Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!formData.name || !formData.email || (modalType === 'add' && !formData.password)) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setFormSubmitting(true);
    try {
      let res;
      if (modalType === 'add') {
        res = await axios.post('/api/users', formData);
      } else {
        // Strip password if empty
        const updatePayload = { ...formData };
        if (!updatePayload.password) {
          delete updatePayload.password;
        }
        res = await axios.put(`/api/users/${selectedUser._id}`, updatePayload);
      }

      if (res.data.success) {
        setIsModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error occurred during save');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you absolutely sure you want to delete this user? This action cannot be undone.')) {
      try {
        const res = await axios.delete(`/api/users/${id}`);
        if (res.data.success) {
          fetchUsers();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">User Management</h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
            Configure system access roles, user lists, and statuses.
          </p>
        </div>
        
        <button
          onClick={() => openModal('add')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/15 hover:bg-indigo-500 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add User Account</span>
        </button>
      </div>

      {/* Filters Hub */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="block w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-950 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-xs"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Manager">Manager</option>
            <option value="Staff">Staff</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">No users found matching requirements.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50/30 dark:bg-slate-900/10">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4 cursor-pointer select-none" onClick={() => handleSort('role')}>
                    <div className="flex items-center gap-1.5 hover:text-slate-600 dark:hover:text-slate-200">
                      <span>Role</span>
                      <ChevronsUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer select-none" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1.5 hover:text-slate-600 dark:hover:text-slate-200">
                      <span>Status</span>
                      <ChevronsUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer select-none" onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center gap-1.5 hover:text-slate-600 dark:hover:text-slate-200">
                      <span>Registered Date</span>
                      <ChevronsUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {users.map((item) => (
                  <tr key={item._id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors">
                    {/* User Info Avatar + Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs shadow-sm">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
                          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Role */}
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                        item.role === 'Super Admin' ? 'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/30' :
                        item.role === 'Manager' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30' :
                        'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800/40'
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    
                    {/* Status Toggle Switch */}
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleUserStatus(item)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full transition-all border ${
                          item.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/40' 
                            : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-950/40'
                        }`}
                      >
                        {item.status === 'active' ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    
                    {/* Created Date */}
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal('edit', item)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-all"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(item._id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-all"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                  Showing page {page} of {pages} ({total} total users)
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

      {/* Dynamic Modal (Add / Edit User) */}
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
              {modalType === 'add' ? 'Add User Account' : 'Edit User Details'}
            </h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
              {modalType === 'add' ? 'Register a new profile with role permission levels.' : 'Update account characteristics and roles.'}
            </p>

            {formError && (
              <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 text-xs"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@company.com"
                  className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 text-xs"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Password {modalType === 'edit' && <span className="text-[10px] text-slate-400 lowercase">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  required={modalType === 'add'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 text-xs"
                />
              </div>

              {/* Role Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">System Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

              {/* Status Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 flex justify-center items-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
                >
                  {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{modalType === 'add' ? 'Register' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
