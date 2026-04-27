import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Calculator, Download, Save, HelpCircle, BookOpen } from 'lucide-react';

import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  tTestN,
  tTestPower,
  corrN,
  corrPower,
  chiSqN,
  chiSqPowerAt,
  propN,
  propPower,
  anovaN,
  anovaPowerAt,
  type SampleSizeResult,
} from '@/lib/power';

/* ─────────────────────────── Helpers ─────────────────────────── */

type Scenario = 'ttest' | 'corr' | 'chisq' | 'prop' | 'anova';

const SCENARIO_LABEL: Record<Scenario, string> = {
  ttest: 'Сравнение средних (t-test)',
  corr: 'Корреляция (Пирсон)',
  chisq: 'χ² (goodness / contingency)',
  prop: 'Пропорции',
  anova: 'ANOVA one-way',
};

interface NumFieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  hint?: string;
}

const NumField = ({ id, label, value, min, max, step, onChange, hint }: NumFieldProps) => (
  <div className="space-y-2">
    <div className="flex items-baseline justify-between">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (Number.isFinite(v)) onChange(Math.min(max, Math.max(min, v)));
        }}
        className="h-8 w-24 text-right"
      />
    </div>
    <Slider
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(v) => onChange(v[0] ?? value)}
      aria-label={label}
    />
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const buildReport = (scenario: Scenario, result: SampleSizeResult): string => {
  const lines: string[] = [];
  lines.push('═══════════════════════════════════════════');
  lines.push(`  РАСЧЁТ ОБЪЁМА ВЫБОРКИ`);
  lines.push(`  Сценарий: ${SCENARIO_LABEL[scenario]}`);
  lines.push('═══════════════════════════════════════════');
  lines.push('');
  lines.push('ВХОДНЫЕ ДАННЫЕ:');
  Object.entries(result.details).forEach(([k, v]) => {
    lines.push(`  ${k.padEnd(14)} = ${v}`);
  });
  lines.push('');
  lines.push('ФОРМУЛА:');
  lines.push(`  ${result.formula}`);
  lines.push('');
  lines.push('РЕЗУЛЬТАТ:');
  if (scenario === 'ttest' || scenario === 'prop') {
    lines.push(`  n на группу    = ${result.n}`);
    lines.push(`  N всего        = ${result.nTotal}`);
  } else if (scenario === 'anova') {
    lines.push(`  n на группу    = ${result.n}`);
    lines.push(`  N всего        = ${result.nTotal}`);
  } else {
    lines.push(`  N              = ${result.n}`);
  }
  lines.push('');
  lines.push(`Сгенерировано: ${new Date().toLocaleString('ru-RU')}`);
  return lines.join('\n');
};

const downloadTxt = (filename: string, text: string) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/* ─────────────────────────── Power curve ─────────────────────────── */

interface PowerCurveProps {
  scenario: Scenario;
  params: ScenarioParams;
  currentN: number;
  targetPower: number;
}

