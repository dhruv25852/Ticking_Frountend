import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/auth/customers');
      setCustomers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('[AdminCustomers Error]:', err);
      const errorMsg = err.message || 'Failed to load customers from MongoDB Atlas';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            CONNOISSEUR ROSTER
          </span>
          <h1 className="font-serif text-3xl font-bold text-white mt-0.5">
            Client & Collector Directory
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Registered luxury buyers, purchase volume, and active status in MongoDB Atlas.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-[#141418] hover:bg-stone-800 text-stone-300 hover:text-[#D4AF37] border border-stone-800 hover:border-[#D4AF37]/40 rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
          <span>Refresh Roster</span>
        </button>
      </div>

      <div className="bg-[#0D0D11] border border-stone-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111115] border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Client Name</th>
                <th className="py-4 px-4">Contact Coordinates</th>
                <th className="py-4 px-4">Joined Date</th>
                <th className="py-4 px-4">Total Orders</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-6 text-right">Lifetime Expenditure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-900">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-7 h-7 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs uppercase tracking-widest text-stone-400 font-medium">
                        Loading directory from MongoDB Atlas...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2.5 max-w-md mx-auto">
                      <div className="w-10 h-10 rounded-full bg-rose-950/40 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-1">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-rose-300">
                        Failed to Load Customer Directory
                      </p>
                      <p className="text-xs text-stone-400">
                        {error}
                      </p>
                      <button
                        onClick={fetchCustomers}
                        className="mt-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg"
                      >
                        Retry Connection
                      </button>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-stone-600 mb-1" />
                      <p className="text-sm font-medium text-stone-400">
                        No customer profiles found in database.
                      </p>
                      <p className="text-xs text-stone-600">
                        Registered customer accounts will appear here once created.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-stone-900/40 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-xs font-bold text-[#D4AF37]">
                          {cust.name?.[0] || 'C'}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{cust.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-stone-300">{cust.email}</p>
                      <p className="text-[10px] text-stone-500">{cust.phone || 'No phone recorded'}</p>
                    </td>
                    <td className="py-3 px-4 text-stone-400">
                      {formatDate(cust.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {cust.totalOrders || 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {cust.isActive !== false && !cust.deletedAt ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                          <CheckCircle className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/60 border border-rose-500/40 text-rose-400">
                          <XCircle className="w-3 h-3" />
                          <span>Deactivated</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-right font-serif font-bold text-[#F3E5AB]">
                      {formatPrice(cust.totalSpent || 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
