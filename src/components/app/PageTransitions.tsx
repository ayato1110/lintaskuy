import { useEffect } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);
  return null;
}

export function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();
  const reduce = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0, y: -6 }}
        transition={{ duration: reduce ? 0 : 0.16, ease: 'easeOut' }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}

export function PageLoader() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span
          aria-hidden="true"
          className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary motion-reduce:animate-none"
        />
        <p className="text-sm text-muted">Memuat halaman…</p>
      </div>
    </div>
  );
}