import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    setToasts((prev) => {
      if (prev.some((t) => t.message === message && t.type === type)) {
        return prev;
      }
      const id = Date.now() + Math.random().toString();
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return [...prev, { id, message, type }];
    });
  }, [removeToast]);

  return React.createElement(
    ToastContext.Provider,
    { value: { showToast } },
    children,
    React.createElement(
      'div',
      { className: 'fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none' },
      React.createElement(
        AnimatePresence,
        null,
        toasts.map((toast) =>
          React.createElement(
            motion.div,
            {
              key: toast.id,
              initial: { opacity: 0, y: 20, scale: 0.95 },
              animate: { opacity: 1, y: 0, scale: 1 },
              exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
              className: `pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md ${
                toast.type === 'success'
                  ? 'bg-[#121612]/95 border-emerald-500/40 text-emerald-200'
                  : toast.type === 'error'
                  ? 'bg-[#1C1113]/95 border-rose-500/40 text-rose-200'
                  : 'bg-[#151419]/95 border-amber-500/40 text-amber-200'
              }`
            },
            toast.type === 'success' && React.createElement(CheckCircle2, { className: 'w-5 h-5 text-emerald-400 shrink-0' }),
            toast.type === 'error' && React.createElement(AlertCircle, { className: 'w-5 h-5 text-rose-400 shrink-0' }),
            toast.type === 'info' && React.createElement(Info, { className: 'w-5 h-5 text-amber-400 shrink-0' }),
            React.createElement('span', { className: 'text-sm font-medium flex-1 text-stone-200' }, toast.message),
            React.createElement(
              'button',
              {
                onClick: () => removeToast(toast.id),
                className: 'p-1 hover:bg-white/10 rounded-md transition-colors text-stone-400 hover:text-white'
              },
              React.createElement(X, { className: 'w-4 h-4' })
            )
          )
        )
      )
    )
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
