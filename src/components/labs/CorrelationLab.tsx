import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Info, Plus, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  ComposedChart,
} from 'recharts';
import { mean, standardDeviation } from '@/lib/statistics';

// Generate correlated data
const generateCorrelatedData = (
  n: number,
  targetR: number,
  noise: number
): { x: number; y: number }[] => {
  const data: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
    
    const x = 50 + z1 * 10;
    const y = 50 + (targetR * z1 + Math.sqrt(1 - targetR * targetR) * z2) * 10 * (1 + noise * 0.5);
    data.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  }
  return data;
};

// Calculate Pearson correlation
const pearsonR = (data: { x: number; y: number }[]): number => {
  if (data.length < 3) return 0;
  const xs = data.map(d => d.x);
  const ys = data.map(d => d.y);
  const mx = mean(xs);
  const my = mean(ys);
  const sdx = standardDeviation(xs, false);
  const sdy = standardDeviation(ys, false);
  if (sdx === 0 || sdy === 0) return 0;
  
  const n = data.length;
  const sum = data.reduce((acc, d) => acc + (d.x - mx) * (d.y - my), 0);
  return sum / (n * sdx * sdy);
};

// Calculate covariance
const covariance = (data: { x: number; y: number }[]): number => {
  if (data.length < 2) return 0;
  const xs = data.map(d => d.x);
  const ys = data.map(d => d.y);
  const mx = mean(xs);
  const my = mean(ys);
  return data.reduce((acc, d) => acc + (d.x - mx) * (d.y - my), 0) / (data.length - 1);
};

// Regression line
const regressionLine = (data: { x: number; y: number }[]): { slope: number; intercept: number } => {
  if (data.length < 2) return { slope: 0, intercept: 0 };
  const xs = data.map(d => d.x);
  const ys = data.map(d => d.y);
  const mx = mean(xs);
  const my = mean(ys);
  const sdx = standardDeviation(xs, false);
  if (sdx === 0) return { slope: 0, intercept: my };
  
  const r = pearsonR(data);
  const sdy = standardDeviation(ys, false);
  const slope = r * (sdy / sdx);
  const intercept = my - slope * mx;
  return { slope, intercept };
};

const strengthLabel = (r: number): { label: string; color: string } => {
  const abs = Math.abs(r);
  if (abs < 0.3) return { label: 'Слабая', color: 'text-muted-foreground' };
  if (abs < 0.5) return { label: 'Умеренная', color: 'text-warning' };
  if (abs < 0.7) return { label: 'Средняя', color: 'text-info' };
  if (abs < 0.9) return { label: 'Высокая', color: 'text-success' };
  return { label: 'Очень высокая', color: 'text-primary' };
};

