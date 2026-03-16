import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    try {
      navigate(-1);
    } catch {
      // If navigation fails (e.g., no history), go home instead
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh] p-4 w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl max-w-md w-full shadow-xl border border-base-300/40 bg-base-100 overflow-hidden"
      >
        <div className="p-8 sm:p-12 text-center">
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-error/10 flex items-center justify-center border border-error/20 relative">
              <div className="absolute inset-0 rounded-2xl bg-error/5 animate-glow-pulse" />
              <AlertCircle size={36} className="text-error relative z-10" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="text-4xl sm:text-5xl font-extrabold mb-2"
          >
            <span className="gradient-text-animated">404</span>
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-lg sm:text-xl font-bold mb-2"
          >
            Page Not Found
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="mb-8 text-base-content/60 text-sm leading-relaxed"
          >
            The page you're looking for doesn't exist or has been moved.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/" className="btn btn-primary gap-2 shadow-lg shadow-primary/20 cta-glow w-full sm:w-auto">
              <Home size={16} />
              Back to Home
            </Link>
            <button onClick={handleGoBack} className="btn btn-ghost gap-2 w-full sm:w-auto">
              <ArrowLeft size={16} />
              Go Back
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
