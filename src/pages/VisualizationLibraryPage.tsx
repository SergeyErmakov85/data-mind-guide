import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, BarChart3, TrendingUp, Sigma, Activity, GitBranch } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  BentoTile,
  DifficultyFilter,
  sortByDifficulty,
  tileGridMotion,
  type Difficulty,
} from '@/components/BentoTile';

const normalPDF = (x: number, mu: number, sigma: number) => {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
};

const tPDF = (x: number, df: number) => {
  const num = gamma((df + 1) / 2);
  const den = Math.sqrt(df * Math.PI) * gamma(df / 2);
  return (num / den) * Math.pow(1 + (x * x) / df, -(df + 1) / 2);
};

// Stirling's approximation for gamma
const gamma = (z: number): number => {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  z -= 1;
  const g = 7;
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
};

const chiSquaredPDF = (x: number, k: number) => {
  if (x <= 0) return 0;
  return (Math.pow(x, k / 2 - 1) * Math.exp(-x / 2)) / (Math.pow(2, k / 2) * gamma(k / 2));
};

const fPDF = (x: number, d1: number, d2: number) => {
  if (x <= 0) return 0;
  const num = Math.pow(d1 * x / (d1 * x + d2), d1 / 2) * Math.pow(d2 / (d1 * x + d2), d2 / 2);
  const den = x * betaFn(d1 / 2, d2 / 2);
  return num / den;
};

const betaFn = (a: number, b: number) => gamma(a) * gamma(b) / gamma(a + b);

interface DistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  difficulty: Difficulty;
  indexLabel: string;
  badges: string[];
  tabValue: string;
}

const distItems: DistItem[] = [
  { id: 'normal', title: 'Нормальное N(μ, σ²)', description: 'Симметричный «колокол» — основа большинства параметрических методов и описания психологических признаков.', icon: BarChart3, difficulty: 'beginner', indexLabel: 'NORMAL', badges: ['μ, σ', '68/95'], tabValue: 'normal' },
  { id: 't', title: 't Стьюдента', description: 'Тяжёлые хвосты при малых df. Используется в t-тестах для сравнения средних.', icon: Activity, difficulty: 'intermediate', indexLabel: 'STUDENT', badges: ['df', 't-test'], tabValue: 't' },
  { id: 'chi', title: 'χ² (хи-квадрат)', description: 'Правосторонняя асимметрия. Применяется для категориальных данных и таблиц сопряжённости.', icon: Sigma, difficulty: 'intermediate', indexLabel: 'CHI-SQ', badges: ['k', 'категории'], tabValue: 'chi' },
  { id: 'f', title: 'F Фишера', description: 'Отношение дисперсий. Лежит в основе ANOVA и сравнения двух выборочных дисперсий.', icon: GitBranch, difficulty: 'advanced', indexLabel: 'FISHER', badges: ['d₁, d₂', 'ANOVA'], tabValue: 'f' },
];

