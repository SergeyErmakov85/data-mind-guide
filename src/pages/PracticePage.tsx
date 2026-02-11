import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileSpreadsheet, BarChart3, Calculator, Download, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import Papa from 'papaparse';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

interface DataRow {
  [key: string]: string | number;
}

const PracticePage = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState<string>('');

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          setError('Файл пуст или имеет неверный формат');
          return;
        }
        
        const parsedData = results.data as DataRow[];
        const cols = Object.keys(parsedData[0] || {});
        
        setData(parsedData);
        setColumns(cols);
        setSelectedColumn(cols[0] || '');
      },
      error: (err) => {
        setError(`Ошибка при чтении файла: ${err.message}`);
      }
    });
  }, []);

  const handleManualInput = () => {
    setError('');
    
    try {
      const rows = manualInput.trim().split('\n');
      if (rows.length < 2) {
        setError('Введите заголовки и хотя бы одну строку данных');
        return;
      }
      
      const headers = rows[0].split(/[,;\t]/).map(h => h.trim());
      const parsedData: DataRow[] = [];
      
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(/[,;\t]/).map(v => v.trim());
        const row: DataRow = {};
        headers.forEach((header, idx) => {
          const val = values[idx];
          row[header] = isNaN(Number(val)) ? val : Number(val);
        });
        parsedData.push(row);
      }
      
      setData(parsedData);
      setColumns(headers);
      setSelectedColumn(headers[0] || '');
    } catch {
      setError('Ошибка при парсинге данных');
    }
  };

  const getNumericData = (column: string): number[] => {
    return data
      .map(row => Number(row[column]))
      .filter(n => !isNaN(n));
  };

  const calculateColumnStats = (column: string) => {
    const values = getNumericData(column);
    if (values.length === 0) return null;
    
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const sorted = [...values].sort((a, b) => a - b);
    const median = n % 2 === 0 
      ? (sorted[n/2 - 1] + sorted[n/2]) / 2 
      : sorted[Math.floor(n/2)];
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    const sd = Math.sqrt(variance);
    
    return { n, mean: mean.toFixed(2), median: median.toFixed(2), sd: sd.toFixed(2), min: sorted[0].toFixed(2), max: sorted[n-1].toFixed(2) };
  };

  const stats = selectedColumn ? calculateColumnStats(selectedColumn) : null;

  const histogramData = selectedColumn ? (() => {
    const values = getNumericData(selectedColumn);
    if (values.length === 0) return [];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const bins = 8;
    const binWidth = (max - min) / bins || 1;
    
    return Array.from({ length: bins }, (_, i) => {
      const start = min + i * binWidth;
      const end = start + binWidth;
      const count = values.filter(v => v >= start && (i === bins - 1 ? v <= end : v < end)).length;
      return { range: `${start.toFixed(1)}`, count };
    });
  })() : [];

  const scatterData = columns.length >= 2 ? (() => {
    const col1 = columns[0];
    const col2 = columns[1];
    return data
      .filter(row => !isNaN(Number(row[col1])) && !isNaN(Number(row[col2])))
      .map(row => ({ x: Number(row[col1]), y: Number(row[col2]) }));
  })() : [];

  const sampleCSV = `Участник,Тревожность_до,Тревожность_после,Возраст,Пол
1,45,38,22,Ж
2,52,48,25,М
3,38,35,21,Ж
4,61,52,28,М
5,47,42,23,Ж
6,55,45,26,М
7,42,40,24,Ж
8,59,50,27,М
9,51,44,22,Ж
10,44,39,25,М`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-6xl mx-auto">
          <motion.div className="mb-8" initial="hidden" animate="visible" variants={fadeUp}>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Практика: Анализ данных
            </h1>
            <p className="text-muted-foreground text-lg">
              Загрузите свои данные в формате CSV или введите вручную для анализа
            </p>
          </motion.div>

          <motion.div className="grid lg:grid-cols-2 gap-8" initial="hidden" animate="visible" variants={stagger}>
            {/* Input Section */}
            <motion.div className="space-y-6" variants={fadeUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Загрузка данных
                  </CardTitle>
                  <CardDescription>
                    Поддерживаются файлы CSV с заголовками
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label 
                      htmlFor="file-upload" 
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <FileSpreadsheet className="w-10 h-10 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Нажмите для выбора файла CSV
                      </span>
                    </label>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">или введите вручную</span>
                    </div>
                  </div>

                  <Textarea
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Заголовок1,Заголовок2,Заголовок3&#10;значение1,значение2,значение3&#10;..."
                    className="min-h-[120px] font-mono text-sm"
                  />
                  
                  <div className="flex gap-3">
                    <Button onClick={handleManualInput} className="flex-1 gap-2">
                      <Calculator className="w-4 h-4" />
                      Загрузить данные
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setManualInput(sampleCSV)}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Пример
                    </Button>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Data Preview */}
              {data.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Предпросмотр данных</CardTitle>
                    <CardDescription>
                      Загружено {data.length} строк, {columns.length} столбцов
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            {columns.map(col => (
                              <th key={col} className="px-3 py-2 text-left font-medium">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.slice(0, 5).map((row, idx) => (
                            <tr key={idx} className="border-b border-border/50">
                              {columns.map(col => (
                                <td key={col} className="px-3 py-2 text-muted-foreground">
                                  {String(row[col])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {data.length > 5 && (
                        <p className="text-sm text-muted-foreground mt-2 text-center">
                          ... и ещё {data.length - 5} строк
                        </p>
                      )}
                    </div>

                    <div className="mt-4">
                      <label className="text-sm font-medium">Выберите столбец для анализа:</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {columns.map(col => (
                          <Button
                            key={col}
                            variant={selectedColumn === col ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedColumn(col)}
                          >
                            {col}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Results Section */}
            <motion.div className="space-y-6" variants={fadeUp}>
              {stats ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Статистика: {selectedColumn}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-primary/5 rounded-lg text-center">
                          <div className="text-2xl font-bold text-primary">{stats.n}</div>
                          <div className="text-sm text-muted-foreground">N</div>
                        </div>
                        <div className="p-4 bg-info/5 rounded-lg text-center">
                          <div className="text-2xl font-bold text-info">{stats.mean}</div>
                          <div className="text-sm text-muted-foreground">Среднее</div>
                        </div>
                        <div className="p-4 bg-success/5 rounded-lg text-center">
                          <div className="text-2xl font-bold text-success">{stats.sd}</div>
                          <div className="text-sm text-muted-foreground">SD</div>
                        </div>
                      </div>
                      <div className="flex justify-between mt-4 text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                        <span>Min: {stats.min}</span>
                        <span>Медиана: {stats.median}</span>
                        <span>Max: {stats.max}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Гистограмма</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={histogramData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                            <YAxis />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {scatterData.length > 0 && columns.length >= 2 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Диаграмма рассеяния</CardTitle>
                        <CardDescription>{columns[0]} vs {columns[1]}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis dataKey="x" name={columns[0]} tick={{ fontSize: 11 }} />
                              <YAxis dataKey="y" name={columns[1]} />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px'
                                }}
                              />
                              <Scatter data={scatterData} fill="hsl(var(--accent))" />
                            </ScatterChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="h-full flex items-center justify-center min-h-[400px]">
                  <CardContent className="text-center text-muted-foreground">
                    <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Загрузите данные для начала анализа</p>
                    <p className="text-sm mt-2">Поддерживаются CSV файлы</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PracticePage;
