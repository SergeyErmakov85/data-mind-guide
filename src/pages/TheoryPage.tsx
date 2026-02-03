import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Lightbulb, AlertCircle, Database, Ruler, BarChart3, Target } from 'lucide-react';
import { NormalDistributionVisualizer } from '@/components/NormalDistributionVisualizer';
const TheoryPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Основы статистического мышления
            </h1>
            <p className="text-muted-foreground text-lg">
              Базовые концепции, необходимые для понимания статистического анализа
            </p>
          </div>

          <Tabs defaultValue="population" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="population">Выборка</TabsTrigger>
              <TabsTrigger value="scales">Шкалы</TabsTrigger>
              <TabsTrigger value="distribution">Распределение</TabsTrigger>
              <TabsTrigger value="errors">Ошибки</TabsTrigger>
            </TabsList>

            {/* Генеральная совокупность и выборка */}
            <TabsContent value="population" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    Генеральная совокупность и выборка
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none space-y-4">
                  <p>
                    В статистике мы редко можем изучить всех, кто нас интересует. 
                    Поэтому работаем с частью — <strong>выборкой</strong>.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border border-border rounded-lg">
                      <h5 className="font-semibold text-primary mb-2">Генеральная совокупность</h5>
                      <p className="text-sm text-muted-foreground">
                        Все объекты, о которых мы хотим сделать вывод.
                      </p>
                      <p className="text-sm mt-2 text-muted-foreground italic">
                        Пример: все подростки России с СДВГ
                      </p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <h5 className="font-semibold text-info mb-2">Выборка</h5>
                      <p className="text-sm text-muted-foreground">
                        Часть генеральной совокупности, которую реально изучаем.
                      </p>
                      <p className="text-sm mt-2 text-muted-foreground italic">
                        Пример: 120 подростков из 5 школ Москвы
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Виды выборок</CardTitle>
                  <CardDescription>От типа выборки зависит, можно ли обобщать результаты</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <h5 className="font-semibold mb-2 text-success">Случайная (вероятностная)</h5>
                    <p className="text-sm text-muted-foreground">
                      Каждый член генеральной совокупности имеет известный шанс попасть в выборку.
                      Позволяет делать обобщения.
                    </p>
                  </div>
                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                    <h5 className="font-semibold mb-2 text-warning">Целевая (невероятностная)</h5>
                    <p className="text-sm text-muted-foreground">
                      Участников отбирают по определённым критериям. 
                      Обобщения ограничены.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 border border-border rounded-lg">
                    <h5 className="font-semibold mb-2">Выборка удобства</h5>
                    <p className="text-sm text-muted-foreground">
                      Кого смогли найти — того и исследуем. Типично для студенческих работ.
                      Обобщения сильно ограничены.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="example-box">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Критерий репрезентативности</h4>
                    <p className="text-muted-foreground">
                      Выборка <strong>репрезентативна</strong>, если по основным характеристикам 
                      соответствует генеральной совокупности. Например, если 60% популяции — женщины, 
                      в выборке должно быть примерно столько же.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Шкалы измерений */}
            <TabsContent value="scales" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-primary" />
                    Шкалы измерений
                  </CardTitle>
                  <CardDescription>
                    Тип данных определяет, какие методы анализа можно применять
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-muted rounded text-xs font-medium">1</span>
                      <h5 className="font-semibold">Номинальная (категориальная)</h5>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Названия категорий без порядка. Можно только считать частоты.
                    </p>
                    <p className="text-sm text-muted-foreground italic">
                      Примеры: пол, диагноз, тип личности, профессия
                    </p>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-muted rounded text-xs font-medium">2</span>
                      <h5 className="font-semibold">Порядковая (ранговая)</h5>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Есть порядок, но расстояние между значениями не определено.
                    </p>
                    <p className="text-sm text-muted-foreground italic">
                      Примеры: уровень образования, стадия заболевания, рейтинг «от 1 до 5»
                    </p>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-muted rounded text-xs font-medium">3</span>
                      <h5 className="font-semibold">Интервальная</h5>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Равные интервалы между значениями, но нет абсолютного нуля.
                    </p>
                    <p className="text-sm text-muted-foreground italic">
                      Примеры: температура в °C, IQ, баллы по психологическим шкалам
                    </p>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-muted rounded text-xs font-medium">4</span>
                      <h5 className="font-semibold">Шкала отношений</h5>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Есть абсолютный ноль. Можно говорить «в 2 раза больше».
                    </p>
                    <p className="text-sm text-muted-foreground italic">
                      Примеры: возраст, время реакции, количество ошибок, доход
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Почему это важно?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Номинальные</strong> → только χ², мода</li>
                    <li>• <strong>Порядковые</strong> → медиана, непараметрические тесты</li>
                    <li>• <strong>Интервальные/отношений</strong> → среднее, t-тест, ANOVA, корреляция</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Нормальное распределение */}
            <TabsContent value="distribution" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Нормальное распределение
                  </CardTitle>
                  <CardDescription>
                    «Колоколообразная кривая» — основа параметрической статистики
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Многие психологические переменные (IQ, рост, время реакции) 
                    распределены примерно нормально: большинство значений около среднего, 
                    крайние — редки.
                  </p>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h5 className="font-semibold mb-3">Правило 68-95-99.7</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="stat-highlight bg-primary/20 text-primary">68%</span>
                        <span className="text-muted-foreground">данных в пределах ±1 SD от среднего</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="stat-highlight bg-info/20 text-info">95%</span>
                        <span className="text-muted-foreground">данных в пределах ±2 SD от среднего</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="stat-highlight bg-success/20 text-success">99.7%</span>
                        <span className="text-muted-foreground">данных в пределах ±3 SD от среднего</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Интерактивная визуализация */}
              <NormalDistributionVisualizer />

              <Card>
                <CardHeader>
                  <CardTitle>Проверка нормальности</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Перед применением параметрических методов нужно убедиться, 
                    что данные распределены нормально:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <h5 className="font-medium mb-1">Визуально</h5>
                      <p className="text-sm text-muted-foreground">
                        Гистограмма, Q-Q plot
                      </p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <h5 className="font-medium mb-1">Статистически</h5>
                      <p className="text-sm text-muted-foreground">
                        Тест Шапиро–Уилка (n &lt; 50), Колмогорова–Смирнова
                      </p>
                    </div>
                  </div>

                  <div className="example-box">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold mb-2">Что делать, если не нормально?</h4>
                        <p className="text-muted-foreground text-sm">
                          Используйте <strong>непараметрические методы</strong>: 
                          Манна–Уитни вместо t-теста, Спирмен вместо Пирсона, 
                          Краскела–Уоллиса вместо ANOVA.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Статистические ошибки */}
            <TabsContent value="errors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Ошибки I и II рода
                  </CardTitle>
                  <CardDescription>
                    Два типа ошибок при проверке гипотез
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <h5 className="font-semibold mb-2 text-destructive">Ошибка I рода (α)</h5>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Ложная тревога:</strong> нашли эффект, которого нет.
                      </p>
                      <p className="text-sm text-muted-foreground italic">
                        Сказали, что лекарство работает, хотя это плацебо.
                      </p>
                      <div className="mt-3 text-sm">
                        <span className="font-medium">Вероятность:</span> уровень значимости α (обычно 0.05)
                      </div>
                    </div>
                    <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                      <h5 className="font-semibold mb-2 text-warning">Ошибка II рода (β)</h5>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Пропуск сигнала:</strong> не заметили реальный эффект.
                      </p>
                      <p className="text-sm text-muted-foreground italic">
                        Сказали, что лекарство не работает, хотя оно помогает.
                      </p>
                      <div className="mt-3 text-sm">
                        <span className="font-medium">Вероятность:</span> β (зависит от мощности теста)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Мощность исследования</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    <strong>Статистическая мощность</strong> (1 - β) — вероятность обнаружить эффект, 
                    если он реально существует. Рекомендуемый уровень: 80%.
                  </p>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h5 className="font-semibold mb-3">Что влияет на мощность?</h5>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <strong>Размер выборки:</strong> больше n → выше мощность
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <strong>Размер эффекта:</strong> больше различия → легче обнаружить
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <strong>Уровень α:</strong> выше α → выше мощность (но больше ложных срабатываний)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <strong>Вариативность данных:</strong> меньше SD → легче обнаружить
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="example-box">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Апостериорный анализ мощности</h4>
                    <p className="text-muted-foreground">
                      Если результат незначим (p &gt; 0.05), проверьте мощность. Если она 
                      низкая (&lt;80%), возможно, эффект есть, но выборка слишком мала для его обнаружения.
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
