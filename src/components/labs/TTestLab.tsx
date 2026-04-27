import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, Info, Play } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { mean, standardDeviation, normalPDF } from '@/lib/statistics';
import { ChartA11y } from '@/components/ChartA11y';

type TestType = 'one-sample' | 'independent' | 'paired';

const testLabels: Record<TestType, string> = {
  'one-sample': 'Одновыборочный',
  'independent': 'Независимые выборки',
  'paired': 'Парный (зависимые)',
};

const testDescriptions: Record<TestType, string> = {
  'one-sample': 'Сравнение среднего выборки с известным значением',
  'independent': 'Сравнение средних двух независимых групп',
  'paired': 'Сравнение средних до и после воздействия',
};

// Generate normal sample
const generateNormalSample = (mean: number, sd: number, n: number): number[] => {
  const samples: number[] = [];
  for (let i = 0; i < n; i++) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    samples.push(Math.round((mean + z * sd) * 10) / 10);
  }
  return samples;
};

// Calculate t-statistic for different test types
const calcTTest = (
  type: TestType,
  group1: number[],
  group2: number[],
  mu0: number
): { t: number; df: number; p: number; d: number; se: number } => {
  const m1 = mean(group1);
  const sd1 = standardDeviation(group1);
  const n1 = group1.length;

  if (type === 'one-sample') {
    const se = sd1 / Math.sqrt(n1);
    const t = se === 0 ? 0 : (m1 - mu0) / se;
    const df = n1 - 1;
    const d = sd1 === 0 ? 0 : (m1 - mu0) / sd1;
    return { t, df, p: approxPFromT(t, df), d: Math.abs(d), se };
  }

  if (type === 'paired') {
    const diffs = group1.map((v, i) => v - (group2[i] ?? 0));
    const md = mean(diffs);
    const sdd = standardDeviation(diffs);
    const se = sdd / Math.sqrt(diffs.length);
    const t = se === 0 ? 0 : md / se;
    const df = diffs.length - 1;
    const d = sdd === 0 ? 0 : md / sdd;
    return { t, df, p: approxPFromT(t, df), d: Math.abs(d), se };
  }

  // Independent
  const m2 = mean(group2);
  const sd2 = standardDeviation(group2);
  const n2 = group2.length;
  const pooledVar = ((n1 - 1) * sd1 * sd1 + (n2 - 1) * sd2 * sd2) / (n1 + n2 - 2);
  const se = Math.sqrt(pooledVar * (1 / n1 + 1 / n2));
  const t = se === 0 ? 0 : (m1 - m2) / se;
  const df = n1 + n2 - 2;
  const pooledSD = Math.sqrt(pooledVar);
  const d = pooledSD === 0 ? 0 : (m1 - m2) / pooledSD;
  return { t, df, p: approxPFromT(t, df), d: Math.abs(d), se };
};

// Approximate p-value using normal approximation
const approxPFromT = (t: number, df: number): number => {
  const x = Math.abs(t);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const z = 1 / (1 + p * x);
  const y = 1 - (((((a5 * z + a4) * z) + a3) * z + a2) * z + a1) * z * Math.exp(-x * x / 2);
  const cdf = 0.5 * (1 + (t < 0 ? -1 : 1) * y);
  return Math.max(0.0001, 2 * (1 - cdf));
};

// Build histogram data from samples
const buildHistData = (samples: number[], bins: number = 15): { x: number; freq: number }[] => {
  if (samples.length === 0) return [];
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const w = (max - min) / bins || 1;
  const result = Array.from({ length: bins }, (_, i) => ({
    x: Math.round((min + (i + 0.5) * w) * 10) / 10,
    freq: 0,
  }));
  samples.forEach(v => {
    let idx = Math.floor((v - min) / w);
    if (idx >= bins) idx = bins - 1;
    if (idx < 0) idx = 0;
    result[idx].freq++;
  });
  return result;
};

// t-distribution curve (approx with normal for visualization)
const tDistCurve = (df: number, points: number = 100): { x: number; y: number }[] => {
  const data: { x: number; y: number }[] = [];
  for (let i = 0; i < points; i++) {
    const x = -4 + (8 * i) / (points - 1);
    data.push({ x: Math.round(x * 100) / 100, y: normalPDF(x, 0, 1) });
  }
  return data;
};

const cohenDLabel = (d: number): string => {
  if (d < 0.2) return 'Незначительный';
  if (d < 0.5) return 'Малый';
  if (d < 0.8) return 'Средний';
  return 'Большой';
};

