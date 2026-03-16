import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * LazyImage — Professional image component with:
 * - Skeleton placeholder while loading
 * - Smooth fade-in transition on load
 * - Error fallback with retry
 * - Intersection Observer for true lazy loading
 */
export default function LazyImage({
  src,
  alt,
  className = '',
  fallbackSrc,
  fallbackText,
  width,
  height,
  rounded = 'rounded-xl',
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    let observer;
    try {
      observer = new IntersectionObserver(
        ([entry]) => {
          try {
            if (entry.isIntersecting) {
              setInView(true);
              observer.disconnect();
            }
          } catch {
            // If intersection callback fails, show image immediately
            setInView(true);
          }
        },
        { rootMargin: '100px' }
      );

      if (imgRef.current) observer.observe(imgRef.current);
    } catch {
      // IntersectionObserver not available — show immediately
      setInView(true);
    }
    return () => {
      try { observer?.disconnect(); } catch { /* cleanup silently */ }
    };
  }, []);

  const handleLoad = () => setLoaded(true);

  const handleError = (e) => {
    setError(true);
    if (fallbackSrc) {
      e.target.onerror = null;
      e.target.src = fallbackSrc;
      setError(false);
      setLoaded(false);
    }
  };

  const generateFallbackUrl = () => {
    const text = fallbackText || alt?.charAt(0) || '?';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(text)}&size=${width || 100}&background=2D79FF&color=fff&bold=true&font-size=0.4`;
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${rounded} ${className}`}
      style={{ width, height }}
    >
      {/* Skeleton placeholder */}
      {!loaded && !error && (
        <div className="absolute inset-0 skeleton" />
      )}

      {/* Actual image */}
      {inView && (
        <motion.img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={`w-full h-full object-cover ${className}`}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}

      {/* Error fallback */}
      {error && !fallbackSrc && (
        <div className="absolute inset-0 bg-base-200 flex items-center justify-center">
          <span className="text-base-content/20 text-sm font-bold">
            {fallbackText || alt?.charAt(0) || '?'}
          </span>
        </div>
      )}
    </div>
  );
}
