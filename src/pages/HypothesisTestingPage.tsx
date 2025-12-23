import { Header } from '@/components/Header';
import { MathFormula } from '@/components/MathFormula';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const tests = [
  {
    id: 'ttest-ind',
    name: 't-тест (независимые выборки)',
    description: 'Сравнение средних двух независимых групп',
    when: 'Две группы, интервальные данные, нормальное распределение',
    example: 'Сравнение уровня тревожности у мужчин и женщин',
    formula: 't = \\frac{M_1 - M_2}{\\sqrt{\\frac{s_1^2}{n_1} + \\frac{s_2^2}{n_2}}}',
    assumptions: [
      { text: 'Независимость наблюдений', important: true },
      { text: 'Нормальное распределение в группах', important: true },
      { text: 'Однородность дисперсий (проверить тестом Левена)', important: false },
    ],
    interpretation: 'Если p < 0.05, различия между группами статистически значимы',
  },
  {
    id: 'ttest-paired',
    name: 't-тест (связанные выборки)',
    description: 'Сравнение средних для парных измерений',
    when: 'Одна группа, два измерения (до/после)',
    example: 'Изменение самооценки до и после терапии',
    formula: 't = \\frac{M_d}{\\frac{s_d}{\\sqrt{n}}}',
    assumptions: [
      { text: 'Парные наблюдения', important: true },
      { text: 'Нормальное распределение разностей', important: true },
    ],
    interpretation: 'Если p < 0.05, изменения значимы',
  },
  {
    id: 'mannwhitney',
    name: 'U-критерий Манна–Уитни',
    description: 'Непараметрическая альтернатива t-тесту',
    when: 'Две независимые группы, ненормальное распределение или порядковые данные',
    example: 'Сравнение рангов удовлетворённости в двух организациях',
    formula: 'U = n_1 n_2 + \\frac{n_1(n_1+1)}{2} - R_1',
    assumptions: [
      { text: 'Независимость групп', important: true },
      { text: 'Порядковая шкала или выше', important: false },
    ],
    interpretation: 'Сравнивает ранговые распределения двух групп',
  },
  {
    id: 'wilcoxon',
    name: 'Критерий Уилкоксона',
    description: 'Непараметрический тест для связанных выборок',
    when: 'Парные измерения, ненормальное распределение',
    example: 'Изменение оценок стресса до/после интервенции',
    formula: 'W = \\sum R_+ \\text{ или } \\sum R_-',
    assumptions: [
      { text: 'Парные наблюдения', important: true },
      { text: 'Симметричное распределение разностей', important: false },
    ],
    interpretation: 'Оценивает сдвиг в данных без предположения о нормальности',
  },
  {
    id: 'anova',
    name: 'Однофакторный дисперсионный анализ (ANOVA)',
    description: 'Сравнение средних трёх и более групп',
    when: 'Три+ независимые группы, интервальные данные',
    example: 'Сравнение эффективности трёх методов терапии',
    formula: 'F = \\frac{MS_{between}}{MS_{within}}',
    assumptions: [
      { text: 'Независимость наблюдений', important: true },
      { text: 'Нормальное распределение', important: true },
      { text: 'Однородность дисперсий', important: true },
    ],
    interpretation: 'F-тест показывает, есть ли различия между группами (но не какие именно)',
  },
  {
    id: 'chisquare',
    name: 'Критерий χ² (хи-квадрат)',
    description: 'Анализ связи между категориальными переменными',
    when: 'Две категориальные переменные, таблица сопряжённости',
    example: 'Связь между полом и предпочтением типа терапии',
    formula: '\\chi^2 = \\sum \\frac{(O - E)^2}{E}',
    assumptions: [
      { text: 'Независимость наблюдений', important: true },
      { text: 'Ожидаемые частоты ≥ 5 в каждой ячейке', important: true },
    ],
    interpretation: 'Если p < 0.05, переменные связаны',
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
              Проверка статистических гипотез
            </h1>
            <p className="text-muted-foreground text-lg">
              Пошаговые руководства по выбору и интерпретации статистических критериев
            </p>
          </div>

          {/* Decision Helper */}
          <Card className="mb-8 border-primary/20">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Как выбрать критерий?
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Сколько групп сравниваете?</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary">2 группы</Badge>
                      <span>→ t-тест или Манна–Уитни</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary">3+ группы</Badge>
                      <span>→ ANOVA или Краскела–Уоллиса</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Данные нормально распределены?</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>Да → Параметрические (t-тест, ANOVA)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-destructive" />
                      <span>Нет → Непараметрические (Манна–Уитни, Уилкоксон)</span>
                    </li>
                  </ul>
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
                  {test.name.split(' ')[0]}
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

                    {/* Interpretation */}
                    <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                      <h4 className="font-semibold mb-2 text-success">Интерпретация результата</h4>
                      <p className="text-sm">{test.interpretation}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default HypothesisTestingPage;
