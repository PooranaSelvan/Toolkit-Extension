import { motion } from 'framer-motion';
import { Wrench } from 'lucide-react';
import { SkeletonToolPage } from './Skeleton';

/**
 * Professional loading spinner with optional skeleton fallback.
 * - variant: 'spinner' (default animated spinner) | 'skeleton' (skeleton page loader)
 */
export default function LoadingSpinner({ size = 'md', text = 'Loading...', variant = 'spinner' }) {
  if (variant === 'skeleton') {
    return <SkeletonToolPage />;
  }
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-18 h-18',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
    xl: 'w-3 h-3',
  };

  return (
    <div className="flex items-center justify-center min-h-[40vh]" role="status" aria-live="polite">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="text-center space-y-5"
      >
        <div className="relative mx-auto" style={{ width: 'fit-content' }}>
          {/* Pulsing glow ring */}
          <div className={`${sizeClasses[size]} absolute inset-[-6px] rounded-2xl bg-primary/15 animate-glow-pulse blur-md`} />
          {/* Main spinner container with logo */}
          <div className={`${sizeClasses[size]} relative rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30`}>
            <Wrench className="w-1/2 h-1/2 text-primary-content" aria-hidden="true" />
          </div>
          {/* Orbiting dots */}
          <motion.div
            className="absolute inset-[-8px]"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <div className={`${dotSizes[size]} absolute top-0 left-1/2 -translate-x-1/2 rounded-full bg-primary shadow-sm`} />
          </motion.div>
          <motion.div
            className="absolute inset-[-8px]"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1 }}
          >
            <div className={`${dotSizes[size]} absolute top-0 left-1/2 -translate-x-1/2 rounded-full bg-primary/60 shadow-sm`} />
          </motion.div>
        </div>
        <div>
          <motion.p
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-sm font-semibold text-primary mb-1"
          >
            {text}
          </motion.p>
          <p className="text-xs opacity-40">Please wait a moment</p>
        </div>
      </motion.div>
    </div>
  );
}
