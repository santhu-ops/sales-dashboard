import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Render Portal */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between px-4 py-3 rounded-lg shadow-2xl border transition-all duration-300 transform translate-y-0 animate-bounce-short ${
              t.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100'
                : t.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-100'
                : t.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-100'
                : 'bg-slate-900/90 border-slate-700/50 text-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span>
                {t.type === 'success' && '✅'}
                {t.type === 'error' && '❌'}
                {t.type === 'warning' && '⚠️'}
                {t.type === 'info' && 'ℹ️'}
              </span>
              <p className="text-sm font-medium">{t.message}</p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="ml-4 text-xs opacity-60 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
