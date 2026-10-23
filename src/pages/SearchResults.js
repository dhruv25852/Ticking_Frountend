import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('featured');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(query)}&sort=${sort}`);
        setProducts(res.products || []);
        setTotal(res.total || 0);
      } catch (err) {
        console.error('Failed to search watches:', err);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    } else {
      setProducts([]);
      setTotal(0);
      setLoading(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [query, sort]);

  return (
    <div className="w-full bg-[#080809] min-h-screen text-stone-200 py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-left border-b border-stone-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
              DYNAMIC CATALOG SEARCH
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
              Search Results for <span className="text-[#F3E5AB]">"{query}"</span>
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Found {total} matching timepiece {total === 1 ? 'reference' : 'references'}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400">Sort By:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-[#141418] border border-stone-800 focus:border-[#D4AF37] text-xs text-stone-200 px-3 py-2 rounded-lg outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 rounded-2xl bg-[#101013] border border-stone-800 animate-pulse"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-[#0E0E12] border border-stone-800 rounded-2xl p-8 max-w-lg mx-auto">
            <Search className="w-12 h-12 text-[#D4AF37]/50 mx-auto mb-4" />
            <h3 className="font-serif text-2xl font-bold text-white mb-2">No Matching References</h3>
            <p className="text-xs text-stone-400 mb-6 leading-relaxed">
              We couldn't find any watches matching "{query}". Try searching for brands like "Rolex", "Cartier", or styles like "Sports" or "Chronograph".
            </p>
            <Link
              to="/shop"
              className="px-6 py-2.5 bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-wider rounded-full"
            >
              Browse Complete Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
