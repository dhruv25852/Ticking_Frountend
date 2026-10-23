import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Globe, Award, Gem, Sparkles } from 'lucide-react';
import api from '../services/api';
import BrandCard from '../components/BrandCard';

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await api.get('/brands');
        setBrands(data || []);
      } catch (err) {
        console.error('Failed to load brands:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full bg-[#080809] min-h-screen text-stone-200 py-16 px-4 sm:px-8 relative overflow-hidden">
      {/* Background Gold Shimmer / Dust Effect from Image 3 */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[radial-gradient(circle,_rgba(212,175,55,0.12)_0%,_transparent_70%)] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,_rgba(212,175,55,0.12)_0%,_transparent_70%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Title Header matching Image 3 */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
              OUR PRESTIGIOUS BRANDS
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white tracking-tight">
            Icons of Excellence
          </h1>

          <p className="text-xs sm:text-sm text-stone-400 font-light mt-4 leading-relaxed">
            Discover the world's most distinguished watchmaking houses, each with a legacy of innovation, precision, and timeless elegance.
          </p>
        </div>

        {/* Brands Grid (2x4 Cards from Image 3) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-[#101013] border border-stone-800 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {brands.map((brand, idx) => (
              <BrandCard key={brand._id || idx} brand={brand} index={idx} />
            ))}
          </div>
        )}

        {/* Bottom Guarantee Banner from Image 3 */}
        <div className="mt-20 p-8 bg-[#0C0C0F] border border-[#D4AF37]/30 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/40 flex items-center justify-center shrink-0 text-[#D4AF37]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-[#F3E5AB]">
                AUTHENTIC GUARANTEE
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">100% Authentic Watches</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/40 flex items-center justify-center shrink-0 text-[#D4AF37]">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-[#F3E5AB]">
                WORLDWIDE DELIVERY
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">Secure & Insured Shipping</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/40 flex items-center justify-center shrink-0 text-[#D4AF37]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-[#F3E5AB]">
                EXTENDED WARRANTY
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">Up to 5 Years Coverage</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/40 flex items-center justify-center shrink-0 text-[#D4AF37]">
              <Gem className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-[#F3E5AB]">
                EXPERT SUPPORT
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">Dedicated to You</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
