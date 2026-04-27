import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy, Clock, Target, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MathFormula } from '@/components/MathFormula';
import {
  GlassDialog,
  GlassDialogContent,
  GlassDialogTitle,
  GlassDialogDescription,
  GlassDialogFooter,
} from '@/components/ui/glass-dialog';
import { saveQuizScore } from '@/lib/progress';

/* ============================================================
 *  TYPES
 *  ──────────────────────────────────────────────────────────
 *  New canonical types: 'single' | 'multiple' | 'numeric' | 'matching'.
 *  Backward-compatible aliases: 'multiple-choice'|'interpretation' → single,
 *  'calculation' → numeric.
 * ============================================================ */

export type QuizQuestionType =
  | 'single'
  | 'multiple'
  | 'numeric'
  | 'matching'
  // legacy aliases (kept so existing call-sites continue to work)
  | 'multiple-choice'
  | 'interpretation'
  | 'calculation';

export interface MatchingPair {
  left: string;
  right: string;
}

/** Optional theory link surfaced in the explanation block. */
export interface TheoryRef {
  label: string;
  to: string; // react-router path, may include #anchor
}

/** Optional glossary term reference (lightweight inline link). */
export interface TermRef {
  term: string;
  to: string; // e.g. /glossary#p-value
  short?: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  /** KaTeX rendered above options (optional). */
  formula?: string;
  /** For single/multiple: option labels. May contain inline KaTeX wrapped in $...$ — handled by KatexInline. */
  options?: string[];
  /** For matching: pairs in canonical order. UI shuffles right column. */
  pairs?: MatchingPair[];
  /**
   * Correct answer:
   * - 'single' / legacy: stringified index, e.g. "0"
   * - 'multiple': array of stringified indices, e.g. ["0","2"]
   * - 'numeric' / 'calculation': number
   * - 'matching': record { leftIndex: rightIndex } (canonical = identity)
   */
  correctAnswer: string | number | string[] | Record<number, number>;
  /** Tolerance for numeric answers. Default 0.01. */
  tolerance?: number;
  /** Why the correct answer is right — supports rich content. */
  explanation: ReactNode;
  /**
   * Per-distractor reasons. Key = stringified option index, value = explanation
   * shown when the user selected that wrong option.
   */
  distractorExplanations?: Record<string, ReactNode>;
  /** Pointer to the theory section that covers this material. */
  theoryRef?: TheoryRef;
  /** Glossary terms relevant to the explanation. */
  terms?: TermRef[];
  /** Tags used to compute "weak topics" on the result screen. */
  tags?: string[];
}

interface QuizProps {
  /** Stable id for localStorage persistence. */
  quizId?: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
}

/* ============================================================
 *  HELPERS
 * ============================================================ */

const STORAGE_PREFIX = 'dmg:quiz:';

interface StoredQuizResult {
  bestScore: number;
  lastAttemptAt: string;
  attempts: number;
}

const loadResult = (quizId: string): StoredQuizResult | null => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + quizId);
    return raw ? (JSON.parse(raw) as StoredQuizResult) : null;
  } catch {
    return null;
  }
};

const saveResult = (quizId: string, scorePct: number) => {
  try {
    const prev = loadResult(quizId);
    const next: StoredQuizResult = {
      bestScore: Math.max(prev?.bestScore ?? 0, scorePct),
      lastAttemptAt: new Date().toISOString(),
      attempts: (prev?.attempts ?? 0) + 1,
    };
    localStorage.setItem(STORAGE_PREFIX + quizId, JSON.stringify(next));
  } catch {
    /* ignore */
  }
};

/** Normalize legacy types to the new canonical set. */
const normalizeType = (t: QuizQuestionType): 'single' | 'multiple' | 'numeric' | 'matching' => {
  if (t === 'multiple-choice' || t === 'interpretation') return 'single';
  if (t === 'calculation') return 'numeric';
  return t;
};

