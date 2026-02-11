import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, Info, Play, BarChart3 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import { mean, standardDeviation, normalPDF } from '@/lib/statistics';

// Generate normal sample
const generateNormalSample = (m: number, sd: number, n: number): number[] => {
  const samples: number[] = [];
  for (let i = 0; i < n; i++) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    samples.push(Math.round((m + z * sd) * 10) / 10);
  }
  return samples;
};

// Cohen's d
const cohensD = (g1: number[], g2: number[]): number => {
  const m1 = mean(g1);
  const m2 = mean(g2);
  const sd1 = standardDeviation(g1);
  const sd2 = standardDeviation(g2);
  const n1 = g1.length;
  const n2 = g2.length;
  const pooled = Math.sqrt(((n1 - 1) * sd1 * sd1 + (n2 - 1) * sd2 * sd2) / (n1 + n2 - 2));
  return pooled === 0 ? 0 : (m1 - m2) / pooled;
};

// Eta squared from F
const etaSquared = (groups: number[][]): number => {
  const allValues = groups.flat();
  const grandMean = mean(allValues);
  const ssBetween = groups.reduce((acc, g) => acc + g.length * Math.pow(mean(g) - grandMean, 2), 0);
  const ssTotal = allValues.reduce((acc, v) => acc + Math.pow(v - grandMean, 2), 0);
  return ssTotal === 0 ? 0 : ssBetween / ssTotal;
};

// Pearson r from two arrays
const pearsonR = (x: number[], y: number[]): number => {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;
  const mx = mean(x.slice(0, n));
  const my = mean(y.slice(0, n));
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const xi = x[i] - mx;
    const yi = y[i] - my;
    num += xi * yi;
    dx += xi * xi;
    dy += yi * yi;
  }
  const denom = Math.sqrt(dx * dy);
  return denom === 0 ? 0 : num / denom;
};

// Build overlapping density curves
const buildDensityCurves = (
  g1: number[],
  g2: number[],
  points = 120
): { x: number; group1: number; group2: number }[] => {
  const allVals = [...g1, ...g2];
  const min = Math.min(...allVals) - 5;
  const max = Math.max(...allVals) + 5;
  const step = (max - min) / points;
  const m1 = mean(g1), sd1 = standardDeviation(g1);
  const m2 = mean(g2), sd2 = standardDeviation(g2);
  const data: { x: number; group1: number; group2: number }[] = [];
  for (let i = 0; i <= points; i++) {
    const x = min + i * step;
    data.push({
      x: Math.round(x * 10) / 10,
      group1: normalPDF(x, m1, sd1),
      group2: normalPDF(x, m2, sd2),
    });
  }
  return data;
};

type Metric = 'cohens-d' | 'eta-squared' | 'pearson-r';

const metricLabels: Record<Metric, string> = {
  'cohens-d': 'd Коэна',
  'eta-squared': 'η² (eta-квадрат)',
  'pearson-r': 'r Пирсона',
};

const metricDescriptions: Record<Metric, string> = {
  'cohens-d': 'Разница между двумя группами в единицах стандартного отклонения',
  'eta-squared': 'Доля дисперсии, объяснённая принадлежностью к группе',
  'pearson-r': 'Сила и направление линейной связи между переменными',
};

const dLabel = (d: number): { text: string; color: string } => {
  const abs = Math.abs(d);
  if (abs < 0.2) return { text: 'Незначительный', color: 'bg-muted text-muted-foreground' };
  if (abs < 0.5) return { text: 'Малый', color: 'bg-warning/10 text-warning' };
  if (abs < 0.8) return { text: 'Средний', color: 'bg-primary/10 text-primary' };
  return { text: 'Большой', color: 'bg-success/10 text-success' };
};

const etaLabel = (eta: number): { text: string; color: string } => {
  if (eta < 0.01) return { text: 'Незначительный', color: 'bg-muted text-muted-foreground' };
  if (eta < 0.06) return { text: 'Малый', color: 'bg-warning/10 text-warning' };
  if (eta < 0.14) return { text: 'Средний', color: 'bg-primary/10 text-primary' };
  return { text: 'Большой', color: 'bg-success/10 text-success' };
};

