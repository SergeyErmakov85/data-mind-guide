import { Header } from '@/components/Header';
import { MathFormula } from '@/components/MathFormula';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Info, ArrowRight } from 'lucide-react';

const tests = [
  {
    id: 'ttest-ind',
    name: 't-тест (независимые выборки)',
    shortName: 't-тест',
    description: 'Сравнение средних двух независимых групп',
    when: 'Две группы, интервальные данные, нормальное распределение',
    example: 'Сравнение уровня тревожности у мужчин и женщин',
    formula: 't = \\frac{M_1 - M_2}{\\sqrt{\\frac{s_1^2}{n_1} + \\frac{s_2^2}{n_2}}}',
    assumptions: [
      { text: 'Независимость наблюдений', important: true },
      { text: 'Нормальное распределение в группах', important: true },
      { text: 'Однородность дисперсий (проверить тестом Левена)', important: false },
    ],
    effectSize: "d Коэна = (M₁ - M₂) / SD_pooled",
    effectInterpretation: "d = 0.2 (малый), 0.5 (средний), 0.8 (большой)",
  },
  {
    id: 'ttest-paired',
    name: 't-тест (связанные выборки)',
    shortName: 'Парный t',
    description: 'Сравнение средних для парных измерений',
    when: 'Одна группа, два измерения (до/после)',
    example: 'Изменение самооценки до и после терапии',
    formula: 't = \\frac{M_d}{\\frac{s_d}{\\sqrt{n}}}',
    assumptions: [
      { text: 'Парные наблюдения', important: true },
      { text: 'Нормальное распределение разностей', important: true },
    ],
    effectSize: "d Коэна = M_d / SD_d",
    effectInterpretation: "d = 0.2 (малый), 0.5 (средний), 0.8 (большой)",
  },
  {
    id: 'mannwhitney',
    name: 'U-критерий Манна–Уитни',
    shortName: 'Манна–Уитни',
    description: 'Непараметрическая альтернатива t-тесту',
    when: 'Две независимые группы, ненормальное распределение или порядковые данные',
    example: 'Сравнение рангов удовлетворённости в двух организациях',
    formula: 'U = n_1 n_2 + \\frac{n_1(n_1+1)}{2} - R_1',
    assumptions: [
      { text: 'Независимость групп', important: true },
      { text: 'Порядковая шкала или выше', important: false },
    ],
    effectSize: "r = Z / √N",
    effectInterpretation: "r = 0.1 (малый), 0.3 (средний), 0.5 (большой)",
  },
  {
    id: 'wilcoxon',
    name: 'Критерий Уилкоксона',
    shortName: 'Уилкоксон',
    description: 'Непараметрический тест для связанных выборок',
    when: 'Парные измерения, ненормальное распределение',
    example: 'Изменение оценок стресса до/после интервенции',
    formula: 'W = \\sum R_+ \\text{ или } \\sum R_-',
    assumptions: [
      { text: 'Парные наблюдения', important: true },
      { text: 'Симметричное распределение разностей', important: false },
    ],
    effectSize: "r = Z / √N",
    effectInterpretation: "r = 0.1 (малый), 0.3 (средний), 0.5 (большой)",
  },
  {
    id: 'chisquare',
    name: 'Критерий χ² (хи-квадрат)',
    shortName: 'χ²',
    description: 'Анализ связи между категориальными переменными',
    when: 'Две категориальные переменные, таблица сопряжённости',
    example: 'Связь между полом и предпочтением типа терапии',
    formula: '\\chi^2 = \\sum \\frac{(O - E)^2}{E}',
    assumptions: [
      { text: 'Независимость наблюдений', important: true },
      { text: 'Ожидаемые частоты ≥ 5 в каждой ячейке', important: true },
    ],
    effectSize: "V Крамера = √(χ²/(N × (k-1)))",
    effectInterpretation: "V = 0.1 (малый), 0.3 (средний), 0.5 (большой)",
  },
];

const HypothesisTestingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Справочник статистических критериев
            </h1>
            <p className="text-muted-foreground text-lg">
              Выбор критерия, формулы, условия применимости и размер эффекта
            </p>
          </div>

          {/* Decision Tree */}
          <Card className="mb-8 border-primary/20">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Алгоритм выбора критерия
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Badge variant="outline" className="shrink-0 mt-1">Шаг 1</Badge>
                  <div>
                    <p className="font-medium">Определите тип переменных</p>
                    <p className="text-sm text-muted-foreground">
                      Категориальные → χ² | Количественные → переходите к шагу 2
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Badge variant="outline" className="shrink-0 mt-1">Шаг 2</Badge>
                  <div>
                    <p className="font-medium">Сколько групп?</p>
                    <p className="text-sm text-muted-foreground">
                      2 группы → t-тест или Манна–Уитни | 3+ группы → ANOVA или Краскела–Уоллиса
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Badge variant="outline" className="shrink-0 mt-1">Шаг 3</Badge>
                  <div>
                    <p className="font-medium">Группы связанные или независимые?</p>
                    <p className="text-sm text-muted-foreground">
                      Связанные (до/после) → парные тесты | Независимые → тесты для независимых выборок
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Badge variant="outline" className="shrink-0 mt-1">Шаг 4</Badge>
                  <div>
                    <p className="font-medium">Данные нормально распределены?</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-sm">
                        <CheckCircle className="w-4 h-4 text-success" />
                        Да → Параметрические
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm">
                        <XCircle className="w-4 h-4 text-destructive" />
                        Нет → Непараметрические
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tests Tabs */}
          <Tabs defaultValue="ttest-ind">
            <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 mb-6">
              {tests.map((test) => (
                <TabsTrigger 
                  key={test.id} 
                  value={test.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {test.shortName}
                </TabsTrigger>
              ))}
            </TabsList>

            {tests.map((test) => (
              <TabsContent key={test.id} value={test.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{test.name}</CardTitle>
                    <CardDescription>{test.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* When to use */}
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-semibold mb-2 text-primary">Когда применять?</h4>
                      <p className="text-sm">{test.when}</p>
                    </div>

                    {/* Example */}
                    <div className="example-box">
                      <h4 className="font-semibold mb-2">Пример из психологии</h4>
                      <p className="text-sm text-muted-foreground">{test.example}</p>
                    </div>

                    {/* Formula */}
                    <div>
                      <h4 className="font-semibold mb-3">Формула</h4>
                      <div className="formula-box">
                        <MathFormula formula={test.formula} display={true} />
                      </div>
                    </div>

                    {/* Assumptions */}
                    <div>
                      <h4 className="font-semibold mb-3">Условия применимости</h4>
                      <ul className="space-y-2">
                        {test.assumptions.map((assumption, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            {assumption.important ? (
                              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                            )}
                            <span className="text-sm">{assumption.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Effect Size */}
                    <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                      <h4 className="font-semibold mb-2 text-info">Размер эффекта</h4>
                      <p className="text-sm font-mono mb-2">{test.effectSize}</p>
                      <p className="text-sm text-muted-foreground">{test.effectInterpretation}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* Reporting Guidelines */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Как описывать результаты (APA)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h5 className="font-medium mb-2">t-тест</h5>
                  <p className="text-sm text-muted-foreground font-mono">
                    t(df) = X.XX, p = .XXX, d = X.XX
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Пример: t(48) = 2.34, p = .023, d = 0.67
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h5 className="font-medium mb-2">χ² (хи-квадрат)</h5>
                  <p className="text-sm text-muted-foreground font-mono">
                    χ²(df, N = XX) = X.XX, p = .XXX, V = X.XX
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Пример: χ²(2, N = 150) = 8.45, p = .015, V = 0.24
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h5 className="font-medium mb-2">Манна–Уитни</h5>
                  <p className="text-sm text-muted-foreground font-mono">
                    U = XXX, p = .XXX, r = X.XX
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Пример: U = 245, p = .031, r = 0.28
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h5 className="font-medium mb-2">Уилкоксон</h5>
                  <p className="text-sm text-muted-foreground font-mono">
                    W = XXX, p = .XXX, r = X.XX
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Пример: W = 156, p = .008, r = 0.42
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HypothesisTestingPage;
