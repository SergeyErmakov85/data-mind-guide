import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MathFormula } from '@/components/MathFormula';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Lightbulb, BarChart3, BookOpen, FlaskConical, Shuffle, Layers, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';
import { Quiz, QuizQuestion } from '@/components/Quiz';
import { AutoTermify } from '@/components/AutoTermify';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/* ==================== SVG Venn Diagrams ==================== */

const VennSubset = () => (
  <svg viewBox="0 0 200 140" className="w-full max-w-[200px] mx-auto">
    <text x="100" y="14" textAnchor="middle" className="fill-muted-foreground text-[10px]">A ⊂ B</text>
    <rect x="10" y="20" width="180" height="110" rx="8" className="fill-muted/20 stroke-muted-foreground/30" strokeWidth="1"/>
    <text x="175" y="35" textAnchor="end" className="fill-muted-foreground text-[9px]">Ω</text>
    <ellipse cx="100" cy="78" rx="60" ry="38" className="fill-primary/15 stroke-primary" strokeWidth="1.5"/>
    <text x="100" y="56" textAnchor="middle" className="fill-primary text-[10px] font-semibold">B</text>
    <ellipse cx="100" cy="85" rx="30" ry="20" className="fill-primary/30 stroke-primary" strokeWidth="1.5"/>
    <text x="100" y="90" textAnchor="middle" className="fill-primary text-[10px] font-bold">A</text>
  </svg>
);

const VennUnion = () => (
  <svg viewBox="0 0 200 140" className="w-full max-w-[200px] mx-auto">
    <text x="100" y="14" textAnchor="middle" className="fill-muted-foreground text-[10px]">A + B (A ∪ B)</text>
    <rect x="10" y="20" width="180" height="110" rx="8" className="fill-muted/20 stroke-muted-foreground/30" strokeWidth="1"/>
    <text x="175" y="35" textAnchor="end" className="fill-muted-foreground text-[9px]">Ω</text>
    <ellipse cx="78" cy="78" rx="45" ry="35" className="fill-primary/20 stroke-primary" strokeWidth="1.5"/>
    <ellipse cx="122" cy="78" rx="45" ry="35" className="fill-info/20 stroke-info" strokeWidth="1.5"/>
    <text x="58" y="82" textAnchor="middle" className="fill-primary text-[10px] font-semibold">A</text>
    <text x="142" y="82" textAnchor="middle" className="fill-info text-[10px] font-semibold">B</text>
  </svg>
);

const VennIntersection = () => (
  <svg viewBox="0 0 200 140" className="w-full max-w-[200px] mx-auto">
    <text x="100" y="14" textAnchor="middle" className="fill-muted-foreground text-[10px]">AB (A ∩ B)</text>
    <rect x="10" y="20" width="180" height="110" rx="8" className="fill-muted/20 stroke-muted-foreground/30" strokeWidth="1"/>
    <text x="175" y="35" textAnchor="end" className="fill-muted-foreground text-[9px]">Ω</text>
    <ellipse cx="78" cy="78" rx="45" ry="35" className="fill-muted/10 stroke-primary" strokeWidth="1.5"/>
    <ellipse cx="122" cy="78" rx="45" ry="35" className="fill-muted/10 stroke-info" strokeWidth="1.5"/>
    {/* Intersection highlight - approximate with a path */}
    <clipPath id="clipA"><ellipse cx="78" cy="78" rx="45" ry="35"/></clipPath>
    <ellipse cx="122" cy="78" rx="45" ry="35" className="fill-primary/30" clipPath="url(#clipA)"/>
    <text x="58" y="82" textAnchor="middle" className="fill-primary text-[10px] font-semibold">A</text>
    <text x="142" y="82" textAnchor="middle" className="fill-info text-[10px] font-semibold">B</text>
  </svg>
);

const VennDifference = () => (
  <svg viewBox="0 0 200 140" className="w-full max-w-[200px] mx-auto">
    <text x="100" y="14" textAnchor="middle" className="fill-muted-foreground text-[10px]">A − B</text>
    <rect x="10" y="20" width="180" height="110" rx="8" className="fill-muted/20 stroke-muted-foreground/30" strokeWidth="1"/>
    <text x="175" y="35" textAnchor="end" className="fill-muted-foreground text-[9px]">Ω</text>
    <ellipse cx="78" cy="78" rx="45" ry="35" className="fill-primary/25 stroke-primary" strokeWidth="1.5"/>
    <ellipse cx="122" cy="78" rx="45" ry="35" className="fill-background stroke-info" strokeWidth="1.5"/>
    <clipPath id="clipDiffB"><ellipse cx="122" cy="78" rx="45" ry="35"/></clipPath>
    <ellipse cx="78" cy="78" rx="45" ry="35" className="fill-background" clipPath="url(#clipDiffB)"/>
    <text x="55" y="82" textAnchor="middle" className="fill-primary text-[10px] font-semibold">A</text>
    <text x="142" y="82" textAnchor="middle" className="fill-info text-[10px] font-semibold">B</text>
  </svg>
);

