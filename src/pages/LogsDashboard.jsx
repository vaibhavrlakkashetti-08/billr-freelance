import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { ShieldAlert, AlertTriangle, Info, Search, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export default function LogsDashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorCount, setErrorCount] = useState(0);
  const [warnCount, setWarnCount] = useState(0);
  
  // Filters
  const [level, setLevel] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No active session found, cannot fetch logs");
        setLoading(false);
        return;
      }

      // Query Supabase directly
      let query = supabase.from('logs').select('*', { count: 'exact' });

      // Apply Filters
      if (level && level !== 'all') {
        query = query.eq('level', level);
      }
      if (search) {
        query = query.or(`message.ilike.%${search}%,url.ilike.%${search}%`);
      }

      // Apply Pagination
      const offset = (page - 1) * limit;
      query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

      const { data, count, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      setLogs(data || []);
      setTotalPages(Math.ceil((count || 0) / limit) || 1);

      // Simple stats for current page
      setErrorCount(data?.filter(l => l.level === 'error').length || 0);
      setWarnCount(data?.filter(l => l.level === 'warn').length || 0);

    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [level, page]); // Re-fetch when level or page changes

  // Handle search with debounce/explicit trigger
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // reset to first page on search
    fetchLogs();
  };

  const getLevelColor = (lvl) => {
    switch (lvl) {
      case 'error': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'warn': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              System Logs
            </h1>
            <p className="text-slate-400 mt-1">Monitor backend requests and application events</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-lg text-red-500">
                <ShieldAlert size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Page Errors</p>
                <p className="text-2xl font-bold text-white">{errorCount}</p>
              </div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-500">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Page Warnings</p>
                <p className="text-2xl font-bold text-white">{warnCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={level}
                onChange={(e) => { setLevel(e.target.value); setPage(1); }}
                className="pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg appearance-none outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="all">All Levels</option>
                <option value="info">Info</option>
                <option value="warn">Warnings</option>
                <option value="error">Errors</option>
              </select>
            </div>
            
            <button 
              onClick={() => fetchLogs()}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
              title="Refresh Logs"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <form onSubmit={handleSearch} className="relative w-full md:w-96 flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search messages or URLs..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <button 
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Logs Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Endpoint</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-800 rounded-md"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-48 bg-slate-800 rounded-md"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-800 rounded-md"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-800 rounded-md"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-800 rounded-md"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-800 rounded-md"></div></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                      <Info className="mx-auto text-slate-600 mb-3" size={32} />
                      <p>No logs found matching your criteria</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr 
                      key={log.id} 
                      className={`hover:bg-slate-800/50 transition-colors ${log.level === 'error' ? 'bg-red-500/[0.02]' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-sm ${log.level === 'error' ? 'text-red-400 font-medium' : 'text-slate-300'}`}>
                          {log.message}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.method && log.url ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-500">{log.method}</span>
                            <span className="text-sm text-slate-400 font-mono">{log.url}</span>
                          </div>
                        ) : <span className="text-slate-600">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.status ? (
                          <span className={`text-sm font-bold ${log.status >= 500 ? 'text-red-500' : log.status >= 400 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                            {log.status}
                          </span>
                        ) : <span className="text-slate-600">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {log.response_time ? `${log.response_time}ms` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Showing page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:hover:text-slate-400 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:hover:text-slate-400 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
