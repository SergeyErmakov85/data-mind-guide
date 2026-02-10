import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MathFormula } from '@/components/MathFormula';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RotateCcw } from 'lucide-react';

type TableSize = '2x2' | '2x3' | '3x3';

const TABLE_CONFIGS: Record<TableSize, { rows: number; cols: number }> = {
  '2x2': { rows: 2, cols: 2 },
  '2x3': { rows: 2, cols: 3 },
  '3x3': { rows: 3, cols: 3 },
};

const DEFAULT_DATA: Record<TableSize, number[][]> = {
  '2x2': [[30, 20], [10, 40]],
  '2x3': [[25, 15, 10], [15, 20, 15]],
  '3x3': [[20, 10, 5], [15, 25, 10], [5, 10, 20]],
};

const ROW_LABELS = ['Мужчины', 'Женщины', 'Другое'];
const COL_LABELS = ['КБТ', 'Психодинам.', 'Гуманист.'];

// Chi-square critical values for common alpha levels
const chiCritical: Record<number, Record<number, number>> = {
  1: { 0.05: 3.841, 0.01: 6.635 },
  2: { 0.05: 5.991, 0.01: 9.210 },
  3: { 0.05: 7.815, 0.01: 11.345 },
  4: { 0.05: 9.488, 0.01: 13.277 },
  5: { 0.05: 11.070, 0.01: 15.086 },
  6: { 0.05: 12.592, 0.01: 16.812 },
  8: { 0.05: 15.507, 0.01: 20.090 },
};

const approxPValue = (chi2: number, df: number): number => {
  // Wilson-Hilferty approximation
  if (df <= 0 || chi2 <= 0) return 1;
  const z = Math.pow(chi2 / df, 1 / 3) - (1 - 2 / (9 * df));
  const se = Math.sqrt(2 / (9 * df));
  const zScore = z / se;
  // Normal CDF approx
  const x = Math.abs(zScore);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x / 2);
  return 1 - 0.5 * (1 + (zScore >= 0 ? 1 : -1) * y);
};

