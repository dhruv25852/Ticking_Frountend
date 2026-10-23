import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const inWishlist = isInWishlist(product._id);
  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : '/images/watches/hero_chronograph.jpg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative bg-[#111114] border border-[#222127] hover:border-[#D4AF37]/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.12)]"
    >
      {/* Top Badges (Discount, Best Seller, New Arrival) */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.discountPercentage > 0 && (
          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-[#D4AF37] text-black rounded-md shadow-md">
            -{product.discountPercentage}%
          </span>
        )}
        {product.isNewArrival && (
          <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 rounded-md">
            New
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        aria-label="Toggle Wishlist"
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          inWishlist
            ? 'bg-[#D4AF37] text-black shadow-lg scale-105'
            : 'bg-black/50 backdrop-blur-md text-stone-300 hover:text-white hover:bg-black/80 border border-stone-800'
        }`}
      >
        <Heart className={`w-4 h-4 ${inWishlist ? 'fill-black' : ''}`} />
      </button>

      {/* Watch Image Stage */}
      <Link
        to={`/product/${product.slug || product._id}`}
        className="relative block w-full pt-[90%] bg-gradient-to-b from-[#17171C]/50 to-[#0C0C0F] overflow-hidden group-hover:bg-[#15151A] transition-colors"
      >
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Hover Action Overlay */}
        <div className="absolute inset-x-0 bottom-3 px-4 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product, 1);
            }}
            className="flex-1 py-2 px-3 bg-[#D4AF37] hover:bg-[#E5C378] text-black text-[11px] font-bold tracking-wider uppercase rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Bag</span>
          </button>
          <div className="p-2 bg-stone-900/90 text-stone-300 hover:text-white rounded-lg border border-stone-700">
            <Eye className="w-3.5 h-3.5" />
          </div>
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-5 flex flex-col gap-2 flex-1 justify-between border-t border-stone-900/80 bg-[#0F0F12]">
        <div>
          {/* Brand & Collection */}
          <div className="flex items-center justify-between text-[11px] tracking-[0.15em] uppercase font-semibold text-[#D4AF37]">
            <span>{product.brand}</span>
            {product.collectionName && (
              <span className="text-stone-500 text-[10px] lowercase italic">{product.collectionName}</span>
            )}
          </div>

          {/* Product Name */}
          <Link
            to={`/product/${product.slug || product._id}`}
            className="block mt-1 font-serif text-base font-semibold text-stone-100 hover:text-[#D4AF37] line-clamp-1 transition-colors"
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center text-[#D4AF37]">
              <Star className="w-3 h-3 fill-[#D4AF37]" />
            </div>
            <span className="text-[11px] font-medium text-stone-300">{product.rating || 4.9}</span>
            <span className="text-[10px] text-stone-500">({product.numReviews || 12})</span>
          </div>
        </div>

        {/* Pricing in Indian Rupees ₹ */}
        <div className="pt-3 border-t border-stone-800/60 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[#F3E5AB]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-stone-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <span className="text-[10px] text-stone-500 uppercase tracking-wider">
            {product.stock > 0 ? 'In Stock' : 'Pre-Order'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
