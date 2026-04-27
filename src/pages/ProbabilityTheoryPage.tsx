import { useState } from 'react';
import { Header } from '@/components/Header';
import { MathFormula } from '@/components/MathFormula';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Lightbulb, BarChart3, BookOpen } from 'lucide-react';
import { QuizQuestion } from '@/components/Quiz';
import { AutoTermify } from '@/components/AutoTermify';
import { TheoryLayout, TheorySection } from '@/components/theory/TheoryLayout';

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
    <line x1="40" y1="130" x2="140" y2="60" className="stroke-primary" strokeWidth="1.5"/>
    <line x1="40" y1="130" x2="140" y2="200" className="stroke-destructive" strokeWidth="1.5"/>
    <text x="80" y="82" className="fill-primary text-[10px] font-medium">p</text>
    <text x="80" y="180" className="fill-destructive text-[10px] font-medium">q</text>
    <line x1="140" y1="60" x2="240" y2="30" className="stroke-primary" strokeWidth="1.2"/>
    <line x1="140" y1="60" x2="240" y2="90" className="stroke-destructive" strokeWidth="1.2"/>
    <text x="182" y="36" className="fill-primary text-[9px]">p</text>
    <text x="182" y="86" className="fill-destructive text-[9px]">q</text>
    <line x1="140" y1="200" x2="240" y2="170" className="stroke-primary" strokeWidth="1.2"/>
    <line x1="140" y1="200" x2="240" y2="230" className="stroke-destructive" strokeWidth="1.2"/>
    <text x="182" y="176" className="fill-primary text-[9px]">p</text>
    <text x="182" y="226" className="fill-destructive text-[9px]">q</text>
    {[[30,10,50],[90,70,110],[170,150,190],[230,210,250]].map(([y, y1, y2], i) => (
      <g key={i}>
        <line x1="240" y1={y} x2="320" y2={y1} className="stroke-primary" strokeWidth="1"/>
        <line x1="240" y1={y} x2="320" y2={y2} className="stroke-destructive" strokeWidth="1"/>
      </g>
    ))}
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

/* ========== QUIZ QUESTIONS ========== */
const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    question: 'В ящике 10 шариков: 3 красных и 7 синих. Какова вероятность вытащить красный шарик?',
    options: ['0.3', '0.7', '0.5', '0.15'],
    correctAnswer: '0',
    explanation: 'P(красный) = 3/10 = 0.3.',
  },
  {
    id: 'q2',
    type: 'multiple-choice',
    question: 'Какая операция над событиями описывает "произошло A ИЛИ B"?',
    options: ['Объединение (∪)', 'Пересечение (∩)', 'Дополнение (Ā)', 'Разность (A−B)'],
    correctAnswer: '0',
    explanation: 'A ∪ B описывает событие, когда произошло хотя бы одно из A или B.',
  },
  {
    id: 'q3',
    type: 'multiple-choice',
    question: 'Сколько способов упорядочить 5 различных предметов?',
    options: ['20', '120', '25', '10'],
    correctAnswer: '1',
    explanation: 'P(5) = 5! = 120.',
  },
  {
    id: 'q4',
    type: 'calculation',
    question: 'Сколько способов выбрать 3 человека из 10 (порядок не важен)?',
    formula: 'C_{n}^{k} = \\frac{n!}{k!(n-k)!}',
    correctAnswer: 120,
    tolerance: 0.1,
    explanation: 'C(10,3) = 120.',
  },
  {
    id: 'q5',
    type: 'multiple-choice',
    question: 'Если P(A) = 0.4, чему равна P(Ā)?',
    options: ['0.4', '0.6', '0.2', '0.8'],
    correctAnswer: '1',
    explanation: 'P(Ā) = 1 − 0.4 = 0.6.',
  },
  {
    id: 'q6',
    type: 'multiple-choice',
    question: 'Формула Байеса используется для вычисления:',
    options: ['Условной вероятности апостериори', 'Суммарной вероятности', 'Перестановок', 'Стандартного отклонения'],
    correctAnswer: '0',
    explanation: 'Байес позволяет пересчитать вероятность гипотезы при новых данных.',
  },
  {
    id: 'q7',
    type: 'calculation',
    question: 'p = 0.6. Какова вероятность ровно 2 успехов в 3 независимых испытаниях?',
    formula: 'P(X = k) = C_n^k p^k (1-p)^{n-k}',
    correctAnswer: 0.432,
    tolerance: 0.01,
    explanation: 'C(3,2) × 0.6² × 0.4¹ = 3 × 0.36 × 0.4 = 0.432.',
  },
];

