import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function Collections() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await api.get('/categories');
        setCategories(data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const collectionHero = [
    {
      name: 'Luxury Watches',
      tagline: 'Haute Horlogerie Masterpieces',
      desc: 'Complications sculpted in solid 18K yellow gold, rose gold, and 950 platinum with hand-finished bevels.',
      image: '/images/watches/nautilus.jpg',
      categoryQuery: 'Luxury Watches'
    },
    {
      name: 'Sports Watches',
      tagline: 'High-Performance Instruments',
      desc: 'Engineered for extreme ocean depths, chronometric endurance, and ceramic bezel resilience.',
      image: '/images/watches/submariner.jpg',
      categoryQuery: 'Sports Watches'
    },
    {
      name: 'Classic Watches',
      tagline: 'Timeless Dress Silhouettes',
      desc: 'Refined dials with Roman numerals, blued sword hands, and ultra-thin automatic calibres.',
      image: '/images/watches/datejust.jpg',
      categoryQuery: 'Classic Watches'
    },
    {
      name: 'Heritage Watches',
      tagline: 'Historic Milestones',
      desc: 'Homages to moon landings, aviation circular slide rules, and historical ocean explorations.',
      image: '/images/watches/speedmaster.jpg',
      categoryQuery: 'Heritage Watches'
    },
    {
      name: 'Smart Watches',
      tagline: 'Connected Swiss Artistry',
      desc: 'Luxury titanium cases housing advanced OLED high-res screens and connected sports telemetry.',
      image: '/images/watches/tag_connected.jpg',
      categoryQuery: 'Smart Watches'
    },
    {
      name: 'Limited Editions',
      tagline: 'Vault Numbered References',
      desc: 'Strictly allocated, numbered collector items produced in single-digit annual batches.',
      image: '/images/watches/lange_1815.jpg',
      categoryQuery: 'Limited Editions'
    }
  ];

  return (
    <div className="w-full bg-[#080809] min-h-screen text-stone-200 py-16 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
              CURATED DOMAINS
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white tracking-tight">
            The Collections
          </h1>

          <p className="text-xs sm:text-sm text-stone-400 font-light mt-3 leading-relaxed">
            Explore dedicated thematic chapters of haute horlogerie, categorized by mechanical complication, case geometry, and intended lifestyle.
          </p>
        </div>

        {/* Collections Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collectionHero.map((item, idx) => (
            <div
              key={idx}
              className="group relative bg-[#0E0E12] border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.15)]"
            >
              <div className="relative h-64 overflow-hidden bg-gradient-to-b from-[#141418] to-[#0A0A0C] flex items-center justify-center p-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] via-transparent to-transparent"></div>
              </div>

              <div className="p-6 flex flex-col gap-2 flex-1 justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                    {item.tagline}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-white mt-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-stone-400 font-light mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-800/80 mt-4">
                  <Link
                    to={`/shop?category=${encodeURIComponent(item.categoryQuery)}`}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#D4AF37] group-hover:text-[#F3E5AB] transition-colors"
                  >
                    <span>Explore {item.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
