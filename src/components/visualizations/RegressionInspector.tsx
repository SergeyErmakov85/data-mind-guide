import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import {
  ComposedChart,
  ScatterChart,
  BarChart,
  Scatter,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Upload, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DATASETS } from '@/data/datasets';
import {
  fitOLS,
  confidenceBand,
  movingAverageSmooth,
  qqPoints,
  type RegressionResult,
} from '@/lib/regression';

interface Row {
  [key: string]: number | string;
}

const numericValue = (v: unknown): number | null => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const t = v.trim().replace(',', '.');
    if (t === '') return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const fmt = (v: number, d = 4) => (Number.isFinite(v) ? v.toFixed(d) : '—');
const pFmt = (p: number) => (p < 0.001 ? '< 0.001' : p.toFixed(4));

export const RegressionInspector: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [yVar, setYVar] = useState<string>('');
  const [xVar, setXVar] = useState<string>('');
  const [robust, setRobust] = useState(false);
  const [datasetId, setDatasetId] = useState<string>('');
  const [sourceLabel, setSourceLabel] = useState('');

  // Загрузка готового датасета
  const loadDataset = useCallback(async (id: string) => {
    const ds = DATASETS.find((d) => d.id === id);
    if (!ds) return;
    try {
      const res = await fetch(`/datasets/${ds.file}`);
      if (!res.ok) throw new Error(`fetch(${ds.file}) failed: ${res.status}`);
      const text = await res.text();
      const parsed = Papa.parse<Row>(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      });
      const data = parsed.data.filter(Boolean);
      const cols = parsed.meta.fields ?? [];
      setRows(data);
      setColumns(cols);
      setSourceLabel(ds.name);
      // Авто-выбор первой пары
      const pair = ds.suggestedPairs?.[0];
      const numericCols = cols.filter((c) =>
        ds.variables.find((v) => v.name === c)?.type === 'numeric',
      );
      setXVar(pair?.x ?? numericCols[0] ?? '');
      setYVar(pair?.y ?? numericCols[1] ?? '');
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (datasetId) loadDataset(datasetId);
  }, [datasetId, loadDataset]);

  const handleCSV = (file: File) => {
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (res) => {
        const data = res.data.filter(Boolean);
        const cols = res.meta.fields ?? [];
        setRows(data);
        setColumns(cols);
        setSourceLabel(file.name);
        setDatasetId('');
        const numericCols = cols.filter((c) =>
          data.slice(0, 20).every((r) => numericValue(r[c]) !== null),
        );
        setXVar(numericCols[0] ?? '');
        setYVar(numericCols[1] ?? '');
      },
    });
  };

  // Числовые столбцы
  const numericColumns = useMemo(() => {
    if (rows.length === 0) return [];
    return columns.filter((c) =>
      rows.slice(0, 30).every((r) => numericValue(r[c]) !== null),
    );
  }, [rows, columns]);

  // Чистые наблюдения
  const cleanData = useMemo(() => {
    if (!xVar || !yVar) return { x: [] as number[], y: [] as number[] };
    const x: number[] = [];
    const y: number[] = [];
    rows.forEach((r) => {
      const xv = numericValue(r[xVar]);
      const yv = numericValue(r[yVar]);
      if (xv !== null && yv !== null) {
        x.push(xv);
        y.push(yv);
      }
    });
    return { x, y };
  }, [rows, xVar, yVar]);

  const result: RegressionResult | null = useMemo(() => {
    if (cleanData.x.length < 3) return null;
    const X = cleanData.x.map((v) => [v]);
    return fitOLS(X, cleanData.y, robust);
  }, [cleanData, robust]);

  // Tile 1: Scatter + line + 95% band
  const bandData = useMemo(() => {
    if (!result) return [];
    return confidenceBand(cleanData.x, cleanData.y, result, 80).map((p) => ({
      x: p.x,
      yHat: p.yHat,
      bandLow: p.lower,
      bandRange: p.upper - p.lower,
    }));
  }, [result, cleanData]);

  const scatterData = useMemo(
    () => cleanData.x.map((xv, i) => ({ x: xv, y: cleanData.y[i] })),
    [cleanData],
  );

  // Tile 2: residuals vs fitted + LOESS
  const residData = useMemo(() => {
    if (!result) return [];
    return result.fitted.map((f, i) => ({ x: f, y: result.residuals[i] }));
  }, [result]);

  const smoothData = useMemo(() => {
    if (!result) return [];
    return movingAverageSmooth(result.fitted, result.residuals, 0.3);
  }, [result]);

  // Tile 3: Q-Q
  const qqData = useMemo(() => {
    if (!result) return [];
    return qqPoints(result.residuals).map((p) => ({ x: p.theoretical, y: p.sample }));
  }, [result]);

  const qqDiag = useMemo(() => {
    if (qqData.length === 0) return [];
    const xs = qqData.map((p) => p.x);
    const lo = Math.min(...xs);
    const hi = Math.max(...xs);
    return [
      { x: lo, y: lo },
      { x: hi, y: hi },
    ];
  }, [qqData]);

  // Tile 4: Cook's distance
  const cookData = useMemo(() => {
    if (!result) return [];
    return result.cooks.map((c, i) => ({ index: i + 1, cook: c }));
  }, [result]);

  const cookThreshold = result ? 4 / result.n : 0;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Контролы */}
        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Данные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Готовый датасет
                </Label>
                <Select value={datasetId} onValueChange={setDatasetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите…" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATASETS.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Или загрузите CSV
                </Label>
                <label className="flex items-center gap-2 px-3 py-2 border border-input rounded-none cursor-pointer hover:bg-accent text-sm">
                  <Upload className="w-4 h-4" />
                  <span className="truncate">{sourceLabel || 'Выбрать файл…'}</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleCSV(f);
                    }}
                  />
                </label>
              </div>

              {numericColumns.length > 0 && (
                <>
                  <div className="space-y-2">
                    <Label>Зависимая (Y)</Label>
                    <Select value={yVar} onValueChange={setYVar}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {numericColumns.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Независимая (X)</Label>
                    <Select value={xVar} onValueChange={setXVar}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {numericColumns.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="robust" className="cursor-pointer">Robust SE (HC3)</Label>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <button type="button" aria-label="О HC3"><HelpCircle className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Поправка White (HC3) даёт корректные SE при гетероскедастичности.
                    </TooltipContent>
                  </UITooltip>
                </div>
                <Switch id="robust" checked={robust} onCheckedChange={setRobust} />
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Основная область */}
        <div className="space-y-6 min-w-0">
          {/* Числовая панель */}
          {result ? (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-xs">
                  <Stat label="β₀" value={fmt(result.coef[0], 4)} />
                  <Stat label="β₁" value={fmt(result.coef[1], 4)} />
                  <Stat label={`SE(β₁)${result.seMethod === 'hc3' ? ' [HC3]' : ''}`} value={fmt(result.se[1], 4)} />
                  <Stat label="t(β₁)" value={fmt(result.tStat[1], 3)} />
                  <Stat label="p(β₁)" value={pFmt(result.pValue[1])} />
                  <Stat label="R²" value={fmt(result.rSquared, 4)} />
                  <Stat label="R² adj" value={fmt(result.adjRSquared, 4)} />
                  <Stat label={`F(${result.df1},${result.df2})`} value={fmt(result.fStat, 3)} />
                  <Stat label="p_F" value={pFmt(result.fPValue)} />
                  <Stat label="n" value={String(result.n)} />
                  <Stat label="RMSE" value={fmt(result.rmse, 4)} />
                  <Stat label="метод SE" value={result.seMethod === 'hc3' ? 'HC3' : 'OLS'} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Выберите датасет или загрузите CSV, затем выберите зависимую и независимую переменные.
              </CardContent>
            </Card>
          )}

          {/* Bento 2x2 */}
          {result && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Tile 1 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Регрессия · 95% confidence band
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={bandData} margin={{ top: 10, right: 12, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="x" type="number" domain={['dataMin', 'dataMax']} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 0 }} />
                      <Area dataKey="bandLow" stackId="band" stroke="none" fill="transparent" />
                      <Area dataKey="bandRange" stackId="band" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.15} />
                      <Line dataKey="yHat" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      <Scatter data={scatterData} dataKey="y" fill="hsl(var(--foreground))" fillOpacity={0.55} shape="circle" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Tile 2 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Остатки vs предсказанные · LOESS-smooth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart margin={{ top: 10, right: 12, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="x" type="number" domain={['dataMin', 'dataMax']} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} name="ŷ" />
                      <YAxis dataKey="y" type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} name="e" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 0 }} />
                      <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="4 4" />
                      <Scatter data={residData} fill="hsl(var(--foreground))" fillOpacity={0.5} />
                      <Line data={smoothData} dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} type="monotone" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Tile 3 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between gap-2">
                    <span>Q-Q plot остатков vs N(0,1)</span>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <button type="button" aria-label="Тяжёлые хвосты">
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-xs">
                        Если точки на хвостах сильно отклоняются от диагонали — распределение остатков
                        тяжелохвостое. В этом случае рассмотрите{' '}
                        <Link to="/labs/nonparametric" className="underline">непараметрические методы</Link>.
                      </TooltipContent>
                    </UITooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart margin={{ top: 10, right: 12, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="x" type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} label={{ value: 'Теоретические', position: 'insideBottom', offset: -2, fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis dataKey="y" type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 0 }} />
                      <Line data={qqDiag} dataKey="y" stroke="hsl(var(--destructive))" strokeDasharray="4 4" dot={false} />
                      <Scatter data={qqData} fill="hsl(var(--primary))" fillOpacity={0.7} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Tile 4 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Cook's distance · порог 4/n = {cookThreshold.toFixed(3)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={cookData} margin={{ top: 10, right: 12, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="index" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 0 }} />
                      <ReferenceLine y={cookThreshold} stroke="hsl(var(--destructive))" strokeDasharray="4 4" />
                      <Bar dataKey="cook">
                        {cookData.map((d, i) => (
                          <Cell key={i} fill={d.cook > cookThreshold ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-0.5 border-l-2 border-border pl-2">
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans">{label}</span>
    <span className="text-sm font-semibold">{value}</span>
  </div>
);

export default RegressionInspector;
