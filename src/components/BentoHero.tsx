import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calculator, FlaskConical, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTotalProgress } from '@/lib/progress';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const tile = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const tileBase =
  'border-3 border-foreground rounded-none bg-card transition-all duration-150 ' +
  'hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal';

// Static normal-curve SVG path (μ=0, σ=1), x in [-3.2, 3.2]
const buildBellPath = (w: number, h: number) => {
  const padX = 8;
  const padY = 16;
  const xs = Array.from({ length: 81 }, (_, i) => -3.2 + (i * 6.4) / 80);
  const ys = xs.map((x) => Math.exp(-(x * x) / 2) / Math.sqrt(2 * Math.PI));
  const yMax = Math.max(...ys);
  const toPx = (x: number, y: number) => {
    const px = padX + ((x + 3.2) / 6.4) * (w - padX * 2);
    const py = h - padY - (y / yMax) * (h - padY * 2);
    return [px, py] as const;
  };
  return xs
    .map((x, i) => {
      const [px, py] = toPx(x, ys[i]);
      return `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
    })
    .join(' ');
};

const BentoHero = () => {
  const progress = getTotalProgress();

  // 4 checkpoints derived from existing localStorage progress
  const checkpoints = [
    { label: 'Описательная', done: progress.topics > 0 || progress.labs >= 1 },
    { label: 'Вероятность', done: progress.topics >= 2 || progress.labs >= 3 },
    { label: 'Гипотезы', done: progress.quizzes >= 1 || progress.labs >= 6 },
    { label: 'Регрессия', done: progress.labs >= 9 },
  ];
  const doneCount = checkpoints.filter((c) => c.done).length;
  const fillPct = (doneCount / checkpoints.length) * 100;

  const bellPath = buildBellPath(400, 200);

  return (
    <section className="container mx-auto px-4 py-12">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-12 auto-rows-min gap-4 md:gap-6"
        initial="hidden"
        animate="visible"
        variants={container}
      >
        {/* 1. HERO */}
        <motion.article
          variants={tile}
          className={`${tileBase} col-span-1 md:col-span-7 md:row-span-2 p-8 md:p-10 flex gap-6`}
        >
          <div className="font-mono text-5xl md:text-6xl font-bold text-foreground/80 leading-none shrink-0">
            01
          </div>
          <div className="flex flex-col gap-6">
            <h1 className="font-heading uppercase tracking-tight font-bold text-4xl md:text-6xl leading-[0.95]">
              Математическая
              <br />
              статистика
              <br />
              <span className="text-primary">для психологов</span>
            </h1>
            <p className="font-body text-base md:text-lg text-muted-foreground max-w-xl">
              Современный исследовательский инструмент: интерактивные лаборатории,
              калькуляторы и теория — без лишних формальностей.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link to="/courses">
                <Button className="btn-primary gap-2">
                  Начать обучение
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/calculators">
                <Button
                  variant="outline"
                  className="border-3 border-foreground rounded-none font-mono uppercase tracking-wider bg-background hover:bg-foreground hover:text-background"
                >
                  <Calculator className="w-4 h-4" />
                  Открыть калькуляторы
                </Button>
              </Link>
            </div>
          </div>
        </motion.article>

        {/* 2. NORMAL DISTRIBUTION VISUAL */}
        <motion.article
          variants={tile}
          className={`${tileBase} col-span-1 md:col-span-5 md:row-span-2 bg-primary text-primary-foreground p-6 flex flex-col`}
        >
          <div className="font-mono text-xs uppercase tracking-widest opacity-70">
            Fig. 02
          </div>
          <div className="flex-1 flex items-center justify-center">
            <svg
              viewBox="0 0 400 200"
              className="w-full h-auto max-h-64"
              role="img"
              aria-label="Кривая нормального распределения"
            >
              {/* baseline */}
              <line
                x1="8"
                y1="184"
                x2="392"
                y2="184"
                stroke="currentColor"
                strokeOpacity="0.3"
                strokeWidth="1"
              />
              {/* mean line */}
              <line
                x1="200"
                y1="20"
                x2="200"
                y2="184"
                stroke="currentColor"
                strokeOpacity="0.25"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <path
                d={bellPath}
                fill="none"
                stroke="hsl(0 0% 100%)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="font-heading uppercase tracking-tight text-2xl md:text-3xl font-bold mt-4">
            Распределения
          </div>
          <div className="font-mono text-xs uppercase tracking-widest opacity-70 mt-1">
            μ = 0 · σ = 1
          </div>
        </motion.article>

        {/* 3. COUNTER LABS */}
        <motion.div variants={tile} className="col-span-1 md:col-span-3">
          <Link to="/labs" className={`${tileBase} block p-6 h-full group`}>
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              # Labs
            </div>
            <div className="font-mono font-bold text-5xl md:text-6xl mt-4 leading-none">
              13
            </div>
            <div className="font-heading uppercase tracking-tight text-lg font-bold mt-2">
              Лаб
            </div>
            <div className="flex items-center gap-2 mt-4 font-mono text-xs uppercase tracking-wider text-primary">
              <FlaskConical className="w-4 h-4" />
              Открыть
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </motion.div>

        {/* 4. COUNTER GLOSSARY */}
        <motion.div variants={tile} className="col-span-1 md:col-span-3">
          <Link to="/glossary" className={`${tileBase} block p-6 h-full group`}>
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              # Glossary
            </div>
            <div className="font-mono font-bold text-5xl md:text-6xl mt-4 leading-none">
              150+
            </div>
            <div className="font-heading uppercase tracking-tight text-lg font-bold mt-2">
              Терминов
            </div>
            <div className="flex items-center gap-2 mt-4 font-mono text-xs uppercase tracking-wider text-primary">
              <BookOpen className="w-4 h-4" />
              Словарь
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </motion.div>

        {/* 5. SAMPLE SIZE CALCULATOR PREVIEW */}
        <motion.article
          variants={tile}
          className={`${tileBase} col-span-1 md:col-span-6 p-6`}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Tool · 03
              </div>
              <div className="font-heading uppercase tracking-tight text-xl md:text-2xl font-bold mt-1">
                Калькулятор выборки
              </div>
            </div>
            <Calculator className="w-6 h-6 shrink-0" />
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Эффект (d)', value: '0.50' },
              { label: 'Мощность', value: '0.80' },
              { label: 'Alpha', value: '0.05' },
            ].map((f) => (
              <div
                key={f.label}
                className="border-2 border-foreground rounded-none p-3 bg-background"
              >
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {f.label}
                </div>
                <div className="font-mono font-bold text-xl md:text-2xl mt-1">
                  {f.value}
                </div>
              </div>
            ))}
          </div>

          <Link to="/calculators#sample-size">
            <Button className="btn-primary gap-2 w-full sm:w-auto">
              Рассчитать N
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.article>

        {/* 6. NEWS / BLOG POST */}
        <motion.article
          variants={tile}
          className={`${tileBase} col-span-1 md:col-span-4 p-6 flex flex-col`}
        >
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            News · 27.04.2026
          </div>
          <div className="font-heading uppercase tracking-tight text-lg md:text-xl font-bold mt-3 leading-tight">
            Новый раздел: Размер эффекта
          </div>
          <p className="font-body text-sm text-muted-foreground mt-2 flex-1">
            Cohen's d, η², r и интерпретация — с интерактивными примерами и
            практическими рекомендациями для психологических исследований.
          </p>
          <Link
            to="/theory?tab=effectsize"
            className="font-mono text-xs uppercase tracking-wider text-primary inline-flex items-center gap-2 mt-4 group"
          >
            Читать
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.article>

        {/* 7. PROGRESS BAR */}
        <motion.article
          variants={tile}
          className={`${tileBase} col-span-1 md:col-span-8 p-6`}
        >
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Progress
              </div>
              <div className="font-heading uppercase tracking-tight text-lg md:text-xl font-bold mt-1">
                Ваш путь по курсу
              </div>
            </div>
            <div className="font-mono font-bold text-2xl md:text-3xl">
              {doneCount}/{checkpoints.length}
            </div>
          </div>

          {/* progress track */}
          <div className="relative h-3 border-2 border-foreground bg-background mb-4">
            <div
              className="absolute inset-y-0 left-0 bg-primary transition-all duration-700"
              style={{ width: `${fillPct}%` }}
            />
          </div>

          {/* checkpoints */}
          <div className="grid grid-cols-4 gap-2">
            {checkpoints.map((c, i) => (
              <div key={c.label} className="flex flex-col items-start gap-1">
                <div
                  className={`w-6 h-6 border-2 border-foreground rounded-none flex items-center justify-center font-mono text-xs font-bold ${
                    c.done ? 'bg-primary text-primary-foreground' : 'bg-background'
                  }`}
                  aria-label={`${c.label}: ${c.done ? 'пройдено' : 'не пройдено'}`}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="font-mono text-[10px] md:text-xs uppercase tracking-wider">
                  {c.label}
                </div>
              </div>
            ))}
          </div>
        </motion.article>
      </motion.div>
    </section>
  );
};

export default BentoHero;
