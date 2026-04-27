import { useMemo, useState, useCallback } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Customized,
} from 'recharts';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Brain } from 'lucide-react';
import {
  generateScenario,
  pearsonR,
  ols,
  covMatrix,
  eigen2x2,
  mahalanobisSq,
  ANSCOMBE_SETS,
  type Scenario,
  type Point,
} from '@/lib/simulation';
import { normalCDF } from '@/lib/distributions';

const fmt = (v: number, d = 3) => (Number.isFinite(v) ? v.toFixed(d) : '—');

// Two-sided p-value for Pearson r via t-distribution approximated by normal for large n.
// For accuracy across n we use t→normal via |t|/sqrt(1+t²/(2n)) heuristic; OK for educational use.
function pValuePearson(r: number, n: number): number {
  if (n <= 2) return 1;
  const t = Math.abs(r) * Math.sqrt((n - 2) / Math.max(1e-12, 1 - r * r));
  // Approximate two-sided p using normal tail; for n>30 close to t-dist.
  const p = 2 * (1 - normalCDF(t));
  return Math.max(0, Math.min(1, p));
}

// Fisher z 95% CI for r
function fisherCI(r: number, n: number): [number, number] {
  if (n <= 3) return [-1, 1];
  const z = 0.5 * Math.log((1 + r) / (1 - r));
  const se = 1 / Math.sqrt(n - 3);
  const zlo = z - 1.96 * se;
  const zhi = z + 1.96 * se;
  const inv = (zz: number) => (Math.exp(2 * zz) - 1) / (Math.exp(2 * zz) + 1);
  return [inv(zlo), inv(zhi)];
}

interface Props {
  className?: string;
}

const SCENARIOS: { id: Scenario; label: string; warning: string | null }[] = [
  { id: 'normal', label: 'Норма', warning: null },
  { id: 'outliers', label: 'Выбросы', warning: 'Несколько крайних точек сильно влияют на r' },
  { id: 'curve', label: 'Нелинейная (U)', warning: 'Pearson r не видит нелинейной связи — смотрите на форму!' },
  { id: 'hetero', label: 'Гетероскедастичность', warning: 'Дисперсия y растёт с x — нарушено допущение OLS' },
];

const SLEEP_PRESET = {
  xLabel: 'Часы сна',
  yLabel: 'Балл по тесту внимания',
  // Approx natural ranges: sleep 4–10, attention 30–95
  toX: (z: number) => 7 + z * 1.2,
  toY: (z: number) => 65 + z * 12,
};