/* ===== Sections ===== */

const sections: TheorySection[] = [
  {
    id: 'events',
    kicker: 'Множества',
    title: 'Случайные события',
    intro: 'Операции над событиями и их визуализация через диаграммы Венна формируют базовый язык теории вероятностей.',
    takeaways: [
      'Что такое Ω, событие и его вероятность',
      'Как читать диаграммы Венна (объединение, пересечение, дополнение)',
      'Ключевые формулы сложения и условной вероятности',
    ],
    pitfalls: [
      'Складывать вероятности совместных событий без вычитания пересечения.',
      'Путать P(A|B) и P(B|A) — это разные величины (парадокс базовой частоты).',
    ],
    summary: 'События — это подмножества Ω. Все вероятности живут в [0; 1] и подчиняются формулам сложения и умножения.',
    body: (
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Основные определения</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><strong>Ω</strong> — множество всех возможных результатов эксперимента.</li>
            <li><strong>Событие A</strong> — подмножество Ω.</li>
            <li><strong>Вероятность</strong>: <MathFormula formula="P(A) = \frac{|A|}{|\Omega|}" /> (для равновозможных исходов).</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Операции над событиями</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <VennSubset />
              <p className="text-xs text-center text-muted-foreground"><strong>A ⊂ B</strong> — A влечёт B</p>
            </div>
            <div className="space-y-2">
              <VennUnion />
              <p className="text-xs text-center text-muted-foreground"><strong>A ∪ B</strong> — хотя бы одно</p>
            </div>
            <div className="space-y-2">
              <VennIntersection />
              <p className="text-xs text-center text-muted-foreground"><strong>A ∩ B</strong> — оба одновременно</p>
            </div>
            <div className="space-y-2">
              <VennDifference />
              <p className="text-xs text-center text-muted-foreground"><strong>A − B</strong> — A, но не B</p>
            </div>
            <div className="space-y-2">
              <VennComplement />
              <p className="text-xs text-center text-muted-foreground"><strong>Ā</strong> — противоположное</p>
            </div>
            <div className="space-y-2">
              <VennMutuallyExclusive />
              <p className="text-xs text-center text-muted-foreground"><strong>AB = ∅</strong> — несовместные</p>
            </div>
          </div>
        </div>

        <Example
          title="Пример: Диагностический тест в психологии"
          statNote="Операции над событиями лежат в основе расчёта чувствительности и специфичности."
        >
          <p>Пусть <strong>A</strong> — тест положительный, <strong>B</strong> — пациент имеет депрессию.</p>
          <p>Тогда <MathFormula formula="A \cap B" /> — истинно-положительный, <MathFormula formula="A \cap \bar{B}" /> — ложно-положительный.</p>
          <p>Чувствительность = <MathFormula formula="P(A | B)" />, специфичность = <MathFormula formula="P(\bar{A} | \bar{B})" />.</p>
        </Example>
      </div>
    ),
    formulas: [
      { tex: 'P(A + B) = P(A) + P(B)', label: 'Сложение (несовместные)' },
      { tex: 'P(A \\cup B) = P(A) + P(B) - P(A \\cap B)', label: 'Сложение (общий случай)' },
      { tex: 'P(A | B) = \\frac{P(A \\cap B)}{P(B)}', label: 'Условная вероятность' },
      { tex: 'P(\\bar{A}) = 1 - P(A)', label: 'Противоположное событие' },
    ],
  },
  {
    id: 'combinatorics',
    kicker: 'Комбинаторика',
    title: 'Перестановки, размещения, сочетания',
    intro: 'Комбинаторика даёт инструменты для подсчёта числа исходов. Это фундамент классической вероятности и биномиального распределения.',
    takeaways: [
      'Различать перестановки, размещения и сочетания',
      'Применять формулы P(n), A(n,m), C(n,k)',
      'Понимать связь сочетаний с биномиальным коэффициентом',
    ],
    pitfalls: [
      'Путать A(n,m) и C(n,k) — порядок vs без порядка.',
      'Забывать, что 0! = 1 и C(n,0) = 1.',
    ],
    summary: 'Порядок важен → размещения. Не важен → сочетания. Все элементы → перестановки.',
    formulas: [
      { tex: 'P_n = n!', label: 'Перестановки' },
      { tex: 'A_n^m = \\frac{n!}{(n-m)!}', label: 'Размещения' },
      { tex: 'C_n^k = \\binom{n}{k} = \\frac{n!}{k!(n-k)!}', label: 'Сочетания' },
      { tex: 'C_n^k = \\frac{A_n^k}{k!}', label: 'Связь' },
    ],
    body: (
      <div className="space-y-6">
        <div className="p-5 border-3 border-foreground bg-card space-y-3">
          <h3 className="font-heading uppercase text-lg">Перестановки</h3>
          <p className="text-sm text-muted-foreground">Количество способов упорядочить <MathFormula formula="n" /> различных элементов.</p>
          <Example
            title="Пример: Порядок предъявления стимулов"
            statNote="В экспериментальной психологии перестановки используются для контрбалансировки."
          >
            <p>Сколькими способами можно упорядочить 4 условия?</p>
            <MathFormula formula="P_4 = 4! = 24" display />
          </Example>
        </div>

        <div className="p-5 border-3 border-foreground bg-card space-y-3">
          <h3 className="font-heading uppercase text-lg">Размещения</h3>
          <p className="text-sm text-muted-foreground">Выбрать <MathFormula formula="m" /> из <MathFormula formula="n" /> <strong>с учётом порядка</strong>.</p>
          <Example
            title="Пример: Призовые места"
            statNote="Размещения используются в задачах ранжирования (Вилкоксон, Манна–Уитни)."
          >
            <p>Из 10 участников выбрать 3-х (1, 2, 3 место):</p>
            <MathFormula formula="A_{10}^3 = 10 \cdot 9 \cdot 8 = 720" display />
          </Example>
        </div>

        <div className="p-5 border-3 border-foreground bg-card space-y-3">
          <h3 className="font-heading uppercase text-lg">Сочетания</h3>
          <p className="text-sm text-muted-foreground">Выбрать <MathFormula formula="k" /> из <MathFormula formula="n" /> <strong>без учёта порядка</strong>.</p>
          <Example
            title="Пример: Формирование групп"
            statNote="Число попарных сравнений = C(k,2). Поэтому нужна поправка Бонферрони."
          >
            <p>Из 20 студентов выбрать 8:</p>
            <MathFormula formula="C_{20}^8 = 125\,970" display />
          </Example>
        </div>
      </div>
    ),
  },
  {
    id: 'total',
    kicker: 'Полная вероятность',
    title: 'Формула полной вероятности и Байеса',
    intro: 'Когда событие может произойти при разных условиях, его вероятность вычисляется через разбиение на гипотезы. Формула Байеса позволяет «перевернуть» вывод.',
    takeaways: [
      'Когда применять формулу полной вероятности',
      'Как использовать формулу Байеса',
      'Как работает парадокс базовой частоты',
    ],
    pitfalls: [
      'Игнорировать априорную вероятность (P(H)) — главная ошибка диагностики.',
      'Использовать неполную группу гипотез (сумма ≠ 1).',
    ],
    summary: 'P(A) = Σ P(A|Hᵢ) P(Hᵢ). Байес = Бритва Оккама в количественной форме.',
    formulas: [
      { tex: 'P(A) = \\sum_{i=1}^{n} P(A | H_i) \\cdot P(H_i)', label: 'Полная вероятность' },
      { tex: 'P(H_i | A) = \\frac{P(A | H_i) \\cdot P(H_i)}{\\sum_{j} P(A | H_j) \\cdot P(H_j)}', label: 'Формула Байеса' },
    ],
    body: (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Пусть <MathFormula formula="H_1, \ldots, H_n" /> — полная группа несовместных гипотез: <MathFormula formula="\sum P(H_i) = 1" />.
        </p>

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
            <ellipse cx="200" cy="60" rx="130" ry="30" className="fill-none stroke-destructive" strokeWidth="2" strokeDasharray="4 2"/>
            <text x="200" y="25" textAnchor="middle" className="fill-destructive text-[11px] font-bold">A</text>
          </svg>
        </div>

        <Example
          title="Парадокс базовой частоты"
          statNote="Объясняет, почему точный тест даёт много ложно-положительных при низкой распространённости."
        >
          <p>Распространённость: <MathFormula formula="P(H_1) = 0.05" />. Чувствительность: <MathFormula formula="P(+|H_1) = 0.90" />. Специфичность: <MathFormula formula="P(-|H_2) = 0.85" />.</p>
          <MathFormula formula="P(H_1|+) = \frac{0.90 \times 0.05}{0.90 \times 0.05 + 0.15 \times 0.95} \approx 0.24" display />
          <p className="font-medium text-primary">Только 24%! Большинство положительных результатов — ложные.</p>
        </Example>
      </div>
    ),
  },
  {
    id: 'bernoulli',
    kicker: 'Распределения',
    title: 'Схема Бернулли',
    intro: 'Серия независимых испытаний с двумя исходами — фундамент биномиального распределения и многих статистических тестов.',
    takeaways: [
      'Что такое испытание Бернулли и его условия',
      'Как использовать формулу Бернулли',
      'Связь схемы Бернулли с биномиальным тестом и ЦПТ',
    ],
    labPath: '/labs/binomial',
    labLabel: 'Лаба «Биномиальное»',
    pitfalls: [
      'Применять схему при зависимых испытаниях.',
      'Считать, что p должно равняться 0.5 — это не так.',
    ],
    summary: 'P(X=k) = C(n,k) · pᵏ · qⁿ⁻ᵏ. При больших n распределение приближается к нормальному (ЦПТ).',
    formulas: [
      { tex: 'p + q = 1', label: 'Условие' },
      { tex: 'P(p, n, k) = C_n^k \\cdot p^k \\cdot q^{n-k}', label: 'Формула Бернулли' },
    ],
    quizTitle: 'Проверка понимания: Теория вероятностей',
    quizQuestions,
    body: (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Условия схемы Бернулли</h3>
          <ul className="space-y-1 text-sm text-muted-foreground list-disc ml-5">
            <li>Фиксированное число <MathFormula formula="n" /> испытаний</li>
            <li>В каждом испытании — два исхода (успех/неудача)</li>
            <li>Вероятность <MathFormula formula="p" /> одинакова в каждом испытании</li>
            <li>Испытания независимы</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Дерево исходов (n = 3)</h3>
          <BernoulliTree />
        </div>

        <div className="space-y-4">
          <div className="p-4 border-3 border-foreground bg-card space-y-2">
            <p className="text-sm font-medium">Задача: Монета подбрасывается 5 раз. P ровно 3 орлов?</p>
            <MathFormula formula="P = C_5^3 \cdot 0.5^3 \cdot 0.5^2 = 10/32 = 0.3125" display />
          </div>
          <div className="p-4 border-3 border-foreground bg-card space-y-2">
            <p className="text-sm font-medium">Задача: p = 0.7, n = 10. P ровно 8 верных?</p>
            <MathFormula formula="P = C_{10}^8 \cdot 0.7^8 \cdot 0.3^2 \approx 0.2335" display />
          </div>
        </div>

        <Example
          title="Эффективность терапии"
          statNote="Схема Бернулли — основа биномиального теста. При большом n ≈ нормальное распределение (ЦПТ)."
        >
          <p>Из 20 пациентов после КБТ у 15 наступило улучшение. При <MathFormula formula="p = 0.5" />:</p>
          <MathFormula formula="P(X \geq 15) \approx 0.0207" display />
          <p className="font-medium text-primary">P ≈ 0.021 &lt; 0.05 — терапия эффективнее случайного улучшения.</p>
        </Example>

        <div className="p-4 rounded-lg bg-info/5 border border-info/20">
          <div className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-info mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">Связь с другими разделами</p>
              <ul className="text-muted-foreground space-y-1 list-disc ml-4">
                <li>При больших <MathFormula formula="n" /> биномиальное → нормальное (ЦПТ)</li>
                <li>При <MathFormula formula="np \geq 5" /> и <MathFormula formula="nq \geq 5" /> → z-приближение</li>
                <li>Несколько исходов → мультиномиальное (база χ²)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

const ProbabilityTheoryPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <AutoTermify>
          <TheoryLayout
            pageKicker="// Теория"
            pageTitle="Теория вероятностей"
            pageDescription="Фундамент статистического анализа: от случайных событий и комбинаторики до формулы полной вероятности и схемы Бернулли."
            sections={sections}
          />
        </AutoTermify>
      </main>
    </div>
  );
};

export default ProbabilityTheoryPage;
