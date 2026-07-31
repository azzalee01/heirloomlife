import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'brand' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

// ── Heirloom Life Badge ───────────────────────────────────────────────────────
// brand variant: teal soft bg + teal text — used for eyebrow labels,
// status chips, and estate category tags.

const variantClasses: Record<BadgeVariant, string> = {
  default:
    'bg-[var(--color-stone)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
  brand:
    'bg-[var(--color-teal-soft)] text-[var(--color-teal-dark)] border-transparent',
  outline:
    'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)]',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border tracking-wide',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export type { BadgeProps, BadgeVariant };
