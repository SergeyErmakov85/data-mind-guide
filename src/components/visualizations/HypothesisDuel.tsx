import { useMemo, useState, useId } from 'react';
import { scaleLinear } from 'd3-scale';
import { Link } from 'react-router-dom';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Card } from '@/components/ui/card';
import { normalPDF, normalCDF, qnorm } from '@/lib/distributions';
import { ArrowRight } from 'lucide-react';

interface Props {
  className?: string;
}

const ALPHAS = [0.001, 0.01, 0.05, 0.1] as const;
const NUM_POINTS = 240;
const fmt = (v: number, d = 3) => (Number.isFinite(v) ? v.toFixed(d) : '—');

// Required n per group for two independent means (z-approx, two-sided)
function nForPower(d: number, alpha: number, power = 0.8, twoSided = true): number {
  if (d <= 0) return Infinity;
  const za = qnorm(1 - alpha / (twoSided ? 2 : 1));
  const zb = qnorm(power);
  return Math.ceil(2 * Math.pow((za + zb) / d, 2));
}

export const HypothesisDuel = ({ className = '' }: Props) => {
  const [delta, setDelta] = useState(1.0); // standardized effect (μ1 − μ0) / SE
  const [alpha, setAlpha] = useState<number>(0.05);
  const [twoSided, setTwoSided] = useState(true);
  const [n, setN] = useState(50);

  const titleId = useId();

  // SE shrinks with sqrt(n). For visualization we use SE in standardized units (so curves keep shape).
  // We display SE as 1/sqrt(n) for context.
  const SE = 1 / Math.sqrt(n);

  // Critical z (work in standardized z-space; H0: N(0,1), H1: N(δ, 1) where δ is in SE units).
  const zCrit = twoSided ? qnorm(1 - alpha / 2) : qnorm(1 - alpha);

  // β = P(not reject H0 | H1)
  const beta = twoSided
    ? normalCDF(zCrit - delta) - normalCDF(-zCrit - delta)
    : normalCDF(zCrit - delta);
  const power = 1 - beta;

  const xMin = Math.min(-4, delta - 4);
  const xMax = Math.max(4, delta + 4);

  // Geometry
  const W = 720, H = 320;
  const M = { top: 28, right: 16, bottom: 40, left: 40 };
  const innerW = W - M.left - M.right;
  const innerH = H - M.top - M.bottom;

  const xScale = scaleLinear().domain([xMin, xMax]).range([0, innerW]);

  // y-max from PDF peak
  const yMax = normalPDF(0, 0, 1) * 1.05; // ≈ 0.42
  const yScale = scaleLinear().domain([0, yMax]).range([innerH, 0]);

  // Sample curves
  const { h0Pts, h1Pts } = useMemo(() => {
    const step = (xMax - xMin) / (NUM_POINTS - 1);
    const h0: { x: number; y: number }[] = [];
    const h1: { x: number; y: number }[] = [];
    for (let i = 0; i < NUM_POINTS; i++) {
      const x = xMin + i * step;
      h0.push({ x, y: normalPDF(x, 0, 1) });
      h1.push({ x, y: normalPDF(x, delta, 1) });
    }
    return { h0Pts: h0, h1Pts: h1 };
  }, [xMin, xMax, delta]);

  function pathFromPts(pts: { x: number; y: number }[]): string {
    return pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(p.x).toFixed(2)},${yScale(p.y).toFixed(2)}`)
      .join(' ');
  }

  function areaPath(pts: { x: number; y: number }[], xLo: number, xHi: number): string {
    const inside = pts.filter((p) => p.x >= xLo && p.x <= xHi);
    if (inside.length < 2) return '';
    const baseY = yScale(0);
    const top = inside
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(p.x).toFixed(2)},${yScale(p.y).toFixed(2)}`)
      .join(' ');
    const last = inside[inside.length - 1];
    const first = inside[0];
    return `${top} L${xScale(last.x).toFixed(2)},${baseY.toFixed(2)} L${xScale(first.x).toFixed(2)},${baseY.toFixed(2)} Z`;
  }

  const h0Path = pathFromPts(h0Pts);
  const h1Path = pathFromPts(h1Pts);

  // Alpha regions on H0
  const alphaRightPath = areaPath(h0Pts, zCrit, xMax);
  const alphaLeftPath = twoSided ? areaPath(h0Pts, xMin, -zCrit) : '';

  // Beta region on H1: P(not reject H0 | H1) = area between -zCrit and +zCrit (or below zCrit one-sided)
  const betaPath = twoSided
    ? areaPath(h1Pts, -zCrit, zCrit)
    : areaPath(h1Pts, xMin, zCrit);

  // Power region on H1: complement of beta on the rejection side
  const powerRightPath = areaPath(h1Pts, zCrit, xMax);
  const powerLeftPath = twoSided ? areaPath(h1Pts, xMin, -zCrit) : '';

  // x-axis ticks
  const ticks = [-4, -3, -2, -1, 0, 1, 2, 3, 4].filter((t) => t >= xMin && t <= xMax);
  if (delta > 0 && !ticks.includes(Math.round(delta))) ticks.push(Math.round(delta));

  // For psychological recommendation
  const requiredN = nForPower(0.2, alpha, 0.8, twoSided);

  const description = `Дуэль гипотез: эффект δ = ${fmt(delta, 2)}, α = ${alpha}, ${
    twoSided ? 'двусторонний' : 'односторонний'
  }, n = ${n}. Критическое z = ${fmt(zCrit, 2)}. Мощность ${fmt(power, 2)}, ошибка II рода β = ${fmt(beta, 2)}.`;

  return (
    <div className={`space-y-6 ${className}`}>
      <span className="sr-only" aria-live="polite" id={titleId}>{description}</span>

      {/* Numerical panel */}
      <div className="border-2 border-border bg-muted/30 p-4 font-mono text-sm grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-1">
        <Stat label="α" value={String(alpha)} />
        <Stat label="z_crit" value={`±${fmt(zCrit, 2)}`} />
        <Stat label="β" value={fmt(beta, 3)} />
        <Stat label="1−β" value={fmt(power, 3)} accent={power >= 0.8} />
        <Stat label="SE" value={fmt(SE, 3)} />
        <Stat label="δ" value={fmt(delta, 2)} />
      </div>

      {/* Controls */}
      <Card className="p-5 border-2">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <Label>Эффект δ (в SE)</Label>
              <span className="font-mono">{fmt(delta, 2)}</span>
            </div>
            <Slider min={0} max={4} step={0.05} value={[delta]} onValueChange={([v]) => setDelta(v)} />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <Label>Размер выборки n</Label>
              <span className="font-mono">{n}</span>
            </div>
            <Slider min={5} max={500} step={5} value={[n]} onValueChange={([v]) => setN(v)} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-5">
          <div>
            <div className="text-xs text-muted-foreground mb-1.5">Уровень α</div>
            <ToggleGroup
              type="single"
              value={String(alpha)}
              onValueChange={(v) => v && setAlpha(parseFloat(v))}
              className="justify-start"
            >
              {ALPHAS.map((a) => (
                <ToggleGroupItem key={a} value={String(a)} className="font-mono">
                  {a}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1.5">Тип теста</div>
            <ToggleGroup
              type="single"
              value={twoSided ? 'two' : 'one'}
              onValueChange={(v) => v && setTwoSided(v === 'two')}
            >
              <ToggleGroupItem value="two">Двусторонний</ToggleGroupItem>
              <ToggleGroupItem value="one">Односторонний</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </Card>

      {/* SVG chart */}
      <div className="border-2 border-border p-2 bg-background">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          role="img"
          aria-labelledby={titleId}
        >
          <defs>
            <pattern id="alphaHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="hsl(0 75% 55%)" strokeWidth="2" />
            </pattern>
            <pattern id="betaHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="hsl(220 70% 55%)" strokeWidth="2" />
            </pattern>
          </defs>

          <g transform={`translate(${M.left} ${M.top})`}>
            {/* x-axis */}
            <line x1={0} x2={innerW} y1={yScale(0)} y2={yScale(0)} stroke="hsl(var(--border))" />
            {ticks.map((t) => (
              <g key={t} transform={`translate(${xScale(t)} ${yScale(0)})`}>
                <line y1={0} y2={4} stroke="hsl(var(--muted-foreground))" />
                <text
                  y={18}
                  textAnchor="middle"
                  fontSize={10}
                  fontFamily="monospace"
                  fill="hsl(var(--muted-foreground))"
                >
                  {t}
                </text>
              </g>
            ))}
            <text
              x={innerW / 2}
              y={innerH + 34}
              textAnchor="middle"
              fontSize={11}
              fill="hsl(var(--muted-foreground))"
            >
              z (стандартизованная разность)
            </text>

            {/* Power region (filled) */}
            {powerRightPath && (
              <path d={powerRightPath} fill="hsl(var(--primary))" fillOpacity={0.4} />
            )}
            {powerLeftPath && (
              <path d={powerLeftPath} fill="hsl(var(--primary))" fillOpacity={0.4} />
            )}

            {/* Beta region (hatched) */}
            {betaPath && <path d={betaPath} fill="url(#betaHatch)" opacity={0.7} />}

            {/* Alpha region (hatched) */}
            {alphaRightPath && <path d={alphaRightPath} fill="url(#alphaHatch)" opacity={0.85} />}
            {alphaLeftPath && <path d={alphaLeftPath} fill="url(#alphaHatch)" opacity={0.85} />}

            {/* H0 curve */}
            <path d={h0Path} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
            {/* H1 curve */}
            <path d={h1Path} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />

            {/* z_crit lines */}
            <line
              x1={xScale(zCrit)} x2={xScale(zCrit)}
              y1={0} y2={innerH}
              stroke="hsl(var(--foreground))"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <text
              x={xScale(zCrit) + 4} y={12}
              fontSize={10} fontFamily="monospace" fill="hsl(var(--foreground))"
            >
              z_crit = {fmt(zCrit, 2)}
            </text>
            {twoSided && (
              <>
                <line
                  x1={xScale(-zCrit)} x2={xScale(-zCrit)}
                  y1={0} y2={innerH}
                  stroke="hsl(var(--foreground))"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
                <text
                  x={xScale(-zCrit) - 4} y={12}
                  textAnchor="end"
                  fontSize={10} fontFamily="monospace" fill="hsl(var(--foreground))"
                >
                  −{fmt(zCrit, 2)}
                </text>
              </>
            )}

            {/* μ markers */}
            <text x={xScale(0)} y={-10} textAnchor="middle" fontSize={11} fontFamily="monospace" fill="hsl(var(--muted-foreground))">
              H₀: μ₀
            </text>
            <text x={xScale(delta)} y={-10} textAnchor="middle" fontSize={11} fontFamily="monospace" fill="hsl(var(--primary))">
              H₁: μ₁
            </text>
          </g>
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 px-2 pt-2 text-xs">
          <LegendSwatch color="hsl(var(--muted-foreground))" label="H₀" />
          <LegendSwatch color="hsl(var(--primary))" label="H₁" />
          <LegendSwatch pattern="alpha" label={`α = ${alpha} (ошибка I рода)`} />
          <LegendSwatch pattern="beta" label={`β = ${fmt(beta, 2)} (ошибка II рода)`} />
          <LegendSwatch color="hsl(var(--primary))" opacity={0.4} label={`Мощность 1−β = ${fmt(power, 2)}`} />
        </div>
      </div>

      {/* Psychological context */}
      <Card className="p-5 border-2">
        <p className="text-sm leading-relaxed">
          {power >= 0.8 ? (
            <>
              При выбранных параметрах мощность теста <b>{fmt(power, 2)}</b> — этого достаточно,
              чтобы стабильно детектировать эффект δ = {fmt(delta, 2)}.
            </>
          ) : (
            <>
              Мощность <b>{fmt(power, 2)}</b> ниже стандарта 0.80 — велик риск пропустить реальный эффект.
            </>
          )}
          {' '}
          Чтобы детектировать <b>малый эффект (Cohen’s d = 0.2)</b> с мощностью 0.80
          при α = {alpha}, потребуется <b className="font-mono">n ≈ {requiredN}</b> на группу.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link to="/sample-size">
            Калькулятор объёма выборки <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </Button>
      </Card>
    </div>
  );
};

const Stat = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="flex justify-between sm:justify-start sm:gap-2">
    <span className="text-muted-foreground">{label}</span>
    <span className={accent ? 'font-bold' : ''}>{value}</span>
  </div>
);

const LegendSwatch = ({
  color, opacity = 1, pattern, label,
}: { color?: string; opacity?: number; pattern?: 'alpha' | 'beta'; label: string }) => (
  <div className="flex items-center gap-1.5">
    <span
      aria-hidden
      className="inline-block w-4 h-4 border border-border"
      style={
        pattern === 'alpha'
          ? { background: 'repeating-linear-gradient(45deg, hsl(0 75% 55%) 0 2px, transparent 2px 5px)' }
          : pattern === 'beta'
          ? { background: 'repeating-linear-gradient(-45deg, hsl(220 70% 55%) 0 2px, transparent 2px 5px)' }
          : { backgroundColor: color, opacity }
      }
    />
    <span>{label}</span>
  </div>
);

export default HypothesisDuel;
