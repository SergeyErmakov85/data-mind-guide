import { Header } from '@/components/Header';
import { MathFormula } from '@/components/MathFormula';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Lightbulb, AlertCircle } from 'lucide-react';

const TheoryPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Теоретические основы статистики
            </h1>
            <p className="text-muted-foreground text-lg">
              Изучите ключевые концепции статистического анализа с примерами из психологии
            </p>
          </div>

          <Tabs defaultValue="intro" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="intro">Введение</TabsTrigger>
              <TabsTrigger value="descriptive">Описательная</TabsTrigger>
              <TabsTrigger value="inference">Выводная</TabsTrigger>
              <TabsTrigger value="pvalue">p-value</TabsTrigger>
            </TabsList>

            <TabsContent value="intro" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Зачем психологу статистика?
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none">
                  <p>
                    Статистика — это инструмент для принятия обоснованных решений на основе данных. 
                    В психологии она помогает:
                  </p>
                  <ul className="space-y-2 mt-4">
                    <li>Определить, действительно ли терапия эффективна</li>
                    <li>Выявить связи между переменными (например, стресс и производительность)</li>
                    <li>Обобщить результаты исследования на более широкую популяцию</li>
                    <li>Избежать ложных выводов, вызванных случайностью</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="example-box">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Пример из практики</h4>
                    <p className="text-muted-foreground">
                      Исследователь изучает влияние медитации на уровень тревожности. 
                      Без статистики он не сможет понять: снижение тревожности — результат 
                      медитации или просто случайное колебание?
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="descriptive" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Описательная статистика</CardTitle>
                  <CardDescription>
                    Методы для обобщения и представления данных
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Меры центральной тенденции</h4>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h5 className="font-medium mb-2">Среднее арифметическое (M)</h5>
                        <p className="text-sm text-muted-foreground mb-3">
                          Сумма всех значений, делённая на их количество
                        </p>
                        <div className="formula-box">
                          <MathFormula 
                            formula="M = \frac{\sum_{i=1}^{n} x_i}{n}" 
                            display={true}
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h5 className="font-medium mb-2">Медиана (Me)</h5>
                        <p className="text-sm text-muted-foreground">
                          Значение, которое делит упорядоченный ряд пополам. 
                          Устойчива к выбросам — идеальна для асимметричных распределений.
                        </p>
                      </div>

                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h5 className="font-medium mb-2">Мода (Mo)</h5>
                        <p className="text-sm text-muted-foreground">
                          Наиболее часто встречающееся значение. Единственная мера для 
                          номинальных данных (например, тип личности).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Меры изменчивости</h4>
                    
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h5 className="font-medium mb-2">Стандартное отклонение (σ или SD)</h5>
                      <p className="text-sm text-muted-foreground mb-3">
                        Показывает, насколько значения в среднем отклоняются от среднего
                      </p>
                      <div className="formula-box">
                        <MathFormula 
                          formula="SD = \sqrt{\frac{\sum_{i=1}^{n} (x_i - M)^2}{n-1}}" 
                          display={true}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="example-box">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Интерпретация SD в психологии</h4>
                    <p className="text-muted-foreground">
                      Если средний балл по шкале тревожности <MathFormula formula="M = 45" />, а <MathFormula formula="SD = 10" />, 
                      то примерно 68% испытуемых имеют баллы от 35 до 55 (в пределах ±1 SD).
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="inference" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Выводная статистика</CardTitle>
                  <CardDescription>
                    Делаем выводы о популяции на основе выборки
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Ключевые понятия</h4>
                    
                    <div className="grid gap-4">
                      <div className="p-4 border border-border rounded-lg">
                        <h5 className="font-medium text-primary mb-2">Генеральная совокупность</h5>
                        <p className="text-sm text-muted-foreground">
                          Все объекты, о которых мы хотим сделать вывод. 
                          Например, все студенты-психологи России.
                        </p>
                      </div>
                      
                      <div className="p-4 border border-border rounded-lg">
                        <h5 className="font-medium text-primary mb-2">Выборка</h5>
                        <p className="text-sm text-muted-foreground">
                          Часть генеральной совокупности, которую мы реально изучаем. 
                          Должна быть репрезентативной.
                        </p>
                      </div>
                      
                      <div className="p-4 border border-border rounded-lg">
                        <h5 className="font-medium text-primary mb-2">Статистическая гипотеза</h5>
                        <p className="text-sm text-muted-foreground">
                          Предположение о параметрах генеральной совокупности, 
                          которое можно проверить с помощью данных.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pvalue" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Понимание p-value</CardTitle>
                  <CardDescription>
                    Самый важный и часто неправильно понимаемый показатель
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <h4 className="font-semibold mb-2">Определение p-value</h4>
                    <p className="text-muted-foreground">
                      p-value — это вероятность получить такие же или более экстремальные результаты, 
                      <strong className="text-foreground"> если нулевая гипотеза верна</strong>.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Как интерпретировать?</h4>
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                        <span className="stat-highlight bg-success/20 text-success">p &lt; 0.05</span>
                        <span className="text-sm">Результат статистически значим. Отвергаем H₀.</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <span className="stat-highlight">p ≥ 0.05</span>
                        <span className="text-sm">Недостаточно доказательств. Не отвергаем H₀.</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Частые ошибки</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• p-value — это НЕ вероятность того, что H₀ верна</li>
                        <li>• p = 0.05 — это условный порог, не «магическое» число</li>
                        <li>• Маленький p не означает большой эффект</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="example-box">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Аналогия с судом</h4>
                    <p className="text-muted-foreground">
                      Представьте, что H₀ — это «подсудимый невиновен». p-value показывает, 
                      насколько вероятно увидеть такие улики, если человек действительно невиновен. 
                      Маленький p — сильные улики против «невиновности».
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default TheoryPage;