const PowerCurve = ({ scenario, params, currentN, targetPower }: PowerCurveProps) => {
  const data = useMemo(() => {
    const points: Array<{ n: number; power: number }> = [];
    for (let n = 5; n <= 500; n += n < 50 ? 2 : n < 200 ? 5 : 10) {
      let p = 0;
      switch (scenario) {
        case 'ttest':
          p = tTestPower(params.d, n, params.alpha, params.twoSided, params.ratio);
          break;
        case 'corr':
          p = corrPower(params.r, n, params.alpha, params.twoSided);
          break;
        case 'chisq':
          p = chiSqPowerAt(params.w, params.df, n, params.alpha);
          break;
        case 'prop':
          p = propPower(params.p1, params.p2 ?? 0.5, n, params.alpha, params.twoSided);
          break;
        case 'anova':
          p = anovaPowerAt(params.f, params.k, n * params.k, params.alpha);
          break;
      }
      points.push({ n, power: Math.max(0, Math.min(1, p)) });
    }
    return points;
  }, [scenario, params]);

  return (
    <div className="h-72 w-full" role="img" aria-label={`Кривая мощности как функция объёма выборки для сценария ${SCENARIO_LABEL[scenario]}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 30, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="n"
            stroke="hsl(var(--muted-foreground))"
            label={{ value: 'n (на группу / на тест)', position: 'insideBottom', offset: -10, fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            domain={[0, 1]}
            stroke="hsl(var(--muted-foreground))"
            label={{ value: 'Мощность (1−β)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
          />
          <RTooltip
            contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }}
            formatter={(v: number) => v.toFixed(3)}
            labelFormatter={(l) => `n = ${l}`}
          />
          <ReferenceLine y={targetPower} stroke="hsl(var(--primary))" strokeDasharray="4 4" label={{ value: `target ${targetPower}`, fill: 'hsl(var(--primary))', position: 'right' }} />
          {Number.isFinite(currentN) && (
            <ReferenceLine x={currentN} stroke="hsl(var(--accent-foreground))" strokeDasharray="2 4" />
          )}
          <Line type="monotone" dataKey="power" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ─────────────────────────── Scenario params ─────────────────────────── */

interface ScenarioParams {
  alpha: number;
  power: number;
  twoSided: boolean;
  // ttest
  d: number;
  ratio: number;
  // corr
  r: number;
  // chisq
  w: number;
  df: number;
  // prop
  p1: number;
  p2?: number;
  oneProportion: boolean;
  // anova
  f: number;
  k: number;
}

const DEFAULTS: ScenarioParams = {
  alpha: 0.05,
  power: 0.8,
  twoSided: true,
  d: 0.5,
  ratio: 1,
  r: 0.3,
  w: 0.3,
  df: 1,
  p1: 0.6,
  p2: 0.5,
  oneProportion: false,
  f: 0.25,
  k: 3,
};

/* ─────────────────────────── Page ─────────────────────────── */

const SampleSizePage = () => {
  const reduced = useReducedMotion();
  const { user } = useAuth();
  const [scenario, setScenario] = useState<Scenario>('ttest');
  const [params, setParams] = useState<ScenarioParams>(DEFAULTS);

  const set = <K extends keyof ScenarioParams>(key: K, value: ScenarioParams[K]) =>
    setParams((p) => ({ ...p, [key]: value }));

  const result = useMemo<SampleSizeResult>(() => {
    switch (scenario) {
      case 'ttest':
        return tTestN({ d: params.d, alpha: params.alpha, power: params.power, twoSided: params.twoSided, ratio: params.ratio });
      case 'corr':
        return corrN({ r: params.r, alpha: params.alpha, power: params.power, twoSided: params.twoSided });
      case 'chisq':
        return chiSqN({ w: params.w, df: params.df, alpha: params.alpha, power: params.power });
      case 'prop':
        return propN({
          p1: params.p1,
          p2: params.oneProportion ? undefined : params.p2,
          alpha: params.alpha,
          power: params.power,
          twoSided: params.twoSided,
        });
      case 'anova':
        return anovaN({ f: params.f, k: params.k, alpha: params.alpha, power: params.power });
    }
  }, [scenario, params]);

  const reportText = useMemo(() => buildReport(scenario, result), [scenario, result]);

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase.from('saved_calculations').insert({
      user_id: user.id,
      type: `sample_size:${scenario}`,
      params: { scenario, ...params } as never,
      result: { n: result.n, nTotal: result.nTotal, formula: result.formula, details: result.details } as never,
      note: SCENARIO_LABEL[scenario],
    });
    if (error) {
      toast.error('Не удалось сохранить расчёт', { description: error.message });
    } else {
      toast.success('Расчёт сохранён в личный кабинет');
    }
  };

  const fadeProps = reduced
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container mx-auto px-4 py-12 max-w-7xl">
        <motion.header className="mb-10" {...fadeProps}>
          <Badge variant="secondary" className="mb-3">Калькулятор</Badge>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3 flex items-center gap-3">
            <Calculator className="w-9 h-9 text-primary" aria-hidden="true" />
            Объём выборки
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Профессиональный калькулятор power analysis для психологических исследований.
            Расчёты по Cohen (1988): t-test, корреляция, χ², пропорции, ANOVA.
          </p>
        </motion.header>

        <Tabs value={scenario} onValueChange={(v) => setScenario(v as Scenario)}>
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8 h-auto">
            <TabsTrigger value="ttest">t-test</TabsTrigger>
            <TabsTrigger value="corr">Корреляция</TabsTrigger>
            <TabsTrigger value="chisq">χ²</TabsTrigger>
            <TabsTrigger value="prop">Пропорции</TabsTrigger>
            <TabsTrigger value="anova">ANOVA</TabsTrigger>
          </TabsList>

          {(['ttest', 'corr', 'chisq', 'prop', 'anova'] as const).map((s) => (
            <TabsContent key={s} value={s} className="mt-0">
              <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6">
                {/* PARAMS */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Параметры</CardTitle>
                    <CardDescription>{SCENARIO_LABEL[s]}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <NumField id="alpha" label="α (уровень значимости)" value={params.alpha} min={0.001} max={0.2} step={0.001} onChange={(v) => set('alpha', v)} hint="Обычно 0.05" />
                    <NumField id="power" label="Мощность (1−β)" value={params.power} min={0.5} max={0.99} step={0.01} onChange={(v) => set('power', v)} hint="Стандарт — 0.80" />

                    {(s === 'ttest' || s === 'corr' || s === 'prop') && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Тип теста</Label>
                        <ToggleGroup
                          type="single"
                          value={params.twoSided ? 'two' : 'one'}
                          onValueChange={(v) => v && set('twoSided', v === 'two')}
                          className="justify-start"
                        >
                          <ToggleGroupItem value="two">двусторонний</ToggleGroupItem>
                          <ToggleGroupItem value="one">односторонний</ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                    )}

                    {s === 'ttest' && (
                      <>
                        <NumField id="d" label="d Коэна" value={params.d} min={0.05} max={2} step={0.01} onChange={(v) => set('d', v)} hint="0.2 — малый, 0.5 — средний, 0.8 — большой" />
                        <NumField id="ratio" label="n₂ / n₁" value={params.ratio} min={0.25} max={4} step={0.05} onChange={(v) => set('ratio', v)} hint="1 — равные группы" />
                      </>
                    )}

                    {s === 'corr' && (
                      <NumField id="r" label="ожидаемый r" value={params.r} min={0.05} max={0.95} step={0.01} onChange={(v) => set('r', v)} hint="0.1 — малый, 0.3 — средний, 0.5 — большой" />
                    )}

                    {s === 'chisq' && (
                      <>
                        <NumField id="w" label="w (Cohen)" value={params.w} min={0.05} max={1} step={0.01} onChange={(v) => set('w', v)} hint="0.1 / 0.3 / 0.5" />
                        <NumField id="df" label="степени свободы" value={params.df} min={1} max={20} step={1} onChange={(v) => set('df', v)} />
                      </>
                    )}

                    {s === 'prop' && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Тип</Label>
                          <ToggleGroup
                            type="single"
                            value={params.oneProportion ? 'one' : 'two'}
                            onValueChange={(v) => v && set('oneProportion', v === 'one')}
                            className="justify-start"
                          >
                            <ToggleGroupItem value="two">две пропорции</ToggleGroupItem>
                            <ToggleGroupItem value="one">одна (vs 0.5)</ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                        <NumField id="p1" label="p₁" value={params.p1} min={0.01} max={0.99} step={0.01} onChange={(v) => set('p1', v)} />
                        {!params.oneProportion && (
                          <NumField id="p2" label="p₂" value={params.p2 ?? 0.5} min={0.01} max={0.99} step={0.01} onChange={(v) => set('p2', v)} />
                        )}
                      </>
                    )}

                    {s === 'anova' && (
                      <>
                        <NumField id="f" label="f (Cohen)" value={params.f} min={0.05} max={1} step={0.01} onChange={(v) => set('f', v)} hint="0.1 / 0.25 / 0.4" />
                        <NumField id="k" label="число групп k" value={params.k} min={2} max={10} step={1} onChange={(v) => set('k', v)} />
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* REPORT */}
                <Card className="border-2 border-foreground">
                  <CardHeader className="border-b-2 border-foreground bg-muted/30">
                    <CardTitle className="font-mono text-sm flex items-center justify-between">
                      <span>SAMPLE_SIZE_REPORT.txt</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadTxt(`sample_size_${s}.txt`, reportText)}
                        >
                          <Download className="w-4 h-4 mr-1" /> .txt
                        </Button>
                        {user ? (
                          <Button size="sm" onClick={handleSave}>
                            <Save className="w-4 h-4 mr-1" /> Сохранить
                          </Button>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="secondary" asChild>
                                <Link to="/auth">
                                  <Save className="w-4 h-4 mr-1" /> Войти
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Войдите, чтобы сохранять расчёты</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <pre className="font-mono text-sm leading-relaxed p-6 whitespace-pre-wrap overflow-x-auto bg-card">
{reportText}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              {/* CHART */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Кривая мощности</CardTitle>
                  <CardDescription>
                    Мощность как функция n при текущих параметрах. Пунктир — целевой уровень {params.power.toFixed(2)}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PowerCurve scenario={s} params={params} currentN={result.n} targetPower={params.power} />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* HELP BLOCK */}
        <Card className="mt-8 bg-muted/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" aria-hidden="true" />
              Что такое мощность 0.8?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <p>
              <strong>Мощность (statistical power)</strong> — вероятность обнаружить эффект, если он
              действительно существует. Мощность 0.8 означает, что в 80% случаев исследование с
              таким объёмом выборки правильно отвергнет нулевую гипотезу.
            </p>
            <p className="text-muted-foreground">
              Cohen (1988) рекомендовал 0.80 как разумный компромисс: ниже — слишком много ложно
              отрицательных результатов (ошибок II рода, β), выше — резко растут затраты.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/labs/hypothesis">
                <BookOpen className="w-4 h-4 mr-1" /> Подробнее в лабораторной по гипотезам
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const SampleSizePageWithProviders = () => (
  <TooltipProvider>
    <SampleSizePage />
  </TooltipProvider>
);

export default SampleSizePageWithProviders;
