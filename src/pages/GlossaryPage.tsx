import { useMemo, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Search, BookOpen, X } from 'lucide-react';

import { Header } from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
  GLOSSARY,
  CATEGORY_LABEL,
  totalLinks,
  type GlossaryCategory,
  type GlossaryTerm,
} from '@/data/glossary';

/* ─────────────────────────── Helpers ─────────────────────────── */

/** Размер плитки по числу связей. */
const tileSpan = (links: number): string => {
  if (links >= 6) return 'md:col-span-6';
  if (links >= 3) return 'md:col-span-4';
  return 'md:col-span-3';
};

/** Безопасная подсветка совпадения в обычном тексте. */
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <>{text}</>;
  const re = new RegExp(`(${escapeRegExp(query.trim())})`, 'gi');
  const parts = text.split(re);
  return (
    <>
      {parts.map((part, i) =>
        re.test(part) ? (
          <mark key={i} className="bg-primary/30 text-foreground rounded-none px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
};

/** Алфавит А-Я + латиница для терминов вроде ANOVA, p-value. */
const RU_ALPHABET = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ'.split('');

const firstLetter = (term: string): string => {
  const ch = term.trim().charAt(0).toUpperCase();
  // Латиница объединена в одну группу "A-Z"
  if (/[A-Z]/.test(ch)) return 'A–Z';
  return ch;
};

/* ─────────────────────────── Page ─────────────────────────── */

const GlossaryPage = () => {
  const reduced = useReducedMotion();
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<GlossaryCategory | null>(null);
  const sectionsRef = useRef<Record<string, HTMLElement | null>>({});

  const allCategories: GlossaryCategory[] = ['descriptive', 'inference', 'effect', 'design'];

  const filtered = useMemo<GlossaryTerm[]>(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY.filter((t) => {
      if (activeCat && t.category !== activeCat) return false;
      if (!q) return true;
      const haystack = [t.term, t.short, t.long, ...(t.aliases ?? [])]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, activeCat]);

  /** Группировка по первой букве + сортировка. */
  const grouped = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>();
    [...filtered]
      .sort((a, b) => a.term.localeCompare(b.term, 'ru'))
      .forEach((t) => {
        const k = firstLetter(t.term);
        if (!map.has(k)) map.set(k, []);
        map.get(k)!.push(t);
      });
    return map;
  }, [filtered]);

  /** Какие буквы вообще есть среди отфильтрованных — для подсветки в индексе. */
  const availableLetters = useMemo(() => new Set(grouped.keys()), [grouped]);

  const scrollToLetter = useCallback((letter: string) => {
    const el = sectionsRef.current[letter];
    if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }, [reduced]);

  const indexLetters = ['A–Z', ...RU_ALPHABET];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3 flex items-center gap-3">
            <BookOpen className="w-9 h-9 text-primary" aria-hidden="true" />
            Глоссарий
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Энциклопедия терминов математической статистики для психологов. {GLOSSARY.length} статей,
            формулы, перекрёстные ссылки, упоминания в курсе и лабах.
          </p>
        </header>

        {/* Search + category chips */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Поиск по терминам, синонимам, определениям..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10 h-11"
              aria-label="Поиск термина"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Очистить поиск"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category chips: rounded-none, active = bg-foreground text-background */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCat(null)}
              className={[
                'px-3 py-1.5 text-sm border border-foreground rounded-none transition-colors',
                activeCat === null
                  ? 'bg-foreground text-background'
                  : 'bg-background text-foreground hover:bg-foreground/10',
              ].join(' ')}
              aria-pressed={activeCat === null}
            >
              Все ({GLOSSARY.length})
            </button>
            {allCategories.map((cat) => {
              const count = GLOSSARY.filter((t) => t.category === cat).length;
              const active = activeCat === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCat(active ? null : cat)}
                  className={[
                    'px-3 py-1.5 text-sm border border-foreground rounded-none transition-colors',
                    active
                      ? 'bg-foreground text-background'
                      : 'bg-background text-foreground hover:bg-foreground/10',
                  ].join(' ')}
                  aria-pressed={active}
                >
                  {CATEGORY_LABEL[cat]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Sticky alphabet index */}
        <nav
          aria-label="Индекс по алфавиту"
          className="sticky top-16 z-20 -mx-4 px-4 py-2 mb-6 bg-background/95 backdrop-blur border-y border-border"
        >
          <div className="flex flex-wrap gap-1 text-sm">
            {indexLetters.map((l) => {
              const has = availableLetters.has(l);
              return (
                <button
                  key={l}
                  type="button"
                  disabled={!has}
                  onClick={() => scrollToLetter(l)}
                  className={[
                    'min-w-[2rem] px-1.5 py-0.5 font-mono transition-colors',
                    has
                      ? 'text-foreground hover:bg-foreground hover:text-background cursor-pointer'
                      : 'text-muted-foreground/40 cursor-not-allowed',
                  ].join(' ')}
                  aria-label={`Перейти к ${l}`}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bento grid grouped by letter */}
        {grouped.size === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            Ничего не найдено по запросу «{query}»
          </p>
        ) : (
          <div className="space-y-10">
            {[...grouped.entries()].map(([letter, terms]) => (
              <section
                key={letter}
                ref={(el) => {
                  sectionsRef.current[letter] = el;
                }}
                aria-labelledby={`letter-${letter}`}
                className="scroll-mt-32"
              >
                <h2
                  id={`letter-${letter}`}
                  className="font-serif text-2xl font-bold mb-4 text-muted-foreground"
                >
                  {letter}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 auto-rows-fr">
                  {terms.map((t, i) => {
                    const links = totalLinks(t);
                    const span = tileSpan(links);
                    const fade = reduced
                      ? {}
                      : {
                          initial: { opacity: 0, y: 12 },
                          whileInView: { opacity: 1, y: 0 },
                          viewport: { once: true, margin: '-50px' },
                          transition: { duration: 0.3, delay: Math.min(i * 0.02, 0.2) },
                        };

                    return (
                      <motion.div key={t.id} {...fade} className={`col-span-1 ${span}`}>
                        <Link
                          to={`/glossary/${t.id}`}
                          className="group flex h-full flex-col justify-between border-2 border-foreground bg-card p-5 transition-all hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2 text-[10px] font-mono uppercase tracking-widest opacity-60">
                              <span>{CATEGORY_LABEL[t.category]}</span>
                              {links > 0 && <span aria-label={`${links} связей`}>↔ {links}</span>}
                            </div>
                            <h3 className="font-serif text-lg font-bold mb-2 leading-tight">
                              <HighlightMatch text={t.term} query={query} />
                            </h3>
                            <p className="text-sm leading-snug opacity-80">
                              <HighlightMatch text={t.short} query={query} />
                            </p>
                          </div>
                          <div className="mt-4 text-xs font-mono opacity-50 group-hover:opacity-100">
                            читать →
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Result counter */}
        <p className="mt-8 text-center text-xs text-muted-foreground font-mono">
          {filtered.length} из {GLOSSARY.length}
          {activeCat && ` · ${CATEGORY_LABEL[activeCat]}`}
          {query && ` · «${query}»`}
        </p>

        {(query || activeCat) && (
          <div className="mt-4 text-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setQuery('');
                setActiveCat(null);
              }}
            >
              Сбросить фильтры
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default GlossaryPage;