const ChiSquareLab = () => {
  const [tableSize, setTableSize] = useState<TableSize>('2x2');
  const { rows, cols } = TABLE_CONFIGS[tableSize];
  const [observed, setObserved] = useState<number[][]>(DEFAULT_DATA[tableSize]);

  const changeSize = (size: TableSize) => {
    setTableSize(size);
    setObserved(DEFAULT_DATA[size]);
  };

  const updateCell = (r: number, c: number, val: string) => {
    const num = parseInt(val) || 0;
    const next = observed.map((row, ri) => row.map((cell, ci) => (ri === r && ci === c ? num : cell)));
    setObserved(next);
  };

  const stats = useMemo(() => {
    const rowTotals = observed.map(row => row.reduce((s, v) => s + v, 0));
    const colTotals = Array.from({ length: cols }, (_, c) => observed.reduce((s, row) => s + row[c], 0));
    const total = rowTotals.reduce((s, v) => s + v, 0);
    if (total === 0) return null;

    const expected = observed.map((row, r) => row.map((_, c) => (rowTotals[r] * colTotals[c]) / total));
    let chi2 = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (expected[r][c] > 0) {
          chi2 += Math.pow(observed[r][c] - expected[r][c], 2) / expected[r][c];
        }
      }
    }
    const df = (rows - 1) * (cols - 1);
    const pValue = approxPValue(chi2, df);
    const cramersV = Math.sqrt(chi2 / (total * (Math.min(rows, cols) - 1)));
    const lowExpected = expected.some(row => row.some(v => v < 5));

    return { expected, rowTotals, colTotals, total, chi2, df, pValue, cramersV, lowExpected };
  }, [observed, rows, cols]);

  const chartData = useMemo(() => {
    if (!stats) return [];
    const data: { label: string; observed: number; expected: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        data.push({
          label: `${ROW_LABELS[r]}×${COL_LABELS[c]}`,
          observed: observed[r][c],
          expected: parseFloat(stats.expected[r][c].toFixed(1)),
        });
      }
    }
    return data;
  }, [stats, observed, rows, cols]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>Тест χ² независимости</CardTitle>
              <CardDescription>Проверка связи между двумя категориальными переменными</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={tableSize} onValueChange={(v) => changeSize(v as TableSize)}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2x2">2 × 2</SelectItem>
                  <SelectItem value="2x3">2 × 3</SelectItem>
                  <SelectItem value="3x3">3 × 3</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => setObserved(DEFAULT_DATA[tableSize])}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <MathFormula formula={`\\chi^2 = \\sum \\frac{(O_i - E_i)^2}{E_i}`} display />

          {/* Observed table */}
          <div>
            <h4 className="font-medium mb-2">Наблюдаемые частоты</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="border border-border p-2 bg-muted/30"></th>
                    {Array.from({ length: cols }, (_, c) => (
                      <th key={c} className="border border-border p-2 bg-muted/30 text-center">{COL_LABELS[c]}</th>
                    ))}
                    <th className="border border-border p-2 bg-muted/30 text-center">Σ</th>
                  </tr>
                </thead>
                <tbody>
                  {observed.map((row, r) => (
                    <tr key={r}>
                      <td className="border border-border p-2 bg-muted/30 font-medium">{ROW_LABELS[r]}</td>
                      {row.map((cell, c) => (
                        <td key={c} className="border border-border p-1">
                          <Input type="number" min={0} value={cell} onChange={(e) => updateCell(r, c, e.target.value)} className="text-center h-9" />
                        </td>
                      ))}
                      <td className="border border-border p-2 text-center font-medium">{stats?.rowTotals[r] ?? 0}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="border border-border p-2 bg-muted/30 font-medium">Σ</td>
                    {Array.from({ length: cols }, (_, c) => (
                      <td key={c} className="border border-border p-2 text-center font-medium">{stats?.colTotals[c] ?? 0}</td>
                    ))}
                    <td className="border border-border p-2 text-center font-bold">{stats?.total ?? 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Expected table */}
          {stats && (
            <div>
              <h4 className="font-medium mb-2">Ожидаемые частоты</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-border p-2 bg-muted/30"></th>
                      {Array.from({ length: cols }, (_, c) => (
                        <th key={c} className="border border-border p-2 bg-muted/30 text-center">{COL_LABELS[c]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.expected.map((row, r) => (
                      <tr key={r}>
                        <td className="border border-border p-2 bg-muted/30 font-medium">{ROW_LABELS[r]}</td>
                        {row.map((cell, c) => (
                          <td key={c} className={`border border-border p-2 text-center ${cell < 5 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                            {cell.toFixed(1)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {stats.lowExpected && (
                <p className="text-sm text-destructive mt-2">⚠ Некоторые ожидаемые частоты &lt; 5. Рассмотрите точный тест Фишера.</p>
              )}
            </div>
          )}

          {/* Results */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-center">
                <div className="text-xs text-muted-foreground">χ²</div>
                <div className="text-xl font-bold">{stats.chi2.toFixed(3)}</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <div className="text-xs text-muted-foreground">df</div>
                <div className="text-xl font-bold">{stats.df}</div>
              </div>
              <div className={`p-3 rounded-lg text-center border ${stats.pValue < 0.05 ? 'bg-success/10 border-success/20' : 'bg-muted/30 border-border'}`}>
                <div className="text-xs text-muted-foreground">p-value</div>
                <div className="text-xl font-bold">{stats.pValue < 0.001 ? '< 0.001' : stats.pValue.toFixed(3)}</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <div className="text-xs text-muted-foreground">V Крамера</div>
                <div className="text-xl font-bold">{stats.cramersV.toFixed(3)}</div>
              </div>
            </div>
          )}

          {stats && (
            <div className={`p-4 rounded-lg border ${stats.pValue < 0.05 ? 'bg-success/10 border-success/20' : 'bg-muted/30 border-border'}`}>
              <p className="font-medium">
                {stats.pValue < 0.05
                  ? `Связь статистически значима: χ²(${stats.df}) = ${stats.chi2.toFixed(2)}, p = ${stats.pValue < 0.001 ? '< .001' : stats.pValue.toFixed(3)}, V = ${stats.cramersV.toFixed(2)}`
                  : `Связь не достигла статистической значимости: χ²(${stats.df}) = ${stats.chi2.toFixed(2)}, p = ${stats.pValue.toFixed(3)}`}
              </p>
            </div>
          )}

          {/* Chart */}
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 40, left: 0 }}>
                <XAxis dataKey="label" angle={-30} textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="observed" fill="hsl(var(--primary))" opacity={0.7} name="Наблюдаемые" />
                <Bar dataKey="expected" fill="hsl(var(--muted-foreground))" opacity={0.5} name="Ожидаемые" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="example-box">
            <p className="text-sm text-muted-foreground">
              <strong>Пример:</strong> Исследователь проверяет, зависит ли предпочтение типа терапии (КБТ, психодинамическая, гуманистическая) от пола пациента.
              Введите свои данные в таблицу сопряжённости выше.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChiSquareLab;
