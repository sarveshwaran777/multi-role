import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  FileDown, 
  FileSpreadsheet,
  Printer, 
  Loader2,
  Calendar,
  BarChart4
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
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

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [productBreakdown, setProductBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/reports/stats');
        if (res.data.success) {
          setStats(res.data.stats);
          setSalesTrend(res.data.salesTrend);
          setProductBreakdown(res.data.productBreakdown);
        }
      } catch (err) {
        console.error('Error loading reports data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, []);

  // Export Reports Data to CSV (mimicking Excel)
  const handleExportCSV = async () => {
    try {
      setExportLoading(true);
      // Fetch all orders to export a clean transaction ledger
      const res = await axios.get('/api/orders?limit=100');
      if (!res.data.success) throw new Error('Could not retrieve orders');

      const ordersList = res.data.orders;
      
      // Define CSV columns
      const headers = ['Order ID', 'Customer Name', 'Product Name', 'Quantity', 'Unit Price ($)', 'Total Value ($)', 'Status', 'Date'];
      
      const csvRows = [
        headers.join(','), // CSV header row
        ...ordersList.map(o => [
          o.orderId,
          `"${o.customerName.replace(/"/g, '""')}"`,
          `"${o.productName.replace(/"/g, '""')}"`,
          o.quantity,
          o.price.toFixed(2),
          (o.price * o.quantity).toFixed(2),
          o.status,
          new Date(o.date).toLocaleDateString()
        ].join(','))
      ];

      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `AeroDash_Sales_Report_${new Date().toISOString().substring(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Error exporting CSV: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  // Trigger Native PDF generation via Browser Print Utility
  const handlePrintPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Compiling financial aggregates...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-6 print:p-0 print:bg-white print:text-black">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Performance Analytics</h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
            Audit system sales revenue metrics and product volume summaries.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={exportLoading}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors disabled:opacity-50"
          >
            {exportLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            )}
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={handlePrintPDF}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/15 hover:bg-indigo-500 cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Print-Only Header */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-2xl font-black">AeroDash Performance & Financial Audit</h1>
        <p className="text-xs text-slate-500">Date Generated: {new Date().toLocaleString()} | Access Role: Auditor/Admin</p>
      </div>

      {/* KPI stats layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border border-slate-200/50 dark:border-slate-800/50 shadow-sm print:border-slate-400">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase">Net Revenue Sales</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
            ${stats?.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">Aggregated values of Completed order states</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border border-slate-200/50 dark:border-slate-800/50 shadow-sm print:border-slate-400">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase">Gross Pipeline Volume</span>
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {stats?.totalOrders} Registered Orders
          </span>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">Including Pending, Completed, & Processing</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border border-slate-200/50 dark:border-slate-800/50 shadow-sm print:border-slate-400">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase">Average Order Size</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
            ${stats?.totalOrders > 0 ? (stats.totalValue / stats.totalOrders).toFixed(2) : '0.00'}
          </span>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">Average invoice value across all registers</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales and Orders Growth Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm print:border-slate-400 flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-6">Revenue and Order Volume Run-rate</h3>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="colorSalesTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                    borderColor: 'rgba(71, 85, 105, 0.5)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Area type="monotone" dataKey="sales" name="Sales ($)" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSalesTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Sales Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm print:border-slate-400 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Product Category Distribution</h3>
          
          <div className="h-56 my-2 flex justify-center items-center">
            {productBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {productBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                      borderColor: 'rgba(71, 85, 105, 0.5)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400 font-semibold">No product data logged.</div>
            )}
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-36 pr-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {productBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="truncate max-w-[150px]">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {item.value} units (${item.sales.toFixed(2)})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Print Custom Rules */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          aside, header, button, .print\\:hidden {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .glass-panel {
            background-color: white !important;
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            color: black !important;
          }
          .recharts-responsive-container {
            width: 100% !important;
            height: 250px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Reports;
