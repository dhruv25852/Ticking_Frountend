import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, Check } from 'lucide-react';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { validateStock } from '../../utils/validation';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [stockVal, setStockVal] = useState(0);
  const { showToast } = useToast();

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/inventory');
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdate = async (id) => {
    const err = validateStock(stockVal, 'Vault quantity');
    if (err) {
      showToast(err, 'error');
      return;
    }
    try {
      await api.put(`/admin/inventory/${id}`, { stock: Number(stockVal) });
      setProducts(products.map((p) => (p._id === id ? { ...p, stock: Number(stockVal) } : p)));
      setEditingId(null);
      showToast('Vault stock updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update stock', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
          VAULT BALANCES
        </span>
        <h1 className="font-serif text-3xl font-bold text-white mt-0.5">
          Inventory & Allocation Control
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Monitor low stock warning thresholds and adjust vaulted reserves in real-time.
        </p>
      </div>

      <div className="bg-[#0D0D11] border border-stone-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111115] border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Watch Model</th>
                <th className="py-4 px-4">Brand</th>
                <th className="py-4 px-4">SKU</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Valuation</th>
                <th className="py-4 px-4">Vault Quantity</th>
                <th className="py-4 px-6 text-right">Instant Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-900">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-stone-400">Loading inventory metrics...</td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-stone-900/40 transition-colors">
                    <td className="py-3 px-6 font-semibold text-white">
                      {prod.name}
                    </td>
                    <td className="py-3 px-4 text-[#D4AF37]">
                      {prod.brand}
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-300">
                      {prod.sku}
                    </td>
                    <td className="py-3 px-4 text-stone-400">
                      {prod.category}
                    </td>
                    <td className="py-3 px-4 font-serif text-stone-200">
                      {formatPrice(prod.price)}
                    </td>
                    <td className="py-3 px-4">
                      {editingId === prod._id ? (
                        <input
                          type="number"
                          value={stockVal}
                          onChange={(e) => setStockVal(e.target.value)}
                          className="w-16 bg-[#18181D] border border-[#D4AF37] text-white px-2 py-1 rounded text-xs outline-none"
                        />
                      ) : (
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            prod.stock <= 3
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : prod.stock <= 10
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {prod.stock} units
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-right">
                      {editingId === prod._id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdate(prod._id)}
                            className="px-2.5 py-1 bg-[#D4AF37] text-black font-bold rounded text-[10px]"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 text-stone-400 text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(prod._id);
                            setStockVal(prod.stock);
                          }}
                          className="text-[#D4AF37] hover:underline font-medium text-[11px]"
                        >
                          Modify Stock
                        </button>
                      )}
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
