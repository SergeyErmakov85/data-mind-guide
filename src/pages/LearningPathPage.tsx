import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, FlaskConical } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import {
  getModuleStatus,
  getModuleProgress,
  startModule,
  type ModuleStatus,
} from '@/lib/progress';

interface PathLab {
  label: string;
  to: string;
}

interface PathModule {
  id: string;          // matches `dmg:progress` key
  number: string;      // "01" .. "08"
  title: string;
  kicker: string;
  description: string;
  estimatedMinutes: number;
  primaryHref: string; // theory or labs route (without query)
  primaryLabel: string;
  labs: PathLab[];
}

const MODULES: PathModule[] = [
  {
    id: 'intro',
    number: '01',
    title: 'Введение в статистику',
    kicker: 'MODULE 01',
    description:
      'Зачем психологу статистика, виды данных, шкалы измерений и базовая терминология.',
    estimatedMinutes: 25,
    primaryHref: '/theory',
    primaryLabel: 'Открыть теорию',
    labs: [{ label: 'Лаба «Выборка»', to: '/labs/sampling' }],
  },
  {
    id: 'descriptive',
    number: '02',
    title: 'Описательная статистика',
    kicker: 'MODULE 02',
    description:
      'Меры центральной тенденции и разброса, форма распределения, выбросы.',
    estimatedMinutes: 45,
    primaryHref: '/descriptive',
    primaryLabel: 'Открыть модуль',
    labs: [{ label: 'Курс «Описательная»', to: '/courses/descriptive' }],
  },
  {
    id: 'probability',
    number: '03',
    title: 'Теория вероятностей',
    kicker: 'MODULE 03',
    description:
      'События, комбинаторика, формула полной вероятности и схема Бернулли.',
    estimatedMinutes: 50,
    primaryHref: '/probability',
    primaryLabel: 'Открыть теорию',
    labs: [{ label: 'Лаба «Биномиальное»', to: '/labs/binomial' }],
  },
  {
    id: 'distributions',
    number: '04',
    title: 'Распределения',
    kicker: 'MODULE 04',
    description:
      'Нормальное, биномиальное и t-распределения; центральная предельная теорема.',
    estimatedMinutes: 40,
    primaryHref: '/visualizations',
    primaryLabel: 'Открыть библиотеку',
    labs: [
      { label: 'Лаба «ЦПТ»', to: '/labs/clt' },
      { label: 'Лаба «Биномиальное»', to: '/labs/binomial' },
    ],
  },
  {
    id: 'confidence',
    number: '05',
    title: 'Доверительные интервалы',
    kicker: 'MODULE 05',
    description:
      'Точечные и интервальные оценки, стандартная ошибка, интерпретация CI.',
    estimatedMinutes: 35,
    primaryHref: '/labs/confidence',
    primaryLabel: 'Открыть лабу',
    labs: [{ label: 'Лаба «Доверительные интервалы»', to: '/labs/confidence' }],
  },
  {
    id: 'hypothesis',
    number: '06',
    title: 'Проверка гипотез',
    kicker: 'MODULE 06',
    description:
      'H₀ vs H₁, p-value, ошибки I и II рода, t-тесты, ANOVA, χ².',
    estimatedMinutes: 60,
    primaryHref: '/labs/hypothesis',
    primaryLabel: 'Открыть лабу',
    labs: [
      { label: 'Лаба «t-тест»', to: '/labs/ttest' },
      { label: 'Лаба «ANOVA»', to: '/labs/anova' },
    ],
  },
  {
    id: 'correlation-regression',
    number: '07',
    title: 'Корреляция и регрессия',
    kicker: 'MODULE 07',
    description:
      'Связь переменных: r Пирсона, ρ Спирмена, простая и множественная регрессия.',
    estimatedMinutes: 55,
    primaryHref: '/labs/correlation',
    primaryLabel: 'Открыть лабу',
    labs: [
      { label: 'Лаба «Корреляция»', to: '/labs/correlation' },
      { label: 'Лаба «Регрессия»', to: '/labs/regression' },
    ],
  },
  {
    id: 'effect-power',
    number: '08',
    title: 'Эффекты и мощность',
    kicker: 'MODULE 08',
    description:
      'Размер эффекта (d Коэна, η²), априорный анализ мощности, размер выборки.',
    estimatedMinutes: 40,
    primaryHref: '/labs/effect-size',
    primaryLabel: 'Открыть лабу',
    labs: [{ label: 'Лаба «Размер эффекта»', to: '/labs/effect-size' }],
  },
];

const STATUS_LABEL: Record<ModuleStatus, string> = {
  'not-started': 'NOT STARTED',
  'in-progress': 'IN PROGRESS',
  done: 'DONE',
};

const StatusBadge = ({ status }: { status: ModuleStatus }) => {
  const styles =
    status === 'done'
      ? 'bg-foreground text-background'
      : status === 'in-progress'
        ? 'bg-primary text-primary-foreground'
        : 'bg-background text-foreground';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 border-[3px] border-foreground font-mono text-[10px] tracking-[0.15em] ${styles}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
};

const withFromPath = (href: string) =>
  `${href}${href.includes('?') ? '&' : '?'}from=path`;

