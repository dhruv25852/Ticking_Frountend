import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Clock } from 'lucide-react';
import api from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/payments')
      .then((data) => setPayments(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
          TREASURY & TRANSACTION LOG
        </span>
        <h1 className="font-serif text-3xl font-bold text-white mt-0.5">
          Settlement Ledgers
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Detailed transactions, gateway authorizations, and cash-on-delivery settlements.
        </p>
      </div>

      <div className="bg-[#0D0D11] border border-stone-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111115] border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Transaction Ref</th>
                <th className="py-4 px-4">Client Name</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Method</th>
                <th className="py-4 px-4">Settlement State</th>
                <th className="py-4 px-6 text-right">Net Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-900">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-stone-400">Loading ledger entries...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-stone-500">No payment records found.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-stone-900/40 transition-colors">
                    <td className="py-3 px-6 font-mono font-bold text-[#F3E5AB]">
                      {p.orderId}
                    </td>
                    <td className="py-3 px-4 text-white font-medium">
                      {p.shippingAddress?.fullName || 'Collector'}
                    </td>
                    <td className="py-3 px-4 text-stone-400">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-stone-300">
                      {p.paymentMethod}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.paymentStatus === 'Paid'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right font-serif font-bold text-white text-sm">
                      {formatPrice(p.grandTotal)}
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
