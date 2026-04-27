import { ReactNode } from 'react';

interface ChartA11yProps {
  /** Short label describing the chart's purpose AND current parameters. */
  label: string;
  /** Longer screen-reader-only summary that updates as parameters change. */
  summary: ReactNode;
  /** Chart node — typically a Recharts <ResponsiveContainer>. */
  children: ReactNode;
  className?: string;
}

/**
 * Accessibility wrapper for interactive SVG/canvas visualisations.
 *
 *  - Sets `role="img"` so screen readers announce the chart as an image.
 *  - Exposes the human-readable `aria-label` for quick orientation.
 *  - Renders an `aria-live="polite"` `<figcaption>` (sr-only) that updates
 *    whenever the parameters change, so SR users get the new state.
 */
export const ChartA11y = ({ label, summary, children, className }: ChartA11yProps) => {
  return (
    <figure
      role="img"
      aria-label={label}
      className={className}
    >
      {children}
      <figcaption className="sr-live" aria-live="polite">
        {summary}
      </figcaption>
    </figure>
  );
};
