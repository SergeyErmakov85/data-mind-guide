import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { MathFormula } from '@/components/MathFormula';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ErrorBar } from 'recharts';
import { mean, standardDeviation, generateSample } from '@/lib/statistics';
import { RotateCcw, Play } from 'lucide-react';

interface GroupConfig {
  name: string;
  mean: number;
  sd: number;
  color: string;
}

const COLORS = [
  'hsl(220, 60%, 50%)',
  'hsl(145, 60%, 45%)',
  'hsl(38, 80%, 50%)',
  'hsl(0, 65%, 50%)',
  'hsl(280, 50%, 55%)',
];

const defaultGroups: GroupConfig[] = [
  { name: 'КБТ', mean: 12, sd: 4, color: COLORS[0] },
  { name: 'Психодинамическая', mean: 15, sd: 4, color: COLORS[1] },
  { name: 'Контроль', mean: 18, sd: 4, color: COLORS[2] },
];

export const ANOVALab = () => {
  const [groups, setGroups] = useState<GroupConfig[]>(defaultGroups);
  const [sampleSize, setSampleSize] = useState(25);
  const [data, setData] = useState<number[][] | null>(null);

  const updateGroup = (idx: number, field: 'mean' | 'sd', value: number) => {
    setGroups(prev => prev.map((g, i) => i === idx ? { ...g, [field]: value } : g));
  };

  const addGroup = () => {
    if (groups.length >= 5) return;
    setGroups(prev => [...prev, { name: `Группа ${prev.length + 1}`, mean: 15, sd: 4, color: COLORS[prev.length] }]);
  };

  const removeGroup = () => {
    if (groups.length <= 2) return;
    setGroups(prev => prev.slice(0, -1));
    setData(null);
  };

  const runExperiment = () => {
    const samples = groups.map(g => {
      const raw = generateSample('normal', sampleSize);
      const m = mean(raw);
      const s = standardDeviation(raw, false) || 1;
      return raw.map(v => g.mean + ((v - m) / s) * g.sd);
    });
    setData(samples);
  };

  const results = useMemo(() => {
    if (!data) return null;
    const k = data.length;
    const allValues = data.flat();
    const N = allValues.length;
    const grandMean = mean(allValues);

    const groupMeans = data.map(g => mean(g));
    const groupSDs = data.map(g => standardDeviation(g));

    let SSB = 0;
    data.forEach((g, i) => { SSB += g.length * Math.pow(groupMeans[i] - grandMean, 2); });

    let SSW = 0;
    data.forEach((g, i) => { g.forEach(v => { SSW += Math.pow(v - groupMeans[i], 2); }); });

    const SST = SSB + SSW;
    const dfB = k - 1;
    const dfW = N - k;
    const MSB = SSB / dfB;
    const MSW = SSW / dfW;
    const F = MSB / MSW;
    const etaSquared = SSB / SST;

    // Approximate p-value from F-distribution using normal approximation
    // For display purposes only
    const pValue = F > 4 ? (F > 8 ? 0.001 : 0.01) : (F > 2.5 ? 0.05 : 0.2);

    return { groupMeans, groupSDs, SSB, SSW, SST, dfB, dfW, MSB, MSW, F, etaSquared, pValue };
  }, [data]);

  const chartData = results ? groups.map((g, i) => ({
    name: g.name,
    mean: parseFloat(results.groupMeans[i].toFixed(2)),
    sd: parseFloat(results.groupSDs[i].toFixed(2)),
    color: g.color,
  })) : null;

  const reset = () => { setData(null); setGroups(defaultGroups); setSampleSize(25); };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Параметры эксперимента</CardTitle>
          <CardDescription>Сравнение эффективности методов терапии депрессии (баллы по шкале BDI после лечения)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Размер каждой группы: {sampleSize}</label>
            <Slider min={10} max={100} step={5} value={[sampleSize]} onValueChange={([v]) => setSampleSize(v)} />
          </div>

          <div className="space-y-4">
            {groups.map((g, i) => (
              <div key={i} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ background: g.color }} />
                  <span className="font-medium">{g.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Среднее (μ): {g.mean}</label>
                    <Slider min={5} max={30} step={0.5} value={[g.mean]} onValueChange={([v]) => updateGroup(i, 'mean', v)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">SD (σ): {g.sd}</label>
                    <Slider min={1} max={10} step={0.5} value={[g.sd]} onValueChange={([v]) => updateGroup(i, 'sd', v)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={addGroup} variant="outline" size="sm" disabled={groups.length >= 5}>+ Группа</Button>
            <Button onClick={removeGroup} variant="outline" size="sm" disabled={groups.length <= 2}>− Группа</Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={runExperiment} className="gap-2"><Play className="w-4 h-4" /> Запустить эксперимент</Button>
            <Button onClick={reset} variant="outline" className="gap-2"><RotateCcw className="w-4 h-4" /> Сбросить</Button>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      {chartData && (
        <Card>
          <CardHeader><CardTitle>Средние по группам (±1 SD)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="mean" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                  <ErrorBar dataKey="sd" width={4} strokeWidth={2} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* ANOVA Table */}
      {results && (
        <Card>
          <CardHeader><CardTitle>Таблица ANOVA</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4">Источник</th>
                    <th className="text-right py-2 pr-4">SS</th>
                    <th className="text-right py-2 pr-4">df</th>
                    <th className="text-right py-2 pr-4">MS</th>
                    <th className="text-right py-2">F</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">Между группами</td>
                    <td className="text-right py-2 pr-4">{results.SSB.toFixed(2)}</td>
                    <td className="text-right py-2 pr-4">{results.dfB}</td>
                    <td className="text-right py-2 pr-4">{results.MSB.toFixed(2)}</td>
                    <td className="text-right py-2 font-semibold">{results.F.toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">Внутри групп</td>
                    <td className="text-right py-2 pr-4">{results.SSW.toFixed(2)}</td>
                    <td className="text-right py-2 pr-4">{results.dfW}</td>
                    <td className="text-right py-2 pr-4">{results.MSW.toFixed(2)}</td>
                    <td className="text-right py-2">—</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Общее</td>
                    <td className="text-right py-2 pr-4">{results.SST.toFixed(2)}</td>
                    <td className="text-right py-2 pr-4">{results.dfB + results.dfW}</td>
                    <td className="text-right py-2" colSpan={2}>—</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">F-статистика</p>
                <p className="text-2xl font-bold">{results.F.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">p-value (прибл.)</p>
                <Badge variant={results.pValue <= 0.05 ? 'default' : 'secondary'}>
                  {results.pValue <= 0.001 ? 'p < 0.001' : results.pValue <= 0.01 ? 'p < 0.01' : results.pValue <= 0.05 ? 'p < 0.05' : 'p > 0.05'}
                </Badge>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">η² (размер эффекта)</p>
                <p className="text-2xl font-bold">{results.etaSquared.toFixed(3)}</p>
                <p className="text-xs text-muted-foreground">
                  {results.etaSquared < 0.06 ? 'Малый' : results.etaSquared < 0.14 ? 'Средний' : 'Большой'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Theory */}
      <Card>
        <CardHeader><CardTitle>Теория</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            <strong>ANOVA</strong> (дисперсионный анализ) проверяет, различаются ли средние трёх и более групп. 
            Если F-статистика достаточно велика (p &lt; α), отвергаем H₀ о равенстве всех средних.
          </p>
          <MathFormula formula="H_0: \mu_1 = \mu_2 = \ldots = \mu_k" display />
          <div className="example-box">
            <p className="text-sm text-muted-foreground">
              <strong>Пример:</strong> Психолог сравнивает три метода терапии депрессии. Низкие баллы BDI = лучший результат. 
              Если F значим, используйте post-hoc тесты (Tukey), чтобы определить, какие пары групп различаются.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
