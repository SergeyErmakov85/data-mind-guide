import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, AlertCircle } from 'lucide-react';
import { EffectSizeTheory } from '@/components/theory/EffectSizeTheory';
import { NormalDistributionVisualizer } from '@/components/NormalDistributionVisualizer';
import { MathFormula } from '@/components/MathFormula';
import { AutoTermify } from '@/components/AutoTermify';
import { TheoryLayout, TheorySection } from '@/components/theory/TheoryLayout';

// Seeded random for stable scatter points
const seededRandom = (seed: number) => {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
};

const generateCorrelationPoints = (r: number): { x: number; y: number }[] => {
  const rng = seededRandom(Math.abs(Math.round(r * 1000)) + 1);
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const xRaw = rng() * 140 + 35;
    const noise = (rng() - 0.5) * 140 * (1 - Math.abs(r));
    const yRaw = r > 0 ? 170 - (xRaw - 30) * (140 / 160) + noise
      : r < 0 ? 10 + (xRaw - 30) * (140 / 160) + noise
      : rng() * 140 + 20;
    const x = Math.max(35, Math.min(185, xRaw));
    const y = Math.max(15, Math.min(165, yRaw));
    points.push({ x, y });
  }
  return points;
};

const sections: TheorySection[] = [
  {
    id: 'population',
    kicker: 'Основы',
    title: 'Выборка и генеральная совокупность',
    intro: 'В статистике мы редко изучаем всех, кто нас интересует, и работаем с частью — выборкой. От её типа зависит, можно ли обобщать результаты на всю популяцию.',
    takeaways: [
      'Чем отличается генеральная совокупность от выборки',
      'Какие бывают виды выборок и для чего нужна репрезентативность',
      'Когда обобщения корректны, а когда — нет',
    ],
    labPath: '/labs/sampling',
    labLabel: 'Лаба «Выборка»',
    pitfalls: [
      'Выборка удобства не позволяет обобщать на популяцию.',
      'Маленькая выборка → большие случайные колебания статистик.',
    ],
    summary: 'Выборка имеет смысл только в связке с генеральной совокупностью. Всегда указывайте критерии отбора и осознавайте границы обобщений.',
    body: (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Генеральная совокупность и выборка</CardTitle>
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
      </>
    ),
  },
  {
    id: 'scales',
    kicker: 'Данные',
    title: 'Шкалы измерений',
    intro: 'Тип данных определяет, какие методы анализа можно применять. Без понимания шкал легко применить неподходящий критерий и получить бессмысленные выводы.',
    takeaways: [
      'Различать номинальную, порядковую, интервальную шкалы и шкалу отношений',
      'Понимать, какие операции допустимы для каждой шкалы',
      'Подбирать корректный статистический метод под тип данных',
    ],
    pitfalls: [
      'Считать среднее по порядковой шкале (рангам, баллам Лайкерта без агрегации).',
      'Применять параметрические тесты к номинальным переменным.',
    ],
    summary: 'Шкала измерений — первый вопрос перед выбором метода. Номинальные → χ², порядковые → непараметрика, интервальные → t/ANOVA.',
    body: (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Шкалы измерений</CardTitle>
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
      </>
    ),
  },
  {
    id: 'distribution',
    kicker: 'Распределения',
    title: 'Нормальное распределение',
    intro: 'Колоколообразная кривая — основа параметрической статистики. Многие психологические переменные распределены примерно нормально, и это даёт нам мощные методы.',
    takeaways: [
      'Что такое нормальное распределение и правило 68–95–99.7',
      'Как визуально и статистически проверить нормальность',
      'Что делать, если данные не нормальны',
    ],
    labPath: '/labs/sampling',
    labLabel: 'Лаба «Распределения»',
    pitfalls: [
      'Считать нормальность нужной для всех методов — для больших n работает ЦПТ.',
      'Доверять только тесту Шапиро–Уилка: при больших n он отвергает нормальность даже при малых отклонениях.',
    ],
    summary: 'Нормальное распределение симметрично, описывается M и SD. При нарушениях — непараметрические методы или большая выборка.',
    body: (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Нормальное распределение</CardTitle>
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
      </>
    ),
  },
  {
    id: 'errors',
    kicker: 'Гипотезы',
    title: 'Ошибки I и II рода',
    intro: 'При проверке гипотез всегда есть риск ошибиться. Понимание α, β и мощности — основа осознанного планирования исследования.',
    takeaways: [
      'Что такое ошибки I и II рода и как они связаны с α и β',
      'Что такое мощность и почему 80% — стандарт',
      'Какие факторы повышают мощность исследования',
    ],
    labPath: '/labs/hypothesis',
    labLabel: 'Лаба «Гипотезы»',
    pitfalls: [
      'Снижение α без оглядки на мощность приводит к росту β.',
      'Малые выборки → низкая мощность → значимые эффекты не находятся.',
    ],
    summary: 'Контроль ошибок — это баланс. α фиксируем заранее, β снижаем за счёт размера выборки и аккуратного дизайна.',
    body: (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Ошибки I и II рода</CardTitle>
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
      </>
    ),
  },
  {
    id: 'descriptive',
    kicker: 'Описательная',
    title: 'Описательная статистика',
    intro: 'Меры центральной тенденции и разброса описывают данные одной строкой. Их выбор зависит от формы распределения и типа шкалы.',
    takeaways: [
      'Когда использовать среднее, медиану и моду',
      'Что показывают SD, IQR и размах',
      'Как читать асимметрию и эксцесс',
    ],
    pitfalls: [
      'Считать среднее у асимметричных данных без указания медианы.',
      'Игнорировать выбросы при отчёте M и SD.',
    ],
    summary: 'M и SD — для нормальных данных, Mdn и IQR — для перекошенных. Всегда сообщайте обе пары статистик при сомнениях.',
    body: (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Меры центральной тенденции</CardTitle>
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
      </>
    ),
  },
  {
    id: 'correlation',
    kicker: 'Связь',
    title: 'Корреляция',
    intro: 'Корреляция измеряет силу и направление связи двух переменных, но не говорит о причинности. Это базовый инструмент в психологических исследованиях.',
    takeaways: [
      'Как считать и интерпретировать r Пирсона',
      'Когда использовать ρ Спирмена вместо Пирсона',
      'Почему корреляция ≠ причинность',
    ],
    labPath: '/labs/correlation',
    labLabel: 'Лаба «Корреляция»',
    pitfalls: [
      'Интерпретировать r как процент общей дисперсии (для этого есть r²).',
      'Делать причинно-следственные выводы из корреляции.',
      'Применять Пирсона при сильной нелинейности или выбросах.',
    ],
    summary: 'r ∈ [−1; 1]. Сила = |r|, направление = знак. Для нелинейных и ранговых данных — Спирмен.',
    body: (
      <>
        <Card>
          <CardHeader><CardTitle>Корреляция Пирсона</CardTitle></CardHeader>
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
          <CardHeader>
            <CardTitle>Визуализация типов корреляции</CardTitle>
            <CardDescription>Как выглядят данные при разной силе и направлении связи</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Положительная (r ≈ 0.85)', color: 'hsl(var(--success))', points: generateCorrelationPoints(0.85) },
                { title: 'Отрицательная (r ≈ −0.75)', color: 'hsl(var(--destructive))', points: generateCorrelationPoints(-0.75) },
                { title: 'Отсутствует (r ≈ 0)', color: 'hsl(var(--muted-foreground))', points: generateCorrelationPoints(0) },
              ].map((chart) => (
                <div key={chart.title} className="text-center">
                  <h5 className="font-medium text-sm mb-2">{chart.title}</h5>
                  <svg viewBox="0 0 200 200" className="w-full max-w-[200px] mx-auto border border-border rounded-lg bg-muted/20">
                    <line x1="30" y1="170" x2="190" y2="170" stroke="hsl(var(--border))" strokeWidth="1" />
                    <line x1="30" y1="10" x2="30" y2="170" stroke="hsl(var(--border))" strokeWidth="1" />
                    <text x="110" y="195" textAnchor="middle" className="fill-muted-foreground" fontSize="10">X</text>
                    <text x="12" y="95" textAnchor="middle" className="fill-muted-foreground" fontSize="10" transform="rotate(-90, 12, 95)">Y</text>
                    {chart.points.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="3" fill={chart.color} opacity="0.7" />
                    ))}
                  </svg>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent" />
              Примеры интерпретации
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-success/5 border border-success/20 rounded-lg space-y-2">
              <h5 className="font-semibold text-success">Тревожность и успеваемость</h5>
              <p className="text-sm text-muted-foreground">
                <strong>r = −0.62, p &lt; 0.01, n = 85</strong>. Отрицательная корреляция средней силы между тревожностью и средним баллом.
              </p>
              <div className="p-3 bg-background rounded border border-border text-sm text-muted-foreground italic">
                Студенты с большей тревожностью имеют более низкую успеваемость, но это не значит, что тревожность <em>вызывает</em> снижение оценок.
              </div>
            </div>
            <div className="p-4 bg-info/5 border border-info/20 rounded-lg space-y-2">
              <h5 className="font-semibold text-info">Время подготовки и баллы</h5>
              <p className="text-sm text-muted-foreground">
                <strong>r = 0.74, p &lt; 0.001, n = 120</strong>. Сильная положительная корреляция (r² = 0.55).
              </p>
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
              <p className="text-sm text-muted-foreground">Высокая корреляция между потреблением мороженого и количеством утоплений не означает, что мороженое вызывает утопления.</p>
            </div>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'ttests',
    kicker: 'Параметрические',
    title: 't-тесты',
    intro: 'Семейство t-тестов сравнивает средние при нормальном распределении. Это самый распространённый параметрический инструмент в психологии.',
    takeaways: [
      'Различать одновыборочный, независимый и парный t-тесты',
      'Когда применять Welch вместо классического t',
      'Какие предположения должны выполняться',
    ],
    labPath: '/labs/ttest',
    labLabel: 'Лаба «t-тест»',
    pitfalls: [
      'Применять независимый t к зависимым (повторным) измерениям.',
      'Игнорировать тест Левена при разных дисперсиях.',
    ],
    summary: 't-тест — гибкий, но требует нормальности и независимости. При нарушениях — Welch или непараметрика.',
    body: (
      <>
        <Card>
          <CardHeader><CardTitle>Типы t-тестов</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <h5 className="font-semibold mb-2">Одновыборочный t-тест</h5>
                <MathFormula formula="t = \frac{\bar{x} - \mu_0}{s / \sqrt{n}}" display />
                <p className="text-sm text-muted-foreground">Сравнение среднего выборки с известным значением.</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h5 className="font-semibold mb-2">Независимый t-тест</h5>
                <MathFormula formula="t = \frac{\bar{x}_1 - \bar{x}_2}{\sqrt{s_p^2(\frac{1}{n_1} + \frac{1}{n_2})}}" display />
                <p className="text-sm text-muted-foreground">Сравнение двух независимых групп.</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h5 className="font-semibold mb-2">Парный t-тест</h5>
                <MathFormula formula="t = \frac{\bar{d}}{s_d / \sqrt{n}}" display />
                <p className="text-sm text-muted-foreground">Сравнение двух измерений у одних и тех же участников.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Предположения t-тестов</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-1.5" />Интервальная шкала</li>
              <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-1.5" />Нормальное распределение в каждой группе (или n ≥ 30)</li>
              <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-1.5" />Однородность дисперсий (для независимого; иначе Welch)</li>
              <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-1.5" />Независимость наблюдений</li>
            </ul>
          </CardContent>
        </Card>
      </>
    ),
  },
  {
    id: 'anova',
    kicker: 'Сравнение групп',
    title: 'ANOVA',
    intro: 'Дисперсионный анализ обобщает t-тест на 3+ группы и контролирует семейную ошибку. Это основной метод в экспериментальной психологии.',
    takeaways: [
      'Что сравнивает F-критерий и зачем нужны MS_between/MS_within',
      'Как читать таблицу ANOVA',
      'Зачем нужны post-hoc тесты',
    ],
    labPath: '/labs/anova',
    labLabel: 'Лаба «ANOVA»',
    pitfalls: [
      'Делать множественные t-тесты вместо ANOVA — раздувает α.',
      'Не делать post-hoc после значимой ANOVA.',
    ],
    summary: 'ANOVA отвечает «есть ли различия?», post-hoc — «между какими именно группами?».',
    body: (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Однофакторная ANOVA</CardTitle>
            <CardDescription>Сравнение средних трёх и более групп</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">ANOVA сравнивает <strong>межгрупповую</strong> дисперсию с <strong>внутригрупповой</strong>.</p>
            <MathFormula formula="F = \frac{MS_{between}}{MS_{within}}" display />
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Post-hoc тесты</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Если ANOVA значима, нужно определить, <em>какие именно</em> группы различаются:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <h5 className="font-semibold mb-2">Tukey HSD</h5>
                <p className="text-sm text-muted-foreground">Сравнивает все пары. Контролирует семейную ошибку.</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h5 className="font-semibold mb-2">Bonferroni</h5>
                <p className="text-sm text-muted-foreground">Делит α на число сравнений. Консервативный, но простой.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    ),
  },
  {
    id: 'effectsize',
    kicker: 'Размер эффекта',
    title: 'Размер эффекта',
    intro: 'Значимость говорит «есть ли эффект», размер эффекта — «насколько он большой». Без размера эффекта результат неполный.',
    takeaways: [
      'Что такое d Коэна, η² и r как размер эффекта',
      'Как интерпретировать малый, средний и большой эффект',
      'Почему размер эффекта обязателен в APA-отчёте',
    ],
    labPath: '/labs/effect-size',
    labLabel: 'Лаба «Размер эффекта»',
    pitfalls: [
      'Сообщать только p без размера эффекта.',
      'Путать статистическую и практическую значимость.',
    ],
    summary: 'Всегда приводите размер эффекта рядом с p-value. Это требование APA 7 и здравого смысла.',
    body: <EffectSizeTheory />,
  },
  {
    id: 'nonparametric',
    kicker: 'Непараметрика',
    title: 'Непараметрические методы',
    intro: 'Когда данные не нормальны, малы по объёму или измерены порядково — на помощь приходят ранговые тесты.',
    takeaways: [
      'Когда параметрика «не работает» и нужна непараметрика',
      'Как сопоставить параметрические и непараметрические тесты',
      'Что такое тест Манна–Уитни U',
    ],
    labPath: '/labs/nonparametric',
    labLabel: 'Лаба «Непараметрика»',
    pitfalls: [
      'Применять Манна–Уитни к зависимым выборкам — нужен Вилкоксон.',
      'Сообщать средние при использовании ранговых тестов — корректнее медианы.',
    ],
    summary: 'Непараметрика — резервный план: чуть менее мощная, но без жёстких требований к распределению.',
    body: (
      <>
        <Card>
          <CardHeader><CardTitle>Когда использовать непараметрические тесты</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-1.5" />Данные на порядковой шкале (шкалы Лайкерта)</li>
              <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-1.5" />Нарушение нормальности распределения</li>
              <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-1.5" />Малый размер выборки (n &lt; 30)</li>
              <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-1.5" />Наличие значительных выбросов</li>
            </ul>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="border-b border-border">
                  <th className="text-left py-2 pr-4">Параметрический</th>
                  <th className="text-left py-2 pr-4">Непараметрический</th>
                  <th className="text-left py-2">Условие</th>
                </tr></thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50"><td className="py-2 pr-4">t-тест (независимый)</td><td className="py-2 pr-4">Манна-Уитни U</td><td className="py-2">2 группы</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2 pr-4">t-тест (парный)</td><td className="py-2 pr-4">Вилкоксон</td><td className="py-2">Повторные измерения</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2 pr-4">ANOVA</td><td className="py-2 pr-4">Краскела-Уоллиса</td><td className="py-2">3+ группы</td></tr>
                  <tr><td className="py-2 pr-4">Пирсон r</td><td className="py-2 pr-4">Спирмен ρ</td><td className="py-2">Корреляция</td></tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Тест Манна-Уитни U</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Сравнивает ранги двух независимых групп. Не требует нормальности.</p>
            <MathFormula formula="U = n_1 n_2 + \frac{n_1(n_1+1)}{2} - R_1" display />
            <p className="text-sm text-muted-foreground italic">Пример: сравнение удовлетворённости терапией (5-балльная шкала Лайкерта) между двумя группами пациентов.</p>
          </CardContent>
        </Card>
      </>
    ),
  },
  {
    id: 'categorical',
    kicker: 'Категориальные данные',
    title: 'Хи-квадрат и таблицы сопряжённости',
    intro: 'χ² проверяет связь между категориальными переменными и согласие наблюдаемого распределения с теоретическим.',
    takeaways: [
      'Что такое наблюдаемые и ожидаемые частоты',
      'Когда применять тест независимости и тест согласия',
      'Когда нужен точный тест Фишера',
    ],
    labPath: '/labs/chisquare',
    labLabel: 'Лаба «χ²»',
    pitfalls: [
      'Применять χ² при ожидаемых частотах < 5 — нужен Фишер.',
      'Использовать χ² для зависимых выборок — нужен McNemar.',
    ],
    summary: 'χ² — рабочая лошадка категориальных данных. При малых выборках — Fisher, при зависимых — McNemar.',
    body: (
      <>
        <Card>
          <CardHeader><CardTitle>Таблицы сопряжённости и χ²</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Тест χ² проверяет, существует ли связь между двумя категориальными переменными.</p>
            <MathFormula formula="\chi^2 = \sum \frac{(O_i - E_i)^2}{E_i}, \quad E_{ij} = \frac{R_i \cdot C_j}{N}" display />
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <h5 className="font-semibold mb-2">Тест независимости</h5>
                <p className="text-sm text-muted-foreground">Связаны ли две переменные? <em>Пол × предпочтение терапии</em></p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h5 className="font-semibold mb-2">Тест согласия</h5>
                <p className="text-sm text-muted-foreground">Соответствует ли распределение ожидаемому? <em>Равномерное распределение диагнозов</em></p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Точный тест Фишера и отношение шансов</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">При малых выборках (ожидаемые частоты &lt; 5) используйте <strong>точный тест Фишера</strong> вместо χ².</p>
            <div className="p-4 border border-border rounded-lg">
              <h5 className="font-semibold mb-2">Отношение шансов (OR)</h5>
              <MathFormula formula="OR = \frac{a \cdot d}{b \cdot c}" display />
              <p className="text-sm text-muted-foreground">OR = 1 → нет связи, OR &gt; 1 → положительная связь, OR &lt; 1 → отрицательная связь.</p>
            </div>
          </CardContent>
        </Card>
      </>
    ),
  },
  {
    id: 'regression',
    kicker: 'Регрессия',
    title: 'Линейная регрессия',
    intro: 'Регрессия моделирует зависимость одной переменной от других. В отличие от корреляции, она даёт уравнение для предсказания.',
    takeaways: [
      'Как читать коэффициенты b₀ и b₁',
      'Какие предположения регрессии (LINE)',
      'Что такое R² и VIF',
    ],
    labPath: '/labs/regression',
    labLabel: 'Лаба «Регрессия»',
    pitfalls: [
      'Игнорировать остатки и гетероскедастичность.',
      'Не проверять мультиколлинеарность через VIF.',
      'Делать причинно-следственные выводы из наблюдательных данных.',
    ],
    summary: 'Регрессия — мощный инструмент, но только при выполнении LINE и осознанном анализе остатков.',
    body: (
      <>
        <Card>
          <CardHeader><CardTitle>Простая линейная регрессия</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <MathFormula formula="\hat{y} = b_0 + b_1 x, \quad b_1 = \frac{\sum(x_i - \bar{x})(y_i - \bar{y})}{\sum(x_i - \bar{x})^2}, \quad b_0 = \bar{y} - b_1\bar{x}" display />
            <div className="p-4 bg-muted/30 rounded-lg">
              <h5 className="font-semibold mb-2">Предположения (LINE)</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>L</strong>inear — линейная связь</li>
                <li>• <strong>I</strong>ndependent — независимость ошибок</li>
                <li>• <strong>N</strong>ormal — нормальность остатков</li>
                <li>• <strong>E</strong>qual variance — гомоскедастичность</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Множественная регрессия</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <MathFormula formula="\hat{y} = b_0 + b_1 x_1 + b_2 x_2 + \ldots + b_k x_k" display />
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <h5 className="font-semibold mb-2">R² (коэффициент детерминации)</h5>
                <p className="text-sm text-muted-foreground">Доля дисперсии Y, объяснённая моделью.</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h5 className="font-semibold mb-2">VIF (фактор инфляции дисперсии)</h5>
                <p className="text-sm text-muted-foreground">Проверка мультиколлинеарности. VIF &gt; 10 → предикторы сильно коррелируют.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    ),
  },
  {
    id: 'methodology',
    kicker: 'Дизайн',
    title: 'Методология исследования',
    intro: 'Дизайн исследования и предрегистрация важнее любого статистического теста. Без них даже корректные расчёты дают невоспроизводимые выводы.',
    takeaways: [
      'Зачем нужен априорный анализ мощности',
      'Что такое предрегистрация и зачем она',
      'Как избежать p-hacking и HARKing',
    ],
    pitfalls: [
      'p-hacking: исключение наблюдений ради значимости.',
      'HARKing: формулировка гипотез после анализа.',
      'Множественные тесты без поправки.',
    ],
    summary: 'Хороший дизайн + предрегистрация + честный отчёт — лучшая защита от ложных открытий.',
    body: (
      <>
        <Card>
          <CardHeader><CardTitle>Планирование исследования</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <h5 className="font-semibold mb-2">Априорный анализ мощности</h5>
                <p className="text-sm text-muted-foreground">Определите необходимый размер выборки <em>до</em> сбора данных.</p>
                <MathFormula formula="n = \left(\frac{z_{\alpha/2} + z_\beta}{d}\right)^2 \cdot 2" display />
                <p className="text-sm text-muted-foreground">Для d = 0.5, α = 0.05, мощность 80%: n ≈ 64 на группу.</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h5 className="font-semibold mb-2">Предрегистрация</h5>
                <p className="text-sm text-muted-foreground">Зафиксируйте гипотезы и план анализа <em>до</em> сбора данных. Предотвращает p-hacking.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>P-hacking и кризис репликации</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <h5 className="font-semibold mb-2 text-destructive">Чего НЕ делать</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Исключать данные ради p &lt; 0.05</li>
                <li>• Проводить много тестов и выбирать значимые</li>
                <li>• Останавливать сбор данных при p &lt; 0.05</li>
                <li>• Менять гипотезы после анализа (HARKing)</li>
              </ul>
            </div>
            <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
              <h5 className="font-semibold mb-2 text-success">Лучшие практики</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Предрегистрация на OSF.io</li>
                <li>• Отчёт обо <strong>всех</strong> анализах</li>
                <li>• Размер эффекта и доверительные интервалы</li>
                <li>• Поправка на множественные сравнения</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </>
    ),
  },
];

const TheoryPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <AutoTermify>
          <TheoryLayout
            pageKicker="// 00 — Теория"
            pageTitle="Справочник статистических методов"
            pageDescription="Базовые и продвинутые концепции для психологических исследований"
            sections={sections}
          />
        </AutoTermify>
      </main>
    </div>
  );
};

export default TheoryPage;
