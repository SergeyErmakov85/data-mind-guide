import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, FlaskConical, BookCheck } from 'lucide-react';
import { MathFormula } from '@/components/MathFormula';
import { Quiz, QuizQuestion } from '@/components/Quiz';
import {
  GlassDialog,
  GlassDialogContent,
  GlassDialogTitle,
} from '@/components/ui/glass-dialog';
import { Button } from '@/components/ui/button';

export interface TheorySection {
  id: string;
  kicker: string;
  title: string;
  intro: string;
  /** Optional explicit "what you will understand" bullets. If omitted, derived from `intro`. */
  takeaways?: string[];
  body: ReactNode;
  formulas?: { tex: string; label?: string }[];
  examples?: { title: string; body: ReactNode }[];
  pitfalls?: string[];
  summary?: string;
  /** Path to associated lab, e.g. "/labs/correlation". */
  labPath?: string;
  labLabel?: string;
  /** Quiz questions for the in-section quiz dialog. */
  quizQuestions?: QuizQuestion[];
  quizTitle?: string;
}

interface TheoryLayoutProps {
  pageKicker?: string;
  pageTitle: string;
  pageDescription?: string;
  sections: TheorySection[];
}

/* ===== Building blocks ===== */

const FormulaBox = ({ tex, label }: { tex: string; label?: string }) => (
  <div className="border-3 border-foreground bg-muted p-4 space-y-2 rounded-none">
    {label && <div className="kicker">{label}</div>}
    <MathFormula formula={tex} display />
  </div>
);

const ExampleBox = ({ title, body }: { title: string; body: ReactNode }) => (
  <div className="border-3 border-foreground bg-card p-4 md:p-5 space-y-2 rounded-none">
    <div className="kicker">Пример</div>
    <h4 className="font-heading uppercase text-sm md:text-base">{title}</h4>
    <div className="text-sm md:text-base text-muted-foreground space-y-2">{body}</div>
  </div>
);

const PitfallsBox = ({ items }: { items: string[] }) => (
  <div className="border-l-[3px] border-destructive bg-destructive/5 pl-4 py-3 space-y-2">
    <div className="flex items-center gap-2 text-destructive">
      <AlertTriangle className="w-4 h-4" />
      <span className="kicker !text-destructive">Типичные ошибки</span>
    </div>
    <ul className="space-y-1.5 text-sm">
      {items.map((p, i) => (
        <li key={i} className="text-foreground/90">— {p}</li>
      ))}
    </ul>
  </div>
);

const SummaryBox = ({ text }: { text: string }) => (
  <div className="bg-foreground text-background p-4 md:p-5 font-mono text-sm md:text-base leading-relaxed">
    <div className="kicker !text-background/60 mb-2">// Резюме</div>
    {text}
  </div>
);

