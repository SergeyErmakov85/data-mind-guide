import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Info } from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

interface DataPoint {
  x: number;
  y: number;
  predicted: number;
  residual: number;
}

interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  standardError: number;
  slopeError: number;
  interceptError: number;
}

const LinearRegressionLab: React.FC = () => {
  const [sampleSize, setSampleSize] = useState(30);
  const [noiseLevel, setNoiseLevel] = useState(2);
  const [trueSlope, setTrueSlope] = useState(1.5);
  const [trueIntercept, setTrueIntercept] = useState(2);
  const [data, setData] = useState<DataPoint[]>([]);
  const [regression, setRegression] = useState<RegressionResult | null>(null);
  const [showConfidenceBand, setShowConfidenceBand] = useState(true);
  const [showResiduals, setShowResiduals] = useState(true);

  // Generate random data with noise
  const generateData = useCallback(() => {
    const points: DataPoint[] = [];
    
    for (let i = 0; i < sampleSize; i++) {
      const x = Math.random() * 10;
      const noise = (Math.random() - 0.5) * 2 * noiseLevel;
      const y = trueIntercept + trueSlope * x + noise;
      points.push({ x, y, predicted: 0, residual: 0 });
    }
    
    // Calculate regression
    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);
    
    const meanX = sumX / n;
    const meanY = sumY / n;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = meanY - slope * meanX;
    
    // Calculate predicted values and residuals
    points.forEach(p => {
      p.predicted = intercept + slope * p.x;
      p.residual = p.y - p.predicted;
    });
    
    // Calculate R-squared
    const ssTotal = points.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0);
    const ssResidual = points.reduce((sum, p) => sum + Math.pow(p.residual, 2), 0);
    const rSquared = 1 - ssResidual / ssTotal;
    
    // Calculate standard errors
    const mse = ssResidual / (n - 2);
    const standardError = Math.sqrt(mse);
    const sxx = points.reduce((sum, p) => sum + Math.pow(p.x - meanX, 2), 0);
    const slopeError = Math.sqrt(mse / sxx);
    const interceptError = Math.sqrt(mse * (1/n + meanX * meanX / sxx));
    
    setData(points);
    setRegression({
      slope,
      intercept,
      rSquared,
      standardError,
      slopeError,
      interceptError,
    });
  }, [sampleSize, noiseLevel, trueSlope, trueIntercept]);

  // Generate confidence band data
  const confidenceBandData = useMemo(() => {
    if (!regression || data.length === 0) return [];
    
    const n = data.length;
    const meanX = data.reduce((sum, p) => sum + p.x, 0) / n;
    const sxx = data.reduce((sum, p) => sum + Math.pow(p.x - meanX, 2), 0);
    const tValue = 2.0; // Approximate t-value for 95% CI
    
    const points = [];
    for (let x = 0; x <= 10; x += 0.2) {
      const predicted = regression.intercept + regression.slope * x;
      const seY = regression.standardError * Math.sqrt(1/n + Math.pow(x - meanX, 2) / sxx);
      const margin = tValue * seY;
      
      points.push({
        x,
        predicted,
        upper: predicted + margin,
        lower: predicted - margin,
      });
    }
    
    return points;
  }, [regression, data]);

  // Regression line data for chart
  const regressionLineData = useMemo(() => {
    if (!regression) return [];
    return [
      { x: 0, y: regression.intercept },
      { x: 10, y: regression.intercept + regression.slope * 10 },
    ];
  }, [regression]);

  // True line data
  const trueLineData = useMemo(() => [
    { x: 0, y: trueIntercept },
    { x: 10, y: trueIntercept + trueSlope * 10 },
  ], [trueSlope, trueIntercept]);

  // Residuals histogram data
  const residualsHistogram = useMemo(() => {
    if (data.length === 0) return [];
    
    const bins = 10;
    const residuals = data.map(p => p.residual);
    const min = Math.min(...residuals);
    const max = Math.max(...residuals);
    const binWidth = (max - min) / bins || 1;
    
    const histogram = Array.from({ length: bins }, (_, i) => ({
      binStart: min + i * binWidth,
      binEnd: min + (i + 1) * binWidth,
      count: 0,
      binCenter: min + (i + 0.5) * binWidth,
    }));
    
    residuals.forEach(r => {
      let binIndex = Math.floor((r - min) / binWidth);
      if (binIndex >= bins) binIndex = bins - 1;
      if (binIndex < 0) binIndex = 0;
      histogram[binIndex].count++;
    });
    
    return histogram;
  }, [data]);

  const reset = () => {
    setData([]);
    setRegression(null);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Параметры модели
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <Label className="flex justify-between">
                <span>Размер выборки (n)</span>
                <Badge variant="secondary">{sampleSize}</Badge>
              </Label>
              <Slider
                value={[sampleSize]}
                onValueChange={([v]) => setSampleSize(v)}
                min={10}
                max={100}
                step={5}
              />
            </div>
            
            <div className="space-y-3">
              <Label className="flex justify-between">
                <span>Уровень шума (σ)</span>
                <Badge variant="secondary">{noiseLevel.toFixed(1)}</Badge>
              </Label>
              <Slider
                value={[noiseLevel]}
                onValueChange={([v]) => setNoiseLevel(v)}
                min={0.5}
                max={5}
                step={0.5}
              />
            </div>
            
            <div className="space-y-3">
              <Label className="flex justify-between">
                <span>Истинный наклон (β₁)</span>
                <Badge variant="secondary">{trueSlope.toFixed(1)}</Badge>
              </Label>
              <Slider
                value={[trueSlope]}
                onValueChange={([v]) => setTrueSlope(v)}
                min={-3}
                max={3}
                step={0.1}
              />
            </div>
            
            <div className="space-y-3">
              <Label className="flex justify-between">
                <span>Истинный сдвиг (β₀)</span>
                <Badge variant="secondary">{trueIntercept.toFixed(1)}</Badge>
              </Label>
              <Slider
                value={[trueIntercept]}
                onValueChange={([v]) => setTrueIntercept(v)}
                min={-5}
                max={10}
                step={0.5}
              />
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <Button onClick={generateData} className="gap-2">
              <Play className="w-4 h-4" />
              Сгенерировать данные
            </Button>
            <Button variant="outline" onClick={reset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Сбросить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main visualization */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Scatter plot with regression */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Scatter Plot с регрессионной линией</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showConfidenceBand}
                  onChange={(e) => setShowConfidenceBand(e.target.checked)}
                  className="rounded border-input"
                />
                Доверительная полоса
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showResiduals}
                  onChange={(e) => setShowResiduals(e.target.checked)}
                  className="rounded border-input"
                />
                Показать остатки
              </label>
            </div>
            
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="x" 
                  type="number" 
                  domain={[0, 10]} 
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: 'X', position: 'bottom', offset: 0 }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: 'Y', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    value.toFixed(3),
                    name === 'y' ? 'Наблюдаемое' : name === 'predicted' ? 'Предсказанное' : name
                  ]}
                />
                
                {/* Confidence band */}
                {showConfidenceBand && confidenceBandData.length > 0 && (
                  <>
                    <Line
                      data={confidenceBandData}
                      dataKey="upper"
                      stroke="hsl(var(--primary))"
                      strokeDasharray="4 4"
                      strokeOpacity={0.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      data={confidenceBandData}
                      dataKey="lower"
                      stroke="hsl(var(--primary))"
                      strokeDasharray="4 4"
                      strokeOpacity={0.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </>
                )}
                
                {/* True line */}
                <Line
                  data={trueLineData}
                  dataKey="y"
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="8 4"
                  strokeWidth={2}
                  dot={false}
                  name="Истинная линия"
                  isAnimationActive={false}
                />
                
                {/* Regression line */}
                {regression && (
                  <Line
                    data={regressionLineData}
                    dataKey="y"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    name="Регрессия"
                    isAnimationActive={false}
                  />
                )}
                
                {/* Residual lines */}
                {showResiduals && data.map((point, i) => (
                  <ReferenceLine
                    key={`residual-${i}`}
                    segment={[
                      { x: point.x, y: point.y },
                      { x: point.x, y: point.predicted }
                    ]}
                    stroke={point.residual > 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                    strokeWidth={1}
                    strokeOpacity={0.6}
                  />
                ))}
                
                {/* Data points */}
                <Scatter
                  data={data}
                  fill="hsl(var(--primary))"
                  name="Данные"
                />
              </ComposedChart>
            </ResponsiveContainer>
            
            <div className="flex gap-6 mt-4 text-sm text-muted-foreground justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-muted-foreground" style={{ borderTop: '2px dashed' }} />
                <span>Истинная линия</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-primary" />
                <span>Регрессия</span>
              </div>
              {showResiduals && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-success" />
                    <span>+ остаток</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-destructive" />
                    <span>− остаток</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics panel */}
        <Card>
          <CardHeader>
            <CardTitle>Результаты регрессии</CardTitle>
          </CardHeader>
          <CardContent>
            {regression ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Уравнение</h4>
                  <p className="font-mono text-lg">
                    ŷ = {regression.intercept.toFixed(3)} + {regression.slope.toFixed(3)}x
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">
                      {(regression.rSquared * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">R²</div>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg text-center">
                    <div className="text-2xl font-bold">
                      {regression.standardError.toFixed(3)}
                    </div>
                    <div className="text-xs text-muted-foreground">SE</div>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Наклон (β̂₁)</span>
                    <span className="font-mono">
                      {regression.slope.toFixed(3)} ± {regression.slopeError.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Сдвиг (β̂₀)</span>
                    <span className="font-mono">
                      {regression.intercept.toFixed(3)} ± {regression.interceptError.toFixed(3)}
                    </span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Истинный β₁</span>
                    <span className="font-mono">{trueSlope.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Истинный β₀</span>
                    <span className="font-mono">{trueIntercept.toFixed(3)}</span>
                  </div>
                </div>
                
                <div className="p-3 bg-muted/30 rounded-lg text-sm">
                  <p className="text-muted-foreground">
                    <strong>Интерпретация:</strong> При увеличении X на 1 единицу, 
                    Y изменяется в среднем на {regression.slope.toFixed(2)} единиц.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p className="text-center">
                  Нажмите "Сгенерировать данные"<br />
                  для расчёта регрессии
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Residuals analysis */}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Анализ остатков</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="scatter">
              <TabsList>
                <TabsTrigger value="scatter">Остатки vs X</TabsTrigger>
                <TabsTrigger value="histogram">Распределение остатков</TabsTrigger>
                <TabsTrigger value="qq">Q-Q Plot</TabsTrigger>
              </TabsList>
              
              <TabsContent value="scatter" className="mt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="x" 
                      type="number"
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: 'X', position: 'bottom', offset: 0 }}
                    />
                    <YAxis 
                      dataKey="residual"
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: 'Остаток', angle: -90, position: 'insideLeft' }}
                    />
                    <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Scatter data={data} fill="hsl(var(--primary))">
                      {data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.residual > 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Остатки должны быть случайно разбросаны вокруг нуля без видимого паттерна
                </p>
              </TabsContent>
              
              <TabsContent value="histogram" className="mt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={residualsHistogram} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="binCenter" 
                      tickFormatter={(v) => v.toFixed(1)}
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: 'Остаток', position: 'bottom', offset: 0 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: 'Частота', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                      {residualsHistogram.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.binCenter > 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                          fillOpacity={0.8}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Распределение остатков должно быть примерно нормальным и симметричным
                </p>
              </TabsContent>
              
              <TabsContent value="qq" className="mt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number"
                      domain={[-3, 3]}
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: 'Теоретические квантили', position: 'bottom', offset: 0 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: 'Наблюдаемые квантили', angle: -90, position: 'insideLeft' }}
                    />
                    <ReferenceLine 
                      segment={[{ x: -3, y: -3 * (regression?.standardError || 1) }, { x: 3, y: 3 * (regression?.standardError || 1) }]}
                      stroke="hsl(var(--muted-foreground))" 
                      strokeDasharray="4 4" 
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Scatter 
                      data={data
                        .map(p => p.residual)
                        .sort((a, b) => a - b)
                        .map((r, i, arr) => ({
                          theoretical: normalQuantile((i + 0.5) / arr.length),
                          observed: r,
                        }))
                      }
                      dataKey="observed"
                      fill="hsl(var(--primary))"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Точки должны лежать близко к диагональной линии для нормально распределённых остатков
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Educational notes */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">📊 R² (коэффициент детерминации)</h4>
              <p className="text-muted-foreground">
                Показывает долю дисперсии Y, объяснённую моделью. 
                R² = 1 означает идеальную подгонку, R² = 0 — модель не лучше среднего.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">📏 Стандартная ошибка</h4>
              <p className="text-muted-foreground">
                Типичное отклонение наблюдаемых значений от регрессионной линии. 
                Меньше SE — точнее предсказания.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎯 Анализ остатков</h4>
              <p className="text-muted-foreground">
                Проверяет допущения модели: остатки должны быть независимыми, 
                нормально распределёнными с постоянной дисперсией.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function for normal quantile (inverse CDF approximation)
function normalQuantile(p: number): number {
  // Approximation using Abramowitz and Stegun
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;
  
  const a = [
    -3.969683028665376e+01,
    2.209460984245205e+02,
    -2.759285104469687e+02,
    1.383577518672690e+02,
    -3.066479806614716e+01,
    2.506628277459239e+00
  ];
  const b = [
    -5.447609879822406e+01,
    1.615858368580409e+02,
    -1.556989798598866e+02,
    6.680131188771972e+01,
    -1.328068155288572e+01
  ];
  const c = [
    -7.784894002430293e-03,
    -3.223964580411365e-01,
    -2.400758277161838e+00,
    -2.549732539343734e+00,
    4.374664141464968e+00,
    2.938163982698783e+00
  ];
  const d = [
    7.784695709041462e-03,
    3.224671290700398e-01,
    2.445134137142996e+00,
    3.754408661907416e+00
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q, r;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
           ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
           (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
            ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
}

export default LinearRegressionLab;
