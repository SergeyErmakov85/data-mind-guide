import { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MathFormula } from '@/components/MathFormula';
import {
  GlassDialog,
  GlassDialogContent,
  GlassDialogTitle,
  GlassDialogDescription,
} from '@/components/ui/glass-dialog';
import { Search, BookOpen, Link as LinkIcon } from 'lucide-react';
import {
  glossary,
  getCategories,
  CATEGORY_LABELS,
  GlossaryCategory,
  GlossaryEntry,
  getEntry,
} from '@/data/glossary';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.03 } } };

const GlossaryPage = () => {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<GlossaryCategory | null>(null);
  const [activeEntry, setActiveEntry] = useState<GlossaryEntry | null>(null);
  const location = useLocation();
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const categories = useMemo(() => getCategories(), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return glossary.filter((e) => {
      if (activeCat && e.category !== activeCat) return false;
      if (!q) return true;
      const haystack = [
        e.term,
        e.short,
        e.full,
        ...e.aliases,
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [search, activeCat]);

  // URL anchor: /glossary#p-value → scroll + open detail
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (!hash) return;
    const entry = getEntry(hash);
    if (!entry) return;
    // Make sure category filter doesn't hide it
    setActiveCat(null);
    setSearch('');
    // Wait a frame for cards to render
    requestAnimationFrame(() => {
      const el = cardRefs.current[hash];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveEntry(entry);
    });
  }, [location.hash]);

  const copyAnchor = (id: string) => {
    const url = `${window.location.origin}/glossary#${id}`;
    navigator.clipboard?.writeText(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <div className="kicker flex items-center gap-2">
              <BookOpen className="w-3 h-3" />
              // глоссарий — {glossary.length} терминов
            </div>
            <h1 className="text-5xl md:text-7xl font-bold uppercase leading-[0.95]">
              Глоссарий
            </h1>
            <div className="rule" />
            <p className="lead">
              Справочник по математической статистике для психологов: описательная статистика,
              проверка гипотез, размер эффекта и дизайн исследования.
            </p>
          </motion.div>

          {/* Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по термину, синониму или определению…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-3 border-foreground rounded-none font-mono text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCat(null)}
                className={`px-3 py-1 border-2 border-foreground rounded-none font-mono text-xs uppercase tracking-wider transition-colors ${
                  activeCat === null
                    ? 'bg-foreground text-background'
                    : 'bg-background hover:bg-muted'
                }`}
              >
                Все ({glossary.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(activeCat === c.id ? null : c.id)}
                  className={`px-3 py-1 border-2 border-foreground rounded-none font-mono text-xs uppercase tracking-wider transition-colors ${
                    activeCat === c.id
                      ? 'bg-foreground text-background'
                      : 'bg-background hover:bg-muted'
                  }`}
                >
                  {c.label} ({c.count})
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="kicker">
            // {filtered.length} {filtered.length === 1 ? 'термин' : 'результатов'}
          </div>

          {/* Cards */}
          <motion.div
            key={search + (activeCat ?? '')}
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid gap-3"
          >
            {filtered.map((entry) => (
              <motion.div
                key={entry.id}
                variants={fadeUp}
                transition={{ duration: 0.25 }}
                ref={(el) => {
                  cardRefs.current[entry.id] = el;
                }}
                id={entry.id}
              >
                <div className="border-3 border-foreground bg-card p-4 md:p-5 transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-sm">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          // {entry.id}
                        </span>
                        <Badge
                          variant="outline"
                          className="rounded-none border-2 font-mono text-[10px] uppercase"
                        >
                          {CATEGORY_LABELS[entry.category]}
                        </Badge>
                      </div>
                      <button
                        onClick={() => setActiveEntry(entry)}
                        className="text-left font-bold uppercase text-lg md:text-xl hover:underline decoration-2 underline-offset-4"
                      >
                        {entry.term}
                      </button>
                      <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
                        {entry.short}
                      </p>
                      {entry.aliases.length > 0 && (
                        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                          синонимы: {entry.aliases.slice(0, 5).join(' · ')}
                        </p>
                      )}
                    </div>

                    <div className="flex md:flex-col items-end gap-2 shrink-0">
                      {entry.formula && (
                        <div className="text-foreground/80 px-3 py-2 border-2 border-foreground/30 bg-background">
                          <MathFormula formula={entry.formula} />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => copyAnchor(entry.id)}
                        title="Скопировать ссылку"
                        className="p-2 border-2 border-foreground/30 hover:bg-foreground hover:text-background transition-colors"
                      >
                        <LinkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-12 font-mono uppercase text-sm">
                ничего не найдено
              </p>
            )}
          </motion.div>
        </div>

        {/* Detail dialog */}
        <GlassDialog
          open={activeEntry !== null}
          onOpenChange={(open) => {
            if (!open) setActiveEntry(null);
          }}
        >
          <GlassDialogContent dialogId={`TERM / ${activeEntry?.id?.toUpperCase() ?? ''}`}>
            {activeEntry && (
              <div className="space-y-4">
                <GlassDialogTitle>{activeEntry.term}</GlassDialogTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="rounded-none border-2 font-mono text-xs uppercase">
                    {CATEGORY_LABELS[activeEntry.category]}
                  </Badge>
                  {activeEntry.aliases.length > 0 && (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      // {activeEntry.aliases.slice(0, 5).join(', ')}
                    </span>
                  )}
                </div>
                <GlassDialogDescription className="text-base text-foreground/85 leading-relaxed">
                  {activeEntry.full}
                </GlassDialogDescription>
                {activeEntry.formula && (
                  <div className="border-3 border-foreground p-4 bg-background">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      // FORMULA
                    </p>
                    <MathFormula formula={activeEntry.formula} display />
                  </div>
                )}
                {activeEntry.relatedIds.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      // см. также
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeEntry.relatedIds.map((rid) => {
                        const r = getEntry(rid);
                        if (!r) return null;
                        return (
                          <Link
                            key={rid}
                            to={`/glossary#${rid}`}
                            onClick={() => {
                              const next = getEntry(rid);
                              if (next) setActiveEntry(next);
                            }}
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
            )}
          </GlassDialogContent>
        </GlassDialog>
      </main>
    </div>
  );
};

export default GlossaryPage;
