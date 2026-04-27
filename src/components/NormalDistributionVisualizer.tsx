import { useMemo, useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  Label as RechartsLabel,
} from 'recharts';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  normalPDF,
  normalCDFGeneral,
  normalIntervalProb,
  zScore,
} from '@/lib/distributions';

interface Preset {
  label: string;
  mu: number;
  sigma: number;
  hint?: string;
}

const PRESETS: Preset[] = [
  { label: 'IQ (μ=100, σ=15)', mu: 100, sigma: 15, hint: 'Шкала Векслера' },
  { label: 't-баллы (μ=50, σ=10)', mu: 50, sigma: 10, hint: 'MMPI, MCMI' },
  { label: 'z-шкала (0, 1)', mu: 0, sigma: 1, hint: 'Стандартная нормальная' },
  { label: 'Бек ~ (μ=12, σ=8)', mu: 12, sigma: 8, hint: 'Приближение для BDI' },
];

const NUM_POINTS = 200;
const fmt = (v: number, d = 2) => v.toFixed(d);

interface Props {
  className?: string;
}

export const NormalDistributionVisualizer = ({ className = '' }: Props) => {
  // Primary distribution
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);

  // Region of interest
  const [interval, setInterval] = useState<[number, number]>([-1, 1]);

  // Toggles
  const [showZ, setShowZ] = useState(true);
  const [cumulative, setCumulative] = useState(false);
  const [compare, setCompare] = useState(false);

  // Comparison distribution
  const [mu2, setMu2] = useState(1);
  const [sigma2, setSigma2] = useState(1.5);

  // Keep [a,b] within sensible bounds when μ/σ change
  useEffect(() => {
    const lo = mu - 4 * sigma;
    const hi = mu + 4 * sigma;
    setInterval(([a, b]) => [
      Math.max(lo, Math.min(hi, a)),
      Math.max(lo, Math.min(hi, b)),
    ]);
  }, [mu, sigma]);

  const xMin = useMemo(() => {
    const a = mu - 4 * sigma;
    if (compare) return Math.min(a, mu2 - 4 * sigma2);
    return a;
  }, [mu, sigma, compare, mu2, sigma2]);

  const xMax = useMemo(() => {
    const b = mu + 4 * sigma;
    if (compare) return Math.max(b, mu2 + 4 * sigma2);
    return b;
  }, [mu, sigma, compare, mu2, sigma2]);

  const data = useMemo(() => {
    const step = (xMax - xMin) / (NUM_POINTS - 1);
    const arr: Array<{
      x: number;
      y: number;
      y2?: number;
      yArea: number | null;
    }> = [];
    const [a, b] = interval;
    for (let i = 0; i < NUM_POINTS; i++) {
      const x = xMin + i * step;
      const y = cumulative
        ? normalCDFGeneral(x, mu, sigma)
        : normalPDF(x, mu, sigma);
      const y2 = compare
        ? cumulative
          ? normalCDFGeneral(x, mu2, sigma2)
          : normalPDF(x, mu2, sigma2)
        : undefined;
      const inRange = x >= a && x <= b;
      arr.push({
        x,
        y,
        y2,
        yArea: inRange && !cumulative ? y : null,
      });
    }
    return arr;
  }, [xMin, xMax, mu, sigma, compare, mu2, sigma2, cumulative, interval]);

  // Stats
  const prob = useMemo(
    () => normalIntervalProb(interval[0], interval[1], mu, sigma),
    [interval, mu, sigma],
  );
  const zA = zScore(interval[0], mu, sigma);
  const zB = zScore(interval[1], mu, sigma);

  const ariaLabel = `Нормальное распределение, среднее ${fmt(mu)}, сигма ${fmt(
    sigma,
  )}. Вероятность попасть в интервал от ${fmt(interval[0])} до ${fmt(
    interval[1],
  )} равна ${fmt(prob, 4)}.`;

  // Reference lines (μ ± kσ) for primary curve only
  const refs = [
    { x: mu - 3 * sigma, label: 'μ−3σ' },
    { x: mu - 2 * sigma, label: 'μ−2σ' },
    { x: mu - sigma, label: 'μ−σ' },
    { x: mu, label: 'μ' },
    { x: mu + sigma, label: 'μ+σ' },
    { x: mu + 2 * sigma, label: 'μ+2σ' },
    { x: mu + 3 * sigma, label: 'μ+3σ' },
  ];

  const applyPreset = (p: Preset) => {
    setMu(p.mu);
    setSigma(p.sigma);
    setInterval([p.mu - p.sigma, p.mu + p.sigma]);
  };

  const ChartCmp = cumulative ? LineChart : AreaChart;

  return (
    <TooltipProvider>
      <div className={`grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 ${className}`}>
        {/* Controls — sticky on md+ */}
        <aside className="md:sticky md:top-20 md:self-start space-y-5 border border-border p-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Пресеты
            </div>
            <div className="flex flex-col gap-1.5">
              {PRESETS.map((p) => (
                <Button
                  key={p.label}
                  variant="outline"
                  size="sm"
                  className="justify-start font-mono text-xs h-auto py-1.5"
                  onClick={() => applyPreset(p)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <Label>μ (среднее)</Label>
              <span className="font-mono">{fmt(mu)}</span>
            </div>
            <Slider
              min={-5}
              max={5}
              step={0.1}
              value={[mu]}
              onValueChange={([v]) => setMu(v)}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <Label>σ (стандартное отклонение)</Label>
              <span className="font-mono">{fmt(sigma)}</span>
            </div>
            <Slider
              min={0.1}
              max={3}
              step={0.05}
              value={[sigma]}
              onValueChange={([v]) => setSigma(v)}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <Label>Область [a, b]</Label>
              <span className="font-mono">
                [{fmt(interval[0])}; {fmt(interval[1])}]
              </span>
            </div>
            <Slider
              min={xMin}
              max={xMax}
              step={(xMax - xMin) / 200}
              value={interval}
              onValueChange={(v) =>
                setInterval([v[0], v[1]] as [number, number])
              }
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <Label htmlFor="z-toggle" className="text-xs">
                z-преобразование
              </Label>
              <Switch id="z-toggle" checked={showZ} onCheckedChange={setShowZ} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="cdf-toggle" className="text-xs">
                Накопительное (CDF)
              </Label>
              <Switch
                id="cdf-toggle"
                checked={cumulative}
                onCheckedChange={setCumulative}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="cmp-toggle" className="text-xs">
                Сравнить с другим
              </Label>
              <Switch
                id="cmp-toggle"
                checked={compare}
                onCheckedChange={setCompare}
              />
            </div>
          </div>

          {compare && (
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <Label>μ₂</Label>
                  <span className="font-mono">{fmt(mu2)}</span>
                </div>
                <Slider
                  min={-5}
                  max={5}
                  step={0.1}
                  value={[mu2]}
                  onValueChange={([v]) => setMu2(v)}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <Label>σ₂</Label>
                  <span className="font-mono">{fmt(sigma2)}</span>
                </div>
                <Slider
                  min={0.1}
                  max={3}
                  step={0.05}
                  value={[sigma2]}
                  onValueChange={([v]) => setSigma2(v)}
                />
              </div>
            </div>
          )}
        </aside>

        {/* Visualization */}
        <div className="space-y-4">
          {/* Live report */}
          <div
            className="border border-border p-4 font-mono text-sm space-y-1 bg-muted/30"
            role="status"
            aria-live="polite"
          >
            <div>
              P({fmt(interval[0])} ≤ X ≤ {fmt(interval[1])}) ={' '}
              <span className="font-bold">{fmt(prob, 4)}</span>
            </div>
            <div className="text-muted-foreground">
              z(a) = {fmt(zA, 3)} · z(b) = {fmt(zB, 3)}
            </div>
            {compare && (
              <div className="text-muted-foreground">
                сравнение: N({fmt(mu2)}, {fmt(sigma2)}²)
              </div>
            )}
          </div>

          {/* Chart */}
          <div
            className="h-[420px] border border-border p-2"
            role="img"
            aria-label={ariaLabel}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ChartCmp data={data} margin={{ top: 24, right: 16, bottom: showZ ? 48 : 24, left: 8 }}>
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[xMin, xMax]}
                  tickFormatter={(v) => fmt(v, 1)}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                >
                  {showZ && (
                    <RechartsLabel
                      value={`z-шкала: x → (x − ${fmt(mu)}) / ${fmt(sigma)}`}
                      position="bottom"
                      offset={20}
                      style={{
                        fill: 'hsl(var(--muted-foreground))',
                        fontSize: 11,
                        fontFamily: 'monospace',
                      }}
                    />
                  )}
                </XAxis>
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickFormatter={(v) => v.toFixed(2)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) => {
                    const label = name === 'y' ? (cumulative ? 'F(x)' : 'f(x)') : 'curve₂';
                    return [fmt(value, 4), label];
                  }}
                  labelFormatter={(x: number) => {
                    const z = zScore(x, mu, sigma);
                    return `x = ${fmt(x, 2)}${showZ ? ` · z = ${fmt(z, 2)}` : ''}`;
                  }}
                />

                {/* Reference lines μ ± kσ */}
                {refs.map((r) => (
                  <ReferenceLine
                    key={r.label}
                    x={r.x}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    strokeOpacity={r.label === 'μ' ? 0.8 : 0.4}
                  >
                    <RechartsLabel
                      value={r.label}
                      position="top"
                      style={{
                        fill: 'hsl(var(--muted-foreground))',
                        fontSize: 10,
                        fontFamily: 'monospace',
                      }}
                    />
                  </ReferenceLine>
                ))}

                {cumulative ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="y"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                    {compare && (
                      <Line
                        type="monotone"
                        dataKey="y2"
                        stroke="hsl(var(--foreground))"
                        strokeWidth={2}
                        strokeDasharray="5 3"
                        dot={false}
                        isAnimationActive={false}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <Area
                      type="monotone"
                      dataKey="y"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="hsl(var(--primary))"
                      fillOpacity={0.05}
                      isAnimationActive={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="yArea"
                      stroke="none"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.25}
                      isAnimationActive={false}
                      connectNulls={false}
                    />
                    {compare && (
                      <Area
                        type="monotone"
                        dataKey="y2"
                        stroke="hsl(var(--foreground))"
                        strokeDasharray="5 3"
                        strokeWidth={2}
                        fill="hsl(var(--foreground))"
                        fillOpacity={0.04}
                        isAnimationActive={false}
                      />
                    )}
                  </>
                )}
              </ChartCmp>
            </ResponsiveContainer>
          </div>

          {/* Psychological context */}
          <div className="border border-border p-4 text-sm leading-relaxed">
            <h4 className="font-serif text-base mb-2">
              Что значит{' '}
              <UITooltip>
                <TooltipTrigger asChild>
                  <span className="underline decoration-dotted cursor-help">
                    σ
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Стандартное отклонение — типичный «шаг» отклонения значений
                  от среднего.
                </TooltipContent>
              </UITooltip>{' '}
              в шкале IQ?
            </h4>
            <p className="text-muted-foreground">
              При μ = 100 и σ = 15 примерно 68% людей имеют IQ в диапазоне
              85–115, около 95% — в 70–130. То есть сдвиг на одну σ — это
              переход к границе «обычной» части популяции; две σ — уже редкое
              значение (≈2.5% сверху).
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default NormalDistributionVisualizer;
