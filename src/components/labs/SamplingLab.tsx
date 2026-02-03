import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus, Trash2, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { generateSample, mean, variance, standardDeviation, standardError, histogram, skewness, kurtosis } from '@/lib/statistics';

// True population parameters (for comparison)
const TRUE_MEAN = 5;
const TRUE_SD = 1.5;

export const SamplingLab = () => {
  const [sampleSize, setSampleSize] = useState(30);
  const [currentSample, setCurrentSample] = useState<number[]>([]);
  const [sampleHistory, setSampleHistory] = useState<{ mean: number; se: number; n: number }[]>([]);

  // Generate new sample
  const generateNewSample = useCallback(() => {
    const sample = generateSample('normal', sampleSize);
    setCurrentSample(sample);
    setSampleHistory(prev => [
      ...prev,
      { mean: mean(sample), se: standardError(sample), n: sampleSize }
    ].slice(-50)); // Keep last 50 samples
  }, [sampleSize]);

  // Clear all
  const clearAll = () => {
    setCurrentSample([]);
    setSampleHistory([]);
  };

  // Calculate statistics
  const stats = currentSample.length > 0 ? {
    mean: mean(currentSample),
    variance: variance(currentSample),
    sd: standardDeviation(currentSample),
    se: standardError(currentSample),
    skewness: skewness(currentSample),
    kurtosis: kurtosis(currentSample),
    min: Math.min(...currentSample),
    max: Math.max(...currentSample),
    range: Math.max(...currentSample) - Math.min(...currentSample),
  } : null;

  // Histogram data
  const histogramData = currentSample.length > 0 ? histogram(currentSample, 15) : [];

  // Sample means over time
  const meansOverTime = sampleHistory.map((s, i) => ({
    index: i + 1,
    mean: s.mean,
    lower: s.mean - 1.96 * s.se,
    upper: s.mean + 1.96 * s.se,
  }));

  // Scatter data for sample points
  const scatterData = currentSample.map((val, i) => ({
    x: i,
    y: val,
  }));

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Генератор выборок
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Исследуйте, как размер выборки влияет на точность оценок.
                Истинное среднее генеральной совокупности: μ = 5.
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <CardDescription>
            Генеральная совокупность: N(μ=5, σ=1.5)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sample Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Размер выборки (n): <span className="font-bold text-primary">{sampleSize}</span>
              </label>
              <Slider
                value={[sampleSize]}
                onValueChange={([v]) => setSampleSize(v)}
                min={5}
                max={200}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                SE = σ/√n: больше n → меньше стандартная ошибка
              </p>
            </div>

            {/* Theoretical SE */}
            <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Теоретическая SE</p>
                <p className="text-2xl font-bold text-primary">
                  {(TRUE_SD / Math.sqrt(sampleSize)).toFixed(4)}
                </p>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            <Button onClick={generateNewSample} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Сгенерировать выборку
            </Button>
            <Button onClick={() => { for(let i = 0; i < 10; i++) generateNewSample(); }} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              +10 выборок
            </Button>
            <Button onClick={clearAll} variant="ghost" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Очистить
            </Button>
            <Badge variant="outline" className="ml-auto">
              История: {sampleHistory.length} выборок
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Current Sample Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Среднее (M)</p>
              <p className="text-2xl font-bold">{stats.mean.toFixed(3)}</p>
              <p className="text-xs text-muted-foreground">μ = 5.000</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Дисперсия (s²)</p>
              <p className="text-2xl font-bold">{stats.variance.toFixed(3)}</p>
              <p className="text-xs text-muted-foreground">σ² = 2.250</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Станд. откл. (s)</p>
              <p className="text-2xl font-bold">{stats.sd.toFixed(3)}</p>
              <p className="text-xs text-muted-foreground">σ = 1.500</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Станд. ошибка (SE)</p>
              <p className="text-2xl font-bold text-primary">{stats.se.toFixed(3)}</p>
              <p className="text-xs text-muted-foreground">
                Теор: {(TRUE_SD / Math.sqrt(sampleSize)).toFixed(3)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Асимметрия</p>
              <p className="text-2xl font-bold">{stats.skewness.toFixed(3)}</p>
              <p className="text-xs text-muted-foreground">0 = симметр.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Эксцесс</p>
              <p className="text-2xl font-bold">{stats.kurtosis.toFixed(3)}</p>
              <p className="text-xs text-muted-foreground">0 = норм.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visualizations */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Histogram */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Гистограмма текущей выборки</CardTitle>
            <CardDescription>
              n = {currentSample.length}, пунктир = истинное среднее (μ=5)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="binStart" 
                  tickFormatter={(v) => v.toFixed(1)}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))" 
                  opacity={0.7}
                  radius={[2, 2, 0, 0]}
                />
                <ReferenceLine 
                  x={TRUE_MEAN} 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{ value: 'μ', position: 'top', fill: 'hsl(var(--destructive))' }}
                />
                {stats && (
                  <ReferenceLine 
                    x={stats.mean} 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    label={{ value: 'M', position: 'top', fill: 'hsl(var(--accent))' }}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sample Means History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">История выборочных средних</CardTitle>
            <CardDescription>
              Каждая точка — среднее одной выборки с 95% ДИ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart data={meansOverTime}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="index" 
                  name="Выборка"
                  className="text-xs"
                />
                <YAxis 
                  domain={[3, 7]}
                  className="text-xs"
                />
                <ZAxis range={[50, 50]} />
                <ReferenceLine 
                  y={TRUE_MEAN} 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Scatter 
                  dataKey="mean" 
                  fill="hsl(var(--primary))" 
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Explanation */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2 text-primary">Выборочное среднее (M)</h4>
              <p className="text-muted-foreground">
                Оценка истинного среднего популяции. Несмещённая оценка: 
                E[M] = μ, но каждая конкретная выборка даёт немного другое значение.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-primary">Стандартная ошибка (SE)</h4>
              <p className="text-muted-foreground">
                Мера точности оценки среднего. SE = s/√n. 
                Увеличение n в 4 раза уменьшает SE вдвое.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-primary">Попробуйте</h4>
              <p className="text-muted-foreground">
                Сгенерируйте много выборок при n=10 и n=100. 
                Заметьте, как средние при большем n группируются ближе к μ=5.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