const SectionCTA = ({
  section,
  onOpenQuiz,
}: {
  section: TheorySection;
  onOpenQuiz: () => void;
}) => {
  if (!section.labPath && !section.quizQuestions) return null;
  return (
    <div className="border-3 border-foreground bg-primary/5 p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <div className="kicker">Закрепить</div>
        <p className="font-heading uppercase text-base md:text-lg mt-1">
          Перейти к практике
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {section.labPath && (
          <Button asChild variant="outline" className="rounded-none border-3 border-foreground gap-2">
            <Link to={section.labPath}>
              <FlaskConical className="w-4 h-4" />
              {section.labLabel ?? 'Открыть лабу'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        )}
        {section.quizQuestions && section.quizQuestions.length > 0 && (
          <Button onClick={onOpenQuiz} className="rounded-none border-3 border-foreground gap-2">
            <BookCheck className="w-4 h-4" />
            Решить тест
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

/* ===== Reading-progress hook for currently-active section ===== */

const useReadingProgress = (activeId: string | null) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!activeId) return;
    const el = document.getElementById(activeId);
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh * 0.5;
      const scrolled = vh - rect.top;
      const pct = Math.max(0, Math.min(1, scrolled / total));
      setProgress(pct);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [activeId]);
  return progress;
};

/* ===== Main layout ===== */

export const TheoryLayout = ({
  pageKicker,
  pageTitle,
  pageDescription,
  sections,
}: TheoryLayoutProps) => {
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null);
  const [quizOpenId, setQuizOpenId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progress = useReadingProgress(activeId);

  // IntersectionObserver: pick the section closest to the top of the viewport.
  useEffect(() => {
    const els = sections
      .map(s => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);

    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5, 1] }
    );

    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const derivedTakeaways = useMemo(() => {
    const map = new Map<string, string[]>();
    sections.forEach(s => {
      if (s.takeaways && s.takeaways.length) {
        map.set(s.id, s.takeaways.slice(0, 3));
      } else {
        const sentences = s.intro
          .split(/(?<=[.!?])\s+/)
          .map(x => x.trim())
          .filter(Boolean)
          .slice(0, 3);
        map.set(s.id, sentences);
      }
    });
    return map;
  }, [sections]);

  const activeQuizSection = sections.find(s => s.id === quizOpenId);

  return (
    <div className="container py-8 md:py-12">
      {/* Page header */}
      <div className="mb-10 md:mb-14 max-w-3xl">
        {pageKicker && <div className="kicker mb-3">{pageKicker}</div>}
        <h1 className="font-heading uppercase tracking-[-0.02em] text-4xl md:text-6xl leading-[0.95] mb-4">
          {pageTitle}
        </h1>
        {pageDescription && (
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
            {pageDescription}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10" ref={containerRef}>
        {/* Sticky TOC */}
        <aside className="hidden md:block md:col-span-3">
          <div className="sticky top-24 space-y-4">
            <div className="kicker">Оглавление</div>
            <nav className="space-y-1.5">
              {sections.map((s, i) => {
                const isActive = activeId === s.id;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={() => setActiveId(s.id)}
                    className={`block text-xs font-mono uppercase tracking-wider py-1.5 pl-3 border-l-[3px] transition-all ${
                      isActive
                        ? 'border-foreground text-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/60'
                    }`}
                  >
                    <span className="opacity-50 mr-1.5">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {s.title}
                  </a>
                );
              })}
            </nav>
            {/* Reading progress for active section */}
            {activeId && (
              <div className="pt-3 space-y-1.5">
                <div className="kicker text-[10px]">Прочитано</div>
                <div className="h-[3px] w-full bg-muted">
                  <div
                    className="h-full bg-foreground transition-[width] duration-100"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
                <div className="font-mono text-[10px] text-muted-foreground tabular-nums">
                  {Math.round(progress * 100)}%
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main column */}
        <main className="md:col-span-9 space-y-16 md:space-y-24 min-w-0">
          {sections.map((section, idx) => {
            const takeaways = derivedTakeaways.get(section.id) ?? [];
            return (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5 }}
                className="scroll-mt-24 space-y-6 md:space-y-8"
              >
                {/* Section header */}
                <header className="space-y-2">
                  <div className="kicker">
                    // {String(idx + 1).padStart(2, '0')} — {section.kicker}
                  </div>
                  <h2 className="font-heading uppercase text-3xl md:text-5xl leading-tight tracking-[-0.01em]">
                    {section.title}
                  </h2>
                  <div className="rule" />
                  {section.intro && (
                    <p className="lead text-muted-foreground max-w-3xl">{section.intro}</p>
                  )}
                </header>

                {/* What you will understand */}
                {takeaways.length > 0 && (
                  <div className="border-3 border-foreground p-4 md:p-5 bg-card">
                    <div className="kicker mb-3">Что вы поймёте</div>
                    <ul className="space-y-1.5 text-sm md:text-base">
                      {takeaways.map((t, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="font-mono text-muted-foreground tabular-nums shrink-0">
                            0{i + 1}
                          </span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Body */}
                <div className="space-y-6">{section.body}</div>

                {/* Formulas */}
                {section.formulas && section.formulas.length > 0 && (
                  <div className="space-y-3">
                    <div className="kicker">Формулы</div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {section.formulas.map((f, i) => (
                        <FormulaBox key={i} tex={f.tex} label={f.label} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Examples */}
                {section.examples && section.examples.length > 0 && (
                  <div className="space-y-3">
                    {section.examples.map((ex, i) => (
                      <ExampleBox key={i} title={ex.title} body={ex.body} />
                    ))}
                  </div>
                )}

                {/* Pitfalls */}
                {section.pitfalls && section.pitfalls.length > 0 && (
                  <PitfallsBox items={section.pitfalls} />
                )}

                {/* Summary */}
                {section.summary && <SummaryBox text={section.summary} />}

                {/* CTA */}
                <SectionCTA
                  section={section}
                  onOpenQuiz={() => setQuizOpenId(section.id)}
                />
              </motion.section>
            );
          })}
        </main>
      </div>

      {/* Quiz dialog */}
      <GlassDialog
        open={!!quizOpenId}
        onOpenChange={open => !open && setQuizOpenId(null)}
      >
        <GlassDialogContent
          dialogId={`QUIZ / ${activeQuizSection?.title.toUpperCase() ?? ''}`}
          className="max-w-2xl"
        >
          <GlassDialogTitle>
            {activeQuizSection?.quizTitle ?? activeQuizSection?.title ?? 'Тест'}
          </GlassDialogTitle>
          {activeQuizSection?.quizQuestions && (
            <div className="mt-4">
              <Quiz
                title={activeQuizSection.quizTitle ?? activeQuizSection.title}
                questions={activeQuizSection.quizQuestions}
              />
            </div>
          )}
        </GlassDialogContent>
      </GlassDialog>
    </div>
  );
};
