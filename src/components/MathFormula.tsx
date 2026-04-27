import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathFormulaProps {
  formula: string;
  display?: boolean;
  className?: string;
}

/**
 * KaTeX wrapper.
 *  - `display` formulas live in a horizontally scrollable block so wide
 *    expressions never break mobile layouts (paired with `.katex-display`
 *    overflow rules in index.css).
 *  - Inline formulas are rendered in a span and remain selectable inline.
 */
export const MathFormula = ({ formula, display = false, className = '' }: MathFormulaProps) => {
  const containerRef = useRef<HTMLSpanElement | HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      katex.render(formula, containerRef.current as HTMLElement, {
        displayMode: display,
        throwOnError: false,
        trust: true,
      });
    }
  }, [formula, display]);

  if (display) {
    return (
      <div
        className={`my-4 w-full max-w-full overflow-x-auto overflow-y-hidden text-center ${className}`}
        role="math"
        aria-label="Формула"
      >
        <span ref={containerRef as React.RefObject<HTMLSpanElement>} className="inline-block" />
      </div>
    );
  }

  return (
    <span
      ref={containerRef as React.RefObject<HTMLSpanElement>}
      className={`inline ${className}`}
    />
  );
};
