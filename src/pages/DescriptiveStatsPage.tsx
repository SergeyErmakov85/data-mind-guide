import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import Papa from 'papaparse';
import { Database, Sparkles, ListChecks, BookOpen, Beaker, GraduationCap, Loader2 } from 'lucide-react';

import { ConceptBlock } from '@/components/ConceptBlock';
import { SymbolTip } from '@/components/SymbolTip';
import { TaskCard } from '@/components/TaskCard';
import { DescriptiveCalculator } from '@/components/DescriptiveCalculator';
import { generateParametricSample } from '@/lib/statistics';
import { addProgress, hasProgress } from '@/lib/progress';

/* --------------------------- Datasets --------------------------- */

interface DatasetMeta {
  id: string;
  label: string;
  file: string;
  column: string;
  description: string;
}

const DATASETS: DatasetMeta[] = [
  {
    id: 'big5',
    label: 'Big5 mini-sample (n=60)',
    file: '/files/big5-mini.csv',
    column: 'neuroticism',
    description: 'Шкалы Big Five, балл «нейротизм» от 1 до 5.',
  },
  {
    id: 'iq',
    label: 'IQ выборка (n=150)',
    file: '/files/iq-sample.csv',
    column: 'iq',
    description: 'Тестовые IQ-баллы в шкале M=100, SD=15.',
  },
  {
    id: 'beck',
    label: 'Шкала Бека — депрессия (n=80)',
    file: '/files/beck-depression.csv',
    column: 'bdi_score',
    description: 'BDI-II суммарный балл (0–63), правосторонняя асимметрия.',
  },
];

/* --------------------------- Sandbox --------------------------- */

const Sandbox = () => {
  const [activeDataset, setActiveDataset] = useState<string | null>(null);
  const [datasetColumns, setDatasetColumns] = useState<Record<string, string[]>>({});
  const [pickedColumn, setPickedColumn] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [calcInput, setCalcInput] = useState<string>('');

  // Generator state
  const [genMean, setGenMean] = useState(50);
  const [genSd, setGenSd] = useState(10);
  const [genN, setGenN] = useState(60);
  const [genDist, setGenDist] = useState<'normal' | 'skewed' | 'bimodal'>('normal');

  const loadDataset = async (id: string) => {
    const meta = DATASETS.find((d) => d.id === id);
    if (!meta) return;
    setIsLoading(true);
    try {
      const res = await fetch(meta.file);
      const text = await res.text();
      const parsed = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
      });
      const numericCols: string[] = [];
      const colData: Record<string, number[]> = {};
      (parsed.meta.fields ?? []).forEach((field) => {
        const nums = parsed.data
          .map((row) => parseFloat(String(row[field] ?? '').trim()))
          .filter((v) => !isNaN(v));
        if (nums.length >= 5) {
          numericCols.push(field);
          colData[field] = nums;
        }
      });
      setDatasetColumns({ [id]: numericCols });
      const defaultCol = numericCols.includes(meta.column) ? meta.column : numericCols[0];
      setPickedColumn(defaultCol);
      setCalcInput(colData[defaultCol].join(', '));
      setActiveDataset(id);
      addProgress('descriptive', `dataset:${id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const switchColumn = async (col: string) => {
    if (!activeDataset) return;
    const meta = DATASETS.find((d) => d.id === activeDataset);
    if (!meta) return;
    const res = await fetch(meta.file);
    const text = await res.text();
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });
    const nums = parsed.data
      .map((row) => parseFloat(String(row[col] ?? '').trim()))
      .filter((v) => !isNaN(v));
    setPickedColumn(col);
    setCalcInput(nums.join(', '));
  };

  const generate = () => {
    const sample = generateParametricSample(genDist, genMean, genSd, genN);
    setCalcInput(sample.map((v) => Number(v.toFixed(2))).join(', '));
    setActiveDataset(null);
    addProgress('descriptive', `generated:${genDist}`);
  };

  return (
    <div className="space-y-8">
      {/* Datasets */}
      <section className="border-3 border-foreground bg-card p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          <div className="kicker">// 01 — готовые психологические данные</div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {DATASETS.map((d) => {
            const isActive = activeDataset === d.id;
            return (
              <button
                key={d.id}
                onClick={() => loadDataset(d.id)}
                className={`text-left border-3 rounded-none p-4 transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px] ${
                  isActive
                    ? 'border-foreground bg-primary text-primary-foreground'
                    : 'border-foreground bg-background'
                }`}
              >
                <div className="kicker mb-2 opacity-70">{`#0${DATASETS.indexOf(d) + 1}`}</div>
                <div className="font-bold text-sm uppercase mb-2">{d.label}</div>
                <div className={`text-xs leading-snug ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {d.description}
                </div>
              </button>
            );
          })}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" /> загружаем CSV…
          </div>
        )}

        {activeDataset && datasetColumns[activeDataset] && (
          <div className="flex items-center gap-3 flex-wrap pt-2 border-t-2 border-foreground/20">
            <span className="kicker">столбец:</span>
            {datasetColumns[activeDataset].map((c) => (
              <button
                key={c}
                onClick={() => switchColumn(c)}
                className={`px-3 py-1 border-2 border-foreground rounded-none font-mono text-xs uppercase ${
                  c === pickedColumn ? 'bg-foreground text-background' : 'bg-background'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Generator */}
      <section className="border-3 border-foreground bg-card p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <div className="kicker">// 02 — сгенерировать выборку</div>
        </div>
        <div className="grid sm:grid-cols-4 gap-3">
          <div>
            <Label className="kicker">Mean (M)</Label>
            <Input
              type="number"
              value={genMean}
              onChange={(e) => setGenMean(parseFloat(e.target.value) || 0)}
              className="font-mono tabular-nums border-3 border-foreground rounded-none mt-1"
            />
          </div>
          <div>
            <Label className="kicker">SD</Label>
            <Input
              type="number"
              value={genSd}
              min={0.1}
              step={0.1}
              onChange={(e) => setGenSd(Math.max(0.1, parseFloat(e.target.value) || 1))}
              className="font-mono tabular-nums border-3 border-foreground rounded-none mt-1"
            />
          </div>
          <div>
            <Label className="kicker">n</Label>
            <Input
              type="number"
              value={genN}
              min={5}
              max={1000}
              onChange={(e) => setGenN(Math.max(5, Math.min(1000, parseInt(e.target.value) || 30)))}
              className="font-mono tabular-nums border-3 border-foreground rounded-none mt-1"
            />
          </div>
          <div>
            <Label className="kicker">Распределение</Label>
            <Select value={genDist} onValueChange={(v) => setGenDist(v as typeof genDist)}>
              <SelectTrigger className="border-3 border-foreground rounded-none mt-1 font-mono text-xs uppercase">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none border-3 border-foreground">
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="skewed">Skewed (right)</SelectItem>
                <SelectItem value="bimodal">Bimodal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={generate} className="btn-primary">
          Сгенерировать выборку
        </Button>
      </section>

      {/* Calculator */}
      <section className="border-3 border-foreground bg-card p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Beaker className="w-4 h-4" />
          <div className="kicker">// 03 — описательная статистика</div>
        </div>
        <DescriptiveCalculator initialInput={calcInput || undefined} />
      </section>
    </div>
  );
};

