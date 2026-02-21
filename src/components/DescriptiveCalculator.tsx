import { useState, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { MathFormula } from '@/components/MathFormula';
import { Calculator, Trash2, Upload, FileSpreadsheet, X } from 'lucide-react';
import Papa from 'papaparse';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface Stats {
  sorted: number[];
  n: number;
  mean: number;
  median: number;
  modes: number[];
  variance: number;
  sd: number;
  se: number;
  min: number;
  max: number;
  range: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  kurtosis: number;
}

const quartile = (sorted: number[], q: number): number => {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
};

const compute = (data: number[]): Stats => {
  const n = data.length;
  const sorted = [...data].sort((a, b) => a - b);
  const mean = data.reduce((s, v) => s + v, 0) / n;
  const median =
    n % 2 === 1
      ? sorted[Math.floor(n / 2)]
      : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;

  // Mode
  const freq: Record<number, number> = {};
  data.forEach((v) => (freq[v] = (freq[v] || 0) + 1));
  const maxFreq = Math.max(...Object.values(freq));
  const modes =
    maxFreq === 1
      ? []
      : Object.entries(freq)
          .filter(([, c]) => c === maxFreq)
          .map(([v]) => Number(v));

  const sumSqDiff = data.reduce((s, v) => s + (v - mean) ** 2, 0);
  const variance = sumSqDiff / (n - 1);
  const sd = Math.sqrt(variance);
  const se = sd / Math.sqrt(n);

  const min = sorted[0];
  const max = sorted[n - 1];
  const range = max - min;
  const q1 = quartile(sorted, 0.25);
  const q3 = quartile(sorted, 0.75);
  const iqr = q3 - q1;

  // Skewness (adjusted Fisher-Pearson)
  let skewness = 0;
  if (n >= 3 && sd > 0) {
    const m3 = data.reduce((s, v) => s + ((v - mean) / sd) ** 3, 0);
    skewness = (n / ((n - 1) * (n - 2))) * m3;
  }

  // Excess kurtosis
  let kurtosis = 0;
  if (n >= 4 && sd > 0) {
    const m4 = data.reduce((s, v) => s + ((v - mean) / sd) ** 4, 0);
    kurtosis =
      (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3)) * m4 -
      (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));
  }

  return { sorted, n, mean, median, modes, variance, sd, se, min, max, range, q1, q3, iqr, skewness, kurtosis };
};

const fmt = (v: number) => Number(v.toFixed(4));

const StepCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="border-primary/20">
    <CardContent className="pt-4 space-y-2">
      <h4 className="font-medium text-primary text-sm">{title}</h4>
      {children}
    </CardContent>
  </Card>
);