/** Stable shuffle using Fisher–Yates. */
const shuffle = <T,>(arr: T[]): T[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const formatTime = (ms: number) => {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

/* ============================================================
 *  KATEX INLINE — renders text with $...$ math segments.
 * ============================================================ */

const KatexInline = ({ text }: { text: string }) => {
  const parts = useMemo(() => text.split(/(\$[^$]+\$)/g), [text]);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('$') && p.endsWith('$') ? (
          <MathFormula key={i} formula={p.slice(1, -1)} />
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
};

/* ============================================================
 *  TERM TIP — lightweight inline link to glossary.
 * ============================================================ */

const TermTipLink = ({ term, to, short }: TermRef) => (
  <Link
    to={to}
    title={short}
    className="font-mono text-xs uppercase tracking-wider underline decoration-dotted underline-offset-4 hover:text-primary"
  >
    {term}
  </Link>
);

/* ============================================================
 *  QUIZ COMPONENT
 * ============================================================ */

export const Quiz = ({ quizId, title, description, questions: initialQuestions }: QuizProps) => {
  const storageId = quizId ?? title.toLowerCase().replace(/\s+/g, '-');

  // Active question set (may be a "retry only wrong" subset).
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions);

  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);

  // Per-question state
  const [singleSel, setSingleSel] = useState<string | null>(null);
  const [multiSel, setMultiSel] = useState<string[]>([]);
  const [numInput, setNumInput] = useState('');
  const [matchSel, setMatchSel] = useState<Record<number, number>>({});

  // Per-question shuffled right column for matching, memoised by qid.
  const matchingRightOrderRef = useRef<Record<string, number[]>>({});

  // Aggregate state
  const [score, setScore] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [tagStats, setTagStats] = useState<Record<string, { correct: number; total: number }>>({});
  const [finished, setFinished] = useState(false);

  const startedAtRef = useRef<number>(Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);

  const stored = useMemo(() => loadResult(storageId), [storageId]);

  // When the question set changes (restart/retry), re-init.
  useEffect(() => {
    startedAtRef.current = Date.now();
    setElapsedMs(0);
  }, [questions]);

  const q = questions[current];
  const qType = normalizeType(q.type);

  // Build matching right column order once per question id.
  if (qType === 'matching' && q.pairs && !matchingRightOrderRef.current[q.id]) {
    matchingRightOrderRef.current[q.id] = shuffle(q.pairs.map((_, i) => i));
  }

  const canSubmit = (() => {
    switch (qType) {
      case 'single':
        return singleSel !== null;
      case 'multiple':
        return multiSel.length > 0;
      case 'numeric':
        return numInput.trim() !== '';
      case 'matching':
        return q.pairs ? Object.keys(matchSel).length === q.pairs.length : false;
    }
  })();

  const checkAnswer = () => {
    let isCorrect = false;
    switch (qType) {
      case 'single': {
        isCorrect = singleSel === String(q.correctAnswer);
        break;
      }
      case 'multiple': {
        const expected = (q.correctAnswer as string[]).slice().sort().join(',');
        const got = multiSel.slice().sort().join(',');
        isCorrect = expected === got;
        break;
      }
      case 'numeric': {
        const n = parseFloat(numInput.replace(',', '.'));
        const exp = typeof q.correctAnswer === 'number'
          ? q.correctAnswer
          : parseFloat(String(q.correctAnswer));
        const tol = q.tolerance ?? 0.01;
        isCorrect = !isNaN(n) && Math.abs(n - exp) <= tol;
        break;
      }
      case 'matching': {
        const expected = q.correctAnswer as Record<number, number>;
        isCorrect = !!q.pairs && q.pairs.every((_, i) => matchSel[i] === expected[i]);
        break;
      }
    }

    setCorrect(isCorrect);
    setAnswered(true);

    if (isCorrect) {
      setScore(s => s + 1);
    } else {
      setWrongIds(ids => (ids.includes(q.id) ? ids : [...ids, q.id]));
    }

    // Tag aggregation
    if (q.tags?.length) {
      setTagStats(prev => {
        const next = { ...prev };
        for (const t of q.tags!) {
          const cur = next[t] ?? { correct: 0, total: 0 };
          next[t] = { correct: cur.correct + (isCorrect ? 1 : 0), total: cur.total + 1 };
        }
        return next;
      });
    }
  };

  const next = () => {
    if (current + 1 >= questions.length) {
      const elapsed = Date.now() - startedAtRef.current;
      setElapsedMs(elapsed);
      setFinished(true);
      const pct = Math.round((score / questions.length) * 100);
      saveResult(storageId, pct);
      saveQuizScore(storageId, pct);
    } else {
      setCurrent(c => c + 1);
      resetQuestionState();
    }
  };

  const resetQuestionState = () => {
    setSingleSel(null);
    setMultiSel([]);
    setNumInput('');
    setMatchSel({});
    setAnswered(false);
    setCorrect(false);
  };

  const restart = (subset?: QuizQuestion[]) => {
    setQuestions(subset && subset.length > 0 ? subset : initialQuestions);
    setCurrent(0);
    resetQuestionState();
    setScore(0);
    setWrongIds([]);
    setTagStats({});
    setFinished(false);
  };

  const retryWrongOnly = () => {
    const wrongs = initialQuestions.filter(qq => wrongIds.includes(qq.id));
    restart(wrongs);
  };

  const pct = Math.round((score / questions.length) * 100);

  // Weak topics: tags with <70% correct.
  const weakTopics = useMemo(
    () =>
      Object.entries(tagStats)
        .map(([tag, s]) => ({ tag, pct: Math.round((s.correct / s.total) * 100), ...s }))
        .filter(t => t.pct < 70)
        .sort((a, b) => a.pct - b.pct),
    [tagStats]
  );

  /* ----------------------------------------------------------
   *  RENDER
   * ---------------------------------------------------------- */

  return (
    <>
      {/* ============== RESULT DIALOG ============== */}
      <GlassDialog
        open={finished}
        onOpenChange={(open) => {
          if (!open) restart();
        }}
      >
        <GlassDialogContent dialogId={`QUIZ_RESULT / ${title.toUpperCase()}`}>
          <div className="text-center space-y-3">
            <Trophy className={`w-14 h-14 mx-auto ${pct >= 70 ? 'text-success' : 'text-warning'}`} />
            <GlassDialogTitle>
              {pct >= 70 ? 'Отличный результат!' : 'Есть над чем поработать'}
            </GlassDialogTitle>
            <GlassDialogDescription>
              <span className="font-mono tabular-nums font-bold text-2xl">{pct}%</span>{' '}
              <span className="text-muted-foreground">
                ({score} / {questions.length})
              </span>
            </GlassDialogDescription>
          </div>

          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="border-3 border-foreground p-3">
              <div className="kicker flex items-center gap-1"><Clock className="w-3 h-3" /> Время</div>
              <div className="font-mono tabular-nums text-xl mt-1">{formatTime(elapsedMs)}</div>
            </div>
            <div className="border-3 border-foreground p-3">
              <div className="kicker flex items-center gap-1"><Target className="w-3 h-3" /> Лучший</div>
              <div className="font-mono tabular-nums text-xl mt-1">
                {Math.max(stored?.bestScore ?? 0, pct)}%
              </div>
            </div>
          </div>

          {weakTopics.length > 0 && (
            <div className="space-y-2 my-3">
              <div className="kicker">Слабые темы</div>
              <ul className="space-y-1">
                {weakTopics.map(t => (
                  <li key={t.tag} className="flex items-center justify-between text-sm border-l-3 border-destructive pl-2">
                    <span>{t.tag}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">
                      {t.correct}/{t.total} · {t.pct}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <GlassDialogFooter>
            {wrongIds.length > 0 && (
              <Button onClick={retryWrongOnly} variant="outline" className="gap-2">
                <Target className="w-4 h-4" /> Повторить только ошибки ({wrongIds.length})
              </Button>
            )}
            <Button onClick={() => restart()} className="gap-2">
              <RotateCcw className="w-4 h-4" /> Пройти ещё раз
            </Button>
          </GlassDialogFooter>
        </GlassDialogContent>
      </GlassDialog>

      {/* ============== MAIN CARD ============== */}
      <Card className="border-3 border-foreground rounded-none">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="kicker">Quiz</div>
              <CardTitle className="text-xl md:text-2xl font-heading uppercase tracking-tight mt-1">
                {title}
              </CardTitle>
            </div>
            <Badge variant="outline" className="font-mono tabular-nums shrink-0 border-3 rounded-none">
              {current + 1} / {questions.length}
            </Badge>
          </div>
          {description && <CardDescription className="mt-2">{description}</CardDescription>}
          <Progress value={((current + (answered ? 1 : 0)) / questions.length) * 100} className="h-1 mt-3" />
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Question stem */}
          <div className="space-y-3">
            {q.tags && q.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {q.tags.map(t => (
                  <span key={t} className="kicker">#{t}</span>
                ))}
              </div>
            )}
            <p className="font-medium text-base leading-relaxed">
              <KatexInline text={q.question} />
            </p>
            {q.formula && <MathFormula formula={q.formula} display />}
          </div>

          {/* SINGLE */}
          {qType === 'single' && q.options && (
            <div role="radiogroup" aria-label={q.question} className="space-y-2">
              {q.options.map((opt, i) => {
                const letter = String(i);
                const isSelected = singleSel === letter;
                const isCorrectOpt = answered && letter === String(q.correctAnswer);
                const isWrong = answered && isSelected && !correct;
                return (
                  <button
                    key={i}
                    role="radio"
                    aria-checked={isSelected}
                    aria-describedby={answered ? `expl-${q.id}` : undefined}
                    onClick={() => !answered && setSingleSel(letter)}
                    disabled={answered}
                    className={`w-full text-left p-3 border-3 transition-colors text-sm rounded-none focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                      isCorrectOpt ? 'border-success bg-success/10' :
                      isWrong ? 'border-destructive bg-destructive/10' :
                      isSelected ? 'border-primary bg-primary/5' :
                      'border-border hover:border-foreground/50'
                    }`}
                  >
                    <span className="font-mono text-xs text-muted-foreground mr-2">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <KatexInline text={opt} />
                  </button>
                );
              })}
            </div>
          )}

          {/* MULTIPLE */}
          {qType === 'multiple' && q.options && (
            <div role="group" aria-label={q.question} className="space-y-2">
              {q.options.map((opt, i) => {
                const letter = String(i);
                const isSelected = multiSel.includes(letter);
                const expectedArr = q.correctAnswer as string[];
                const isCorrectOpt = answered && expectedArr.includes(letter);
                const isWrong = answered && isSelected && !isCorrectOpt;
                return (
                  <label
                    key={i}
                    className={`flex items-start gap-3 p-3 border-3 cursor-pointer rounded-none transition-colors ${
                      isCorrectOpt ? 'border-success bg-success/10' :
                      isWrong ? 'border-destructive bg-destructive/10' :
                      isSelected ? 'border-primary bg-primary/5' :
                      'border-border hover:border-foreground/50'
                    } ${answered ? 'cursor-default' : ''}`}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={answered}
                      onCheckedChange={(v) => {
                        if (answered) return;
                        setMultiSel(prev => v ? [...prev, letter] : prev.filter(x => x !== letter));
                      }}
                      aria-describedby={answered ? `expl-${q.id}` : undefined}
                      className="mt-0.5"
                    />
                    <span className="text-sm">
                      <span className="font-mono text-xs text-muted-foreground mr-2">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <KatexInline text={opt} />
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {/* NUMERIC */}
          {qType === 'numeric' && (
            <div className="space-y-2">
              <Input
                type="text"
                inputMode="decimal"
                placeholder="Введите число (допустима десятичная дробь)..."
                value={numInput}
                onChange={e => setNumInput(e.target.value)}
                disabled={answered}
                aria-describedby={answered ? `expl-${q.id}` : undefined}
                className="font-mono tabular-nums border-3 rounded-none focus-visible:ring-[3px] focus-visible:ring-ring"
              />
              {q.tolerance != null && !answered && (
                <p className="text-xs text-muted-foreground font-mono">
                  допуск: ±{q.tolerance}
                </p>
              )}
            </div>
          )}

          {/* MATCHING */}
          {qType === 'matching' && q.pairs && (
            <div className="space-y-2">
              {q.pairs.map((pair, leftIdx) => {
                const expected = q.correctAnswer as Record<number, number>;
                const selectedRight = matchSel[leftIdx];
                const isCorrectRow = answered && selectedRight === expected[leftIdx];
                return (
                  <div
                    key={leftIdx}
                    className={`grid grid-cols-[1fr_auto_2fr] items-center gap-2 p-2 border-3 rounded-none ${
                      answered
                        ? isCorrectRow ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10'
                        : 'border-border'
                    }`}
                  >
                    <span className="text-sm font-medium"><KatexInline text={pair.left} /></span>
                    <span className="font-mono text-muted-foreground">→</span>
                    <select
                      value={selectedRight ?? ''}
                      disabled={answered}
                      onChange={e => setMatchSel(prev => ({ ...prev, [leftIdx]: Number(e.target.value) }))}
                      aria-describedby={answered ? `expl-${q.id}` : undefined}
                      className="border-3 border-foreground bg-background p-2 text-sm rounded-none focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                    >
                      <option value="" disabled>— выберите —</option>
                      {(matchingRightOrderRef.current[q.id] ?? q.pairs!.map((_, i) => i)).map(rightIdx => (
                        <option key={rightIdx} value={rightIdx}>
                          {q.pairs![rightIdx].right}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
              {answered && (
                <p className="text-xs text-muted-foreground font-mono">
                  Правильно сопоставлено: {q.pairs.filter((_, i) => matchSel[i] === (q.correctAnswer as Record<number, number>)[i]).length}/{q.pairs.length}
                </p>
              )}
            </div>
          )}

          {/* EXPLANATION */}
          {answered && (
            <div
              id={`expl-${q.id}`}
              className={`border-3 p-4 space-y-3 ${correct ? 'border-success bg-success/5' : 'border-destructive bg-destructive/5'}`}
            >
              <div className="flex items-center gap-2">
                {correct
                  ? <CheckCircle2 className="w-5 h-5 text-success" />
                  : <XCircle className="w-5 h-5 text-destructive" />}
                <span className="font-heading uppercase tracking-tight">
                  {correct ? 'Верно' : 'Неверно'}
                </span>
              </div>

              {/* Why correct */}
              <div className="space-y-1">
                <div className="kicker">
                  Почему верный ответ
                  {qType === 'single' && q.options
                    ? ` — ${String.fromCharCode(65 + Number(q.correctAnswer))}`
                    : qType === 'multiple' && Array.isArray(q.correctAnswer)
                      ? ` — ${(q.correctAnswer as string[]).map(i => String.fromCharCode(65 + Number(i))).join(', ')}`
                      : qType === 'numeric'
                        ? ` — ${q.correctAnswer}`
                        : ''}
                </div>
                <div className="text-sm leading-relaxed">{q.explanation}</div>
              </div>

              {/* Why your selection is wrong (per distractor) */}
              {!correct && qType === 'single' && singleSel != null && q.distractorExplanations?.[singleSel] && (
                <div className="space-y-1">
                  <div className="kicker">Почему ваш ответ неверен</div>
                  <div className="text-sm leading-relaxed border-l-3 border-destructive pl-3">
                    <span className="font-mono text-xs text-muted-foreground mr-1">
                      {String.fromCharCode(65 + Number(singleSel))}.
                    </span>
                    {q.distractorExplanations[singleSel]}
                  </div>
                </div>
              )}
              {!correct && qType === 'multiple' && q.distractorExplanations && (
                <div className="space-y-1">
                  <div className="kicker">Почему ваши выборы неверны</div>
                  {multiSel
                    .filter(i => !(q.correctAnswer as string[]).includes(i) && q.distractorExplanations![i])
                    .map(i => (
                      <div key={i} className="text-sm border-l-3 border-destructive pl-3">
                        <span className="font-mono text-xs text-muted-foreground mr-1">
                          {String.fromCharCode(65 + Number(i))}.
                        </span>
                        {q.distractorExplanations![i]}
                      </div>
                    ))}
                </div>
              )}

              {/* Terms */}
              {q.terms && q.terms.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="kicker">Термины:</span>
                  {q.terms.map(t => <TermTipLink key={t.term} {...t} />)}
                </div>
              )}

              {/* Theory link */}
              {q.theoryRef && (
                <Link
                  to={q.theoryRef.to}
                  className="inline-flex items-center gap-1 text-sm font-mono uppercase tracking-wider text-primary hover:underline"
                >
                  <BookOpen className="w-4 h-4" />
                  {q.theoryRef.label} →
                </Link>
              )}
            </div>
          )}

          {/* FOOTER */}
          <div className="flex justify-end gap-2 pt-2">
            {!answered ? (
              <Button onClick={checkAnswer} disabled={!canSubmit}>
                Проверить
              </Button>
            ) : (
              <Button onClick={next} className="gap-2">
                {current + 1 < questions.length
                  ? <>Далее <ArrowRight className="w-4 h-4" /></>
                  : 'Результат'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
