import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MathFormula } from '@/components/MathFormula';
import { Quiz } from '@/components/Quiz';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowRight, BookOpen, Calculator, FlaskConical, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

/* ─── animation helpers ─── */
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

/* ─── Goodness-of-Fit example data ─── */
const gofObserved = [35, 51, 64, 50];
const gofExpectedP = [0.25, 0.25, 0.25, 0.25];
const gofTotal = gofObserved.reduce((a, b) => a + b, 0); // 200
const gofExpected = gofExpectedP.map(p => p * gofTotal);
const gofChi2 = gofObserved.reduce((sum, o, i) => sum + Math.pow(o - gofExpected[i], 2) / gofExpected[i], 0);
const gofLabels = ['Spades (♠)', 'Hearts (♥)', 'Diamonds (♦)', 'Clubs (♣)'];
const gofChartData = gofLabels.map((label, i) => ({
  label,
  observed: gofObserved[i],
  expected: gofExpected[i],
}));

/* ─── Independence example data (chapek9) ─── */
const indRows = ['Robot', 'Human'];
const indCols = ['Puppy', 'Flower', 'Data'];
const indObserved = [[13, 30, 44], [15, 13, 10]];
const indRowTotals = indObserved.map(r => r.reduce((a, b) => a + b, 0));
const indColTotals = [0, 1, 2].map(c => indObserved.reduce((s, r) => s + r[c], 0));
const indTotal = indRowTotals.reduce((a, b) => a + b, 0);
const indExpected = indObserved.map((row, r) => row.map((_, c) => (indRowTotals[r] * indColTotals[c]) / indTotal));
const indChi2 = indObserved.reduce((sum, row, r) => sum + row.reduce((s, o, c) => s + Math.pow(o - indExpected[r][c], 2) / indExpected[r][c], 0), 0);
const indCramersV = Math.sqrt(indChi2 / (indTotal * (Math.min(2, 3) - 1)));

/* ─── McNemar example ─── */
const mcnemarB = 40; // yes→no
const mcnemarC = 10; // no→yes
const mcnemarChi2 = Math.pow(Math.abs(mcnemarB - mcnemarC), 2) / (mcnemarB + mcnemarC);

/* ─── Quiz ─── */
const quizQuestions = [
  {
    id: 'chi-gof-def',
    type: 'multiple-choice' as const,
    question: 'Тест χ² на согласие (goodness-of-fit) проверяет:',
    options: ['Различие средних двух групп', 'Соответствие наблюдаемых частот ожидаемым вероятностям', 'Корреляцию двух числовых переменных', 'Разницу дисперсий'],
    correctAnswer: 1,
    explanation: 'Тест χ² на согласие сравнивает наблюдаемое распределение частот с теоретически ожидаемым (например, равные вероятности).'
  },
  {
    id: 'chi-expected',
    type: 'multiple-choice' as const,
    question: 'При расчёте ожидаемых частот в тесте независимости формула имеет вид:',
    options: ['E = (сумма строки × сумма столбца) / общая сумма', 'E = наблюдаемая частота × p', 'E = N × σ²', 'E = (O − E)² / E'],
    correctAnswer: 0,
    explanation: 'Ожидаемая частота каждой ячейки вычисляется как произведение маргинальных сумм, делённое на общее N.'
  },
  {
    id: 'chi-df',
    type: 'multiple-choice' as const,
    question: 'Количество степеней свободы для теста χ² на согласие с k категориями равно:',
    options: ['k', 'k − 1', 'k − 2', 'N − k'],
    correctAnswer: 1,
    explanation: 'df = k − 1, где k — количество категорий. Одна степень свободы теряется из-за ограничения суммы.'
  },
  {
    id: 'chi-yates',
    type: 'multiple-choice' as const,
    question: 'Поправка Йейтса (continuity correction) применяется, когда:',
    options: ['Выборка слишком большая', 'Таблица сопряжённости имеет размер 2×2 и ожидаемые частоты малы', 'Переменные являются количественными', 'Есть повторные измерения'],
    correctAnswer: 1,
    explanation: 'Поправка Йейтса уменьшает абсолютную разницу |O − E| на 0.5 для таблиц 2×2, чтобы скорректировать аппроксимацию непрерывным распределением.'
  },
  {
    id: 'chi-cramersv',
    type: 'multiple-choice' as const,
    question: 'V Крамера (Cramér\'s V) используется для оценки:',
    options: ['Мощности теста', 'Величины эффекта связи между категориальными переменными', 'p-value теста', 'Нормальности распределения'],
    correctAnswer: 1,
    explanation: 'V Крамера — мера величины эффекта для χ² теста независимости, принимает значения от 0 (нет связи) до 1 (полная связь).'
  },
  {
    id: 'chi-mcnemar',
    type: 'multiple-choice' as const,
    question: 'Тест Макнемара предназначен для:',
    options: ['Независимых выборок с номинальными данными', 'Связанных (парных) номинальных данных — повторные измерения одного признака', 'Сравнения трёх и более групп', 'Анализа порядковых шкал'],
    correctAnswer: 1,
    explanation: 'Тест Макнемара — это аналог парного t-теста для номинальных данных: он проверяет, изменились ли пропорции ответов в двух связанных измерениях.'
  },
  {
    id: 'chi-fisher',
    type: 'multiple-choice' as const,
    question: 'Когда следует использовать точный тест Фишера вместо χ²?',
    options: ['Когда выборка очень большая', 'Когда ожидаемые частоты в некоторых ячейках меньше 5', 'Когда данные нормально распределены', 'Когда таблица больше 2×2'],
    correctAnswer: 1,
    explanation: 'Точный тест Фишера не использует аппроксимацию χ² распределением, поэтому подходит для малых выборок с низкими ожидаемыми частотами.'
  },
  {
    id: 'chi-calc',
    type: 'calculation' as const,
    question: 'Рассчитайте χ² для GOF-теста, если O = [30, 70] и E = [50, 50].',
    correctAnswer: 16,
    tolerance: 0.1,
    explanation: 'χ² = (30−50)²/50 + (70−50)²/50 = 400/50 + 400/50 = 8 + 8 = 16.'
  },
];