const VennComplement = () => (
  <svg viewBox="0 0 200 140" className="w-full max-w-[200px] mx-auto">
    <text x="100" y="14" textAnchor="middle" className="fill-muted-foreground text-[10px]">Ā = Ω − A</text>
    <rect x="10" y="20" width="180" height="110" rx="8" className="fill-primary/10 stroke-muted-foreground/30" strokeWidth="1"/>
    <text x="175" y="35" textAnchor="end" className="fill-muted-foreground text-[9px]">Ω</text>
    <ellipse cx="100" cy="78" rx="45" ry="35" className="fill-background stroke-primary" strokeWidth="1.5"/>
    <text x="100" y="82" textAnchor="middle" className="fill-primary text-[10px] font-semibold">A</text>
  </svg>
);

const VennMutuallyExclusive = () => (
  <svg viewBox="0 0 200 140" className="w-full max-w-[200px] mx-auto">
    <text x="100" y="14" textAnchor="middle" className="fill-muted-foreground text-[10px]">AB = ∅</text>
    <rect x="10" y="20" width="180" height="110" rx="8" className="fill-muted/20 stroke-muted-foreground/30" strokeWidth="1"/>
    <text x="175" y="35" textAnchor="end" className="fill-muted-foreground text-[9px]">Ω</text>
    <ellipse cx="60" cy="78" rx="35" ry="30" className="fill-primary/20 stroke-primary" strokeWidth="1.5"/>
    <ellipse cx="140" cy="78" rx="35" ry="30" className="fill-info/20 stroke-info" strokeWidth="1.5"/>
    <text x="60" y="82" textAnchor="middle" className="fill-primary text-[10px] font-semibold">A</text>
    <text x="140" y="82" textAnchor="middle" className="fill-info text-[10px] font-semibold">B</text>
  </svg>
);

/* ==================== Bernoulli Tree ==================== */
const BernoulliTree = () => (
  <svg viewBox="0 0 440 260" className="w-full max-w-[440px] mx-auto">
    {/* Level 0 -> 1 */}
    <line x1="40" y1="130" x2="140" y2="60" className="stroke-primary" strokeWidth="1.5"/>
    <line x1="40" y1="130" x2="140" y2="200" className="stroke-destructive" strokeWidth="1.5"/>
    <text x="80" y="82" className="fill-primary text-[10px] font-medium">p</text>
    <text x="80" y="180" className="fill-destructive text-[10px] font-medium">q</text>
    {/* Level 1 -> 2 (top) */}
    <line x1="140" y1="60" x2="240" y2="30" className="stroke-primary" strokeWidth="1.2"/>
    <line x1="140" y1="60" x2="240" y2="90" className="stroke-destructive" strokeWidth="1.2"/>
    <text x="182" y="36" className="fill-primary text-[9px]">p</text>
    <text x="182" y="86" className="fill-destructive text-[9px]">q</text>
    {/* Level 1 -> 2 (bottom) */}
    <line x1="140" y1="200" x2="240" y2="170" className="stroke-primary" strokeWidth="1.2"/>
    <line x1="140" y1="200" x2="240" y2="230" className="stroke-destructive" strokeWidth="1.2"/>
    <text x="182" y="176" className="fill-primary text-[9px]">p</text>
    <text x="182" y="226" className="fill-destructive text-[9px]">q</text>
    {/* Level 2 -> 3 */}
    {[[30,10,50],[90,70,110],[170,150,190],[230,210,250]].map(([y, y1, y2], i) => (
      <g key={i}>
        <line x1="240" y1={y} x2="320" y2={y1} className="stroke-primary" strokeWidth="1"/>
        <line x1="240" y1={y} x2="320" y2={y2} className="stroke-destructive" strokeWidth="1"/>
      </g>
    ))}
    {/* Labels */}
    {[
      [10, 'p³', 'AAA'],
      [50, 'p²q', 'AAĀ'],
      [70, 'p²q', 'AĀA'],
      [110, 'pq²', 'AĀĀ'],
      [150, 'p²q', 'ĀAA'],
      [190, 'pq²', 'ĀAĀ'],
      [210, 'pq²', 'ĀĀA'],
      [250, 'q³', 'ĀĀĀ'],
    ].map(([y, prob, label]) => (
      <g key={String(label)}>
        <text x="330" y={Number(y) + 4} className="fill-foreground text-[9px]">{label}</text>
        <text x="395" y={Number(y) + 4} className="fill-muted-foreground text-[8px]">{prob}</text>
      </g>
    ))}
    <circle cx="40" cy="130" r="4" className="fill-primary"/>
  </svg>
);

