import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { generateSample, mean, standardError, tStatistic, approximatePValue, normalPDF } from '@/lib/statistics';
import { ChartA11y } from '@/components/ChartA11y';

// Null hypothesis: μ = 50
const NULL_MEAN = 50;
const TRUE_SD = 10;

export const HypothesisTestingLab = () => {
  const [sampleSize, setSampleSize] = useState(30);
  const [effectSize, setEffectSize] = useState(0.5); // Cohen's d
  const [alpha, setAlpha] = useState(0.05);
  const [currentSample, setCurrentSample] = useState<number[]>([]);
  const [testHistory, setTestHistory] = useState<{ significant: boolean; pValue: number }[]>([]);

  // True population mean (based on effect size)
  const trueMean = NULL_MEAN + effectSize * TRUE_SD;

  // Generate sample from true distribution
  const runTest = useCallback(() => {
    const sample = generateSample('normal', sampleSize).map(
      x => (x - 5) * (TRUE_SD / 1.5) + trueMean
    );
    setCurrentSample(sample);
    
    const m = mean(sample);
    const se = standardError(sample);
    const t = tStatistic(m, NULL_MEAN, se);
    const p = approximatePValue(t);
    
    setTestHistory(prev => [...prev.slice(-99), { significant: p < alpha, pValue: p }]);
  }, [sampleSize, trueMean, alpha]);

  // Reset
  const reset = () => {
    setCurrentSample([]);
    setTestHistory([]);
  };

  // Current test statistics
  const stats = useMemo(() => {
    if (currentSample.length === 0) return null;
    const m = mean(currentSample);
    const se = standardError(currentSample);
    const t = tStatistic(m, NULL_MEAN, se);
    const p = approximatePValue(t);
    return { mean: m, se, t, p, significant: p < alpha };
  }, [currentSample, alpha]);

  // Power calculation (approximation)
  const theoreticalPower = useMemo(() => {
    // Non-centrality parameter
    const ncp = effectSize * Math.sqrt(sampleSize);
    // Approximate power using normal approximation
    const criticalZ = alpha === 0.01 ? 2.576 : alpha === 0.05 ? 1.96 : 1.645;
    // Power = P(Z > criticalZ - ncp)
    const power = 1 - (0.5 * (1 + Math.sign(criticalZ - ncp) * 
      (1 - Math.exp(-2 * Math.pow(Math.abs(criticalZ - ncp), 2) / Math.PI))));
    return Math.max(0, Math.min(1, power));
  }, [effectSize, sampleSize, alpha]);

  // Observed power
  const observedPower = testHistory.length > 0
    ? testHistory.filter(t => t.significant).length / testHistory.length
    : 0;

  // Generate t-distribution curve data
  const tDistData = useMemo(() => {
    const data: { x: number; y: number; fill: string }[] = [];
    const criticalT = alpha === 0.01 ? 2.576 : alpha === 0.05 ? 1.96 : 1.645;
    
    for (let x = -4; x <= 4; x += 0.1) {
      const y = normalPDF(x, 0, 1);
      let fill = 'hsl(var(--primary) / 0.3)';
      if (Math.abs(x) > criticalT) {
        fill = 'hsl(var(--destructive) / 0.6)';
      }
      data.push({ x: parseFloat(x.toFixed(1)), y, fill });
    }
    return data;
  }, [alpha]);

  // Critical t-value
  const criticalT = alpha === 0.01 ? 2.576 : alpha === 0.05 ? 1.96 : 1.645;

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
                H₀: μ = 50 (нулевая гипотеза). Мы проверяем, отличается ли 
                выборочное среднее от 50 значимо.
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <CardDescription>
            Односторонний t-тест против H₀: μ = 50
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Effect Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Размер эффекта (d Коэна): <span className="font-bold text-primary">{effectSize.toFixed(2)}</span>
              </label>
              <Slider
                value={[effectSize]}
                onValueChange={([v]) => { setEffectSize(v); reset(); }}
                min={0}
                max={1.5}
                step={0.1}
                ariaLabel="Размер эффекта d Коэна"
                ariaValueTextFormatter={(v) => `d = ${v.toFixed(2)}`}
              />
              <p className="text-xs text-muted-foreground">
                d=0: нет эффекта, d=0.5: средний, d=0.8: большой
              </p>
            </div>

            {/* Sample Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Размер выборки (n): <span className="font-bold text-primary">{sampleSize}</span>
              </label>
              <Slider
                value={[sampleSize]}
                onValueChange={([v]) => { setSampleSize(v); reset(); }}
                min={10}
                max={200}
                step={10}
                ariaLabel="Размер выборки n"
                ariaValueTextFormatter={(v) => `n = ${v}`}
              />
              <p className="text-xs text-muted-foreground">
                Больше n → выше мощность
              </p>
            </div>

            {/* Alpha */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Уровень значимости (α): <span className="font-bold text-primary">{alpha}</span>
              </label>
              <Slider
                value={[alpha]}
                onValueChange={([v]) => { setAlpha(v); reset(); }}
                min={0.01}
                max={0.10}
                step={0.01}
                ariaLabel="Уровень значимости α"
                ariaValueTextFormatter={(v) => `α = ${v.toFixed(2)}`}
              />
              <p className="text-xs text-muted-foreground">
                Меньше α → меньше ошибок I рода, но ниже мощность
              </p>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            <Button onClick={runTest} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Провести тест
            </Button>
            <Button onClick={() => { for(let i = 0; i < 20; i++) runTest(); }} variant="outline">
              +20 тестов
            </Button>
            <Button onClick={reset} variant="ghost">
              Сброс
            </Button>
            <div className="ml-auto flex gap-2">
              <Badge variant="outline">
                Истинное μ = {trueMean.toFixed(1)}
              </Badge>
              <Badge variant="outline">
                Тестов: {testHistory.length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Test Result */}
      {stats && (
        <Card className={stats.significant ? 'border-success/50 bg-success/5' : 'border-muted'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Результат текущего теста
              <Badge variant={stats.significant ? 'default' : 'secondary'}>
                {stats.significant ? 'Значимо' : 'Не значимо'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Выборочное M</p>
                <p className="text-2xl font-bold">{stats.mean.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">t-статистика</p>
                <p className="text-2xl font-bold">{stats.t.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">p-value</p>
                <p className={`text-2xl font-bold ${stats.p < alpha ? 'text-success' : ''}`}>
                  {stats.p < 0.001 ? '< 0.001' : stats.p.toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Критическое t</p>
                <p className="text-2xl font-bold">±{criticalT.toFixed(3)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Теоретическая мощность</p>
            <p className="text-3xl font-bold text-primary">{(theoreticalPower * 100).toFixed(0)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Наблюдаемая мощность</p>
            <p className="text-3xl font-bold">{(observedPower * 100).toFixed(0)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Значимых тестов</p>
            <p className="text-3xl font-bold text-success">
              {testHistory.filter(t => t.significant).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Ошибок II рода (β)</p>
            <p className="text-3xl font-bold text-destructive">
              {testHistory.filter(t => !t.significant).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* T-Distribution Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Распределение t-статистики под H₀</CardTitle>
          <CardDescription>
            Красные области — критические значения (p {'<'} α). Вертикальная линия — текущее t.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartA11y
            label={`t-распределение под H₀, α=${alpha}, критическое t=±${criticalT.toFixed(2)}${stats ? `, наблюдаемое t=${stats.t.toFixed(2)}` : ''}`}
            summary={`Распределение t-статистики под нулевой гипотезой. α = ${alpha}. Критические значения ±${criticalT.toFixed(2)}.${stats ? ` Наблюдаемое t = ${stats.t.toFixed(2)}.` : ''}`}
          >
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={tDistData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="x" 
                  domain={[-4, 4]}
                  ticks={[-4, -3, -2, -1, 0, 1, 2, 3, 4]}
                  className="text-xs"
                />
                <YAxis className="text-xs" hide />
                <Area
                  type="monotone"
                  dataKey="y"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.3)"
                />
                <ReferenceLine 
                  x={-criticalT} 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <ReferenceLine 
                  x={criticalT} 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                {stats && (
                  <ReferenceLine 
                    x={stats.t} 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={3}
                    label={{ 
                      value: `t=${stats.t.toFixed(2)}`, 
                      position: 'top',
                      fill: 'hsl(var(--accent))'
                    }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </ChartA11y>
        </CardContent>
      </Card>

      {/* Explanation */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2 text-primary">Ошибка I рода (α)</h4>
              <p className="text-muted-foreground">
                Вероятность отвергнуть H₀, когда она верна. 
                При d=0 доля значимых результатов ≈ α.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-primary">Мощность (1-β)</h4>
              <p className="text-muted-foreground">
                Вероятность обнаружить эффект, когда он есть. 
                Зависит от d, n и α.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-primary">Попробуйте</h4>
              <p className="text-muted-foreground">
                Установите d=0 и проведите 100 тестов. Доля значимых ≈ α. 
                Затем увеличьте d и наблюдайте рост мощности.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
