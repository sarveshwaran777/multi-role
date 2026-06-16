import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  Activity,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [productBreakdown, setProductBreakdown] = useState([]);
  const [activities, setActivities] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const statsRes = await axios.get('/api/reports/stats');
      const ordersRes = await axios.get('/api/orders?limit=5');
      
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setSalesTrend(statsRes.data.salesTrend);
        setProductBreakdown(statsRes.data.productBreakdown);
        setActivities(statsRes.data.recentActivities);
      }
      if (ordersRes.data.success) {
        setRecentOrders(ordersRes.data.orders);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Could not load dashboard statistics. Please try again.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!token) return;

    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const eventSource = new EventSource(`${apiBase}/api/updates?token=${token}`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.event === 'user_event' || payload.event === 'order_event') {
          console.log('Dashboard received SSE real-time update:', payload);
          fetchDashboardData(false);
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('Dashboard SSE connection error, retrying...', err);
    };

    return () => {
      eventSource.close();
    };
  }, [token, fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center max-w-lg mx-auto bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-3xl border border-rose-100 dark:border-rose-900/30">
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  // Pie Chart configurations
  const pieData = stats ? [
    { name: 'Completed', value: stats.completedOrders, color: '#10B981' },
    { name: 'Pending', value: stats.pendingOrders, color: '#F59E0B' },
    { name: 'Processing', value: stats.processingOrders, color: '#3B82F6' },
    { name: 'Cancelled', value: stats.cancelledOrders, color: '#EF4444' }
  ].filter(item => item.value > 0) : [];

  const cards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'indigo',
      description: 'System registered user accounts',
      visible: user?.role === 'Super Admin'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'blue',
      description: 'Orders logged in system',
      visible: true
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: 'amber',
      description: 'Awaiting merchant action',
      visible: true
    },
    {
      title: 'Completed Orders',
      value: stats?.completedOrders || 0,
      icon: CheckCircle,
      color: 'emerald',
      description: 'Successfully closed orders',
      visible: true
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.totalSales || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'violet',
      description: 'Sum of completed sales',
      visible: user?.role === 'Super Admin' || user?.role === 'Manager'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 dark:from-indigo-950/20 dark:to-violet-950/20 border border-indigo-200/40 dark:border-indigo-800/20 rounded-3xl">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Welcome Back, {user?.name}!</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Here's what is happening across your systems today as <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{user?.role}</span>.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/10 cursor-default">
          <TrendingUp className="w-4 h-4" />
          <span>Operational Health: Excellent</span>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.filter(c => c.visible).map((card, idx) => {
          const Icon = card.icon;
          let colorClass = '';
          
          if (card.color === 'indigo') colorClass = 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/30';
          if (card.color === 'blue') colorClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/30';
          if (card.color === 'amber') colorClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/30';
          if (card.color === 'emerald') colorClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/30';
          if (card.color === 'violet') colorClass = 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200/30';

          return (
            <div 
              key={idx} 
              className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transform duration-250 cursor-default"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.title}</span>
                <div className={`p-2.5 rounded-xl border ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-800 dark:text-slate-50 tracking-tight">{card.value}</span>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Graphs / Statistics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales trend */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Monthly Sales Revenue</h3>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Completed orders trend line</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-lg text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Upward Trend</span>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                    borderColor: 'rgba(71, 85, 105, 0.5)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="sales" name="Sales ($)" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Composition */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Order Composition</h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Distribution by status type</p>
          </div>

          <div className="h-48 my-4 flex justify-center items-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                      borderColor: 'rgba(71, 85, 105, 0.5)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs font-semibold text-slate-400">No data available</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-600 dark:text-slate-400">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders List */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Recent Orders</h3>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Latest transactional registries</p>
            </div>
            <Link 
              to="/orders"
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3 font-semibold">ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Product</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="text-slate-700 dark:text-slate-300">
                    <td className="py-3.5 font-bold font-mono text-xs text-slate-400">{order.orderId}</td>
                    <td className="py-3.5 font-semibold">{order.customerName}</td>
                    <td className="py-3.5 font-medium">{order.productName}</td>
                    <td className="py-3.5 font-bold">${(order.price * order.quantity).toFixed(2)}</td>
                    <td className="py-3.5 text-right">
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        order.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                        order.status === 'Pending' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                        order.status === 'Processing' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' :
                        'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Audit Activities</h3>
            <Activity className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="flow-root flex-1">
            <ul className="-mb-8">
              {activities.map((activity, actIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {actIdx !== activities.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-800/60" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-xl flex items-center justify-center ring-4 ring-white dark:ring-slate-900 ${
                          activity.type === 'user' ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400' :
                          activity.type === 'order' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' :
                          'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                        }`}>
                          <Activity className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{activity.message}</p>
                        </div>
                        <div className="text-right text-[10px] whitespace-nowrap text-slate-400 dark:text-slate-500 font-bold">
                          <time>{activity.time}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
