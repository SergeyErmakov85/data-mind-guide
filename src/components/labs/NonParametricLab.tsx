import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MathFormula } from '@/components/MathFormula';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { mean, standardDeviation, generateSample } from '@/lib/statistics';
import { RotateCcw, Play, ArrowLeftRight } from 'lucide-react';

type TestType = 'mann-whitney' | 'wilcoxon' | 'spearman';

const rankData = (values: number[]): number[] => {
  const sorted = values.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const ranks = new Array(values.length);
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j < sorted.length - 1 && sorted[j + 1].v === sorted[j].v) j++;
    const avgRank = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) ranks[sorted[k].i] = avgRank;
    i = j + 1;
  }
  return ranks;
};

export const NonParametricLab = () => {
  const [testType, setTestType] = useState<TestType>('mann-whitney');
  const [n1, setN1] = useState(20);
  const [n2, setN2] = useState(20);
  const [skewness, setSkewness] = useState(0);
  const [effectSize, setEffectSize] = useState(0.5);
  const [data, setData] = useState<{ group1: number[]; group2: number[] } | null>(null);

  const generateData = () => {
    const dist = skewness > 0.5 ? 'exponential' : 'normal';
    const g1 = generateSample(dist, n1);
    const g2Raw = generateSample(dist, n2);
    const m2 = mean(g2Raw);
    const s2 = standardDeviation(g2Raw, false) || 1;
    const shift = effectSize * s2;
    const g2 = g2Raw.map(v => v + shift);
    setData({ group1: g1, group2: g2 });
  };

  const results = useMemo(() => {
    if (!data) return null;
    const { group1, group2 } = data;

    // Mann-Whitney U
    const combined = [
      ...group1.map(v => ({ v, group: 1 })),
      ...group2.map(v => ({ v, group: 2 })),
    ];
    const allValues = combined.map(c => c.v);
    const ranks = rankData(allValues);
    
    const R1 = ranks.filter((_, i) => combined[i].group === 1).reduce((s, r) => s + r, 0);
    const R2 = ranks.filter((_, i) => combined[i].group === 2).reduce((s, r) => s + r, 0);
    
    const U1 = n1 * n2 + (n1 * (n1 + 1)) / 2 - R1;
    const U2 = n1 * n2 + (n2 * (n2 + 1)) / 2 - R2;
    const U = Math.min(U1, U2);

    // Normal approximation for U
    const mU = (n1 * n2) / 2;
    const sU = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
    const zU = sU > 0 ? (U - mU) / sU : 0;

    // Parametric comparison: independent t-test
    const m1 = mean(group1);
    const m2t = mean(group2);
    const s1 = standardDeviation(group1);
    const s2t = standardDeviation(group2);
    const sp = Math.sqrt(((n1 - 1) * s1 * s1 + (n2 - 1) * s2t * s2t) / (n1 + n2 - 2));
    const tStat = sp > 0 ? (m1 - m2t) / (sp * Math.sqrt(1 / n1 + 1 / n2)) : 0;

    // Spearman for paired data
    const pairN = Math.min(group1.length, group2.length);
    const r1 = rankData(group1.slice(0, pairN));
    const r2 = rankData(group2.slice(0, pairN));
    const dSquaredSum = r1.reduce((s, r, i) => s + Math.pow(r - r2[i], 2), 0);
    const rSpearman = 1 - (6 * dSquaredSum) / (pairN * (pairN * pairN - 1));

    // Pearson for comparison
    const xm = mean(group1.slice(0, pairN));
    const ym = mean(group2.slice(0, pairN));
    let num = 0, dx = 0, dy = 0;
    for (let i = 0; i < pairN; i++) {
      num += (group1[i] - xm) * (group2[i] - ym);
      dx += (group1[i] - xm) ** 2;
      dy += (group2[i] - ym) ** 2;
    }
    const rPearson = (dx > 0 && dy > 0) ? num / Math.sqrt(dx * dy) : 0;

    return { U, R1, R2, zU, tStat, m1, m2: m2t, s1, s2: s2t, rSpearman, rPearson, ranks, combined };
  }, [data, n1, n2]);

  // Chart: ranks comparison
  const rankChart = useMemo(() => {
    if (!results) return [];
    const g1Ranks = results.ranks.filter((_, i) => results.combined[i].group === 1).sort((a, b) => a - b);
    const g2Ranks = results.ranks.filter((_, i) => results.combined[i].group === 2).sort((a, b) => a - b);
    const maxLen = Math.max(g1Ranks.length, g2Ranks.length);
    return Array.from({ length: maxLen }, (_, i) => ({
      idx: i + 1,
      'Группа 1': g1Ranks[i] ?? null,
      'Группа 2': g2Ranks[i] ?? null,
    }));
  }, [results]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Параметры</CardTitle>
          <CardDescription>Сравнение параметрических и непараметрических тестов на данных с разной формой распределения</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Асимметрия распределения: {skewness < 0.5 ? 'Нормальное' : 'Правосторонняя (экспоненциальное)'}</label>
            <Slider min={0} max={1} step={0.1} value={[skewness]} onValueChange={([v]) => setSkewness(v)} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">n₁: {n1}</label>
              <Slider min={10} max={50} step={5} value={[n1]} onValueChange={([v]) => setN1(v)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">n₂: {n2}</label>
              <Slider min={10} max={50} step={5} value={[n2]} onValueChange={([v]) => setN2(v)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Размер эффекта (сдвиг): {effectSize.toFixed(1)} SD</label>
            <Slider min={0} max={2} step={0.1} value={[effectSize]} onValueChange={([v]) => setEffectSize(v)} />
          </div>

          <div className="flex gap-2">
            <Button onClick={generateData} className="gap-2"><Play className="w-4 h-4" /> Сгенерировать данные</Button>
            <Button onClick={() => setData(null)} variant="outline" className="gap-2"><RotateCcw className="w-4 h-4" /> Сбросить</Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <>
          {/* Rank visualization */}
          <Card>
            <CardHeader><CardTitle>Ранги наблюдений</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={rankChart} barGap={0}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="idx" label={{ value: 'Наблюдение', position: 'bottom' }} />
                  <YAxis label={{ value: 'Ранг', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Группа 1" fill="hsl(220, 60%, 50%)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Группа 2" fill="hsl(145, 60%, 45%)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5" />
                Параметрический vs Непараметрический
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg space-y-3">
                  <h4 className="font-semibold text-primary">Непараметрический: Манна-Уитни</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>U = {results.U.toFixed(1)}</p>
                    <p>R₁ = {results.R1.toFixed(1)}, R₂ = {results.R2.toFixed(1)}</p>
                    <p>z = {results.zU.toFixed(3)}</p>
                    <Badge variant={Math.abs(results.zU) > 1.96 ? 'default' : 'secondary'}>
                      {Math.abs(results.zU) > 1.96 ? 'Значим (p < 0.05)' : 'Не значим'}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 border border-border rounded-lg space-y-3">
                  <h4 className="font-semibold">Параметрический: t-тест</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>M₁ = {results.m1.toFixed(2)}, M₂ = {results.m2.toFixed(2)}</p>
                    <p>t = {results.tStat.toFixed(3)}</p>
                    <Badge variant={Math.abs(results.tStat) > 2 ? 'default' : 'secondary'}>
                      {Math.abs(results.tStat) > 2 ? 'Значим (p < 0.05)' : 'Не значим'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <h5 className="font-semibold mb-2">Корреляции</h5>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <p><strong>Пирсон (параметрический):</strong> r = {results.rPearson.toFixed(3)}</p>
                  <p><strong>Спирмен (ранговый):</strong> rₛ = {results.rSpearman.toFixed(3)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Theory */}
      <Card>
        <CardHeader><CardTitle>Когда использовать непараметрические тесты?</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4">Параметрический</th>
                  <th className="text-left py-2 pr-4">Непараметрический</th>
                  <th className="text-left py-2">Когда заменять</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">t-тест (независимый)</td>
                  <td className="py-2 pr-4">Манна-Уитни U</td>
                  <td className="py-2">Ненормальность, порядковые данные</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">t-тест (парный)</td>
                  <td className="py-2 pr-4">Вилкоксон</td>
                  <td className="py-2">Ненормальность разностей</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">ANOVA</td>
                  <td className="py-2 pr-4">Краскела-Уоллиса</td>
                  <td className="py-2">3+ группы, ненормальность</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Пирсон (r)</td>
                  <td className="py-2 pr-4">Спирмен (rₛ)</td>
                  <td className="py-2">Порядковые данные, выбросы</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="example-box">
            <p className="text-sm text-muted-foreground">
              <strong>Пример:</strong> Данные шкалы Лайкерта (1–5 баллов) — порядковые. 
              Используйте Манна-Уитни вместо t-теста для сравнения групп.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
