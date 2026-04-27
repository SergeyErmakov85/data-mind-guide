import { useState, useMemo, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Calculator, RefreshCw, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { DatasetHandoffBanner } from '@/components/DatasetHandoffBanner';

const calculateStats = (data: number[]) => {
  if (data.length === 0) return null;
  
  const n = data.length;
  const sorted = [...data].sort((a, b) => a - b);
  
  // Mean
  const mean = data.reduce((a, b) => a + b, 0) / n;
  
  // Median
  const median = n % 2 === 0 
    ? (sorted[n/2 - 1] + sorted[n/2]) / 2 
    : sorted[Math.floor(n/2)];
  
  // Mode
  const frequency: Record<number, number> = {};
  data.forEach(val => frequency[val] = (frequency[val] || 0) + 1);
  const maxFreq = Math.max(...Object.values(frequency));
  const modes = Object.entries(frequency)
    .filter(([, freq]) => freq === maxFreq)
    .map(([val]) => parseFloat(val));
  const mode = modes.length === n ? 'Нет' : modes.join(', ');
  
  // Variance and SD
  const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
  const sd = Math.sqrt(variance);
  
  // Standard Error
  const se = sd / Math.sqrt(n);
  
  // Min, Max, Range
  const min = sorted[0];
  const max = sorted[n - 1];
  const range = max - min;
  
  // Quartiles
  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  
  // Skewness
  const skewness = data.reduce((acc, val) => acc + Math.pow((val - mean) / sd, 3), 0) / n;
  
  // Kurtosis
  const kurtosis = data.reduce((acc, val) => acc + Math.pow((val - mean) / sd, 4), 0) / n - 3;
  
  // Coefficient of variation
  const cv = (sd / mean) * 100;
  
  // 95% CI for mean
  const ci95 = 1.96 * se;
  
  return {
    n,
    mean: mean.toFixed(2),
    median: median.toFixed(2),
    mode,
    variance: variance.toFixed(2),
    sd: sd.toFixed(2),
    se: se.toFixed(2),
    min: min.toFixed(2),
    max: max.toFixed(2),
    range: range.toFixed(2),
    q1: q1.toFixed(2),
    q3: q3.toFixed(2),
    iqr: iqr.toFixed(2),
    skewness: skewness.toFixed(3),
    kurtosis: kurtosis.toFixed(3),
    cv: cv.toFixed(1),
    ciLower: (mean - ci95).toFixed(2),
    ciUpper: (mean + ci95).toFixed(2),
  };
};

const createHistogramData = (data: number[], bins = 10) => {
  if (data.length === 0) return [];
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / bins || 1;
  
  const histogram: { range: string; count: number; start: number }[] = [];
  
  for (let i = 0; i < bins; i++) {
    const start = min + i * binWidth;
    const end = start + binWidth;
    const count = data.filter(v => v >= start && (i === bins - 1 ? v <= end : v < end)).length;
    histogram.push({
      range: `${start.toFixed(1)}-${end.toFixed(1)}`,
      count,
      start,
    });
  }
  
  return histogram;
};

const createBoxPlotData = (data: number[]) => {
  if (data.length === 0) return null;
  
  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;
  const q1 = sorted[Math.floor(n * 0.25)];
  const median = n % 2 === 0 ? (sorted[n/2 - 1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  const min = Math.max(sorted[0], q1 - 1.5 * iqr);
  const max = Math.min(sorted[n-1], q3 + 1.5 * iqr);
  
  return { min, q1, median, q3, max };
};

const sampleData = "45, 52, 38, 61, 47, 55, 42, 59, 51, 44, 48, 63, 39, 57, 46, 53, 41, 58, 49, 56";

const DescriptiveStatsPage = () => {
  const [input, setInput] = useState(sampleData);
  const [data, setData] = useState<number[]>([]);

  const parseData = () => {
    const parsed = input
      .split(/[,\s\n]+/)
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n));
    setData(parsed);
  };

  const stats = useMemo(() => calculateStats(data), [data]);
  const histogramData = useMemo(() => createHistogramData(data), [data]);
  const boxData = useMemo(() => createBoxPlotData(data), [data]);

  const getSkewnessInterpretation = (skew: number) => {
    if (skew < -0.5) return { text: 'Левосторонняя асимметрия (длинный хвост слева)', icon: TrendingDown, color: 'text-info' };
    if (skew > 0.5) return { text: 'Правосторонняя асимметрия (длинный хвост справа)', icon: TrendingUp, color: 'text-warning' };
    return { text: 'Симметричное распределение', icon: Info, color: 'text-success' };
  };

  const getKurtosisInterpretation = (kurt: number) => {
    if (kurt < -0.5) return 'Платикуртическое (плоское, пологие хвосты)';
    if (kurt > 0.5) return 'Лептокуртическое (острое, тяжёлые хвосты)';
    return 'Мезокуртическое (близко к нормальному)';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main id="main-content" className="container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Калькулятор описательной статистики
            </h1>
            <p className="text-muted-foreground text-lg">
              Введите данные и получите полный анализ с визуализациями
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    Ввод данных
                  </CardTitle>
                  <CardDescription>
                    Введите числа через запятую, пробел или с новой строки
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Например: 45, 52, 38, 61, 47..."
                    className="min-h-[120px] font-mono"
                  />
                  <div className="flex gap-3">
                    <Button onClick={parseData} className="flex-1 gap-2">
                      <Calculator className="w-4 h-4" />
                      Рассчитать
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => { setInput(sampleData); setData([]); }}
                      className="gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Сбросить
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {stats && (
                <Card>
                  <CardHeader>
                    <CardTitle>Результаты анализа</CardTitle>
                    <CardDescription>n = {stats.n} наблюдений</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Central tendency */}
                    <div>
                      <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">Меры центра</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-primary/5 rounded-lg text-center">
                          <div className="text-2xl font-bold text-primary">{stats.mean}</div>
                          <div className="text-sm text-muted-foreground">Среднее (M)</div>
                        </div>
                        <div className="p-4 bg-info/5 rounded-lg text-center">
                          <div className="text-2xl font-bold text-info">{stats.median}</div>
                          <div className="text-sm text-muted-foreground">Медиана</div>
                        </div>
                        <div className="p-4 bg-success/5 rounded-lg text-center">
                          <div className="text-2xl font-bold text-success">{stats.mode}</div>
                          <div className="text-sm text-muted-foreground">Мода</div>
                        </div>
                      </div>
                    </div>

                    {/* Spread */}
                    <div>
                      <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">Меры разброса</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <div className="text-xl font-bold">{stats.sd}</div>
                          <div className="text-sm text-muted-foreground">Ст. отклонение (SD)</div>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <div className="text-xl font-bold">{stats.se}</div>
                          <div className="text-sm text-muted-foreground">Ст. ошибка (SE)</div>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <div className="text-xl font-bold">{stats.iqr}</div>
                          <div className="text-sm text-muted-foreground">Интерквартильный размах</div>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <div className="text-xl font-bold">{stats.cv}%</div>
                          <div className="text-sm text-muted-foreground">Коэфф. вариации</div>
                        </div>
                      </div>
                    </div>

                    {/* Range */}
                    <div className="flex justify-between text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                      <span>Min: {stats.min}</span>
                      <span>Q1: {stats.q1}</span>
                      <span>Q3: {stats.q3}</span>
                      <span>Max: {stats.max}</span>
                    </div>

                    {/* 95% CI */}
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <h5 className="font-medium mb-2">95% доверительный интервал для среднего</h5>
                      <p className="text-lg font-bold text-primary">
                        [{stats.ciLower}; {stats.ciUpper}]
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        С вероятностью 95% истинное среднее находится в этом интервале
                      </p>
                    </div>

                    {/* Shape */}
                    <div>
                      <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">Форма распределения</h4>
                      {(() => {
                        const skew = getSkewnessInterpretation(parseFloat(stats.skewness));
                        return (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-muted/30 rounded-lg">
                                <div className="text-xl font-bold">{stats.skewness}</div>
                                <div className="text-sm text-muted-foreground">Асимметрия</div>
                              </div>
                              <div className="p-4 bg-muted/30 rounded-lg">
                                <div className="text-xl font-bold">{stats.kurtosis}</div>
                                <div className="text-sm text-muted-foreground">Эксцесс</div>
                              </div>
                            </div>
                            <div className={`p-3 rounded-lg flex items-center gap-2 ${skew.color} bg-current/10`}>
                              <skew.icon className="w-4 h-4" />
                              <span className="text-foreground text-sm">{skew.text}</span>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">
                              {getKurtosisInterpretation(parseFloat(stats.kurtosis))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Visualization Section */}
            <div className="space-y-6">
              {stats && histogramData.length > 0 && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Гистограмма</CardTitle>
                      <CardDescription>Распределение частот по интервалам</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={histogramData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis 
                              dataKey="range" 
                              tick={{ fontSize: 10 }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar 
                              dataKey="count" 
                              fill="hsl(var(--primary))" 
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {boxData && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Пятиточечная сводка</CardTitle>
                        <CardDescription>Визуализация квартилей</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="relative h-16 bg-muted/30 rounded-lg overflow-hidden">
                          {/* Box */}
                          <div 
                            className="absolute h-full bg-primary/20 border-2 border-primary"
                            style={{
                              left: `${((boxData.q1 - boxData.min) / (boxData.max - boxData.min)) * 100}%`,
                              width: `${((boxData.q3 - boxData.q1) / (boxData.max - boxData.min)) * 100}%`,
                            }}
                          >
                            {/* Median line */}
                            <div 
                              className="absolute w-0.5 h-full bg-primary"
                              style={{
                                left: `${((boxData.median - boxData.q1) / (boxData.q3 - boxData.q1)) * 100}%`,
                              }}
                            />
                          </div>
                          {/* Whiskers */}
                          <div className="absolute top-1/2 h-0.5 bg-primary -translate-y-1/2" style={{ left: 0, width: `${((boxData.q1 - boxData.min) / (boxData.max - boxData.min)) * 100}%` }} />
                          <div className="absolute top-1/2 h-0.5 bg-primary -translate-y-1/2" style={{ right: 0, width: `${((boxData.max - boxData.q3) / (boxData.max - boxData.min)) * 100}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>{boxData.min.toFixed(1)}</span>
                          <span>Q1: {boxData.q1.toFixed(1)}</span>
                          <span>Me: {boxData.median.toFixed(1)}</span>
                          <span>Q3: {boxData.q3.toFixed(1)}</span>
                          <span>{boxData.max.toFixed(1)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Распределение данных</CardTitle>
                      <CardDescription>Значения в порядке ввода</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data.map((value, index) => ({ index: index + 1, value }))}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="index" />
                            <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke="hsl(var(--accent))" 
                              fill="hsl(var(--accent))"
                              fillOpacity={0.2}
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {!stats && (
                <Card className="h-full flex items-center justify-center min-h-[400px]">
                  <CardContent className="text-center text-muted-foreground">
                    <Calculator className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Введите данные и нажмите «Рассчитать»</p>
                    <p className="text-sm mt-2">для отображения результатов и графиков</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DescriptiveStatsPage;