/* --------------------------- Trainer --------------------------- */

const TRAINER_TASKS = [
  {
    id: 't1',
    question: (
      <>
        Дана выборка времён реакции (мс): <span className="num">220, 245, 260, 280, 310</span>.
        Чему равна <SymbolTip symbol="Me">медиана — середина упорядоченного ряда</SymbolTip>?
      </>
    ),
    answer: 260,
    tolerance: 0.01,
    suffix: 'мс',
    explanation: <>n = 5, центральный элемент <span className="num">x₃ = 260</span>.</>,
  },
  {
    id: 't2',
    question: (
      <>
        Баллы тревожности: <span className="num">8, 10, 12, 14, 18, 22</span>. Найдите медиану.
      </>
    ),
    answer: 13,
    tolerance: 0.01,
    explanation: <>n = 6, чётное → среднее двух центральных: (12 + 14) / 2 = <span className="num">13</span>.</>,
  },
  {
    id: 't3',
    question: (
      <>
        Q1 = <span className="num">12</span>, Q3 = <span className="num">28</span>. Чему равен{' '}
        <SymbolTip symbol="IQR">интерквартильный размах: Q₃ − Q₁</SymbolTip>?
      </>
    ),
    answer: 16,
    tolerance: 0.01,
    explanation: <>IQR = 28 − 12 = <span className="num">16</span>.</>,
  },
  {
    id: 't4',
    question: (
      <>
        В правосторонне скошенной выборке доходов (хвост справа) больше: M или Mdn? Введите{' '}
        <span className="font-mono">M</span> или <span className="font-mono">Mdn</span>.
      </>
    ),
    answer: 'M',
    inputLabel: 'M или Mdn',
    explanation: (
      <>
        Среднее «тянется» в сторону длинного хвоста, поэтому <span className="num">M &gt; Mdn</span>.
        Для скошенных распределений в статье отчитывают <strong>медиану</strong>.
      </>
    ),
  },
  {
    id: 't5',
    question: (
      <>
        Стандартное отклонение выборки SD = <span className="num">8</span>, n = <span className="num">64</span>.
        Чему равна <SymbolTip symbol="SE">стандартная ошибка среднего: SD / √n</SymbolTip>?
      </>
    ),
    answer: 1,
    tolerance: 0.01,
    explanation: <>SE = 8 / √64 = 8 / 8 = <span className="num">1</span>.</>,
  },
  {
    id: 't6',
    question: (
      <>
        Q1 = <span className="num">10</span>, Q3 = <span className="num">22</span>. Значение{' '}
        <span className="num">42</span> — это выброс по правилу 1.5·IQR? Введите{' '}
        <span className="font-mono">да</span> или <span className="font-mono">нет</span>.
      </>
    ),
    answer: 'да',
    inputLabel: 'да / нет',
    hint: <>Верхняя граница: Q₃ + 1.5·IQR.</>,
    explanation: <>IQR = 12; верх. граница = 22 + 1.5·12 = <span className="num">40</span>. 42 &gt; 40 → выброс.</>,
  },
  {
    id: 't7',
    question: (
      <>
        Какая мера центра наиболее устойчива к выбросам?{' '}
        Введите <span className="font-mono">mean</span>, <span className="font-mono">median</span> или{' '}
        <span className="font-mono">mode</span>.
      </>
    ),
    answer: 'median',
    inputLabel: 'mean / median / mode',
    explanation: <>Медиана не зависит от значений в хвостах — только от их положения в ряду.</>,
  },
  {
    id: 't8',
    question: (
      <>
        Дисперсия равна <span className="num">144</span>. Чему равно стандартное отклонение{' '}
        <SymbolTip symbol="SD">квадратный корень из дисперсии</SymbolTip>?
      </>
    ),
    answer: 12,
    tolerance: 0.01,
    explanation: <>SD = √144 = <span className="num">12</span>.</>,
  },
];

