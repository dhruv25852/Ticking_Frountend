import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Zap,
  Shield,
  Truck,
  RotateCcw,
  Star,
  Check,
  ChevronRight,
  Sparkles,
  Share2,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { formatPrice, formatDate } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        // Find by ID or slug
        let prod;
        try {
          prod = await api.get(`/products/${id}`);
        } catch {
          prod = await api.get(`/products/slug/${id}`);
        }

        setProduct(prod);
        setSelectedImage(0);
        setQuantity(1);

        if (prod) {
          // Fetch related watches & reviews
          const [rel, rev] = await Promise.all([
            api.get(`/products/${prod._id}/related`).catch(() => []),
            api.get(`/reviews/product/${prod._id}`).catch(() => [])
          ]);
          setRelated(rel);
          setReviews(rev);
        }
      } catch (err) {
        console.error('Error fetching watch details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to write a review', 'error');
      navigate('/login');
      return;
    }

    const cleanComment = reviewComment.trim();
    if (!cleanComment) {
      setReviewError('Review comment is required');
      return;
    }
    if (cleanComment.length < 5) {
      setReviewError('Review comment must be at least 5 characters');
      return;
    }

    setReviewError('');
    setSubmittingReview(true);
    try {
      const newReview = await api.post('/reviews', {
        productId: product._id,
        rating: reviewRating,
        comment: cleanComment
      });
      setReviews([newReview, ...reviews]);
      setReviewComment('');
      showToast('Thank you! Your verified review has been published.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080809] flex items-center justify-center text-stone-400">
        <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#080809] flex flex-col items-center justify-center text-stone-300 gap-4">
        <h2 className="font-serif text-3xl font-bold">Watch Not Found</h2>
        <Link to="/shop" className="px-6 py-2 bg-[#D4AF37] text-black font-semibold rounded-full text-xs uppercase tracking-wider">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product._id);
  const images = product.images && product.images.length > 0
    ? product.images
    : ['/images/watches/hero_chronograph.jpg'];

  return (
    <div className="w-full bg-[#080809] min-h-screen text-stone-200 py-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-8 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-700" />
          <Link to="/shop" className="hover:text-[#D4AF37] transition-colors">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-700" />
          <span className="text-stone-400">{product.brand}</span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-700" />
          <span className="text-[#D4AF37] font-medium">{product.name}</span>
        </div>

        {/* Product Gallery & Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* Left Gallery Stage (7 cols) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[520px]">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border p-2 bg-[#121216] shrink-0 transition-all ${
                      selectedImage === idx
                        ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]'
                        : 'border-stone-800 hover:border-stone-600 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} thumb ${idx}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image */}
            <div className="flex-1 bg-gradient-to-b from-[#141418] to-[#0A0A0C] border border-[#D4AF37]/20 rounded-2xl p-8 flex items-center justify-center relative overflow-hidden min-h-[420px] sm:min-h-[520px]">
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    inWishlist
                      ? 'bg-[#D4AF37] text-black shadow-lg scale-105'
                      : 'bg-black/60 border border-stone-800 text-stone-300 hover:text-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-black' : ''}`} />
                </button>
              </div>

              <img
                src={images[selectedImage] || images[0]}
                alt={product.name}
                className="w-full max-h-[460px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Right Product Overview & Actions (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 text-left">
            <div>
              {/* Brand and SKU */}
              <div className="flex items-center justify-between">
                <Link
                  to={`/brands/${product.brand.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-xs uppercase tracking-[0.25em] font-bold text-[#D4AF37] hover:underline"
                >
                  {product.brand}
                </Link>
                <span className="text-[11px] font-mono text-stone-500 uppercase tracking-widest">
                  SKU: {product.sku}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white mt-1 leading-tight">
                {product.name}
              </h1>

              {/* Rating and Reviews count */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(product.rating || 5) ? 'fill-[#D4AF37]' : 'text-stone-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-stone-200">{product.rating || 4.9}</span>
                <span className="text-xs text-stone-500">({reviews.length || product.numReviews || 0} Connoisseur Reviews)</span>
              </div>
            </div>

            {/* Price Box in Indian Rupees ₹ */}
            <div className="p-4 bg-[#121216] border border-stone-800/80 rounded-xl flex items-baseline justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-stone-500">Price in INR (₹) (Incl. All Taxes)</p>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="font-serif text-3xl font-bold text-[#F3E5AB]">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-stone-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {product.discountPercentage > 0 && (
                <span className="px-3 py-1 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider rounded-lg">
                  Save {product.discountPercentage}%
                </span>
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              <span className={product.stock > 0 ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                {product.stock > 0 ? `In Stock (${product.stock} units available for delivery)` : 'Currently Out of Stock'}
              </span>
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-stone-400 font-light leading-relaxed">
              {product.shortDescription || product.description}
            </p>

            {/* Quantity Selector & Action Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold">Quantity</span>
                <div className="flex items-center border border-stone-800 rounded-lg bg-[#141418]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-stone-400 hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-xs font-semibold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1.5 text-stone-400 hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => addToCart(product, quantity)}
                  className="py-3.5 px-4 bg-[#D4AF37] hover:bg-[#E5C378] text-black font-bold text-xs uppercase tracking-[0.15em] rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="py-3.5 px-4 bg-[#1C1811] hover:bg-[#2A2315] border border-[#D4AF37]/50 text-[#F3E5AB] font-bold text-xs uppercase tracking-[0.15em] rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Zap className="w-4 h-4 text-[#D4AF37]" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-[#0E0E12] border border-stone-800/80 rounded-xl text-[10px] text-stone-400 text-center">
              <div className="flex flex-col items-center gap-1">
                <Shield className="w-4 h-4 text-[#D4AF37]" />
                <span>100% Genuine</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-[#D4AF37]" />
                <span>Free Insured Transit</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-[#D4AF37]" />
                <span>14-Day Vault Return</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications & Description Tabs/Table */}
        <div className="bg-[#0E0E12] border border-stone-800/80 rounded-2xl p-8 mb-20">
          <div className="border-b border-stone-800 pb-4 mb-8">
            <h2 className="font-serif text-2xl font-bold text-white">Technical Specifications</h2>
            <p className="text-xs text-stone-400 mt-1">
              Precision horological parameters certified by manufacture archives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-stone-900">
              <span className="text-stone-400 uppercase tracking-wider">Case Material</span>
              <span className="font-semibold text-stone-200">{product.specifications?.caseMaterial || 'Oystersteel / Gold'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-stone-900">
              <span className="text-stone-400 uppercase tracking-wider">Strap Material</span>
              <span className="font-semibold text-stone-200">{product.specifications?.strapMaterial || 'Precious Metal / Leather'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-stone-900">
              <span className="text-stone-400 uppercase tracking-wider">Movement</span>
              <span className="font-semibold text-stone-200">{product.specifications?.movement || 'Automatic Mechanical Calibre'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-stone-900">
              <span className="text-stone-400 uppercase tracking-wider">Water Resistance</span>
              <span className="font-semibold text-stone-200">{product.specifications?.waterResistance || '100m / 330ft'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-stone-900">
              <span className="text-stone-400 uppercase tracking-wider">Dial Color</span>
              <span className="font-semibold text-stone-200">{product.specifications?.dialColor || 'Midnight Black'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-stone-900">
              <span className="text-stone-400 uppercase tracking-wider">Case Diameter</span>
              <span className="font-semibold text-stone-200">{product.specifications?.caseSize || '41 mm'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-stone-900">
              <span className="text-stone-400 uppercase tracking-wider">Warranty</span>
              <span className="font-semibold text-stone-200">{product.specifications?.warranty || '5 Years International Warranty'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-stone-900">
              <span className="text-stone-400 uppercase tracking-wider">Gender</span>
              <span className="font-semibold text-stone-200">{product.specifications?.gender || 'Unisex'}</span>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-stone-800">
            <h3 className="font-serif text-lg font-bold text-white mb-2">Artisan Heritage & Narrative</h3>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-light">
              {product.description}
            </p>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-[#0E0E12] border border-stone-800/80 rounded-2xl p-8 mb-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-6 mb-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-white">Collector Reviews</h2>
              <p className="text-xs text-stone-400 mt-1">
                Verified feedback from timepiece connoisseurs worldwide.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-serif text-[#F3E5AB]">{product.rating || 4.9}</span>
              <div className="flex text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                ))}
              </div>
            </div>
          </div>

          {/* Write a Review Box */}
          <form onSubmit={handleReviewSubmit} noValidate className="p-6 bg-[#131317] border border-stone-800 rounded-xl mb-10">
            <h3 className="text-xs uppercase tracking-wider font-bold text-[#D4AF37] mb-3">
              Write a Review
            </h3>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-stone-400">Your Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="p-0.5 text-[#D4AF37] hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= reviewRating ? 'fill-[#D4AF37]' : 'text-stone-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows="3"
              placeholder="Share your experience regarding timekeeping accuracy, finish, and wrist presence..."
              value={reviewComment}
              onChange={(e) => {
                setReviewComment(e.target.value);
                if (reviewError) setReviewError('');
              }}
              className={`w-full bg-[#1A1A20] border ${
                reviewError ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
              } rounded-lg p-3 text-xs text-white outline-none mb-1 transition-colors`}
            ></textarea>
            {reviewError && (
              <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mb-3">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{reviewError}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={submittingReview}
              className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#E5C378] text-black font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 mt-2"
            >
              {submittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </form>

          {/* Reviews List */}
          <div className="flex flex-col gap-4">
            {reviews.length === 0 ? (
              <p className="text-xs text-stone-500 italic">No reviews yet. Be the first to share your appraisal!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="p-5 bg-[#121216] border border-stone-900 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{rev.userName}</span>
                      <span className="px-2 py-0.5 text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800/40 rounded-full">
                        Verified Owner
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500">{formatDate(rev.createdAt)}</span>
                  </div>

                  <div className="flex text-[#D4AF37]">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" />
                    ))}
                  </div>

                  <p className="text-xs text-stone-300 font-light mt-1">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {related.length > 0 && (
          <div>
            <div className="mb-8 text-left">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
                COMPLEMENTARY HOROLOGY
              </span>
              <h2 className="font-serif text-3xl font-bold text-white mt-1">
                You May Also Admire
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
