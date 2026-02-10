import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Lightbulb, AlertCircle, Database, Ruler, BarChart3, Target, ScatterChart, Sigma, FlaskConical, TrendingUp, Calculator } from 'lucide-react';
import { NormalDistributionVisualizer } from '@/components/NormalDistributionVisualizer';
import { MathFormula } from '@/components/MathFormula';

const TheoryPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Справочник статистических методов
            </h1>
            <p className="text-muted-foreground text-lg">
              Базовые и продвинутые концепции для психологических исследований
            </p>
          </div>

          <Tabs defaultValue="population" className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
              <TabsTrigger value="population">Выборка</TabsTrigger>
              <TabsTrigger value="scales">Шкалы</TabsTrigger>
              <TabsTrigger value="distribution">Распределение</TabsTrigger>
              <TabsTrigger value="errors">Ошибки</TabsTrigger>
              <TabsTrigger value="descriptive">Описательная</TabsTrigger>
              <TabsTrigger value="correlation">Корреляция</TabsTrigger>
              <TabsTrigger value="ttests">t-тесты</TabsTrigger>
              <TabsTrigger value="anova">ANOVA</TabsTrigger>
              <TabsTrigger value="effectsize">Размер эффекта</TabsTrigger>
            </TabsList>

            {/* === EXISTING TABS (Выборка, Шкалы, Распределение, Ошибки) === */}
            <TabsContent value="population" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    Генеральная совокупность и выборка
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none space-y-4">
                  <p>В статистике мы редко можем изучить всех, кто нас интересует. Поэтому работаем с частью — <strong>выборкой</strong>.</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border border-border rounded-lg">
                      <h5 className="font-semibold text-primary mb-2">Генеральная совокупность</h5>
                      <p className="text-sm text-muted-foreground">Все объекты, о которых мы хотим сделать вывод.</p>
                      <p className="text-sm mt-2 text-muted-foreground italic">Пример: все подростки России с СДВГ</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <h5 className="font-semibold text-info mb-2">Выборка</h5>
                      <p className="text-sm text-muted-foreground">Часть генеральной совокупности, которую реально изучаем.</p>
                      <p className="text-sm mt-2 text-muted-foreground italic">Пример: 120 подростков из 5 школ Москвы</p>
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
                    <p className="text-sm text-muted-foreground">Каждый член генеральной совокупности имеет известный шанс попасть в выборку. Позволяет делать обобщения.</p>
                  </div>
                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                    <h5 className="font-semibold mb-2 text-warning">Целевая (невероятностная)</h5>
                    <p className="text-sm text-muted-foreground">Участников отбирают по определённым критериям. Обобщения ограничены.</p>
                  </div>
                  <div className="p-4 bg-muted/50 border border-border rounded-lg">
                    <h5 className="font-semibold mb-2">Выборка удобства</h5>
                    <p className="text-sm text-muted-foreground">Кого смогли найти — того и исследуем. Типично для студенческих работ. Обобщения сильно ограничены.</p>
                  </div>
                </CardContent>
              </Card>
              <div className="example-box">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Критерий репрезентативности</h4>
                    <p className="text-muted-foreground">Выборка <strong>репрезентативна</strong>, если по основным характеристикам соответствует генеральной совокупности.</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scales" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-primary" />
                    Шкалы измерений
                  </CardTitle>
                  <CardDescription>Тип данных определяет, какие методы анализа можно применять</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { n: '1', title: 'Номинальная (категориальная)', desc: 'Названия категорий без порядка. Можно только считать частоты.', ex: 'пол, диагноз, тип личности, профессия' },
                    { n: '2', title: 'Порядковая (ранговая)', desc: 'Есть порядок, но расстояние между значениями не определено.', ex: 'уровень образования, стадия заболевания, рейтинг «от 1 до 5»' },
                    { n: '3', title: 'Интервальная', desc: 'Равные интервалы между значениями, но нет абсолютного нуля.', ex: 'температура в °C, IQ, баллы по психологическим шкалам' },
                    { n: '4', title: 'Шкала отношений', desc: 'Есть абсолютный ноль. Можно говорить «в 2 раза больше».', ex: 'возраст, время реакции, количество ошибок, доход' },
                  ].map(s => (
                    <div key={s.n} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-muted rounded text-xs font-medium">{s.n}</span>
                        <h5 className="font-semibold">{s.title}</h5>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{s.desc}</p>
                      <p className="text-sm text-muted-foreground italic">Примеры: {s.ex}</p>
                    </div>
                  ))}
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

            <TabsContent value="distribution" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Нормальное распределение
                  </CardTitle>
                  <CardDescription>«Колоколообразная кривая» — основа параметрической статистики</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">Многие психологические переменные (IQ, рост, время реакции) распределены примерно нормально.</p>
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
              <NormalDistributionVisualizer />
              <Card>
                <CardHeader><CardTitle>Проверка нормальности</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Перед применением параметрических методов нужно убедиться, что данные распределены нормально:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <h5 className="font-medium mb-1">Визуально</h5>
                      <p className="text-sm text-muted-foreground">Гистограмма, Q-Q plot</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <h5 className="font-medium mb-1">Статистически</h5>
                      <p className="text-sm text-muted-foreground">Тест Шапиро–Уилка (n &lt; 50), Колмогорова–Смирнова</p>
                    </div>
                  </div>
                  <div className="example-box">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold mb-2">Что делать, если не нормально?</h4>
                        <p className="text-muted-foreground text-sm">Используйте <strong>непараметрические методы</strong>: Манна–Уитни вместо t-теста, Спирмен вместо Пирсона, Краскела–Уоллиса вместо ANOVA.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="errors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Ошибки I и II рода
                  </CardTitle>
                  <CardDescription>Два типа ошибок при проверке гипотез</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <h5 className="font-semibold mb-2 text-destructive">Ошибка I рода (α)</h5>
                      <p className="text-sm text-muted-foreground mb-2"><strong>Ложная тревога:</strong> нашли эффект, которого нет.</p>
                      <p className="text-sm text-muted-foreground italic">Сказали, что лекарство работает, хотя это плацебо.</p>
                      <div className="mt-3 text-sm"><span className="font-medium">Вероятность:</span> уровень значимости α (обычно 0.05)</div>
                    </div>
                    <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                      <h5 className="font-semibold mb-2 text-warning">Ошибка II рода (β)</h5>
                      <p className="text-sm text-muted-foreground mb-2"><strong>Пропуск сигнала:</strong> не заметили реальный эффект.</p>
                      <p className="text-sm text-muted-foreground italic">Сказали, что лекарство не работает, хотя оно помогает.</p>
                      <div className="mt-3 text-sm"><span className="font-medium">Вероятность:</span> β (зависит от мощности теста)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Мощность исследования</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground"><strong>Статистическая мощность</strong> (1 - β) — вероятность обнаружить эффект, если он реально существует. Рекомендуемый уровень: 80%.</p>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h5 className="font-semibold mb-3">Что влияет на мощность?</h5>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" /><strong>Размер выборки:</strong> больше n → выше мощность</li>
                      <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" /><strong>Размер эффекта:</strong> больше различия → легче обнаружить</li>
                      <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" /><strong>Уровень α:</strong> выше α → выше мощность (но больше ложных срабатываний)</li>
                      <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" /><strong>Вариативность данных:</strong> меньше SD → легче обнаружить</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* === NEW TAB: Описательная статистика === */}
            <TabsContent value="descriptive" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    Меры центральной тенденции
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border border-border rounded-lg">
                      <h5 className="font-semibold mb-2">Среднее (M)</h5>
                      <MathFormula formula="\bar{x} = \frac{\sum x_i}{n}" display />
                      <p className="text-sm text-muted-foreground">Сумма всех значений, делённая на их количество. Чувствительно к выбросам.</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <h5 className="font-semibold mb-2">Медиана (Me)</h5>
                      <p className="text-sm text-muted-foreground">Значение, делящее упорядоченный ряд пополам. Устойчива к выбросам.</p>
                      <p className="text-sm text-muted-foreground italic mt-2">Лучше для асимметричных данных (доход, время реакции).</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <h5 className="font-semibold mb-2">Мода (Mo)</h5>
                      <p className="text-sm text-muted-foreground">Наиболее частое значение. Единственная мера для номинальных данных.</p>
                    </div>
                  </div>
                  <div className="example-box">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold mb-1">Когда что использовать?</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Нормальное распределение → <strong>среднее</strong></li>
                          <li>• Асимметричное / выбросы → <strong>медиана</strong></li>
                          <li>• Номинальные данные → <strong>мода</strong></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Меры разброса</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg">
                      <h5 className="font-semibold mb-2">Дисперсия и стандартное отклонение</h5>
                      <MathFormula formula="s^2 = \frac{\sum (x_i - \bar{x})^2}{n-1}, \quad s = \sqrt{s^2}" display />
                      <p className="text-sm text-muted-foreground">SD показывает, насколько данные «разбросаны» вокруг среднего. В психологии: SD шкалы BDI ≈ 8 баллов.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 border border-border rounded-lg">
                        <h5 className="font-semibold mb-2">Размах (Range)</h5>
                        <p className="text-sm text-muted-foreground">Max − Min. Простая, но неустойчивая мера.</p>
                      </div>
                      <div className="p-4 border border-border rounded-lg">
                        <h5 className="font-semibold mb-2">IQR (межквартильный размах)</h5>
                        <MathFormula formula="IQR = Q_3 - Q_1" display />
                        <p className="text-sm text-muted-foreground">Размах средних 50% данных. Устойчив к выбросам.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Асимметрия и эксцесс</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border border-border rounded-lg">
                      <h5 className="font-semibold mb-2">Асимметрия (Skewness)</h5>
                      <p className="text-sm text-muted-foreground mb-2">Показывает направление «хвоста» распределения.</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Sk = 0 → симметричное</li>
                        <li>• Sk &gt; 0 → правый хвост (доход)</li>
                        <li>• Sk &lt; 0 → левый хвост (баллы экзамена)</li>
                      </ul>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <h5 className="font-semibold mb-2">Эксцесс (Kurtosis)</h5>
                      <p className="text-sm text-muted-foreground mb-2">«Остроконечность» распределения.</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• K = 0 → нормальное (мезокуртическое)</li>
                        <li>• K &gt; 0 → острое, тяжёлые хвосты</li>
                        <li>• K &lt; 0 → плоское, лёгкие хвосты</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* === NEW TAB: Корреляция === */}
            <TabsContent value="correlation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ScatterChart className="w-5 h-5 text-primary" />
                    Корреляция Пирсона
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MathFormula formula="r = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum (x_i - \bar{x})^2 \cdot \sum (y_i - \bar{y})^2}}" display />
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h5 className="font-semibold mb-3">Интерпретация |r|</h5>
                    <div className="space-y-2 text-sm">
                      {[
                        { range: '< 0.3', label: 'Слабая', color: 'bg-muted' },
                        { range: '0.3 – 0.5', label: 'Умеренная', color: 'bg-info/20' },
                        { range: '0.5 – 0.7', label: 'Средняя', color: 'bg-warning/20' },
                        { range: '0.7 – 0.9', label: 'Высокая', color: 'bg-success/20' },
                        { range: '> 0.9', label: 'Очень высокая', color: 'bg-primary/20' },
                      ].map(item => (
                        <div key={item.range} className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded text-xs font-mono ${item.color}`}>{item.range}</span>
                          <span className="text-muted-foreground">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Корреляция Спирмена</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">Ранговая корреляция — непараметрический аналог Пирсона. Используется для порядковых данных или при нарушении нормальности.</p>
                  <MathFormula formula="r_s = 1 - \frac{6 \sum d_i^2}{n(n^2 - 1)}" display />
                  <p className="text-sm text-muted-foreground italic">Пример: связь ранга в классе и ранга по шкале тревожности.</p>
                </CardContent>
              </Card>

              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Корреляция ≠ причинность!</h4>
                    <p className="text-sm text-muted-foreground">Высокая корреляция между потреблением мороженого и количеством утоплений не означает, что мороженое вызывает утопления. Обе переменные зависят от третьей — температуры воздуха.</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* === NEW TAB: t-тесты === */}
            <TabsContent value="ttests" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sigma className="w-5 h-5 text-primary" />
                    Типы t-тестов
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg">
                      <h5 className="font-semibold mb-2">Одновыборочный t-тест</h5>
                      <MathFormula formula="t = \frac{\bar{x} - \mu_0}{s / \sqrt{n}}" display />
                      <p className="text-sm text-muted-foreground">Сравнение среднего выборки с известным значением. <em>Пример: IQ студентов-психологов vs популяционное среднее 100.</em></p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <h5 className="font-semibold mb-2">Независимый t-тест</h5>
                      <MathFormula formula="t = \frac{\bar{x}_1 - \bar{x}_2}{\sqrt{s_p^2(\frac{1}{n_1} + \frac{1}{n_2})}}" display />
                      <p className="text-sm text-muted-foreground">Сравнение двух независимых групп. <em>Пример: различия в тревожности между мужчинами и женщинами.</em></p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <h5 className="font-semibold mb-2">Парный t-тест</h5>
                      <MathFormula formula="t = \frac{\bar{d}}{s_d / \sqrt{n}}" display />
                      <p className="text-sm text-muted-foreground">Сравнение двух измерений у одних и тех же участников. <em>Пример: депрессия до и после терапии.</em></p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Предположения t-тестов</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-1.5" />Данные измерены как минимум на интервальной шкале</li>
                    <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-1.5" />Нормальное распределение в каждой группе (или n ≥ 30)</li>
                    <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-1.5" />Однородность дисперсий (для независимого t-теста; используйте Welch при нарушении)</li>
                    <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-1.5" />Независимость наблюдений</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            {/* === NEW TAB: ANOVA === */}
            <TabsContent value="anova" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-primary" />
                    Однофакторная ANOVA
                  </CardTitle>
                  <CardDescription>Сравнение средних трёх и более групп</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">ANOVA проверяет, различаются ли средние нескольких групп, сравнивая <strong>межгрупповую</strong> дисперсию с <strong>внутригрупповой</strong>.</p>
                  <MathFormula formula="F = \frac{MS_{between}}{MS_{within}} = \frac{SS_{between}/df_{between}}{SS_{within}/df_{within}}" display />
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h5 className="font-semibold mb-3">Таблица ANOVA</h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 pr-4">Источник</th>
                            <th className="text-left py-2 pr-4">SS</th>
                            <th className="text-left py-2 pr-4">df</th>
                            <th className="text-left py-2 pr-4">MS</th>
                            <th className="text-left py-2">F</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr className="border-b border-border/50">
                            <td className="py-2 pr-4">Между группами</td>
                            <td className="py-2 pr-4"><MathFormula formula="SS_B" /></td>
                            <td className="py-2 pr-4">k − 1</td>
                            <td className="py-2 pr-4"><MathFormula formula="SS_B / df_B" /></td>
                            <td className="py-2"><MathFormula formula="MS_B / MS_W" /></td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-2 pr-4">Внутри групп</td>
                            <td className="py-2 pr-4"><MathFormula formula="SS_W" /></td>
                            <td className="py-2 pr-4">N − k</td>
                            <td className="py-2 pr-4"><MathFormula formula="SS_W / df_W" /></td>
                            <td className="py-2">—</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-4 font-medium">Общее</td>
                            <td className="py-2 pr-4"><MathFormula formula="SS_T" /></td>
                            <td className="py-2 pr-4">N − 1</td>
                            <td className="py-2" colSpan={2}>—</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic">Пример: сравнение эффективности КБТ, психодинамической и гуманистической терапии (3 группы по 25 пациентов).</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Post-hoc тесты</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">Если ANOVA значима, нужно определить, <em>какие именно</em> группы различаются:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border border-border rounded-lg">
                      <h5 className="font-semibold mb-2">Tukey HSD</h5>
                      <p className="text-sm text-muted-foreground">Сравнивает все пары. Контролирует семейную ошибку. Наиболее часто используется.</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <h5 className="font-semibold mb-2">Bonferroni</h5>
                      <p className="text-sm text-muted-foreground">Делит α на число сравнений. Консервативный, но простой.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* === NEW TAB: Размер эффекта === */}
            <TabsContent value="effectsize" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Почему p-value недостаточно
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">P-value говорит только о том, есть ли эффект. <strong>Размер эффекта</strong> показывает, насколько он большой — а это критически важно для практики.</p>
                  <div className="example-box">
                    <p className="text-sm text-muted-foreground">Исследование с n = 10000 может обнаружить статистически значимую разницу в 0.5 баллов IQ (p &lt; 0.001), но практически эта разница бессмысленна.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Основные меры размера эффекта</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg">
                      <h5 className="font-semibold mb-2">d Коэна (для t-тестов)</h5>
                      <MathFormula formula="d = \frac{\bar{x}_1 - \bar{x}_2}{s_p}" display />
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>|d| ≈ 0.2 — малый</span>
                        <span>|d| ≈ 0.5 — средний</span>
                        <span>|d| ≈ 0.8 — большой</span>
                      </div>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <h5 className="font-semibold mb-2">r (для корреляций)</h5>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>|r| ≈ 0.1 — малый</span>
                        <span>|r| ≈ 0.3 — средний</span>
                        <span>|r| ≈ 0.5 — большой</span>
                      </div>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <h5 className="font-semibold mb-2"><MathFormula formula="\eta^2" /> (для ANOVA)</h5>
                      <MathFormula formula="\eta^2 = \frac{SS_{between}}{SS_{total}}" display />
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>η² ≈ 0.01 — малый</span>
                        <span>η² ≈ 0.06 — средний</span>
                        <span>η² ≈ 0.14 — большой</span>
                      </div>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <h5 className="font-semibold mb-2"><MathFormula formula="f^2" /> (для регрессии)</h5>
                      <MathFormula formula="f^2 = \frac{R^2}{1 - R^2}" display />
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>f² ≈ 0.02 — малый</span>
                        <span>f² ≈ 0.15 — средний</span>
                        <span>f² ≈ 0.35 — большой</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default TheoryPage;
