import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Shield,
  Gem,
  Award,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Star,
  Quote
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import BrandCard from '../components/BrandCard';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [activeTab, setActiveTab] = useState('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feat, newArr, best, brds] = await Promise.all([
          api.get('/products/special/featured').catch(() => []),
          api.get('/products/special/new-arrivals').catch(() => []),
          api.get('/products/special/best-sellers').catch(() => []),
          api.get('/brands').catch(() => [])
        ]);
        setFeaturedProducts(feat);
        setNewArrivals(newArr);
        setBestSellers(best);
        setBrands(brds);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeProducts =
    activeTab === 'featured'
      ? featuredProducts
      : activeTab === 'new'
      ? newArrivals
      : bestSellers;

  return (
    <div className="w-full flex flex-col bg-[#080809] text-stone-200 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden border-b border-stone-800/60 bg-gradient-to-b from-[#0F0E13] via-[#0A0A0C] to-[#080809]">
        {/* Background Ambient Golden Light Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none"></div>

        {/* Subtle Luxury Pattern Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 flex flex-col items-start gap-6 text-left"
          >
            {/* Top Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#F3E5AB]">
                Geneva • Le Brassus • Haute Horlogerie
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-stone-100 leading-[1.08]">
              Where Precision <br />
              <span className="italic font-light text-gold-gradient">Meets Eternity.</span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-stone-400 font-light max-w-xl leading-relaxed">
              Discover the pinnacle of Swiss mechanical watchmaking. Masterpieces crafted with unyielding patience, 18K gold, and centuries of horological heritage.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/shop"
                className="px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#F3E5AB] hover:to-[#D4AF37] text-black font-semibold text-xs uppercase tracking-[0.2em] rounded-full shadow-[0_4px_25px_rgba(212,175,55,0.3)] transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>Shop Timepieces</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/collections"
                className="px-8 py-3.5 border border-[#D4AF37]/40 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 text-stone-200 hover:text-white font-medium text-xs uppercase tracking-[0.2em] rounded-full transition-all"
              >
                Explore Collections
              </Link>
            </div>

            {/* Trust Micro-Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-stone-800/80 w-full max-w-lg">
              <div>
                <p className="font-serif text-2xl font-bold text-[#F3E5AB]">100%</p>
                <p className="text-[11px] text-stone-500 uppercase tracking-wider mt-0.5">Authentic Certified</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-[#F3E5AB]">5 Years</p>
                <p className="text-[11px] text-stone-500 uppercase tracking-wider mt-0.5">Global Warranty</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-[#F3E5AB]">₹0</p>
                <p className="text-[11px] text-stone-500 uppercase tracking-wider mt-0.5">Insured Shipping</p>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Image Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-md aspect-square rounded-3xl p-6 bg-radial from-[#1A1820]/60 to-transparent flex items-center justify-center">
              {/* Rotating decorative dial ring */}
              <div className="absolute inset-4 rounded-full border border-[#D4AF37]/20 border-dashed animate-[spin_60s_linear_infinite] pointer-events-none"></div>
              <div className="absolute inset-10 rounded-full border border-[#D4AF37]/10 pointer-events-none"></div>

              {/* High-res Hero Watch Artwork */}
              <img
                src="/images/watches/submariner.jpg"
                alt="Rolex Submariner Masterpiece"
                className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] transform hover:scale-105 transition-transform duration-700"
              />

              {/* Floating Highlight Card */}
              <div className="absolute -bottom-4 -left-4 z-20 bg-[#121216]/95 border border-[#D4AF37]/40 rounded-xl p-3.5 backdrop-blur-md shadow-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest">Master Chronometer</p>
                  <p className="text-xs font-bold text-white font-serif">Calibre 3235 Perpetual</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. ABOUT OUR CRAFT (Exact Recreation of Reference Image 1) */}
      <section className="relative py-24 px-4 sm:px-8 border-b border-stone-800/60 bg-[#070709]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text / Story */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-left">
            <div className="flex items-center gap-2">
              <div className="w-6 h-[1px] bg-[#D4AF37]"></div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
                ABOUT OUR CRAFT
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
              Where Time <br />
              <span className="italic font-light text-gold-gradient">Becomes Art.</span>
            </h2>

            <p className="font-serif italic text-lg sm:text-xl text-[#F3E5AB]/90 leading-relaxed font-light">
              Every masterpiece begins with precision, patience, and passion.
            </p>

            <p className="text-sm text-stone-400 font-light leading-relaxed">
              We celebrate the timeless art of watchmaking by creating exceptional timepieces that embody <span className="text-stone-200 italic">elegance</span>, <span className="text-stone-200 italic">craftsmanship</span>, and enduring <span className="text-stone-200 italic">luxury</span>.
            </p>

            {/* 4 Feature Badges from Image 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-stone-800">
              <div className="flex flex-col items-center text-center p-3 bg-[#0E0E12] border border-[#D4AF37]/20 rounded-xl">
                <Gem className="w-6 h-6 text-[#D4AF37] mb-2" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-200">
                  Finest Craftsmanship
                </span>
              </div>

              <div className="flex flex-col items-center text-center p-3 bg-[#0E0E12] border border-[#D4AF37]/20 rounded-xl">
                <Shield className="w-6 h-6 text-[#D4AF37] mb-2" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-200">
                  Timeless Design
                </span>
              </div>

              <div className="flex flex-col items-center text-center p-3 bg-[#0E0E12] border border-[#D4AF37]/20 rounded-xl">
                <Clock className="w-6 h-6 text-[#D4AF37] mb-2" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-200">
                  Precision Engineered
                </span>
              </div>

              <div className="flex flex-col items-center text-center p-3 bg-[#0E0E12] border border-[#D4AF37]/20 rounded-xl">
                <Award className="w-6 h-6 text-[#D4AF37] mb-2" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-200">
                  Enduring Luxury
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37] hover:text-[#F3E5AB] transition-colors group"
              >
                <span>Discover Our Heritage</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Image: Macro Watchmaker Craftsmanship from user-provided image 1 */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl group">
              <img
                src="/images/watches/movement_craft.jpg"
                alt="Swiss Haute Horlogerie tourbillon skeleton watch movement"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-black/60 backdrop-blur-md rounded-xl border border-stone-800">
                <p className="text-xs font-serif italic text-stone-300">
                  "In the stillness of the atelier, thousands of micro-components converge into immortal harmony."
                </p>
                <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest mt-1">
                  Geneva Atelier • Master Horologist
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR PRESTIGIOUS BRANDS / ICONS OF EXCELLENCE (Matches Reference Image 3) */}
      <section className="py-24 px-4 sm:px-8 border-b border-stone-800/60 bg-[#0A0A0C]">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center mb-14">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37] mb-2">
            OUR PRESTIGIOUS BRANDS
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white">
            Icons of Excellence
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 font-light max-w-xl mt-3 leading-relaxed">
            Discover the world's most distinguished watchmaking houses, each with a legacy of innovation, precision, and timeless elegance.
          </p>
        </div>

        {/* Brand Grid (2x4 Grid matching Image 3) */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {brands.map((brand, idx) => (
            <BrandCard key={brand._id || idx} brand={brand} index={idx} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/brands"
            className="inline-flex items-center gap-2 px-8 py-3 border border-[#D4AF37]/50 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 text-stone-200 hover:text-white rounded-full text-xs font-semibold uppercase tracking-[0.2em] transition-all"
          >
            <span>View All Prestigious Houses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. FEATURED TIMEPIECES CATALOG (Matches Reference Image 4) */}
      <section className="py-24 px-4 sm:px-8 border-b border-stone-800/60 bg-[#080809]">
        <div className="max-w-7xl mx-auto">
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
                CURATED COLLECTION
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-1">
                Featured Timepieces
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 p-1 bg-[#121215] border border-stone-800 rounded-full">
              <button
                onClick={() => setActiveTab('featured')}
                className={`px-5 py-2 text-xs uppercase tracking-wider font-semibold rounded-full transition-all ${
                  activeTab === 'featured'
                    ? 'bg-[#D4AF37] text-black shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Featured
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`px-5 py-2 text-xs uppercase tracking-wider font-semibold rounded-full transition-all ${
                  activeTab === 'new'
                    ? 'bg-[#D4AF37] text-black shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                New Arrivals
              </button>
              <button
                onClick={() => setActiveTab('best')}
                className={`px-5 py-2 text-xs uppercase tracking-wider font-semibold rounded-full transition-all ${
                  activeTab === 'best'
                    ? 'bg-[#D4AF37] text-black shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Best Sellers
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeProducts.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <div className="text-center mt-14">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#F3E5AB] hover:to-[#D4AF37] text-black font-semibold text-xs uppercase tracking-[0.2em] rounded-full shadow-[0_4px_20px_rgba(212,175,55,0.25)] transition-all"
            >
              <span>Explore Complete Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. PROMOTIONAL VAULT ACCESS BANNER */}
      <section className="py-20 px-4 sm:px-8 bg-gradient-to-r from-[#14120E] via-[#1B1710] to-[#121115] border-b border-stone-800/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/15 to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="flex flex-col gap-3 text-left max-w-2xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
              LIMITED PRIVILEGE OFFER
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Complimentary Bespoke Winder & 10% Off
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
              Use code <span className="font-mono font-bold text-[#F3E5AB] bg-black/60 px-2 py-0.5 rounded border border-[#D4AF37]/40">ROYAL10</span> at checkout to unlock 10% VIP concession on selected haute horlogerie orders, complete with Swiss-made rotating watch winder.
            </p>
          </div>

          <Link
            to="/shop"
            className="shrink-0 px-8 py-4 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-full transition-all shadow-xl"
          >
            Claim Privilege Offer
          </Link>
        </div>
      </section>

      {/* 6. CONNOISSEUR TESTIMONIALS */}
      <section className="py-24 px-4 sm:px-8 border-b border-stone-800/60 bg-[#09090C]">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
            TESTIMONIALS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
            Voices of Connoisseurs
          </h2>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#111114] border border-[#D4AF37]/20 rounded-2xl p-8 flex flex-col justify-between">
            <Quote className="w-8 h-8 text-[#D4AF37]/40 mb-4" />
            <p className="font-serif italic text-sm text-stone-300 leading-relaxed">
              "Acquiring my Rolex Daytona from TICKING was an unmatched experience. The provenance papers, white-glove security delivery, and attention to detail reflect true Swiss luxury."
            </p>
            <div className="pt-6 border-t border-stone-800/80 mt-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Vikramaditya S.</p>
                <p className="text-[10px] text-stone-500">Collector, Mumbai</p>
              </div>
              <div className="flex text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-[#D4AF37]" />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#111114] border border-[#D4AF37]/20 rounded-2xl p-8 flex flex-col justify-between">
            <Quote className="w-8 h-8 text-[#D4AF37]/40 mb-4" />
            <p className="font-serif italic text-sm text-stone-300 leading-relaxed">
              "The Nautilus was sourced in immaculate condition. The horological authenticity guarantee gave me complete peace of mind. TICKING is now my only destination."
            </p>
            <div className="pt-6 border-t border-stone-800/80 mt-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Lord Julian Sterling</p>
                <p className="text-[10px] text-stone-500">London, UK</p>
              </div>
              <div className="flex text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-[#D4AF37]" />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#111114] border border-[#D4AF37]/20 rounded-2xl p-8 flex flex-col justify-between">
            <Quote className="w-8 h-8 text-[#D4AF37]/40 mb-4" />
            <p className="font-serif italic text-sm text-stone-300 leading-relaxed">
              "From the boutique concierge team to the speed of dispatch to Bengaluru, every step was tailored to perfection. A truly royal buying journey."
            </p>
            <div className="pt-6 border-t border-stone-800/80 mt-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Arjun Mehra</p>
                <p className="text-[10px] text-stone-500">Bengaluru, India</p>
              </div>
              <div className="flex text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-[#D4AF37]" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
