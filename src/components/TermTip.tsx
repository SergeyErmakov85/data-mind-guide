import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  GlassDialog,
  GlassDialogContent,
  GlassDialogTitle,
  GlassDialogDescription,
} from '@/components/ui/glass-dialog';
import { Badge } from '@/components/ui/badge';
import { MathFormula } from '@/components/MathFormula';
import { getEntry, CATEGORY_LABELS } from '@/data/glossary';

interface TermTipProps {
  id: string;
  children?: ReactNode;
  /** Suppress visual styling (used inside heavy auto-termified prose) */
  plain?: boolean;
}

/**
 * Inline glossary tip with HoverCard preview + GlassDialog full description.
 * <TermTip id="p-value">p-значение</TermTip>
 */
export const TermTip = ({ id, children, plain }: TermTipProps) => {
  const entry = getEntry(id);
  const [open, setOpen] = useState(false);

  if (!entry) {
    // Unknown id — render children unchanged so the page still works.
    return <>{children ?? id}</>;
  }

  const label = children ?? entry.term;

  return (
    <>
      <HoverCard openDelay={120} closeDelay={80}>
        <HoverCardTrigger asChild>
          <span
            role="button"
            tabIndex={0}
            onClick={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOpen(true);
              }
            }}
            className={
              plain
                ? 'cursor-help underline decoration-dotted decoration-foreground/40 underline-offset-4 hover:bg-foreground/5 transition-colors'
                : 'cursor-help underline decoration-dotted decoration-foreground/50 underline-offset-4 hover:bg-foreground/5 transition-colors'
            }
          >
            {label}
          </span>
        </HoverCardTrigger>
        <HoverCardContent
          side="top"
          align="start"
          className="w-80 max-w-[90vw] border-3 border-foreground rounded-none p-4 bg-card text-foreground shadow-brutal-sm"
        >
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {entry.id}
              </span>
              <Badge variant="outline" className="rounded-none border-2 font-mono text-[10px] uppercase">
                {CATEGORY_LABELS[entry.category]}
              </Badge>
            </div>
            <h4 className="font-bold uppercase text-base leading-tight">{entry.term}</h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{entry.short}</p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="font-mono text-xs uppercase tracking-wider underline decoration-2 underline-offset-4 hover:bg-foreground hover:text-background px-1"
            >
              Подробнее →
            </button>
          </div>
        </HoverCardContent>
      </HoverCard>

      <GlassDialog open={open} onOpenChange={setOpen}>
        <GlassDialogContent dialogId={`TERM / ${entry.id.toUpperCase()}`}>
          <div className="space-y-4">
            <GlassDialogTitle>{entry.term}</GlassDialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-none border-2 font-mono text-xs uppercase">
                {CATEGORY_LABELS[entry.category]}
              </Badge>
              {entry.aliases.length > 0 && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  // алиасы: {entry.aliases.slice(0, 4).join(', ')}
                </span>
              )}
            </div>
            <GlassDialogDescription className="text-base text-foreground/85">
              {entry.full}
            </GlassDialogDescription>

            {entry.formula && (
              <div className="border-3 border-foreground p-4 bg-background">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  // FORMULA
                </p>
                <MathFormula formula={entry.formula} display />
              </div>
            )}

            {entry.relatedIds.length > 0 && (
              <div className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  // см. также
                </p>
                <div className="flex flex-wrap gap-2">
                  {entry.relatedIds.map((rid) => {
                    const r = getEntry(rid);
                    if (!r) return null;
                    return (
                      <Link
                        key={rid}
                        to={`/glossary#${rid}`}
                        onClick={() => setOpen(false)}
                        className="px-3 py-1 border-2 border-foreground rounded-none font-mono text-xs uppercase hover:bg-foreground hover:text-background transition-colors"
                      >
                        {r.term}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </GlassDialogContent>
      </GlassDialog>
    </>
  );
};