export const CorrelationExplorer = ({ className = '' }: Props) => {
  const [r, setR] = useState(0.6);
  const [n, setN] = useState(80);
  const [scenario, setScenario] = useState<Scenario>('normal');
  const [seed, setSeed] = useState(0);
  const [usePsy, setUsePsy] = useState(false);

  const points = useMemo(
    () => generateScenario(n, r, scenario),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [n, r, scenario, seed],
  );

  // Map to display coords (psychological preset rescales axes)
  const display: Point[] = useMemo(
    () => usePsy
      ? points.map((p) => ({ x: SLEEP_PRESET.toX(p.x), y: SLEEP_PRESET.toY(p.y) }))
      : points,
    [points, usePsy],
  );

  const stats = useMemo(() => {
    const rEmp = pearsonR(display);
    const cov = covMatrix(display);
    const reg = ols(display);
    const p = pValuePearson(rEmp, display.length);
    const [ciLo, ciHi] = fisherCI(rEmp, display.length);
    return { rEmp, cov, reg, p, ciLo, ciHi };
  }, [display]);

  // Tooltip: enrich with z-scores & Mahalanobis
  const enriched = useMemo(() => {
    const sdX = Math.sqrt(stats.cov.sxx) || 1;
    const sdY = Math.sqrt(stats.cov.syy) || 1;
    return display.map((p) => ({
      ...p,
      zx: (p.x - stats.cov.mx) / sdX,
      zy: (p.y - stats.cov.my) / sdY,
      m: Math.sqrt(mahalanobisSq(p, stats.cov)),
    }));
  }, [display, stats.cov]);

  const xLabel = usePsy ? SLEEP_PRESET.xLabel : 'x (z)';
  const yLabel = usePsy ? SLEEP_PRESET.yLabel : 'y (z)';

  // Domain
  const xs = display.map((p) => p.x);
  const ys = display.map((p) => p.y);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const padX = (xMax - xMin) * 0.08 || 1;
  const padY = (yMax - yMin) * 0.08 || 1;

  const currentScenario = SCENARIOS.find((s) => s.id === scenario)!;

  // Custom SVG: 95% confidence ellipse computed from cov matrix.
  // χ²(2, 0.95) = 5.991 → axes lengths = sqrt(5.991 * λ_i).
  const Ellipse = useCallback(
    (props: { xAxisMap?: Record<number, { scale: (v: number) => number }>; yAxisMap?: Record<number, { scale: (v: number) => number }> }) => {
      const xMap = props.xAxisMap ? Object.values(props.xAxisMap)[0] : null;
      const yMap = props.yAxisMap ? Object.values(props.yAxisMap)[0] : null;
      if (!xMap || !yMap) return null;
      const { l1, l2, angle } = eigen2x2(stats.cov.sxx, stats.cov.sxy, stats.cov.syy);
      const chi2 = 5.991;
      const ax = Math.sqrt(chi2 * l1);
      const ay = Math.sqrt(chi2 * l2);
      const cx = xMap.scale(stats.cov.mx);
      const cy = yMap.scale(stats.cov.my);
      // Compute pixel scale
      const xUnit = Math.abs(xMap.scale(stats.cov.mx + 1) - xMap.scale(stats.cov.mx));
      const yUnit = Math.abs(yMap.scale(stats.cov.my + 1) - yMap.scale(stats.cov.my));
      const rx = ax * xUnit;
      const ry = ay * yUnit;
      // Recharts y-axis is flipped, so angle direction inverts on screen
      const deg = -(angle * 180) / Math.PI;
      return (
        <g transform={`translate(${cx} ${cy}) rotate(${deg})`}>
          <ellipse
            cx={0}
            cy={0}
            rx={rx}
            ry={ry}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            opacity={0.7}
          />
        </g>
      );
    },
    [stats.cov],
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <Card className="p-5 border-2">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <Label>Целевая корреляция r</Label>
              <span className="font-mono">{fmt(r, 2)}</span>
            </div>
            <Slider min={-1} max={1} step={0.01} value={[r]} onValueChange={([v]) => setR(v)} />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <Label>Размер выборки n</Label>
              <span className="font-mono">{n}</span>
            </div>
            <Slider min={10} max={500} step={5} value={[n]} onValueChange={([v]) => setN(v)} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          <Button onClick={() => setSeed((s) => s + 1)} size="sm" variant="default">
            <RefreshCw className="w-4 h-4 mr-2" /> Новая выборка
          </Button>
          <div className="h-6 w-px bg-border mx-1 self-center" />
          {SCENARIOS.map((s) => (
            <Button
              key={s.id}
              size="sm"
              variant={scenario === s.id ? 'default' : 'outline'}
              onClick={() => setScenario(s.id)}
            >
              {s.label}
            </Button>
          ))}
          <div className="h-6 w-px bg-border mx-1 self-center" />
          <Button
            size="sm"
            variant={usePsy ? 'default' : 'outline'}
            onClick={() => setUsePsy((v) => !v)}
          >
            <Brain className="w-4 h-4 mr-2" />
            Сон → внимание
          </Button>
        </div>
      </Card>

      {/* Chart */}
      <div className="relative h-[460px] border-2 border-border p-3">
        {currentScenario.warning && (
          <div className="absolute top-4 right-4 z-10 max-w-xs flex items-start gap-2 bg-background border-2 border-foreground px-3 py-2 text-xs">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{currentScenario.warning}</span>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 16, right: 24, bottom: 36, left: 24 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.4} />
            <XAxis
              type="number"
              dataKey="x"
              name={xLabel}
              domain={[xMin - padX, xMax + padX]}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              label={{ value: xLabel, position: 'bottom', offset: 16, style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 } }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={yLabel}
              domain={[yMin - padY, yMax + padY]}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              label={{ value: yLabel, angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 } }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: 'hsl(var(--muted-foreground))' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                fontFamily: 'monospace',
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => [fmt(value, 2), name]}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as typeof enriched[number];
                return (
                  <div className="bg-background border border-border p-2 font-mono text-xs space-y-0.5">
                    <div>{xLabel}: {fmt(d.x, 2)}</div>
                    <div>{yLabel}: {fmt(d.y, 2)}</div>
                    <div className="text-muted-foreground">z-x: {fmt(d.zx, 2)} · z-y: {fmt(d.zy, 2)}</div>
                    <div className="text-muted-foreground">Mahalanobis: {fmt(d.m, 2)}</div>
                  </div>
                );
              }}
            />

            {/* Regression line via two reference points using ReferenceLine segment */}
            <ReferenceLine
              segment={[
                { x: xMin - padX, y: stats.reg.a + stats.reg.b * (xMin - padX) },
                { x: xMax + padX, y: stats.reg.a + stats.reg.b * (xMax + padX) },
              ]}
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
            />

            <Scatter
              data={enriched}
              fill="hsl(var(--primary))"
              fillOpacity={0.55}
              shape="circle"
            />

            {/* 95% confidence ellipse */}
            <Customized component={Ellipse} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Stats panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="r (Пирсон)" value={fmt(stats.rEmp, 3)} />
        <StatBox label="r²" value={fmt(stats.rEmp * stats.rEmp, 3)} />
        <StatBox
          label="p (двусторонний)"
          value={stats.p < 0.001 ? '< 0.001' : fmt(stats.p, 3)}
          accent={stats.p < 0.05}
        />
        <StatBox label="95% CI для r" value={`[${fmt(stats.ciLo, 2)}; ${fmt(stats.ciHi, 2)}]`} />
      </div>

      {/* Anscombe demo */}
      <div>
        <h3 className="font-serif text-xl mb-1">Зачем смотреть на график, а не только на r</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Все три набора Анскомба имеют почти одинаковое r ≈ 0.82, но форма связи кардинально разная.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {ANSCOMBE_SETS.map((set) => {
            const rSet = pearsonR(set.pts);
            return (
              <div key={set.id} className="border-2 border-border p-3">
                <div className="flex justify-between items-baseline mb-2">
                  <div className="font-serif text-sm">{set.label}</div>
                  <div className="font-mono text-xs">r = {fmt(rSet, 2)}</div>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                      <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.3} />
                      <XAxis type="number" dataKey="x" hide domain={[2, 16]} />
                      <YAxis type="number" dataKey="y" hide domain={[2, 14]} />
                      <Scatter data={set.pts} fill="hsl(var(--primary))" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className={`border-2 p-3 ${accent ? 'border-foreground bg-foreground text-background' : 'border-border'}`}>
    <div className="text-[10px] uppercase tracking-wider opacity-70 mb-1">{label}</div>
    <div className="font-mono text-lg">{value}</div>
  </div>
);

export default CorrelationExplorer;
