import { useState, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip } from 'recharts';
import { MathFormula } from '@/components/MathFormula';

interface NormalDistributionVisualizerProps {
  className?: string;
}

// Функция плотности нормального распределения
const normalPDF = (x: number, mu: number, sigma: number): number => {
  const coefficient = 1 / (sigma * Math.sqrt(2 * Math.PI));
  const exponent = -Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2));
  return coefficient * Math.exp(exponent);
};

export const NormalDistributionVisualizer = ({ className = '' }: NormalDistributionVisualizerProps) => {
  const [mu, setMu] = useState(100);
  const [sigma, setSigma] = useState(15);

  // Генерируем данные для графика
  const chartData = useMemo(() => {
    const data = [];
    const range = 4 * sigma; // 4 стандартных отклонения в каждую сторону
    const step = range / 100;
    
    for (let x = mu - range; x <= mu + range; x += step) {
      data.push({
        x: Math.round(x * 10) / 10,
        y: normalPDF(x, mu, sigma),
        // Зоны для правила 68-95-99.7
        zone1: Math.abs(x - mu) <= sigma ? normalPDF(x, mu, sigma) : 0,
        zone2: Math.abs(x - mu) <= 2 * sigma && Math.abs(x - mu) > sigma ? normalPDF(x, mu, sigma) : 0,
        zone3: Math.abs(x - mu) <= 3 * sigma && Math.abs(x - mu) > 2 * sigma ? normalPDF(x, mu, sigma) : 0,
      });
    }
    return data;
  }, [mu, sigma]);

  // Границы зон
  const zones = useMemo(() => ({
    sigma1: { left: mu - sigma, right: mu + sigma },
    sigma2: { left: mu - 2 * sigma, right: mu + 2 * sigma },
    sigma3: { left: mu - 3 * sigma, right: mu + 3 * sigma },
  }), [mu, sigma]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Интерактивная визуализация</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Слайдеры */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Среднее (μ)</label>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{mu}</span>
            </div>
            <Slider
              value={[mu]}
              onValueChange={(value) => setMu(value[0])}
              min={50}
              max={150}
              step={1}
              className="w-full"
              ariaLabel="Среднее μ"
              ariaValueTextFormatter={(v) => `μ = ${v}`}
            />
            <p className="text-xs text-muted-foreground">
              Центр распределения. Например, средний IQ = 100.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Стандартное отклонение (σ)</label>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{sigma}</span>
            </div>
            <Slider
              value={[sigma]}
              onValueChange={(value) => setSigma(value[0])}
              min={5}
              max={30}
              step={1}
              className="w-full"
              ariaLabel="Стандартное отклонение σ"
              ariaValueTextFormatter={(v) => `σ = ${v}`}
            />
            <p className="text-xs text-muted-foreground">
              Ширина распределения. Чем больше σ, тем шире кривая.
            </p>
          </div>
        </div>

        {/* График — min 280px на мобильных, 420px на md+ */}
        <figure
          className="w-full min-h-[280px] md:min-h-[420px] h-[280px] md:h-[420px]"
          role="img"
          aria-label={`Нормальное распределение, M=${mu}, SD=${sigma}. Зоны 68%, 95% и 99.7% выделены цветом.`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 16, right: 24, left: 48, bottom: 32 }}>
              <defs>
                <linearGradient id="zone1Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="zone2Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--info))" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="hsl(var(--info))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="zone3Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="x" 
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => Math.round(value).toString()}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const x = payload[0].payload.x;
                    const zScore = ((x - mu) / sigma).toFixed(2);
                    return (
                      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                        <p className="text-sm font-medium">X = {x.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">z = {zScore}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Зоны 68-95-99.7 */}
              <Area 
                type="monotone" 
                dataKey="zone3" 
                stroke="none" 
                fill="url(#zone3Gradient)" 
                isAnimationActive={false}
              />
              <Area 
                type="monotone" 
                dataKey="zone2" 
                stroke="none" 
                fill="url(#zone2Gradient)" 
                isAnimationActive={false}
              />
              <Area 
                type="monotone" 
                dataKey="zone1" 
                stroke="none" 
                fill="url(#zone1Gradient)" 
                isAnimationActive={false}
              />
              {/* Основная кривая */}
              <Area 
                type="monotone" 
                dataKey="y" 
                stroke="hsl(var(--foreground))" 
                strokeWidth={2}
                fill="none"
                isAnimationActive={false}
              />
              {/* Линии границ */}
              <ReferenceLine x={mu} stroke="hsl(var(--foreground))" strokeDasharray="5 5" strokeWidth={1.5} />
              <ReferenceLine x={zones.sigma1.left} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
              <ReferenceLine x={zones.sigma1.right} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
          <figcaption className="sr-live" aria-live="polite">
            Нормальное распределение со средним M={mu}, SD={sigma}.
            На графике выделены три зоны: ±1σ от {Math.round(zones.sigma1.left)} до {Math.round(zones.sigma1.right)} (≈68% наблюдений),
            ±2σ от {Math.round(zones.sigma2.left)} до {Math.round(zones.sigma2.right)} (≈95% наблюдений),
            ±3σ от {Math.round(zones.sigma3.left)} до {Math.round(zones.sigma3.right)} (≈99.7% наблюдений).
          </figcaption>
        </figure>

        {/* Легенда */}
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/60" />
            <span>±1σ (68%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-info/50" />
            <span>±2σ (95%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success/40" />
            <span>±3σ (99.7%)</span>
          </div>
        </div>

        {/* Текущие значения */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="text-center mb-3">
            <MathFormula formula={`X \\sim N(${mu}, ${sigma}^2)`} />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-muted-foreground mb-1">68% данных</p>
              <p className="font-mono font-medium">
                {Math.round(zones.sigma1.left)} — {Math.round(zones.sigma1.right)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">95% данных</p>
              <p className="font-mono font-medium">
                {Math.round(zones.sigma2.left)} — {Math.round(zones.sigma2.right)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">99.7% данных</p>
              <p className="font-mono font-medium">
                {Math.round(zones.sigma3.left)} — {Math.round(zones.sigma3.right)}
              </p>
            </div>
          </div>
        </div>

        {/* Пример интерпретации */}
        <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
          <h5 className="font-semibold mb-2 text-sm">Пример интерпретации</h5>
          <p className="text-sm text-muted-foreground">
            При μ = {mu} и σ = {sigma}: если человек имеет показатель {mu + sigma}, 
            его z-оценка = +1.0 (выше среднего на 1 стандартное отклонение). 
            Это лучше, чем примерно 84% выборки.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
