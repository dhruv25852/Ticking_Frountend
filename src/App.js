import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import AppRoutes from './routes/AppRoutes';
import { focusFirstInvalidField } from './utils/formFocus';

export default function App() {
  useEffect(() => {
    const handleFormSubmit = (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      requestAnimationFrame(() => {
        if (focusFirstInvalidField(form)) return;

        const observer = new MutationObserver(() => {
          if (focusFirstInvalidField(form)) {
            observer.disconnect();
            window.clearTimeout(timeoutId);
          }
        });
        const timeoutId = window.setTimeout(() => observer.disconnect(), 5000);
        observer.observe(form, {
          attributes: true,
          childList: true,
          subtree: true,
          attributeFilter: ['aria-invalid', 'class'],
        });
      });
    };

    document.addEventListener('submit', handleFormSubmit);
    return () => document.removeEventListener('submit', handleFormSubmit);
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <SettingsProvider>
            <CartProvider>
              <WishlistProvider>
                <AppRoutes />
              </WishlistProvider>
            </CartProvider>
          </SettingsProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
