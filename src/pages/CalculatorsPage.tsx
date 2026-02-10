import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MathFormula } from '@/components/MathFormula';
import { Calculator } from 'lucide-react';

/* ─── Effect Size Calculator ─── */
const EffectSizeCalc = () => {
  const [m1, setM1] = useState('15');
  const [m2, setM2] = useState('12');
  const [sd, setSd] = useState('4');

  const d = sd && parseFloat(sd) !== 0 ? (parseFloat(m1) - parseFloat(m2)) / parseFloat(sd) : null;
  const label = d !== null ? (Math.abs(d) < 0.2 ? 'незначительный' : Math.abs(d) < 0.5 ? 'малый' : Math.abs(d) < 0.8 ? 'средний' : 'большой') : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle>d Коэна</CardTitle>
        <CardDescription>Размер эффекта для сравнения двух групп</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <MathFormula formula="d = \frac{M_1 - M_2}{SD_{pooled}}" display />
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-sm font-medium">M₁</label><Input type="number" value={m1} onChange={e => setM1(e.target.value)} /></div>
          <div><label className="text-sm font-medium">M₂</label><Input type="number" value={m2} onChange={e => setM2(e.target.value)} /></div>
          <div><label className="text-sm font-medium">SD</label><Input type="number" value={sd} onChange={e => setSd(e.target.value)} /></div>
        </div>
        {d !== null && !isNaN(d) && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
            <div><span className="text-sm text-muted-foreground">d Коэна = </span><span className="text-2xl font-bold">{d.toFixed(3)}</span></div>
            <Badge variant="secondary">{label}</Badge>
          </div>
        )}
        <div className="grid grid-cols-4 gap-2 text-xs text-center text-muted-foreground">
          <div className="p-2 bg-muted/30 rounded">|d| &lt; 0.2<br/>незначит.</div>
          <div className="p-2 bg-info/10 rounded">0.2 – 0.5<br/>малый</div>
          <div className="p-2 bg-warning/10 rounded">0.5 – 0.8<br/>средний</div>
          <div className="p-2 bg-success/10 rounded">&gt; 0.8<br/>большой</div>
        </div>
      </CardContent>
    </Card>
  );
};

