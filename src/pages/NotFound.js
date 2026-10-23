import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="w-full bg-[#080809] min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 flex items-center justify-center text-[#D4AF37]">
          <Clock className="w-12 h-12" />
        </div>
      </div>

      <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
        404 ERROR • HOROLOGICAL VOID
      </span>

      <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white mt-2">
        Lost in Time
      </h1>

      <p className="text-xs sm:text-sm text-stone-400 max-w-md mt-3 mb-8 leading-relaxed font-light">
        The destination reference you are searching for does not exist or has been retired into historical manufacture archives.
      </p>

      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="px-8 py-3.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-semibold text-xs uppercase tracking-[0.2em] rounded-full transition-all shadow-xl"
        >
          Return to Sanctuary
        </Link>
        <Link
          to="/shop"
          className="px-8 py-3.5 border border-stone-800 hover:border-[#D4AF37] text-stone-300 hover:text-white text-xs uppercase tracking-[0.2em] rounded-full transition-all"
        >
          Browse Watches
        </Link>
      </div>
    </div>
  );
}
