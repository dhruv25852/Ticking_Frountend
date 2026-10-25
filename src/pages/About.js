import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  Gem,
  Clock,
  Sparkles,
  ArrowRight,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function About() {
  const { settings } = useSettings();
  const storeName = settings?.storeName || 'TICKING LUXARY WATCH';

  return (
    <div className="w-full bg-[#080809] min-h-screen text-stone-200 py-16 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-24">
        {/* HERO CRAFTSMANSHIP (Matches Image 1) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
                ABOUT OUR CRAFT
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white leading-tight">
              Where Time <br />
              <span className="italic font-light text-gold-gradient">Becomes Art.</span>
            </h1>

            <p className="font-serif italic text-lg sm:text-xl text-[#F3E5AB]/90 font-light leading-relaxed">
              Every masterpiece begins with precision, patience, and passion.
            </p>

            <p className="text-sm text-stone-400 font-light leading-relaxed">
              We celebrate the timeless art of watchmaking by creating exceptional timepieces that embody <span className="text-white italic">elegance</span>, <span className="text-white italic">craftsmanship</span>, and enduring <span className="text-white italic">luxury</span>. Founded with a vision to preserve centuries of artisanal horology, {storeName} curates certified icons from the world's finest watchmaking houses.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-stone-800">
              <div className="flex flex-col items-center text-center p-3 bg-[#0E0E12] border border-[#D4AF37]/20 rounded-xl">
                <Gem className="w-6 h-6 text-[#D4AF37] mb-2" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-200">
                  Finest Craftsmanship
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-[#0E0E12] border border-[#D4AF37]/20 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-[#D4AF37] mb-2" />
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
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl">
              <img
                src="https://res.cloudinary.com/bjaodxyt/image/upload/v1792843443/movement_craft.jpg"
                alt="Swiss Haute Horlogerie skeleton tourbillon watch movement"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>

        {/* 3 PILLARS OF EXCELLENCE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#0E0E12] border border-[#D4AF37]/20 rounded-2xl p-8 flex flex-col gap-4 text-left">
            <span className="font-serif italic text-3xl text-[#D4AF37]">01</span>
            <h3 className="font-serif text-xl font-bold text-white">Provenance & Verification</h3>
            <p className="text-xs text-stone-400 font-light leading-relaxed">
              Every watch in our custody undergoes rigorous multi-point verification by certified master horologists. We examine serial numbers, movement tolerances, and case bevels against historical manufacture archives.
            </p>
          </div>

          <div className="bg-[#0E0E12] border border-[#D4AF37]/20 rounded-2xl p-8 flex flex-col gap-4 text-left">
            <span className="font-serif italic text-3xl text-[#D4AF37]">02</span>
            <h3 className="font-serif text-xl font-bold text-white">Curated Rarity</h3>
            <p className="text-xs text-stone-400 font-light leading-relaxed">
              We specialize in allocating high-demand references that represent the zenith of independent and heritage manufactures — from Patek Philippe Grand Complications to rare Rolex Oystersteel grails.
            </p>
          </div>

          <div className="bg-[#0E0E12] border border-[#D4AF37]/20 rounded-2xl p-8 flex flex-col gap-4 text-left">
            <span className="font-serif italic text-3xl text-[#D4AF37]">03</span>
            <h3 className="font-serif text-xl font-bold text-white">White-Glove Delivery</h3>
            <p className="text-xs text-stone-400 font-light leading-relaxed">
              Our insured international delivery service guarantees that your timepiece arrives in bespoke temperature-regulated security transit boxes, delivered directly into your hands with tamper-evident wax seals.
            </p>
          </div>
        </div>

        {/* CTA TO SHOP */}
        <div className="p-12 bg-gradient-to-r from-[#121116] via-[#1A1713] to-[#121116] border border-[#D4AF37]/30 rounded-3xl text-center flex flex-col items-center gap-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            Begin Your Horological Legacy
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl font-light">
            Explore our curated catalog of certified luxury timepieces, backed by our 5-year comprehensive international warranty.
          </p>
          <Link
            to="/shop"
            className="px-8 py-3.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-full transition-all"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
