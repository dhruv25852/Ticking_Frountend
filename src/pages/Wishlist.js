import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';

export default function Wishlist() {
  const { wishlistItems, wishlistCount, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id);
  };

  if (wishlistCount === 0) {
    return (
      <div className="w-full bg-[#080809] min-h-[75vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 flex items-center justify-center text-[#D4AF37] mb-6">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-white mb-2">Your Wishlist is Empty</h2>
        <p className="text-xs text-stone-400 max-w-sm mb-8 leading-relaxed">
          Save your favourite Swiss horological references and grail watches for future acquisition.
        </p>
        <Link
          to="/shop"
          className="px-8 py-3.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-semibold text-xs uppercase tracking-[0.2em] rounded-full transition-all"
        >
          Explore Watches
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#080809] min-h-screen text-stone-200 py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-left border-b border-stone-800 pb-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            CURATED DESIRES
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
            My Wishlist ({wishlistCount} {wishlistCount === 1 ? 'Timepiece' : 'Timepieces'})
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => {
            const imgUrl =
              product.images && product.images.length > 0
                ? product.images[0]
                : '/images/watches/hero_chronograph.jpg';

            return (
              <div
                key={product._id}
                className="bg-[#0E0E12] border border-stone-800/80 hover:border-[#D4AF37]/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all"
              >
                {/* Watch Image */}
                <div className="relative pt-[90%] bg-gradient-to-b from-[#16161B] to-[#0A0A0C] p-4 flex items-center justify-center">
                  <img
                    src={imgUrl}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-contain p-6"
                  />
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-stone-400 hover:text-rose-400 border border-stone-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-5 flex flex-col gap-2 flex-1 justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#D4AF37]">
                      {product.brand}
                    </span>
                    <Link
                      to={`/product/${product.slug || product._id}`}
                      className="block font-serif text-base font-semibold text-white hover:text-[#D4AF37] line-clamp-1 mt-1 transition-colors"
                    >
                      {product.name}
                    </Link>
                    <p className="font-serif text-base font-bold text-[#F3E5AB] mt-2">
                      {formatPrice(product.price)}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-800/80 flex gap-2">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="flex-1 py-2.5 bg-[#D4AF37] hover:bg-[#E5C378] text-black font-bold text-[11px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Bag</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
