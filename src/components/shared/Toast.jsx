import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

// Toast visual variants
const VARIANT_STYLES = {
  success: {
    bg: "bg-green-50 border-green-200",
    text: "text-green-800",
    icon: "check_circle",
    iconColor: "text-[#22c55e]",
  },
  error: {
    bg: "bg-red-50 border-red-200",
    text: "text-red-800",
    icon: "error",
    iconColor: "text-red-600",
  },
  warning: {
    bg: "bg-orange-50 border-orange-200",
    text: "text-orange-800",
    icon: "warning",
    iconColor: "text-orange-500",
  },
  info: {
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-800",
    icon: "info",
    iconColor: "text-blue-600",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (message, variant = "info", duration = 3500) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, variant, duration }]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
      return id;
    },
    [removeToast]
  );

  const api = {
    success: (msg, dur) => pushToast(msg, "success", dur),
    error: (msg, dur) => pushToast(msg, "error", dur),
    warning: (msg, dur) => pushToast(msg, "warning", dur),
    info: (msg, dur) => pushToast(msg, "info", dur),
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast viewport */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const v = VARIANT_STYLES[toast.variant] || VARIANT_STYLES.info;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${v.bg} p-4 shadow-lg transition-all`}
              role="status"
            >
              <span className={`material-symbols-outlined ${v.iconColor}`}>
                {v.icon}
              </span>
              <p className={`flex-1 whitespace-pre-line text-sm font-medium ${v.text}`}>
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className={`rounded p-1 transition hover:bg-black/5 ${v.text}`}
                aria-label="Dismiss"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
};