export const CorrelationLab = () => {
  const [targetR, setTargetR] = useState(0.6);
  const [noise, setNoise] = useState(0);
  const [sampleSize, setSampleSize] = useState(50);
  const [data, setData] = useState(() => generateCorrelatedData(50, 0.6, 0));
  const [showRegLine, setShowRegLine] = useState(true);

  const regenerate = useCallback(() => {
    setData(generateCorrelatedData(sampleSize, targetR, noise));
  }, [sampleSize, targetR, noise]);

  const reset = () => {
    setTargetR(0.6);
    setNoise(0);
    setSampleSize(50);
    setData(generateCorrelatedData(50, 0.6, 0));
  };

  const addOutlier = () => {
    const outlier = { 
      x: Math.random() > 0.5 ? 90 + Math.random() * 10 : 10 - Math.random() * 10,
      y: Math.random() > 0.5 ? 10 - Math.random() * 10 : 90 + Math.random() * 10
    };
    setData(prev => [...prev, outlier]);
  };

  const r = useMemo(() => pearsonR(data), [data]);
  const cov = useMemo(() => covariance(data), [data]);
  const reg = useMemo(() => regressionLine(data), [data]);
  const strength = useMemo(() => strengthLabel(r), [r]);

  // Regression line data for chart
  const xs = data.map(d => d.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const regLineData = [
    { x: minX, y: reg.slope * minX + reg.intercept },
    { x: maxX, y: reg.slope * maxX + reg.intercept },
  ];

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
                Коэффициент корреляции Пирсона (r) измеряет силу и направление 
                линейной связи между двумя переменными. Значения от -1 до +1.
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Целевая корреляция (r): <span className="font-bold text-primary">{targetR.toFixed(2)}</span>
              </label>
              <Slider
                value={[targetR]}
                onValueChange={([v]) => setTargetR(v)}
                min={-1}
                max={1}
                step={0.05}
              />
              <p className="text-xs text-muted-foreground">
                От -1 (обратная) до +1 (прямая связь)
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Размер выборки (n): <span className="font-bold text-primary">{sampleSize}</span>
              </label>
              <Slider
                value={[sampleSize]}
                onValueChange={([v]) => setSampleSize(v)}
                min={10}
                max={200}
                step={10}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Уровень шума: <span className="font-bold text-primary">{noise.toFixed(1)}</span>
              </label>
              <Slider
                value={[noise]}
                onValueChange={([v]) => setNoise(v)}
                min={0}
                max={2}
                step={0.1}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <Button onClick={regenerate} className="gap-2">
              Сгенерировать
            </Button>
            <Button onClick={addOutlier} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Добавить выброс
            </Button>
            <Button onClick={() => setShowRegLine(!showRegLine)} variant="outline" className="gap-2">
              {showRegLine ? 'Скрыть' : 'Показать'} линию регрессии
            </Button>
            <Button onClick={reset} variant="ghost" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Сброс
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scatter Plot */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Диаграмма рассеяния</CardTitle>
            <CardDescription>
              Пример: Связь тревожности (X) и академической успеваемости (Y) у студентов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Тревожность" 
                  domain={['auto', 'auto']}
                  className="text-xs"
                  label={{ value: 'Тревожность (баллы)', position: 'bottom', offset: 0 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Успеваемость" 
                  domain={['auto', 'auto']}
                  className="text-xs"
                  label={{ value: 'Успеваемость', angle: -90, position: 'insideLeft' }}
                />
                <Scatter 
                  dataKey="y" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.6}
                  r={4}
                />
                {showRegLine && data.length > 2 && (
                  <ReferenceLine
                    segment={regLineData.map(d => ({ x: d.x, y: d.y }))}
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stats Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Результаты анализа</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Корреляция (r)</span>
                <span className="font-bold text-lg">{r.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">R²</span>
                <span className="font-bold">{(r * r).toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Ковариация</span>
                <span className="font-bold">{cov.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Сила связи</span>
                <Badge className={strength.color}>{strength.label}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Направление</span>
                <span className="font-medium">{r > 0 ? 'Положительная' : r < 0 ? 'Отрицательная' : 'Отсутствует'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">n</span>
                <span className="font-bold">{data.length}</span>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold mb-2">Регрессия</h4>
              <p className="text-xs text-muted-foreground font-mono">
                ŷ = {reg.slope.toFixed(3)}x + {reg.intercept.toFixed(3)}
              </p>
            </div>

            {/* Interpretation guide */}
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold mb-2">Шкала интерпретации</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span>|r| &lt; 0.3</span><span className="text-muted-foreground">Слабая</span></div>
                <div className="flex justify-between"><span>0.3 – 0.5</span><span className="text-warning">Умеренная</span></div>
                <div className="flex justify-between"><span>0.5 – 0.7</span><span className="text-info">Средняя</span></div>
                <div className="flex justify-between"><span>0.7 – 0.9</span><span className="text-success">Высокая</span></div>
                <div className="flex justify-between"><span>&gt; 0.9</span><span className="text-primary">Очень высокая</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Explanation */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2 text-primary">Что такое корреляция?</h4>
              <p className="text-muted-foreground">
                Корреляция Пирсона (r) измеряет силу и направление линейной связи. 
                R² показывает, какую долю дисперсии одной переменной объясняет другая. 
                Например, r = 0.7 означает, что 49% вариации объяснено.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-primary">Влияние выбросов</h4>
              <p className="text-muted-foreground">
                Добавьте выброс и наблюдайте, как одна точка может сильно изменить 
                коэффициент корреляции. Это особенно важно при малых выборках 
                в психологических исследованиях.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-primary">Корреляция ≠ причинность</h4>
              <p className="text-muted-foreground">
                Высокая корреляция между тревожностью и успеваемостью не означает, 
                что тревожность вызывает снижение оценок. Может существовать 
                третья переменная (например, стресс).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