const DistributionsBento = () => {
  const [filter, setFilter] = useState<Difficulty | 'all'>('all');
  const sorted = sortByDifficulty(distItems);
  const visible = filter === 'all' ? sorted : sorted.filter((d) => d.difficulty === filter);

  const counts = {
    all: distItems.length,
    beginner: distItems.filter((d) => d.difficulty === 'beginner').length,
    intermediate: distItems.filter((d) => d.difficulty === 'intermediate').length,
    advanced: distItems.filter((d) => d.difficulty === 'advanced').length,
  };

  const onJump = (tabValue: string) => {
    const triggers = document.querySelectorAll<HTMLButtonElement>('#dist-tabs [role="tab"]');
    const idx = ['normal', 't', 'chi', 'f'].indexOf(tabValue);
    triggers[idx]?.click();
    setTimeout(() => {
      document.getElementById('dist-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div className="mb-10">
      <DifficultyFilter value={filter} onChange={setFilter} counts={counts} />
      <motion.div
        key={filter}
        className="grid grid-cols-1 md:grid-cols-12 auto-rows-fr gap-5"
        initial="hidden"
        animate="visible"
        variants={tileGridMotion}
      >
        {visible.map((d, i) => (
          <div
            key={d.id}
            onClick={() => onJump(d.tabValue)}
            className="contents cursor-pointer"
          >
            <BentoTile
              index={i}
              difficulty={d.difficulty}
              badges={d.badges}
              title={d.title}
              description={d.description}
              indexLabel={d.indexLabel}
              icon={d.icon}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const VisualizationLibraryPage = () => {
  // Normal params
  const [nMu, setNMu] = useState(0);
  const [nSigma, setNSigma] = useState(1);
  // t params
  const [tDf, setTDf] = useState(5);
  // Chi-squared params
  const [chiK, setChiK] = useState(4);
  // F params
  const [fD1, setFD1] = useState(5);
  const [fD2, setFD2] = useState(20);

  const normalData = useMemo(() => {
    const pts = [];
    for (let x = nMu - 4 * nSigma; x <= nMu + 4 * nSigma; x += nSigma * 0.08) {
      pts.push({ x: +x.toFixed(2), y: normalPDF(x, nMu, nSigma) });
    }
    return pts;
  }, [nMu, nSigma]);

  const tData = useMemo(() => {
    const pts = [];
    for (let x = -5; x <= 5; x += 0.1) {
      pts.push({ x: +x.toFixed(1), t: tPDF(x, tDf), normal: normalPDF(x, 0, 1) });
    }
    return pts;
  }, [tDf]);

  const chiData = useMemo(() => {
    const pts = [];
    const max = Math.max(chiK * 3, 15);
    for (let x = 0.1; x <= max; x += 0.2) {
      pts.push({ x: +x.toFixed(1), y: chiSquaredPDF(x, chiK) });
    }
    return pts;
  }, [chiK]);

  const fData = useMemo(() => {
    const pts = [];
    for (let x = 0.05; x <= 6; x += 0.05) {
      pts.push({ x: +x.toFixed(2), y: fPDF(x, fD1, fD2) });
    }
    return pts;
  }, [fD1, fD2]);

  const chartStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container py-8">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
            # Library · Распределения
          </p>
          <h1 className="font-heading uppercase tracking-tight font-bold text-4xl md:text-6xl leading-[0.95] flex items-center gap-4">
            <Eye className="w-10 h-10 md:w-12 md:h-12 text-primary shrink-0" />
            Визуальная
            <span className="text-primary">библиотека</span>
          </h1>
          <p className="font-body text-base md:text-lg text-muted-foreground max-w-2xl mt-4">
            Интерактивные графики основных статистических распределений: меняйте параметры
            и наблюдайте поведение функций плотности.
          </p>
        </div>

        {/* Bento overview of distributions */}
        <DistributionsBento />


        <Tabs id="dist-tabs" defaultValue="normal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="normal">Нормальное</TabsTrigger>
            <TabsTrigger value="t">t Стьюдента</TabsTrigger>
            <TabsTrigger value="chi">χ²</TabsTrigger>
            <TabsTrigger value="f">F Фишера</TabsTrigger>
          </TabsList>

          {/* Normal */}
          <TabsContent value="normal">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Нормальное распределение N(μ, σ²)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={normalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="x" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={chartStyle} />
                      <Area type="monotone" dataKey="y" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                      <ReferenceLine x={nMu} stroke="hsl(var(--destructive))" strokeDasharray="4 4" label={{ value: 'μ', fill: 'hsl(var(--destructive))' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Параметры</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="flex justify-between"><span>μ (среднее)</span><Badge variant="secondary">{nMu}</Badge></Label>
                    <Slider value={[nMu]} onValueChange={([v]) => setNMu(v)} min={-5} max={5} step={0.5} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex justify-between"><span>σ (ст. отклонение)</span><Badge variant="secondary">{nSigma}</Badge></Label>
                    <Slider value={[nSigma]} onValueChange={([v]) => setNSigma(v)} min={0.5} max={3} step={0.25} />
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-1">
                    <p><strong>Свойства:</strong></p>
                    <p className="text-muted-foreground">• Симметрично относительно μ</p>
                    <p className="text-muted-foreground">• 68% данных в ±1σ</p>
                    <p className="text-muted-foreground">• 95% данных в ±2σ</p>
                    <p className="text-muted-foreground">• Площадь под кривой = 1</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* t-distribution */}
          <TabsContent value="t">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Распределение Стьюдента t(df)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={tData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="x" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={chartStyle} />
                      <Area type="monotone" dataKey="normal" stroke="hsl(var(--muted-foreground))" fill="none" strokeDasharray="4 4" name="N(0,1)" />
                      <Area type="monotone" dataKey="t" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} name={`t(${tDf})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-muted-foreground mt-2 text-center">Пунктир — стандартное нормальное для сравнения</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Параметры</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="flex justify-between"><span>df (степени свободы)</span><Badge variant="secondary">{tDf}</Badge></Label>
                    <Slider value={[tDf]} onValueChange={([v]) => setTDf(v)} min={1} max={30} step={1} />
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-1">
                    <p><strong>Применение:</strong></p>
                    <p className="text-muted-foreground">• t-тесты (df = n − 1)</p>
                    <p className="text-muted-foreground">• Тяжёлые хвосты при малых df</p>
                    <p className="text-muted-foreground">• При df → ∞ сходится к N(0,1)</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Chi-squared */}
          <TabsContent value="chi">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Распределение χ²(k)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={chiData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="x" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={chartStyle} />
                      <Area type="monotone" dataKey="y" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Параметры</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="flex justify-between"><span>k (степени свободы)</span><Badge variant="secondary">{chiK}</Badge></Label>
                    <Slider value={[chiK]} onValueChange={([v]) => setChiK(v)} min={1} max={15} step={1} />
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-1">
                    <p><strong>Применение:</strong></p>
                    <p className="text-muted-foreground">• Тест χ² для категориальных данных</p>
                    <p className="text-muted-foreground">• E[χ²] = k, Var = 2k</p>
                    <p className="text-muted-foreground">• Правосторонняя асимметрия</p>
                    <p className="text-muted-foreground">• При k↑ приближается к нормальному</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* F-distribution */}
          <TabsContent value="f">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Распределение Фишера F(d₁, d₂)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={fData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="x" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={chartStyle} />
                      <Area type="monotone" dataKey="y" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Параметры</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="flex justify-between"><span>d₁ (df числитель)</span><Badge variant="secondary">{fD1}</Badge></Label>
                    <Slider value={[fD1]} onValueChange={([v]) => setFD1(v)} min={1} max={20} step={1} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex justify-between"><span>d₂ (df знаменатель)</span><Badge variant="secondary">{fD2}</Badge></Label>
                    <Slider value={[fD2]} onValueChange={([v]) => setFD2(v)} min={1} max={50} step={1} />
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-1">
                    <p><strong>Применение:</strong></p>
                    <p className="text-muted-foreground">• ANOVA (d₁ = k−1, d₂ = N−k)</p>
                    <p className="text-muted-foreground">• Сравнение дисперсий</p>
                    <p className="text-muted-foreground">• F = MS_between / MS_within</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default VisualizationLibraryPage;
