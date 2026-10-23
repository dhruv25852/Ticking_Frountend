import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

const getUserWishlistKey = (userId) => {
  return userId ? `ticking_wishlist_user_${userId}` : 'ticking_wishlist_guest';
};

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      localStorage.removeItem('ticking_local_wishlist');
      const key = getUserWishlistKey(user?._id);
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const prevUserIdRef = useRef(user?._id || null);
  const isFirstMountRef = useRef(true);

  useEffect(() => {
    const currentUserId = user?._id || null;
    const prevUserId = prevUserIdRef.current;

    localStorage.removeItem('ticking_local_wishlist');

    if (!isAuthenticated || !currentUserId) {
      setWishlistItems([]);
      localStorage.removeItem('ticking_wishlist_guest');
      prevUserIdRef.current = null;
      isFirstMountRef.current = false;
      return;
    }

    if (isFirstMountRef.current || currentUserId !== prevUserId) {
      prevUserIdRef.current = currentUserId;
      isFirstMountRef.current = false;

      try {
        const userKey = getUserWishlistKey(currentUserId);
        const cached = localStorage.getItem(userKey);
        setWishlistItems(cached ? JSON.parse(cached) : []);
      } catch {
        setWishlistItems([]);
      }

      fetchBackendWishlist(currentUserId);
    }
  }, [isAuthenticated, user?._id]);

  useEffect(() => {
    localStorage.removeItem('ticking_local_wishlist');

    if (isAuthenticated && user?._id) {
      const userKey = getUserWishlistKey(user._id);
      localStorage.setItem(userKey, JSON.stringify(wishlistItems));
    } else {
      if (wishlistItems.length > 0) {
        localStorage.setItem('ticking_wishlist_guest', JSON.stringify(wishlistItems));
      } else {
        localStorage.removeItem('ticking_wishlist_guest');
      }
    }
  }, [wishlistItems, isAuthenticated, user?._id]);

  const fetchBackendWishlist = async (targetUserId) => {
    const activeId = targetUserId || user?._id;
    if (!activeId) return;

    try {
      const data = await api.get('/wishlist');
      if (prevUserIdRef.current !== activeId) return;

      if (data && Array.isArray(data.products)) {
        const validProducts = data.products.filter((p) => p && typeof p === 'object');
        setWishlistItems(validProducts);
        const userKey = getUserWishlistKey(activeId);
        localStorage.setItem(userKey, JSON.stringify(validProducts));
      }
    } catch (err) {
      console.warn('Could not fetch remote wishlist:', err.message);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => (item._id || item) === productId);
  };

  const toggleWishlist = async (product) => {
    const exists = isInWishlist(product._id);
    if (exists) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product);
    }
  };

  const addToWishlist = async (product) => {
    if (!isInWishlist(product._id)) {
      setWishlistItems((prev) => [...prev, product]);
      showToast(`Added ${product.name} to wishlist`, 'success');

      if (isAuthenticated && user?._id) {
        try {
          await api.post('/wishlist', { productId: product._id });
        } catch (err) {
          console.warn('Sync wishlist error:', err.message);
        }
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    setWishlistItems((prev) => prev.filter((item) => (item._id || item) !== productId));
    showToast('Removed from wishlist', 'info');

    if (isAuthenticated && user?._id) {
      try {
        await api.delete(`/wishlist/${productId}`);
      } catch (err) {
        console.warn('Delete wishlist error:', err.message);
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