export const DescriptiveCalculator = () => {
  const [input, setInput] = useState('12, 15, 14, 13, 18, 21, 14, 16, 14, 19');
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvColumns, setCsvColumns] = useState<{ name: string; values: number[] }[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta.fields && results.meta.fields.length > 0) {
          // Parse columns with numeric data
          const cols: { name: string; values: number[] }[] = [];
          results.meta.fields.forEach((field) => {
            const nums = (results.data as Record<string, unknown>[])
              .map((row) => parseFloat(String(row[field] ?? '').trim()))
              .filter((v) => !isNaN(v));
            if (nums.length >= 1) {
              cols.push({ name: field, values: nums });
            }
          });

          if (cols.length > 0) {
            setCsvColumns(cols);
            setSelectedColumn(null); // let user pick
          } else {
            // Fallback: extract all numbers
            const allNums: number[] = [];
            (results.data as Record<string, unknown>[]).forEach((row) => {
              Object.values(row).forEach((cell) => {
                const v = parseFloat(String(cell ?? '').trim());
                if (!isNaN(v)) allNums.push(v);
              });
            });
            if (allNums.length > 0) {
              setInput(allNums.join(', '));
            }
            setCsvColumns([]);
            setSelectedColumn(null);
          }
        } else {
          // No headers — extract all numbers
          const allNums: number[] = [];
          (results.data as unknown[][]).forEach((row) => {
            if (Array.isArray(row)) {
              row.forEach((cell) => {
                const v = parseFloat(String(cell).trim());
                if (!isNaN(v)) allNums.push(v);
              });
            }
          });
          if (allNums.length > 0) {
            setInput(allNums.join(', '));
          }
          setCsvColumns([]);
          setSelectedColumn(null);
        }
      },
    });
    e.target.value = '';
  };

  const handleSelectColumn = (colName: string) => {
    const col = csvColumns.find((c) => c.name === colName);
    if (col) {
      setInput(col.values.join(', '));
      setSelectedColumn(colName);
    }
  };

  const handleUseAllColumns = () => {
    const all = csvColumns.flatMap((c) => c.values);
    setInput(all.join(', '));
    setSelectedColumn('__all__');
  };

  const handleClearCsv = () => {
    setCsvColumns([]);
    setSelectedColumn(null);
    setCsvFileName(null);
  };

  const data = useMemo(() => {
    return input
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter((s) => s !== '')
      .map(Number)
      .filter((v) => !isNaN(v));
  }, [input]);

  const stats = useMemo(() => (data.length >= 3 ? compute(data) : null), [data]);

  // histogram
  const histData = useMemo(() => {
    if (!stats) return [];
    const bins = Math.max(3, Math.min(15, Math.ceil(Math.sqrt(stats.n))));
    const w = (stats.max - stats.min) / bins || 1;
    const arr = Array.from({ length: bins }, (_, i) => ({
      label: `${fmt(stats.min + i * w)}`,
      count: 0,
      from: stats.min + i * w,
      to: stats.min + (i + 1) * w,
    }));
    data.forEach((v) => {
      let idx = Math.floor((v - stats.min) / w);
      if (idx >= bins) idx = bins - 1;
      if (idx < 0) idx = 0;
      arr[idx].count++;
    });
    return arr;
  }, [stats, data]);

  return (
    <div className="space-y-6 text-sm leading-relaxed">
      <p>
        Введите числа через запятую, пробел или точку с запятой, либо загрузите CSV-файл. Минимум 3 значения.
        Приложение покажет все описательные статистики с <strong>пошаговым расчётом</strong>.
      </p>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Например: 12, 15, 14, 13, 18"
          className="font-mono text-xs"
        />
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleCsvUpload}
          className="hidden"
        />
        <Button variant="outline" size="icon" onClick={() => fileRef.current?.click()} title="Загрузить CSV">
          <Upload className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => { setInput(''); handleClearCsv(); }}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* CSV column selector */}
      {csvColumns.length > 0 && (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-accent-foreground" />
                <Label className="font-medium text-sm">
                  Столбцы из {csvFileName ?? 'CSV'}
                </Label>
                <Badge variant="outline" className="text-xs">{csvColumns.length} числовых</Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClearCsv}>
                <X className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedColumn === '__all__' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7"
                onClick={handleUseAllColumns}
              >
                Все значения ({csvColumns.reduce((s, c) => s + c.values.length, 0)})
              </Button>
              {csvColumns.map((col) => (
                <Button
                  key={col.name}
                  variant={selectedColumn === col.name ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleSelectColumn(col.name)}
                >
                  {col.name} <span className="text-muted-foreground ml-1">({col.values.length})</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.length > 0 && data.length < 3 && (
        <p className="text-destructive text-xs">Введите минимум 3 числа для расчёта.</p>
      )}

      <div className="flex flex-wrap gap-1">
        {data.map((v, i) => (
          <Badge key={i} variant="secondary" className="font-mono text-xs">
            {v}
          </Badge>
        ))}
        {data.length >= 3 && (
          <Badge variant="outline" className="text-xs">n = {data.length}</Badge>
        )}
      </div>

      {stats && (
        <div className="space-y-4">
          {/* Summary table */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-primary" />
                <h4 className="font-medium text-primary">Сводная таблица</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  ['Среднее', fmt(stats.mean)],
                  ['Медиана', fmt(stats.median)],
                  ['Мода', stats.modes.length ? stats.modes.join(', ') : '—'],
                  ['SD', fmt(stats.sd)],
                  ['Дисперсия', fmt(stats.variance)],
                  ['SE', fmt(stats.se)],
                  ['IQR', fmt(stats.iqr)],
                  ['Размах', fmt(stats.range)],
                  ['Min', stats.min],
                  ['Max', stats.max],
                  ['Skewness', fmt(stats.skewness)],
                  ['Kurtosis', fmt(stats.kurtosis)],
                ].map(([label, val]) => (
                  <div key={String(label)} className="p-2 bg-background rounded border">
                    <div className="text-muted-foreground">{label}</div>
                    <div className="font-mono font-medium">{val}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step-by-step */}
          <h4 className="font-medium text-base pt-2">Пошаговый расчёт</h4>

          {/* Mean */}
          <StepCard title="1. Среднее арифметическое (M)">
            <MathFormula
              formula={`M = \\frac{${data.join(' + ')}}{${stats.n}} = \\frac{${fmt(data.reduce((s, v) => s + v, 0))}}{${stats.n}} = ${fmt(stats.mean)}`}
              display
            />
          </StepCard>

          {/* Median */}
          <StepCard title="2. Медиана (Me)">
            <p className="text-xs text-muted-foreground">
              Упорядоченный ряд: {stats.sorted.join(', ')}
            </p>
            {stats.n % 2 === 1 ? (
              <MathFormula
                formula={`Me = x_{(${Math.ceil(stats.n / 2)})} = ${fmt(stats.median)}`}
                display
              />
            ) : (
              <MathFormula
                formula={`Me = \\frac{x_{(${stats.n / 2})} + x_{(${stats.n / 2 + 1})}}{2} = \\frac{${stats.sorted[stats.n / 2 - 1]} + ${stats.sorted[stats.n / 2]}}{2} = ${fmt(stats.median)}`}
                display
              />
            )}
          </StepCard>

          {/* Mode */}
          <StepCard title="3. Мода (Mo)">
            {stats.modes.length === 0 ? (
              <p className="text-xs text-muted-foreground">Все значения встречаются одинаково часто — моды нет.</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Наиболее часто встречающиеся значения: <strong>{stats.modes.join(', ')}</strong>
              </p>
            )}
          </StepCard>

          {/* Variance & SD */}
          <StepCard title="4. Дисперсия и стандартное отклонение">
            <p className="text-xs text-muted-foreground mb-1">
              Отклонения от среднего (x<sub>i</sub> − M) и их квадраты:
            </p>
            <div className="overflow-x-auto">
              <table className="text-xs font-mono w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-1">x<sub>i</sub></th>
                    <th className="text-left p-1">x<sub>i</sub> − M</th>
                    <th className="text-left p-1">(x<sub>i</sub> − M)²</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((v, i) => (
                    <tr key={i} className="border-b border-muted">
                      <td className="p-1">{v}</td>
                      <td className="p-1">{fmt(v - stats.mean)}</td>
                      <td className="p-1">{fmt((v - stats.mean) ** 2)}</td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td className="p-1">Σ</td>
                    <td className="p-1"></td>
                    <td className="p-1">{fmt(data.reduce((s, v) => s + (v - stats.mean) ** 2, 0))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <MathFormula
              formula={`s^2 = \\frac{${fmt(data.reduce((s, v) => s + (v - stats.mean) ** 2, 0))}}{${stats.n} - 1} = ${fmt(stats.variance)}`}
              display
            />
            <MathFormula formula={`SD = \\sqrt{${fmt(stats.variance)}} = ${fmt(stats.sd)}`} display />
          </StepCard>

          {/* SE */}
          <StepCard title="5. Стандартная ошибка среднего (SE)">
            <MathFormula
              formula={`SE = \\frac{SD}{\\sqrt{n}} = \\frac{${fmt(stats.sd)}}{\\sqrt{${stats.n}}} = ${fmt(stats.se)}`}
              display
            />
          </StepCard>

          {/* IQR */}
          <StepCard title="6. Квартили и IQR">
            <MathFormula formula={`Q_1 = ${fmt(stats.q1)}, \\quad Q_3 = ${fmt(stats.q3)}`} display />
            <MathFormula formula={`IQR = Q_3 - Q_1 = ${fmt(stats.q3)} - ${fmt(stats.q1)} = ${fmt(stats.iqr)}`} display />
            <p className="text-xs text-muted-foreground">
              Выбросы: значения за пределами [{fmt(stats.q1 - 1.5 * stats.iqr)}; {fmt(stats.q3 + 1.5 * stats.iqr)}]
            </p>
            {data.filter(
              (v) => v < stats.q1 - 1.5 * stats.iqr || v > stats.q3 + 1.5 * stats.iqr
            ).length > 0 && (
              <p className="text-xs text-destructive">
                Обнаружены выбросы:{' '}
                {data
                  .filter((v) => v < stats.q1 - 1.5 * stats.iqr || v > stats.q3 + 1.5 * stats.iqr)
                  .join(', ')}
              </p>
            )}
          </StepCard>

          {/* Skewness */}
          <StepCard title="7. Асимметрия (Skewness)">
            <MathFormula formula={`Sk = ${fmt(stats.skewness)}`} display />
            <p className="text-xs text-muted-foreground">
              {Math.abs(stats.skewness) < 0.5
                ? '≈ симметричное распределение'
                : stats.skewness > 0
                ? 'Правосторонняя асимметрия (хвост вправо)'
                : 'Левосторонняя асимметрия (хвост влево)'}
            </p>
          </StepCard>

          {/* Kurtosis */}
          <StepCard title="8. Эксцесс (Excess Kurtosis)">
            <MathFormula formula={`K = ${fmt(stats.kurtosis)}`} display />
            <p className="text-xs text-muted-foreground">
              {Math.abs(stats.kurtosis) < 0.5
                ? '≈ мезокуртичное (нормальное) распределение'
                : stats.kurtosis > 0
                ? 'Лептокуртичное — острый пик, тяжёлые хвосты'
                : 'Платикуртичное — плоское распределение'}
            </p>
          </StepCard>

          {/* Box Plot */}
          <StepCard title="📦 Ящик с усами (Box Plot)">
            <div className="px-2 pt-2 pb-6 space-y-1">
              {/* Labels row */}
              <div className="relative h-5 text-[10px] text-muted-foreground font-mono">
                {(() => {
                  const bMin = Math.max(stats.min, stats.q1 - 1.5 * stats.iqr);
                  const bMax = Math.min(stats.max, stats.q3 + 1.5 * stats.iqr);
                  const range = bMax - bMin || 1;
                  const pct = (v: number) => `${((v - bMin) / range) * 100}%`;
                  return (
                    <>
                      <span className="absolute -translate-x-1/2" style={{ left: pct(bMin) }}>{fmt(bMin)}</span>
                      <span className="absolute -translate-x-1/2" style={{ left: pct(stats.q1) }}>Q1: {fmt(stats.q1)}</span>
                      <span className="absolute -translate-x-1/2" style={{ left: pct(stats.median) }}>Me: {fmt(stats.median)}</span>
                      <span className="absolute -translate-x-1/2" style={{ left: pct(stats.q3) }}>Q3: {fmt(stats.q3)}</span>
                      <span className="absolute -translate-x-1/2" style={{ left: pct(bMax) }}>{fmt(bMax)}</span>
                    </>
                  );
                })()}
              </div>
              {/* Box plot visual */}
              <div className="relative h-10">
                {(() => {
                  const whiskerMin = Math.max(stats.min, stats.q1 - 1.5 * stats.iqr);
                  const whiskerMax = Math.min(stats.max, stats.q3 + 1.5 * stats.iqr);
                  const range = whiskerMax - whiskerMin || 1;
                  const pct = (v: number) => ((v - whiskerMin) / range) * 100;
                  const outliers = data.filter(v => v < whiskerMin || v > whiskerMax);
                  return (
                    <>
                      {/* Whisker line */}
                      <div
                        className="absolute top-1/2 h-0.5 bg-foreground/40 -translate-y-1/2"
                        style={{ left: `${pct(whiskerMin)}%`, width: `${pct(whiskerMax) - pct(whiskerMin)}%` }}
                      />
                      {/* Whisker caps */}
                      <div className="absolute top-1 bottom-1 w-0.5 bg-foreground/60" style={{ left: `${pct(whiskerMin)}%` }} />
                      <div className="absolute top-1 bottom-1 w-0.5 bg-foreground/60" style={{ left: `${pct(whiskerMax)}%` }} />
                      {/* IQR box */}
                      <div
                        className="absolute top-0 h-full rounded bg-primary/20 border-2 border-primary"
                        style={{ left: `${pct(stats.q1)}%`, width: `${pct(stats.q3) - pct(stats.q1)}%` }}
                      />
                      {/* Median line */}
                      <div
                        className="absolute top-0 h-full w-0.5 bg-primary"
                        style={{ left: `${pct(stats.median)}%` }}
                      />
                      {/* Mean marker */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-destructive border border-background"
                        style={{ left: `${pct(stats.mean)}%` }}
                        title={`Среднее: ${fmt(stats.mean)}`}
                      />
                      {/* Outliers */}
                      {outliers.map((v, i) => {
                        const pos = ((v - whiskerMin) / range) * 100;
                        const clampedPos = Math.max(-2, Math.min(102, pos));
                        return (
                          <div
                            key={i}
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full border-2 border-destructive bg-background"
                            style={{ left: `${clampedPos}%` }}
                            title={`Выброс: ${v}`}
                          />
                        );
                      })}
                    </>
                  );
                })()}
              </div>
              {/* Legend */}
              <div className="flex gap-4 text-[10px] text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-destructive" /> Среднее
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-0.5 bg-primary" /> Медиана
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-2 rounded border border-primary bg-primary/20" /> IQR
                </span>
                {data.some(v => v < stats.q1 - 1.5 * stats.iqr || v > stats.q3 + 1.5 * stats.iqr) && (
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full border-2 border-destructive" /> Выбросы
                  </span>
                )}
              </div>
            </div>
          </StepCard>

          {/* Histogram */}
          <StepCard title="📊 Гистограмма">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histData}>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val: number) => [val, 'Частота']}
                    labelFormatter={(l) => `Интервал от ${l}`}
                  />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                    {histData.map((_, i) => (
                      <Cell key={i} fill="hsl(var(--primary))" opacity={0.75} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </StepCard>
        </div>
      )}
    </div>
  );
};
