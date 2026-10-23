import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useSettings } from './SettingsContext';

const CartContext = createContext();

// Helper to get isolated user-specific storage key
const getUserCartKey = (userId) => {
  return userId ? `ticking_cart_user_${userId}` : 'ticking_cart_guest';
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { settings } = useSettings();

  // Initialize cart state specifically for the current authenticated user or empty for guests
  const [cartItems, setCartItems] = useState(() => {
    try {
      // Remove any legacy global cart key
      localStorage.removeItem('ticking_local_cart');
      const key = getUserCartKey(user?._id);
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);

  // Track the previous user ID to handle login / switch / logout transitions
  const prevUserIdRef = useRef(user?._id || null);
  const isFirstMountRef = useRef(true);

  // Synchronize cart state on auth transitions (Login, Logout, User Switch)
  useEffect(() => {
    const currentUserId = user?._id || null;
    const prevUserId = prevUserIdRef.current;

    // Remove any lingering legacy global keys
    localStorage.removeItem('ticking_local_cart');

    // Case 1: User is logged out or guest session
    if (!isAuthenticated || !currentUserId) {
      setCartItems([]);
      setAppliedCoupon(null);
      localStorage.removeItem('ticking_cart_guest');
      prevUserIdRef.current = null;
      isFirstMountRef.current = false;
      return;
    }

    // Case 2: First mount while authenticated, or user has changed/logged in
    if (isFirstMountRef.current || currentUserId !== prevUserId) {
      prevUserIdRef.current = currentUserId;
      isFirstMountRef.current = false;

      // Reset coupon on account switch
      setAppliedCoupon(null);

      // Immediately isolate state: load this user's local cache or start clean
      try {
        const userKey = getUserCartKey(currentUserId);
        const cached = localStorage.getItem(userKey);
        setCartItems(cached ? JSON.parse(cached) : []);
      } catch {
        setCartItems([]);
      }

      // Fetch authoritative cart from MongoDB Atlas for this user
      fetchBackendCart(currentUserId);
    }
  }, [isAuthenticated, user?._id]);

  // Persist items to user-specific localStorage whenever cartItems change
  useEffect(() => {
    localStorage.removeItem('ticking_local_cart');

    if (isAuthenticated && user?._id) {
      const userKey = getUserCartKey(user._id);
      localStorage.setItem(userKey, JSON.stringify(cartItems));
    } else {
      if (cartItems.length > 0) {
        localStorage.setItem('ticking_cart_guest', JSON.stringify(cartItems));
      } else {
        localStorage.removeItem('ticking_cart_guest');
      }
    }
  }, [cartItems, isAuthenticated, user?._id]);

  const fetchBackendCart = async (targetUserId) => {
    const activeId = targetUserId || user?._id;
    if (!activeId) return;

    try {
      setLoading(true);
      const data = await api.get('/cart');

      // Verify the session user hasn't changed while request was in flight
      if (prevUserIdRef.current !== activeId) {
        return;
      }

      if (data && Array.isArray(data.items)) {
        const mapped = data.items
          .filter((item) => item && item.product && typeof item.product === 'object')
          .map((item) => ({
            product: item.product,
            _id: item.product._id,
            name: item.product.name,
            slug: item.product.slug,
            brand: item.product.brand,
            price: Number(item.price) || Number(item.product.price) || 0,
            originalPrice: item.product.originalPrice,
            images: item.product.images || [],
            stock: item.product.stock,
            quantity: Number(item.quantity) || 1
          }));

        setCartItems(mapped);
        const userKey = getUserCartKey(activeId);
        localStorage.setItem(userKey, JSON.stringify(mapped));
      }
    } catch (err) {
      console.warn('Could not fetch remote cart:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    const qty = Number(quantity) || 1;
    const productId = product._id;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => (item._id || item.product?._id) === productId
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + qty;
        if (product.stock && newQty > product.stock) {
          showToast(`Only ${product.stock} pieces available in stock`, 'error');
          return prev;
        }
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty
        };
        showToast(`Updated ${product.name} quantity to ${newQty}`, 'success');
        return updated;
      } else {
        showToast(`Added ${product.name} to your bag`, 'success');
        return [
          ...prev,
          {
            product: product,
            _id: product._id,
            name: product.name,
            slug: product.slug,
            brand: product.brand,
            price: product.price,
            originalPrice: product.originalPrice,
            images: product.images || [],
            stock: product.stock,
            quantity: qty
          }
        ];
      }
    });

    if (isAuthenticated && user?._id) {
      try {
        const data = await api.post('/cart', { productId, quantity: qty });
        if (data && Array.isArray(data.items)) {
          const mapped = data.items
            .filter((item) => item && item.product && typeof item.product === 'object')
            .map((item) => ({
              product: item.product,
              _id: item.product._id,
              name: item.product.name,
              slug: item.product.slug,
              brand: item.product.brand,
              price: Number(item.price) || Number(item.product.price) || 0,
              originalPrice: item.product.originalPrice,
              images: item.product.images || [],
              stock: item.product.stock,
              quantity: Number(item.quantity) || 1
            }));
          setCartItems(mapped);
          localStorage.setItem(getUserCartKey(user._id), JSON.stringify(mapped));
        }
      } catch (err) {
        console.warn('Sync cart error:', err.message);
      }
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const qty = Number(quantity);
    if (qty <= 0) {
      return removeFromCart(productId);
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if ((item._id || item.product?._id) === productId) {
          if (item.stock && qty > item.stock) {
            showToast(`Maximum ${item.stock} pieces available`, 'error');
            return item;
          }
          return { ...item, quantity: qty };
        }
        return item;
      })
    );

    if (isAuthenticated && user?._id) {
      try {
        const data = await api.put(`/cart/${productId}`, { quantity: qty });
        if (data && Array.isArray(data.items)) {
          const mapped = data.items
            .filter((item) => item && item.product && typeof item.product === 'object')
            .map((item) => ({
              product: item.product,
              _id: item.product._id,
              name: item.product.name,
              slug: item.product.slug,
              brand: item.product.brand,
              price: Number(item.price) || Number(item.product.price) || 0,
              originalPrice: item.product.originalPrice,
              images: item.product.images || [],
              stock: item.product.stock,
              quantity: Number(item.quantity) || 1
            }));
          setCartItems(mapped);
          localStorage.setItem(getUserCartKey(user._id), JSON.stringify(mapped));
        }
      } catch (err) {
        console.warn('Update cart error:', err.message);
      }
    }
  };

  const removeFromCart = async (productId) => {
    setCartItems((prev) => prev.filter((item) => (item._id || item.product?._id) !== productId));
    showToast('Item removed from cart', 'info');

    if (isAuthenticated && user?._id) {
      try {
        const data = await api.delete(`/cart/${productId}`);
        if (data && Array.isArray(data.items)) {
          const mapped = data.items
            .filter((item) => item && item.product && typeof item.product === 'object')
            .map((item) => ({
              product: item.product,
              _id: item.product._id,
              name: item.product.name,
              slug: item.product.slug,
              brand: item.product.brand,
              price: Number(item.price) || Number(item.product.price) || 0,
              originalPrice: item.product.originalPrice,
              images: item.product.images || [],
              stock: item.product.stock,
              quantity: Number(item.quantity) || 1
            }));
          setCartItems(mapped);
          localStorage.setItem(getUserCartKey(user._id), JSON.stringify(mapped));
        }
      } catch (err) {
        console.warn('Delete cart error:', err.message);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    setAppliedCoupon(null);
    if (user?._id) {
      localStorage.removeItem(getUserCartKey(user._id));
    }
    localStorage.removeItem('ticking_cart_guest');
    localStorage.removeItem('ticking_local_cart');

    if (isAuthenticated) {
      try {
        await api.delete('/cart');
      } catch (err) {
        console.warn('Clear cart error:', err.message);
      }
    }
  };

  const applyCoupon = async (code) => {
    try {
      const result = await api.post('/coupons/validate', {
        code,
        cartTotal: subtotal
      });
      setAppliedCoupon(result);
      showToast(result.message || 'Coupon applied successfully!', 'success');
      return result;
    } catch (err) {
      showToast(err.message || 'Invalid coupon code', 'error');
      throw err;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  // Calculations
  const cartCount = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );

  const discount = appliedCoupon
    ? appliedCoupon.discountType === 'percentage'
      ? Math.round((subtotal * appliedCoupon.discountAmount) / 100)
      : appliedCoupon.discountAmount
    : 0;

  const shippingFee = 0; // Free worldwide shipping
  const taxRate = typeof settings?.taxRate === 'number' ? settings.taxRate : 5;
  const tax = Math.round((subtotal - discount) * (taxRate / 100)); // Dynamic luxury VAT / tax from settings
  const grandTotal = Math.max(0, subtotal - discount + shippingFee + tax);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        discount,
        shippingFee,
        tax,
        grandTotal,
        appliedCoupon,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        fetchBackendCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