const Trainer = () => {
  const [tick, setTick] = useState(0);
  // refresh percentage when localStorage changes
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1500);
    return () => clearInterval(i);
  }, []);

  const solved = useMemo(
    () => TRAINER_TASKS.filter((t) => hasProgress('descriptive', t.id)).length,
    [tick],
  );
  const pct = Math.round((solved / TRAINER_TASKS.length) * 100);

  return (
    <div className="space-y-6">
      <div className="border-3 border-foreground p-5 bg-card">
        <div className="flex items-baseline justify-between mb-3">
          <div className="kicker">// прогресс тренажёра</div>
          <div className="font-mono tabular-nums text-sm">
            {solved} / {TRAINER_TASKS.length} · {pct}%
          </div>
        </div>
        <div className="h-3 border-2 border-foreground bg-background">
          <div className="h-full bg-foreground transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {TRAINER_TASKS.map((t, i) => (
          <TaskCard
            key={t.id}
            taskId={t.id}
            index={i + 1}
            question={t.question}
            answer={t.answer}
            tolerance={t.tolerance}
            inputLabel={t.inputLabel}
            suffix={t.suffix}
            hint={t.hint}
            explanation={t.explanation}
          />
        ))}
      </div>
    </div>
  );
};

/* --------------------------- Checklist --------------------------- */

const CHECKLIST = [
  'Выборка проверена на пропущенные значения; n указано явно.',
  'Для симметричных распределений отчитываю M (SD); для скошенных — Mdn [Q1; Q3].',
  'SD записываю в скобках после M: «M = 4.32 (SD = 0.81)» (APA 7).',
  'Числовые значения с тем же количеством знаков, что и шкала измерения (обычно 2 знака).',
  'Использую курсив для обозначений: M, Mdn, SD, SE, n, p.',
  'Перед t-, F-, ANOVA-тестами проверена нормальность (Shapiro–Wilk / гистограмма / Q–Q).',
  'Указан 95% доверительный интервал для среднего: 95% CI [нижн.; верхн.].',
  'Выбросы по правилу 1.5·IQR проанализированы; описано, как с ними поступили.',
  'При множественных группах привожу описательные по каждой группе отдельной таблицей.',
  'Размер эффекта (например, Cohen’s d) сопровождает любые сравнения средних.',
  'p-value сопровождается фактическим значением (не «p < 0.05»), кроме p < .001.',
  'Источник данных, протокол сбора и инструмент шкалирования описаны в разделе «Метод».',
];

