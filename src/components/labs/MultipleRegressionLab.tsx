import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Play, RotateCcw, Info, Plus, Minus } from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  ReferenceLine,
} from 'recharts';

interface Predictor {
  name: string;
  trueCoeff: number;
  color: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--destructive))',
  'hsl(142 76% 36%)',
  'hsl(38 92% 50%)',
];

const MultipleRegressionLab: React.FC = () => {
  const [predictors, setPredictors] = useState<Predictor[]>([
    { name: 'X₁ (Тревожность)', trueCoeff: 0.8, color: COLORS[0] },
    { name: 'X₂ (Стресс)', trueCoeff: -0.5, color: COLORS[1] },
  ]);
  const [intercept, setIntercept] = useState(3);
  const [sampleSize, setSampleSize] = useState(50);
  const [noiseLevel, setNoiseLevel] = useState(1.5);
  const [data, setData] = useState<Record<string, number>[]>([]);
  const [results, setResults] = useState<{
    coeffs: number[];
    interceptEst: number;
    rSquared: number;
    adjRSquared: number;
    fStat: number;
    pValue: number;
    residuals: number[];
    vif: number[];
  } | null>(null);

  const addPredictor = () => {
    if (predictors.length >= 4) return;
    const names = ['X₃ (Мотивация)', 'X₄ (Самооценка)'];
    const idx = predictors.length - 2;
    setPredictors([...predictors, {
      name: names[idx] || `X${predictors.length + 1}`,
      trueCoeff: Math.round((Math.random() * 2 - 1) * 10) / 10,
      color: COLORS[predictors.length],
    }]);
  };

  const removePredictor = () => {
    if (predictors.length <= 2) return;
    setPredictors(predictors.slice(0, -1));
  };

  const updateCoeff = (index: number, value: number) => {
    const updated = [...predictors];
    updated[index] = { ...updated[index], trueCoeff: value };
    setPredictors(updated);
  };

  // Simple OLS via normal equations for small k
  const solveOLS = (X: number[][], y: number[]) => {
    const n = y.length;
    const k = X[0].length;

    // X^T X
    const XtX: number[][] = Array.from({ length: k }, () => Array(k).fill(0));
    const Xty: number[] = Array(k).fill(0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < k; j++) {
        Xty[j] += X[i][j] * y[i];
        for (let l = 0; l < k; l++) {
          XtX[j][l] += X[i][j] * X[i][l];
        }
      }
    }

    // Gauss elimination
    const aug = XtX.map((row, i) => [...row, Xty[i]]);
    for (let col = 0; col < k; col++) {
      let maxRow = col;
      for (let row = col + 1; row < k; row++) {
        if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
      }
      [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
      if (Math.abs(aug[col][col]) < 1e-10) continue;
      const pivot = aug[col][col];
      for (let j = col; j <= k; j++) aug[col][j] /= pivot;
      for (let row = 0; row < k; row++) {
        if (row === col) continue;
        const factor = aug[row][col];
        for (let j = col; j <= k; j++) aug[row][j] -= factor * aug[col][j];
      }
    }
    return aug.map(row => row[k]);
  };

  const generateData = useCallback(() => {
    const p = predictors.length;
    const rows: Record<string, number>[] = [];
    const xMatrix: number[][] = [];
    const yVec: number[] = [];

    for (let i = 0; i < sampleSize; i++) {
      const row: Record<string, number> = {};
      const xRow = [1]; // intercept
      for (let j = 0; j < p; j++) {
        const val = Math.random() * 10;
        row[`x${j}`] = val;
        xRow.push(val);
      }
      // Box-Muller noise
      const u1 = Math.random();
      const u2 = Math.random();
      const noise = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * noiseLevel;

      let y = intercept;
      for (let j = 0; j < p; j++) y += predictors[j].trueCoeff * row[`x${j}`];
      y += noise;
      row.y = y;
      rows.push(row);
      xMatrix.push(xRow);
      yVec.push(y);
    }

    // Solve
    const beta = solveOLS(xMatrix, yVec);
    const interceptEst = beta[0];
    const coeffs = beta.slice(1);

    // Stats
    const meanY = yVec.reduce((s, v) => s + v, 0) / sampleSize;
    const residuals = yVec.map((y, i) => {
      let pred = beta[0];
      for (let j = 1; j <= p; j++) pred += beta[j] * xMatrix[i][j];
      return y - pred;
    });
    const ssRes = residuals.reduce((s, r) => s + r * r, 0);
    const ssTot = yVec.reduce((s, y) => s + (y - meanY) ** 2, 0);
    const rSquared = 1 - ssRes / ssTot;
    const adjRSquared = 1 - (1 - rSquared) * (sampleSize - 1) / (sampleSize - p - 1);
    const msReg = (ssTot - ssRes) / p;
    const msRes = ssRes / (sampleSize - p - 1);
    const fStat = msReg / msRes;

    // Approximate p-value for F
    const pValue = fStat > 10 ? 0.001 : fStat > 5 ? 0.01 : fStat > 3 ? 0.05 : 0.1;

    // VIF: regress each X on others
    const vif: number[] = [];
    for (let j = 0; j < p; j++) {
      const xj = rows.map(r => r[`x${j}`]);
      const others = rows.map(r => {
        const row = [1];
        for (let k = 0; k < p; k++) if (k !== j) row.push(r[`x${k}`]);
        return row;
      });
      const betaJ = solveOLS(others, xj);
      const meanXj = xj.reduce((s, v) => s + v, 0) / sampleSize;
      const ssTotJ = xj.reduce((s, v) => s + (v - meanXj) ** 2, 0);
      const ssResJ = xj.reduce((s, v, i) => {
        let pred = betaJ[0];
        for (let l = 1; l < betaJ.length; l++) pred += betaJ[l] * others[i][l];
        return s + (v - pred) ** 2;
      }, 0);
      const r2j = 1 - ssResJ / ssTotJ;
      vif.push(r2j >= 1 ? 999 : 1 / (1 - r2j));
    }

    setData(rows);
    setResults({ coeffs, interceptEst, rSquared, adjRSquared, fStat, pValue, residuals, vif });
  }, [predictors, intercept, sampleSize, noiseLevel]);

  const coeffComparisonData = useMemo(() => {
    if (!results) return [];
    return predictors.map((p, i) => ({
      name: p.name,
      true: p.trueCoeff,
      estimated: results.coeffs[i],
      fill: p.color,
    }));
  }, [results, predictors]);

  const residualData = useMemo(() => {
    if (!results || data.length === 0) return [];
    return data.map((row, i) => {
      let predicted = results.interceptEst;
      predictors.forEach((_, j) => { predicted += results.coeffs[j] * row[`x${j}`]; });
      return { predicted, residual: results.residuals[i] };
    });
  }, [results, data, predictors]);

  const reset = () => { setData([]); setResults(null); };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Параметры множественной регрессии
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Предикторы: {predictors.length}</span>
            <Button size="sm" variant="outline" onClick={addPredictor} disabled={predictors.length >= 4}>
              <Plus className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={removePredictor} disabled={predictors.length <= 2}>
              <Minus className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {predictors.map((p, i) => (
              <div key={i} className="space-y-2">
                <Label className="flex justify-between">
                  <span style={{ color: p.color }}>{p.name} (β{i + 1})</span>
                  <Badge variant="secondary">{p.trueCoeff.toFixed(1)}</Badge>
                </Label>
                <Slider value={[p.trueCoeff]} onValueChange={([v]) => updateCoeff(i, v)} min={-3} max={3} step={0.1} />
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="flex justify-between">
                <span>Интерсепт (β₀)</span>
                <Badge variant="secondary">{intercept.toFixed(1)}</Badge>
              </Label>
              <Slider value={[intercept]} onValueChange={([v]) => setIntercept(v)} min={-5} max={10} step={0.5} />
            </div>
            <div className="space-y-2">
              <Label className="flex justify-between">
                <span>Размер выборки</span>
                <Badge variant="secondary">{sampleSize}</Badge>
              </Label>
              <Slider value={[sampleSize]} onValueChange={([v]) => setSampleSize(v)} min={20} max={200} step={10} />
            </div>
            <div className="space-y-2">
              <Label className="flex justify-between">
                <span>Шум (σ)</span>
                <Badge variant="secondary">{noiseLevel.toFixed(1)}</Badge>
              </Label>
              <Slider value={[noiseLevel]} onValueChange={([v]) => setNoiseLevel(v)} min={0.5} max={5} step={0.5} />
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={generateData} className="gap-2"><Play className="w-4 h-4" />Сгенерировать</Button>
            <Button variant="outline" onClick={reset} className="gap-2"><RotateCcw className="w-4 h-4" />Сбросить</Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Tabs defaultValue="coefficients" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="coefficients">Коэффициенты</TabsTrigger>
            <TabsTrigger value="residuals">Остатки</TabsTrigger>
            <TabsTrigger value="diagnostics">Диагностика</TabsTrigger>
          </TabsList>

          <TabsContent value="coefficients">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Сравнение коэффициентов</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={coeffComparisonData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="name" type="category" width={140} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Bar dataKey="true" name="Истинный β" fill="hsl(var(--muted-foreground))" barSize={12} />
                      <Bar dataKey="estimated" name="Оценка β̂" barSize={12}>
                        {coeffComparisonData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Статистики модели</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{(results.rSquared * 100).toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">R²</div>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg text-center">
                      <div className="text-2xl font-bold">{(results.adjRSquared * 100).toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">R² adj</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">F-статистика</span>
                      <span className="font-mono">{results.fStat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">p-value</span>
                      <Badge variant={results.pValue < 0.05 ? 'default' : 'secondary'}>
                        {results.pValue < 0.001 ? '< 0.001' : `≈ ${results.pValue}`}
                      </Badge>
                    </div>
                    <hr className="border-border" />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">β̂₀ (интерсепт)</span>
                      <span className="font-mono">{results.interceptEst.toFixed(3)}</span>
                    </div>
                    {predictors.map((p, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-muted-foreground" style={{ color: p.color }}>β̂{i + 1}</span>
                        <span className="font-mono">{results.coeffs[i].toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="residuals">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Остатки vs Предсказанные</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="predicted" name="Предсказанное" stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="residual" name="Остаток" stroke="hsl(var(--muted-foreground))" />
                      <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="4 4" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Scatter data={residualData} fill="hsl(var(--primary))" fillOpacity={0.6} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Гистограмма остатков</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={(() => {
                      const res = results.residuals;
                      const min = Math.min(...res);
                      const max = Math.max(...res);
                      const bins = 12;
                      const w = (max - min) / bins || 1;
                      const hist = Array.from({ length: bins }, (_, i) => ({ bin: (min + (i + 0.5) * w).toFixed(1), count: 0 }));
                      res.forEach(r => { let idx = Math.floor((r - min) / w); if (idx >= bins) idx = bins - 1; if (idx < 0) idx = 0; hist[idx].count++; });
                      return hist;
                    })()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="bin" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Bar dataKey="count" fill="hsl(var(--primary))" fillOpacity={0.7} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="diagnostics">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>VIF (Variance Inflation Factor)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={predictors.map((p, i) => ({ name: p.name, vif: results.vif[i] }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <ReferenceLine y={5} stroke="hsl(var(--destructive))" strokeDasharray="4 4" label={{ value: 'VIF = 5', fill: 'hsl(var(--destructive))' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Bar dataKey="vif" name="VIF">
                        {predictors.map((p, i) => (
                          <Cell key={i} fill={results.vif[i] > 5 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-muted-foreground mt-3">
                    VIF &gt; 5 указывает на мультиколлинеарность. Предикторы генерируются независимо, 
                    поэтому VIF должен быть близок к 1.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Интерпретация</CardTitle></CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <h4 className="font-medium">Уравнение модели</h4>
                    <p className="font-mono">
                      ŷ = {results.interceptEst.toFixed(2)}
                      {predictors.map((p, i) => ` ${results.coeffs[i] >= 0 ? '+' : '−'} ${Math.abs(results.coeffs[i]).toFixed(2)}·${p.name.split(' ')[0]}`).join('')}
                    </p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium mb-2">R² vs R² adjusted</h4>
                    <p className="text-muted-foreground">
                      R² = {(results.rSquared * 100).toFixed(1)}% показывает долю объяснённой дисперсии.
                      R² adj = {(results.adjRSquared * 100).toFixed(1)}% корректирует за число предикторов — 
                      если разница велика, модель может быть переобучена.
                    </p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium mb-2">F-тест</h4>
                    <p className="text-muted-foreground">
                      F = {results.fStat.toFixed(2)}, p {results.pValue < 0.001 ? '< 0.001' : `≈ ${results.pValue}`}. 
                      {results.pValue < 0.05
                        ? ' Модель статистически значима — хотя бы один предиктор вносит вклад.'
                        : ' Модель не значима — предикторы не объясняют Y лучше, чем среднее.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {!results && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-lg">Настройте параметры и нажмите «Сгенерировать» для создания данных</p>
            <p className="text-sm mt-2">Множественная регрессия позволяет оценить влияние нескольких предикторов на зависимую переменную одновременно</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultipleRegressionLab;
