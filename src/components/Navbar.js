import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Truck,
  Headphones,
  Compass,
  LogOut,
  Shield,
  Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSettings } from '../context/SettingsContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [watchesDropdown, setWatchesDropdown] = useState(false);
  const [collectionsDropdown, setCollectionsDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const activeLinkClass = ({ isActive }) =>
    `text-xs uppercase tracking-[0.2em] font-medium transition-colors relative py-1 ${
      isActive
        ? 'text-[#D4AF37] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#D4AF37]'
        : 'text-stone-300 hover:text-[#D4AF37]'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full select-none">
      {/* Top Announcement Bar from Reference Screenshots */}
      <div className="bg-[#050506] border-b border-[#222125] text-stone-400 text-[11px] py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">{settings?.shippingPolicy || 'Free Worldwide Insured Shipping'}</span>
            <span className="sm:hidden">Free Global Shipping</span>
          </div>
          <div className="hidden md:block tracking-widest text-stone-300 uppercase text-[10px] font-medium">
            Exceptional Craftsmanship. Timeless Legacy.
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <Link to="/contact" className="hover:text-[#D4AF37] flex items-center gap-1 transition-colors">
              <Headphones className="w-3 h-3 text-[#D4AF37]" />
              <span>Support</span>
            </Link>
            <span className="text-stone-700">|</span>
            <Link to="/orders" className="hover:text-[#D4AF37] flex items-center gap-1 transition-colors">
              <Compass className="w-3 h-3 text-[#D4AF37]" />
              <span>Track Order</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <nav
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0B0B0D]/95 backdrop-blur-md shadow-2xl py-3 border-b border-[#D4AF37]/20'
            : 'bg-[#0A0A0C] py-4 border-b border-stone-800/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 border border-[#D4AF37] flex items-center justify-center bg-black/60 shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-transform group-hover:scale-105 shrink-0">
              <span className="font-serif text-[#D4AF37] text-xl font-bold tracking-wider">
                {settings?.storeName ? settings.storeName.charAt(0) : 'T'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-sm sm:text-base tracking-[0.18em] sm:tracking-[0.22em] text-[#F3E5AB] font-bold group-hover:text-[#D4AF37] transition-colors uppercase">
                {settings?.storeName || 'TICKING LUXARY WATCH'}
              </span>
              <span className="text-[8px] tracking-[0.3em] text-stone-500 uppercase font-sans -mt-0.5">
                Luxury Horology
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-7">
            <NavLink to="/" className={activeLinkClass}>
              Home
            </NavLink>
            <NavLink to="/shop" className={activeLinkClass}>
              Shop
            </NavLink>

            {/* Watches Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setWatchesDropdown(true)}
              onMouseLeave={() => setWatchesDropdown(false)}
            >
              <button
                className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] font-medium text-stone-300 hover:text-[#D4AF37] py-1 transition-colors"
              >
                <span>Watches</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>
              {watchesDropdown && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-[#0F0F12] border border-[#D4AF37]/30 shadow-2xl py-2 rounded-lg backdrop-blur-xl animate-fadeIn">
                  <Link
                    to="/shop?category=Sports+Watches"
                    className="block px-4 py-2 text-xs tracking-wider text-stone-300 hover:text-[#D4AF37] hover:bg-stone-900/60 transition-colors"
                  >
                    Sports Watches
                  </Link>
                  <Link
                    to="/shop?category=Classic+Watches"
                    className="block px-4 py-2 text-xs tracking-wider text-stone-300 hover:text-[#D4AF37] hover:bg-stone-900/60 transition-colors"
                  >
                    Classic Watches
                  </Link>
                  <Link
                    to="/shop?category=Luxury+Watches"
                    className="block px-4 py-2 text-xs tracking-wider text-stone-300 hover:text-[#D4AF37] hover:bg-stone-900/60 transition-colors"
                  >
                    Luxury Watches
                  </Link>
                  <Link
                    to="/shop?category=Smart+Watches"
                    className="block px-4 py-2 text-xs tracking-wider text-stone-300 hover:text-[#D4AF37] hover:bg-stone-900/60 transition-colors"
                  >
                    Smart Watches
                  </Link>
                  <div className="border-t border-stone-800 my-1"></div>
                  <Link
                    to="/shop?gender=Men's"
                    className="block px-4 py-2 text-xs tracking-wider text-stone-300 hover:text-[#D4AF37] hover:bg-stone-900/60 transition-colors"
                  >
                    Men's Timepieces
                  </Link>
                  <Link
                    to="/shop?gender=Women's"
                    className="block px-4 py-2 text-xs tracking-wider text-stone-300 hover:text-[#D4AF37] hover:bg-stone-900/60 transition-colors"
                  >
                    Women's Timepieces
                  </Link>
                </div>
              )}
            </div>

            {/* Collections Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCollectionsDropdown(true)}
              onMouseLeave={() => setCollectionsDropdown(false)}
            >
              <button
                className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] font-medium text-stone-300 hover:text-[#D4AF37] py-1 transition-colors"
              >
                <span>Collections</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>
              {collectionsDropdown && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-[#0F0F12] border border-[#D4AF37]/30 shadow-2xl py-2 rounded-lg backdrop-blur-xl animate-fadeIn">
                  <Link
                    to="/collections"
                    className="block px-4 py-2 text-xs font-semibold tracking-wider text-[#D4AF37] hover:bg-stone-900/60 transition-colors"
                  >
                    All Collections
                  </Link>
                  <Link
                    to="/shop?collection=Submariner"
                    className="block px-4 py-2 text-xs tracking-wider text-stone-300 hover:text-[#D4AF37] hover:bg-stone-900/60 transition-colors"
                  >
                    Submariner Line
                  </Link>
                  <Link
                    to="/shop?collection=Daytona"
                    className="block px-4 py-2 text-xs tracking-wider text-stone-300 hover:text-[#D4AF37] hover:bg-stone-900/60 transition-colors"
                  >
                    Daytona Series
                  </Link>
                  <Link
                    to="/shop?collection=Royal+Oak"
                    className="block px-4 py-2 text-xs tracking-wider text-stone-300 hover:text-[#D4AF37] hover:bg-stone-900/60 transition-colors"
                  >
                    Royal Oak Offshore
                  </Link>
                  <Link
                    to="/shop?collection=Nautilus"
                    className="block px-4 py-2 text-xs tracking-wider text-stone-300 hover:text-[#D4AF37] hover:bg-stone-900/60 transition-colors"
                  >
                    Nautilus Heritage
                  </Link>
                </div>
              )}
            </div>

            <NavLink to="/brands" className={activeLinkClass}>
              Brands
            </NavLink>
            <NavLink to="/about" className={activeLinkClass}>
              About
            </NavLink>
            <NavLink to="/contact" className={activeLinkClass}>
              Contact
            </NavLink>
          </div>

          {/* Right Action Icons (Search, Profile, Wishlist, Cart pill) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Trigger */}
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              aria-label="Search watches"
              className="p-2 text-stone-300 hover:text-[#D4AF37] transition-colors rounded-full hover:bg-stone-800/40"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                aria-label="User Account"
                className="p-1 text-stone-300 hover:text-[#D4AF37] transition-colors rounded-full hover:bg-stone-800/40 flex items-center justify-center"
              >
                {isAuthenticated && user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="w-7 h-7 rounded-full object-cover border border-[#D4AF37]/70"
                  />
                ) : (
                  <div className="p-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </button>

              {userDropdown && (
                <div
                  onMouseLeave={() => setUserDropdown(false)}
                  className="absolute right-0 top-full mt-2 w-56 bg-[#101013] border border-[#D4AF37]/30 shadow-2xl rounded-xl p-2 z-50 backdrop-blur-xl animate-fadeIn"
                >
                  {isAuthenticated ? (
                    <>
                      <div className="px-3 py-2 border-b border-stone-800 flex items-center gap-2.5">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border border-[#D4AF37]"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#16161B] to-[#26242B] border border-[#D4AF37]/60 flex items-center justify-center font-serif text-xs font-bold text-[#D4AF37] shrink-0">
                            {user?.name?.[0] || 'T'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-stone-200 truncate">{user?.name}</p>
                          <p className="text-[10px] text-stone-500 truncate">{user?.email}</p>
                          {isAdmin && (
                            <span className="inline-block mt-0.5 px-1 py-0.2 text-[8px] font-semibold bg-[#D4AF37]/20 text-[#D4AF37] rounded border border-[#D4AF37]/30">
                              ADMIN
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-stone-300 hover:text-[#D4AF37] hover:bg-stone-800/40 rounded-lg transition-colors"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-stone-300 hover:text-[#D4AF37] hover:bg-stone-800/40 rounded-lg transition-colors"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>My Orders</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-[#D4AF37] hover:bg-stone-800/40 rounded-lg font-medium transition-colors"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      <button
                        onClick={async () => {
                          setUserDropdown(false);
                          await logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setUserDropdown(false)}
                        className="block w-full px-3 py-2 text-center text-xs font-medium text-black bg-[#D4AF37] hover:bg-[#E5C378] rounded-lg transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setUserDropdown(false)}
                        className="block w-full px-3 py-2 text-center text-xs text-stone-300 hover:text-white mt-1.5 transition-colors"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Link with Badge */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative p-2 text-stone-300 hover:text-[#D4AF37] transition-colors rounded-full hover:bg-stone-800/40"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute 1 top-0 right-0 w-4 h-4 rounded-full bg-[#D4AF37] text-black text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Pill Button matching Reference Screenshots: CART (0) */}
            <Link
              to="/cart"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D4AF37]/40 bg-stone-900/60 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all group"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[11px] font-semibold tracking-wider text-stone-200 group-hover:text-[#D4AF37] uppercase">
                Cart ({cartCount})
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-300 hover:text-[#D4AF37] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar Overlay */}
        {searchOpen && (
          <div className="w-full bg-[#0D0D10] border-t border-b border-[#D4AF37]/30 py-3 px-4 shadow-2xl animate-fadeIn">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearchSubmit} noValidate className="relative flex items-center">
                <Search className="w-4 h-4 text-[#D4AF37] absolute left-4" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by watch name, brand, or collection (e.g., Rolex Submariner, Daytona, Gold)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#141418] border border-stone-800 focus:border-[#D4AF37] text-sm text-white pl-11 pr-24 py-2.5 rounded-full outline-none transition-all placeholder:text-stone-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-1.5 bg-[#D4AF37] hover:bg-[#E5C378] text-black text-xs font-semibold tracking-wider uppercase rounded-full transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0A0A0C] border-b border-[#D4AF37]/20 px-6 py-6 flex flex-col gap-4">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm uppercase tracking-widest text-stone-200 hover:text-[#D4AF37] py-2 border-b border-stone-900"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm uppercase tracking-widest text-stone-200 hover:text-[#D4AF37] py-2 border-b border-stone-900"
            >
              Shop
            </Link>
            <Link
              to="/collections"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm uppercase tracking-widest text-stone-200 hover:text-[#D4AF37] py-2 border-b border-stone-900"
            >
              Collections
            </Link>
            <Link
              to="/brands"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm uppercase tracking-widest text-stone-200 hover:text-[#D4AF37] py-2 border-b border-stone-900"
            >
              Prestigious Brands
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm uppercase tracking-widest text-stone-200 hover:text-[#D4AF37] py-2 border-b border-stone-900"
            >
              About Our Craft
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm uppercase tracking-widest text-stone-200 hover:text-[#D4AF37] py-2 border-b border-stone-900"
            >
              Contact Us
            </Link>
            <div className="pt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 bg-stone-900 text-stone-200 rounded-lg text-xs uppercase tracking-wider"
                  >
                    My Account ({user?.name})
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center py-2.5 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 rounded-lg text-xs uppercase tracking-wider font-semibold"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await logout();
                      navigate('/login');
                    }}
                    className="text-center py-2 text-rose-400 text-xs uppercase tracking-wider"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 bg-[#D4AF37] text-black font-semibold rounded-lg text-xs uppercase tracking-wider"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 bg-stone-800 text-white rounded-lg text-xs uppercase tracking-wider"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