const Checklist = () => {
  const [checked, setChecked] = useState<boolean[]>(() => {
    try {
      const raw = localStorage.getItem('descriptive-checklist');
      return raw ? (JSON.parse(raw) as boolean[]) : Array(CHECKLIST.length).fill(false);
    } catch {
      return Array(CHECKLIST.length).fill(false);
    }
  });

  const toggle = (i: number) => {
    const next = [...checked];
    next[i] = !next[i];
    setChecked(next);
    localStorage.setItem('descriptive-checklist', JSON.stringify(next));
    if (next[i]) addProgress('descriptive', `checklist:${i}`);
  };

  const done = checked.filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="border-3 border-foreground p-5 bg-card">
        <div className="kicker mb-2">// чек-лист отчётности (APA 7)</div>
        <div className="lead">
          Двенадцать пунктов, которые гарантируют, что описательная статистика в вашей статье
          читается прозрачно и воспроизводимо.
        </div>
        <div className="font-mono tabular-nums text-sm mt-3">
          {done} / {CHECKLIST.length}
        </div>
      </div>

      <ul className="space-y-3">
        {CHECKLIST.map((item, i) => (
          <li
            key={i}
            className={`border-3 border-foreground p-4 bg-card flex items-start gap-3 transition-colors ${
              checked[i] ? 'bg-success/5' : ''
            }`}
          >
            <Checkbox
              id={`chk-${i}`}
              checked={checked[i]}
              onCheckedChange={() => toggle(i)}
              className="mt-1 rounded-none border-3 border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background"
            />
            <label
              htmlFor={`chk-${i}`}
              className={`text-sm md:text-base leading-relaxed cursor-pointer ${
                checked[i] ? 'line-through text-muted-foreground' : ''
              }`}
            >
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mr-2">
                {String(i + 1).padStart(2, '0')}
              </span>
              {item}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* --------------------------- Theory --------------------------- */

const Theory = () => (
  <div className="space-y-6">
    <ConceptBlock
      kicker="// 01 — центр данных"
      title="Меры центральной тенденции"
      body={
        <>
          Любое описание выборки начинается с вопроса «где находится центр?». Три классических
          ответа: <SymbolTip symbol="M">среднее арифметическое — сумма / n</SymbolTip>,{' '}
          <SymbolTip symbol="Mdn">медиана — значение, делящее упорядоченный ряд пополам</SymbolTip>{' '}
          и <SymbolTip symbol="Mo">мода — самое частое значение</SymbolTip>. Их выбор
          определяется уровнем шкалы и формой распределения: для симметричных интервальных шкал
          подходит M, для порядковых или скошенных — Mdn.
        </>
      }
      formula={`M = \\frac{1}{n}\\sum_{i=1}^{n} x_i`}
      example={
        <>
          IQ-выборка <span className="num">98, 102, 100, 99, 101</span> →{' '}
          M = <span className="num">100</span>, Mdn = <span className="num">100</span>.
          Для симметричных данных M ≈ Mdn — это диагностический признак нормальности.
        </>
      }
    />

    <ConceptBlock
      kicker="// 02 — разброс данных"
      title="Меры разброса"
      body={
        <>
          Центр без разброса — половина истории. Дисперсия и{' '}
          <SymbolTip symbol="SD">стандартное отклонение — корень из дисперсии</SymbolTip> измеряют
          среднее квадратичное отклонение от M. Для устойчивости к выбросам используют{' '}
          <SymbolTip symbol="IQR">межквартильный размах: Q₃ − Q₁</SymbolTip>. Стандартная ошибка{' '}
          <SymbolTip symbol="SE">SE = SD / √n</SymbolTip> описывает точность оценки M.
        </>
      }
      formula={`SD = \\sqrt{\\frac{1}{n-1}\\sum_{i=1}^{n}(x_i - M)^2}`}
      example={
        <>
          Две группы со средним <span className="num">M = 50</span>, но
          SD₁ = <span className="num">3</span> и SD₂ = <span className="num">15</span> — психологически
          это совершенно разные группы: одни однородны, другие очень разнообразны.
        </>
      }
    />

    <ConceptBlock
      kicker="// 03 — форма распределения"
      title="Асимметрия и эксцесс"
      body={
        <>
          <SymbolTip symbol="Sk">асимметрия (skewness): знак указывает направление длинного хвоста</SymbolTip>
          {' '}показывает, в какую сторону «тянется» распределение. Положительная асимметрия
          (хвост справа) типична для шкал депрессии или времени реакции.{' '}
          <SymbolTip symbol="Ku">эксцесс — острота пика и тяжесть хвостов относительно нормального</SymbolTip>
          {' '}отвечает за «остроту» пика. Если |Sk| &lt; 0.5 и |Ku| &lt; 1 — распределение можно
          считать близким к нормальному.
        </>
      }
      formula={`Sk = \\frac{n}{(n-1)(n-2)} \\sum \\left(\\frac{x_i - M}{SD}\\right)^3`}
      example={
        <>
          BDI-II у студентов: большинство показывает низкие баллы (0–10), но несколько
          случаев — высокие (20+). Sk ≈ <span className="num">+1.2</span> → нельзя использовать
          параметрические t-тесты без преобразования.
        </>
      }
    />

    <ConceptBlock
      kicker="// 04 — края выборки"
      title="Выбросы"
      body={
        <>
          Выбросы — наблюдения, неестественно далёкие от остальных. Стандартное правило{' '}
          <SymbolTip symbol="1.5·IQR">наблюдения вне [Q₁ − 1.5·IQR; Q₃ + 1.5·IQR] считаются выбросами</SymbolTip>
          {' '}консервативно. В психологии важно не удалять выбросы автоматически — за ними часто
          стоят интересные случаи (например, инсайт-решатели в задаче на креативность).
          Сначала проверьте: ошибка ввода? отказ от инструкции? редкая, но валидная стратегия?
        </>
      }
      formula={`\\text{Выброс, если } x_i < Q_1 - 1.5 \\cdot IQR \\;\\;\\text{или}\\;\\; x_i > Q_3 + 1.5 \\cdot IQR`}
      example={
        <>
          Время реакции <span className="num">5400 мс</span> при выборке со средним{' '}
          <span className="num">~600 мс</span>. Возможно, испытуемый отвлёкся —
          обычно такие пробы исключают и отчитывают долю отбраковки.
        </>
      }
    />
  </div>
);

/* --------------------------- Page --------------------------- */

const DescriptiveStatsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <div className="kicker">// Модуль 01 — Описательная статистика</div>
            <h1 className="text-5xl md:text-7xl font-bold uppercase leading-[0.95]">
              Описательная
              <br />
              статистика
            </h1>
            <div className="rule" />
            <p className="lead">
              Полный модуль: интуиция → формулы → песочница → тренажёр. Все формулы кликабельны —
              наведите на символ, чтобы прочитать пояснение. Прогресс сохраняется автоматически.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="outline" className="rounded-none border-2 font-mono uppercase">
                Базовый уровень
              </Badge>
              <Badge variant="outline" className="rounded-none border-2 font-mono uppercase">
                Navarro & Foxcroft
              </Badge>
              <Badge variant="outline" className="rounded-none border-2 font-mono uppercase">
                APA 7
              </Badge>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="theory" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full bg-background border-3 border-foreground rounded-none p-0 h-auto">
              <TabsTrigger
                value="theory"
                className="rounded-none border-r-3 border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background font-mono text-xs uppercase tracking-[0.15em] py-3 gap-2"
              >
                <BookOpen className="w-3 h-3" /> Теория
              </TabsTrigger>
              <TabsTrigger
                value="sandbox"
                className="rounded-none border-r-3 border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background font-mono text-xs uppercase tracking-[0.15em] py-3 gap-2"
              >
                <Beaker className="w-3 h-3" /> Песочница
              </TabsTrigger>
              <TabsTrigger
                value="trainer"
                className="rounded-none border-r-3 border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background font-mono text-xs uppercase tracking-[0.15em] py-3 gap-2"
              >
                <GraduationCap className="w-3 h-3" /> Тренажёр
              </TabsTrigger>
              <TabsTrigger
                value="checklist"
                className="rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background font-mono text-xs uppercase tracking-[0.15em] py-3 gap-2"
              >
                <ListChecks className="w-3 h-3" /> Чек-лист
              </TabsTrigger>
            </TabsList>

            <TabsContent value="theory" className="mt-8">
              <Theory />
            </TabsContent>

            <TabsContent value="sandbox" className="mt-8">
              <Sandbox />
            </TabsContent>

            <TabsContent value="trainer" className="mt-8">
              <Trainer />
            </TabsContent>

            <TabsContent value="checklist" className="mt-8">
              <Checklist />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default DescriptiveStatsPage;
