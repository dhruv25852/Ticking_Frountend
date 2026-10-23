import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Award, Crown } from 'lucide-react';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatters';

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((data) => setStats(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const overview = stats?.overview || {};

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
          METRIC INTELLIGENCE
        </span>
        <h1 className="font-serif text-3xl font-bold text-white mt-0.5">
          Horological Performance Analytics
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Quarterly revenue acceleration, manufacture market shares, and collector lifetime values.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0D0D11] border border-stone-800 rounded-2xl p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Gross Revenue (FY 2026)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-serif text-3xl font-bold text-[#F3E5AB]">
            {formatPrice(overview.totalSales || 14200000)}
          </span>
          <p className="text-[10px] text-stone-500">Includes all confirmed international wire and online orders</p>
        </div>

        <div className="bg-[#0D0D11] border border-stone-800 rounded-2xl p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Average Order Value</span>
            <DollarSign className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <span className="font-serif text-3xl font-bold text-white">
            ₹18,40,000
          </span>
          <p className="text-[10px] text-stone-500">Benchmark luxury basket size</p>
        </div>

        <div className="bg-[#0D0D11] border border-stone-800 rounded-2xl p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Market Share Leader</span>
            <Crown className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <span className="font-serif text-3xl font-bold text-white">
            Rolex & Patek
          </span>
          <p className="text-[10px] text-stone-500">Represents 68% of gross turnover</p>
        </div>
      </div>

      {/* Brand Performance Breakdown */}
      <div className="bg-[#0D0D11] border border-stone-800/80 rounded-2xl p-6">
        <h3 className="font-serif text-xl font-bold text-white mb-6">Manufacture Turnover Allocation</h3>
        <div className="flex flex-col gap-4 text-xs">
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="font-semibold text-white">Rolex (Geneva)</span>
              <span className="font-mono text-[#F3E5AB]">₹68,50,000 (48%)</span>
            </div>
            <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: '48%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span className="font-semibold text-white">Patek Philippe (Geneva)</span>
              <span className="font-mono text-[#F3E5AB]">₹42,00,000 (30%)</span>
            </div>
            <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#B8860B] rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span className="font-semibold text-white">Audemars Piguet (Le Brassus)</span>
              <span className="font-mono text-[#F3E5AB]">₹18,90,000 (13%)</span>
            </div>
            <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#AA7C11] rounded-full" style={{ width: '13%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span className="font-semibold text-white">Omega & Cartier</span>
              <span className="font-mono text-[#F3E5AB]">₹12,60,000 (9%)</span>
            </div>
            <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden">
              <div className="h-full bg-stone-500 rounded-full" style={{ width: '9%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
