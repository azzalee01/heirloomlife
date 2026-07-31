'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Archive } from 'lucide-react';

// ── Heirloom Life ProductToggle ───────────────────────────────────────────────
// Donna had client/lawyer. Heirloom repurposes this pattern for
// Will (acquisition) vs Vault (retention) — the two core products.
// Same sticky scroll behaviour preserved exactly.

type Product = 'will' | 'vault';

interface ProductToggleProps {
  product: Product;
  setProduct: (p: Product) => void;
  noSticky?: boolean;
}

export function ProductToggle({ product, setProduct, noSticky }: { noSticky?: boolean }) {
  const [activeProduct, setActiveProduct] = useState<Product>('will');
  const inlineRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const [suppressed, setSuppressed] = useState(false);

  useEffect(() => {
    if (noSticky) return;
    const el = inlineRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPinned(false);
        } else if (entry.boundingClientRect.top < 72) {
          setPinned(true);
        }
      },
      { threshold: 1, rootMargin: '-72px 0px 0px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [noSticky]);

  useEffect(() => {
    if (noSticky) return;
    const target = document.querySelector<HTMLElement>('[data-product-toggle-hide]');
    if (!target) return;
    const onScroll = () => {
      const r = target.getBoundingClientRect();
      setSuppressed(r.top <= 100 && r.bottom > window.innerHeight);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [noSticky]);

  const common = { product: activeProduct, setProduct: setActiveProduct };

  return (
    <>
      <div ref={inlineRef} style={{ visibility: pinned ? 'hidden' : 'visible' }}>
        <ToggleButtons {...common} instanceId="inline" />
      </div>

      {!noSticky && (
        <div
          className="fixed top-[72px] left-0 right-0 z-40 flex justify-center pt-1.5 pb-2"
          style={{
            opacity: pinned ? 1 : 0,
            pointerEvents: pinned && !suppressed ? 'auto' : 'none',
          }}
        >
          <div
            className="transition-opacity duration-200"
            style={{ opacity: suppressed ? 0 : 1 }}
          >
            <ToggleButtons {...common} instanceId="pinned" />
          </div>
        </div>
      )}
    </>
  );
}

// ── ToggleButtons ─────────────────────────────────────────────────────────────
function ToggleButtons({
  product,
  setProduct,
  instanceId,
}: {
  product: Product;
  setProduct: (p: Product) => void;
  instanceId: string;
}) {
  const iconSize = 18;
  const options: { value: Product; icon: React.ReactNode; label: string }[] = [
    { value: 'will',  icon: <FileText size={iconSize} />,  label: 'Your Will' },
    { value: 'vault', icon: <Archive size={iconSize} />, label: 'Living Vault' },
  ];

  return (
    <div
      className="relative flex items-center rounded-full p-1"
      style={{
        background: 'var(--color-stone)',
        border: '1px solid var(--color-border)',
        boxShadow:
          '0 2px 4px rgba(0,0,0,0.03), 0 8px 24px rgba(42,180,174,0.06), 0 20px 56px 4px rgba(42,180,174,0.04)',
      }}
    >
      {options.map(({ value, icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setProduct(value)}
          className={`relative flex items-center gap-2 sm:gap-2.5 rounded-full px-4 py-2.5 sm:px-7 sm:py-3.5 text-base sm:text-lg font-medium whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)] focus-visible:ring-offset-1 transition-colors duration-150 ${
            product === value ? 'text-white' : 'text-secondary hover:text-primary'
          }`}
        >
          {product === value && (
            <motion.div
              layoutId={`product-indicator-${instanceId}`}
              className="absolute inset-0 rounded-full"
              style={{ background: 'var(--color-teal)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            />
          )}
          <span className="relative z-10 shrink-0">{icon}</span>
          <span className="relative z-10">{label}</span>
        </button>
      ))}
    </div>
  );
}
