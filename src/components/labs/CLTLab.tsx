import { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Info, TrendingUp, BarChart3, BookOpen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MathFormula } from '@/components/MathFormula';
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
import { generateSample, mean, histogram, generateNormalCurve, standardDeviation, skewness, kurtosis } from '@/lib/statistics';
import { motion, AnimatePresence } from 'framer-motion';

type Distribution = 'uniform' | 'normal' | 'exponential' | 'bimodal';

const distributionLabels: Record<Distribution, string> = {
  uniform: 'Равномерное',
  normal: 'Нормальное',
  exponential: 'Экспоненциальное',
  bimodal: 'Бимодальное',
};

const distributionDescriptions: Record<Distribution, string> = {
  uniform: 'Все значения равновероятны',
  normal: 'Колоколообразное распределение',
  exponential: 'Сильно скошенное вправо',
  bimodal: 'Два пика',
};

const distributionIcons: Record<Distribution, string> = {
  uniform: '▬',
  normal: '⌒',
  exponential: '⌐',
  bimodal: '⩍',
};

export const CLTLab = () => {
  const [distribution, setDistribution] = useState<Distribution>('exponential');
  const [sampleSize, setSampleSize] = useState(30);
  const [numSamples, setNumSamples] = useState(0);
  const [sampleMeans, setSampleMeans] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(100);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sourceData = useCallback(() => {
    const samples = generateSample(distribution, 2000);
    return histogram(samples, 40);
  }, [distribution]);

  const runOneSample = useCallback(() => {
    const sample = generateSample(distribution, sampleSize);
    const sampleMean = mean(sample);
    setSampleMeans(prev => [...prev, sampleMean]);
    setNumSamples(prev => prev + 1);
  }, [distribution, sampleSize]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(runOneSample, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, runOneSample, speed]);

  const reset = () => {
    setIsRunning(false);
    setSampleMeans([]);
    setNumSamples(0);
  };

  const meansHistogramData = histogram(sampleMeans, 30);
  const meanOfMeans = sampleMeans.length > 0 ? mean(sampleMeans) : 5;
  const sdOfMeans = sampleMeans.length > 1 ? standardDeviation(sampleMeans) : 1;
  const skew = sampleMeans.length > 10 ? skewness(sampleMeans) : null;
  const kurt = sampleMeans.length > 10 ? kurtosis(sampleMeans) : null;
  const normalCurve = generateNormalCurve(meanOfMeans, sdOfMeans, 60);
  const maxFreq = Math.max(...meansHistogramData.map(d => d.frequency), 0.01);
  const maxNormalY = Math.max(...normalCurve.map(d => d.y), 0.01);

  const combinedData = meansHistogramData.map(bin => {
    const midpoint = (bin.binStart + bin.binEnd) / 2;
    const closestNormal = normalCurve.reduce((prev, curr) =>
      Math.abs(curr.x - midpoint) < Math.abs(prev.x - midpoint) ? curr : prev
    );
    const normalY = (closestNormal.y / maxNormalY) * maxFreq;
    return { ...bin, midpoint, normalY };
  });

  // Source distribution area chart data
  const sourceAreaData = sourceData().map(bin => ({
    x: ((bin.binStart + bin.binEnd) / 2),
    frequency: bin.frequency,
  }));

  return (
    <div className="space-y-8">
      {/* Mathematical Description */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              Математическая формулировка ЦПТ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            <Tabs defaultValue="theorem" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="theorem">Теорема</TabsTrigger>
                <TabsTrigger value="consequences">Следствия</TabsTrigger>
                <TabsTrigger value="application">Применение</TabsTrigger>
              </TabsList>

              <TabsContent value="theorem" className="mt-4 space-y-4">
                <div className="formula-box">
                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    Пусть <MathFormula formula="X_1, X_2, \ldots, X_n" /> — независимые одинаково распределённые 
                    случайные величины с математическим ожиданием <MathFormula formula="\mu" /> и конечной 
                    дисперсией <MathFormula formula="\sigma^2" />. Тогда при <MathFormula formula="n \to \infty" />:
                  </p>
                  <MathFormula 
                    formula="\frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}} \xrightarrow{d} \mathcal{N}(0, 1)" 
                    display 
                  />
                  <p className="text-sm text-muted-foreground mt-3">
                    где <MathFormula formula="\bar{X}_n = \frac{1}{n}\sum_{i=1}^{n} X_i" /> — выборочное среднее.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/40 space-y-2">
                    <h4 className="text-sm font-semibold text-primary">Распределение выборочного среднего</h4>
                    <MathFormula formula="\bar{X}_n \sim \mathcal{N}\!\left(\mu,\; \frac{\sigma^2}{n}\right)" display />
                    <p className="text-xs text-muted-foreground">
                      Среднее выборки приближённо нормально с тем же матожиданием, 
                      но дисперсия уменьшается в <MathFormula formula="n" /> раз.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/40 space-y-2">
                    <h4 className="text-sm font-semibold text-primary">Стандартная ошибка среднего</h4>
                    <MathFormula formula="SE = \frac{\sigma}{\sqrt{n}}" display />
                    <p className="text-xs text-muted-foreground">
                      Стандартное отклонение распределения выборочных средних. 
                      Ключевая величина для построения доверительных интервалов.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="consequences" className="mt-4 space-y-4">
                <div className="space-y-4">
                  <div className="example-box">
                    <h4 className="font-semibold text-sm mb-2">1. Доверительные интервалы</h4>
                    <MathFormula formula="\bar{X} \pm z_{\alpha/2} \cdot \frac{\sigma}{\sqrt{n}}" display />
                    <p className="text-sm text-muted-foreground">
                      Благодаря ЦПТ мы можем строить доверительные интервалы для среднего, 
                      даже если исходное распределение не является нормальным.
                    </p>
                  </div>
                  <div className="example-box">
                    <h4 className="font-semibold text-sm mb-2">2. Проверка гипотез (z-критерий)</h4>
                    <MathFormula formula="z = \frac{\bar{X} - \mu_0}{\sigma / \sqrt{n}}" display />
                    <p className="text-sm text-muted-foreground">
                      Z-статистика следует стандартному нормальному распределению при <MathFormula formula="H_0" />, 
                      что позволяет вычислять p-value.
                    </p>
                  </div>
                  <div className="example-box">
                    <h4 className="font-semibold text-sm mb-2">3. Скорость сходимости</h4>
                    <p className="text-sm text-muted-foreground">
                      Чем ближе исходное распределение к нормальному, тем быстрее сходимость. 
                      Для симметричных распределений достаточно <MathFormula formula="n \geq 15" />, 
                      для сильно скошенных — <MathFormula formula="n \geq 30\text{–}50" />.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="application" className="mt-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-border/50 space-y-2">
                    <h4 className="text-sm font-semibold text-primary">🧪 Психология</h4>
                    <p className="text-xs text-muted-foreground">
                      Время реакции обычно имеет экспоненциальное распределение, но среднее время реакции 
                      по выборке из 30+ участников будет приближённо нормальным — это обосновывает 
                      использование t-теста.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-border/50 space-y-2">
                    <h4 className="text-sm font-semibold text-primary">📊 Социология</h4>
                    <p className="text-xs text-muted-foreground">
                      Распределение доходов бимодальное, но средний доход по случайной выборке из 
                      населения будет нормально распределён, что позволяет строить интервальные оценки.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-border/50 space-y-2">
                    <h4 className="text-sm font-semibold text-primary">🏥 Медицина</h4>
                    <p className="text-xs text-muted-foreground">
                      Уровни биомаркеров могут иметь произвольное распределение, но ЦПТ гарантирует, 
                      что средние значения в клинических испытаниях будут нормальными при достаточном n.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-border/50 space-y-2">
                    <h4 className="text-sm font-semibold text-primary">📐 Контроль качества</h4>
                    <p className="text-xs text-muted-foreground">
                      Контрольные карты Шухарта основаны на ЦПТ: средние значения подгрупп измерений 
                      нормальны, что позволяет обнаруживать систематические отклонения.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Controls */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              Параметры эксперимента
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  ЦПТ утверждает, что распределение выборочных средних стремится к нормальному
                  при увеличении размера выборки, независимо от исходного распределения.
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Distribution Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Исходное распределение</label>
                <Select value={distribution} onValueChange={(v) => { setDistribution(v as Distribution); reset(); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(distributionLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-mono text-primary">{distributionIcons[key as Distribution]}</span>
                          <div>
                            <div>{label}</div>
                            <div className="text-xs text-muted-foreground">
                              {distributionDescriptions[key as Distribution]}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sample Size */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Размер выборки (n): <span className="font-bold text-primary">{sampleSize}</span>
                </label>
                <Slider
                  value={[sampleSize]}
                  onValueChange={([v]) => { setSampleSize(v); reset(); }}
                  min={2}
                  max={100}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">
                  Больший n → быстрее сходимость к нормальному
                </p>
              </div>

              {/* Speed */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Скорость: <span className="font-bold text-primary">{Math.round(1000 / speed)} выборок/сек</span>
                </label>
                <Slider
                  value={[speed]}
                  onValueChange={([v]) => setSpeed(v)}
                  min={20}
                  max={500}
                  step={20}
                />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                variant={isRunning ? 'secondary' : 'default'}
                className="gap-2"
                size="lg"
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'Пауза' : 'Запустить'}
              </Button>
              <Button onClick={runOneSample} variant="outline" disabled={isRunning}>
                +1 выборка
              </Button>
              <Button onClick={() => { for (let i = 0; i < 100; i++) runOneSample(); }} variant="outline" disabled={isRunning}>
                +100 выборок
              </Button>
              <Button onClick={reset} variant="ghost" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Сброс
              </Button>
              <Badge variant="outline" className="ml-auto text-base px-4 py-1.5 font-mono">
                n = {numSamples}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Visualizations */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Source Distribution */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-muted">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">Исходное распределение</CardTitle>
                  <CardDescription className="text-xs">
                    Генеральная совокупность ({distributionLabels[distribution]})
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={sourceAreaData}>
                  <defs>
                    <linearGradient id="sourceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.5} />
                  <XAxis
                    dataKey="x"
                    tickFormatter={(v) => typeof v === 'number' ? v.toFixed(1) : v}
                    className="text-xs"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="frequency"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#sourceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sampling Distribution */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Распределение выборочных средних</CardTitle>
                  <CardDescription className="text-xs">
                    {numSamples > 0
                      ? <>M = {meanOfMeans.toFixed(3)}, SD = {sdOfMeans.toFixed(3)}</>
                      : 'Запустите симуляцию для сбора данных'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={combinedData}>
                  <defs>
                    <linearGradient id="meansGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.5} />
                  <XAxis
                    dataKey="midpoint"
                    tickFormatter={(v) => typeof v === 'number' ? v.toFixed(1) : v}
                    className="text-xs"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                  <Bar
                    dataKey="frequency"
                    fill="url(#meansGradient)"
                    stroke="hsl(var(--primary))"
                    strokeWidth={0.5}
                    radius={[3, 3, 0, 0]}
                  />
                  {numSamples > 10 && (
                    <Line
                      type="monotone"
                      dataKey="normalY"
                      stroke="hsl(var(--destructive))"
                      strokeWidth={2.5}
                      dot={false}
                      strokeDasharray="6 3"
                    />
                  )}
                  <ReferenceLine
                    x={meanOfMeans}
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Statistics Panel */}
      <AnimatePresence>
        {numSamples > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/40">
                    <p className="text-xs text-muted-foreground mb-1">Среднее средних</p>
                    <p className="text-xl font-bold font-mono text-primary">{meanOfMeans.toFixed(4)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <MathFormula formula="\bar{\bar{X}}" />
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/40">
                    <p className="text-xs text-muted-foreground mb-1">Стандартная ошибка</p>
                    <p className="text-xl font-bold font-mono text-primary">{sdOfMeans.toFixed(4)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <MathFormula formula="SE = \sigma/\sqrt{n}" />
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/40">
                    <p className="text-xs text-muted-foreground mb-1">Асимметрия</p>
                    <p className="text-xl font-bold font-mono text-primary">
                      {skew !== null ? skew.toFixed(4) : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Норм. ≈ 0
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/40">
                    <p className="text-xs text-muted-foreground mb-1">Эксцесс</p>
                    <p className="text-xl font-bold font-mono text-primary">
                      {kurt !== null ? kurt.toFixed(4) : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Норм. ≈ 0
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explanation */}
      <Card className="bg-muted/20 border-primary/10">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">1</span>
                Что происходит?
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Мы многократно берём выборки размера n из исходного распределения
                и вычисляем среднее каждой выборки. Гистограмма справа показывает
                распределение этих средних.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">2</span>
                Почему это работает?
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                ЦПТ говорит, что сумма (и среднее) большого числа независимых
                случайных величин стремится к нормальному распределению,
                даже если сами величины распределены иначе.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">3</span>
                Попробуйте
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Измените размер выборки: при n=5 распределение ещё не нормальное,
                при n=30+ — уже близко. Особенно заметно на экспоненциальном
                и бимодальном распределениях.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
