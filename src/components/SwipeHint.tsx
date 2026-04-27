import { ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeHintProps {
  className?: string;
  /** Override the hint label (default: "свайп для прокрутки →"). */
  label?: string;
}

/**
 * Small mobile-only affordance shown above wide content (typically a table)
 * that scrolls horizontally on narrow viewports. Hidden from md+ breakpoints
 * where horizontal scroll is no longer expected.
 *
 * Usage:
 *   <SwipeHint />
 *   <div className="table-scroll">
 *     <table>…</table>
 *   </div>
 */
export const SwipeHint = ({ className, label = 'свайп для прокрутки' }: SwipeHintProps) => (
  <div
    className={cn(
      'md:hidden flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1',
      className
    )}
    aria-hidden="true"
  >
    <ChevronsRight className="w-3.5 h-3.5 animate-pulse" />
    <span>{label}</span>
  </div>
);
