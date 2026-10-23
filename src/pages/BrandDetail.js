import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Gem,
  Infinity as InfinityIcon,
  Crown,
  Calendar,
  MapPin,
  User,
  Globe,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function BrandDetail() {
  const { slug } = useParams();
  const [brandData, setBrandData] = useState(null);
  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrand = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/brands/${slug}`);
        setBrandData(res.brand);
        setWatches(res.watches || []);
      } catch (err) {
        console.error('Failed to load brand details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrand();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080809] flex items-center justify-center text-stone-400">
        <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!brandData) {
    return (
      <div className="min-h-screen bg-[#080809] flex flex-col items-center justify-center text-stone-300 gap-4">
        <h2 className="font-serif text-3xl font-bold">Brand House Not Found</h2>
        <Link to="/brands" className="px-6 py-2 bg-[#D4AF37] text-black font-semibold rounded-full text-xs uppercase tracking-wider">
          Return to Prestigious Brands
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#080809] min-h-screen text-stone-200 py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation matching Image 2 */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-8">
          <Link to="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-700" />
          <Link to="/brands" className="hover:text-[#D4AF37] transition-colors">Brands</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-700" />
          <span className="text-[#D4AF37] font-medium">{brandData.name}</span>
        </div>

        {/* HERO SECTION FOR BRAND (Exact Recreation of Reference Image 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-14">
          {/* Left Column: Brand Emblem & Tagline */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center p-8 bg-[#0E0E12] border border-[#D4AF37]/30 rounded-2xl text-center">
            <Crown className="w-16 h-16 text-[#D4AF37] mb-3" />
            <h1 className="font-serif text-3xl font-bold tracking-[0.25em] text-white">
              {brandData.name.toUpperCase()}
            </h1>
            <p className="font-serif italic text-xs text-[#F3E5AB] mt-2 max-w-xs">
              "{brandData.tagline || 'A Crown for Every Achievement'}"
            </p>
            <div className="w-12 h-[1px] bg-[#D4AF37]/40 my-4"></div>
            <span className="text-[11px] uppercase tracking-widest text-stone-400">
              Since {brandData.foundedYear || 1905}
            </span>
          </div>

          {/* Center Column: The Brand Legacy Story */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left py-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37] mb-2">
              THE {brandData.name.toUpperCase()} LEGACY
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
              A Symbol of Prestige <br />
              and Performance
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 font-light mt-4 leading-relaxed">
              {brandData.description}
            </p>
          </div>

          {/* Right Column: Key Facts Card */}
          <div className="lg:col-span-3 bg-[#0E0E12] border border-[#D4AF37]/30 rounded-2xl p-6 flex flex-col gap-4 text-xs">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-stone-500 uppercase tracking-wider">FOUNDED</p>
                <p className="font-semibold text-stone-200 mt-0.5">{brandData.foundedYear || 1905}</p>
              </div>
            </div>

            <div className="border-t border-stone-800"></div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-stone-500 uppercase tracking-wider">HEADQUARTERS</p>
                <p className="font-semibold text-stone-200 mt-0.5">{brandData.headquarters || 'Geneva, Switzerland'}</p>
              </div>
            </div>

            <div className="border-t border-stone-800"></div>

            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-stone-500 uppercase tracking-wider">FOUNDER</p>
                <p className="font-semibold text-stone-200 mt-0.5">{brandData.founder || 'Hans Wilsdorf & Alfred Davis'}</p>
              </div>
            </div>

            <div className="border-t border-stone-800"></div>

            <div className="flex items-start gap-3">
              <Globe className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-stone-500 uppercase tracking-wider">PRESENCE</p>
                <p className="font-semibold text-stone-200 mt-0.5">{brandData.presence || 'Worldwide'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 STATS PILL ROW (from Image 2) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 p-6 bg-[#0B0B0D] border border-stone-800 rounded-2xl">
          {(brandData.stats && brandData.stats.length > 0 ? brandData.stats : [
            { value: '118+', label: 'YEARS OF EXCELLENCE', subtext: 'Pioneering the future of watchmaking' },
            { value: '500+', label: 'PATENTS', subtext: 'Innovations that have shaped the industry' },
            { value: '100%', label: 'SWISS MADE', subtext: 'Crafted with the highest Swiss standards' },
            { value: '#1', label: 'WATCH BRAND', subtext: 'Consistently ranked among the best in the world' }
          ]).map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-3">
              <span className="font-serif text-3xl font-bold text-[#F3E5AB]">{stat.value}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-200 mt-1">
                {stat.label}
              </span>
              <span className="text-[10px] text-stone-500 mt-0.5 hidden sm:inline">{stat.subtext}</span>
            </div>
          ))}
        </div>

        {/* HERITAGE & BRAND PROMISE SECTION (from Image 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16 p-8 bg-[#0D0D10] border border-stone-800/80 rounded-2xl">
          {/* Left: Heritage Narrative */}
          <div className="lg:col-span-5 flex flex-col gap-4 text-left">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
              OUR HERITAGE
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-snug">
              {brandData.heritageTitle || 'Built on Vision. Driven by Excellence.'}
            </h3>
            <p className="text-xs text-stone-400 font-light leading-relaxed">
              {brandData.heritageStory ||
                'From the invention of the Oyster case to the development of the Perpetual rotor, Rolex has been at the forefront of watchmaking innovation.'}
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#D4AF37] hover:underline mt-2"
            >
              <span>Explore Our History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Right: 4 Brand Promises */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(brandData.promises && brandData.promises.length > 0 ? brandData.promises : [
              { title: 'PRECISION', description: 'Unrivaled accuracy through rigorous testing.' },
              { title: 'RELIABILITY', description: 'Built to perform in demanding conditions.' },
              { title: 'CRAFTSMANSHIP', description: 'Exceptional attention to detail in every watch.' },
              { title: 'LEGACY', description: 'A timeless legacy passed down generations.' }
            ]).map((promise, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-4 bg-[#121216] border border-stone-800 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-[#D4AF37] mb-2" />
                <h4 className="text-[11px] uppercase font-bold tracking-wider text-white">
                  {promise.title}
                </h4>
                <p className="text-[10px] text-stone-400 mt-1 leading-snug">
                  {promise.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ICONIC COLLECTIONS BAR (from Image 2) */}
        {brandData.iconicCollections && brandData.iconicCollections.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
                ICONIC COLLECTIONS
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {brandData.iconicCollections.map((col, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#0F0F13] border border-stone-800 hover:border-[#D4AF37]/50 rounded-xl text-center flex flex-col justify-between transition-colors"
                >
                  <h4 className="text-xs uppercase font-bold tracking-wider text-stone-200">
                    {col.name}
                  </h4>
                  <p className="text-[10px] text-stone-500 mt-1 line-clamp-2">
                    {col.description}
                  </p>
                  <Link
                    to={`/shop?search=${encodeURIComponent(col.name)}`}
                    className="inline-flex items-center justify-center gap-1 text-[10px] uppercase font-semibold text-[#D4AF37] mt-3 hover:underline"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WATCHES FROM THIS BRAND */}
        <div>
          <div className="flex items-center justify-between mb-8 border-b border-stone-800 pb-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
                MANUFACTURE ARCHIVE
              </span>
              <h3 className="font-serif text-3xl font-bold text-white mt-1">
                {brandData.name} Timepieces
              </h3>
            </div>
            <Link
              to={`/shop?brand=${encodeURIComponent(brandData.name)}`}
              className="text-xs uppercase tracking-wider font-semibold text-[#D4AF37] hover:underline"
            >
              View Full Catalog ({watches.length})
            </Link>
          </div>

          {watches.length === 0 ? (
            <div className="text-center py-12 bg-[#0E0E12] rounded-xl border border-stone-800 text-stone-400">
              <p className="text-xs">All allocated pieces for this manufacture are currently reserved in our private vault.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {watches.map((watch) => (
                <ProductCard key={watch._id} product={watch} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
