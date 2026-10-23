import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';

// Customer Pages
import Home from '../pages/Home';
import Shop from '../pages/Shop';
import ProductDetails from '../pages/ProductDetails';
import Collections from '../pages/Collections';
import Brands from '../pages/Brands';
import BrandDetail from '../pages/BrandDetail';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Wishlist from '../pages/Wishlist';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import OrderSuccess from '../pages/OrderSuccess';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Orders from '../pages/Orders';
import OrderDetails from '../pages/OrderDetails';
import SearchResults from '../pages/SearchResults';
import NotFound from '../pages/NotFound';

// Admin Pages
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminAddEditProduct from '../pages/admin/AdminAddEditProduct';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminBrands from '../pages/admin/AdminBrands';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminCustomers from '../pages/admin/AdminCustomers';
import AdminPayments from '../pages/admin/AdminPayments';
import AdminCoupons from '../pages/admin/AdminCoupons';
import AdminReviews from '../pages/admin/AdminReviews';
import AdminInventory from '../pages/admin/AdminInventory';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import AdminSettings from '../pages/admin/AdminSettings';

// Route Guards
const ProtectedCustomerRoute = ({ children }) => {
  const { isAuthenticated, initializing } = useAuth();
  if (initializing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#080809] text-stone-400 gap-3">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs uppercase tracking-widest text-[#D4AF37]">Authenticating Session...</p>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, initializing } = useAuth();
  if (initializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070709] text-stone-400 gap-3">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs uppercase tracking-widest text-[#D4AF37]">Verifying Administrator Privileges...</p>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Customer Facing Website */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:id" element={<ProductDetails />} />
        <Route path="collections" element={<Collections />} />
        <Route path="brands" element={<Brands />} />
        <Route path="brands/:slug" element={<BrandDetail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="cart" element={<Cart />} />
        <Route
          path="checkout"
          element={
            <ProtectedCustomerRoute>
              <Checkout />
            </ProtectedCustomerRoute>
          }
        />
        <Route
          path="order-success/:id"
          element={
            <ProtectedCustomerRoute>
              <OrderSuccess />
            </ProtectedCustomerRoute>
          }
        />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="search" element={<SearchResults />} />

        {/* Authenticated Customer Routes */}
        <Route
          path="profile"
          element={
            <ProtectedCustomerRoute>
              <Profile />
            </ProtectedCustomerRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedCustomerRoute>
              <Orders />
            </ProtectedCustomerRoute>
          }
        />
        <Route
          path="orders/:id"
          element={
            <ProtectedCustomerRoute>
              <OrderDetails />
            </ProtectedCustomerRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin Login */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Panel Dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/add" element={<AdminAddEditProduct />} />
        <Route path="products/edit/:id" element={<AdminAddEditProduct />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="brands" element={<AdminBrands />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}