/* ─── Confidence Interval Calculator ─── */
const CICalc = () => {
  const [mean, setMean] = useState('45');
  const [sdVal, setSdVal] = useState('8');
  const [nVal, setNVal] = useState('30');
  const [conf, setConf] = useState('95');

  const n = parseFloat(nVal);
  const z = conf === '90' ? 1.645 : conf === '99' ? 2.576 : 1.96;
  const se = parseFloat(sdVal) / Math.sqrt(n);
  const margin = z * se;
  const m = parseFloat(mean);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Доверительный интервал для среднего</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MathFormula formula="CI = \bar{x} \pm z \cdot \frac{s}{\sqrt{n}}" display />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><label className="text-sm font-medium">Среднее</label><Input type="number" value={mean} onChange={e => setMean(e.target.value)} /></div>
          <div><label className="text-sm font-medium">SD</label><Input type="number" value={sdVal} onChange={e => setSdVal(e.target.value)} /></div>
          <div><label className="text-sm font-medium">n</label><Input type="number" value={nVal} onChange={e => setNVal(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Уровень (%)</label><Input type="number" value={conf} onChange={e => setConf(e.target.value)} /></div>
        </div>
        {!isNaN(m) && n > 0 && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">{conf}% доверительный интервал</p>
            <p className="text-2xl font-bold">[{(m - margin).toFixed(2)}, {(m + margin).toFixed(2)}]</p>
            <p className="text-sm text-muted-foreground mt-1">Предел ошибки: ±{margin.toFixed(2)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/* ─── Correlation Calculator ─── */
const CorrelationCalc = () => {
  const [xVals, setXVals] = useState('2, 4, 6, 8, 10');
  const [yVals, setYVals] = useState('3, 5, 7, 6, 9');

  const calc = () => {
    const x = xVals.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    const y = yVals.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    const n = Math.min(x.length, y.length);
    if (n < 3) return null;
    const mx = x.slice(0, n).reduce((s, v) => s + v, 0) / n;
    const my = y.slice(0, n).reduce((s, v) => s + v, 0) / n;
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i++) {
      sxy += (x[i] - mx) * (y[i] - my);
      sxx += (x[i] - mx) ** 2;
      syy += (y[i] - my) ** 2;
    }
    const r = sxy / Math.sqrt(sxx * syy);
    const r2 = r * r;
    return { r, r2, n };
  };

  const result = calc();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Калькулятор корреляции Пирсона</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div><label className="text-sm font-medium">Значения X (через запятую)</label><Input value={xVals} onChange={e => setXVals(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Значения Y (через запятую)</label><Input value={yVals} onChange={e => setYVals(e.target.value)} /></div>
        </div>
        {result && !isNaN(result.r) && (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-center">
              <div className="text-xs text-muted-foreground">r</div>
              <div className="text-xl font-bold">{result.r.toFixed(3)}</div>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg text-center">
              <div className="text-xs text-muted-foreground">R²</div>
              <div className="text-xl font-bold">{result.r2.toFixed(3)}</div>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg text-center">
              <div className="text-xs text-muted-foreground">n</div>
              <div className="text-xl font-bold">{result.n}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/* ─── t-test Calculator ─── */
const TTestCalc = () => {
  const [g1, setG1] = useState('12, 14, 16, 13, 15');
  const [g2, setG2] = useState('10, 11, 13, 12, 9');

  const calc = () => {
    const a = g1.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    const b = g2.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    if (a.length < 2 || b.length < 2) return null;
    const ma = a.reduce((s, v) => s + v, 0) / a.length;
    const mb = b.reduce((s, v) => s + v, 0) / b.length;
    const va = a.reduce((s, v) => s + (v - ma) ** 2, 0) / (a.length - 1);
    const vb = b.reduce((s, v) => s + (v - mb) ** 2, 0) / (b.length - 1);
    const sp2 = ((a.length - 1) * va + (b.length - 1) * vb) / (a.length + b.length - 2);
    const se = Math.sqrt(sp2 * (1 / a.length + 1 / b.length));
    const t = (ma - mb) / se;
    const df = a.length + b.length - 2;
    const d = (ma - mb) / Math.sqrt(sp2);
    return { t, df, d, ma, mb };
  };

  const result = calc();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Калькулятор t-теста (независимые выборки)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div><label className="text-sm font-medium">Группа 1 (через запятую)</label><Input value={g1} onChange={e => setG1(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Группа 2 (через запятую)</label><Input value={g2} onChange={e => setG2(e.target.value)} /></div>
        </div>
        {result && !isNaN(result.t) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-center">
              <div className="text-xs text-muted-foreground">t</div>
              <div className="text-xl font-bold">{result.t.toFixed(3)}</div>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg text-center">
              <div className="text-xs text-muted-foreground">df</div>
              <div className="text-xl font-bold">{result.df}</div>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg text-center">
              <div className="text-xs text-muted-foreground">d Коэна</div>
              <div className="text-xl font-bold">{result.d.toFixed(3)}</div>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg text-center">
              <div className="text-xs text-muted-foreground">M₁ / M₂</div>
              <div className="text-lg font-bold">{result.ma.toFixed(1)} / {result.mb.toFixed(1)}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/* ─── Main Page ─── */
const CalculatorsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Calculator className="w-4 h-4" />
              Инструменты
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Статистические калькуляторы</h1>
            <p className="text-muted-foreground text-lg">Быстрые расчёты для психологических исследований</p>
          </div>

          <Tabs defaultValue="effectsize" className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
              <TabsTrigger value="effectsize">Размер эффекта</TabsTrigger>
              <TabsTrigger value="ci">Доверит. интервал</TabsTrigger>
              <TabsTrigger value="correlation">Корреляция</TabsTrigger>
              <TabsTrigger value="ttest">t-тест</TabsTrigger>
            </TabsList>
            <TabsContent value="effectsize"><EffectSizeCalc /></TabsContent>
            <TabsContent value="ci"><CICalc /></TabsContent>
            <TabsContent value="correlation"><CorrelationCalc /></TabsContent>
            <TabsContent value="ttest"><TTestCalc /></TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default CalculatorsPage;
