import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: 'alert-success border-success/20',
  error: 'alert-error border-error/20',
  info: 'alert-info border-info/20',
  warning: 'alert-warning border-warning/20',
};

const progressColors = {
  success: 'bg-success',
  error: 'bg-error',
  info: 'bg-info',
  warning: 'bg-warning',
};

export default function Toast({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose,
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = icons[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        try {
          setIsVisible(false);
          setTimeout(() => {
            try { onClose?.(); } catch { /* swallow close callback errors */ }
          }, 300);
        } catch { /* swallow timeout errors */ }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 24, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 24, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={`alert ${styles[type]} shadow-lg relative overflow-hidden ${className}`}
          role="alert"
          aria-live="polite"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Icon size={20} />
          </motion.div>
          <span className="text-sm font-medium flex-1">{message}</span>
          <button
            onClick={handleClose}
            className="btn btn-ghost btn-xs btn-circle hover:scale-110 transition-transform duration-200"
            aria-label="Close notification"
          >
            <X size={14} />
          </button>
          {/* Auto-dismiss progress bar */}
          {duration > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px]">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className={`h-full ${progressColors[type]} opacity-40 rounded-b-xl`}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toast Container Component — positioned safely below header with safe-area awareness
export function ToastContainer({ toasts = [], onRemove }) {
  if (!Array.isArray(toasts) || toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-[4rem] sm:top-[4.5rem] right-2 sm:right-4 z-50 space-y-2 max-w-[min(24rem,calc(100vw-1rem))] w-full pointer-events-none"
      style={{ maxHeight: 'calc(100vh - 5rem)', overflowY: 'auto', overflowX: 'hidden' }}
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence>
        {toasts.slice(0, 5).map((toast) => (
          <motion.div
            key={toast.id}
            layout
            className="pointer-events-auto"
          >
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration ?? 3000}
              onClose={() => { try { onRemove(toast.id); } catch { /* safe */ } }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
