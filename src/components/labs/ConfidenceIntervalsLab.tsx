import { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { generateSample, mean, standardError, confidenceInterval } from '@/lib/statistics';

// True population mean
const TRUE_MEAN = 50;
const TRUE_SD = 10;

interface CIResult {
  id: number;
  mean: number;
  lower: number;
  upper: number;
  containsTrue: boolean;
}

export const ConfidenceIntervalsLab = () => {
  const [sampleSize, setSampleSize] = useState(30);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [intervals, setIntervals] = useState<CIResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(200);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const idCounter = useRef(0);

  // Z-scores for different confidence levels
  const zScores: Record<number, number> = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576,
  };

  // Generate one CI
  const generateOneCI = useCallback(() => {
    const sample = generateSample('normal', sampleSize).map(x => (x - 5) * (TRUE_SD / 1.5) + TRUE_MEAN);
    const m = mean(sample);
    const se = standardError(sample);
    const z = zScores[confidenceLevel] || 1.96;
    const margin = z * se;
    
    const newCI: CIResult = {
      id: idCounter.current++,
      mean: m,
      lower: m - margin,
      upper: m + margin,
      containsTrue: m - margin <= TRUE_MEAN && m + margin >= TRUE_MEAN,
    };
    
    setIntervals(prev => [...prev.slice(-99), newCI]); // Keep last 100
  }, [sampleSize, confidenceLevel]);

  // Auto-run effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(generateOneCI, speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, generateOneCI, speed]);

  // Reset
  const reset = () => {
    setIsRunning(false);
    setIntervals([]);
    idCounter.current = 0;
  };

  // Calculate coverage
  const coverageCount = intervals.filter(ci => ci.containsTrue).length;
  const coverageRate = intervals.length > 0 ? (coverageCount / intervals.length * 100).toFixed(1) : '—';

  // Theoretical interval width
  const theoreticalWidth = 2 * (zScores[confidenceLevel] || 1.96) * (TRUE_SD / Math.sqrt(sampleSize));

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Параметры эксперимента
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Если метод построения ДИ корректен, то при уровне доверия 95% 
                примерно 95% интервалов будут содержать истинное значение μ.
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <CardDescription>
            Генеральная совокупность: N(μ=50, σ=10)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Sample Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Размер выборки (n): <span className="font-bold text-primary">{sampleSize}</span>
              </label>
              <Slider
                value={[sampleSize]}
                onValueChange={([v]) => { setSampleSize(v); reset(); }}
                min={10}
                max={100}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Больше n → уже интервал
              </p>
            </div>

            {/* Confidence Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Уровень доверия</label>
              <Select 
                value={confidenceLevel.toString()} 
                onValueChange={(v) => { setConfidenceLevel(parseFloat(v)); reset(); }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.90">90%</SelectItem>
                  <SelectItem value="0.95">95%</SelectItem>
                  <SelectItem value="0.99">99%</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Выше уровень → шире интервал
              </p>
            </div>

            {/* Speed */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Скорость: <span className="font-bold text-primary">{(1000 / speed).toFixed(1)}/сек</span>
              </label>
              <Slider
                value={[speed]}
                onValueChange={([v]) => setSpeed(v)}
                min={50}
                max={500}
                step={50}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              variant={isRunning ? 'secondary' : 'default'}
              className="gap-2"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Пауза' : 'Запустить'}
            </Button>
            <Button onClick={generateOneCI} variant="outline" disabled={isRunning}>
              +1 интервал
            </Button>
            <Button onClick={reset} variant="ghost" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Сброс
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Всего интервалов</p>
            <p className="text-3xl font-bold">{intervals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Покрывают μ</p>
            <p className="text-3xl font-bold text-success">{coverageCount}</p>
          </CardContent>
        </Card>
        <Card className={intervals.length > 20 ? (
          Math.abs(parseFloat(coverageRate) - confidenceLevel * 100) < 5 
            ? 'border-success/50' 
            : 'border-warning/50'
        ) : ''}>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Доля покрытия</p>
            <p className="text-3xl font-bold text-primary">{coverageRate}%</p>
            <p className="text-xs text-muted-foreground">Ожид.: {(confidenceLevel * 100).toFixed(0)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Ширина ДИ (теор.)</p>
            <p className="text-3xl font-bold">{theoreticalWidth.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Визуализация доверительных интервалов</CardTitle>
          <CardDescription>
            Красная линия — истинное μ=50. Зелёные интервалы покрывают μ, красные — нет.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-[400px] overflow-hidden border rounded-lg bg-muted/20">
            {/* True mean line */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10"
              style={{ left: '50%' }}
            />
            
            {/* Intervals */}
            <div className="absolute inset-0 overflow-y-auto p-4">
              <div className="relative" style={{ minWidth: '100%' }}>
                {intervals.slice(-50).map((ci, index) => {
                  // Scale: center is 50, show range 30-70
                  const rangeMin = 30;
                  const rangeMax = 70;
                  const scale = 100 / (rangeMax - rangeMin);
                  
                  const leftPercent = (ci.lower - rangeMin) * scale;
                  const widthPercent = (ci.upper - ci.lower) * scale;
                  const meanPercent = (ci.mean - rangeMin) * scale;
                  
                  return (
                    <div 
                      key={ci.id}
                      className="relative h-6 mb-1"
                    >
                      {/* Interval bar */}
                      <div
                        className={`absolute h-2 top-2 rounded-full transition-all ${
                          ci.containsTrue 
                            ? 'bg-success/60' 
                            : 'bg-destructive/60'
                        }`}
                        style={{ 
                          left: `${Math.max(0, leftPercent)}%`, 
                          width: `${Math.min(100 - leftPercent, widthPercent)}%` 
                        }}
                      />
                      {/* Mean point */}
                      <div
                        className={`absolute w-2 h-2 top-2 rounded-full ${
                          ci.containsTrue 
                            ? 'bg-success' 
                            : 'bg-destructive'
                        }`}
                        style={{ left: `${meanPercent}%`, transform: 'translateX(-50%)' }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scale labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 py-1 bg-background/80 text-xs text-muted-foreground">
              <span>30</span>
              <span>40</span>
              <span className="font-bold text-destructive">μ=50</span>
              <span>60</span>
              <span>70</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Explanation */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2 text-primary">Что такое ДИ?</h4>
              <p className="text-muted-foreground">
                Доверительный интервал — диапазон значений, который с заданной 
                вероятностью содержит истинный параметр популяции.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-primary">Частотная интерпретация</h4>
              <p className="text-muted-foreground">
                При многократном повторении эксперимента {(confidenceLevel * 100).toFixed(0)}% 
                построенных интервалов будут содержать истинное μ.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-primary">Попробуйте</h4>
              <p className="text-muted-foreground">
                Сравните 90% и 99% ДИ: более высокий уровень = шире интервал = 
                больше покрытие, но меньше точность.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
