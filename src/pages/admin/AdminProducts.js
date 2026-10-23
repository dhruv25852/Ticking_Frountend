import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Watch,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const { showToast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products?limit=100');
      setProducts(res.products || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load watches', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the catalog?`)) {
      return;
    }
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      showToast(`Removed "${name}" from catalog`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesBrd = brandFilter === 'All' || p.brand === brandFilter;
    return matchesSearch && matchesCat && matchesBrd;
  });

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            CATALOG ARCHIVE
          </span>
          <h1 className="font-serif text-3xl font-bold text-white mt-0.5">
            Watch Catalog Management
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Manage allocations, technical specifications, and inventory balances.
          </p>
        </div>

        <Link
          to="/admin/products/add"
          className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-[#0D0D11] border border-stone-800 rounded-xl p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by watch name, brand, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#141418] border border-stone-800 focus:border-[#D4AF37] text-xs text-white pl-9 pr-3 py-2 rounded-lg outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-[#141418] border border-stone-800 text-xs text-stone-200 px-3 py-2 rounded-lg outline-none"
        >
          <option value="All">All Categories</option>
          <option value="Luxury Watches">Luxury Watches</option>
          <option value="Sports Watches">Sports Watches</option>
          <option value="Classic Watches">Classic Watches</option>
          <option value="Smart Watches">Smart Watches</option>
          <option value="Heritage Watches">Heritage Watches</option>
          <option value="Limited Editions">Limited Editions</option>
        </select>

        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="bg-[#141418] border border-stone-800 text-xs text-stone-200 px-3 py-2 rounded-lg outline-none"
        >
          <option value="All">All Brands</option>
          <option value="Rolex">Rolex</option>
          <option value="Patek Philippe">Patek Philippe</option>
          <option value="Omega">Omega</option>
          <option value="Cartier">Cartier</option>
          <option value="Audemars Piguet">Audemars Piguet</option>
          <option value="Vacheron Constantin">Vacheron Constantin</option>
          <option value="IWC Schaffhausen">IWC Schaffhausen</option>
          <option value="Breitling">Breitling</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-[#0D0D11] border border-stone-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111115] border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Watch Reference</th>
                <th className="py-4 px-4">Brand / Category</th>
                <th className="py-4 px-4">SKU</th>
                <th className="py-4 px-4">Price (₹)</th>
                <th className="py-4 px-4">Stock</th>
                <th className="py-4 px-4">Attributes</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-900">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-stone-400">Loading catalog...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-stone-500">No matching watches found.</td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod._id} className="hover:bg-stone-900/40 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#141418] rounded-lg p-1 shrink-0 border border-stone-800">
                          <img src={prod.images?.[0]} alt={prod.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <p className="font-semibold text-white line-clamp-1">{prod.name}</p>
                          <span className="text-[10px] text-stone-500">{prod.collectionName || 'Standard'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#D4AF37]">{prod.brand}</p>
                      <p className="text-[10px] text-stone-400">{prod.category}</p>
                    </td>

                    <td className="py-3 px-4 font-mono text-stone-300">
                      {prod.sku}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-serif font-bold text-white text-sm">
                        {formatPrice(prod.price)}
                      </span>
                      {prod.discountPercentage > 0 && (
                        <span className="block text-[10px] text-[#D4AF37]">
                          -{prod.discountPercentage}%
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          prod.stock <= 3
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : prod.stock <= 10
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {prod.stock} in vault
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {prod.isFeatured && (
                          <span className="px-1.5 py-0.5 text-[9px] bg-[#D4AF37]/20 text-[#D4AF37] rounded">
                            Featured
                          </span>
                        )}
                        {prod.isBestSeller && (
                          <span className="px-1.5 py-0.5 text-[9px] bg-blue-950 text-blue-300 rounded">
                            Best
                          </span>
                        )}
                        {prod.isNewArrival && (
                          <span className="px-1.5 py-0.5 text-[9px] bg-emerald-950 text-emerald-300 rounded">
                            New
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/product/${prod.slug || prod._id}`}
                          target="_blank"
                          className="p-1.5 text-stone-400 hover:text-white bg-stone-900 rounded-lg"
                          title="View on site"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/admin/products/edit/${prod._id}`}
                          className="p-1.5 text-stone-400 hover:text-[#D4AF37] bg-stone-900 rounded-lg"
                          title="Edit Product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(prod._id, prod.name)}
                          className="p-1.5 text-stone-400 hover:text-rose-400 bg-stone-900 rounded-lg"
                          title="Delete Product"
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
