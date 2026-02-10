import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MathFormula } from '@/components/MathFormula';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart, ReferenceLine } from 'recharts';

const factorial = (n: number): number => {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
};

const binomCoeff = (n: number, k: number): number => {
  if (k > n || k < 0) return 0;
  if (k === 0 || k === n) return 1;
  let r = 1;
  for (let i = 0; i < k; i++) {
    r = r * (n - i) / (i + 1);
  }
  return r;
};

const binomPMF = (k: number, n: number, p: number): number => {
  return binomCoeff(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
};

const normalPDF = (x: number, mu: number, sigma: number): number => {
  if (sigma <= 0) return 0;
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
};

const BinomialLab = () => {
  const [n, setN] = useState(20);
  const [p, setP] = useState(0.5);
  const [successes, setSuccesses] = useState('');
  const [calcResult, setCalcResult] = useState<{ prob: number; cumProb: number } | null>(null);

  const mu = n * p;
  const sigma = Math.sqrt(n * p * (1 - p));
  const normalApproxValid = n * p >= 5 && n * (1 - p) >= 5;

  const chartData = useMemo(() => {
    return Array.from({ length: n + 1 }, (_, k) => ({
      k,
      binomial: binomPMF(k, n, p),
      normal: normalPDF(k, mu, sigma),
    }));
  }, [n, p, mu, sigma]);

  const calculate = () => {
    const k = parseInt(successes);
    if (isNaN(k) || k < 0 || k > n) return;
    const prob = binomPMF(k, n, p);
    let cumProb = 0;
    for (let i = 0; i <= k; i++) cumProb += binomPMF(i, n, p);
    setCalcResult({ prob, cumProb });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Биномиальное распределение</CardTitle>
          <CardDescription>
            Моделирует количество «успехов» в серии независимых испытаний с двумя исходами
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Число испытаний (n): {n}</label>
                <Slider min={1} max={50} step={1} value={[n]} onValueChange={([v]) => setN(v)} className="mt-2" />
              </div>
              <div>
                <label className="text-sm font-medium">Вероятность успеха (p): {p.toFixed(2)}</label>
                <Slider min={0.01} max={0.99} step={0.01} value={[p]} onValueChange={([v]) => setP(v)} className="mt-2" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground">Среднее (μ = np)</div>
                  <div className="text-lg font-bold">{mu.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground">SD (σ = √npq)</div>
                  <div className="text-lg font-bold">{sigma.toFixed(2)}</div>
                </div>
              </div>
              <Badge variant={normalApproxValid ? 'default' : 'destructive'} className="w-full justify-center">
                Нормальное приближение: {normalApproxValid ? 'допустимо (np ≥ 5 и nq ≥ 5)' : 'недопустимо'}
              </Badge>
            </div>
          </div>

          <MathFormula formula={`P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}`} display />

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <XAxis dataKey="k" label={{ value: 'k (число успехов)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'P(X = k)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(v: number) => v.toFixed(4)} />
                <Bar dataKey="binomial" fill="hsl(var(--primary))" opacity={0.7} name="Биномиальное" />
                {normalApproxValid && (
                  <Line dataKey="normal" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="Нормальное приближение" />
                )}
                <ReferenceLine x={mu} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ value: 'μ', position: 'top' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Калькулятор</CardTitle>
          <CardDescription>Рассчитайте вероятность для конкретного числа успехов</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Число успехов (k):</label>
              <Input
                type="number"
                min={0}
                max={n}
                value={successes}
                onChange={(e) => setSuccesses(e.target.value)}
                placeholder={`0–${n}`}
              />
            </div>
            <Button onClick={calculate}>Рассчитать</Button>
          </div>
          {calcResult && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="text-sm text-muted-foreground">P(X = {successes})</div>
                <div className="text-xl font-bold">{calcResult.prob.toFixed(4)}</div>
              </div>
              <div className="p-4 bg-info/5 border border-info/20 rounded-lg">
                <div className="text-sm text-muted-foreground">P(X ≤ {successes})</div>
                <div className="text-xl font-bold">{calcResult.cumProb.toFixed(4)}</div>
              </div>
            </div>
          )}
          <div className="example-box">
            <p className="text-sm text-muted-foreground">
              <strong>Пример из психологии:</strong> Из 20 пациентов, прошедших терапию, у 15 наблюдается улучшение.
              Если базовая вероятность улучшения без терапии 50%, насколько необычен такой результат?
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BinomialLab;
