import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function BrandCard({ brand, index }) {
  if (!brand) return null;

  const numberStr = brand.number || (index < 9 ? `0${index + 1}` : `${index + 1}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative bg-[#0E0E11]/90 border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 rounded-xl p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.15)]"
    >
      {/* Top Row: Brand Monogram/Name and Gold Number */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-serif text-2xl tracking-[0.2em] font-bold text-stone-100 group-hover:text-[#F3E5AB] transition-colors">
            {brand.name.toUpperCase()}
          </h3>
          {brand.tagline && (
            <p className="text-[10px] tracking-wider text-[#D4AF37] uppercase mt-1 font-medium line-clamp-1">
              {brand.tagline}
            </p>
          )}
        </div>
        <span className="font-serif italic text-2xl text-[#D4AF37]/60 font-semibold select-none group-hover:text-[#D4AF37] transition-colors">
          {numberStr}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-stone-400 leading-relaxed my-6 line-clamp-3">
        {brand.description}
      </p>

      {/* Bottom Row: Since & Country + Explore Brand Link */}
      <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between">
        <span className="text-[11px] text-stone-500 font-medium tracking-wider">
          Since {brand.foundedYear || 1905} • {brand.country || 'Switzerland'}
        </span>

        <Link
          to={`/brands/${brand.slug || brand.name.toLowerCase().replace(/\s+/g, '-')}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#D4AF37] group-hover:text-[#F3E5AB] transition-colors group-hover:translate-x-1 duration-200"
        >
          <span>Explore Brand</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
