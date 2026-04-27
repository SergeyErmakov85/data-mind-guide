import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export const difficultyLabels: Record<Difficulty, string> = {
  beginner: 'Базовый',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
};

const difficultyOrder: Record<Difficulty, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

export const sortByDifficulty = <T extends { difficulty: Difficulty }>(items: T[]): T[] =>
  [...items].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);

// Cycle of column spans to create a bento rhythm.
const SPAN_PATTERN = [
  'col-span-1 md:col-span-8 row-span-1',
  'col-span-1 md:col-span-4 row-span-1',
  'col-span-1 md:col-span-4 row-span-1',
  'col-span-1 md:col-span-8 row-span-1',
  'col-span-1 md:col-span-6 row-span-1',
  'col-span-1 md:col-span-6 row-span-1',
  'col-span-1 md:col-span-3 row-span-1',
  'col-span-1 md:col-span-9 row-span-1',
];

export const tileSpan = (i: number) => SPAN_PATTERN[i % SPAN_PATTERN.length];
// Every 4th tile is "highlighted"
export const isHighlighted = (i: number) => (i + 1) % 4 === 0;

export const tileMotion = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export const tileGridMotion = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

interface BentoTileProps {
  index: number;
  highlight?: boolean;
  to?: string;
  disabled?: boolean;
  difficulty?: Difficulty;
  badges?: string[];
  title: string;
  description: string;
  indexLabel?: string; // e.g. "KORRELATION"
  icon?: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
  className?: string;
}

export const BentoTile = ({
  index,
  highlight,
  to,
  disabled,
  difficulty,
  badges,
  title,
  description,
  indexLabel,
  icon: Icon,
  children,
  className,
}: BentoTileProps) => {
  const isHi = highlight ?? isHighlighted(index);
  const num = String(index + 1).padStart(2, '0');

  const base = cn(
    'group relative h-full p-6 border-3 border-foreground rounded-none transition-all duration-150 flex flex-col',
    'hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal',
    isHi ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground',
    disabled && 'opacity-60 pointer-events-none',
    className,
  );

  const inner = (
    <>
      {/* Top: mono index + icon */}
      <div className="flex items-start justify-between mb-3">
        <span
          className={cn(
            'font-mono text-[11px] uppercase tracking-widest',
            isHi ? 'opacity-80' : 'text-muted-foreground',
          )}
        >
          #{num}
          {indexLabel ? ` / ${indexLabel}` : ''}
        </span>
        {Icon && (
          <Icon
            className={cn(
              'w-5 h-5 shrink-0',
              isHi ? 'text-primary-foreground' : 'text-foreground',
            )}
          />
        )}
      </div>

      {/* Title */}
      <h3
        className={cn(
          'font-heading uppercase tracking-tight font-bold leading-tight',
          isHi ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl',
        )}
      >
        {title}
      </h3>

      {/* Description (2 lines) */}
      <p
        className={cn(
          'mt-2 font-body text-sm line-clamp-2',
          isHi ? 'opacity-90' : 'text-muted-foreground',
        )}
      >
        {description}
      </p>

      {children && <div className="mt-3">{children}</div>}

      {/* Footer: difficulty + badges + arrow */}
      <div className="mt-auto pt-4 flex items-end justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {difficulty && (
            <span
              className={cn(
                'font-mono text-[10px] uppercase tracking-widest px-2 py-1 border-2 rounded-none',
                isHi
                  ? 'border-primary-foreground'
                  : 'border-foreground bg-background text-foreground',
              )}
            >
              {difficultyLabels[difficulty]}
            </span>
          )}
          {badges?.slice(0, 2).map((b) => (
            <span
              key={b}
              className={cn(
                'font-mono text-[10px] uppercase tracking-widest px-2 py-1 border-2 rounded-none',
                isHi
                  ? 'border-primary-foreground/70'
                  : 'border-muted-foreground/40 text-muted-foreground',
              )}
            >
              {b}
            </span>
          ))}
        </div>
        <ArrowRight
          className={cn(
            'w-5 h-5 shrink-0 transition-transform group-hover:translate-x-1',
            isHi ? 'text-primary-foreground' : 'text-foreground',
          )}
        />
      </div>
    </>
  );

  return (
    <motion.div variants={tileMotion} className={cn(tileSpan(index))}>
      {to && !disabled ? (
        <Link to={to} className={base} aria-label={title}>
          {inner}
        </Link>
      ) : (
        <div className={base}>{inner}</div>
      )}
    </motion.div>
  );
};

interface DifficultyFilterProps {
  value: Difficulty | 'all';
  onChange: (v: Difficulty | 'all') => void;
  counts?: Partial<Record<Difficulty | 'all', number>>;
}

export const DifficultyFilter = ({ value, onChange, counts }: DifficultyFilterProps) => {
  const opts: Array<{ key: Difficulty | 'all'; label: string }> = [
    { key: 'all', label: 'Все' },
    { key: 'beginner', label: 'Базовый' },
    { key: 'intermediate', label: 'Средний' },
    { key: 'advanced', label: 'Продвинутый' },
  ];
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {opts.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={cn(
              'font-mono text-xs uppercase tracking-widest px-3 py-2 border-3 rounded-none transition-all',
              'border-foreground',
              active
                ? 'bg-foreground text-background shadow-brutal-sm'
                : 'bg-background text-foreground hover:-translate-x-[1px] hover:-translate-y-[1px]',
            )}
          >
            {o.label}
            {counts && counts[o.key] !== undefined && (
              <span className={cn('ml-2 opacity-70')}>{counts[o.key]}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
