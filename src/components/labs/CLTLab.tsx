import { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Line,
} from 'recharts';
import { generateSample, mean, histogram, generateNormalCurve, standardDeviation } from '@/lib/statistics';

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

export const CLTLab = () => {
  const [distribution, setDistribution] = useState<Distribution>('uniform');
  const [sampleSize, setSampleSize] = useState(30);
  const [numSamples, setNumSamples] = useState(0);
  const [sampleMeans, setSampleMeans] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(100);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate source distribution for visualization
  const sourceData = useCallback(() => {
    const samples = generateSample(distribution, 1000);
    return histogram(samples, 30);
  }, [distribution]);

  // Generate one sample and add its mean
  const runOneSample = useCallback(() => {
    const sample = generateSample(distribution, sampleSize);
    const sampleMean = mean(sample);
    setSampleMeans(prev => [...prev, sampleMean]);
    setNumSamples(prev => prev + 1);
  }, [distribution, sampleSize]);

  // Auto-run effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(runOneSample, speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, runOneSample, speed]);

  // Reset when distribution or sample size changes
  const reset = () => {
    setIsRunning(false);
    setSampleMeans([]);
    setNumSamples(0);
  };

  // Histogram of sample means
  const meansHistogramData = histogram(sampleMeans, 25);

  // Normal curve overlay
  const meanOfMeans = sampleMeans.length > 0 ? mean(sampleMeans) : 5;
  const sdOfMeans = sampleMeans.length > 1 ? standardDeviation(sampleMeans) : 1;
  const normalCurve = generateNormalCurve(meanOfMeans, sdOfMeans, 50);

  // Scale normal curve to histogram
  const maxFreq = Math.max(...meansHistogramData.map(d => d.frequency), 0.01);
  const maxNormalY = Math.max(...normalCurve.map(d => d.y), 0.01);
  const scaledNormalCurve = normalCurve.map(d => ({
    x: d.x,
    y: (d.y / maxNormalY) * maxFreq,
  }));

  // Combine histogram and normal curve data
  const combinedData = meansHistogramData.map(bin => {
    const midpoint = (bin.binStart + bin.binEnd) / 2;
    const normalY = scaledNormalCurve.find(
      (d, i, arr) => i < arr.length - 1 && d.x <= midpoint && arr[i + 1].x > midpoint
    )?.y || 0;
    return {
      ...bin,
      midpoint,
      normalY,
    };
  });

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
                      <div>
                        <div>{label}</div>
                        <div className="text-xs text-muted-foreground">
                          {distributionDescriptions[key as Distribution]}
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
                min={5}
                max={100}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Больший n → быстрее сходимость к нормальному
              </p>
            </div>

            {/* Speed */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Скорость: <span className="font-bold text-primary">{1000 / speed} выборок/сек</span>
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
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              variant={isRunning ? 'secondary' : 'default'}
              className="gap-2"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Пауза' : 'Запустить'}
            </Button>
            <Button onClick={runOneSample} variant="outline" disabled={isRunning}>
              +1 выборка
            </Button>
            <Button onClick={reset} variant="ghost" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Сброс
            </Button>
            <Badge variant="outline" className="ml-auto text-lg px-4 py-1">
              Выборок: {numSamples}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Visualizations */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Исходное распределение</CardTitle>
            <CardDescription>
              Генеральная совокупность ({distributionLabels[distribution]})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sourceData()}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="binStart" 
                  tickFormatter={(v) => v.toFixed(1)}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Bar 
                  dataKey="frequency" 
                  fill="hsl(var(--primary))" 
                  opacity={0.7}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sampling Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Распределение выборочных средних</CardTitle>
            <CardDescription>
              {numSamples > 0 
                ? `M = ${meanOfMeans.toFixed(3)}, SD = ${sdOfMeans.toFixed(3)}`
                : 'Запустите симуляцию для сбора данных'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="midpoint" 
                  tickFormatter={(v) => v.toFixed(1)}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Bar 
                  dataKey="frequency" 
                  fill="hsl(var(--primary))" 
                  opacity={0.7}
                  radius={[2, 2, 0, 0]}
                />
                {numSamples > 10 && (
                  <Line 
                    type="monotone"
                    dataKey="normalY" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    dot={false}
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
      </div>

      {/* Explanation */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2 text-primary">Что происходит?</h4>
              <p className="text-muted-foreground">
                Мы многократно берём выборки размера n из исходного распределения 
                и вычисляем среднее каждой выборки. Гистограмма справа показывает 
                распределение этих средних.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-primary">Почему это работает?</h4>
              <p className="text-muted-foreground">
                ЦПТ говорит, что сумма (и среднее) большого числа независимых 
                случайных величин стремится к нормальному распределению, 
                даже если сами величины распределены иначе.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-primary">Попробуйте</h4>
              <p className="text-muted-foreground">
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