/* ==================== Collapsible Example ==================== */
interface ExampleProps {
  title: string;
  children: React.ReactNode;
  statNote?: string;
}

const Example = ({ title, children, statNote }: ExampleProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors group">
        <Lightbulb className="w-4 h-4 text-primary shrink-0" />
        <span className="text-sm font-medium flex-1">{title}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pt-3 pb-1 text-sm text-muted-foreground space-y-2">
        {children}
        {statNote && (
          <div className="mt-2 p-2 rounded bg-info/5 border border-info/20 text-xs">
            <BarChart3 className="w-3 h-3 inline mr-1 text-info" />
            <strong>Связь со статистикой:</strong> {statNote}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

/* ==================== Main Page ==================== */
const ProbabilityTheoryPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <AutoTermify>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="gap-1"><Shuffle className="w-3 h-3" /> Теория</Badge>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Теория вероятностей</h1>
          <p className="text-muted-foreground max-w-2xl mb-8">
            Фундамент статистического анализа: от случайных событий и комбинаторики 
            до формулы полной вероятности и схемы Бернулли.
          </p>
        </motion.div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="events" className="gap-1"><Layers className="w-3.5 h-3.5" />Случайные события</TabsTrigger>
            <TabsTrigger value="combinatorics" className="gap-1"><Shuffle className="w-3.5 h-3.5" />Комбинаторика</TabsTrigger>
            <TabsTrigger value="total" className="gap-1"><GitBranch className="w-3.5 h-3.5" />Полная вероятность</TabsTrigger>
            <TabsTrigger value="bernoulli" className="gap-1"><FlaskConical className="w-3.5 h-3.5" />Схема Бернулли</TabsTrigger>
          </TabsList>

          {/* ========== TAB 1: СЛУЧАЙНЫЕ СОБЫТИЯ ========== */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  I. Случайные события
                </CardTitle>
                <CardDescription>
                  Операции над событиями и их визуализация через диаграммы Венна
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Основные определения</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><strong>Ω (пространство элементарных исходов)</strong> — множество всех возможных результатов эксперимента.</li>
                    <li><strong>Событие A</strong> — подмножество Ω, т.е. набор исходов, при которых мы говорим, что «А произошло».</li>
                    <li><strong>Вероятность события</strong>: <MathFormula formula="P(A) = \frac{|A|}{|\Omega|}" /> (для равновозможных исходов).</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Операции над событиями</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <VennSubset />
                      <p className="text-xs text-center text-muted-foreground">
                        <strong>A ⊂ B</strong> — событие A влечёт B
                      </p>
                    </div>
                    <div className="space-y-2">
                      <VennUnion />
                      <p className="text-xs text-center text-muted-foreground">
                        <strong>A ∪ B</strong> — хотя бы одно из событий
                      </p>
                    </div>
                    <div className="space-y-2">
                      <VennIntersection />
                      <p className="text-xs text-center text-muted-foreground">
                        <strong>A ∩ B</strong> — оба события одновременно
                      </p>
                    </div>
                    <div className="space-y-2">
                      <VennDifference />
                      <p className="text-xs text-center text-muted-foreground">
                        <strong>A − B</strong> — A произошло, но не B
                      </p>
                    </div>
                    <div className="space-y-2">
                      <VennComplement />
                      <p className="text-xs text-center text-muted-foreground">
                        <strong>Ā = Ω − A</strong> — противоположное событие
                      </p>
                    </div>
                    <div className="space-y-2">
                      <VennMutuallyExclusive />
                      <p className="text-xs text-center text-muted-foreground">
                        <strong>AB = ∅</strong> — несовместные события
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Ключевые формулы</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                      <p className="text-sm font-medium">Формула сложения (несовместные)</p>
                      <MathFormula formula="P(A + B) = P(A) + P(B)" display />
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                      <p className="text-sm font-medium">Формула сложения (общий случай)</p>
                      <MathFormula formula="P(A \cup B) = P(A) + P(B) - P(A \cap B)" display />
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                      <p className="text-sm font-medium">Условная вероятность</p>
                      <MathFormula formula="P(A | B) = \frac{P(A \cap B)}{P(B)}" display />
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                      <p className="text-sm font-medium">Противоположное событие</p>
                      <MathFormula formula="P(\bar{A}) = 1 - P(A)" display />
                    </div>
                  </div>
                </div>

                <Example
                  title="Пример: Диагностический тест в психологии"
                  statNote="В статистике операции над событиями лежат в основе расчёта чувствительности (sensitivity) и специфичности (specificity) диагностических тестов, а также ROC-анализа."
                >
                  <p>Психолог проводит скрининговый тест на депрессию. Пусть:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li><strong>A</strong> — тест положительный</li>
                    <li><strong>B</strong> — пациент действительно имеет депрессию</li>
                  </ul>
                  <p>Тогда <MathFormula formula="A \cap B" /> — истинно-положительный результат (тест верно определил депрессию).</p>
                  <p><MathFormula formula="A \cap \bar{B}" /> — ложно-положительный результат (тест ошибся).</p>
                  <p>Чувствительность = <MathFormula formula="P(A | B)" />, специфичность = <MathFormula formula="P(\bar{A} | \bar{B})" />.</p>
                </Example>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== TAB 2: КОМБИНАТОРИКА ========== */}
          <TabsContent value="combinatorics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shuffle className="w-5 h-5 text-primary" />
                  Основные формулы комбинаторики
                </CardTitle>
                <CardDescription>
                  Перестановки, размещения и сочетания — инструменты подсчёта числа исходов
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Permutations */}
                <div className="p-5 rounded-xl border bg-card space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge>a</Badge>
                    <h3 className="font-semibold text-lg">Перестановки</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Количество способов упорядочить <MathFormula formula="n" /> различных элементов:
                  </p>
                  <MathFormula formula="P_n = n! = 1 \cdot 2 \cdot 3 \cdots (n-1) \cdot n" display />
                  <div className="grid md:grid-cols-3 gap-3 text-sm">
                    <div className="p-3 rounded-lg bg-muted/30 text-center">
                      <MathFormula formula="P_3 = 3! = 6" />
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 text-center">
                      <MathFormula formula="P_5 = 5! = 120" />
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 text-center">
                      <MathFormula formula="P_{10} = 10! = 3628800" />
                    </div>
                  </div>
                  <Example
                    title="Пример: Порядок предъявления стимулов"
                    statNote="В экспериментальной психологии перестановки используются для контрбалансировки — рандомизации порядка условий, чтобы устранить эффект порядка (order effect) в within-subjects дизайнах."
                  >
                    <p>Сколькими способами можно упорядочить 4 экспериментальных условия?</p>
                    <MathFormula formula="P_4 = 4! = 24 \text{ способа}" display />
                    <p>Это значит, что для полной контрбалансировки нужно минимум 24 участника.</p>
                  </Example>
                </div>

                {/* Arrangements */}
                <div className="p-5 rounded-xl border bg-card space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge>б</Badge>
                    <h3 className="font-semibold text-lg">Размещения</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Количество способов выбрать <MathFormula formula="m" /> элементов из <MathFormula formula="n" /> <strong>с учётом порядка</strong>:
                  </p>
                  <MathFormula formula="A_n^m = n \cdot (n-1) \cdot (n-2) \cdots (n - m + 1) = \frac{n!}{(n-m)!}" display />
                  <Example
                    title="Пример: Выбор призовых мест"
                    statNote="Размещения применяются при расчёте вероятностей в задачах ранжирования, например, при использовании непараметрических критериев (ранговые тесты Вилкоксона, Манна–Уитни)."
                  >
                    <p>Из 10 участников эксперимента нужно выбрать 3-х лучших (1-е, 2-е, 3-е место):</p>
                    <MathFormula formula="A_{10}^3 = 10 \cdot 9 \cdot 8 = 720 \text{ вариантов}" display />
                  </Example>
                </div>

                {/* Combinations */}
                <div className="p-5 rounded-xl border bg-card space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge>в</Badge>
                    <h3 className="font-semibold text-lg">Сочетания</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Количество способов выбрать <MathFormula formula="k" /> элементов из <MathFormula formula="n" /> <strong>без учёта порядка</strong>:
                  </p>
                  <MathFormula formula="C_n^k = \binom{n}{k} = \frac{n!}{k!(n-k)!}" display />
                  <p className="text-sm text-muted-foreground">
                    <MathFormula formula="C_n^k" /> называется <strong>биномиальным коэффициентом</strong> (читается «цэ из эн по ка»).
                  </p>
                  <div className="grid md:grid-cols-3 gap-3 text-sm">
                    <div className="p-3 rounded-lg bg-muted/30 text-center">
                      <MathFormula formula="C_5^2 = \frac{5!}{2! \cdot 3!} = 10" />
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 text-center">
                      <MathFormula formula="C_{10}^3 = 120" />
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 text-center">
                      <MathFormula formula="C_n^0 = C_n^n = 1" />
                    </div>
                  </div>
                  <Example
                    title="Пример: Формирование экспериментальных групп"
                    statNote="Сочетания лежат в основе расчёта числа сравнений в множественных сравнениях (post-hoc тесты после ANOVA). При k группах число попарных сравнений = C(k,2)."
                  >
                    <p>Из 20 студентов нужно сформировать экспериментальную группу из 8 человек:</p>
                    <MathFormula formula="C_{20}^8 = \frac{20!}{8! \cdot 12!} = 125\,970 \text{ способов}" display />
                    <p>При 4 группах число попарных сравнений: <MathFormula formula="C_4^2 = 6" />. Именно поэтому нужна поправка Бонферрони!</p>
                  </Example>
                </div>

                {/* Relationship */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="font-medium text-sm mb-2">Связь между формулами</h4>
                  <MathFormula formula="C_n^k = \frac{A_n^k}{P_k} = \frac{A_n^k}{k!}" display />
                  <p className="text-xs text-muted-foreground mt-2">
                    Сочетания = размещения, делённые на перестановки (убираем порядок).
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== TAB 3: ПОЛНАЯ ВЕРОЯТНОСТЬ ========== */}
          <TabsContent value="total" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-primary" />
                  Формула полной вероятности
                </CardTitle>
                <CardDescription>
                  Вычисление вероятности события через разбиение на гипотезы
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Пусть <MathFormula formula="H_1, H_2, \ldots, H_n" /> — полная группа несовместных гипотез, 
                    т.е. <MathFormula formula="\sum P(H_i) = 1" /> и <MathFormula formula="H_i \cap H_j = \varnothing" /> для <MathFormula formula="i \neq j" />.
                  </p>
                  <div className="p-5 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium text-center mb-2">Формула полной вероятности</p>
                    <MathFormula formula="P(A) = \sum_{i=1}^{n} P(A | H_i) \cdot P(H_i)" display />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Где <MathFormula formula="P(A | H_i)" /> — условная вероятность события A при условии, что верна гипотеза <MathFormula formula="H_i" />.
                  </p>
                </div>

                {/* Visual representation */}
                <div>
                  <h3 className="font-semibold mb-3">Визуализация</h3>
                  <svg viewBox="0 0 400 120" className="w-full max-w-[400px] mx-auto">
                    <rect x="10" y="10" width="380" height="100" rx="8" className="fill-muted/20 stroke-muted-foreground/30" strokeWidth="1"/>
                    <text x="200" y="8" textAnchor="middle" className="fill-muted-foreground text-[9px]">Ω</text>
                    {[
                      { x: 10, w: 100, label: 'H₁', color: 'fill-primary/20 stroke-primary' },
                      { x: 110, w: 80, label: 'H₂', color: 'fill-info/20 stroke-info' },
                      { x: 190, w: 90, label: 'H₃', color: 'fill-success/20 stroke-success' },
                      { x: 280, w: 110, label: 'Hₙ', color: 'fill-warning/20 stroke-warning' },
                    ].map((h, i) => (
                      <g key={i}>
                        <rect x={h.x} y="10" width={h.w} height="100" className={h.color} strokeWidth="1"/>
                        <text x={h.x + h.w / 2} y="65" textAnchor="middle" className="fill-foreground text-[11px] font-medium">{h.label}</text>
                      </g>
                    ))}
                    <text x="245" y="65" className="fill-muted-foreground text-[14px]">…</text>
                    {/* Event A spanning across */}
                    <ellipse cx="200" cy="60" rx="130" ry="30" className="fill-none stroke-destructive" strokeWidth="2" strokeDasharray="4 2"/>
                    <text x="200" y="25" textAnchor="middle" className="fill-destructive text-[11px] font-bold">A</text>
                  </svg>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Событие A «распадается» на части в каждой гипотезе
                  </p>
                </div>

                {/* Bayes */}
                <div className="p-5 rounded-xl border bg-card space-y-3">
                  <h3 className="font-semibold text-lg">Формула Байеса (следствие)</h3>
                  <p className="text-sm text-muted-foreground">
                    Позволяет «перевернуть» условную вероятность — узнать, какая гипотеза верна при наблюдении события A:
                  </p>
                  <MathFormula formula="P(H_i | A) = \frac{P(A | H_i) \cdot P(H_i)}{\sum_{j=1}^n P(A | H_j) \cdot P(H_j)}" display />
                </div>

                <Example
                  title="Пример: Диагностика с учётом базовой частоты"
                  statNote="Формула Байеса — основа байесовской статистики. В клинической психологии она объясняет, почему при низкой распространённости расстройства даже точный тест даёт много ложно-положительных результатов (парадокс базовой частоты)."
                >
                  <p>Распространённость депрессии в популяции: <MathFormula formula="P(H_1) = 0.05" /> (5%).</p>
                  <p>Чувствительность теста: <MathFormula formula="P(+|H_1) = 0.90" />.</p>
                  <p>Специфичность: <MathFormula formula="P(-|H_2) = 0.85" />, значит <MathFormula formula="P(+|H_2) = 0.15" />.</p>
                  <p className="font-medium mt-2">Какова вероятность депрессии при положительном тесте?</p>
                  <MathFormula formula="P(H_1|+) = \frac{0.90 \times 0.05}{0.90 \times 0.05 + 0.15 \times 0.95} = \frac{0.045}{0.045 + 0.1425} \approx 0.24" display />
                  <p className="font-medium text-primary">Только 24%! Несмотря на точный тест, большинство положительных результатов — ложные.</p>
                </Example>

                <Example
                  title="Пример: Выбор метода терапии"
                  statNote="Формула полной вероятности используется при мета-анализе, когда результаты из разных подгрупп взвешиваются по их размеру для получения общей оценки эффективности."
                >
                  <p>Три метода терапии используются с частотами: КБТ — 50%, психодинамическая — 30%, гуманистическая — 20%.</p>
                  <p>Вероятности улучшения: <MathFormula formula="P(A|H_1)=0.7" />, <MathFormula formula="P(A|H_2)=0.5" />, <MathFormula formula="P(A|H_3)=0.6" />.</p>
                  <MathFormula formula="P(\text{улучшение}) = 0.7 \times 0.5 + 0.5 \times 0.3 + 0.6 \times 0.2 = 0.62" display />
                </Example>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== TAB 4: СХЕМА БЕРНУЛЛИ ========== */}
          <TabsContent value="bernoulli" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-primary" />
                  Схема испытаний Бернулли
                </CardTitle>
                <CardDescription>
                  Серия независимых испытаний с двумя исходами — фундамент биномиального распределения
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-semibold">Определение</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                      <p className="text-sm"><strong>A</strong> — случайное событие («успех»)</p>
                      <p className="text-sm"><strong>Ā</strong> — событие A не произошло («неудача»)</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                      <p className="text-sm"><strong>p</strong> — вероятность наступления A</p>
                      <p className="text-sm"><strong>q = 1 − p</strong> — вероятность ненаступления</p>
                      <MathFormula formula="p + q = 1" display />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Условия схемы Бернулли</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground list-disc ml-5">
                    <li>Фиксированное число <MathFormula formula="n" /> испытаний</li>
                    <li>В каждом испытании — два исхода (успех/неудача)</li>
                    <li>Вероятность <MathFormula formula="p" /> одинакова в каждом испытании</li>
                    <li>Испытания независимы друг от друга</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Дерево исходов (n = 3)</h3>
                  <BernoulliTree />
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Каждый путь от корня к листу — последовательность из 3 испытаний
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Вероятности для n = 3</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                      <p className="font-medium">k = 3 (все успехи):</p>
                      <MathFormula formula="P(AAA) = p^3" />
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                      <p className="font-medium">k = 0 (все неудачи):</p>
                      <MathFormula formula="P(\bar{A}\bar{A}\bar{A}) = q^3" />
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                      <p className="font-medium">k = 2 (ровно 2 успеха):</p>
                      <MathFormula formula="3 \text{ пути} \times p^2q = 3p^2q" />
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                      <p className="font-medium">k = 1 (ровно 1 успех):</p>
                      <MathFormula formula="3 \text{ пути} \times pq^2 = 3pq^2" />
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                  <h3 className="font-semibold text-center">Формула Бернулли</h3>
                  <p className="text-sm text-center text-muted-foreground">
                    Вероятность ровно <MathFormula formula="k" /> успехов в <MathFormula formula="n" /> испытаниях:
                  </p>
                  <MathFormula formula="P(p, n, k) = C_n^k \cdot p^k \cdot q^{n-k} = \binom{n}{k} p^k (1-p)^{n-k}" display />
                  <p className="text-xs text-center text-muted-foreground">
                    где <MathFormula formula="0 \leq k \leq n" />, а <MathFormula formula="C_n^k" /> — биномиальный коэффициент
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Числовые примеры</h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border bg-card space-y-2">
                      <p className="text-sm font-medium">Задача 1: Монета подбрасывается 5 раз. Какова вероятность ровно 3 орлов?</p>
                      <MathFormula formula="P = C_5^3 \cdot \left(\frac{1}{2}\right)^3 \cdot \left(\frac{1}{2}\right)^2 = 10 \cdot \frac{1}{32} = \frac{10}{32} = 0.3125" display />
                    </div>
                    <div className="p-4 rounded-lg border bg-card space-y-2">
                      <p className="text-sm font-medium">Задача 2: Вероятность правильного ответа на вопрос теста — 0.7. Из 10 вопросов, какова P ровно 8 верных?</p>
                      <MathFormula formula="P = C_{10}^8 \cdot 0.7^8 \cdot 0.3^2 = 45 \cdot 0.05765 \cdot 0.09 \approx 0.2335" display />
                    </div>
                  </div>
                </div>

                <Example
                  title="Пример из психологии: Эффективность терапии"
                  statNote="Схема Бернулли — теоретическая основа биномиального теста (binomial test), который применяется для проверки гипотезы о доле. Например, отличается ли процент выздоровлений от случайного уровня. При большом n биномиальное приближается к нормальному (ЦПТ), что связывает эту тему с z-тестами."
                >
                  <p>Из 20 пациентов, прошедших КБТ-терапию, у 15 наблюдается значительное улучшение.</p>
                  <p>Если без терапии улучшение наступает с вероятностью <MathFormula formula="p = 0.5" />, насколько необычен такой результат?</p>
                  <MathFormula formula="P(X \geq 15) = \sum_{k=15}^{20} C_{20}^k \cdot 0.5^{20}" display />
                  <MathFormula formula="P(X \geq 15) \approx 0.0207" display />
                  <p className="font-medium text-primary">P ≈ 0.021 &lt; 0.05 — результат статистически значим! Можно заключить, что терапия эффективнее случайного улучшения.</p>
                </Example>

                <div className="p-4 rounded-lg bg-info/5 border border-info/20">
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-info mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">Связь с другими разделами</p>
                      <ul className="text-muted-foreground space-y-1 list-disc ml-4">
                        <li>При больших <MathFormula formula="n" /> биномиальное распределение приближается к нормальному → <strong>Центральная предельная теорема</strong></li>
                        <li>Условие <MathFormula formula="np \geq 5" /> и <MathFormula formula="nq \geq 5" /> → можно использовать z-приближение</li>
                        <li>Обобщение на несколько исходов → <strong>мультиномиальное распределение</strong> (основа хи-квадрат теста)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ========== QUIZ SECTION ========== */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5, delay: 0.2 }} className="mt-12">
          <Quiz
            title="Проверка понимания: Теория вероятностей"
            description="Ответьте на вопросы, чтобы закрепить знания основных формул и концепций."
            questions={quizQuestions}
          />
        </motion.div>
        </AutoTermify>
      </div>
    </div>
  );
};