export const TTestLab = () => {
  const [testType, setTestType] = useState<TestType>('independent');
  const [mu0, setMu0] = useState(50);
  const [mean1, setMean1] = useState(52);
  const [mean2, setMean2] = useState(48);
  const [sd1, setSd1] = useState(8);
  const [sd2, setSd2] = useState(8);
  const [n1, setN1] = useState(30);
  const [n2, setN2] = useState(30);
  const [alpha, setAlpha] = useState(0.05);

  const [group1, setGroup1] = useState<number[]>([]);
  const [group2, setGroup2] = useState<number[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const runTest = useCallback(() => {
    const g1 = generateNormalSample(mean1, sd1, n1);
    const g2 = testType !== 'one-sample' ? generateNormalSample(mean2, sd2, testType === 'paired' ? n1 : n2) : [];
    setGroup1(g1);
    setGroup2(g2);
    setHasRun(true);
  }, [testType, mean1, mean2, sd1, sd2, n1, n2]);

  const reset = () => {
    setGroup1([]);
    setGroup2([]);
    setHasRun(false);
  };

  const result = useMemo(() => {
    if (!hasRun) return null;
    return calcTTest(testType, group1, group2, mu0);
  }, [hasRun, testType, group1, group2, mu0]);

  const hist1 = useMemo(() => buildHistData(group1), [group1]);
  const hist2 = useMemo(() => buildHistData(group2), [group2]);
  const tCurve = useMemo(() => tDistCurve(result?.df ?? 28), [result?.df]);

  // Critical t for alpha
  const tCrit = alpha === 0.01 ? 2.576 : alpha === 0.05 ? 1.96 : 1.645;

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
                t-тест сравнивает средние значения, чтобы определить, 
                есть ли статистически значимое различие между группами.
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Type */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Тип t-теста</label>
              <Select value={testType} onValueChange={(v) => { setTestType(v as TestType); reset(); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(testLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      <div>
                        <div>{label}</div>
                        <div className="text-xs text-muted-foreground">
                          {testDescriptions[key as TestType]}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Уровень значимости (α): <span className="font-bold text-primary">{alpha}</span>
              </label>
              <Select value={String(alpha)} onValueChange={(v) => setAlpha(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.01">0.01</SelectItem>
                  <SelectItem value="0.05">0.05</SelectItem>
                  <SelectItem value="0.10">0.10</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {testType === 'one-sample' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  μ₀ (гипотетическое среднее): <span className="font-bold text-primary">{mu0}</span>
                </label>
                <Slider value={[mu0]} onValueChange={([v]) => setMu0(v)} min={30} max={70} step={1} />
              </div>
            )}
          </div>

          {/* Group parameters */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Group 1 */}
            <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
              <h4 className="text-sm font-semibold">
                {testType === 'paired' ? 'До воздействия' : testType === 'independent' ? 'Группа 1 (контроль)' : 'Выборка'}
              </h4>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  Среднее: <span className="font-bold">{mean1}</span>
                </label>
                <Slider value={[mean1]} onValueChange={([v]) => setMean1(v)} min={30} max={70} step={1} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  SD: <span className="font-bold">{sd1}</span>
                </label>
                <Slider value={[sd1]} onValueChange={([v]) => setSd1(v)} min={2} max={20} step={1} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  n: <span className="font-bold">{n1}</span>
                </label>
                <Slider value={[n1]} onValueChange={([v]) => setN1(v)} min={5} max={100} step={5} />
              </div>
            </div>

            {/* Group 2 */}
            {testType !== 'one-sample' && (
              <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                <h4 className="text-sm font-semibold">
                  {testType === 'paired' ? 'После воздействия' : 'Группа 2 (эксперимент)'}
                </h4>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    Среднее: <span className="font-bold">{mean2}</span>
                  </label>
                  <Slider value={[mean2]} onValueChange={([v]) => setMean2(v)} min={30} max={70} step={1} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    SD: <span className="font-bold">{sd2}</span>
                  </label>
                  <Slider value={[sd2]} onValueChange={([v]) => setSd2(v)} min={2} max={20} step={1} />
                </div>
                {testType === 'independent' && (
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">
                      n: <span className="font-bold">{n2}</span>
                    </label>
                    <Slider value={[n2]} onValueChange={([v]) => setN2(v)} min={5} max={100} step={5} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={runTest} className="gap-2">
              <Play className="w-4 h-4" />
              Запустить тест
            </Button>
            <Button onClick={reset} variant="ghost" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Сброс
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {hasRun && result && (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Distribution of groups */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Распределения групп</CardTitle>
                <CardDescription>
                  {testType === 'paired' 
                    ? 'Сравнение уровня депрессии до и после терапии (BDI-II)'
                    : testType === 'independent'
                    ? 'Тревожность: контрольная vs экспериментальная группа'
                    : `Выборочное среднее vs μ₀ = ${mu0}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartA11y
                  label={`Гистограмма группы 1, n=${group1.length}, M=${mean(group1).toFixed(2)}`}
                  summary={`Группа 1: n=${group1.length}, M=${mean(group1).toFixed(2)}, SD=${standardDeviation(group1).toFixed(2)}.`}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={hist1}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="x" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Bar dataKey="freq" fill="hsl(var(--primary))" opacity={0.6} radius={[2, 2, 0, 0]} name="Группа 1" />
                      <ReferenceLine x={mean(group1)} stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="5 5" />
                      {testType === 'one-sample' && (
                        <ReferenceLine x={mu0} stroke="hsl(var(--destructive))" strokeWidth={2} label={{ value: `μ₀=${mu0}`, position: 'top' }} />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </ChartA11y>
                {testType !== 'one-sample' && hist2.length > 0 && (
                  <ResponsiveContainer width="100%" height={200} className="mt-4">
                    <BarChart data={hist2}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="x" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Bar dataKey="freq" fill="hsl(var(--success))" opacity={0.6} radius={[2, 2, 0, 0]} name="Группа 2" />
                      <ReferenceLine x={mean(group2)} stroke="hsl(var(--success))" strokeWidth={2} strokeDasharray="5 5" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* t-distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">t-распределение</CardTitle>
                <CardDescription>
                  Критические области (α = {alpha}, df = {result.df})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartA11y
                  label={`t-распределение, df=${result.df.toFixed(1)}, t-наблюдаемое=${result.t.toFixed(2)}, α=${alpha}`}
                  summary={`Кривая t-распределения с df=${result.df.toFixed(1)}. Наблюдаемое значение t=${result.t.toFixed(2)}. Критические значения: ±${tCrit.toFixed(2)}.`}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={tCurve}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="x" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Area type="monotone" dataKey="y" fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth={2} />
                      <ReferenceLine x={result.t} stroke="hsl(var(--primary))" strokeWidth={2} label={{ value: `t=${result.t.toFixed(2)}`, position: 'top' }} />
                      <ReferenceLine x={tCrit} stroke="hsl(var(--destructive))" strokeWidth={1} strokeDasharray="5 5" />
                      <ReferenceLine x={-tCrit} stroke="hsl(var(--destructive))" strokeWidth={1} strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartA11y>
              </CardContent>
            </Card>
          </div>

          {/* Stats summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Результаты t-теста</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold">{result.t.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">t-статистика</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold">{result.df}</div>
                  <div className="text-xs text-muted-foreground">Степени свободы</div>
                </div>
                <div className={`text-center p-4 rounded-lg ${result.p < alpha ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <div className="text-2xl font-bold">{result.p < 0.001 ? '< .001' : result.p.toFixed(4)}</div>
                  <div className="text-xs text-muted-foreground">p-value</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold">{result.d.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">d Коэна</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold">{cohenDLabel(result.d)}</div>
                  <div className="text-xs text-muted-foreground">Размер эффекта</div>
                </div>
              </div>

              <div className={`mt-4 p-4 rounded-lg border-l-4 ${result.p < alpha ? 'border-l-success bg-success/5' : 'border-l-destructive bg-destructive/5'}`}>
                <p className="font-medium">
                  {result.p < alpha 
                    ? `✓ Различие статистически значимо (p = ${result.p < 0.001 ? '< .001' : result.p.toFixed(4)}, α = ${alpha}). Нулевая гипотеза отвергается.`
                    : `✗ Различие статистически не значимо (p = ${result.p.toFixed(4)}, α = ${alpha}). Нет оснований отвергнуть H₀.`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Explanation */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2 text-primary">Когда использовать?</h4>
              <p className="text-muted-foreground">
                <strong>Одновыборочный</strong>: сравнение выборки с нормой (IQ = 100). 
                <strong> Независимый</strong>: две разные группы (контроль vs эксперимент). 
                <strong> Парный</strong>: одна группа до/после (терапия).
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-primary">d Коэна</h4>
              <p className="text-muted-foreground">
                Размер эффекта показывает практическую значимость различия. 
                d = 0.2 — малый, 0.5 — средний, 0.8 — большой. 
                В психологии часто получают d = 0.3–0.6.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-primary">Попробуйте</h4>
              <p className="text-muted-foreground">
                Увеличьте размер выборки при малом эффекте — наблюдайте, 
                как p-value уменьшается. Это демонстрирует важность 
                планирования размера выборки.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
