import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Globe,
  Award,
  Gem,
  Send,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Heart,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';
import { validateEmail } from '../utils/validation';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { showToast } = useToast();
  const { settings } = useSettings();

  const handleSubscribe = (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError('');
    showToast(`Thank you for subscribing to ${settings?.storeName || 'TICKING'} Gazette!`, 'success');
    setEmail('');
  };

  return (
    <footer className="w-full bg-[#060608] border-t border-stone-800/80 text-stone-300">
      {/* 4 Value Proposition Pillars (from Reference Image 5) */}
      <div className="border-b border-stone-900 bg-[#08080A]/60 py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] font-bold text-[#F3E5AB]">
                100% AUTHENTIC
              </h4>
              <p className="text-[12px] text-stone-400 mt-0.5 leading-snug">
                Every watch is 100% authentic and comes with original box & papers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] font-bold text-[#F3E5AB]">
                WORLDWIDE SHIPPING
              </h4>
              <p className="text-[12px] text-stone-400 mt-0.5 leading-snug">
                Free and secure insured delivery to over 100+ countries worldwide.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] font-bold text-[#F3E5AB]">
                EXTENDED WARRANTY
              </h4>
              <p className="text-[12px] text-stone-400 mt-0.5 leading-snug">
                Up to 5 years comprehensive international warranty on all timepieces.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 flex items-center justify-center shrink-0">
              <Gem className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] font-bold text-[#F3E5AB]">
                EXPERT SUPPORT
              </h4>
              <p className="text-[12px] text-stone-400 mt-0.5 leading-snug">
                Our certified master horologists and concierges are at your service.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand Identity Column */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 border border-[#D4AF37] flex items-center justify-center bg-black shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <span className="font-serif text-[#D4AF37] text-xl font-bold">
                  {settings?.storeName ? settings.storeName.charAt(0) : 'T'}
                </span>
              </div>
              <span className="font-serif text-base sm:text-lg tracking-[0.18em] sm:tracking-[0.22em] text-[#F3E5AB] font-bold uppercase group-hover:text-[#D4AF37] transition-colors">
                {settings?.storeName || 'TICKING LUXARY WATCH'}
              </span>
            </Link>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Timeless elegance. Precision perfection. Exceptional craftsmanship curated for discerning collectors who truly value time.
            </p>

            <div className="text-[11px] text-stone-400 flex flex-col gap-1 border-l-2 border-[#D4AF37]/50 pl-3">
              <p>
                <span className="text-stone-500 uppercase tracking-wider text-[10px] block">Concierge Desk:</span>
                <a href={`mailto:${settings?.supportEmail || 'ticking@gmail.com'}`} className="text-[#F3E5AB] hover:text-[#D4AF37] transition-colors">
                  {settings?.supportEmail || 'ticking@gmail.com'}
                </a>
              </p>
              <p>
                <span className="text-stone-500 uppercase tracking-wider text-[10px] block">Direct Boutique:</span>
                <a href={`tel:${settings?.phone || '9909225852'}`} className="text-[#F3E5AB] hover:text-[#D4AF37] transition-colors">
                  {settings?.phone || '9909225852'}
                </a>
              </p>
            </div>

            <div className="flex items-center gap-3 text-stone-400 mt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-stone-800 hover:border-[#D4AF37] flex items-center justify-center hover:text-[#D4AF37] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-stone-800 hover:border-[#D4AF37] flex items-center justify-center hover:text-[#D4AF37] transition-colors"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-stone-800 hover:border-[#D4AF37] flex items-center justify-center hover:text-[#D4AF37] transition-colors"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-stone-800 hover:border-[#D4AF37] flex items-center justify-center hover:text-[#D4AF37] transition-colors"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Col 2: SHOP */}
          <div>
            <h5 className="text-[11px] uppercase tracking-[0.2em] font-bold text-stone-200 mb-4">
              SHOP
            </h5>
            <ul className="flex flex-col gap-2.5 text-xs text-stone-400">
              <li>
                <Link to="/shop" className="hover:text-[#D4AF37] transition-colors">
                  All Watches
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=newest" className="hover:text-[#D4AF37] transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=popular" className="hover:text-[#D4AF37] transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Limited+Editions" className="hover:text-[#D4AF37] transition-colors">
                  Limited Editions
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Classic+Watches" className="hover:text-[#D4AF37] transition-colors">
                  Classic References
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: COLLECTIONS */}
          <div>
            <h5 className="text-[11px] uppercase tracking-[0.2em] font-bold text-stone-200 mb-4">
              COLLECTIONS
            </h5>
            <ul className="flex flex-col gap-2.5 text-xs text-stone-400">
              <li>
                <Link to="/collections" className="hover:text-[#D4AF37] transition-colors">
                  Classic Collection
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-[#D4AF37] transition-colors">
                  Sport Collection
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-[#D4AF37] transition-colors">
                  Luxury Collection
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-[#D4AF37] transition-colors">
                  Heritage Collection
                </Link>
              </li>
              <li>
                <Link to="/brands" className="hover:text-[#D4AF37] transition-colors">
                  Prestigious Houses
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: CUSTOMER CARE */}
          <div>
            <h5 className="text-[11px] uppercase tracking-[0.2em] font-bold text-stone-200 mb-4">
              CUSTOMER CARE
            </h5>
            <ul className="flex flex-col gap-2.5 text-xs text-stone-400">
              <li>
                <Link to="/contact" className="hover:text-[#D4AF37] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-[#D4AF37] transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#D4AF37] transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#D4AF37] transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#D4AF37] transition-colors">
                  Authenticity FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: NEWSLETTER */}
          <div className="flex flex-col gap-3">
            <h5 className="text-[11px] uppercase tracking-[0.2em] font-bold text-stone-200">
              NEWSLETTER
            </h5>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Subscribe to receive exclusive private previews, vault releases, and horological editorial updates.
            </p>
            <form onSubmit={handleSubscribe} noValidate className="relative flex flex-col gap-1.5 mt-2">
              <div className="relative flex items-center">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  className={`w-full bg-[#111114] border ${
                    emailError ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
                  } text-xs text-white px-3.5 py-2.5 pr-10 rounded-lg outline-none transition-colors placeholder:text-stone-600`}
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-1 w-8 h-8 bg-[#D4AF37] hover:bg-[#E5C378] text-black rounded flex items-center justify-center transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {emailError && (
                <p className="flex items-center gap-1.5 text-rose-400 text-[11px] px-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{emailError}</span>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar matching Image 5 and prompt requirements */}
      <div className="border-t border-stone-900 bg-[#040405] py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center">
            <span>© 2026 {settings?.storeName || 'TICKING LUXARY WATCH'}. All Rights Reserved.</span>
            <span className="hidden sm:inline text-stone-700">|</span>
            <span className="text-stone-400">© Copyright 2026 Online Wellness And Booking LLC, All Rights Reserved</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-[#D4AF37] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#D4AF37] transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookie" className="hover:text-[#D4AF37] transition-colors">
              Cookie Policy
            </Link>
          </div>
          <div className="flex items-center gap-1 text-stone-500">
            <span>Designed with</span>
            <Heart className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
            <span>for watch lovers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
