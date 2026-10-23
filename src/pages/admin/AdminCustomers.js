import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, ShoppingBag, CheckCircle, XCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const { showToast } = useToast();

  const fetchCustomers = () => {
    setLoading(true);
    api.get('/auth/customers')
      .then((data) => setCustomers(data || []))
      .catch((err) => {
        console.error(err);
        showToast('Failed to load customers from MongoDB Atlas', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (customer) => {
    const newStatus = customer.isActive === false;
    setUpdatingId(customer._id);
    try {
      await api.patch(`/auth/customers/${customer._id}/status`, { isActive: newStatus });
      setCustomers((prev) =>
        prev.map((c) => (c._id === customer._id ? { ...c, isActive: newStatus } : c))
      );
      showToast(
        `Customer ${customer.name} ${newStatus ? 'activated' : 'deactivated'} successfully`,
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to update customer status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
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
                <th className="py-4 px-4 text-right">Lifetime Expenditure</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-900">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-stone-400">Loading directory from MongoDB Atlas...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-stone-500">No customer profiles found in database.</td>
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
                          {cust.deletedAt && (
                            <span className="text-[10px] text-rose-400 italic">Deactivated account</span>
                          )}
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
                      {cust.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                          <CheckCircle className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/60 border border-rose-500/40 text-rose-400">
                          <XCircle className="w-3 h-3" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-serif font-bold text-[#F3E5AB]">
                      {formatPrice(cust.totalSpent || 0)}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <button
                        onClick={() => handleToggleStatus(cust)}
                        disabled={updatingId === cust._id}
                        className={`px-3 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                          cust.isActive !== false
                            ? 'border-rose-800/60 bg-rose-950/30 text-rose-300 hover:bg-rose-900/60'
                            : 'border-emerald-800/60 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/60'
                        } disabled:opacity-50`}
                      >
                        {updatingId === cust._id
                          ? 'Updating...'
                          : cust.isActive !== false
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
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