/* ========== QUIZ QUESTIONS ========== */
const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    question: 'В ящике 10 шариков: 3 красных и 7 синих. Какова вероятность вытащить красный шарик?',
    options: ['0.3', '0.7', '0.5', '0.15'],
    correctAnswer: '0',
    explanation: 'P(красный) = количество красных / всего шариков = 3/10 = 0.3. Это классическое определение вероятности для равновозможных исходов.',
  },
  {
    id: 'q2',
    type: 'multiple-choice',
    question: 'Какая операция над событиями используется для описания "произошло A ИЛИ B"?',
    options: ['Объединение (∪)', 'Пересечение (∩)', 'Дополнение (Ā)', 'Разность (A−B)'],
    correctAnswer: '0',
    explanation: 'Объединение A ∪ B описывает событие, когда произошло хотя бы одно из событий A или B. Формула: P(A ∪ B) = P(A) + P(B) − P(A ∩ B).',
  },
  {
    id: 'q3',
    type: 'multiple-choice',
    question: 'Сколько способов упорядочить 5 различных предметов?',
    options: ['20', '120', '25', '10'],
    correctAnswer: '1',
    explanation: 'Количество перестановок n элементов: P(n) = n! = 5! = 120. Это применяется в статистике при планировании экспериментов (контрбалансировка порядка условий).',
  },
  {
    id: 'q4',
    type: 'calculation',
    question: 'Сколько способов выбрать 3 человека из группы в 10 человек (порядок не важен)?',
    formula: 'C_{n}^{k} = \\frac{n!}{k!(n-k)!}',
    correctAnswer: 120,
    tolerance: 0.1,
    explanation: 'C(10,3) = 10!/(3!×7!) = (10×9×8)/(3×2×1) = 720/6 = 120. Сочетания используются в планировании выборок и расчёте вероятностей в биномиальном тесте.',
  },
  {
    id: 'q5',
    type: 'multiple-choice',
    question: 'Если P(A) = 0.4, чему равна P(Ā) (вероятность противоположного события)?',
    options: ['0.4', '0.6', '0.2', '0.8'],
    correctAnswer: '1',
    explanation: 'P(Ā) = 1 − P(A) = 1 − 0.4 = 0.6. Формула противоположного события — одна из ключевых в теории вероятностей и широко используется в статистике.',
  },
  {
    id: 'q6',
    type: 'multiple-choice',
    question: 'Формула Байеса используется для вычисления:',
    options: ['Условной вероятности апостериори', 'Суммарной вероятности', 'Перестановок', 'Стандартного отклонения'],
    correctAnswer: '0',
    explanation: 'Формула Байеса P(B|A) = P(A|B)×P(B)/P(A) позволяет пересчитать вероятность гипотезы при новых данных. В статистике используется в байесовском анализе и диагностических тестах (расчёт положительной/отрицательной прогностической ценности).',
  },
  {
    id: 'q7',
    type: 'calculation',
    question: 'Вероятность успеха p = 0.6. Какова вероятность ровно 2 успехов в 3 независимых испытаниях?',
    formula: 'P(X = k) = C_n^k p^k (1-p)^{n-k}',
    correctAnswer: 0.432,
    tolerance: 0.01,
    explanation: 'P(X=2) = C(3,2) × 0.6² × 0.4¹ = 3 × 0.36 × 0.4 = 0.432. Это формула Бернулли — базис для биномиального теста в статистике, часто применяется при анализе бинарных исходов (успех/неудача).',
  },
  {
    id: 'q8',
    type: 'multiple-choice',
    question: 'Два события называются несовместными, если:',
    options: ['Они не могут произойти одновременно', 'Они независимы', 'Одно содержит другое', 'Сумма их вероятностей равна 1'],
    correctAnswer: '0',
    explanation: 'Несовместные события: A ∩ B = ∅, т.е. P(A ∩ B) = 0. Для них P(A ∪ B) = P(A) + P(B). Это важно в статистике при работе с категориальными данными и непересекающимися группами.',
  },
  {
    id: 'q9',
    type: 'multiple-choice',
    question: 'Вероятность события A дано условие B обозначается как:',
    options: ['P(A|B)', 'P(A∩B)', 'P(A∪B)', 'P(Ā)'],
    correctAnswer: '0',
    explanation: 'P(A|B) — условная вероятность события A при условии, что произошло событие B. Формула: P(A|B) = P(A∩B)/P(B). Широко используется в статистике для анализа чувствительности и специфичности диагностических тестов.',
  },
  {
    id: 'q10',
    type: 'calculation',
    question: 'Монета подбрасывается 4 раза. Какова вероятность получить ровно 3 орла? (Ответ дайте в виде дроби или десятичного числа)',
    formula: 'P(X = 3) = C_4^3 \\cdot (0.5)^3 \\cdot (0.5)^1',
    correctAnswer: 0.25,
    tolerance: 0.01,
    explanation: 'P(X=3) = C(4,3) × (0.5)³ × (0.5)¹ = 4 × 0.125 × 0.5 = 0.25. Применение схемы Бернулли для одинаково вероятных исходов — практический пример, часто встречающийся в статистических тестах и моделировании случайных процессов.',
  },
];

export default ProbabilityTheoryPage;
