import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await api.get('/reviews');
      setReviews(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/reviews/${id}/status`, { status });
      setReviews(reviews.map((r) => (r._id === id ? { ...r, status } : r)));
      showToast(`Review ${status.toLowerCase()}`, 'success');
    } catch (err) {
      showToast('Failed to update review status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews(reviews.filter((r) => r._id !== id));
      showToast('Review deleted', 'success');
    } catch (err) {
      showToast('Failed to delete review', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
          TESTIMONIAL MODERATION
        </span>
        <h1 className="font-serif text-3xl font-bold text-white mt-0.5">
          Connoisseur Reviews Moderation
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Review, approve, or reject customer feedback and horological assessments.
        </p>
      </div>

      <div className="bg-[#0D0D11] border border-stone-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111115] border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Product Ref</th>
                <th className="py-4 px-4">Author</th>
                <th className="py-4 px-4">Rating</th>
                <th className="py-4 px-6">Commentary</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-900">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-stone-400">Loading reviews...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-stone-500">No client reviews submitted yet.</td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-stone-900/40 transition-colors">
                    <td className="py-3 px-6 text-white font-semibold">
                      {rev.product?.name || 'Watch reference'}
                    </td>
                    <td className="py-3 px-4 text-stone-300">
                      {rev.userName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex text-[#D4AF37]">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-[#D4AF37]" />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-stone-300 max-w-xs font-light">
                      "{rev.comment}"
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rev.status === 'Approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : rev.status === 'Rejected'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {rev.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {rev.status !== 'Approved' && (
                          <button
                            onClick={() => handleStatus(rev._id, 'Approved')}
                            className="px-2 py-1 bg-emerald-950 text-emerald-400 hover:bg-emerald-900 rounded text-[10px]"
                          >
                            Approve
                          </button>
                        )}
                        {rev.status !== 'Rejected' && (
                          <button
                            onClick={() => handleStatus(rev._id, 'Rejected')}
                            className="px-2 py-1 bg-stone-900 text-stone-400 hover:text-white rounded text-[10px]"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(rev._id)}
                          className="p-1 text-stone-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