const rLabel = (r: number): { text: string; color: string } => {
  const abs = Math.abs(r);
  if (abs < 0.1) return { text: 'Незначительный', color: 'bg-muted text-muted-foreground' };
  if (abs < 0.3) return { text: 'Малый', color: 'bg-warning/10 text-warning' };
  if (abs < 0.5) return { text: 'Средний', color: 'bg-primary/10 text-primary' };
  return { text: 'Большой', color: 'bg-success/10 text-success' };
};

// Overlap percentage approximation for Cohen's d
const overlapPercent = (d: number): number => {
  // Approximation of OVL (overlapping coefficient)
  const abs = Math.abs(d);
  // OVL = 2 * Φ(-|d|/2)
  const z = abs / 2;
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * z);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z / 2);
  return Math.round(2 * (1 - 0.5 * (1 + y)) * 100);
};

export const EffectSizeLab = () => {
  const [metric, setMetric] = useState<Metric>('cohens-d');
  const [mean1, setMean1] = useState(50);
  const [mean2, setMean2] = useState(55);
  const [sd, setSd] = useState(10);
  const [n, setN] = useState(30);
  // For eta-squared: 3 groups
  const [mean3, setMean3] = useState(60);
  // For pearson-r
  const [targetR, setTargetR] = useState(0.5);

  const [hasRun, setHasRun] = useState(false);
  const [group1, setGroup1] = useState<number[]>([]);
  const [group2, setGroup2] = useState<number[]>([]);
  const [group3, setGroup3] = useState<number[]>([]);

  const runExperiment = useCallback(() => {
    const g1 = generateNormalSample(mean1, sd, n);
    const g2 = generateNormalSample(mean2, sd, n);
    const g3 = generateNormalSample(mean3, sd, n);
    setGroup1(g1);
    setGroup2(g2);
    setGroup3(g3);
    setHasRun(true);
  }, [mean1, mean2, mean3, sd, n]);

  const reset = () => {
    setGroup1([]);
    setGroup2([]);
    setGroup3([]);
    setHasRun(false);
  };

  const results = useMemo(() => {
    if (!hasRun) return null;
    const d = cohensD(group1, group2);
    const eta = etaSquared([group1, group2, group3]);
    const r = pearsonR(group1, group2);
    return { d, eta, r };
  }, [hasRun, group1, group2, group3]);

  const densityData = useMemo(() => {
    if (!hasRun) return [];
    return buildDensityCurves(group1, group2);
  }, [hasRun, group1, group2]);

  // Reference scale data for visualization
  const scaleData = useMemo(() => {
    return [
      { label: 'Незначительный', dMin: 0, dMax: 0.2, etaMin: 0, etaMax: 0.01, rMin: 0, rMax: 0.1 },
      { label: 'Малый', dMin: 0.2, dMax: 0.5, etaMin: 0.01, etaMax: 0.06, rMin: 0.1, rMax: 0.3 },
      { label: 'Средний', dMin: 0.5, dMax: 0.8, etaMin: 0.06, etaMax: 0.14, rMin: 0.3, rMax: 0.5 },
      { label: 'Большой', dMin: 0.8, dMax: 2.0, etaMin: 0.14, etaMax: 1.0, rMin: 0.5, rMax: 1.0 },
    ];
  }, []);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Параметры эксперимента
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Размер эффекта показывает практическую значимость различий — 
                насколько велик наблюдаемый эффект, независимо от размера выборки.
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Метрика размера эффекта</label>
              <Select value={metric} onValueChange={(v) => { setMetric(v as Metric); reset(); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(metricLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      <div>
                        <div>{label}</div>
                        <div className="text-xs text-muted-foreground">{metricDescriptions[key as Metric]}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Размер выборки (n на группу): <span className="font-bold text-primary">{n}</span>
              </label>
              <Slider value={[n]} onValueChange={([v]) => setN(v)} min={10} max={200} step={5} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Стандартное отклонение (SD): <span className="font-bold text-primary">{sd}</span>
            </label>
            <Slider value={[sd]} onValueChange={([v]) => setSd(v)} min={2} max={20} step={1} />
          </div>

          {/* Group means */}
          <div className={`grid gap-6 ${metric === 'eta-squared' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
              <h4 className="text-sm font-semibold">
                {metric === 'pearson-r' ? 'Переменная X' : 'Группа 1 (контроль)'}
              </h4>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  Среднее: <span className="font-bold">{mean1}</span>
                </label>
                <Slider value={[mean1]} onValueChange={([v]) => setMean1(v)} min={20} max={80} step={1} />
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
              <h4 className="text-sm font-semibold">
                {metric === 'pearson-r' ? 'Переменная Y' : 'Группа 2 (эксперимент)'}
              </h4>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  Среднее: <span className="font-bold">{mean2}</span>
                </label>
                <Slider value={[mean2]} onValueChange={([v]) => setMean2(v)} min={20} max={80} step={1} />
              </div>
            </div>

            {metric === 'eta-squared' && (
              <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                <h4 className="text-sm font-semibold">Группа 3 (альтернативная)</h4>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    Среднее: <span className="font-bold">{mean3}</span>
                  </label>
                  <Slider value={[mean3]} onValueChange={([v]) => setMean3(v)} min={20} max={80} step={1} />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={runExperiment} className="gap-2">
              <Play className="w-4 h-4" />
              Запустить эксперимент
            </Button>
            <Button onClick={reset} variant="ghost" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Сброс
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {hasRun && results && (
        <>
          {/* Main result cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <ResultCard
              title="d Коэна"
              value={results.d}
              format={(v) => v.toFixed(3)}
              label={dLabel(results.d)}
              active={metric === 'cohens-d'}
            />
            <ResultCard
              title="η² (eta-квадрат)"
              value={results.eta}
              format={(v) => v.toFixed(4)}
              label={etaLabel(results.eta)}
              active={metric === 'eta-squared'}
            />
            <ResultCard
              title="r Пирсона"
              value={results.r}
              format={(v) => v.toFixed(3)}
              label={rLabel(results.r)}
              active={metric === 'pearson-r'}
            />
          </div>

          {/* Visualizations */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Overlapping distributions (for Cohen's d) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Перекрытие распределений</CardTitle>
                <CardDescription>
                  Визуальное различие между группами. Перекрытие: {overlapPercent(results.d)}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={densityData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="x" className="text-xs" />
                    <YAxis className="text-xs" hide />
                    <Area
                      type="monotone"
                      dataKey="group1"
                      fill="hsl(var(--primary))"
                      stroke="hsl(var(--primary))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                      name="Группа 1"
                    />
                    <Area
                      type="monotone"
                      dataKey="group2"
                      fill="hsl(var(--destructive))"
                      stroke="hsl(var(--destructive))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                      name="Группа 2"
                    />
                    <ReferenceLine
                      x={Math.round(mean(group1) * 10) / 10}
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <ReferenceLine
                      x={Math.round(mean(group2) * 10) / 10}
                      stroke="hsl(var(--destructive))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Reference scale */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Шкала интерпретации</CardTitle>
                <CardDescription>
                  Конвенции Коэна для интерпретации размера эффекта
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {scaleData.map((level, i) => {
                  const currentValue = metric === 'cohens-d' ? Math.abs(results.d)
                    : metric === 'eta-squared' ? results.eta
                    : Math.abs(results.r);
                  const minVal = metric === 'cohens-d' ? level.dMin
                    : metric === 'eta-squared' ? level.etaMin
                    : level.rMin;
                  const maxVal = metric === 'cohens-d' ? level.dMax
                    : metric === 'eta-squared' ? level.etaMax
                    : level.rMax;
                  const isActive = currentValue >= minVal && currentValue < maxVal;
                  const colors = ['bg-muted/50', 'bg-warning/10', 'bg-primary/10', 'bg-success/10'];
                  const borderColors = ['border-muted', 'border-warning/30', 'border-primary/30', 'border-success/30'];

                  return (
                    <div
                      key={level.label}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        isActive ? `${colors[i]} ${borderColors[i]} ring-2 ring-primary/20` : 'border-transparent bg-muted/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          i === 0 ? 'bg-muted-foreground' : i === 1 ? 'bg-warning' : i === 2 ? 'bg-primary' : 'bg-success'
                        }`} />
                        <span className="font-medium text-sm">{level.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {metric === 'cohens-d' && `d: ${level.dMin} – ${level.dMax === 2.0 ? '∞' : level.dMax}`}
                        {metric === 'eta-squared' && `η²: ${level.etaMin} – ${level.etaMax === 1.0 ? '1.0' : level.etaMax}`}
                        {metric === 'pearson-r' && `|r|: ${level.rMin} – ${level.rMax === 1.0 ? '1.0' : level.rMax}`}
                      </span>
                    </div>
                  );
                })}

                <div className="mt-4 p-4 rounded-lg bg-muted/30 text-sm text-muted-foreground">
                  <strong>Важно:</strong> Конвенции Коэна — это ориентиры, а не абсолютные правила. 
                  В психологии d = 0.3 может быть клинически значимым, если речь идёт об эффективности 
                  терапии для тяжёлых расстройств.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Practical interpretation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Практическая интерпретация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-muted/20">
                  <h4 className="font-semibold text-sm mb-2">📊 Статистическая vs практическая значимость</h4>
                  <p className="text-sm text-muted-foreground">
                    p-value показывает, случайны ли различия. Размер эффекта показывает, 
                    <strong> насколько велики</strong> различия. При n = 10 000 даже крошечные 
                    различия (d = 0.01) станут «статистически значимыми».
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/20">
                  <h4 className="font-semibold text-sm mb-2">🧠 Психологический контекст</h4>
                  <p className="text-sm text-muted-foreground">
                    {metric === 'cohens-d' && (
                      <>
                        Ваш d = {results.d.toFixed(2)} означает, что группы различаются на {Math.abs(results.d).toFixed(1)} стандартных отклонения. 
                        {Math.abs(results.d) >= 0.8 ? ' Это сильный эффект — разница видна «невооружённым глазом».' :
                         Math.abs(results.d) >= 0.5 ? ' Умеренный эффект — заметен при целенаправленном сравнении.' :
                         Math.abs(results.d) >= 0.2 ? ' Малый эффект — может быть важен при масштабных интервенциях.' :
                         ' Практически нет различий между группами.'}
                      </>
                    )}
                    {metric === 'eta-squared' && (
                      <>
                        η² = {results.eta.toFixed(3)} — принадлежность к группе объясняет {(results.eta * 100).toFixed(1)}% 
                        вариативности зависимой переменной. 
                        {results.eta >= 0.14 ? ' Это большая доля объяснённой дисперсии.' : 
                         results.eta >= 0.06 ? ' Умеренная доля объяснённой дисперсии.' : 
                         ' Группа объясняет малую часть различий.'}
                      </>
                    )}
                    {metric === 'pearson-r' && (
                      <>
                        r = {results.r.toFixed(3)} — переменные объясняют {(results.r * results.r * 100).toFixed(1)}% 
                        дисперсии друг друга (R² = {(results.r * results.r).toFixed(3)}). 
                        {Math.abs(results.r) >= 0.5 ? ' Сильная связь — полезна для предсказания.' :
                         Math.abs(results.r) >= 0.3 ? ' Умеренная связь — типична для психологических исследований.' :
                         ' Слабая связь.'}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold">{mean(group1).toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">M₁ (группа 1)</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold">{mean(group2).toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">M₂ (группа 2)</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold">{standardDeviation([...group1, ...group2]).toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">SD (общее)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

// Small helper component
const ResultCard = ({
  title,
  value,
  format,
  label,
  active,
}: {
  title: string;
  value: number;
  format: (v: number) => string;
  label: { text: string; color: string };
  active: boolean;
}) => (
  <Card className={`transition-all ${active ? 'ring-2 ring-primary/30' : ''}`}>
    <CardContent className="pt-6 text-center">
      <div className="text-3xl font-bold mb-1">{format(value)}</div>
      <div className="text-sm text-muted-foreground mb-2">{title}</div>
      <Badge className={label.color}>{label.text}</Badge>
    </CardContent>
  </Card>
);