/* ─── Component ─── */
const ChiSquareCourse = () => {
  const [activeTab, setActiveTab] = useState('gof');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* ─── Hero ─── */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="secondary" className="text-xs">Глава 10</Badge>
                  <Badge variant="outline" className="text-xs">Navarro &amp; Foxcroft</Badge>
                </div>
                <CardTitle className="text-3xl">Анализ категориальных данных: Критерий χ²</CardTitle>
                <CardDescription className="text-base mt-2">
                  Полное руководство по тестам хи-квадрат: согласие, независимость, точный тест Фишера и тест Макнемара. 
                  С пошаговыми примерами в Jamovi.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['Goodness-of-fit', 'Тест независимости', 'Поправка Йейтса', 'V Крамера', 'Тест Фишера', 'Тест Макнемара'].map(t => (
                    <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── Introduction ─── */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" /> Введение</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed">
                <p>
                  До сих пор все рассмотренные нами статистические тесты работали с числовыми (количественными) данными — средними, дисперсиями, корреляциями. 
                  Но что делать, если переменные являются <strong>категориальными</strong> (номинальными)? Например, какой из вариантов ответа выбирают испытуемые, 
                  совпадает ли распределение диагнозов с теоретической моделью или зависит ли предпочтение товара от пола покупателя?
                </p>
                <p>
                  Критерий хи-квадрат (χ²) — это семейство непараметрических тестов, которые работают с <strong>частотами</strong> наблюдений, попавших в те или иные категории. 
                  Основная идея проста: мы сравниваем <em>наблюдаемые</em> частоты (то, что мы видим в данных) с <em>ожидаемыми</em> частотами (то, что мы бы увидели, 
                  если бы нулевая гипотеза была верна).
                </p>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="font-medium mb-2">Общая формула критерия χ²:</p>
                  <MathFormula formula={`\\chi^2 = \\sum_i \\frac{(O_i - E_i)^2}{E_i}`} display />
                  <p className="text-muted-foreground mt-2">
                    где <MathFormula formula="O_i" /> — наблюдаемая частота в i-й ячейке, <MathFormula formula="E_i" /> — ожидаемая частота.
                  </p>
                </div>
                <p>
                  Эта формула одинакова для всех вариантов χ²-тестов. Различия заключаются в том, <em>как именно</em> мы рассчитываем ожидаемые частоты 
                  и <em>какой вопрос</em> задаём данным.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── Main tabs ─── */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
                <TabsTrigger value="gof">Согласие (GOF)</TabsTrigger>
                <TabsTrigger value="independence">Независимость</TabsTrigger>
                <TabsTrigger value="extras">Фишер &amp; Макнемар</TabsTrigger>
                <TabsTrigger value="jamovi">Jamovi</TabsTrigger>
              </TabsList>

              {/* ════════════════════════════════════════ GOF ════════════════════════════════════════ */}
              <TabsContent value="gof" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>10.1 Тест χ² на согласие (Goodness-of-Fit)</CardTitle>
                    <CardDescription>Соответствует ли распределение наблюдений теоретическим вероятностям?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 text-sm leading-relaxed">
                    <p>
                      Представьте, что вы хотите проверить, является ли игральная карта честной — выпадают ли все четыре масти с одинаковой вероятностью. 
                      Вы раздаёте 200 карт и записываете масть каждой из них.
                    </p>

                    {/* Hypotheses */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/30 rounded-lg border">
                        <p className="font-medium mb-1">H₀ (нулевая гипотеза):</p>
                        <p>Все масти равновероятны: <MathFormula formula="P_1 = P_2 = P_3 = P_4 = 0.25" /></p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg border">
                        <p className="font-medium mb-1">H₁ (альтернативная гипотеза):</p>
                        <p>Хотя бы одна масть появляется с другой вероятностью</p>
                      </div>
                    </div>

                    {/* Expected frequencies */}
                    <div>
                      <h4 className="font-semibold mb-2">Шаг 1. Рассчитать ожидаемые частоты</h4>
                      <MathFormula formula={`E_i = N \\times P_i = 200 \\times 0.25 = 50`} display />
                      <p>При N = 200 и равных вероятностях каждая масть должна появиться 50 раз.</p>
                    </div>

                    {/* Data table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-muted/30">
                            <th className="border border-border p-2 text-left">Масть</th>
                            {gofLabels.map(l => <th key={l} className="border border-border p-2 text-center">{l}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-border p-2 font-medium">Наблюдаемое (O)</td>
                            {gofObserved.map((v, i) => <td key={i} className="border border-border p-2 text-center font-mono">{v}</td>)}
                          </tr>
                          <tr>
                            <td className="border border-border p-2 font-medium">Ожидаемое (E)</td>
                            {gofExpected.map((v, i) => <td key={i} className="border border-border p-2 text-center font-mono text-muted-foreground">{v}</td>)}
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Step-by-step calculation */}
                    <div>
                      <h4 className="font-semibold mb-2">Шаг 2. Вычислить χ²</h4>
                      <MathFormula formula={`\\chi^2 = \\frac{(35-50)^2}{50} + \\frac{(51-50)^2}{50} + \\frac{(64-50)^2}{50} + \\frac{(50-50)^2}{50}`} display />
                      <MathFormula formula={`= \\frac{225}{50} + \\frac{1}{50} + \\frac{196}{50} + \\frac{0}{50} = 4.50 + 0.02 + 3.92 + 0 = ${gofChi2.toFixed(2)}`} display />
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Шаг 3. Определить степени свободы</h4>
                      <MathFormula formula={`df = k - 1 = 4 - 1 = 3`} display />
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Шаг 4. Сравнить с критическим значением</h4>
                      <p>
                        Критическое значение χ²(3) при α = 0.05 равно <strong>7.815</strong>. 
                        Наше значение {gofChi2.toFixed(2)} &gt; 7.815, поэтому мы <strong>отвергаем H₀</strong>.
                      </p>
                      <div className="p-3 bg-success/10 border border-success/20 rounded-lg mt-2">
                        <p className="font-medium">
                          Вывод: Распределение мастей статистически значимо отличается от равномерного, 
                          χ²(3) = {gofChi2.toFixed(2)}, p &lt; .05
                        </p>
                      </div>
                    </div>

                    {/* Chart */}
                    <div>
                      <h4 className="font-semibold mb-2">Визуализация: наблюдаемые vs ожидаемые</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={gofChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="observed" fill="hsl(var(--primary))" opacity={0.8} name="Наблюдаемые" />
                            <Bar dataKey="expected" fill="hsl(var(--muted-foreground))" opacity={0.4} name="Ожидаемые" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Unequal probabilities */}
                    <Accordion type="single" collapsible>
                      <AccordionItem value="unequal">
                        <AccordionTrigger>Неравные ожидаемые вероятности</AccordionTrigger>
                        <AccordionContent className="space-y-3">
                          <p>
                            Нулевая гипотеза не обязана задавать равные вероятности. Например, генетическая модель может предсказывать 
                            соотношение 9:3:3:1. В этом случае:
                          </p>
                          <MathFormula formula={`P_1 = \\frac{9}{16},\\quad P_2 = P_3 = \\frac{3}{16},\\quad P_4 = \\frac{1}{16}`} display />
                          <p>И ожидаемые частоты вычисляются как <MathFormula formula="E_i = N \times P_i" />.</p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ════════════════════════════════════ Independence ════════════════════════════════════ */}
              <TabsContent value="independence" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>10.2 Тест χ² на независимость (ассоциацию)</CardTitle>
                    <CardDescription>Связаны ли две категориальные переменные?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 text-sm leading-relaxed">
                    <p>
                      Этот тест отвечает на вопрос: <em>«Зависит ли одна категориальная переменная от другой?»</em>. 
                      Данные организуются в <strong>таблицу сопряжённости</strong> (contingency table), где строки и столбцы 
                      представляют уровни двух переменных.
                    </p>

                    {/* Example setup */}
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <p className="font-medium mb-2">📋 Пример (из учебника):</p>
                      <p>
                        В фантастическом эксперименте 125 участников (87 роботов и 38 людей) оценивали привлекательность трёх 
                        изображений: щенка, цветка и графика данных. Вопрос: зависит ли предпочтение изображения от того, робот ли участник?
                      </p>
                    </div>

                    {/* Contingency table */}
                    <div>
                      <h4 className="font-semibold mb-2">Таблица сопряжённости</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-muted/30">
                              <th className="border border-border p-2"></th>
                              {indCols.map(c => <th key={c} className="border border-border p-2 text-center">{c}</th>)}
                              <th className="border border-border p-2 text-center font-bold">Σ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {indObserved.map((row, r) => (
                              <tr key={r}>
                                <td className="border border-border p-2 font-medium bg-muted/30">{indRows[r]}</td>
                                {row.map((cell, c) => (
                                  <td key={c} className="border border-border p-2 text-center font-mono">{cell}</td>
                                ))}
                                <td className="border border-border p-2 text-center font-bold">{indRowTotals[r]}</td>
                              </tr>
                            ))}
                            <tr className="bg-muted/30">
                              <td className="border border-border p-2 font-bold">Σ</td>
                              {indColTotals.map((t, i) => <td key={i} className="border border-border p-2 text-center font-bold">{t}</td>)}
                              <td className="border border-border p-2 text-center font-bold">{indTotal}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Expected frequencies */}
                    <div>
                      <h4 className="font-semibold mb-2">Ожидаемые частоты</h4>
                      <MathFormula formula={`E_{ij} = \\frac{R_i \\times C_j}{N}`} display />
                      <p className="mb-2">Например, для ячейки «Robot × Puppy»:</p>
                      <MathFormula formula={`E_{11} = \\frac{87 \\times 28}{125} = ${indExpected[0][0].toFixed(1)}`} display />
                      <div className="overflow-x-auto mt-3">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-muted/30">
                              <th className="border border-border p-2">Ожидаемые</th>
                              {indCols.map(c => <th key={c} className="border border-border p-2 text-center">{c}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {indExpected.map((row, r) => (
                              <tr key={r}>
                                <td className="border border-border p-2 font-medium bg-muted/30">{indRows[r]}</td>
                                {row.map((cell, c) => (
                                  <td key={c} className="border border-border p-2 text-center font-mono text-muted-foreground">{cell.toFixed(1)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Chi2 calculation */}
                    <div>
                      <h4 className="font-semibold mb-2">Расчёт χ²</h4>
                      <MathFormula formula={`\\chi^2 = \\sum_{i,j} \\frac{(O_{ij} - E_{ij})^2}{E_{ij}} = ${indChi2.toFixed(2)}`} display />
                      <MathFormula formula={`df = (r-1)(c-1) = (2-1)(3-1) = 2`} display />
                      <p>Критическое значение χ²(2) при α = 0.05 = 5.991. Наше значение {indChi2.toFixed(2)} &gt;&gt; 5.991.</p>
                      <div className="p-3 bg-success/10 border border-success/20 rounded-lg mt-2">
                        <p className="font-medium">
                          Вывод: Предпочтение изображений статистически значимо зависит от типа участника (робот/человек), 
                          χ²(2) = {indChi2.toFixed(2)}, p &lt; .001
                        </p>
                      </div>
                    </div>

                    {/* Continuity correction */}
                    <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> 10.3 Поправка непрерывности Йейтса</h4>
                      <p className="mb-3">
                        Для таблиц <strong>2×2</strong> стандартная χ² статистика может завышать значимость, потому что дискретное 
                        распределение частот аппроксимируется непрерывным χ² распределением. Поправка Йейтса корректирует это:
                      </p>
                      <MathFormula formula={`\\chi^2_{\\text{Yates}} = \\sum \\frac{(|O_i - E_i| - 0.5)^2}{E_i}`} display />
                      <p className="text-muted-foreground mt-2">
                        Обратите внимание: вычитается 0.5 из каждой абсолютной разницы перед возведением в квадрат. 
                        Поправка делает тест более консервативным. Jamovi применяет её автоматически для таблиц 2×2.
                      </p>
                    </div>

                    {/* Effect size */}
                    <div>
                      <h4 className="font-semibold mb-2">10.4 Размер эффекта: V Крамера</h4>
                      <MathFormula formula={`V = \\sqrt{\\frac{\\chi^2}{N \\times (k - 1)}}`} display />
                      <p className="mb-2">
                        где k = min(число строк, число столбцов). Для нашего примера:
                      </p>
                      <MathFormula formula={`V = \\sqrt{\\frac{${indChi2.toFixed(2)}}{${indTotal} \\times (2-1)}} = ${indCramersV.toFixed(3)}`} display />
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="p-2 bg-muted/30 rounded text-center">
                          <div className="text-xs text-muted-foreground">Малый</div>
                          <div className="font-medium">V ≈ 0.10</div>
                        </div>
                        <div className="p-2 bg-muted/30 rounded text-center">
                          <div className="text-xs text-muted-foreground">Средний</div>
                          <div className="font-medium">V ≈ 0.30</div>
                        </div>
                        <div className="p-2 bg-primary/10 border border-primary/20 rounded text-center">
                          <div className="text-xs text-muted-foreground">Большой</div>
                          <div className="font-medium">V ≈ 0.50</div>
                        </div>
                      </div>
                      <p className="mt-2">
                        Для таблиц 2×2 V Крамера эквивалентен коэффициенту ϕ (phi).
                      </p>
                    </div>

                    {/* Assumptions */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> 10.5 Допущения теста χ²</h4>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Независимость наблюдений:</strong> Каждое наблюдение должно принадлежать ровно одной ячейке. Один участник = одно наблюдение.</li>
                        <li><strong>Достаточные ожидаемые частоты:</strong> Все ожидаемые частоты E<sub>i</sub> должны быть ≥ 5. Если это условие нарушается, используйте точный тест Фишера.</li>
                        <li><strong>Категориальные (номинальные) данные:</strong> Обе переменные должны быть категориальными.</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ══════════════════════════════════ Fisher & McNemar ══════════════════════════════════ */}
              <TabsContent value="extras" className="space-y-6 mt-6">
                {/* Fisher */}
                <Card>
                  <CardHeader>
                    <CardTitle>10.6 Точный тест Фишера</CardTitle>
                    <CardDescription>Альтернатива χ² для малых выборок</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm leading-relaxed">
                    <p>
                      Когда ожидаемые частоты слишком малы (E &lt; 5), аппроксимация распределением χ² становится ненадёжной. 
                      Точный тест Фишера вычисляет <strong>точную вероятность</strong> получить наблюдаемую (или более экстремальную) 
                      таблицу при условии фиксированных маргинальных сумм.
                    </p>
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <p className="font-medium mb-2">Как он работает:</p>
                      <p>
                        Для таблицы 2×2 с маргинальными суммами R₁, R₂, C₁, C₂ и общей суммой N, 
                        вероятность конкретной таблицы вычисляется через гипергеометрическое распределение:
                      </p>
                      <MathFormula formula={`p = \\frac{\\binom{R_1}{a} \\binom{R_2}{b}}{\\binom{N}{C_1}} = \\frac{R_1!\\, R_2!\\, C_1!\\, C_2!}{N!\\, a!\\, b!\\, c!\\, d!}`} display />
                      <p className="text-muted-foreground mt-2">
                        где a, b, c, d — частоты в четырёх ячейках таблицы 2×2.
                      </p>
                    </div>
                    <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                      <p><strong>Когда использовать:</strong></p>
                      <ul className="list-disc pl-6 mt-1 space-y-1">
                        <li>Любая ожидаемая частота &lt; 5</li>
                        <li>Общий объём выборки &lt; 20</li>
                        <li>Таблица 2×2 (хотя расширения существуют для больших таблиц)</li>
                      </ul>
                    </div>
                    <p>
                      В Jamovi точный тест Фишера доступен через меню <strong>Frequencies → Independent Samples → χ² Tests of Association</strong>: 
                      установите флажок рядом с «Fisher's exact test».
                    </p>
                  </CardContent>
                </Card>

                {/* McNemar */}
                <Card>
                  <CardHeader>
                    <CardTitle>10.7 Тест Макнемара</CardTitle>
                    <CardDescription>χ² для связанных (парных) номинальных данных</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm leading-relaxed">
                    <p>
                      Тест Макнемара — это аналог <strong>парного t-теста</strong>, но для номинальных переменных. 
                      Он используется, когда одни и те же участники измерены дважды (до и после), и мы хотим проверить, 
                      изменилась ли пропорция ответов.
                    </p>

                    {/* Example */}
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <p className="font-medium mb-2">📋 Пример: эффект рекламы</p>
                      <p className="mb-3">
                        100 человек спросили, купят ли они продукт. Затем показали рекламу и спросили снова. Результаты:
                      </p>
                      <div className="overflow-x-auto">
                        <table className="text-sm border-collapse mx-auto">
                          <thead>
                            <tr className="bg-muted/30">
                              <th className="border border-border p-2"></th>
                              <th className="border border-border p-2 text-center">После: Да</th>
                              <th className="border border-border p-2 text-center">После: Нет</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-border p-2 font-medium bg-muted/30">До: Да</td>
                              <td className="border border-border p-2 text-center">30 (a)</td>
                              <td className="border border-border p-2 text-center font-bold text-primary">40 (b)</td>
                            </tr>
                            <tr>
                              <td className="border border-border p-2 font-medium bg-muted/30">До: Нет</td>
                              <td className="border border-border p-2 text-center font-bold text-primary">10 (c)</td>
                              <td className="border border-border p-2 text-center">20 (d)</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <p>
                      Ключевая идея: нас интересуют только <strong>несогласованные пары</strong> — те, кто изменил мнение (ячейки b и c). 
                      Ячейки a и d (те, кто не изменил мнение) не несут информации об изменении.
                    </p>

                    <div>
                      <h4 className="font-semibold mb-2">Формула теста Макнемара</h4>
                      <MathFormula formula={`\\chi^2_{\\text{McNemar}} = \\frac{(b - c)^2}{b + c}`} display />
                      <p className="mb-2">Для нашего примера:</p>
                      <MathFormula formula={`\\chi^2 = \\frac{(40 - 10)^2}{40 + 10} = \\frac{900}{50} = ${mcnemarChi2.toFixed(1)}`} display />
                      <p>df = 1. Критическое χ²(1) при α = 0.05 = 3.841. Наше {mcnemarChi2.toFixed(1)} &gt;&gt; 3.841.</p>
                      <div className="p-3 bg-success/10 border border-success/20 rounded-lg mt-2">
                        <p className="font-medium">
                          Вывод: Реклама значимо изменила мнение участников, χ²(1) = {mcnemarChi2.toFixed(1)}, p &lt; .001. 
                          Но внимание: больше людей передумали покупать (b = 40), чем решили купить (c = 10)!
                        </p>
                      </div>
                    </div>

                    {/* Difference from independence */}
                    <Accordion type="single" collapsible>
                      <AccordionItem value="diff">
                        <AccordionTrigger>10.8 Чем Макнемар отличается от теста независимости?</AccordionTrigger>
                        <AccordionContent className="space-y-3">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-3 border rounded-lg">
                              <p className="font-medium mb-1">Тест независимости χ²</p>
                              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                <li>Две <strong>разные</strong> переменные</li>
                                <li><strong>Независимые</strong> наблюдения</li>
                                <li>Вопрос: «Связаны ли X и Y?»</li>
                              </ul>
                            </div>
                            <div className="p-3 border rounded-lg border-primary/30">
                              <p className="font-medium mb-1">Тест Макнемара</p>
                              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                <li><strong>Одна</strong> переменная, два измерения</li>
                                <li><strong>Связанные</strong> (парные) наблюдения</li>
                                <li>Вопрос: «Изменились ли пропорции?»</li>
                              </ul>
                            </div>
                          </div>
                          <p>
                            Аналогия: тест независимости — это как independent-samples t-test (разные группы), 
                            а тест Макнемара — как paired-samples t-test (одни и те же люди).
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ══════════════════════════════════════ Jamovi ══════════════════════════════════════ */}
              <TabsContent value="jamovi" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calculator className="w-5 h-5" /> Пошаговое руководство по Jamovi</CardTitle>
                    <CardDescription>Как провести χ² тесты в Jamovi</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 text-sm leading-relaxed">

                    {/* GOF in Jamovi */}
                    <div>
                      <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                        <Badge variant="outline">1</Badge> Тест на согласие (Goodness-of-Fit)
                      </h4>
                      <div className="space-y-3 pl-4 border-l-2 border-primary/30">
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="font-medium">Шаг 1: Подготовка данных</p>
                          <p className="text-muted-foreground mt-1">
                            Создайте одну переменную (столбец) с вашими категориальными данными. 
                            Каждая строка — одно наблюдение. Убедитесь, что тип переменной установлен как «Nominal».
                          </p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="font-medium">Шаг 2: Запуск анализа</p>
                          <p className="text-muted-foreground mt-1">
                            Перейдите в меню: <code className="bg-muted px-1 rounded">Analyses → Frequencies → One Sample Proportion Tests → N Outcomes — χ² Goodness of Fit</code>
                          </p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="font-medium">Шаг 3: Настройка</p>
                          <p className="text-muted-foreground mt-1">
                            Перетащите вашу переменную в поле «Variable». По умолчанию Jamovi предполагает равные вероятности. 
                            Если нужны другие пропорции, задайте их в разделе «Expected Proportions».
                          </p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="font-medium">Шаг 4: Результаты</p>
                          <p className="text-muted-foreground mt-1">
                            Jamovi покажет таблицу с наблюдаемыми и ожидаемыми частотами, значение χ², df и p-value.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Independence in Jamovi */}
                    <div>
                      <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                        <Badge variant="outline">2</Badge> Тест независимости (Association)
                      </h4>
                      <div className="space-y-3 pl-4 border-l-2 border-accent/30">
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="font-medium">Шаг 1: Подготовка данных</p>
                          <p className="text-muted-foreground mt-1">
                            Создайте два столбца — по одному для каждой категориальной переменной. 
                            Каждая строка — одно наблюдение с указанием уровня обеих переменных.
                          </p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="font-medium">Шаг 2: Запуск анализа</p>
                          <p className="text-muted-foreground mt-1">
                            Меню: <code className="bg-muted px-1 rounded">Analyses → Frequencies → Independent Samples — χ² Tests of Association</code>
                          </p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="font-medium">Шаг 3: Настройка</p>
                          <p className="text-muted-foreground mt-1">
                            Перетащите одну переменную в «Rows», другую — в «Columns». Отметьте галочки:
                          </p>
                          <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                            <li><strong>χ²</strong> — основной тест</li>
                            <li><strong>Expected counts</strong> — таблица ожидаемых частот</li>
                            <li><strong>Cramér's V</strong> — размер эффекта</li>
                            <li><strong>Fisher's exact test</strong> — для малых выборок</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="font-medium">Шаг 4: Интерпретация</p>
                          <p className="text-muted-foreground mt-1">
                            Jamovi покажет: таблицу сопряжённости, χ² статистику, df, p-value, Cramér's V. 
                            Если p &lt; α, переменные статистически значимо связаны.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* McNemar in Jamovi */}
                    <div>
                      <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                        <Badge variant="outline">3</Badge> Тест Макнемара
                      </h4>
                      <div className="space-y-3 pl-4 border-l-2 border-muted-foreground/30">
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="font-medium">Шаг 1: Подготовка данных</p>
                          <p className="text-muted-foreground mt-1">
                            Создайте два столбца: «До» и «После». Каждая строка — один участник. 
                            Значения — уровни номинальной переменной (например, «Да» / «Нет»).
                          </p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="font-medium">Шаг 2: Запуск анализа</p>
                          <p className="text-muted-foreground mt-1">
                            Меню: <code className="bg-muted px-1 rounded">Analyses → Frequencies → Paired Samples — McNemar test</code>
                          </p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="font-medium">Шаг 3: Результаты</p>
                          <p className="text-muted-foreground mt-1">
                            Jamovi покажет таблицу 2×2, значение χ² Макнемара, df = 1 и p-value. 
                            Изучите ячейки b и c, чтобы понять направление изменений.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Reporting */}
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <h4 className="font-semibold mb-2">📝 Как отчитывать результаты (APA)</h4>
                      <div className="space-y-2 font-mono text-xs">
                        <p><strong>GOF:</strong> χ²({3}, N = 200) = {gofChi2.toFixed(2)}, p &lt; .05</p>
                        <p><strong>Независимость:</strong> χ²({2}, N = {indTotal}) = {indChi2.toFixed(2)}, p &lt; .001, V = {indCramersV.toFixed(2)}</p>
                        <p><strong>Макнемар:</strong> χ²(1, N = 100) = {mcnemarChi2.toFixed(1)}, p &lt; .001</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* ─── Summary card ─── */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle>Сводка: какой тест χ² выбрать?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted/30">
                        <th className="border border-border p-2 text-left">Ситуация</th>
                        <th className="border border-border p-2 text-left">Тест</th>
                        <th className="border border-border p-2 text-left">df</th>
                        <th className="border border-border p-2 text-left">В Jamovi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border p-2">Одна переменная, сравнение с теорией</td>
                        <td className="border border-border p-2 font-medium">GOF χ²</td>
                        <td className="border border-border p-2"><MathFormula formula="k-1" /></td>
                        <td className="border border-border p-2 text-xs">Frequencies → N Outcomes</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2">Две переменные, независимые группы</td>
                        <td className="border border-border p-2 font-medium">χ² независимости</td>
                        <td className="border border-border p-2"><MathFormula formula="(r-1)(c-1)" /></td>
                        <td className="border border-border p-2 text-xs">Frequencies → Independent Samples</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2">2×2, малые E<sub>i</sub></td>
                        <td className="border border-border p-2 font-medium">Точный тест Фишера</td>
                        <td className="border border-border p-2">—</td>
                        <td className="border border-border p-2 text-xs">Там же, галочка Fisher</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2">Парные данные, одна переменная до/после</td>
                        <td className="border border-border p-2 font-medium">Тест Макнемара</td>
                        <td className="border border-border p-2">1</td>
                        <td className="border border-border p-2 text-xs">Frequencies → Paired Samples</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── Link to lab ─── */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.25 }}>
            <Link to="/labs/chisquare">
              <Card className="border-primary/30 hover:border-primary/60 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-3">
                    <FlaskConical className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-semibold">Интерактивная лаборатория χ²</p>
                      <p className="text-sm text-muted-foreground">Введите свои данные и рассчитайте χ² в реальном времени</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* ─── Quiz ─── */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
            <Quiz
              title="Тест: Критерий χ²"
              description="Проверьте своё понимание тестов хи-квадрат"
              questions={quizQuestions}
            />
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default ChiSquareCourse;
