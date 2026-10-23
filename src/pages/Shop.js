import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  RotateCcw,
  Search,
  Check,
  Star
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [brand, setBrand] = useState(searchParams.get('brand') || 'All');
  const [gender, setGender] = useState(searchParams.get('gender') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'featured');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Sync state with URL params
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategory(cat);
    const brd = searchParams.get('brand');
    if (brd) setBrand(brd);
    const gen = searchParams.get('gender');
    if (gen) setGender(gen);
    const s = searchParams.get('search');
    if (s) setSearch(s);
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set('search', search);
      if (category && category !== 'All') queryParams.set('category', category);
      if (brand && brand !== 'All') queryParams.set('brand', brand);
      if (gender && gender !== 'All') queryParams.set('gender', gender);
      if (minPrice) queryParams.set('minPrice', minPrice);
      if (maxPrice) queryParams.set('maxPrice', maxPrice);
      if (inStock) queryParams.set('inStock', 'true');
      if (rating) queryParams.set('rating', rating);
      if (sort) queryParams.set('sort', sort);
      queryParams.set('page', page);
      queryParams.set('limit', 12);

      const res = await api.get(`/products?${queryParams.toString()}`);
      setProducts(res.products || []);
      setTotal(res.total || 0);
      setTotalPages(res.pages || 1);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, brand, gender, minPrice, maxPrice, inStock, rating, sort, page, search]);

  const resetFilters = () => {
    setCategory('All');
    setBrand('All');
    setGender('All');
    setMinPrice('');
    setMaxPrice('');
    setInStock(false);
    setRating('');
    setSort('featured');
    setSearch('');
    setPage(1);
    setSearchParams({});
  };

  const categories = [
    'All',
    'Luxury Watches',
    'Classic Watches',
    'Sports Watches',
    'Smart Watches',
    'Heritage Watches',
    'Limited Editions'
  ];

  const brandsList = [
    'All',
    'Rolex',
    'Patek Philippe',
    'Omega',
    'Cartier',
    'Audemars Piguet',
    'Vacheron Constantin',
    'IWC Schaffhausen',
    'Breitling',
    'A. Lange & Söhne',
    'TAG Heuer'
  ];

  const gendersList = ['All', "Men's", "Women's", 'Unisex'];

  return (
    <div className="w-full bg-[#080809] min-h-screen text-stone-200 py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Breadcrumb & Title */}
        <div className="mb-10 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37] mb-1">
            HAUTE HORLOGERIE TIMEPIECES
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
            Curated Watch Catalog
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-2 font-light">
            Showing {total} certified Swiss & luxury masterpieces available for immediate dispatch.
          </p>
        </div>

        {/* Mobile Filter Toggle & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#101013] border border-stone-800 rounded-xl mb-8">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-wider rounded-lg"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="text-xs text-stone-400 hidden sm:block">
            Showing <span className="text-[#F3E5AB] font-bold">{products.length}</span> of <span className="text-[#F3E5AB] font-bold">{total}</span> timepieces
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-stone-400 hidden md:inline">Sort By:</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="bg-[#17171C] border border-stone-800 focus:border-[#D4AF37] text-xs text-stone-200 px-3 py-2 rounded-lg outline-none cursor-pointer"
            >
              <option value="featured">Featured Watches</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR FILTERS (Desktop & Mobile Drawer) */}
          <aside
            className={`lg:col-span-1 flex flex-col gap-6 bg-[#0E0E12] border border-stone-800/80 p-6 rounded-2xl h-fit ${
              mobileFilterOpen
                ? 'fixed inset-0 z-50 overflow-y-auto bg-[#0E0E12] p-8 m-0 rounded-none'
                : 'hidden lg:flex'
            }`}
          >
            {/* Mobile Close Button */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-4 lg:hidden">
              <span className="font-serif text-lg font-bold text-white">Filter Catalog</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter Title & Reset */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#D4AF37]">
                Refine Selection
              </span>
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-[#D4AF37] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Keyword Search Filter */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-semibold mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Model, reference..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-[#15151A] border border-stone-800 focus:border-[#D4AF37] text-xs text-white pl-9 pr-3 py-2 rounded-lg outline-none"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-semibold mb-2">
                Category
              </label>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setPage(1);
                    }}
                    className={`text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-between ${
                      category === cat
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-semibold border border-[#D4AF37]/30'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
                    }`}
                  >
                    <span>{cat}</span>
                    {category === cat && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-semibold mb-2">
                Brand
              </label>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                {brandsList.map((brd) => (
                  <button
                    key={brd}
                    onClick={() => {
                      setBrand(brd);
                      setPage(1);
                    }}
                    className={`text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-between ${
                      brand === brd
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-semibold border border-[#D4AF37]/30'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
                    }`}
                  >
                    <span>{brd}</span>
                    {brand === brd && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-semibold mb-2">
                Gender
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {gendersList.map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      setGender(g);
                      setPage(1);
                    }}
                    className={`text-xs py-1.5 px-2 rounded-lg text-center transition-colors ${
                      gender === g
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-semibold border border-[#D4AF37]/30'
                        : 'bg-[#15151A] text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter (in Indian Rupees ₹) */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-semibold mb-2">
                Price Range (₹)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-[#15151A] border border-stone-800 text-xs text-white px-2.5 py-1.5 rounded-lg outline-none focus:border-[#D4AF37]"
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-[#15151A] border border-stone-800 text-xs text-white px-2.5 py-1.5 rounded-lg outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* In Stock Toggle */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-stone-300 font-medium">In Stock Only</span>
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => {
                  setInStock(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
              />
            </div>

            {/* Mobile Apply Button */}
            {mobileFilterOpen && (
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full mt-4 py-3 bg-[#D4AF37] text-black font-bold uppercase tracking-wider text-xs rounded-xl"
              >
                Apply Filters ({total} found)
              </button>
            )}
          </aside>

          {/* MAIN PRODUCT GRID */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 rounded-2xl bg-[#111114] animate-pulse border border-stone-800"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-[#101013] border border-stone-800 rounded-2xl p-8">
                <h3 className="font-serif text-2xl font-bold text-white mb-2">No Timepieces Found</h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto mb-6">
                  No watches match your selected filter criteria. Try adjusting or clearing your filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-wider rounded-full"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    {[...Array(totalPages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setPage(pageNum);
                            window.scrollTo({ top: 150, behavior: 'smooth' });
                          }}
                          className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all ${
                            page === pageNum
                              ? 'bg-[#D4AF37] text-black font-bold'
                              : 'bg-[#121216] border border-stone-800 text-stone-300 hover:border-[#D4AF37]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
