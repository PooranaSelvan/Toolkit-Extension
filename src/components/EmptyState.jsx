import { motion } from 'framer-motion';
import { AlertCircle, Sparkles } from 'lucide-react';

/**
 * Professional EmptyState with subtle animations and contextual hints.
 * Used across all tools when there's no data to display.
 */
export default function EmptyState({
  icon: Icon = AlertCircle,
  title = 'No items found',
  description = 'There are no items to display at the moment.',
  hint,
  action,
  variant = 'default', // 'default' | 'minimal' | 'large'
  className = ''
}) {
  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`text-center py-10 px-4 ${className}`}
        role="status"
      >
        <Icon size={24} className="opacity-15 mx-auto mb-3" aria-hidden="true" />
        <p className="text-sm font-medium opacity-45">{title}</p>
        {description && <p className="text-xs opacity-30 mt-1">{description}</p>}
        {action && <div className="flex justify-center mt-4">{action}</div>}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`text-center py-16 px-4 w-full ${className}`}
      role="status"
    >
      <div className="max-w-md mx-auto w-full">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className={`${variant === 'large' ? 'w-24 h-24' : 'w-20 h-20'} rounded-2xl bg-base-200/80 flex items-center justify-center mx-auto mb-6 relative`}
        >
          <Icon size={variant === 'large' ? 38 : 32} className="opacity-20" aria-hidden="true" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 15 }}
            className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-warning/20 flex items-center justify-center"
          >
            <AlertCircle size={14} className="text-warning" />
          </motion.div>
        </motion.div>

        <h3 className={`${variant === 'large' ? 'text-xl' : 'text-lg'} font-bold mb-2`}>{title}</h3>
        <p className="text-sm opacity-50 mb-2 leading-relaxed">{description}</p>

        {hint && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs opacity-30 mb-6 flex items-center justify-center gap-1.5"
          >
            <Sparkles size={10} />
            {hint}
          </motion.p>
        )}

        {!hint && <div className="mb-6" />}

        {action && <div className="flex justify-center">{action}</div>}
      </div>
    </motion.div>
  );
}