const LearningPathPage = () => {
  // Re-read progress on mount (and when storage changes from another tab).
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'dmg:progress') setVersion(v => v + 1);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const totals = MODULES.reduce(
    (acc, m) => {
      const s = getModuleStatus(m.id);
      acc.minutes += m.estimatedMinutes;
      if (s === 'done') acc.done += 1;
      else if (s === 'in-progress') acc.active += 1;
      return acc;
    },
    { done: 0, active: 0, minutes: 0 }
  );

  const handleStart = (moduleId: string) => {
    startModule(moduleId);
    setVersion(v => v + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10 md:py-16">
        {/* Header */}
        <div className="max-w-3xl mb-12 md:mb-16">
          <div className="kicker mb-3">// Learning path</div>
          <h1 className="font-heading uppercase tracking-[-0.02em] text-4xl md:text-6xl leading-[0.95] mb-4">
            Маршрут обучения
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
            Восемь модулей от базовых понятий до анализа эффектов. Двигайтесь
            последовательно или возвращайтесь к нужному узлу — прогресс
            сохраняется автоматически.
          </p>

          {/* Stats strip */}
          <div className="mt-6 flex flex-wrap gap-3 font-mono text-xs">
            <div className="border-[3px] border-foreground bg-card px-3 py-2">
              <span className="text-muted-foreground">DONE / </span>
              <span className="tabular-nums">
                {String(totals.done).padStart(2, '0')} of{' '}
                {String(MODULES.length).padStart(2, '0')}
              </span>
            </div>
            <div className="border-[3px] border-foreground bg-card px-3 py-2">
              <span className="text-muted-foreground">IN PROGRESS / </span>
              <span className="tabular-nums">
                {String(totals.active).padStart(2, '0')}
              </span>
            </div>
            <div className="border-[3px] border-foreground bg-card px-3 py-2">
              <span className="text-muted-foreground">EST. TIME / </span>
              <span className="tabular-nums">~{totals.minutes} MIN</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Animated vertical connecting line */}
          <svg
            className="absolute left-[19px] md:left-[27px] top-0 h-full w-[3px] pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 3 1000"
            aria-hidden="true"
          >
            <motion.line
              x1="1.5"
              y1="0"
              x2="1.5"
              y2="1000"
              stroke="hsl(var(--foreground))"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 1.6, ease: 'easeInOut' }}
            />
          </svg>

          <ol className="space-y-8 md:space-y-10" key={version}>
            {MODULES.map((mod, idx) => {
              const status = getModuleStatus(mod.id);
              const progress = getModuleProgress(mod.id);
              const nodeStyles =
                status === 'done'
                  ? 'bg-foreground text-background'
                  : status === 'in-progress'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-foreground';

              return (
                <motion.li
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: idx * 0.04 }}
                  className="relative pl-14 md:pl-20"
                >
                  {/* Node square */}
                  <div
                    className={`absolute left-0 top-0 w-10 h-10 md:w-14 md:h-14 border-[3px] border-foreground flex items-center justify-center font-mono text-sm md:text-base font-bold tabular-nums ${nodeStyles}`}
                  >
                    {mod.number}
                  </div>

                  {/* Card */}
                  <article className="border-[3px] border-foreground bg-card p-5 md:p-6 space-y-4 transition-transform duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal">
                    <header className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="kicker">{mod.kicker}</div>
                        <h2 className="font-heading uppercase text-xl md:text-2xl leading-tight">
                          {mod.title}
                        </h2>
                      </div>
                      <StatusBadge status={status} />
                    </header>

                    <p className="text-sm md:text-base text-muted-foreground">
                      {mod.description}
                    </p>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="tabular-nums">
                          ~{mod.estimatedMinutes} MIN
                        </span>
                      </span>
                      {progress.percent > 0 && (
                        <span className="tabular-nums">
                          PROGRESS / {progress.percent}%
                        </span>
                      )}
                    </div>

                    {/* Progress bar (only when started) */}
                    {progress.percent > 0 && (
                      <div className="h-[3px] w-full bg-muted">
                        <div
                          className="h-full bg-foreground transition-[width] duration-300"
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                    )}

                    {/* Linked labs */}
                    {mod.labs.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="kicker">Связанные лабы</div>
                        <ul className="flex flex-wrap gap-2">
                          {mod.labs.map(lab => (
                            <li key={lab.to}>
                              <Link
                                to={withFromPath(lab.to)}
                                onClick={() => handleStart(mod.id)}
                                className="inline-flex items-center gap-1.5 border-[3px] border-foreground bg-background px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-transform duration-150 hover:-translate-y-[1px]"
                              >
                                <FlaskConical className="w-3 h-3" />
                                {lab.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="pt-2">
                      <Button
                        asChild
                        className="rounded-none border-[3px] border-foreground gap-2 font-mono uppercase tracking-wider"
                      >
                        <Link
                          to={withFromPath(mod.primaryHref)}
                          onClick={() => handleStart(mod.id)}
                        >
                          {status === 'done'
                            ? 'Повторить модуль'
                            : status === 'in-progress'
                              ? 'Продолжить модуль'
                              : 'Начать модуль'}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </article>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </main>
    </div>
  );
};

export default LearningPathPage;
