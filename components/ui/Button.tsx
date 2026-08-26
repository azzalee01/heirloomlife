import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ── Heirloom Life Button ──────────────────────────────────────────────────────
// Brand: teal #2AB4AE, white surfaces, DM Sans.
// Primary = teal fill. darkOutline = ghost on dark hero bg.
// All other variants mirror Donna structure but remap to Heirloom tokens.

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-[15px] font-normal focus-visible:outline-none focus-visible:ring-2 ring-[var(--color-teal)] ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border transition-all duration-200',
  {
    variants: {
      variant: {
        // White surface, subtle border
        default:
          'bg-white border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-stone)]',
        // Stone fill  -  secondary actions
        outline:
          'bg-[var(--color-stone)] border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-stone-hover)]',
        // Ghost on dark hero backgrounds  -  hovers to teal fill
        darkOutline:
          'bg-transparent border-white/30 text-white hover:bg-[var(--color-teal)] hover:border-transparent hover:shadow-[0_4px_14px_rgba(42,180,174,0.3)] hover:text-white active:bg-[var(--color-teal-dark)] active:shadow-none',
        // Ghost on light backgrounds
        ghost:
          'bg-transparent border-transparent text-[var(--color-ink)] hover:bg-[var(--color-stone)]',
        // Primary CTA  -  teal fill
        primary:
          'bg-[var(--color-teal)] hover:bg-[var(--color-teal-hover)] hover:shadow-[0_4px_14px_rgba(42,180,174,0.3)] text-white border-transparent active:bg-[var(--color-teal-dark)] active:shadow-none',
        // High contrast  -  ink fill
        black:
          'bg-[var(--color-ink)] text-white hover:bg-[#1C2827] border-[var(--color-ink)]',
        // Neutral stone
        gray:
          'bg-[var(--color-stone)] text-[var(--color-ink)] hover:bg-[var(--color-stone-hover)] border-[var(--color-border)]',
        // Frosted white glass  -  light surfaces
        glass:
          'btn-glass',
        // Frosted teal glass  -  primary CTA
        glassPrimary:
          'btn-glass-primary',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm:      'h-10 px-3',
        xs:      'h-9 px-3 text-xs',
        lg:      'h-12 px-5',
        xl:      'h-14 px-8 text-base rounded-xl',
        icon:    'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
